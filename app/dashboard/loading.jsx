// The Dashboard's final layout with grey blocks at the real size of the
// title and the interview cards, so nothing shifts when the data lands.
const bar = "rounded bg-raised";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl" role="status" aria-label="Loading your interviews">
      <div className="mb-6">
        <div className={`${bar} h-7 w-40`} />
        <div className={`${bar} mt-2 h-5 w-96 max-w-full`} />
      </div>
      <div className="rounded-lg border border-line bg-surface p-5">
        <div className={`${bar} mb-4 h-4 w-32`} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-[230px] rounded-xl border border-line bg-white" />
          ))}
        </div>
      </div>
    </div>
  );
}
