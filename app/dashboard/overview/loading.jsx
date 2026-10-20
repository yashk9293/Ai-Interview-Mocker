// The home screen's final layout with each value as a flat grey bar at its
// real size, so nothing shifts when the data lands.
const bar = "rounded bg-raised";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl" role="status" aria-label="Loading your practice">
      <div className="mb-6">
        <div className={`${bar} h-7 w-48`} />
        <div className={`${bar} mt-2 h-5 w-80 max-w-full`} />
      </div>
      <div className="grid grid-cols-12 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="col-span-6 h-[128px] rounded-lg bg-surface p-4 lg:col-span-3">
            <div className={`${bar} h-4 w-24`} />
            <div className={`${bar} mt-10 h-6 w-16`} />
          </div>
        ))}
        <div className="col-span-12 h-[300px] rounded-lg bg-surface lg:col-span-9" />
        <div className="col-span-12 h-[300px] rounded-lg bg-surface lg:col-span-3" />
        <div className="col-span-12 h-[360px] rounded-lg bg-surface" />
      </div>
    </div>
  );
}
