"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { RecommendationPanel } from "./RecommendationPanel";
import { VerificationPanel } from "./VerificationPanel";
import { LeetcodeResultPanel } from "./LeetcodeResultPanel";
import { motion, AnimatePresence } from "framer-motion";
import { syncLeetcodeDataAction, retryLeetcodeSyncAction } from "@/app/onboarding/actions";

interface OnboardingLeetcodeModalProps {
  open: boolean;
  onSkip: () => void;
}

type ActivePanel = "recommendation" | "verification" | "result";
type ResultState = "syncing" | "success" | "sync-failed";

export function OnboardingLeetcodeModal({
  open,
  onSkip,
}: OnboardingLeetcodeModalProps) {
  const router = useRouter();
  const [activePanel, setActivePanel] = useState<ActivePanel>("recommendation");
  const [resultState, setResultState] = useState<ResultState>("syncing");

  const [prevOpen, setPrevOpen] = useState(open);

  // Reset the panel state when the modal closes or opens fresh
  if (prevOpen !== open) {
    setPrevOpen(open);
    if (!open) {
      setActivePanel("recommendation");
      setResultState("syncing");
    }
  }

  // Execute sync action and handle state transition
  const executeSync = useCallback(async (isRetry = false) => {
    setResultState("syncing");
    try {
      if (isRetry) {
        await retryLeetcodeSyncAction();
      } else {
        await syncLeetcodeDataAction();
      }
      setResultState("success");
    } catch (error: unknown) {
      console.error("LeetCode sync failed:", error);
      setResultState("sync-failed");
    }
  }, []);

  // Called when verification succeeds
  const handleVerified = useCallback(() => {
    setActivePanel("result");
    executeSync(false);
  }, [executeSync]);

  // Called when user clicks "Retry sync →"
  const handleRetrySync = useCallback(() => {
    executeSync(true);
  }, [executeSync]);

  // Handle automatic navigation to dashboard upon successful sync
  useEffect(() => {
    if (activePanel === "result" && resultState === "success") {
      const timer = setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [activePanel, resultState, router]);

  return (
    <Dialog open={open}>
      <DialogContent
        hideClose
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className="p-7 sm:p-9 font-sans text-white overflow-hidden"
      >
        <AnimatePresence mode="wait" initial={false}>
          {activePanel === "recommendation" && (
            <motion.div
              key="recommendation"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              <RecommendationPanel
                onConnect={() => setActivePanel("verification")}
                onSkip={onSkip}
              />
            </motion.div>
          )}

          {activePanel === "verification" && (
            <motion.div
              key="verification"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              <VerificationPanel onVerify={handleVerified} />
            </motion.div>
          )}

          {activePanel === "result" && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              <LeetcodeResultPanel
                state={resultState}
                onRetry={handleRetrySync}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

