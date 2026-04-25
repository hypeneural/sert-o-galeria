import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { fetchGalleryFeed } from "@/lib/api";
import type { GalleryMedia } from "@/lib/gallery-media";

type FeedOptions = {
  tab?: "todos" | "fotos" | "videos" | "favoritos";
  sort?: "recent" | "featured";
  favoriteIds?: Set<string>;
};

/**
 * Hook principal para o feed de mídia da galeria.
 * Usa useInfiniteQuery com paginação por cursor.
 * Quando VITE_API_BASE_URL não existe, usa mock data transparentemente.
 */
export function useGalleryFeed({ tab = "todos", sort = "recent", favoriteIds }: FeedOptions) {
  const query = useInfiniteQuery({
    queryKey: ["gallery", { tab, sort }],
    queryFn: ({ pageParam }) =>
      fetchGalleryFeed({ tab, sort, cursor: pageParam, favoriteIds }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  // Flatten pages em array único de items
  const items: GalleryMedia[] = useMemo(
    () => query.data?.pages.flatMap((p) => p.data) ?? [],
    [query.data],
  );

  const total = query.data?.pages[0]?.total ?? 0;

  return {
    items,
    total,
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    error: query.error,
    isError: query.isError,
  };
}
