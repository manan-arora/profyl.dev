"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Copy, Check, X } from "lucide-react";
import { useDashboard } from "./DashboardContext";
import { toast } from "sonner";

export default function PublishSuccessModal() {
  const { user, showFirstPublishModal, closeFirstPublishModal } = useDashboard();
  const [copied, setCopied] = useState(false);

  if (!showFirstPublishModal) return null;

  const publicUrlText = `profyl.dev/${user.slug}`;

  const handleCopy = async () => {
    try {
      const fullUrl = typeof window !== "undefined"
        ? `${window.location.origin}/${user.slug}`
        : `https://profyl.dev/${user.slug}`;
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      toast.success("Profyl URL copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Blurred overlay backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md animate-fade-in"
        onClick={closeFirstPublishModal}
      />

      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md border border-white/[0.08] bg-[#0F0F0F] rounded-none p-8 sm:p-10 shadow-2xl scan-line text-center select-none overflow-hidden"
      >
        {/* Visual corner indicators */}
        <span className="absolute size-3 border-neon -top-px -left-px border-t border-l pointer-events-none" />
        <span className="absolute size-3 border-neon -bottom-px -right-px border-b border-r pointer-events-none" />

        {/* Dismiss X button */}
        <button
          type="button"
          onClick={closeFirstPublishModal}
          aria-label="Close modal"
          className="absolute top-4 right-4 text-white/40 hover:text-white transition cursor-pointer p-1 font-mono"
        >
          <X className="size-4" />
        </button>


        {/* Checkmark + Confetti accent container (reusing exact LeetcodeResultPanel checkmark dimensions) */}
        <div className="relative mx-auto size-20 w-20 h-20 shrink-0 mb-6">
          {/* Confetti SVG Accent originating directly from behind checkmark center */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
            <Image
              src="/Confetti Profyl.svg"
              alt=""
              width={260}
              height={260}
              className="size-64 max-w-none object-contain opacity-90"
              priority
            />
          </div>

          {/* Reused LeetCode verification animated checkmark */}
          <svg viewBox="0 0 64 64" className="absolute inset-0 size-20 w-20 h-20 -rotate-90 block z-10" aria-hidden="true">
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
          <svg viewBox="0 0 64 64" className="absolute inset-0 size-20 w-20 h-20 block z-10" aria-hidden="true">
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
        </div>

        {/* Main Heading */}
        <h3 className="font-display font-semibold tracking-[-0.02em] text-3xl text-white">
          Your <span className="text-neon neon-text-glow italic mr-2">Profyl</span> is live.
        </h3>

        {/* Public URL row (Icon-only copy button) */}
        <div className="mt-4 flex items-center justify-center gap-2 font-mono text-sm text-white/80">
          <span>{publicUrlText}</span>
          <button
            type="button"
            onClick={handleCopy}
            aria-label="Copy URL"
            className="p-1 text-white/50 hover:text-white transition cursor-pointer"
          >
            {copied ? <Check className="size-4 text-neon" /> : <Copy className="size-4" />}
          </button>
        </div>

        {/* Primary Action Button */}
        <div className="mt-8">
          <Link
            href={`/${user.slug}`}
            target="_blank"
            onClick={closeFirstPublishModal}
            className="w-full inline-flex items-center justify-center bg-neon text-[#0D0D0D] font-mono text-xs font-semibold py-3 px-6 hover:opacity-90 transition cursor-pointer shadow-[0_0_15px_rgba(199,255,65,0.2)] rounded-none"
          >
            View Public Profyl ↗
          </Link>
        </div>
      </div>
    </div>
  );
}
