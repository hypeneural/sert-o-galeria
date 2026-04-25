import { useState, useEffect } from "react";
import { Camera, X, MessageCircle, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CHANNELS = [
  {
    id: "whatsapp-group",
    label: "Grupo de WhatsApp",
    description: "Envie no grupo do evento",
    url: "https://chat.whatsapp.com/IHcRggboUoCBxEwQy4979K",
    icon: MessageCircle,
    color: "#25D366",
    bg: "bg-[#25D366]",
  },
  {
    id: "whatsapp-direct",
    label: "WhatsApp Direto",
    description: "Envie direto para o fotógrafo",
    url: "https://api.whatsapp.com/send/?phone=5548996553954&text=Oi",
    icon: MessageCircle,
    color: "#128C7E",
    bg: "bg-[#128C7E]",
  },
  {
    id: "telegram",
    label: "Telegram",
    description: "Envie pelo bot do Telegram",
    url: "https://t.me/eventovivoBot?start=Costelaco",
    icon: Send,
    color: "#0088cc",
    bg: "bg-[#0088cc]",
  },
] as const;

export function SendMediaFAB() {
  const [open, setOpen] = useState(false);

  // Lock body scroll when modal is open
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
      {/* Botão pulsante fixo — 95% da largura, centralizado */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-5 safe-bottom pointer-events-none">
        <motion.button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Enviar fotos para o telão"
          className="pointer-events-auto flex w-full max-w-3xl items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-highlight via-highlight to-[hsl(var(--highlight-hue,40)_90%_55%)] px-6 py-4 text-[15px] font-bold text-highlight-foreground shadow-elevated"
          whileTap={{ scale: 0.97 }}
          animate={{
            boxShadow: [
              "0 4px 20px rgba(229,197,68,0.3)",
              "0 4px 30px rgba(229,197,68,0.6)",
              "0 4px 20px rgba(229,197,68,0.3)",
            ],
          }}
          transition={{
            boxShadow: { repeat: Infinity, duration: 2, ease: "easeInOut" },
          }}
        >
          <span className="relative flex h-6 w-6 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-highlight-foreground/25" />
            <Camera className="relative h-6 w-6" />
          </span>
          📸 Enviar Fotos para o Telão!
        </motion.button>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="fab-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />

            {/* Bottom sheet */}
            <motion.div
              key="fab-sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-lg"
            >
              <div className="rounded-t-3xl bg-card shadow-elevated">
                {/* Handle bar */}
                <div className="flex justify-center pt-3 pb-1">
                  <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-5 pb-3 pt-2">
                  <div>
                    <h2 className="text-lg font-bold text-foreground">
                      📸 Enviar para o Telão!
                    </h2>
                    <p className="mt-0.5 text-[13px] text-muted-foreground">
                      Escolha como enviar suas fotos ou vídeos
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Fechar"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-accent active:scale-95"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Channel options */}
                <div className="flex flex-col gap-2 px-4 pb-2">
                  {CHANNELS.map((ch, i) => {
                    const Icon = ch.icon;
                    return (
                      <motion.a
                        key={ch.id}
                        href={ch.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + i * 0.08 }}
                        className="group flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-4 transition-all active:scale-[0.98] hover:shadow-md"
                      >
                        <span
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-sm"
                          style={{ backgroundColor: ch.color }}
                        >
                          <Icon className="h-5 w-5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <span className="block text-[15px] font-semibold text-foreground">
                            {ch.label}
                          </span>
                          <span className="block text-[12px] text-muted-foreground">
                            {ch.description}
                          </span>
                        </div>
                        <span className="text-lg opacity-60 group-hover:opacity-100 transition-opacity">
                          →
                        </span>
                      </motion.a>
                    );
                  })}
                </div>

                {/* Footer */}
                <div className="px-5 pb-6 pt-3 safe-bottom text-center">
                  <p className="text-[11px] text-muted-foreground">
                    Suas fotos e vídeos aparecerão no telão do evento! 🎉
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
