import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/gallery/AppShell";
import logo from "@/assets/ambssl-logo.png";
import { Leaf, Heart, Users } from "lucide-react";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre — Galeria AMBSSL" },
      {
        name: "description",
        content:
          "Conheça a Associação de Moradores do Bairro Sertão de Santa Luzia, Porto Belo - SC.",
      },
      { property: "og:title", content: "Sobre a AMBSSL" },
      {
        property: "og:description",
        content: "Comunidade do Sertão de Santa Luzia, Porto Belo - SC.",
      },
    ],
  }),
  component: SobrePage,
});

function SobrePage() {
  return (
    <AppShell>
      <div className="flex flex-col items-center px-4 pt-8 text-center">
        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl bg-primary/5 shadow-elevated">
          <img src={logo} alt="Logo AMBSSL" width={96} height={96} className="h-20 w-20 object-contain" />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-foreground">Galeria AMBSSL</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Associação de Moradores do Bairro Sertão de Santa Luzia
        </p>
        <p className="mt-1 text-xs text-muted-foreground">Porto Belo · Santa Catarina</p>
      </div>

      <div className="mx-auto mt-8 max-w-xl space-y-3 px-2">
        <Card icon={<Users className="h-5 w-5" />} title="Comunidade unida" tint="primary">
          A galeria reúne momentos que marcaram a vida do bairro: encontros, mutirões, festas
          e paisagens do nosso lugar.
        </Card>
        <Card icon={<Heart className="h-5 w-5" />} title="Memória viva" tint="highlight">
          Cada foto e vídeo conta uma parte da nossa história. Salve seus favoritos no
          dispositivo e compartilhe com quem você ama.
        </Card>
        <Card icon={<Leaf className="h-5 w-5" />} title="Sertão de Santa Luzia" tint="nature">
          Um bairro de natureza acolhedora em Porto Belo. Esta galeria é pública e feita pela
          comunidade, para a comunidade.
        </Card>
      </div>

      <p className="mx-auto mt-10 max-w-xs text-center text-[11px] text-muted-foreground">
        © {new Date().getFullYear()} AMBSSL · Galeria pública da comunidade
      </p>
    </AppShell>
  );
}

function Card({
  icon,
  title,
  children,
  tint,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  tint: "primary" | "highlight" | "nature";
}) {
  const tints = {
    primary: "bg-primary/10 text-primary",
    highlight: "bg-highlight/30 text-highlight-foreground",
    nature: "bg-nature/15 text-nature",
  } as const;
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <div className="flex items-center gap-3">
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tints[tint]}`}>
          {icon}
        </span>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{children}</p>
    </div>
  );
}
