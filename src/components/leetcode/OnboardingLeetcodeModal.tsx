"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { RecommendationPanel } from "./RecommendationPanel";
import { LeetcodeConnectFlow } from "./LeetcodeConnectFlow";
import { motion, AnimatePresence } from "framer-motion";

interface OnboardingLeetcodeModalProps {
  open: boolean;
  onSkip: () => void;
}

type ActivePanel = "recommendation" | "connect";

export function OnboardingLeetcodeModal({
  open,
  onSkip,
}: OnboardingLeetcodeModalProps) {
  const router = useRouter();
  const [activePanel, setActivePanel] = useState<ActivePanel>("recommendation");

  const [prevOpen, setPrevOpen] = useState(open);

  // Reset the panel state when the modal closes or opens fresh
  if (prevOpen !== open) {
    setPrevOpen(open);
    if (!open) {
      setActivePanel("recommendation");
    }
  }

  const handleComplete = () => {
    router.push("/dashboard");
  };

  const handleUnavailable = () => {
    router.push("/dashboard");
  };

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
                onConnect={() => setActivePanel("connect")}
                onSkip={onSkip}
              />
            </motion.div>
          )}

          {activePanel === "connect" && (
            <motion.div
              key="connect"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              <LeetcodeConnectFlow
                onComplete={handleComplete}
                onUnavailable={handleUnavailable}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}


