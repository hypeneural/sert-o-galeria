import { useMemo, useRef, useState, type RefObject } from "react";
import type { GallerySponsor } from "@/lib/gallery-media";
import { buildSponsorSlotId } from "@/lib/compose-gallery";
import { useSponsorImpression } from "@/hooks/use-sponsor-impression";
import {
  getSafeSponsorHref,
  trackSponsorClick,
  type SponsorAnalyticsConfig,
} from "@/lib/sponsor-analytics";

type Props = {
  sponsors: GallerySponsor[];
  filterKey: string;
  analytics: SponsorAnalyticsConfig;
};

export function SponsorFooter({ sponsors, filterKey, analytics }: Props) {
  if (sponsors.length === 0) return null;

  return (
    <section className="mx-auto mt-8 max-w-3xl px-3 pb-8">
      <h3 className="mb-4 text-center text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">
        Apoiadores do evento
      </h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {sponsors.map((sponsor) => (
          <SponsorFooterItem
            key={sponsor.public_id}
            sponsor={sponsor}
            filterKey={filterKey}
            analytics={analytics}
          />
        ))}
      </div>
    </section>
  );
}

function SponsorFooterItem({
  sponsor,
  filterKey,
  analytics,
}: {
  sponsor: GallerySponsor;
  filterKey: string;
  analytics: SponsorAnalyticsConfig;
}) {
  const ref = useRef<HTMLAnchorElement | HTMLDivElement>(null);
  const [errored, setErrored] = useState(false);
  const slotId = buildSponsorSlotId({
    placement: "footer",
    filterKey,
    sponsorId: sponsor.public_id,
  });

  useSponsorImpression({
    targetRef: ref,
    analytics,
    publicId: sponsor.public_id,
    slotId,
    placement: "footer",
    filterKey,
  });

  const href = useMemo(() => getSafeSponsorHref(sponsor.link_url), [sponsor.link_url]);
  const imageSrc = sponsor.media_type === "video" ? sponsor.urls.poster : sponsor.urls.asset;
  const aspectRatio =
    sponsor.width && sponsor.height ? `${sponsor.width} / ${sponsor.height}` : "16 / 9";
  const alt = sponsor.alt_text ?? sponsor.name ?? "Apoiador";

  const content =
    imageSrc && !errored ? (
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
        className="h-full w-full object-contain"
        crossOrigin="anonymous"
      />
    ) : (
      <div className="flex h-full w-full items-center justify-center px-3 text-center text-xs font-medium text-muted-foreground">
        Apoiador
      </div>
    );

  const className =
    "block overflow-hidden rounded-xl bg-muted/50 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

  if (href) {
    return (
      <a
        ref={ref as RefObject<HTMLAnchorElement>}
        href={href}
        target="_blank"
        rel="sponsored noopener noreferrer"
        className={className}
        style={{ aspectRatio }}
        onClick={() =>
          trackSponsorClick(analytics, {
            publicId: sponsor.public_id,
            slotId,
            placement: "footer",
            filterKey,
            href,
          })
        }
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
