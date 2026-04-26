import type {
  GalleryMedia,
  GallerySponsor,
  GallerySponsorRules,
  SponsorMode,
  SponsorPlacement,
} from "./gallery-media";

export type SponsorDisplayPlacement = "header" | "inline" | "footer";

export type ResolvedSponsorRules = {
  frequency: number;
  minMediaForInline: number;
  mode: SponsorMode;
  order: string;
  loop: boolean;
  maxWeight: number;
};

export type ComposeGalleryContext = {
  filterKey?: string;
  mediaStartIndex?: number;
  rotationSeed?: number;
  now?: Date;
};

export type ComposeGalleryOptions = {
  rules?: GallerySponsorRules | ResolvedSponsorRules | null;
  context?: ComposeGalleryContext;
};

export type ComposedMediaItem = {
  kind: "media";
  data: GalleryMedia;
};

export type ComposedSponsorItem = {
  kind: "sponsor";
  data: GallerySponsor;
  placement: "inline";
  slotIndex: number;
  slotId: string;
  afterMediaId: string;
};

export type ComposedItem = ComposedMediaItem | ComposedSponsorItem;

export type ComposedGallery = {
  items: ComposedItem[];
  footerSponsors: GallerySponsor[];
};

export type NormalizedSponsors = {
  inline: GallerySponsor[];
  footer: GallerySponsor[];
  header: GallerySponsor[];
  weightedInlinePool: GallerySponsor[];
};

export const DEFAULT_SPONSOR_RULES: ResolvedSponsorRules = {
  frequency: 5,
  minMediaForInline: 5,
  mode: "inline_and_footer",
  order: "position_then_priority_then_weighted_rotation",
  loop: true,
  maxWeight: 10,
};

export function resolveSponsorRules(
  rules?: GallerySponsorRules | ResolvedSponsorRules | null,
): ResolvedSponsorRules {
  return {
    frequency: sanitizePositiveInt(rules?.frequency, DEFAULT_SPONSOR_RULES.frequency),
    minMediaForInline: sanitizePositiveInt(
      "minMediaForInline" in (rules ?? {})
        ? (rules as ResolvedSponsorRules).minMediaForInline
        : (rules as GallerySponsorRules | null | undefined)?.min_media_for_inline,
      DEFAULT_SPONSOR_RULES.minMediaForInline,
    ),
    mode: isSponsorMode(rules?.mode) ? rules.mode : DEFAULT_SPONSOR_RULES.mode,
    order: rules?.order ?? DEFAULT_SPONSOR_RULES.order,
    loop: typeof rules?.loop === "boolean" ? rules.loop : DEFAULT_SPONSOR_RULES.loop,
    maxWeight: sanitizePositiveInt(
      "maxWeight" in (rules ?? {})
        ? (rules as ResolvedSponsorRules).maxWeight
        : (rules as GallerySponsorRules | null | undefined)?.max_weight,
      DEFAULT_SPONSOR_RULES.maxWeight,
    ),
  };
}

export function composeGallery(
  media: GalleryMedia[],
  sponsors: GallerySponsor[],
  optionsOrOffset: ComposeGalleryOptions | number = {},
): ComposedGallery {
  const options =
    typeof optionsOrOffset === "number"
      ? { context: { mediaStartIndex: optionsOrOffset } }
      : optionsOrOffset;
  const rules = resolveSponsorRules(options.rules);
  const context = options.context ?? {};
  const filterKey = context.filterKey ?? "todos";
  const mediaStartIndex = Math.max(0, context.mediaStartIndex ?? 0);
  const rotationSeed = context.rotationSeed;
  const now = context.now ?? new Date();
  const mediaItems = media.map((item) => ({ kind: "media" as const, data: item }));

  if (!sponsors.length || rules.mode === "none") {
    return { items: mediaItems, footerSponsors: [] };
  }

  const normalized = normalizeSponsors(sponsors, rules, now, rotationSeed);
  const showFooter = rules.mode !== "inline_only";

  if (!normalized.weightedInlinePool.length || rules.mode === "footer_only") {
    return {
      items: mediaItems,
      footerSponsors: showFooter ? normalized.footer : [],
    };
  }

  if (mediaStartIndex === 0 && media.length < rules.minMediaForInline) {
    return {
      items: mediaItems,
      footerSponsors: showFooter ? normalized.footer : [],
    };
  }

  const result: ComposedItem[] = [];
  const usedSponsorIds = new Set<string>();
  const previousInlineSlots = Math.floor(mediaStartIndex / rules.frequency);

  for (let slotIndex = 0; slotIndex < previousInlineSlots; slotIndex++) {
    const sponsor = sponsorForSlot(normalized.weightedInlinePool, slotIndex, rules.loop);
    if (sponsor) usedSponsorIds.add(sponsor.public_id);
  }

  media.forEach((item, localIndex) => {
    result.push({ kind: "media", data: item });

    const globalPosition = mediaStartIndex + localIndex + 1;
    if (globalPosition % rules.frequency !== 0) return;

    const slotIndex = Math.floor(globalPosition / rules.frequency) - 1;
    const sponsor = sponsorForSlot(normalized.weightedInlinePool, slotIndex, rules.loop);
    if (!sponsor) return;

    const slotId = buildSponsorSlotId({
      placement: "inline",
      filterKey,
      slotIndex,
      mediaPosition: globalPosition,
      sponsorId: sponsor.public_id,
    });

    result.push({
      kind: "sponsor",
      data: sponsor,
      placement: "inline",
      slotIndex,
      slotId,
      afterMediaId: item.id,
    });
    usedSponsorIds.add(sponsor.public_id);
  });

  return {
    items: result,
    footerSponsors: showFooter
      ? normalized.footer.filter((sponsor) => !usedSponsorIds.has(sponsor.public_id))
      : [],
  };
}

