import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LazyMotion, domAnimation, AnimatePresence } from "framer-motion";
import { Suspense, lazy, useEffect, useMemo, useState, startTransition } from "react";
import { Heart, ImageOff, WifiOff, Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import { z } from "zod";

import { AppShell } from "@/components/gallery/AppShell";
import { GalleryHeader } from "@/components/gallery/GalleryHeader";
import { MediaGrid } from "@/components/gallery/MediaGrid";
import { FilterSheet, type FilterKey, type SortKey } from "@/components/gallery/FilterSheet";
import { EmptyState, LoadingSkeleton } from "@/components/gallery/States";
import { OfflineBanner } from "@/components/gallery/OfflineBanner";
import { SponsorBanner } from "@/components/gallery/SponsorBanner";
import { SponsorFooter } from "@/components/gallery/SponsorFooter";

import { useGalleryFeed } from "@/hooks/use-gallery";
import { useManifest } from "@/hooks/use-manifest";
import { useSponsors } from "@/hooks/use-sponsors";
import { useFavorites } from "@/hooks/use-favorites";
import { useOnline } from "@/hooks/use-online";
import { ApiError } from "@/lib/api";
import {
  composeGallery,
  extractMedia,
  resolveSponsorRules,
  selectSponsorsForPlacement,
} from "@/lib/compose-gallery";
import type { SponsorAnalyticsConfig } from "@/lib/sponsor-analytics";

// Lazy-load MediaViewer — not in the initial bundle
const MediaViewer = lazy(() =>
  import("@/components/gallery/MediaViewer").then((m) => ({ default: m.MediaViewer })),
);

const searchSchema = z.object({
  tab: z.enum(["todos", "fotos", "videos", "favoritos"]).optional(),
  media: z.string().optional(),
});

export const Route = createFileRoute("/")({
  validateSearch: searchSchema,
  component: GalleryPage,
});

/** Mapeia tab da UI → params da API */
function tabToApiParams(tab: FilterKey): { mediaType?: "image" | "video"; featured?: boolean } {
  switch (tab) {
    case "fotos":
      return { mediaType: "image" };
    case "videos":
      return { mediaType: "video" };
    default:
      return {};
  }
}

function GalleryPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const tab: FilterKey = search.tab ?? "todos";
  const online = useOnline();
  const { favorites, toggle, isFav } = useFavorites();

  const [sort, setSort] = useState<SortKey>("recent");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sponsorRotationSeed] = useState(() => Math.random());

  // Manifest — buscar primeiro para capabilities e branding
  const { data: manifest, isLoading: manifestLoading, error: manifestError } = useManifest();

  // Sponsors — só carrega se manifest indica enabled
  const { data: sponsors } = useSponsors(manifest);

  // Media feed com filtros da API
  const apiParams = tabToApiParams(tab);
  const {
    items: allItems,
    mediaStartIndex,
    isLoading: feedLoading,
    hasNextPage,
    fetchNextPage,
    refetch: refetchFeed,
    isFetchingNextPage,
    error: feedError,
  } = useGalleryFeed(apiParams);

  // Filtro local de favoritos (API não tem esse conceito)
  const filteredMedia = useMemo(() => {
    if (tab === "favoritos") {
      return allItems.filter((i) => favorites.has(i.id));
    }
    return allItems;
  }, [allItems, tab, favorites]);

  // Compor galeria: intercalar sponsors a cada 5 mídias
  const sponsorRules = useMemo(
    () => resolveSponsorRules(manifest?.gallery.sponsor_rules),
    [manifest?.gallery.sponsor_rules],
  );
  const composedSponsorRules = useMemo(
    () => (tab === "favoritos" ? { ...sponsorRules, mode: "footer_only" as const } : sponsorRules),
    [sponsorRules, tab],
  );
  const sponsorAnalytics = useMemo<SponsorAnalyticsConfig>(
    () => ({
      enabled: !!manifest?.capabilities.sponsors.enabled,
      impressionUrl: manifest?.capabilities.sponsors.impression_url ?? null,
      clickUrl: manifest?.capabilities.sponsors.click_url ?? null,
    }),
    [
      manifest?.capabilities.sponsors.click_url,
      manifest?.capabilities.sponsors.enabled,
      manifest?.capabilities.sponsors.impression_url,
    ],
  );
  const headerSponsors = useMemo(() => {
    if (sponsorRules.mode !== "header_inline_footer") return [];
    return selectSponsorsForPlacement(sponsors ?? [], "header", sponsorRules, {
      rotationSeed: sponsorRotationSeed,
    });
  }, [sponsorRotationSeed, sponsorRules, sponsors]);

  const composed = useMemo(
    () =>
      composeGallery(filteredMedia, sponsors ?? [], {
        rules: composedSponsorRules,
        context: { filterKey: tab, mediaStartIndex, rotationSeed: sponsorRotationSeed },
      }),
    [composedSponsorRules, filteredMedia, mediaStartIndex, sponsorRotationSeed, sponsors, tab],
  );

  // Media-only list (para o viewer — sem sponsors)
  const mediaOnly = useMemo(() => extractMedia(composed.items), [composed.items]);

  const isLoading = manifestLoading || feedLoading;
  const [acknowledgedPublishedVersion, setAcknowledgedPublishedVersion] = useState<number | null>(
    null,
  );
  const [isRefreshingNewMedia, setIsRefreshingNewMedia] = useState(false);

  useEffect(() => {
    if (!manifest || acknowledgedPublishedVersion !== null) return;
    setAcknowledgedPublishedVersion(manifest.gallery.published_version);
  }, [acknowledgedPublishedVersion, manifest]);

  const hasNewMediaNotice =
    !!manifest?.capabilities.realtime.enabled &&
    acknowledgedPublishedVersion !== null &&
    manifest.gallery.published_version > acknowledgedPublishedVersion;

  const handleShowNewMedia = () => {
    if (!manifest) return;
    const scrollY = window.scrollY;
    setIsRefreshingNewMedia(true);
    startTransition(() => {
      void refetchFeed().finally(() => {
        setAcknowledgedPublishedVersion(manifest.gallery.published_version);
        setIsRefreshingNewMedia(false);
        requestAnimationFrame(() => window.scrollTo({ top: scrollY }));
      });
    });
  };

  // Viewer state — bound to ?media=
  const viewerIndex = useMemo(() => {
    if (!search.media) return -1;
    return mediaOnly.findIndex((i) => i.id === search.media);
  }, [mediaOnly, search.media]);

  const openViewer = (id: string) => {
    navigate({ to: "/", search: { ...search, media: id } });
  };
  const closeViewer = () => {
    navigate({ to: "/", search: { tab: search.tab } });
  };
  const setViewerIndex = (i: number) => {
    const id = mediaOnly[i]?.id;
    if (!id) return;
    navigate({ to: "/", search: { ...search, media: id } });
  };

  const handleSetFilter = (f: FilterKey) => {
    startTransition(() => {
      navigate({ to: "/", search: { tab: f } });
    });
  };

  const handleSetSort = (s: SortKey) => {
    startTransition(() => {
      setSort(s);
    });
  };

  // Error states
  const apiError = manifestError ?? feedError;
  const errorMessage = apiError instanceof ApiError ? getErrorMessage(apiError) : null;

  return (
    <AppShell>
      <GalleryHeader onOpenFilters={() => setFiltersOpen(true)} manifest={manifest} />

      {!online && <OfflineBanner />}

      {hasNewMediaNotice && (
        <div className="sticky top-2 z-30 mx-auto flex max-w-sm justify-center px-2">
          <button
            type="button"
            onClick={handleShowNewMedia}
            disabled={isRefreshingNewMedia}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-elevated transition active:scale-[0.98] disabled:opacity-70"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshingNewMedia ? "animate-spin" : ""}`}
              aria-hidden
            />
            Novas mídias disponíveis
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="mx-auto flex max-w-3xl items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Sponsors — abaixo do header, acima do grid */}
      {headerSponsors.length > 0 && (
        <div className="pt-3">
          <SponsorBanner sponsors={headerSponsors} />
        </div>
      )}

      <section className="px-1 pt-3">
        <div className="mb-3 flex items-center justify-between px-1">
          <h2 className="text-[13px] font-medium text-muted-foreground">
            {tab === "favoritos" ? "Mídias salvas no seu dispositivo" : "Fotos e vídeos"}
          </h2>
          <span className="text-[11px] text-muted-foreground">Toque para ampliar</span>
        </div>

        {isLoading ? (
          <LoadingSkeleton />
        ) : filteredMedia.length === 0 ? (
          tab === "favoritos" ? (
            <EmptyState
              icon={<Heart className="h-6 w-6" />}
              title="Nenhum favorito ainda"
              description="Toque duas vezes em uma mídia ou no coração para salvar nos favoritos."
            />
          ) : !online ? (
            <EmptyState
              icon={<WifiOff className="h-6 w-6" />}
              title="Sem internet no momento"
              description="Mostrando o que já está em cache. Quando voltar, novas mídias aparecem."
            />
          ) : (
            <EmptyState
              icon={<ImageOff className="h-6 w-6" />}
              title="Nada por aqui"
              description="Não encontramos mídias para este filtro."
            />
          )
        ) : (
          <>
            <MediaGrid
              items={composed.items}
              filterKey={tab}
              sponsorAnalytics={sponsorAnalytics}
              favorites={favorites}
              onOpen={openViewer}
              onToggleFav={toggle}
              hasNextPage={!!hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              onLoadMore={() => fetchNextPage()}
            />
            <SponsorFooter
              sponsors={composed.footerSponsors}
              filterKey={tab}
              analytics={sponsorAnalytics}
            />
          </>
        )}
      </section>

      <FilterSheet
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        filter={tab}
        setFilter={handleSetFilter}
        sort={sort}
        setSort={handleSetSort}
      />

      <LazyMotion features={domAnimation}>
        <AnimatePresence>
          {viewerIndex >= 0 && (
            <Suspense
              fallback={
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--viewer-bg)]">
                  <Loader2 className="h-8 w-8 animate-spin text-white/60" />
                </div>
              }
            >
              <MediaViewer
                items={mediaOnly}
                index={viewerIndex}
                onClose={closeViewer}
                onIndexChange={setViewerIndex}
                isFavorite={isFav}
                onToggleFav={toggle}
                downloadEnabled={manifest?.capabilities.download.enabled ?? false}
              />
            </Suspense>
          )}
        </AnimatePresence>
      </LazyMotion>
    </AppShell>
  );
}

function getErrorMessage(err: ApiError): string {
  switch (err.status) {
    case 0:
      return "Não foi possível conectar à API. O domínio pode não estar liberado no CORS.";
    case 404:
      return "Galeria não encontrada ou desabilitada para acesso externo.";
    case 410:
      return "Este evento foi encerrado.";
    case 422:
      return "Erro ao carregar a página. Tente recarregar.";
    case 429:
      return `Muitas requisições. Aguarde ${err.retryAfter ?? 30}s e tente novamente.`;
    default:
      return `Erro ao conectar com a galeria (${err.status}).`;
  }
}
