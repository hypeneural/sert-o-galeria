import { useQuery } from "@tanstack/react-query";
import { fetchManifest } from "@/lib/api";

/**
 * Hook para buscar o manifest do evento.
 * Deve ser chamado ANTES do media feed.
 * Retorna branding, capabilities e metadata da galeria.
 */
export function useManifest() {
  return useQuery({
    queryKey: ["gallery-manifest"],
    queryFn: ({ signal }) => fetchManifest(signal),
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    retry: 2,
  });
}
