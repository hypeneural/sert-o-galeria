import { Heart, Play, Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { MediaItem } from "@/lib/media-data";

type Props = {
  item: MediaItem;
  isFavorite: boolean;
  onOpen: () => void;
  onToggleFav: () => void;
  priority?: boolean;
};

export function MediaCard({ item, isFavorite, onOpen, onToggleFav, priority }: Props) {
  const ref = useRef<HTMLButtonElement>(null);
  const [visible, setVisible] = useState(!!priority);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (priority) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true);
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin: "400px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [priority]);

  const lastTap = useRef(0);
  const handleClick = () => {
    const now = Date.now();
    if (now - lastTap.current < 280) {
      onToggleFav();
      lastTap.current = 0;
      return;
    }
    lastTap.current = now;
    onOpen();
  };

  return (
    <button
      ref={ref}
      type="button"
      onClick={handleClick}
      style={{ aspectRatio: item.aspectRatio }}
      className="group relative w-full overflow-hidden rounded-2xl bg-muted shadow-card cv-auto outline-none focus-visible:ring-2 focus-visible:ring-primary"
      aria-label={`Abrir ${item.type === "video" ? "vídeo" : "foto"}: ${item.caption ?? "mídia"}`}
    >
      {!loaded && <div className="absolute inset-0 shimmer" aria-hidden />}

      {visible && (
        <img
          src={item.thumbnailUrl}
          alt={item.caption ?? "Mídia da comunidade AMBSSL"}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => setLoaded(true)}
          className={`h-full w-full object-cover transition-opacity duration-300 ${
            loaded ? "opacity-100" : "opacity-0"
          } group-active:scale-[0.98]`}
          draggable={false}
        />
      )}

      {/* Top badges */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-2">
        {item.isFeatured ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-highlight/95 px-2 py-0.5 text-[10px] font-semibold text-highlight-foreground shadow-sm">
            <Star className="h-3 w-3" /> Destaque
          </span>
        ) : (
          <span />
        )}
        {item.type === "video" && (
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm">
            <Play className="h-3.5 w-3.5 fill-white" />
          </span>
        )}
      </div>

      {/* Bottom gradient + fav */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/55 to-transparent" />
      <span
        onClick={(e) => {
          e.stopPropagation();
          onToggleFav();
        }}
        role="button"
        aria-label={isFavorite ? "Remover dos favoritos" : "Salvar nos favoritos"}
        className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-transform active:scale-90"
      >
        <Heart
          className={`h-4 w-4 ${isFavorite ? "fill-highlight text-highlight" : "text-white"}`}
        />
      </span>

      {/* Big play overlay for videos */}
      {item.type === "video" && (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-primary shadow-elevated">
            <Play className="h-5 w-5 fill-current" />
          </span>
        </span>
      )}
    </button>
  );
}
