function SkeletonCard() {
  return (
    <li className="rounded-lg border border-black/10 dark:border-white/10 p-4">
      <div className="animate-pulse flex flex-col gap-3">
        <div className="h-4 w-2/3 rounded bg-black/10 dark:bg-white/10" />
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-full bg-black/10 dark:bg-white/10" />
          <div className="h-3 w-32 rounded bg-black/10 dark:bg-white/10" />
        </div>
        <div className="h-3 w-full rounded bg-black/10 dark:bg-white/10" />
        <div className="h-3 w-5/6 rounded bg-black/10 dark:bg-white/10" />
        <div className="flex gap-2">
          <div className="h-6 w-16 rounded-full bg-black/10 dark:bg-white/10" />
          <div className="h-6 w-10 rounded-full bg-black/10 dark:bg-white/10" />
          <div className="h-6 w-20 rounded-full bg-black/10 dark:bg-white/10" />
        </div>
      </div>
    </li>
  );
}

/** Placeholder com a forma dos cartões do feed, para a espera parecer mais curta. */
export default function FeedSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="animate-pulse flex flex-col gap-2">
        <div className="h-7 w-48 rounded bg-black/10 dark:bg-white/10" />
        <div className="h-4 w-72 max-w-full rounded bg-black/10 dark:bg-white/10" />
      </div>
      <div className="animate-pulse flex gap-2">
        <div className="h-8 w-32 rounded-full bg-black/10 dark:bg-white/10" />
        <div className="h-8 w-28 rounded-full bg-black/10 dark:bg-white/10" />
      </div>
      <ul className="flex flex-col gap-3">
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </ul>
    </div>
  );
}
