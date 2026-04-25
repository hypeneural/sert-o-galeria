import { Toaster } from "@/components/ui/sonner";
import { SendMediaFAB } from "./SendMediaFAB";
import { useServiceWorker } from "@/hooks/use-service-worker";

type Props = {
  children: React.ReactNode;
};

export function AppShell({ children }: Props) {
  // Register SW on first mount (production only)
  useServiceWorker();

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-3xl px-3 pb-24 pt-2">{children}</main>
      <SendMediaFAB />
      <Toaster position="top-center" richColors />
    </div>
  );
}
