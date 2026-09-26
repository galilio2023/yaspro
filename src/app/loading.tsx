export default function Loading() {
  return (
    <div className="min-h-screen bg-background pt-28 pb-20">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Title skeleton */}
        <div className="space-y-3 max-w-xl">
          <div className="h-4 w-32 rounded-full bg-white/10 animate-pulse" />
          <div className="h-10 w-80 rounded-2xl bg-white/10 animate-pulse" />
          <div className="h-4 w-96 rounded-md bg-white/5 animate-pulse" />
        </div>

        {/* Grid skeleton */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 h-64 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="h-6 w-24 rounded-full bg-white/10 animate-pulse" />
                <div className="h-7 w-48 rounded-lg bg-white/10 animate-pulse" />
                <div className="h-16 w-full rounded-md bg-white/5 animate-pulse" />
              </div>
              <div className="h-8 w-28 rounded-xl bg-white/10 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
