import { U as jsxRuntimeExports } from "./worker-entry-DPjF8scK.js";
import { c as createLucideIcon, A as AppShell, l as logo, H as Heart } from "./ambssl-logo-DoTonr3n.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./router-BJlMJuqw.js";
const __iconNode$1 = [
  [
    "path",
    {
      d: "M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z",
      key: "nnexq3"
    }
  ],
  ["path", { d: "M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12", key: "mt58a7" }]
];
const Leaf = createLucideIcon("leaf", __iconNode$1);
const __iconNode = [
  ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }],
  ["path", { d: "M16 3.128a4 4 0 0 1 0 7.744", key: "16gr8j" }],
  ["path", { d: "M22 21v-2a4 4 0 0 0-3-3.87", key: "kshegd" }],
  ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }]
];
const Users = createLucideIcon("users", __iconNode);
function SobrePage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppShell, { activeTab: "", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center px-4 pt-8 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl bg-primary/5 shadow-elevated", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: logo, alt: "Logo AMBSSL", width: 96, height: 96, className: "h-20 w-20 object-contain" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-5 text-2xl font-bold text-foreground", children: "Galeria AMBSSL" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Associação de Moradores do Bairro Sertão de Santa Luzia" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "Porto Belo · Santa Catarina" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto mt-8 max-w-xl space-y-3 px-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-5 w-5" }), title: "Comunidade unida", tint: "primary", children: "A galeria reúne momentos que marcaram a vida do bairro: encontros, mutirões, festas e paisagens do nosso lugar." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-5 w-5" }), title: "Memória viva", tint: "highlight", children: "Cada foto e vídeo conta uma parte da nossa história. Salve seus favoritos no dispositivo e compartilhe com quem você ama." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Leaf, { className: "h-5 w-5" }), title: "Sertão de Santa Luzia", tint: "nature", children: "Um bairro de natureza acolhedora em Porto Belo. Esta galeria é pública e feita pela comunidade, para a comunidade." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mx-auto mt-10 max-w-xs text-center text-[11px] text-muted-foreground", children: [
      "© ",
      (/* @__PURE__ */ new Date()).getFullYear(),
      " AMBSSL · Galeria pública da comunidade"
    ] })
  ] });
}
function Card({
  icon,
  title,
  children,
  tint
}) {
  const tints = {
    primary: "bg-primary/10 text-primary",
    highlight: "bg-highlight/30 text-highlight-foreground",
    nature: "bg-nature/15 text-nature"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-card p-4 shadow-card", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `flex h-10 w-10 items-center justify-center rounded-xl ${tints[tint]}`, children: icon }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-foreground", children: title })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm leading-relaxed text-muted-foreground", children })
  ] });
}
export {
  SobrePage as component
};
