"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { OnboardingProjects } from "@/components/onboarding/OnboardingProjects";
import { Repo } from "@/components/onboarding/RepoCard";
import { saveFeaturedProjectsAction } from "@/app/onboarding/actions";
import { toast } from "sonner";
import { OnboardingLeetcodeModal } from "@/components/leetcode/OnboardingLeetcodeModal";

interface OnboardingClientProps {
  repositories: Repo[];
  resumeAtLeetcode?: boolean; // Determines if user is continuing onboarding from LeetCode recommendation step
}

export default function OnboardingClient({
  repositories,
  resumeAtLeetcode = false,
}: OnboardingClientProps) {
  const router = useRouter();

  /**
   * If resumeAtLeetcode is true, we immediately open the modal.
   * This is part of the resumable onboarding logic where returning users
   * who have already selected projects skip the projects selection screen.
   */
  const [isModalOpen, setIsModalOpen] = useState(resumeAtLeetcode);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleContinue = (selectedRepositoryIds: string[]) => {
    setError(null);

    startTransition(async () => {
      try {
        await saveFeaturedProjectsAction(selectedRepositoryIds);

        toast.success("Featured projects saved successfully");
        setIsModalOpen(true);

      } catch {
        const message = "Unable to save featured projects. Please try again.";

        setError(message);
        toast.error(message);
      }
    });
  };

  /**
   * Secondary Action: Skip LeetCode connection.
   * Closes the dialog but keeps the user on the current page context without navigating.
   */
  const handleSkip = () => {
    setIsModalOpen(false);
    // TODO: Implement future draft generation workflow here instead of navigating
  };

  return (
    <>
      {/* 
        Hide the Project Selection UI entirely when resuming from LeetCode step.
        This provides a cleaner UX as the project selection step is already persisted.
      */}
      {!resumeAtLeetcode && (
        <OnboardingProjects
          repositories={repositories}
          isLoading={false}
          isPending={isPending}
          error={error}
          onContinue={handleContinue}
        />
      )}
      <OnboardingLeetcodeModal
        open={isModalOpen}
        onSkip={handleSkip}
      />
    </>
  );
}