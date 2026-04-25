import { useState, useEffect, useCallback } from "react";
import type { GallerySponsor } from "@/lib/gallery-media";

type Props = {
  sponsors: GallerySponsor[];
};

/**
 * Carousel rotativo de sponsors no feed.
 * Usa display_duration_seconds de cada item para auto-avançar.
 */
export function SponsorBanner({ sponsors }: Props) {
  const [current, setCurrent] = useState(0);

  const advance = useCallback(() => {
    setCurrent((prev) => (prev + 1) % sponsors.length);
  }, [sponsors.length]);

  useEffect(() => {
    if (sponsors.length <= 1) return;

    const ms = (sponsors[current]?.display_duration_seconds ?? 10) * 1000;
    const timer = setTimeout(advance, ms);
    return () => clearTimeout(timer);
  }, [current, sponsors, advance]);

  if (sponsors.length === 0) return null;

  const item = sponsors[current];
  if (!item) return null;

  return (
    <div className="mx-auto w-full max-w-3xl px-2">
      <div className="relative overflow-hidden rounded-xl bg-muted/50 shadow-sm">
        <img
          src={item.urls.asset}
          alt="Patrocinador"
          width={item.width}
          height={item.height}
          loading="lazy"
          decoding="async"
          className="h-auto w-full object-contain"
          crossOrigin="anonymous"
        />

        {/* Indicator dots */}
        {sponsors.length > 1 && (
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
            {sponsors.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === current
                    ? "w-4 bg-white/90"
                    : "w-1.5 bg-white/40"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
