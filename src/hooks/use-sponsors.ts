import { useQuery } from "@tanstack/react-query";
import { fetchSponsors } from "@/lib/api";
import type { GalleryManifest } from "@/lib/gallery-media";

/**
 * Hook para buscar sponsors.
 * Só faz request se capabilities.sponsors.enabled === true.
 */
export function useSponsors(manifest: GalleryManifest | undefined) {
  const enabled = manifest?.capabilities.sponsors.enabled ?? false;

  return useQuery({
    queryKey: ["gallery-sponsors"],
    queryFn: ({ signal }) => fetchSponsors(signal),
    enabled,
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
    retry: 1,
  });
}
