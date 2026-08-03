"use client";

import { useState, useTransition } from "react";
import { OnboardingProjects } from "@/components/onboarding/OnboardingProjects";
import { Repo } from "@/components/onboarding/RepoCard";
import { completeOnboarding } from "@/app/onboarding/actions";

interface OnboardingClientProps {
  repositories: Repo[];
}

export default function OnboardingClient({ repositories }: OnboardingClientProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleContinue = (selectedRepositoryIds: string[]) => {
    setError(null);
    startTransition(async () => {
      try {
        const result = await completeOnboarding(selectedRepositoryIds);
        if (!result.success) {
          setError("Unable to save featured projects. Please try again.");
        }
      } catch (err) {
        setError("Unable to save featured projects. Please try again.");
      }
    });
  };

  return (
    <OnboardingProjects
      repositories={repositories}
      isLoading={false}
      isPending={isPending}
      error={error}
      onContinue={handleContinue}
    />
  );
}
