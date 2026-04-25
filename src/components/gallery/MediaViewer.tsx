import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import {
  X,
  Heart,
  Share2,
  Download,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
} from "lucide-react";
import type { GalleryMedia } from "@/lib/gallery-media";
import { toast } from "sonner";
import { useNetwork } from "@/hooks/use-network";

type Props = {
  items: GalleryMedia[];
  index: number;
  onClose: () => void;
  onIndexChange: (i: number) => void;
  isFavorite: (id: string) => boolean;
  onToggleFav: (id: string) => void;
  downloadEnabled?: boolean;
};

export function MediaViewer({
  items,
  index,
  onClose,
  onIndexChange,
  isFavorite,
  onToggleFav,
  downloadEnabled = false,
}: Props) {
  const current = items[index];
  const [showChrome, setShowChrome] = useState(true);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const { isSlow } = useNetwork();

  // Keyboard nav
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight" && index < items.length - 1) onIndexChange(index + 1);
      else if (e.key === "ArrowLeft" && index > 0) onIndexChange(index - 1);
      else if (e.key === " " || e.key.toLowerCase() === "f") {
        e.preventDefault();
        onToggleFav(current.id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, items.length, onClose, onIndexChange, onToggleFav, current?.id]);

  // Lock body scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Focus close button on mount for keyboard users
  useEffect(() => {
    closeBtnRef.current?.focus({ preventScroll: true });
  }, []);

  // Auto-hide chrome after 3.5s of inactivity
  useEffect(() => {
    if (!showChrome) return;
    const t = window.setTimeout(() => setShowChrome(false), 3500);
    return () => window.clearTimeout(t);
  }, [showChrome, index]);

  // Preload neighbors using Image() — avoids <link preload> warning
  useEffect(() => {
    if (isSlow) return;
    const neighbors: GalleryMedia[] = [];
    if (items[index + 1]) neighbors.push(items[index + 1]);
    if (items[index - 1]) neighbors.push(items[index - 1]);
    const imgs = neighbors
      .filter((n) => n.type === "photo")
      .map((n) => {
        const img = new Image();
        img.src = n.previewUrl;
        return img;
      });
    return () => {
      // Cancel loading by clearing src
      imgs.forEach((img) => {
        img.src = "";
      });
    };
  }, [index, items, isSlow]);

  const handleShare = async () => {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}${window.location.pathname}?media=${current.id}`
        : "";
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: current.caption ?? "Galeria AMBSSL",
          text: current.caption ?? "Mídia da galeria AMBSSL",
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copiado");
      }
    } catch {
      // cancelled
    }
  };

  const handleDownload = () => {
    const url =
      current.type === "video"
        ? (current.videoPreviewUrl ?? current.originalUrl ?? current.previewUrl)
        : (current.originalUrl ?? current.previewUrl);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ambssl-${current.id}`;
    a.target = "_blank";
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleSwipe = (_e: unknown, info: PanInfo) => {
    const SWIPE = 60;
    const VEL = 350;
    if (info.offset.x < -SWIPE || info.velocity.x < -VEL) {
      if (index < items.length - 1) onIndexChange(index + 1);
    } else if (info.offset.x > SWIPE || info.velocity.x > VEL) {
      if (index > 0) onIndexChange(index - 1);
    } else if (info.offset.y > 120 || info.velocity.y > 600) {
      onClose();
    }
  };

  if (!current) return null;

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={`Visualizando ${index + 1} de ${items.length}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-50 flex flex-col bg-[var(--viewer-bg)] text-white"
      onClick={() => setShowChrome((v) => !v)}
    >
      {/* Top bar */}
      <AnimatePresence>
        {showChrome && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-2 px-3 py-3 safe-top glass-dark"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              ref={closeBtnRef}
              onClick={onClose}
              aria-label="Fechar visualizador"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 backdrop-blur transition-colors hover:bg-white/20 active:scale-95 focus-visible:ring-2 focus-visible:ring-white/70"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>

            <div className="text-sm font-medium tabular-nums text-white/90" aria-live="polite">
              {index + 1} / {items.length}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggleFav(current.id)}
                aria-label={isFavorite(current.id) ? "Remover dos favoritos" : "Salvar nos favoritos"}
                aria-pressed={isFavorite(current.id)}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 backdrop-blur transition-colors hover:bg-white/20 active:scale-95 focus-visible:ring-2 focus-visible:ring-white/70"
              >
                <Heart
                  className={`h-5 w-5 ${
                    isFavorite(current.id) ? "fill-highlight text-highlight" : "text-white"
                  }`}
                  aria-hidden
                />
              </button>
              <button
                onClick={handleShare}
                aria-label="Compartilhar mídia"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 backdrop-blur transition-colors hover:bg-white/20 active:scale-95 focus-visible:ring-2 focus-visible:ring-white/70"
              >
                <Share2 className="h-5 w-5" aria-hidden />
              </button>
              {downloadEnabled && (
                <button
                  onClick={handleDownload}
                  aria-label="Baixar mídia"
                  className="hidden h-11 w-11 items-center justify-center rounded-full bg-white/10 backdrop-blur transition-colors hover:bg-white/20 active:scale-95 focus-visible:ring-2 focus-visible:ring-white/70 sm:flex"
                >
                  <Download className="h-5 w-5" aria-hidden />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stage */}
      <motion.div
        className="relative flex flex-1 items-center justify-center overflow-hidden touch-none"
        drag={current.type === "photo" ? true : "y"}
        dragElastic={0.18}
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragDirectionLock
        onDragEnd={handleSwipe}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={current.id}
            initial={{ opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.985 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="relative flex h-full w-full items-center justify-center px-2"
            onClick={(e) => e.stopPropagation()}
          >
            {current.type === "photo" ? (
              <PhotoStage item={current} onDoubleTap={() => onToggleFav(current.id)} isSlow={isSlow} />
            ) : (
              <VideoStage item={current} isSlow={isSlow} />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Desktop arrows */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (index > 0) onIndexChange(index - 1);
          }}
          aria-label="Mídia anterior"
          disabled={index === 0}
          className="absolute left-3 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/10 p-3 text-white backdrop-blur transition-colors hover:bg-white/20 disabled:opacity-30 focus-visible:ring-2 focus-visible:ring-white/70 md:flex"
        >
          <ChevronLeft className="h-6 w-6" aria-hidden />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (index < items.length - 1) onIndexChange(index + 1);
          }}
          aria-label="Próxima mídia"
          disabled={index === items.length - 1}
          className="absolute right-3 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/10 p-3 text-white backdrop-blur transition-colors hover:bg-white/20 disabled:opacity-30 focus-visible:ring-2 focus-visible:ring-white/70 md:flex"
        >
          <ChevronRight className="h-6 w-6" aria-hidden />
        </button>
      </motion.div>

      {/* Caption */}
      <AnimatePresence>
        {showChrome && current.caption && (
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            className="absolute inset-x-0 bottom-0 z-20 px-4 pb-safe pt-3 glass-dark"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mx-auto max-w-2xl text-center text-sm font-medium text-white">
              {current.caption}
            </p>
            {current.authorName && (
              <p className="mx-auto mt-0.5 max-w-2xl text-center text-[11px] text-white/60">
                por {current.authorName}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function PhotoStage({
  item,
  onDoubleTap,
  isSlow,
}: {
  item: GalleryMedia;
  onDoubleTap: () => void;
  isSlow: boolean;
}) {
  const [hi, setHi] = useState(false);
  const [zoom, setZoom] = useState(1);
  const lastTap = useRef(0);

  const highSrc = useMemo(
    () => (isSlow ? item.previewUrl : (item.originalUrl ?? item.previewUrl)),
    [item, isSlow],
  );

  // Reset hi-res on item change
  useEffect(() => {
    setHi(false);
    setZoom(1);
  }, [item.id]);

  return (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden"
      style={item.dominantColor ? { backgroundColor: item.dominantColor } : undefined}
      onClick={() => {
        const now = Date.now();
        if (now - lastTap.current < 280) {
          if (zoom > 1) setZoom(1);
          else {
            setZoom(2);
            window.setTimeout(() => onDoubleTap(), 0);
          }
          lastTap.current = 0;
        } else {
          lastTap.current = now;
        }
      }}
    >
      {/* Preview image */}
      <motion.img
        src={item.previewUrl}
        alt={item.caption ?? "Foto da galeria AMBSSL"}
        className="relative max-h-full max-w-full object-contain"
        animate={{ scale: zoom }}
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
        draggable={false}
        loading="eager"
        decoding="async"
        fetchPriority="high"
      />
      {/* Hi-res overlay (loads after preview) */}
      <motion.img
        src={highSrc}
        alt=""
        aria-hidden
        loading="lazy"
        decoding="async"
        onLoad={() => setHi(true)}
        className="absolute max-h-full max-w-full object-contain"
        style={{ opacity: hi ? 1 : 0, transition: "opacity 350ms ease" }}
        animate={{ scale: zoom }}
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
        draggable={false}
      />
    </div>
  );
}

function VideoStage({ item, isSlow }: { item: GalleryMedia; isSlow: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(false);
  const [waiting, setWaiting] = useState(false);

  const togglePlay = useCallback(() => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) {
      v.play()
        .then(() => setPlaying(true))
        .catch(() => setError(true));
    } else {
      v.pause();
      setPlaying(false);
    }
  }, []);

  const goFs = () => {
    const v = ref.current;
    if (!v) return;
    if (v.requestFullscreen) v.requestFullscreen();
  };

  const fmt = (s: number) => {
    if (!isFinite(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  // Use real poster if available, else previewUrl
  const posterSrc = item.videoPosterUrl ?? item.previewUrl;
  const videoSrc = item.videoPreviewUrl;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 text-center text-white/80">
        <p className="text-base font-semibold">Vídeo indisponível</p>
        <p className="max-w-xs text-sm text-white/60">
          Não foi possível carregar este vídeo agora. Tente novamente quando a internet estiver melhor.
        </p>
      </div>
    );
  }

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <video
        ref={ref}
        src={videoSrc}
        poster={posterSrc}
        playsInline
        muted={muted}
        preload={isSlow ? "none" : "metadata"}
        onClick={togglePlay}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onWaiting={() => setWaiting(true)}
        onCanPlay={() => setWaiting(false)}
        onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onError={() => setError(true)}
        className="max-h-full max-w-full"
        aria-label={item.caption ?? "Vídeo da galeria"}
      />

      {(!playing || waiting) && (
        <button
          type="button"
          onClick={togglePlay}
          aria-label={waiting ? "Carregando vídeo" : "Reproduzir vídeo"}
          className="absolute flex h-20 w-20 items-center justify-center rounded-full bg-white/95 text-primary shadow-elevated transition-transform active:scale-95 focus-visible:ring-2 focus-visible:ring-white"
        >
          {waiting ? (
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          ) : (
            <Play className="h-9 w-9 fill-current" aria-hidden />
          )}
        </button>
      )}

      {/* Custom controls */}
      <div
        className="absolute inset-x-3 bottom-24 z-10 mx-auto flex max-w-2xl items-center gap-3 rounded-full bg-black/55 px-4 py-2 backdrop-blur"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={togglePlay}
          aria-label={playing ? "Pausar" : "Reproduzir"}
          className="rounded-full p-1 focus-visible:ring-2 focus-visible:ring-white/70"
        >
          {playing ? (
            <Pause className="h-5 w-5" aria-hidden />
          ) : (
            <Play className="h-5 w-5 fill-white" aria-hidden />
          )}
        </button>
        <span className="text-xs tabular-nums text-white/80">{fmt(progress)}</span>
        <input
          type="range"
          min={0}
          max={duration || 0}
          value={progress}
          step={0.1}
          onChange={(e) => {
            const v = ref.current;
            if (v) v.currentTime = parseFloat(e.target.value);
          }}
          className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-white/20 accent-highlight"
          aria-label="Progresso do vídeo"
        />
        <span className="text-xs tabular-nums text-white/80">{fmt(duration)}</span>
        <button
          onClick={() => setMuted((m) => !m)}
          aria-label={muted ? "Ativar som" : "Silenciar"}
          aria-pressed={!muted}
          className="rounded-full p-1 focus-visible:ring-2 focus-visible:ring-white/70"
        >
          {muted ? (
            <VolumeX className="h-5 w-5" aria-hidden />
          ) : (
            <Volume2 className="h-5 w-5" aria-hidden />
          )}
        </button>
        <button
          onClick={goFs}
          aria-label="Tela cheia"
          className="hidden rounded-full p-1 focus-visible:ring-2 focus-visible:ring-white/70 sm:block"
        >
          <Maximize className="h-5 w-5" aria-hidden />
        </button>
      </div>
    </div>
  );
}
