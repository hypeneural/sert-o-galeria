import { Link, useLocation } from "@tanstack/react-router";
import { Images, Image as ImageIcon, Film, Heart, Info } from "lucide-react";
import { motion } from "framer-motion";

const items = [
  { to: "/", label: "Todos", icon: Images, exact: true },
  { to: "/?tab=fotos", label: "Fotos", icon: ImageIcon, match: "fotos" },
  { to: "/?tab=videos", label: "Vídeos", icon: Film, match: "videos" },
  { to: "/?tab=favoritos", label: "Favoritos", icon: Heart, match: "favoritos" },
  { to: "/sobre", label: "Sobre", icon: Info, match: "/sobre" },
] as const;

export function BottomNav({ activeTab }: { activeTab: string }) {
  const location = useLocation();
  const onAbout = location.pathname === "/sobre";

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 glass-bar border-t border-border pb-safe"
    >
      <ul className="mx-auto flex max-w-3xl items-stretch justify-between px-2 pt-1.5">
        {items.map((it) => {
          const isActive = onAbout
            ? it.match === "/sobre"
            : it.exact
              ? activeTab === "todos"
              : it.match === activeTab;
          const Icon = it.icon;
          return (
            <li key={it.label} className="flex-1">
              <Link
                to={it.to.startsWith("/?") ? "/" : it.to}
                search={
                  it.to.startsWith("/?")
                    ? { tab: it.to.split("=")[1] }
                    : undefined
                }
                className="relative flex flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium"
                aria-current={isActive ? "page" : undefined}
              >
                <span
                  className={`relative flex h-9 w-12 items-center justify-center rounded-full transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="bnav-pill"
                      className="absolute inset-0 rounded-full bg-highlight/40"
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                  )}
                  <Icon className="relative h-5 w-5" strokeWidth={2.2} />
                </span>
                <span className={isActive ? "text-primary" : "text-muted-foreground"}>
                  {it.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
