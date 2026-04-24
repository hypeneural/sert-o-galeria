import { Link, useLocation } from "@tanstack/react-router";
import { Images, Image as ImageIcon, Film, Heart, Info } from "lucide-react";
import { motion } from "framer-motion";

type NavItem = {
  label: string;
  icon: typeof Images;
  to: "/" | "/sobre";
  tab?: "todos" | "fotos" | "videos" | "favoritos";
};

const items: NavItem[] = [
  { label: "Todos", icon: Images, to: "/", tab: "todos" },
  { label: "Fotos", icon: ImageIcon, to: "/", tab: "fotos" },
  { label: "Vídeos", icon: Film, to: "/", tab: "videos" },
  { label: "Favoritos", icon: Heart, to: "/", tab: "favoritos" },
  { label: "Sobre", icon: Info, to: "/sobre" },
];

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
            ? it.to === "/sobre"
            : it.to === "/" && it.tab === activeTab;
          const Icon = it.icon;
          return (
            <li key={it.label} className="flex-1">
              <Link
                to={it.to}
                search={it.to === "/" && it.tab ? { tab: it.tab } : undefined}
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
