import { Toaster } from "@/components/ui/sonner";
import { BottomNav } from "./BottomNav";

type Props = {
  children: React.ReactNode;
  activeTab: string;
};

export function AppShell({ children, activeTab }: Props) {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-3xl px-3 pb-28 pt-2">{children}</main>
      <BottomNav activeTab={activeTab} />
      <Toaster position="top-center" richColors />
    </div>
  );
}
