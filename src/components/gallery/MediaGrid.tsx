import { useEffect, useRef } from "react";
import { Masonry } from "react-plock";
import type { GalleryMedia } from "@/lib/gallery-media";
import { MediaCard } from "./MediaCard";

type Props = {
  items: GalleryMedia[];
  favorites: Set<string>;
  onOpen: (id: string) => void;
  onToggleFav: (id: string) => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
};

export function MediaGrid({
  items,
  favorites,
  onOpen,
  onToggleFav,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: Props) {
  const sentinel = useRef<HTMLDivElement>(null);

  // Infinite scroll — trigger fetchNextPage when sentinel is visible
  useEffect(() => {
    const el = sentinel.current;
    if (!el || !hasNextPage) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !isFetchingNextPage) {
            onLoadMore();
          }
        }
      },
      { rootMargin: "800px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasNextPage, isFetchingNextPage, onLoadMore]);

  return (
    <div>
      <Masonry
        items={items}
        config={{
          columns: [2, 3, 4],
          gap: [8, 12, 14],
          media: [640, 1024, 1440],
          useBalancedLayout: true,
        }}
        render={(item, idx) => (
          <MediaCard
            key={item.id}
            item={item}
            isFavorite={favorites.has(item.id)}
            onOpen={() => onOpen(item.id)}
            onToggleFav={() => onToggleFav(item.id)}
            priority={idx < 4}
          />
        )}
      />

      {hasNextPage && (
        <div ref={sentinel} className="flex items-center justify-center py-10">
          <div
            role="status"
            aria-live="polite"
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-primary" />
            Carregando mais itens…
          </div>
        </div>
      )}
    </div>
  );
}
