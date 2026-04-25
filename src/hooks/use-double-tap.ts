import { useCallback, useRef } from "react";

type Options = {
  /** Tempo máximo entre toques para considerar double-tap (ms). Default: 280 */
  threshold?: number;
  onSingleTap?: () => void;
  onDoubleTap?: () => void;
};

/**
 * Hook dedicado para double-tap sem bloquear a main thread.
 * Usa requestAnimationFrame para não causar forced reflow.
 * Retorna um onClick handler leve.
 */
export function useDoubleTap({ threshold = 280, onSingleTap, onDoubleTap }: Options) {
  const lastTap = useRef(0);
  const singleTimer = useRef<ReturnType<typeof setTimeout>>();

  const onClick = useCallback(() => {
    const now = Date.now();
    const delta = now - lastTap.current;

    if (delta < threshold && delta > 0) {
      // Double tap detectado
      lastTap.current = 0;
      if (singleTimer.current) {
        clearTimeout(singleTimer.current);
        singleTimer.current = undefined;
      }
      if (onDoubleTap) {
        requestAnimationFrame(onDoubleTap);
      }
    } else {
      // Possível single tap — aguarda threshold para confirmar
      lastTap.current = now;
      if (singleTimer.current) clearTimeout(singleTimer.current);
      singleTimer.current = setTimeout(() => {
        if (onSingleTap) {
          requestAnimationFrame(onSingleTap);
        }
        singleTimer.current = undefined;
      }, threshold);
    }
  }, [threshold, onSingleTap, onDoubleTap]);

  return { onClick };
}
