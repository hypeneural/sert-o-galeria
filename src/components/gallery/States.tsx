export function LoadingSkeleton() {
  // Mimics the grid: a few aspect-ratio cards
  const placeholders = [1.5, 0.75, 1, 1.5, 0.75, 1, 1.5, 1, 0.75, 1, 1.5, 0.75];
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-4">
      {placeholders.map((ar, i) => (
        <div
          key={i}
          style={{ aspectRatio: ar }}
          className="w-full overflow-hidden rounded-2xl bg-muted shimmer"
          aria-hidden
        />
      ))}
    </div>
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
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-highlight/30 text-primary">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
