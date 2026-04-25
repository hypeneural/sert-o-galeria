import type {
  GalleryMedia,
  GalleryPage,
  GalleryManifest,
  GallerySponsor,
  ApiMediaItem,
  ApiMediaFeedResponse,
  ApiManifestResponse,
  ApiSponsorsResponse,
} from "./gallery-media";
import { eventApiUrl, API_BASE } from "./event-config";
import { MOCK_MEDIA } from "./media-data";

// ---------------------------------------------------------------------------
// Configuração
// ---------------------------------------------------------------------------

const PAGE_SIZE = 30;

/** Retorna true se a API real está configurada */
function hasRealApi(): boolean {
  return !!API_BASE && API_BASE !== "";
}

// ---------------------------------------------------------------------------
// HTTP helper com tratamento de status codes
// ---------------------------------------------------------------------------

class ApiError extends Error {
  status: number;
  retryAfter?: number;
  retryable: boolean;

  constructor(status: number, message: string, retryAfter?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.retryAfter = retryAfter;
    this.retryable = true; // default: retryable
  }
}

async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  let res: Response;

  try {
    res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal,
    });
  } catch (err) {
    // CORS bloqueado ou sem rede — fetch() lança TypeError
    if (err instanceof TypeError) {
      const corsError = new ApiError(
        0,
        "Não foi possível conectar à API. Verifique se o domínio está liberado no CORS.",
      );
      corsError.retryable = false;
      throw corsError;
    }
    throw err;
  }

  if (res.status === 304) {
    throw new ApiError(304, "Conteúdo não modificado");
  }

  if (res.status === 404) {
    const e = new ApiError(404, "Galeria não encontrada ou desabilitada");
    e.retryable = false;
    throw e;
  }

  if (res.status === 410) {
    const e = new ApiError(410, "Evento encerrado");
    e.retryable = false;
    throw e;
  }

  if (res.status === 422) {
    const e = new ApiError(422, "Parâmetro inválido (cursor expirado?)");
    e.retryable = false;
    throw e;
  }

  if (res.status === 429) {
    const retryAfter = parseInt(res.headers.get("Retry-After") ?? "30", 10);
    throw new ApiError(429, "Muitas requisições. Tente novamente em breve.", retryAfter);
  }

  if (!res.ok) {
    throw new ApiError(res.status, `Erro da API: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Adapter: API item → GalleryMedia interno
// ---------------------------------------------------------------------------

function adaptMediaItem(item: ApiMediaItem): GalleryMedia {
  const isVideo = item.media_type === "video";

  return {
    id: item.public_id,
    type: isVideo ? "video" : "photo",
    width: item.width,
    height: item.height,
    aspectRatio: item.width / (item.height || 1),

    thumbUrl: item.urls.thumbnail,
    gridUrl: item.urls.small ?? item.urls.thumbnail,
    previewUrl: item.urls.preview ?? item.urls.small ?? item.urls.thumbnail,

    videoPosterUrl: item.urls.poster ?? undefined,
    videoPreviewUrl: item.urls.video_preview ?? undefined,
    duration: item.duration_seconds ?? undefined,

    caption: item.caption ?? undefined,
    createdAt: item.published_at,
    isFeatured: item.is_featured,

    srcSet: item.responsive_sources?.srcset ?? undefined,
    sizes: item.responsive_sources?.sizes ?? undefined,
  };
}

// ---------------------------------------------------------------------------
// Manifest
// ---------------------------------------------------------------------------

export async function fetchManifest(signal?: AbortSignal): Promise<GalleryManifest> {
  if (!hasRealApi()) {
    return getMockManifest();
  }

  const res = await fetchJson<ApiManifestResponse>(eventApiUrl("/manifest"), signal);
  return res;
}

// ---------------------------------------------------------------------------
// Media Feed
// ---------------------------------------------------------------------------

export type FeedParams = {
  mediaType?: "image" | "video";
  featured?: boolean;
  cursor?: string | null;
  limit?: number;
};

export async function fetchGalleryFeed(
  params: FeedParams,
  signal?: AbortSignal,
): Promise<GalleryPage> {
  if (!hasRealApi()) {
    return fetchFromMock(params);
  }

  const url = new URL(eventApiUrl("/media-feed"));
  url.searchParams.set("limit", String(params.limit ?? PAGE_SIZE));
  if (params.cursor) url.searchParams.set("cursor", params.cursor);
  if (params.mediaType) url.searchParams.set("media_type", params.mediaType);
  if (typeof params.featured === "boolean") url.searchParams.set("featured", String(params.featured));

  const res = await fetchJson<ApiMediaFeedResponse>(url.toString(), signal);

  return {
    data: res.media.map(adaptMediaItem),
    nextCursor: res.pagination.next_cursor,
    hasMore: res.pagination.has_more,
  };
}

// ---------------------------------------------------------------------------
// Sponsors
// ---------------------------------------------------------------------------

export async function fetchSponsors(signal?: AbortSignal): Promise<GallerySponsor[]> {
  if (!hasRealApi()) return [];

  const res = await fetchJson<ApiSponsorsResponse>(eventApiUrl("/sponsors"), signal);
  return res.sponsors;
}

// ---------------------------------------------------------------------------
// Mock fallback
// ---------------------------------------------------------------------------

function fetchFromMock(params: FeedParams): Promise<GalleryPage> {
  let items = [...MOCK_MEDIA];

  if (params.mediaType === "image") items = items.filter((i) => i.type === "photo");
  else if (params.mediaType === "video") items = items.filter((i) => i.type === "video");

  if (params.featured) items = items.filter((i) => i.isFeatured);

  items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const startIndex = params.cursor ? parseInt(params.cursor, 10) : 0;
  const limit = params.limit ?? PAGE_SIZE;
  const page = items.slice(startIndex, startIndex + limit);
  const nextIndex = startIndex + limit;
  const hasMore = nextIndex < items.length;

  const delay = import.meta.env.DEV ? 300 : 0;

  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve({
          data: page,
          nextCursor: hasMore ? String(nextIndex) : null,
          hasMore,
        }),
      delay,
    ),
  );
}

function getMockManifest(): GalleryManifest {
  return {
    event: {
      slug: "mock-event",
      title: "Galeria AMBSSL",
      event_type: "other",
      starts_at: new Date().toISOString(),
      location_name: "Sertão de Santa Luzia",
      description: "Fotos e vídeos da comunidade",
      branding: {
        primary_color: "#0e2a52",
        secondary_color: "#f5f5f5",
        cover_image_url: null,
        cover_image_thumbnail_url: null,
        logo_url: null,
        source: "mock",
      },
      links: {
        public_gallery_url: null,
        public_gallery_share_url: null,
      },
    },
    gallery: {
      public_media_count: MOCK_MEDIA.length,
      published_version: 1,
      media_feed_url: "",
      min_refresh_interval_seconds: 30,
    },
    capabilities: {
      photos: true,
      videos: true,
      face_search: { enabled: false, mode: "redirect", url: null },
      download: { enabled: false, mode: "disabled" },
      sponsors: { enabled: false, mode: "feed", url: null, source: "wall_ads" },
      realtime: { enabled: false, mode: "polling", min_interval_seconds: 30 },
    },
    links: {
      self: "",
      media_feed: "",
      sponsors: null,
      public_gallery: null,
      find_me: null,
    },
    meta: {
      request_id: "mock",
      generated_at: new Date().toISOString(),
    },
  };
}

export { ApiError };
