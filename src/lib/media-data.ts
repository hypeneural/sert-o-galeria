import type { GalleryMedia } from "./gallery-media";

// Re-export the type for convenience
export type { GalleryMedia };

// Picsum provides reliable placeholder images. Specifying a seed keeps URLs stable.
const pic = (seed: string, w: number, h: number) =>
  `https://picsum.photos/seed/ambssl-${seed}/${w}/${h}`;

// Sample mp4s (small) — Google sample CDN
const sampleVideos = [
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
];

const captions = [
  "Mutirão de limpeza no Sertão",
  "Festa junina da comunidade",
  "Reunião na sede da AMBSSL",
  "Trilha ecológica com moradores",
  "Café da manhã solidário",
  "Plantio de mudas nativas",
  "Encontro das crianças do bairro",
  "Vista do Sertão de Santa Luzia",
  "Show de talentos comunitário",
  "Apresentação cultural na praça",
  "Dia da família AMBSSL",
  "Trabalho voluntário",
  "Paisagem do nosso bairro",
  "Campeonato de futebol amador",
  "Feira de produtos locais",
  "Aniversário da associação",
];

const authors = ["AMBSSL", "Maria Silva", "João Pedro", "Comunidade", "Voluntários"];

// Dominant colors para placeholder CSS instantâneo (paleta terra/natureza)
const dominantColors = [
  "#3a5a40", "#588157", "#a3b18a", "#344e41", "#6b705c",
  "#dda15e", "#bc6c25", "#606c38", "#283618", "#fefae0",
  "#d4a373", "#ccd5ae", "#e9edc9", "#faedcd", "#b7b7a4",
  "#87986a",
];

const dimsLandscape = [
  [1600, 1067],
  [1600, 900],
  [1500, 1000],
];
const dimsPortrait = [
  [1200, 1600],
  [1080, 1440],
  [1000, 1500],
];
const dimsSquare = [[1200, 1200]];

function pickDims(i: number): [number, number] {
  const pool = i % 5 === 0 ? dimsSquare : i % 3 === 0 ? dimsPortrait : dimsLandscape;
  const [w, h] = pool[i % pool.length];
  return [w, h];
}

function buildItems(): GalleryMedia[] {
  const items: GalleryMedia[] = [];
  const total = 44;
  let videoIdx = 0;
  const startDate = new Date("2025-04-20T12:00:00Z").getTime();

  for (let i = 0; i < total; i++) {
    const isVideo = i % 6 === 4; // ~1 of every 6
    const [w, h] = pickDims(i);
    const seed = `${i + 1}`;
    const createdAt = new Date(startDate - i * 1000 * 60 * 60 * 8).toISOString();
    const caption = captions[i % captions.length];
    const author = authors[i % authors.length];
    const isFeatured = i % 7 === 0;
    const color = dominantColors[i % dominantColors.length];

    const ratio = (px: number) => Math.max(1, Math.round((px * h) / w));
    const thumb = (px: number) => pic(seed, px, ratio(px));

    const base: Omit<GalleryMedia, "type" | "videoPosterUrl" | "videoPreviewUrl" | "hlsUrl" | "duration"> = {
      id: `m-${i + 1}`,
      width: w,
      height: h,
      aspectRatio: w / h,
      thumbUrl: thumb(360),
      gridUrl: thumb(640),
      previewUrl: thumb(1080),
      originalUrl: thumb(1800),
      dominantColor: color,
      caption,
      createdAt,
      isFeatured,
      authorName: author,
    };

    if (isVideo) {
      const vUrl = sampleVideos[videoIdx % sampleVideos.length];
      videoIdx++;
      items.push({
        ...base,
        type: "video",
        videoPosterUrl: thumb(720),
        videoPreviewUrl: vUrl,
        hlsUrl: undefined, // real HLS will come from CDN
        duration: 30 + (i * 7) % 180,
      });
    } else {
      items.push({
        ...base,
        type: "photo",
      });
    }
  }
  return items;
}

export const MOCK_MEDIA: GalleryMedia[] = buildItems();
