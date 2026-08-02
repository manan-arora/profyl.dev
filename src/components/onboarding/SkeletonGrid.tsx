export function SkeletonGrid() {
  return (
    <div className="grid gap-px bg-white/[0.07] border hairline sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-[#0D0D0D] p-6 min-h-[210px] flex flex-col">
          <div className="flex items-start justify-between">
            <div className="w-full">
              <div className="h-4 w-1/2 bg-white/[0.07] animate-pulse-neon" />
              <div className="mt-3 h-2.5 w-20 bg-white/[0.05] animate-pulse-neon" />
            </div>
            <div className="size-5 border border-white/10" />
          </div>
          <div className="mt-6 space-y-2">
            <div className="h-2.5 w-full bg-white/[0.05] animate-pulse-neon" />
            <div className="h-2.5 w-4/5 bg-white/[0.05] animate-pulse-neon" />
          </div>
          <div className="mt-auto pt-6 flex gap-1.5">
            <div className="h-5 w-14 bg-white/[0.05]" />
            <div className="h-5 w-12 bg-white/[0.05]" />
          </div>
        </div>
      ))}
    </div>
  );
}
