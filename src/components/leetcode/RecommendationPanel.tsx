"use client";

import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface RecommendationPanelProps {
  onConnect: () => void;
  onSkip: () => void;
}

export function RecommendationPanel({
  onConnect,
  onSkip,
}: RecommendationPanelProps) {
  const benefits = [
    "Showcase your problem-solving skills",
    "Improve your Profyl Score",
    "Unlock contest insights",
  ];

  return (
    <div>
      <DialogHeader className="flex flex-col">
        {/* Heading */}
        <DialogTitle className="mt-1 font-display font-semibold tracking-[-0.02em] text-[clamp(1.5rem,4vw,1.875rem)] leading-[1.05] text-white">
          Complete your first <span className="text-[var(--neon)] neon-text-glow italic">Profyl</span>
        </DialogTitle>

        {/* Description */}
        <DialogDescription className="mt-3 max-w-[340px] text-[14px] leading-relaxed text-white/60">
          Connect your LeetCode account to:
        </DialogDescription>
      </DialogHeader>

      {/* Benefits */}
      <div className="mt-6 space-y-3">
        {benefits.map((benefit) => (
          <div key={benefit} className="flex items-start gap-2.5">
            <span className="mt-1.5 size-1.5 bg-[var(--neon)] rounded-full shrink-0" />
            <span className="text-[13px] text-white/80 leading-snug">{benefit}</span>
          </div>
        ))}
      </div>

      {/* Footer Note */}
      <p className="mt-5 text-[11px] leading-relaxed text-white/35">
        LeetCode verification is required before publishing your public profile. You can always do this later.
      </p>

      {/* Actions */}
      <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <Button
          type="button"
          onClick={onConnect}
          variant="primary"
        >
          Connect LeetCode <span className="font-mono">→</span>
        </Button>
        <Button
          type="button"
          onClick={onSkip}
          variant="outline"
        >
          Skip for now
        </Button>
      </div>
    </div>
  );
}
