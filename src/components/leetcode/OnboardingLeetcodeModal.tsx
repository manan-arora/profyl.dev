"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { RecommendationPanel } from "./RecommendationPanel";
import { VerificationPanel } from "./VerificationPanel";
import { motion, AnimatePresence } from "framer-motion";

interface OnboardingLeetcodeModalProps {
  open: boolean;
  onSkip: () => void;
}

export function OnboardingLeetcodeModal({
  open,
  onSkip,
}: OnboardingLeetcodeModalProps) {
  const [showVerificationPanel, setShowVerificationPanel] = useState(false);

  // Reset the panel state when the modal closes or opens fresh
  useEffect(() => {
    if (!open) {
      setShowVerificationPanel(false);
    }
  }, [open]);

  return (
    <Dialog open={open}>
      <DialogContent
        hideClose
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className="p-7 sm:p-9 font-sans text-white overflow-hidden"
      >
        <AnimatePresence mode="wait" initial={false}>
          {!showVerificationPanel ? (
            <motion.div
              key="recommendation"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              <RecommendationPanel
                onConnect={() => setShowVerificationPanel(true)}
                onSkip={onSkip}
              />
            </motion.div>
          ) : (
            <motion.div
              key="verification"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              <VerificationPanel onVerify={onSkip} />
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
