import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LazyMotion, domAnimation, AnimatePresence } from "framer-motion";
import { Suspense, lazy, useMemo, useState, startTransition } from "react";
import { Heart, ImageOff, WifiOff, Loader2, AlertTriangle } from "lucide-react";
import { z } from "zod";

import { AppShell } from "@/components/gallery/AppShell";
import { GalleryHeader } from "@/components/gallery/GalleryHeader";
import { MediaGrid } from "@/components/gallery/MediaGrid";
import { FilterSheet, type FilterKey, type SortKey } from "@/components/gallery/FilterSheet";
import { EmptyState, LoadingSkeleton } from "@/components/gallery/States";
import { OfflineBanner } from "@/components/gallery/OfflineBanner";
import { SponsorBanner } from "@/components/gallery/SponsorBanner";

import { useGalleryFeed } from "@/hooks/use-gallery";
import { useManifest } from "@/hooks/use-manifest";
import { useSponsors } from "@/hooks/use-sponsors";
import { useFavorites } from "@/hooks/use-favorites";
import { useOnline } from "@/hooks/use-online";
import { ApiError } from "@/lib/api";

// Lazy-load MediaViewer — not in the initial bundle
const MediaViewer = lazy(() =>
  import("@/components/gallery/MediaViewer").then((m) => ({ default: m.MediaViewer })),
);

const searchSchema = z.object({
  tab: z.enum(["todos", "fotos", "videos", "favoritos"]).optional(),
  media: z.string().optional(),
});

export const Route = createFileRoute("/")(
  {
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

  // Manifest — buscar primeiro para capabilities e branding
  const { data: manifest, isLoading: manifestLoading, error: manifestError } = useManifest();

  // Sponsors — só carrega se manifest indica enabled
  const { data: sponsors } = useSponsors(manifest);

  // Media feed com filtros da API
  const apiParams = tabToApiParams(tab);
  const {
    items: allItems,
    isLoading: feedLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    error: feedError,
  } = useGalleryFeed(apiParams);

  // Filtro local de favoritos (API não tem esse conceito)
  const items = useMemo(() => {
    if (tab === "favoritos") {
      return allItems.filter((i) => favorites.has(i.id));
    }
    return allItems;
  }, [allItems, tab, favorites]);

  const isLoading = manifestLoading || feedLoading;

  // Viewer state — bound to ?media=
  const viewerIndex = useMemo(() => {
    if (!search.media) return -1;
    return items.findIndex((i) => i.id === search.media);
  }, [items, search.media]);

  const openViewer = (id: string) => {
    navigate({ to: "/", search: { ...search, media: id } });
  };
  const closeViewer = () => {
    navigate({ to: "/", search: { tab: search.tab } });
  };
  const setViewerIndex = (i: number) => {
    const id = items[i]?.id;
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
    <AppShell activeTab={tab}>
      <GalleryHeader onOpenFilters={() => setFiltersOpen(true)} manifest={manifest} />

      {!online && <OfflineBanner />}

      {errorMessage && (
        <div className="mx-auto flex max-w-3xl items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Sponsors — abaixo do header, acima do grid */}
      {sponsors && sponsors.length > 0 && (
        <div className="pt-3">
          <SponsorBanner sponsors={sponsors} />
        </div>
      )}

      <section className="px-1 pt-3">
        <div className="mb-3 flex items-center justify-between px-1">
          <h2 className="text-[13px] font-medium text-muted-foreground">
            {tab === "favoritos"
              ? "Mídias salvas no seu dispositivo"
              : manifest?.event.description ?? "Fotos e vídeos da comunidade"}
          </h2>
          <span className="text-[11px] text-muted-foreground">Toque para ampliar</span>
        </div>

        {isLoading ? (
          <LoadingSkeleton />
        ) : items.length === 0 ? (
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
          <MediaGrid
            items={items}
            favorites={favorites}
            onOpen={openViewer}
            onToggleFav={toggle}
            hasNextPage={!!hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            onLoadMore={() => fetchNextPage()}
          />
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
                items={items}
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
