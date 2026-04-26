import { useQuery } from "@tanstack/react-query";
import { fetchManifest, ApiError } from "@/lib/api";

/**
 * Hook para buscar o manifest do evento.
 * Deve ser chamado ANTES do media feed.
 * Não retenta se o erro for CORS, 404 ou 410.
 */
export function useManifest() {
  return useQuery({
    queryKey: ["gallery-manifest"],
    queryFn: ({ signal }) => fetchManifest(signal),
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data?.capabilities.realtime.enabled) return false;
      const seconds = Math.max(
        data.capabilities.realtime.min_interval_seconds,
        data.gallery.min_refresh_interval_seconds,
        30,
      );
      return seconds * 1000;
    },
    retry: (failureCount, error) => {
      if (error instanceof ApiError && !error.retryable) return false;
      return failureCount < 2;
    },
  });
}
