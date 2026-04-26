import { useState, useEffect, useRef } from "react";
import { Camera, X, MessageCircle, Send, Users, ChevronRight } from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useTransform, type PanInfo } from "framer-motion";

const CHANNELS = [
  {
    id: "whatsapp-group",
    label: "Grupo de WhatsApp",
    description: "Envie no grupo do evento",
    url: "https://chat.whatsapp.com/IHcRggboUoCBxEwQy4979K",
    icon: Users,
    color: "#25D366",
    highlight: true,
  },
  {
    id: "whatsapp-direct",
    label: "WhatsApp Direto",
    description: "Envie direto pelo WhatsApp",
    url: "https://api.whatsapp.com/send/?phone=5548996553954&text=Oi",
    icon: MessageCircle,
    color: "#128C7E",
    highlight: false,
  },
  {
    id: "telegram",
    label: "Telegram",
    description: "Envie pelo bot do Telegram",
    url: "https://t.me/eventovivoBot?start=Costelaco",
    icon: Send,
    color: "#0088cc",
    highlight: false,
  },
] as const;

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export function SendMediaFAB() {
  const [open, setOpen] = useState(false);

  // Lock body scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  return (
    <>
      <PulseButton onClick={() => setOpen(true)} />

      <AnimatePresence>{open && <ChannelSheet onClose={() => setOpen(false)} />}</AnimatePresence>
    </>
  );
}

// ---------------------------------------------------------------------------
// Botão pulsante — 95% largura, animação completa
// ---------------------------------------------------------------------------

function PulseButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-5 safe-bottom pointer-events-none">
      <motion.button
        type="button"
        onClick={onClick}
        aria-label="Enviar fotos para o telão"
        className="pointer-events-auto flex w-full max-w-3xl items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-highlight via-highlight to-[hsl(40_90%_50%)] px-6 py-4.5 font-extrabold tracking-wide text-highlight-foreground"
        animate={{
          scale: [1, 1.02, 1],
          boxShadow: [
            "0 4px 20px rgba(229,197,68,0.25)",
            "0 6px 35px rgba(229,197,68,0.55)",
            "0 4px 20px rgba(229,197,68,0.25)",
          ],
        }}
        transition={{
          repeat: Infinity,
          duration: 2.2,
          ease: "easeInOut",
        }}
        whileTap={{ scale: 0.96 }}
      >
        <Camera className="h-6 w-6" />
        <span className="text-[17px] leading-tight">Enviar Fotos para o Telão!</span>
      </motion.button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Bottom sheet com drag-to-dismiss
// ---------------------------------------------------------------------------

function ChannelSheet({ onClose }: { onClose: () => void }) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragY = useMotionValue(0);
  const backdropOpacity = useTransform(dragY, [0, 300], [1, 0]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    // Fecha se arrastou > 100px pra baixo ou com velocidade > 500
    if (info.offset.y > 100 || info.velocity.y > 500) {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        key="sheet-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        style={{ opacity: backdropOpacity }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet — draggable */}
      <motion.div
        ref={sheetRef}
        key="sheet-content"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 350, damping: 30 }}
        drag="y"
        dragConstraints={{ top: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        style={{ y: dragY }}
        className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-lg touch-none"
      >
        <div className="rounded-t-3xl bg-card shadow-elevated">
          {/* Handle — indicador de arraste */}
          <div className="flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing">
            <div className="h-1.5 w-12 rounded-full bg-muted-foreground/30" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 pb-3 pt-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-highlight/15 text-highlight">
                <Camera className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Enviar para o Telão</h2>
                <p className="text-[13px] text-muted-foreground">
                  Escolha como enviar fotos ou vídeos
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-accent active:scale-95"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Channels */}
          <div className="flex flex-col gap-2.5 px-4 pb-2">
            {CHANNELS.map((ch, i) => (
              <ChannelOption key={ch.id} channel={ch} index={i} />
            ))}
          </div>

          {/* Footer */}
          <div className="px-5 pb-6 pt-4 safe-bottom text-center">
            <p className="text-[11px] text-muted-foreground">
              Suas mídias aparecerão no telão do evento!
            </p>
          </div>
        </div>
      </motion.div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Opção individual de canal
// ---------------------------------------------------------------------------

type Channel = (typeof CHANNELS)[number];

function ChannelOption({ channel, index }: { channel: Channel; index: number }) {
  const Icon = channel.icon;

  const baseClasses =
    "group flex items-center gap-3 rounded-2xl border px-4 py-4 transition-all active:scale-[0.98]";

  const highlightClasses = channel.highlight
    ? "border-[#25D366]/40 bg-[#25D366]/8 shadow-sm"
    : "border-border bg-background hover:shadow-md";

  return (
    <motion.a
      href={channel.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.08 + index * 0.07, type: "spring", stiffness: 300, damping: 24 }}
      className={`${baseClasses} ${highlightClasses}`}
    >
      {/* Icon badge */}
      <motion.span
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white shadow-sm"
        style={{ backgroundColor: channel.color }}
        {...(channel.highlight
          ? {
              animate: {
                scale: [1, 1.08, 1],
                boxShadow: [
                  `0 2px 8px ${channel.color}40`,
                  `0 4px 20px ${channel.color}70`,
                  `0 2px 8px ${channel.color}40`,
                ],
              },
              transition: { repeat: Infinity, duration: 1.8, ease: "easeInOut" },
            }
          : {})}
      >
        <Icon className="h-5 w-5" />
      </motion.span>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <span
          className={`block font-bold ${
            channel.highlight ? "text-[17px] text-foreground" : "text-[16px] text-foreground"
          }`}
        >
          {channel.label}
        </span>
        <span className="block text-[12px] text-muted-foreground mt-0.5">
          {channel.description}
        </span>
        {channel.highlight && (
          <motion.span
            className="mt-1 inline-flex items-center gap-1 rounded-full bg-[#25D366]/15 px-2 py-0.5 text-[10px] font-semibold text-[#25D366]"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            Recomendado
          </motion.span>
        )}
      </div>

      {/* Arrow */}
      <ChevronRight
        className={`h-5 w-5 shrink-0 transition-transform group-hover:translate-x-0.5 ${
          channel.highlight ? "text-[#25D366]" : "text-muted-foreground/40"
        }`}
      />
    </motion.a>
  );
}
