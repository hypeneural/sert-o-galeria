import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Check } from "lucide-react";

export type SortKey = "recent" | "featured";
export type FilterKey = "todos" | "fotos" | "videos" | "favoritos";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  filter: FilterKey;
  setFilter: (f: FilterKey) => void;
  sort: SortKey;
  setSort: (s: SortKey) => void;
};

const filters: { key: FilterKey; label: string }[] = [
  { key: "todos", label: "Todos os itens" },
  { key: "fotos", label: "Apenas fotos" },
  { key: "videos", label: "Apenas vídeos" },
  { key: "favoritos", label: "Meus favoritos" },
];

const sorts: { key: SortKey; label: string }[] = [
  { key: "recent", label: "Mais recentes" },
  { key: "featured", label: "Destaques primeiro" },
];

export function FilterSheet({ open, onOpenChange, filter, setFilter, sort, setSort }: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl border-t-0 pb-safe">
        <SheetHeader className="text-left">
          <SheetTitle className="text-lg">Filtrar e ordenar</SheetTitle>
        </SheetHeader>

        <div className="mt-2 space-y-6">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Mostrar
            </p>
            <div className="space-y-1">
              {filters.map((f) => {
                const active = f.key === filter;
                return (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => {
                      setFilter(f.key);
                      onOpenChange(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-medium transition-colors ${
                      active ? "bg-highlight/30 text-primary" : "hover:bg-accent"
                    }`}
                  >
                    {f.label}
                    {active && <Check className="h-4 w-4 text-primary" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Ordenar
            </p>
            <div className="space-y-1">
              {sorts.map((s) => {
                const active = s.key === sort;
                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => {
                      setSort(s.key);
                      onOpenChange(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-medium transition-colors ${
                      active ? "bg-highlight/30 text-primary" : "hover:bg-accent"
                    }`}
                  >
                    {s.label}
                    {active && <Check className="h-4 w-4 text-primary" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
