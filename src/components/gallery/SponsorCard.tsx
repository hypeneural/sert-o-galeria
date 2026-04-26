import { useMemo, useRef, useState, type RefObject } from "react";
import type { ComposedSponsorItem } from "@/lib/compose-gallery";
import { useSponsorImpression } from "@/hooks/use-sponsor-impression";
import {
  getSafeSponsorHref,
  trackSponsorClick,
  type SponsorAnalyticsConfig,
} from "@/lib/sponsor-analytics";

type Props = {
  item: ComposedSponsorItem;
  filterKey: string;
  analytics: SponsorAnalyticsConfig;
};

export function SponsorCard({ item, filterKey, analytics }: Props) {
  const sponsor = item.data;
  const ref = useRef<HTMLAnchorElement | HTMLDivElement>(null);
  const [impressed, setImpressed] = useState(false);
  const [errored, setErrored] = useState(false);

  useSponsorImpression({
    targetRef: ref,
    analytics,
    publicId: sponsor.public_id,
    slotId: item.slotId,
    placement: item.placement,
    filterKey,
    onImpression: () => setImpressed(true),
  });

  const href = useMemo(() => getSafeSponsorHref(sponsor.link_url), [sponsor.link_url]);
  const imageSrc = sponsor.media_type === "video" ? sponsor.urls.poster : sponsor.urls.asset;
  const aspectRatio =
    sponsor.width && sponsor.height ? `${sponsor.width} / ${sponsor.height}` : "16 / 9";
  const alt = sponsor.alt_text ?? sponsor.name ?? "Apoiador do evento";

  const content = (
    <>
      {imageSrc && !errored ? (
        <img
          src={imageSrc}
          srcSet={sponsor.responsive_sources?.srcset}
          sizes={sponsor.responsive_sources?.sizes}
          alt={alt}
          loading="lazy"
          decoding="async"
          width={sponsor.width ?? 1280}
          height={sponsor.height ?? 720}
          onError={() => setErrored(true)}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          crossOrigin="anonymous"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-muted px-4 text-center text-xs font-medium text-muted-foreground">
          Apoiador do evento
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent px-3 pb-2 pt-6">
        <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
          Apoiador do evento
        </span>
      </div>

      {impressed && (
        <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-highlight/20" />
      )}
    </>
  );

  const className =
    "group relative block overflow-hidden rounded-2xl bg-muted shadow-card outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

  if (href) {
    return (
      <a
        ref={ref as RefObject<HTMLAnchorElement>}
        href={href}
        target="_blank"
        rel="sponsored noopener noreferrer"
        className={className}
        style={{ aspectRatio }}
        onClick={() => {
          trackSponsorClick(analytics, {
            publicId: sponsor.public_id,
            slotId: item.slotId,
            placement: item.placement,
            filterKey,
            href,
          });
        }}
      >
        {content}
      </a>
    );
  }

  return (
    <div
      ref={ref as RefObject<HTMLDivElement>}
      className={className}
      style={{ aspectRatio }}
      aria-label={alt}
    >
      {content}
    </div>
  );
}
