import { useEffect } from "react";

/**
 * Registra o Service Worker apenas no client.
 * Chamado uma vez no AppShell.
 */
export function useServiceWorker() {
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      import.meta.env.DEV // Não registra SW em dev para não atrapalhar HMR
    ) {
      return;
    }

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((reg) => {
        // Check for updates periodically
        setInterval(() => reg.update(), 60 * 60 * 1000); // 1h
      })
      .catch((err) => {
        console.warn("[SW] Registration failed:", err);
      });
  }, []);
}