export function normalizeSponsors(
  sponsors: GallerySponsor[],
  rules: ResolvedSponsorRules = DEFAULT_SPONSOR_RULES,
  now: Date = new Date(),
  rotationSeed?: number,
): NormalizedSponsors {
  const eligible = sponsors.filter((sponsor) => isSponsorEligible(sponsor, now));
  const sorted = shuffleSponsors([...eligible].sort(compareSponsors), rotationSeed);

  const inline =
    rules.mode === "footer_only"
      ? []
      : sorted.filter((sponsor) => placementAllows(sponsor.placement, "inline"));
  const footer =
    rules.mode === "inline_only"
      ? []
      : sorted.filter((sponsor) => placementAllows(sponsor.placement, "footer"));
  const header =
    rules.mode === "header_inline_footer"
      ? sorted.filter((sponsor) => placementAllows(sponsor.placement, "header"))
      : [];

  return {
    inline,
    footer,
    header,
    weightedInlinePool: buildWeightedPool(inline, rules.maxWeight),
  };
}

export function selectSponsorsForPlacement(
  sponsors: GallerySponsor[],
  placement: SponsorDisplayPlacement,
  rulesInput?: GallerySponsorRules | ResolvedSponsorRules | null,
  context?: Pick<ComposeGalleryContext, "rotationSeed">,
): GallerySponsor[] {
  const rules = resolveSponsorRules(rulesInput);
  const normalized = normalizeSponsors(sponsors, rules, new Date(), context?.rotationSeed);
  return normalized[placement];
}

export function buildSponsorSlotId({
  placement,
  filterKey,
  slotIndex,
  mediaPosition,
  sponsorId,
}: {
  placement: SponsorDisplayPlacement;
  filterKey: string;
  slotIndex?: number;
  mediaPosition?: number;
  sponsorId: string;
}): string {
  const parts = [placement, filterKey];
  if (typeof slotIndex === "number") parts.push(String(slotIndex));
  if (typeof mediaPosition === "number") parts.push(String(mediaPosition));
  parts.push(sponsorId);
  return parts.join(":");
}

export function extractMedia(items: ComposedItem[]): GalleryMedia[] {
  return items
    .filter((item): item is ComposedMediaItem => item.kind === "media")
    .map((item) => item.data);
}

export function composedItemId(item: ComposedItem): string {
  return item.kind === "media" ? `media:${item.data.id}` : `sponsor:${item.slotId}`;
}

function sponsorForSlot(
  pool: GallerySponsor[],
  slotIndex: number,
  loop: boolean,
): GallerySponsor | undefined {
  if (!pool.length) return undefined;
  if (!loop && slotIndex >= pool.length) return undefined;
  return pool[slotIndex % pool.length];
}

function buildWeightedPool(sponsors: GallerySponsor[], maxWeight: number): GallerySponsor[] {
  return sponsors.flatMap((sponsor) => {
    const weight = Math.min(maxWeight, Math.max(1, Math.trunc(sponsor.weight ?? 1)));
    return Array.from({ length: weight }, () => sponsor);
  });
}

function compareSponsors(a: GallerySponsor, b: GallerySponsor): number {
  const priorityA = a.priority ?? Number.POSITIVE_INFINITY;
  const priorityB = b.priority ?? Number.POSITIVE_INFINITY;
  if (priorityA !== priorityB) return priorityA - priorityB;
  if (a.position !== b.position) return a.position - b.position;
  return a.public_id.localeCompare(b.public_id);
}

function shuffleSponsors(sponsors: GallerySponsor[], seed: number | undefined): GallerySponsor[] {
  if (typeof seed !== "number" || !Number.isFinite(seed) || sponsors.length < 2) {
    return sponsors;
  }

  const shuffled = [...sponsors];
  const random = seededRandom(seed);

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

function seededRandom(seed: number): () => number {
  let state = Math.trunc(Math.abs(seed) * 0xffffffff) || 1;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function isSponsorEligible(sponsor: GallerySponsor, now: Date): boolean {
  if (!sponsor.urls.asset && !sponsor.urls.poster) return false;
  if (sponsor.status === "inactive") return false;
  if (sponsor.starts_at && new Date(sponsor.starts_at) > now) return false;
  if (sponsor.ends_at && new Date(sponsor.ends_at) < now) return false;
  if (
    typeof sponsor.max_impressions === "number" &&
    sponsor.max_impressions >= 0 &&
    (sponsor.impression_count ?? 0) >= sponsor.max_impressions
  ) {
    return false;
  }
  return true;
}

function placementAllows(
  placement: SponsorPlacement | undefined,
  target: SponsorDisplayPlacement,
): boolean {
  const resolved = placement ?? "both";
  if (target === "header") return resolved === "header";
  if (target === "inline") return resolved === "inline" || resolved === "both";
  return resolved === "footer" || resolved === "both";
}

function sanitizePositiveInt(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? Math.trunc(value)
    : fallback;
}

function isSponsorMode(value: unknown): value is SponsorMode {
  return (
    value === "none" ||
    value === "footer_only" ||
    value === "inline_only" ||
    value === "inline_and_footer" ||
    value === "header_inline_footer"
  );
}
