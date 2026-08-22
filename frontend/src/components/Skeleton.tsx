/** Reusable skeleton placeholder for cards (trip, city, activity) */
export function SkeletonCard({ imageHeight = "h-40" }: { imageHeight?: string }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
      <div className={`skeleton ${imageHeight} w-full`} />
      <div className="space-y-3 p-5">
        <div className="skeleton h-5 w-3/4" />
        <div className="skeleton h-4 w-1/2" />
        <div className="skeleton h-4 w-2/3" />
      </div>
    </article>
  );
}

/** Skeleton grid — renders N skeleton cards in a responsive grid */
export function SkeletonGrid({
  count = 3,
  cols = "sm:grid-cols-2 lg:grid-cols-3",
}: {
  count?: number;
  cols?: string;
}) {
  return (
    <div className={`grid gap-6 ${cols}`}>
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

/** Skeleton for list-style items (e.g. StopCards in itinerary builder) */
export function SkeletonList({ count = 2 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5"
        >
          <div className="flex gap-4">
            <div className="skeleton h-10 w-10 shrink-0 rounded-full" />
            <div className="flex-1 space-y-3">
              <div className="skeleton h-5 w-1/3" />
              <div className="skeleton h-4 w-1/4" />
              <div className="skeleton h-4 w-2/5" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Skeleton for hero stat cards (budget page) */
export function SkeletonStats() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }, (_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6"
        >
          <div className="skeleton h-4 w-1/3 mb-3" />
          <div className="skeleton h-8 w-1/2" />
        </div>
      ))}
    </div>
  );
}
