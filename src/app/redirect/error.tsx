"use client";

import { useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an analytics or error tracking service
    console.error("Redirect page error:", error);
  }, [error]);

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center bg-[#0D0D0D] text-white px-6 overflow-hidden">
      {/* Decorative Grid Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(239,68,68,0.03),transparent_70%)] pointer-events-none" />

      <div className="relative flex flex-col items-center max-w-md text-center">
        {/* Error Icon / Logo Container */}
        <div className="relative mb-8 flex items-center justify-center w-24 h-24">
          {/* Pulsing red glow background */}
          <div className="absolute inset-0 rounded-full bg-red-500/10 blur-xl animate-pulse" />
          
          {/* Circular border with warning color */}
          <svg className="absolute inset-0 w-full h-full">
            <circle
              cx="48"
              cy="48"
              r="44"
              className="stroke-red-500/20"
              strokeWidth="2"
              fill="transparent"
            />
            <circle
              cx="48"
              cy="48"
              r="44"
              className="stroke-red-500/60"
              strokeWidth="2"
              fill="transparent"
              strokeDasharray="276"
              strokeDashoffset="120"
              strokeLinecap="round"
            />
          </svg>
          
          {/* Centered Warning Icon / Logo */}
          <div className="relative z-10 flex items-center justify-center bg-[#141414] rounded-full w-20 h-20 border border-red-500/20">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>

        {/* Text Details */}
        <h1 className="font-display font-medium text-2xl tracking-tight text-white mb-3 animate-rise-in">
          Setup In Progress
        </h1>
        <p className="font-sans text-sm text-white/60 mb-8 max-w-sm leading-relaxed animate-rise-in" style={{ animationDelay: "0.1s" }}>
          {error.message || "Your account is still being provisioned. This usually takes just a few seconds."}
        </p>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto animate-rise-in" style={{ animationDelay: "0.2s" }}>
          <Button
            onClick={() => reset()}
            variant="primary"
            className="flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Check Again
          </Button>
          <Button
            onClick={() => window.location.href = "/"}
            variant="outline"
          >
            Go to Home
          </Button>
        </div>
      </div>
    </main>
  );
}
