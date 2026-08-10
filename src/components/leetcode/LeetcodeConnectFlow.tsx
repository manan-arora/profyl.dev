"use client";

import { useState, useCallback, useEffect } from "react";
import { VerificationPanel } from "./VerificationPanel";
import { LeetcodeResultPanel } from "./LeetcodeResultPanel";
import { motion, AnimatePresence } from "framer-motion";
import { syncLeetcodeDataAction, retryLeetcodeSyncAction } from "@/app/onboarding/actions";

interface LeetcodeConnectFlowProps {
  onComplete: () => void;
  onUnavailable: () => void;
}

type FlowPanel = "verification" | "result";
type ResultState = "syncing" | "success" | "sync-failed" | "sync-unavailable";

export function LeetcodeConnectFlow({
  onComplete,
  onUnavailable,
}: LeetcodeConnectFlowProps) {
  const [activePanel, setActivePanel] = useState<FlowPanel>("verification");
  const [resultState, setResultState] = useState<ResultState>("syncing");
  const [retryCount, setRetryCount] = useState(0);

  const MAX_RETRIES = 3;

  // Execute sync action and handle state transition
  const executeSync = useCallback(async (retryCountForThisAttempt = 0) => {
    setResultState("syncing");
    try {
      if (retryCountForThisAttempt > 0) {
        await retryLeetcodeSyncAction();
      } else {
        await syncLeetcodeDataAction();
      }
      setResultState("success");
    } catch (error: unknown) {
      console.error("LeetCode sync failed:", error);
      if (retryCountForThisAttempt >= MAX_RETRIES) {
        setResultState("sync-unavailable");
      } else {
        setResultState("sync-failed");
      }
    }
  }, []);

  // Called when verification succeeds
  const handleVerified = useCallback(() => {
    setActivePanel("result");
    setRetryCount(0);
    executeSync(0);
  }, [executeSync]);

  // Called when user clicks "Retry sync →"
  const handleRetrySync = useCallback(() => {
    if (retryCount >= MAX_RETRIES) return;

    const nextRetryCount = retryCount + 1;
    setRetryCount(nextRetryCount);
    executeSync(nextRetryCount);
  }, [retryCount, executeSync]);

  // Handle reporting completion to parent after success screen is shown for 2s
  useEffect(() => {
    if (activePanel === "result" && resultState === "success") {
      const timer = setTimeout(() => {
        onComplete();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [activePanel, resultState, onComplete]);

  return (
    <AnimatePresence mode="wait" initial={false}>
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
            onContinueToDashboard={onUnavailable}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
