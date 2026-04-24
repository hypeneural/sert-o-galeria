import { Masonry } from "react-plock";

export function LoadingSkeleton() {
  // Mimics masonry layout with varied heights
  const placeholders = [1.5, 0.75, 1, 1.5, 0.75, 1, 1.3, 0.85, 1.5, 1, 0.75, 1.2];
  return (
    <Masonry
      items={placeholders}
      config={{
        columns: [2, 3, 4],
        gap: [8, 12, 14],
        media: [640, 1024, 1440],
      }}
      render={(ar, i) => (
        <div
          key={i}
          style={{ aspectRatio: ar }}
          className="w-full overflow-hidden rounded-2xl bg-muted shimmer"
          aria-hidden
        />
      )}
    />
  );
}

export function EmptyState({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon?: React.ReactNode;
}) {
  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center px-6 py-20 text-center"
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-highlight/30 text-primary">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
