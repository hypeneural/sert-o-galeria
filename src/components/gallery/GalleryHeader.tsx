import { Share2, SlidersHorizontal } from "lucide-react";
import logo from "@/assets/ambssl-logo.png";
import { toast } from "sonner";
import type { GalleryManifest } from "@/lib/gallery-media";

type Props = {
  onOpenFilters: () => void;
  manifest?: GalleryManifest;
};

export function GalleryHeader({ onOpenFilters, manifest }: Props) {
  const title = manifest?.event.title ?? "Galeria AMBSSL";
  const subtitle = manifest?.event.location_name ?? "Sertão de Santa Luzia";
  const mediaCount = manifest?.gallery.public_media_count;
  const logoUrl = manifest?.event.branding.logo_url;

  const handleShare = async () => {
    const shareUrl = manifest?.event.links.public_gallery_share_url ?? window.location.href;
    const shareData = {
      title,
      text: manifest?.event.description ?? "Fotos e vídeos da comunidade",
      url: shareUrl,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast.success("Link copiado para a área de transferência");
      }
    } catch {
      // user cancelled
    }
  };

  return (
    <header className="sticky top-0 z-30 glass-bar border-b border-border safe-top">
      <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-2.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary/5">
          <img
            src={logoUrl ?? logo}
            alt={`Logo ${title}`}
            width={40}
            height={40}
            className="h-9 w-9 object-contain"
            crossOrigin={logoUrl ? "anonymous" : undefined}
          />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[15px] font-semibold leading-tight text-foreground">
            {title}
          </h1>
          <p className="truncate text-[11px] leading-tight text-muted-foreground">
            {subtitle}
            {mediaCount != null && ` · ${mediaCount} mídias`}
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenFilters}
          aria-label="Abrir filtros"
          className="flex h-9 w-9 items-center justify-center rounded-full text-foreground/80 transition-colors hover:bg-accent active:scale-95"
        >
          <SlidersHorizontal className="h-[18px] w-[18px]" />
        </button>
        <button
          type="button"
          onClick={handleShare}
          aria-label="Compartilhar galeria"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-highlight text-highlight-foreground shadow-sm transition-transform active:scale-95"
        >
          <Share2 className="h-[18px] w-[18px]" />
        </button>
      </div>
    </header>
  );
}
