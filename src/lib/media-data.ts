export type MediaItem = {
  id: string;
  type: "photo" | "video";
  thumbnailUrl: string;
  thumbnailSrcSet: string;
  previewUrl: string;
  fullUrl: string;
  lqipUrl: string; // tiny blurred placeholder
  videoUrl?: string;
  width: number;
  height: number;
  aspectRatio: number;
  caption?: string;
  createdAt: string; // ISO
  isFeatured?: boolean;
  authorName?: string;
};

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

function buildItems(): MediaItem[] {
  const items: MediaItem[] = [];
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

    const ratio = (px: number) => Math.max(1, Math.round((px * h) / w));
    const thumb = (px: number) => pic(seed, px, ratio(px));
    const srcSet = `${thumb(320)} 320w, ${thumb(480)} 480w, ${thumb(640)} 640w, ${thumb(800)} 800w`;
    const lqip = `${pic(seed, 24, ratio(24))}.webp?blur=4`;

    if (isVideo) {
      const vUrl = sampleVideos[videoIdx % sampleVideos.length];
      videoIdx++;
      items.push({
        id: `m-${i + 1}`,
        type: "video",
        thumbnailUrl: thumb(480),
        thumbnailSrcSet: srcSet,
        previewUrl: thumb(900),
        fullUrl: thumb(1600),
        lqipUrl: lqip,
        videoUrl: vUrl,
        width: w,
        height: h,
        aspectRatio: w / h,
        caption,
        createdAt,
        isFeatured,
        authorName: author,
      });
    } else {
      items.push({
        id: `m-${i + 1}`,
        type: "photo",
        thumbnailUrl: thumb(480),
        thumbnailSrcSet: srcSet,
        previewUrl: thumb(1000),
        fullUrl: thumb(1800),
        lqipUrl: lqip,
        width: w,
        height: h,
        aspectRatio: w / h,
        caption,
        createdAt,
        isFeatured,
        authorName: author,
      });
    }
  }
  return items;
}

export const MEDIA_ITEMS: MediaItem[] = buildItems();
