// ---------------------------------------------------------------------------
// GalleryMedia — Contrato de dados para mídia da galeria.
// A API externa deve devolver este manifesto com variantes prontas.
// ---------------------------------------------------------------------------

export type GalleryMedia = {
  id: string;
  type: "photo" | "video";
  width: number;
  height: number;
  aspectRatio: number;

  // --- Variantes de imagem por contexto ---
  thumbUrl: string; // 240–360px  → grid mobile
  gridUrl: string; // 480–720px  → grid desktop / tablet
  previewUrl: string; // 1080–1440px → viewer
  originalUrl?: string; // full-res → download / zoom real (sob demanda)

  // --- Placeholder instantâneo ---
  blurhash?: string; // decode no client, zero network
  dominantColor?: string; // fallback CSS se blurhash indisponível

  // --- Vídeo ---
  videoPosterUrl?: string; // poster real (frame do vídeo), não thumbnail genérica
  videoPreviewUrl?: string; // mp4 curto/baixo peso para preview inline
  hlsUrl?: string; // streaming adaptativo para vídeos maiores
  duration?: number; // duração em segundos

  // --- Metadados ---
  caption?: string;
  createdAt: string;
  isFeatured?: boolean;
  authorName?: string;
  sponsorSlot?: boolean;
};

export type GalleryPage = {
  data: GalleryMedia[];
  nextCursor: string | null;
  total: number;
};
