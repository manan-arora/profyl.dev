"use client";

import { useState, useCallback, useEffect } from "react";
import { VerificationPanel } from "./VerificationPanel";
import { LeetcodeResultPanel } from "./LeetcodeResultPanel";
import { motion, AnimatePresence } from "framer-motion";
import { completeOnboardingPreparationAction } from "@/app/onboarding/actions";

interface LeetcodeConnectFlowProps {
  isVerified?: boolean;
  onComplete: () => void;
}

type FlowPanel = "verification" | "result";
type ResultState = "verifying-success-show" | "preparing" | "failed";
type BackendState = "idle" | "pending" | "success" | "failed";

export function LeetcodeConnectFlow({
  isVerified = false,
  onComplete,
}: LeetcodeConnectFlowProps) {
  const [activePanel, setActivePanel] = useState<FlowPanel>(
    isVerified ? "result" : "verification"
  );
  const [resultState, setResultState] = useState<ResultState>(
    isVerified ? "preparing" : "verifying-success-show"
  );
  const [backendState, setBackendState] = useState<BackendState>("idle");

  // Execute preparation action and handle backend state transition
  const executePreparation = useCallback(async () => {
    setBackendState("pending");
    try {
      await completeOnboardingPreparationAction();
      setBackendState("success");
    } catch (error: unknown) {
      console.error("Onboarding preparation failed:", error);
      setBackendState("failed");
    }
  }, []);

  // Trigger preparation workflow automatically on mount if already verified
  useEffect(() => {
    if (isVerified && activePanel === "result" && resultState === "preparing" && backendState === "idle") {
      executePreparation();
    }
  }, [isVerified, activePanel, resultState, backendState, executePreparation]);

  // Handle temporal 1s delay on verification success before entering preparation screen
  useEffect(() => {
    if (resultState === "verifying-success-show") {
      const timer = setTimeout(() => {
        setResultState("preparing");
      }, 1000); // Keeps confirmation visible for 1s
      return () => clearTimeout(timer);
    }
  }, [resultState]);

  // Reconcile backend result with preparation screen once loading has started.
  // If the backend succeeded earlier while verifying-success-show was active,
  // this immediately redirects the user once resultState transitions to "preparing".
  useEffect(() => {
    if (resultState === "preparing") {
      if (backendState === "success") {
        onComplete();
      } else if (backendState === "failed") {
        setResultState("failed");
      }
    }
  }, [backendState, resultState, onComplete]);

  // Called when verification succeeds
  const handleVerified = useCallback(() => {
    setActivePanel("result");
    setResultState("verifying-success-show");
    executePreparation();
  }, [executePreparation]);

  // Called when user clicks "Try again"
  const handleRetry = useCallback(() => {
    setResultState("preparing");
    setBackendState("pending");
    executePreparation();
  }, [executePreparation]);

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
            onRetry={handleRetry}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
