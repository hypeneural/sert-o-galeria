import { describe, expect, it } from "vitest";
import { composeGallery, composedItemId, type ComposedSponsorItem } from "./compose-gallery";
import type { GalleryMedia, GallerySponsor } from "./gallery-media";

function media(count: number): GalleryMedia[] {
  return Array.from({ length: count }, (_, index) => {
    const id = `media-${index + 1}`;
    return {
      id,
      type: "photo",
      width: 1200,
      height: 800,
      aspectRatio: 1.5,
      thumbUrl: `/${id}-thumb.jpg`,
      gridUrl: `/${id}-grid.jpg`,
      previewUrl: `/${id}-preview.jpg`,
      createdAt: "2026-04-25T00:00:00Z",
    };
  });
}

function sponsor(id: string, overrides: Partial<GallerySponsor> = {}): GallerySponsor {
  return {
    public_id: id,
    media_type: "image",
    mime_type: "image/jpeg",
    position: Number(id.replace(/\D/g, "")) || 1,
    duration_seconds: 10,
    display_duration_seconds: 10,
    playback_mode: "image_timer",
    width: null,
    height: null,
    orientation: null,
    urls: {
      asset: `/sponsor-${id}.jpg`,
      poster: null,
    },
    ...overrides,
  };
}

function inlineSponsors(items: ReturnType<typeof composeGallery>) {
  return items.items.filter((item): item is ComposedSponsorItem => item.kind === "sponsor");
}

describe("composeGallery", () => {
  it("returns only media when there are no sponsors", () => {
    const composed = composeGallery(media(6), []);

    expect(composed.items).toHaveLength(6);
    expect(composed.footerSponsors).toHaveLength(0);
    expect(composed.items.every((item) => item.kind === "media")).toBe(true);
  });

  it("keeps sponsors in the footer when there are fewer than five media items", () => {
    const sponsors = [sponsor("s1"), sponsor("s2")];
    const composed = composeGallery(media(3), sponsors);

    expect(inlineSponsors(composed)).toHaveLength(0);
    expect(composed.footerSponsors.map((item) => item.public_id)).toEqual(["s1", "s2"]);
  });

  it("inserts sponsors after media 5 and 10 for 12 media items", () => {
    const sponsors = [sponsor("s1"), sponsor("s2"), sponsor("s3")];
    const composed = composeGallery(media(12), sponsors);
    const inline = inlineSponsors(composed);

    expect(inline.map((item) => item.data.public_id)).toEqual(["s1", "s2"]);
    expect(inline.map((item) => item.afterMediaId)).toEqual(["media-5", "media-10"]);
    expect(composed.footerSponsors.map((item) => item.public_id)).toEqual(["s3"]);
  });

  it("loops sponsors with unique slot ids when there are more slots than sponsors", () => {
    const sponsors = [sponsor("s1"), sponsor("s2"), sponsor("s3")];
    const composed = composeGallery(media(50), sponsors);
    const inline = inlineSponsors(composed);
    const keys = inline.map(composedItemId);

    expect(inline).toHaveLength(10);
    expect(inline.map((item) => item.data.public_id).slice(0, 5)).toEqual([
      "s1",
      "s2",
      "s3",
      "s1",
      "s2",
    ]);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("sends sponsors without inline slots to the footer", () => {
    const sponsors = [
      sponsor("s1"),
      sponsor("s2"),
      sponsor("s3"),
      sponsor("s4"),
      sponsor("s5"),
      sponsor("s6"),
    ];
    const composed = composeGallery(media(15), sponsors);

    expect(inlineSponsors(composed).map((item) => item.data.public_id)).toEqual(["s1", "s2", "s3"]);
    expect(composed.footerSponsors.map((item) => item.public_id)).toEqual(["s4", "s5", "s6"]);
  });

  it("honors sponsor weight in the rotation pool", () => {
    const sponsors = [sponsor("s1", { weight: 2 }), sponsor("s2", { weight: 1 })];
    const composed = composeGallery(media(15), sponsors);

    expect(inlineSponsors(composed).map((item) => item.data.public_id)).toEqual(["s1", "s1", "s2"]);
  });

  it("does not put footer-only sponsors inline", () => {
    const sponsors = [sponsor("s1", { placement: "footer" }), sponsor("s2", { placement: "both" })];
    const composed = composeGallery(media(5), sponsors);

    expect(inlineSponsors(composed).map((item) => item.data.public_id)).toEqual(["s2"]);
    expect(composed.footerSponsors.map((item) => item.public_id)).toEqual(["s1"]);
  });

  it("uses mediaStartIndex to keep slot continuity", () => {
    const composed = composeGallery(media(5), [sponsor("s1")], {
      context: {
        filterKey: "todos",
        mediaStartIndex: 30,
      },
    });
    const [inline] = inlineSponsors(composed);

    expect(inline?.slotIndex).toBe(6);
    expect(inline?.slotId).toBe("inline:todos:6:35:s1");
  });

  it("supports footer-only mode for favorites", () => {
    const sponsors = [sponsor("s1"), sponsor("s2")];
    const composed = composeGallery(media(10), sponsors, {
      rules: { mode: "footer_only" },
    });

    expect(inlineSponsors(composed)).toHaveLength(0);
    expect(composed.footerSponsors.map((item) => item.public_id)).toEqual(["s1", "s2"]);
  });
});
