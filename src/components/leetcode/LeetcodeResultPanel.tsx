"use client";

import { Button } from "@/components/ui/button";

interface LeetcodeResultPanelProps {
  state: "syncing" | "success" | "sync-failed";
  onRetry?: () => void;
}

export function LeetcodeResultPanel({
  state,
  onRetry,
}: LeetcodeResultPanelProps) {
  const showWarn = state === "sync-failed";

  return (
    <div className="text-center font-sans text-white">
      {/* Circular checkmark container */}
      <div className="relative mx-auto size-20 w-20 h-20 shrink-0">
        <svg viewBox="0 0 64 64" className="size-20 w-20 h-20 -rotate-90 block" aria-hidden="true">
          <circle cx="32" cy="32" r="28" className="stroke-white/10" strokeWidth="1.5" fill="none" />
          <circle
            cx="32"
            cy="32"
            r="28"
            className="animate-ring-draw"
            stroke="#c7ff41"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="square"
          />
        </svg>
        <svg viewBox="0 0 64 64" className="absolute inset-0 size-20 w-20 h-20 block" aria-hidden="true">
          <path
            d="M21 33.5L28.5 41L43 25"
            className="animate-check-draw"
            stroke="#c7ff41"
            strokeWidth="2"
            fill="none"
            strokeLinecap="square"
            strokeLinejoin="miter"
          />
        </svg>

        {/* Warning Badge (Amber circle with !) */}
        {showWarn && (
          <span className="absolute -bottom-0.5 -right-0.5 flex size-6 items-center justify-center border border-amber-400/40 bg-[#0D0D0D] animate-warn-in">
            <span className="font-mono text-[11px] leading-none text-amber-400">!</span>
          </span>
        )}
      </div>

      {/* Heading */}
      <h2 className="mt-7 font-display font-semibold tracking-[-0.02em] text-[clamp(1.5rem,4vw,1.875rem)] leading-[1.05] animate-rise-in [animation-delay:0.8s]">
        LeetCode <span className="text-neon neon-text-glow italic">verified</span>
      </h2>

      {/* State content */}
      {state === "syncing" && (
        <div className="mt-4 flex items-center justify-center gap-2.5 animate-rise-in [animation-delay:0.95s]">
          <span className="inline-block size-3.5 border border-white/15 border-t-[#c7ff41] rounded-full animate-spin shrink-0" />
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/50">
            Syncing your LeetCode data…
          </span>
        </div>
      )}

      {state === "success" && (
        <>
          <p className="mt-3 text-[14px] leading-relaxed text-white/60 animate-rise-in">
            Your LeetCode profile has been connected and your coding data is ready.
          </p>
          <div className="mt-8 animate-rise-in">
            <div className="h-px w-full bg-white/10 overflow-hidden">
              <div className="h-px w-full bg-[#c7ff41]/70 animate-bar-fill" />
            </div>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-white/40">
              Preparing your Profyl…
            </p>
          </div>
        </>
      )}

      {state === "sync-failed" && (
        <>
          <p className="mt-3 text-[14px] leading-relaxed text-white/60 animate-rise-in">
            {"Your account was verified, but we couldn't sync your LeetCode data right now."}
          </p>
          <div className="mt-8 animate-rise-in">
            <Button
              type="button"
              onClick={onRetry}
              variant="primary"
              className="w-full justify-center cursor-pointer"
            >
              Retry sync <span className="font-mono">→</span>
            </Button>
            <p className="mt-4 text-[11px] leading-relaxed text-white/35">
              {"You won't need to verify your account again."}
            </p>
          </div>
        </>
      )}
    </div>
  );
}

