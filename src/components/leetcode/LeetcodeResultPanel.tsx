"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface LeetcodeResultPanelProps {
  state: "verifying-success-show" | "preparing" | "failed";
  onRetry?: () => void;
}

const PHRASES = [
  "SYNCING YOUR CODING ACTIVITY...",
  "READING BETWEEN THE COMMITS...",
  "CONNECTING THE DOTS...",
  "DOING SOME NERD MATH...",
  "CRUNCHING THE SIGNALS...",
  "ADDING A LITTLE AI MAGIC...",
  "BUILDING YOUR PROFYL..."
];

export function PreparationLoader() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % PHRASES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center text-center">
      {/* Visual Animation - Scaled up proportionally by ~1.5x */}
      <div className="relative size-36 w-36 h-36 flex items-center justify-center">
        {/* Outer rotating dashed ring */}
        <div className="absolute inset-0 rounded-full border border-dashed border-[#c7ff41]/20 animate-spin-slow" />
        
        {/* Inner rotating square/diamond */}
        <div className="absolute size-16 border border-[#c7ff41]/50 rotate-45 animate-spin-reverse-medium" />
        
        {/* Pulsing center core */}
        <div className="absolute size-4 bg-[#c7ff41] rounded-full animate-ping-slow" />
        <div className="absolute size-2 bg-[#c7ff41] rounded-full" />
      </div>

      {/* Heading matching "LeetCode verified" typography style */}
      <h2 className="mt-7 font-display font-semibold tracking-[-0.02em] text-[clamp(1.5rem,4vw,1.875rem)] leading-[1.05] animate-rise-in [animation-delay:0.8s] text-white">
        Preparing your <span className="text-[#c7ff41] neon-text-glow italic">Profyl</span>
      </h2>

      {/* Rotating technical phrase in monospace/technical style */}
      <div className="mt-4 overflow-hidden relative h-6 w-[320px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={index}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute inset-0 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--neon)] text-center select-none"
          >
            {PHRASES[index]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Subdued time expectation helper text */}
      <p className="mt-3.5 text-[12px] text-white/45 font-sans tracking-normal font-normal">
        This may take a minute or two.
      </p>
    </div>
  );
}

export function LeetcodeResultPanel({
  state,
  onRetry,
}: LeetcodeResultPanelProps) {
  if (state === "preparing") {
    return <PreparationLoader />;
  }

  const showWarn = state === "failed";

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
      {state === "verifying-success-show" && (
        <p className="mt-3 text-[14px] leading-relaxed text-white/60 animate-rise-in [animation-delay:0.95s]">
          Your LeetCode profile has been connected and your coding data is ready.
        </p>
      )}

      {state === "failed" && (
        <>
          <p className="mt-3 text-[14px] leading-relaxed text-white/60 animate-rise-in">
            {"Couldn't finish preparing your Profyl. Please check your connections and try again."}
          </p>
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
        </>
      )}
    </div>
  );
}
