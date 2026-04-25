// ---------------------------------------------------------------------------
// GalleryMedia — Tipo interno normalizado para a UI.
// A camada api.ts adapta o contrato da API para este formato.
// ---------------------------------------------------------------------------

export type GalleryMedia = {
  id: string;
  type: "photo" | "video";
  width: number;
  height: number;
  aspectRatio: number;

  // --- Variantes de imagem por contexto ---
  thumbUrl: string;
  gridUrl: string;
  previewUrl: string;
  originalUrl?: string;

  // --- Placeholder instantâneo ---
  blurhash?: string;
  dominantColor?: string;

  // --- Responsive (direto da API) ---
  srcSet?: string;
  sizes?: string;

  // --- Vídeo ---
  videoPosterUrl?: string;
  videoPreviewUrl?: string;
  hlsUrl?: string;
  duration?: number;

  // --- Metadados ---
  caption?: string;
  createdAt: string;
  isFeatured?: boolean;
  authorName?: string;
};

export type GalleryPage = {
  data: GalleryMedia[];
  nextCursor: string | null;
  hasMore: boolean;
};

// ---------------------------------------------------------------------------
// Manifest — Metadata do evento + capabilities da galeria
// ---------------------------------------------------------------------------

export type GalleryManifest = {
  event: {
    slug: string;
    title: string;
    event_type: string;
    starts_at: string;
    location_name: string | null;
    description: string | null;
    branding: {
      primary_color: string;
      secondary_color: string;
      cover_image_url: string | null;
      cover_image_thumbnail_url: string | null;
      logo_url: string | null;
      source: string;
    };
    links: {
      public_gallery_url: string | null;
      public_gallery_share_url: string | null;
    };
  };
  gallery: {
    public_media_count: number;
    published_version: number;
    media_feed_url: string;
    min_refresh_interval_seconds: number;
  };
  capabilities: {
    photos: boolean;
    videos: boolean;
    face_search: {
      enabled: boolean;
      mode: string;
      url: string | null;
    };
    download: {
      enabled: boolean;
      mode: string;
    };
    sponsors: {
      enabled: boolean;
      mode: string;
      url: string | null;
      source: string;
    };
    realtime: {
      enabled: boolean;
      mode: string;
      min_interval_seconds: number;
    };
  };
  links: {
    self: string;
    media_feed: string;
    sponsors: string | null;
    public_gallery: string | null;
    find_me: string | null;
  };
  meta: {
    request_id: string;
    generated_at: string;
  };
};

// ---------------------------------------------------------------------------
// Sponsors
// ---------------------------------------------------------------------------

export type GallerySponsor = {
  public_id: string;
  media_type: "image" | "video";
  mime_type: string;
  position: number;
  duration_seconds: number | null;
  display_duration_seconds: number | null;
  playback_mode: string;
  width: number;
  height: number;
  orientation: string;
  urls: {
    asset: string;
    poster: string | null;
  };
};

// ---------------------------------------------------------------------------
// API response shapes (raw, antes da adaptação)
// ---------------------------------------------------------------------------

export type ApiMediaItem = {
  public_id: string;
  media_type: "image" | "video";
  mime_type: string;
  caption: string | null;
  published_at: string;
  width: number;
  height: number;
  orientation: string;
  is_featured: boolean;
  duration_seconds: number | null;
  urls: {
    thumbnail: string;
    small: string | null;
    preview: string | null;
    poster: string | null;
    video_preview: string | null;
  };
  responsive_sources: {
    sizes: string;
    srcset: string;
    variants: Array<{
      variant_key: string;
      src: string;
      width: number;
      height: number;
      mime_type: string;
    }>;
  } | null;
};

export type ApiMediaFeedResponse = {
  success: boolean;
  schema_version: string;
  media: ApiMediaItem[];
  pagination: {
    limit: number;
    next_cursor: string | null;
    has_more: boolean;
  };
  meta: {
    request_id: string;
    generated_at: string;
  };
};

export type ApiManifestResponse = {
  success: boolean;
  schema_version: string;
} & GalleryManifest;

export type ApiSponsorsResponse = {
  success: boolean;
  schema_version: string;
  sponsors: GallerySponsor[];
  meta: {
    request_id: string;
    generated_at: string;
    limit: number;
    sponsors_enabled: boolean;
  };
};
