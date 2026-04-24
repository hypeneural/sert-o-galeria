import { Heart, Play, Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { MediaItem } from "@/lib/media-data";
import { useNetwork } from "@/hooks/use-network";

type Props = {
  item: MediaItem;
  isFavorite: boolean;
  onOpen: () => void;
  onToggleFav: () => void;
  priority?: boolean;
};

export function MediaCard({ item, isFavorite, onOpen, onToggleFav, priority }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(!!priority);
  const [loaded, setLoaded] = useState(false);
  const { isSlow, saveData } = useNetwork();

  useEffect(() => {
    if (priority) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    // On slow networks load images closer to viewport
    const rootMargin = isSlow ? "120px 0px" : "500px 0px";
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
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [priority, isSlow]);

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

  const typeLabel = item.type === "video" ? "vídeo" : "foto";
  const label = `Abrir ${typeLabel}${item.caption ? `: ${item.caption}` : ""}`;

  return (
    <div
      ref={ref}
      className="cv-auto"
      style={{ aspectRatio: item.aspectRatio, contentVisibility: "auto" }}
    >
      <button
        type="button"
        onClick={handleClick}
        className="group relative block h-full w-full overflow-hidden rounded-2xl bg-muted shadow-card outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        aria-label={label}
      >
        {/* LQIP blur backdrop */}
        <img
          src={item.lqipUrl}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full scale-110 object-cover blur-xl"
          draggable={false}
        />
        {!loaded && <div className="absolute inset-0 shimmer opacity-60" aria-hidden />}

        {visible && (
          <img
            src={item.thumbnailUrl}
            srcSet={saveData ? undefined : item.thumbnailSrcSet}
            sizes="(min-width: 1024px) 22vw, (min-width: 640px) 30vw, 48vw"
            alt={item.caption ?? "Mídia da comunidade AMBSSL"}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            fetchPriority={priority ? "high" : "auto"}
            onLoad={() => setLoaded(true)}
            className={`relative h-full w-full object-cover transition-opacity duration-500 ${
              loaded ? "opacity-100" : "opacity-0"
            } group-active:scale-[0.98] group-active:duration-150`}
            draggable={false}
          />
        )}

        {/* Top badges */}
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-2">
          {item.isFeatured ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-highlight/95 px-2 py-0.5 text-[10px] font-semibold text-highlight-foreground shadow-sm">
              <Star className="h-3 w-3" aria-hidden /> Destaque
            </span>
          ) : (
            <span />
          )}
          {item.type === "video" && (
            <span
              className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm"
              aria-hidden
            >
              <Play className="h-3.5 w-3.5 fill-white" />
            </span>
          )}
        </div>

        {/* Bottom gradient + fav */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/55 to-transparent" />

        {/* Big play overlay for videos */}
        {item.type === "video" && (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-primary shadow-elevated">
              <Play className="h-5 w-5 fill-current" aria-hidden />
            </span>
          </span>
        )}
      </button>

      {/* Favorite button — separate from main button for proper a11y */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleFav();
        }}
        aria-label={isFavorite ? "Remover dos favoritos" : "Salvar nos favoritos"}
        aria-pressed={isFavorite}
        className="absolute bottom-2 right-2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition active:scale-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        style={{
          // Position relative to parent div (which holds the aspect ratio)
          position: "absolute",
        }}
      >
        <Heart
          className={`h-4 w-4 ${isFavorite ? "fill-highlight text-highlight" : "text-white"}`}
          aria-hidden
        />
      </button>
    </div>
  );
}
