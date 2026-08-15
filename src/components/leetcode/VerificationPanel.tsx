"use client";

import { useState } from "react";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { generateLeetcodeVerificationTokenAction, verifyLeetcodeOwnershipAction } from "@/app/onboarding/actions";
import { toast } from "sonner";

interface VerificationPanelProps {
  onVerify?: () => void;
}

export function VerificationPanel({ onVerify }: VerificationPanelProps) {
  const [username, setUsername] = useState("");
  const [token, setToken] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [copied, setCopied] = useState(false);

  const steps = [
    "Generate and copy the verification code above.",
    "Open your LeetCode profile and edit your README.",
    "Paste the code into your README and save.",
    "Return here and click Verify.",
  ];

  const handleGenerate = async () => {
    const trimmed = username.trim();
    if (!trimmed) {
      toast.error("LeetCode username is required");
      return;
    }

    setIsGenerating(true);
    try {
      const generatedToken = await generateLeetcodeVerificationTokenAction(trimmed);
      setToken(generatedToken);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to generate token. Please try again.";
      toast.error(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!token) return;
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy token:", err);
    }
  };

  const handleVerifyClick = async () => {
    const trimmed = username.trim();
    if (!trimmed) {
      toast.error("LeetCode username is required");
      return;
    }

    setIsVerifying(true);
    try {
      await verifyLeetcodeOwnershipAction(trimmed);
      toast.success("LeetCode account verified successfully!");
      if (onVerify) {
        onVerify();
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Verification failed. Please try again.";
      toast.error(message);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div>
      <DialogHeader className="flex flex-col">
        {/* Heading */}
        <DialogTitle className="mt-1 font-display font-semibold tracking-[-0.02em] text-[clamp(1.5rem,4vw,1.875rem)] leading-[1.05] text-white">
          Verify your <span className="text-[var(--neon)] neon-text-glow italic">LeetCode</span> account
        </DialogTitle>

        {/* Description */}
        <DialogDescription className="mt-3 max-w-[340px] text-[14px] leading-relaxed text-white/60">
          Please add the verification code to your LeetCode profile README to prove your identity.
        </DialogDescription>
      </DialogHeader>

      {/* Username Input */}
      <div className="mt-6 flex flex-col gap-2">
        <label htmlFor="leetcode-username" className="text-[11px] font-semibold uppercase tracking-wider text-white/40">
          LeetCode Username
        </label>
        <input
          id="leetcode-username"
          type="text"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={isGenerating}
          required
          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/35 focus:outline-none focus:border-[var(--neon)] focus:ring-1 focus:ring-[var(--neon)] font-sans text-sm transition disabled:opacity-50"
        />
      </div>

      {/* Token Container */}
      <div className="mt-6 flex flex-col gap-2">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-white/40">
          Verification Code
        </label>
        <div className="flex items-center gap-2">
          {/* Token Box */}
          <div className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg flex items-center justify-between font-mono text-sm text-white/90 min-w-0">
            <span className={token ? "text-[var(--neon)] select-all truncate" : "text-white/60 truncate"}>
              {token || "PROFYL-XXXXXXXX"}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              disabled={!token || isGenerating}
              className="p-1 hover:bg-white/5 rounded text-white/50 hover:text-white disabled:pointer-events-none disabled:opacity-30 transition flex items-center justify-center shrink-0 cursor-pointer"
              title="Copy Token"
            >
              {copied ? (
                <Check className="size-4 text-[var(--neon)] animate-pulse-neon" />
              ) : (
                <Copy className="size-4" />
              )}
            </button>
          </div>

          {/* Generate Code / Regenerate Button */}
          <Button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || !username.trim()}
            variant={token ? "outline" : "primary"}
            className="shrink-0 text-xs py-2 px-3 h-10 min-w-[110px]"
          >
            {isGenerating ? "Generating..." : token ? "Regenerate" : "Generate Code"}
          </Button>
        </div>
      </div>

      {/* Steps */}
      <div className="mt-6 space-y-3">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center gap-2.5">
            <span className="mt-0.5 size-5 flex items-center justify-center bg-white/5 border border-white/10 rounded text-[11px] font-mono text-[var(--neon)] font-bold shrink-0">
              {index + 1}
            </span>
            <span className="text-[13px] text-white/80">{step}</span>
          </div>
        ))}
      </div>

      {/* Footer Note */}
      <p className="mt-5 text-[11px] leading-relaxed text-white/35">
        You can safely remove the code from your README once verified.
      </p>

      {/* Actions */}
      <div className="mt-5">
        <Button
          type="button"
          onClick={handleVerifyClick}
          disabled={!token || isGenerating || isVerifying}
          variant="primary"
          className="w-full"
        >
          {isVerifying ? "Verifying..." : "Verify LeetCode Account"}
        </Button>
      </div>
    </div>
  );
}
