import type { SponsorDisplayPlacement } from "./compose-gallery";

export type SponsorAnalyticsConfig = {
  enabled: boolean;
  impressionUrl?: string | null;
  clickUrl?: string | null;
};

export type SponsorAnalyticsPayload = {
  publicId: string;
  slotId: string;
  placement: SponsorDisplayPlacement;
  filterKey: string;
  href?: string;
  visibleRatio?: number;
  visibleMs?: number;
};

export function getSafeSponsorHref(href: string | null | undefined): string | null {
  if (!href) return null;
  try {
    const url = new URL(href);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export function trackSponsorImpression(
  config: SponsorAnalyticsConfig,
  payload: SponsorAnalyticsPayload,
) {
  sendSponsorEvent(config.impressionUrl, config, {
    public_id: payload.publicId,
    slot_id: payload.slotId,
    placement: payload.placement,
    filter_key: payload.filterKey,
    visible_ratio: payload.visibleRatio ?? 0.5,
    visible_ms: payload.visibleMs ?? 1000,
  });
}

export function trackSponsorClick(
  config: SponsorAnalyticsConfig,
  payload: SponsorAnalyticsPayload,
) {
  sendSponsorEvent(config.clickUrl, config, {
    public_id: payload.publicId,
    slot_id: payload.slotId,
    placement: payload.placement,
    filter_key: payload.filterKey,
    href: payload.href,
  });
}

function sendSponsorEvent(
  url: string | null | undefined,
  config: SponsorAnalyticsConfig,
  body: Record<string, unknown>,
) {
  if (!config.enabled || !url || typeof window === "undefined") return;

  const json = JSON.stringify(body);
  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    const sent = navigator.sendBeacon(url, new Blob([json], { type: "application/json" }));
    if (sent) return;
  }

  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: json,
    keepalive: true,
  }).catch(() => {
    // Analytics failure must not affect gallery rendering.
  });
}
