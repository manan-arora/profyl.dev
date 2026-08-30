"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PreparationLoader } from "@/components/leetcode/LeetcodeResultPanel";

interface SaveProcessingModalProps {
  open: boolean;
  state: "preparing" | "failed";
  onRetry: () => void;
}

export function SaveProcessingModal({
  open,
  state,
  onRetry,
}: SaveProcessingModalProps) {
  return (
    <Dialog open={open}>
      <DialogContent
        hideClose
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className="p-7 sm:p-9 font-sans text-white overflow-hidden"
      >
        {state === "preparing" ? (
          <PreparationLoader />
        ) : (
          <div className="text-center font-sans text-white">
            {/* Circular checkmark container with Amber warning badge */}
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

              <span className="absolute -bottom-0.5 -right-0.5 flex size-6 items-center justify-center border border-amber-400/40 bg-[#0D0D0D] animate-warn-in">
                <span className="font-mono text-[11px] leading-none text-amber-400">!</span>
              </span>
            </div>

            {/* Heading */}
            <h2 className="mt-7 font-display font-semibold tracking-[-0.02em] text-[clamp(1.5rem,4vw,1.875rem)] leading-[1.05] animate-rise-in [animation-delay:0.8s]">
              Update <span className="text-neon neon-text-glow italic">failed</span>
            </h2>

            {/* Error Message */}
            <p className="mt-3 text-[14px] leading-relaxed text-white/60 animate-rise-in">
              Your edits were saved, but we couldn't finish preparing your Profyl. Please check your connections and try again.
            </p>

            {/* Retry Button */}
            <div className="mt-8 animate-rise-in">
              <Button
                type="button"
                onClick={onRetry}
                variant="primary"
                className="w-full justify-center cursor-pointer"
              >
                Try again <span className="font-mono">→</span>
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
