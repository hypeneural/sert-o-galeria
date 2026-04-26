import { useEffect, type RefObject } from "react";
import type { SponsorDisplayPlacement } from "@/lib/compose-gallery";
import { trackSponsorImpression, type SponsorAnalyticsConfig } from "@/lib/sponsor-analytics";

type Options = {
  targetRef: RefObject<Element | null>;
  analytics: SponsorAnalyticsConfig;
  publicId: string;
  slotId: string;
  placement: SponsorDisplayPlacement;
  filterKey: string;
  threshold?: number;
  visibleMs?: number;
  onImpression?: () => void;
};

export function useSponsorImpression({
  targetRef,
  analytics,
  publicId,
  slotId,
  placement,
  filterKey,
  threshold = 0.5,
  visibleMs = 1000,
  onImpression,
}: Options) {
  useEffect(() => {
    const el = targetRef.current;
    if (
      !el ||
      !analytics.enabled ||
      !analytics.impressionUrl ||
      typeof IntersectionObserver === "undefined"
    ) {
      return;
    }

    const storageKey = `sponsor-impression:${slotId}`;
    try {
      if (sessionStorage.getItem(storageKey)) return;
    } catch {
      // Storage can be unavailable in private or restricted contexts.
    }

    let timer: ReturnType<typeof setTimeout> | undefined;
    let completed = false;

    const clearTimer = () => {
      if (timer) {
        clearTimeout(timer);
        timer = undefined;
      }
    };

    const complete = () => {
      if (completed) return;
      completed = true;
      clearTimer();
      try {
        sessionStorage.setItem(storageKey, "1");
      } catch {
        // Best-effort dedupe.
      }
      onImpression?.();
      trackSponsorImpression(analytics, {
        publicId,
        slotId,
        placement,
        filterKey,
        visibleRatio: threshold,
        visibleMs,
      });
    };

    const startTimer = () => {
      if (timer || completed || document.visibilityState !== "visible") return;
      timer = setTimeout(complete, visibleMs);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry || completed) return;
        if (entry.isIntersecting && entry.intersectionRatio >= threshold) {
          startTimer();
        } else {
          clearTimer();
        }
      },
      { threshold },
    );

    const onVisibilityChange = () => {
      if (document.visibilityState !== "visible") clearTimer();
    };

    observer.observe(el);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      clearTimer();
    };
  }, [
    analytics,
    filterKey,
    onImpression,
    placement,
    publicId,
    slotId,
    targetRef,
    threshold,
    visibleMs,
  ]);
}
