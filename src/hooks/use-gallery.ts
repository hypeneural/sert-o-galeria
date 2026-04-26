import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { fetchGalleryFeed, ApiError } from "@/lib/api";
import type { GalleryMedia } from "@/lib/gallery-media";

type FeedOptions = {
  mediaType?: "image" | "video";
  featured?: boolean;
};

/**
 * Hook principal para o feed de mídia da galeria.
 * Usa useInfiniteQuery com paginação por cursor.
 * Adapta automaticamente entre API real e mock.
 */
export function useGalleryFeed({ mediaType, featured }: FeedOptions = {}) {
  const query = useInfiniteQuery({
    queryKey: ["gallery-feed", { mediaType, featured }],
    queryFn: ({ pageParam, signal }) =>
      fetchGalleryFeed({ mediaType, featured, cursor: pageParam }, signal),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
    staleTime: 30_000,
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && !error.retryable) return false;
      return failureCount < 2;
    },
  });

  const items: GalleryMedia[] = useMemo(
    () => query.data?.pages.flatMap((p) => p.data) ?? [],
    [query.data],
  );
  const mediaStartIndex = query.data?.pages[0]?.mediaStartIndex ?? 0;

  return {
    items,
    mediaStartIndex,
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    refetch: query.refetch,
    error: query.error,
    isError: query.isError,
  };
}
