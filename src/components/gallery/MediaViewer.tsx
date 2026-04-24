import { useCallback, useEffect, useRef, useState } from "react";
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
import type { MediaItem } from "@/lib/media-data";
import { toast } from "sonner";

type Props = {
  items: MediaItem[];
  index: number;
  onClose: () => void;
  onIndexChange: (i: number) => void;
  isFavorite: (id: string) => boolean;
  onToggleFav: (id: string) => void;
};

export function MediaViewer({
  items,
  index,
  onClose,
  onIndexChange,
  isFavorite,
  onToggleFav,
}: Props) {
  const current = items[index];
  const [showChrome, setShowChrome] = useState(true);

  // Keyboard nav
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight" && index < items.length - 1) onIndexChange(index + 1);
      else if (e.key === "ArrowLeft" && index > 0) onIndexChange(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, items.length, onClose, onIndexChange]);

  // Lock body scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

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
    const url = current.type === "video" ? (current.videoUrl ?? current.fullUrl) : current.fullUrl;
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
    const SWIPE = 80;
    const VEL = 400;
    if (info.offset.x < -SWIPE || info.velocity.x < -VEL) {
      if (index < items.length - 1) onIndexChange(index + 1);
    } else if (info.offset.x > SWIPE || info.velocity.x > VEL) {
      if (index > 0) onIndexChange(index - 1);
    }
  };

  const handleVerticalDrag = (_e: unknown, info: PanInfo) => {
    if (info.offset.y > 120 || info.velocity.y > 600) onClose();
  };

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Visualizador de mídia"
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
            className="absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-2 px-3 py-3 safe-top glass-dark"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              aria-label="Fechar"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur transition-colors hover:bg-white/20 active:scale-95"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-sm font-medium tabular-nums text-white/90">
              {index + 1} de {items.length}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggleFav(current.id)}
                aria-label={isFavorite(current.id) ? "Remover dos favoritos" : "Favoritar"}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur transition-colors hover:bg-white/20 active:scale-95"
              >
                <Heart
                  className={`h-5 w-5 ${
                    isFavorite(current.id) ? "fill-highlight text-highlight" : "text-white"
                  }`}
                />
              </button>
              <button
                onClick={handleShare}
                aria-label="Compartilhar"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur transition-colors hover:bg-white/20 active:scale-95"
              >
                <Share2 className="h-5 w-5" />
              </button>
              <button
                onClick={handleDownload}
                aria-label="Baixar"
                className="hidden h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur transition-colors hover:bg-white/20 active:scale-95 sm:flex"
              >
                <Download className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stage */}
      <motion.div
        className="relative flex flex-1 items-center justify-center overflow-hidden"
        drag={current.type === "photo" ? "x" : false}
        dragElastic={0.2}
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleSwipe}
      >
        {/* Vertical drag-to-close */}
        <motion.div
          className="absolute inset-0"
          drag="y"
          dragElastic={0.3}
          dragConstraints={{ top: 0, bottom: 0 }}
          onDragEnd={handleVerticalDrag}
          aria-hidden
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="relative flex h-full w-full items-center justify-center px-2"
            onClick={(e) => e.stopPropagation()}
          >
            {current.type === "photo" ? (
              <PhotoStage
                item={current}
                onDoubleTap={() => onToggleFav(current.id)}
              />
            ) : (
              <VideoStage item={current} />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Desktop arrows */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (index > 0) onIndexChange(index - 1);
          }}
          aria-label="Anterior"
          disabled={index === 0}
          className="absolute left-2 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/10 p-3 text-white backdrop-blur transition-colors hover:bg-white/20 disabled:opacity-30 md:flex"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (index < items.length - 1) onIndexChange(index + 1);
          }}
          aria-label="Próximo"
          disabled={index === items.length - 1}
          className="absolute right-2 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/10 p-3 text-white backdrop-blur transition-colors hover:bg-white/20 disabled:opacity-30 md:flex"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </motion.div>

      {/* Caption */}
      <AnimatePresence>
        {showChrome && current.caption && (
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            className="absolute inset-x-0 bottom-0 z-10 px-4 pb-safe pt-3 glass-dark"
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
}: {
  item: MediaItem;
  onDoubleTap: () => void;
}) {
  const [hi, setHi] = useState(false);
  const [zoom, setZoom] = useState(1);
  const lastTap = useRef(0);

  // Progressive: low quality first, then high quality fades in
  return (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden"
      onClick={() => {
        const now = Date.now();
        if (now - lastTap.current < 280) {
          if (zoom > 1) setZoom(1);
          else onDoubleTap();
          lastTap.current = 0;
        } else {
          lastTap.current = now;
        }
      }}
    >
      <motion.img
        src={item.previewUrl}
        alt={item.caption ?? "Foto"}
        className="max-h-full max-w-full object-contain"
        animate={{ scale: zoom }}
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
        draggable={false}
        loading="eager"
      />
      <motion.img
        src={item.fullUrl}
        alt=""
        aria-hidden
        loading="lazy"
        onLoad={() => setHi(true)}
        className="absolute max-h-full max-w-full object-contain"
        style={{ opacity: hi ? 1 : 0, transition: "opacity 300ms ease" }}
        animate={{ scale: zoom }}
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
        draggable={false}
      />
    </div>
  );
}

function VideoStage({ item }: { item: MediaItem }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(false);

  const togglePlay = useCallback(() => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) {
      v.play().then(() => setPlaying(true)).catch(() => setError(true));
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
        src={item.videoUrl}
        poster={item.previewUrl}
        playsInline
        muted={muted}
        preload="metadata"
        onClick={togglePlay}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onError={() => setError(true)}
        className="max-h-full max-w-full"
      />

      {!playing && (
        <button
          type="button"
          onClick={togglePlay}
          aria-label="Reproduzir"
          className="absolute flex h-20 w-20 items-center justify-center rounded-full bg-white/95 text-primary shadow-elevated transition-transform active:scale-95"
        >
          <Play className="h-9 w-9 fill-current" />
        </button>
      )}

      {/* Custom controls */}
      <div
        className="absolute inset-x-0 bottom-20 z-10 mx-auto flex max-w-2xl items-center gap-3 rounded-full bg-black/55 px-4 py-2 backdrop-blur"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={togglePlay} aria-label={playing ? "Pausar" : "Reproduzir"}>
          {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 fill-white" />}
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
        <button onClick={() => setMuted((m) => !m)} aria-label={muted ? "Ativar som" : "Silenciar"}>
          {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </button>
        <button onClick={goFs} aria-label="Tela cheia" className="hidden sm:block">
          <Maximize className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
