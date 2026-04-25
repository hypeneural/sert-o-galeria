import type { GalleryPage } from "./gallery-media";
import { MOCK_MEDIA } from "./media-data";

// ---------------------------------------------------------------------------
// API client — usa endpoint real quando disponível, mock data como fallback.
// Configure VITE_API_BASE_URL no .env para apontar para a API real.
// ---------------------------------------------------------------------------

const API_BASE = import.meta.env.VITE_API_BASE_URL as string | undefined;
const PAGE_SIZE = 14;

type FeedParams = {
  tab?: "todos" | "fotos" | "videos" | "favoritos";
  sort?: "recent" | "featured";
  cursor?: string | null;
  favoriteIds?: Set<string>;
};

/**
 * Busca uma página do feed de mídia.
 * Quando `VITE_API_BASE_URL` não está definida, usa dados mock com paginação simulada.
 */
export async function fetchGalleryFeed(params: FeedParams): Promise<GalleryPage> {
  if (API_BASE) {
    return fetchFromApi(params);
  }
  return fetchFromMock(params);
}

// ---------------------------------------------------------------------------
// API real (pronto para quando o endpoint existir)
// ---------------------------------------------------------------------------
async function fetchFromApi(params: FeedParams): Promise<GalleryPage> {
  const url = new URL("/media/feed", API_BASE);
  if (params.tab && params.tab !== "todos") url.searchParams.set("type", params.tab);
  if (params.sort) url.searchParams.set("sort", params.sort);
  if (params.cursor) url.searchParams.set("cursor", params.cursor);
  url.searchParams.set("limit", String(PAGE_SIZE));

  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<GalleryPage>;
}

// ---------------------------------------------------------------------------
// Mock fallback — simula paginação por cursor sobre dados locais
// ---------------------------------------------------------------------------
function fetchFromMock(params: FeedParams): Promise<GalleryPage> {
  let items = [...MOCK_MEDIA];

  // Filtro
  if (params.tab === "fotos") items = items.filter((i) => i.type === "photo");
  else if (params.tab === "videos") items = items.filter((i) => i.type === "video");
  else if (params.tab === "favoritos" && params.favoriteIds) {
    items = items.filter((i) => params.favoriteIds!.has(i.id));
  }

  // Sort
  if (params.sort === "featured") {
    items.sort((a, b) => Number(!!b.isFeatured) - Number(!!a.isFeatured));
  } else {
    items.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  // Paginação por cursor (cursor = index stringificado)
  const startIndex = params.cursor ? parseInt(params.cursor, 10) : 0;
  const page = items.slice(startIndex, startIndex + PAGE_SIZE);
  const nextIndex = startIndex + PAGE_SIZE;
  const hasMore = nextIndex < items.length;

  // Simula latência de rede no dev para testar skeletons
  const delay = import.meta.env.DEV ? 300 : 0;

  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve({
          data: page,
          nextCursor: hasMore ? String(nextIndex) : null,
          total: items.length,
        }),
      delay,
    ),
  );
}
