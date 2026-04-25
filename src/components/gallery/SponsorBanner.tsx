import { useState, useEffect, useCallback, useRef } from "react";
import type { GallerySponsor } from "@/lib/gallery-media";

type Props = {
  sponsors: GallerySponsor[];
};

/**
 * Touch-friendly swipeable carousel de sponsors.
 * Auto-avança com display_duration_seconds.
 * Suporta swipe esquerda/direita no mobile.
 */
export function SponsorBanner({ sponsors }: Props) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchRef = useRef({ startX: 0, startY: 0, swiping: false });
  const containerRef = useRef<HTMLDivElement>(null);

  const total = sponsors.length;

  const goTo = useCallback(
    (i: number) => {
      setCurrent(((i % total) + total) % total);
    },
    [total],
  );

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  // Auto-advance timer (pausa ao tocar)
  useEffect(() => {
    if (total <= 1 || paused) return;
    const ms = (sponsors[current]?.display_duration_seconds ?? 10) * 1000;
    const timer = setTimeout(next, ms);
    return () => clearTimeout(timer);
  }, [current, sponsors, next, total, paused]);

  // Touch handlers
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    if (!t) return;
    touchRef.current = { startX: t.clientX, startY: t.clientY, swiping: true };
    setPaused(true);
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchRef.current.swiping) return;
    const t = e.changedTouches[0];
    if (!t) return;

    const dx = t.clientX - touchRef.current.startX;
    const dy = t.clientY - touchRef.current.startY;
    touchRef.current.swiping = false;

    // Só considera swipe horizontal se |dx| > |dy| e > 40px
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      if (dx < 0) next();
      else prev();
    }

    // Retoma auto-advance após 3s
    setTimeout(() => setPaused(false), 3000);
  };

  if (total === 0) return null;

  const item = sponsors[current];
  if (!item) return null;

  return (
    <div className="mx-auto w-full max-w-3xl px-2">
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-xl bg-muted/50 shadow-sm touch-pan-y"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Slide container com transição */}
        <div className="relative w-full">
          <img
            key={item.public_id}
            src={item.urls.asset}
            alt="Patrocinador"
            {...(item.width != null && { width: item.width })}
            {...(item.height != null && { height: item.height })}
            loading="lazy"
            decoding="async"
            className="h-auto w-full object-contain transition-opacity duration-300"
            crossOrigin="anonymous"
          />
        </div>

        {/* Indicador de progresso + dots */}
        {total > 1 && (
          <div className="absolute bottom-0 inset-x-0 flex flex-col items-center gap-1 pb-2">
            {/* Dots */}
            <div className="flex gap-1.5">
              {sponsors.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    goTo(i);
                    setPaused(true);
                    setTimeout(() => setPaused(false), 5000);
                  }}
                  aria-label={`Patrocinador ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === current
                      ? "w-5 bg-white/90"
                      : "w-1.5 bg-white/40"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Swipe hint overlay (sutil) */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/10 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black/10 to-transparent" />
      </div>
    </div>
  );
}
