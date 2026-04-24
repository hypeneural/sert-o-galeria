import { WifiOff } from "lucide-react";

export function OfflineBanner() {
  return (
    <div
      role="status"
      className="sticky top-[57px] z-20 mx-auto flex max-w-3xl items-center gap-2 px-4"
    >
      <div className="mt-2 flex w-full items-center gap-2 rounded-xl bg-highlight/95 px-3 py-2 text-[13px] font-medium text-highlight-foreground shadow-card">
        <WifiOff className="h-4 w-4 shrink-0" />
        <span>Sem internet no momento. Mostrando itens já carregados.</span>
      </div>
    </div>
  );
}
