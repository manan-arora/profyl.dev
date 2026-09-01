"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function OnboardingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error("Onboarding page error:", error);
  }, [error]);

  const handleRetry = () => {
    router.refresh();
    reset();
  };

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center bg-[#0D0D0D] text-white px-6 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(239,68,68,0.03),transparent_70%)] pointer-events-none" />

      <div className="relative flex flex-col items-center max-w-md text-center">
        <div className="relative mb-8 flex items-center justify-center w-24 h-24">
          <div className="absolute inset-0 rounded-full bg-red-500/10 blur-xl animate-pulse" />
          <div className="relative z-10 flex items-center justify-center bg-[#141414] rounded-full w-20 h-20 border border-red-500/20">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <h1 className="font-display font-medium text-2xl tracking-tight text-white mb-3 animate-rise-in">
          Onboarding Error
        </h1>
        <p className="font-sans text-sm text-white/60 mb-8 max-w-sm leading-relaxed animate-rise-in" style={{ animationDelay: "0.1s" }}>
          {error.message && !error.message.includes("Server Components render")
            ? error.message
            : "We encountered an issue loading your onboarding details. Please try again."}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto animate-rise-in" style={{ animationDelay: "0.2s" }}>
          <Button
            onClick={handleRetry}
            variant="primary"
            className="flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
          <Button
            onClick={() => (window.location.href = "/")}
            variant="outline"
          >
            Go to Home
          </Button>
        </div>
      </div>
    </main>
  );
}
