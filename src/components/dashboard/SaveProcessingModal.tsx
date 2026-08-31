"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PreparationLoader } from "@/components/leetcode/LeetcodeResultPanel";

interface SaveProcessingModalProps {
  open: boolean;
  state: "preparing" | "failed";
  errorMessage?: string | null;
  onRetry: () => void;
}

export function SaveProcessingModal({
  open,
  state,
  errorMessage,
  onRetry,
}: SaveProcessingModalProps) {
  return (
    <Dialog open={open}>
      <DialogContent
        hideClose
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className="p-5 sm:p-9 font-sans text-white overflow-hidden max-w-[90vw] sm:max-w-md"
      >
        {state === "preparing" ? (
          <PreparationLoader />
        ) : (
          <div className="text-center font-sans text-white">
            {/* Warning triangle icon */}
            <div className="relative mx-auto size-20 w-20 h-20 shrink-0 flex items-center justify-center animate-warn-in">
              <svg
                viewBox="0 0 24 24"
                className="size-20 w-20 h-20 text-amber-500/80 stroke-current fill-amber-500/5"
                strokeWidth="1.0"
                strokeLinecap="square"
                strokeLinejoin="miter"
                aria-hidden="true"
              >
                <path d="M12 3 L22 20 H2 Z" />
                <line x1="12" y1="8" x2="12" y2="13" strokeWidth="1.0" />
                <line x1="12" y1="16.5" x2="12" y2="16.5" strokeWidth="1.0" />
              </svg>
            </div>

            {/* Heading */}
            <h2 className="mt-7 font-display font-semibold tracking-[-0.02em] text-[clamp(1.5rem,4vw,1.875rem)] leading-[1.05] animate-rise-in [animation-delay:0.8s]">
              Update <span className="text-neon neon-text-glow italic">failed</span>
            </h2>

            {/* Error Message */}
            <p className="mt-3 text-[14px] leading-relaxed text-white/60 animate-rise-in">
              {errorMessage || "Your edits were saved, but we couldn't finish preparing your Profyl. Please check your connections and try again."}
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
