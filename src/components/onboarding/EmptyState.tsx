interface EmptyStateProps {
  onResync?: () => void;
}

export function EmptyState({ onResync }: EmptyStateProps) {
  return (
    <div className="border hairline bg-[#0D0D0D] px-8 py-20 text-center">
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/35">
        No signal detected
      </div>
      <h2 className="mt-5 font-display font-semibold tracking-tight text-2xl text-white">
        No repositories found
      </h2>
      <p className="mt-3 text-sm text-white/50 max-w-md mx-auto leading-relaxed">
        We couldn't find any eligible public repositories in your GitHub account.
      </p>
      {onResync && (
        <button
          type="button"
          onClick={onResync}
          className="mt-8 inline-flex items-center gap-2 border border-white/15 px-5 py-3 text-sm font-medium hover:border-neon hover:text-neon text-white transition cursor-pointer"
        >
          Re-sync GitHub <span className="font-mono">↻</span>
        </button>
      )}
    </div>
  );
}
