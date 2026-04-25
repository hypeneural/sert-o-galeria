import { useState } from "react";
import { Camera, X, MessageCircle, Send } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";

const CHANNELS = [
  {
    id: "whatsapp-group",
    label: "Grupo de WhatsApp",
    description: "Envie no grupo do evento",
    url: "https://chat.whatsapp.com/IHcRggboUoCBxEwQy4979K",
    icon: MessageCircle,
    color: "#25D366",
  },
  {
    id: "whatsapp-direct",
    label: "WhatsApp Direto",
    description: "Envie direto para o fotógrafo",
    url: "https://api.whatsapp.com/send/?phone=5548996553954&text=Oi",
    icon: MessageCircle,
    color: "#128C7E",
  },
  {
    id: "telegram",
    label: "Telegram",
    description: "Envie pelo bot do Telegram",
    url: "https://t.me/eventovivoBot?start=Costelaco",
    icon: Send,
    color: "#0088cc",
  },
] as const;

export function SendMediaFAB() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Botão pulsante fixo */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Enviar fotos para o telão"
        className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 flex items-center gap-2 rounded-full bg-highlight px-5 py-3.5 text-sm font-semibold text-highlight-foreground shadow-elevated transition-transform active:scale-95"
      >
        <span className="relative flex h-5 w-5 items-center justify-center">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-highlight-foreground/30" />
          <Camera className="relative h-5 w-5" />
        </span>
        Enviar Fotos para o Telão!
      </button>

      {/* Modal overlay */}
      <AnimatePresence>
        {open && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"
            onClick={() => setOpen(false)}
          >
            <m.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="relative mx-4 mb-4 w-full max-w-sm overflow-hidden rounded-2xl bg-card shadow-elevated sm:mb-0"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <div>
                  <h2 className="text-base font-semibold text-foreground">
                    📸 Enviar Fotos para o Telão!
                  </h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Escolha uma das opções para enviar
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Fechar"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Options */}
              <div className="flex flex-col gap-2 p-4">
                {CHANNELS.map((ch) => {
                  const Icon = ch.icon;
                  return (
                    <a
                      key={ch.id}
                      href={ch.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3.5 transition-all hover:border-transparent hover:shadow-md active:scale-[0.98]"
                      style={{
                        ["--ch-color" as string]: ch.color,
                      }}
                    >
                      <span
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white"
                        style={{ backgroundColor: ch.color }}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-foreground">
                          {ch.label}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {ch.description}
                        </span>
                      </div>
                      <span className="text-xs font-medium text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                        Abrir →
                      </span>
                    </a>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="border-t border-border px-5 py-3 text-center">
                <p className="text-[11px] text-muted-foreground">
                  Suas fotos e vídeos aparecerão no telão do evento! 🎉
                </p>
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}
