"use client";

import { useRouter } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { LeetcodeConnectFlow } from "./LeetcodeConnectFlow";

interface OnboardingLeetcodeModalProps {
  open: boolean;
  isLeetcodeVerified?: boolean;
}

export function OnboardingLeetcodeModal({
  open,
  isLeetcodeVerified = false,
}: OnboardingLeetcodeModalProps) {
  const router = useRouter();

  const handleComplete = () => {
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
        <LeetcodeConnectFlow
          isVerified={isLeetcodeVerified}
          onComplete={handleComplete}
        />
      </DialogContent>
    </Dialog>
  );
}
