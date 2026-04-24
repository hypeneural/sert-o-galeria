import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Heart, ImageOff, WifiOff } from "lucide-react";
import { z } from "zod";

import { AppShell } from "@/components/gallery/AppShell";
import { GalleryHeader } from "@/components/gallery/GalleryHeader";
import { MediaGrid } from "@/components/gallery/MediaGrid";
import { MediaViewer } from "@/components/gallery/MediaViewer";
import { FilterSheet, type FilterKey, type SortKey } from "@/components/gallery/FilterSheet";
import { EmptyState, LoadingSkeleton } from "@/components/gallery/States";
import { OfflineBanner } from "@/components/gallery/OfflineBanner";

import { MEDIA_ITEMS, type MediaItem } from "@/lib/media-data";
import { useFavorites } from "@/hooks/use-favorites";
import { useOnline } from "@/hooks/use-online";

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 250);
    return () => clearTimeout(t);
  }, []);

  // Filter + sort items
  const items: MediaItem[] = useMemo(() => {
    let list = MEDIA_ITEMS;
    if (tab === "fotos") list = list.filter((i) => i.type === "photo");
    else if (tab === "videos") list = list.filter((i) => i.type === "video");
    else if (tab === "favoritos") list = list.filter((i) => favorites.has(i.id));

    if (sort === "featured") {
      list = [...list].sort((a, b) => Number(!!b.isFeatured) - Number(!!a.isFeatured));
    } else {
      list = [...list].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }
    return list;
  }, [tab, sort, favorites]);

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

  return (
    <AppShell activeTab={tab}>
      <GalleryHeader onOpenFilters={() => setFiltersOpen(true)} totalCount={items.length} />

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

        {!mounted ? (
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
          />
        )}
      </section>

      <FilterSheet
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        filter={tab}
        setFilter={(f) => navigate({ to: "/", search: { tab: f } })}
        sort={sort}
        setSort={setSort}
      />

      <AnimatePresence>
        {viewerIndex >= 0 && (
          <MediaViewer
            items={items}
            index={viewerIndex}
            onClose={closeViewer}
            onIndexChange={setViewerIndex}
            isFavorite={isFav}
            onToggleFav={toggle}
          />
        )}
      </AnimatePresence>
    </AppShell>
  );
}
