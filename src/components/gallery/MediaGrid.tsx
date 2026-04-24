import { useEffect, useMemo, useRef, useState } from "react";
import { Masonry } from "react-plock";
import type { MediaItem } from "@/lib/media-data";
import { MediaCard } from "./MediaCard";

type Props = {
  items: MediaItem[];
  favorites: Set<string>;
  onOpen: (id: string) => void;
  onToggleFav: (id: string) => void;
};

const PAGE_SIZE = 14;

export function MediaGrid({ items, favorites, onOpen, onToggleFav }: Props) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinel = useRef<HTMLDivElement>(null);

  // Reset on items change (filter changes)
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [items]);

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisibleCount((c) => Math.min(c + PAGE_SIZE, items.length));
          }
        }
      },
      { rootMargin: "800px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [items.length]);

  const visible = useMemo(() => items.slice(0, visibleCount), [items, visibleCount]);

  return (
    <div>
      <Masonry
        items={visible}
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

      {visibleCount < items.length && (
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
