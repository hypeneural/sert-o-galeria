import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LazyMotion, domAnimation, AnimatePresence } from "framer-motion";
import { Suspense, lazy, useMemo, useState, startTransition } from "react";
import { Heart, ImageOff, WifiOff, Loader2 } from "lucide-react";
import { z } from "zod";

import { AppShell } from "@/components/gallery/AppShell";
import { GalleryHeader } from "@/components/gallery/GalleryHeader";
import { MediaGrid } from "@/components/gallery/MediaGrid";
import { FilterSheet, type FilterKey, type SortKey } from "@/components/gallery/FilterSheet";
import { EmptyState, LoadingSkeleton } from "@/components/gallery/States";
import { OfflineBanner } from "@/components/gallery/OfflineBanner";

import { useGalleryFeed } from "@/hooks/use-gallery";
import { useFavorites } from "@/hooks/use-favorites";
import { useOnline } from "@/hooks/use-online";

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
  head: () => ({
    meta: [
      { title: "Galeria AMBSSL — Sertão de Santa Luzia" },
      {
        name: "description",
        content:
          "Fotos e vídeos da comunidade do Sertão de Santa Luzia, Porto Belo. Galeria pública da Associação de Moradores AMBSSL.",
      },
      { property: "og:title", content: "Galeria AMBSSL — Sertão de Santa Luzia" },
      {
        property: "og:description",
        content: "Fotos e vídeos da comunidade do Sertão de Santa Luzia.",
      },
      { name: "theme-color", content: "#0e2a52" },
    ],
  }),
  component: GalleryPage,
});

function GalleryPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const tab: FilterKey = search.tab ?? "todos";
  const online = useOnline();
  const { favorites, toggle, isFav } = useFavorites();

  const [sort, setSort] = useState<SortKey>("recent");
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Server state via TanStack Query
  const {
    items,
    total,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useGalleryFeed({ tab, sort, favoriteIds: favorites });

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

  return (
    <AppShell activeTab={tab}>
      <GalleryHeader onOpenFilters={() => setFiltersOpen(true)} totalCount={total} />

      {!online && <OfflineBanner />}

      <section className="px-1 pt-3">
        <div className="mb-3 flex items-center justify-between px-1">
          <h2 className="text-[13px] font-medium text-muted-foreground">
            {tab === "favoritos"
              ? "Mídias salvas no seu dispositivo"
              : "Fotos e vídeos da comunidade"}
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
              />
            </Suspense>
          )}
        </AnimatePresence>
      </LazyMotion>
    </AppShell>
  );
}
