import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { projectService } from "@/lib/services/project.service";
import OnboardingClient from "./OnboardingClient";
import { githubService } from "@/lib/services/github.service";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Onboarding",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function OnboardingPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  /**
   * ROUTE GUARD: Redirect users who have already completed onboarding steps
   * (e.g. reached DRAFT or PUBLISHED status) to their dashboard.
   * Onboarding is a one-way setup process; they should not be allowed to re-run it.
   */
  if (user.profileStatus !== "INCOMPLETE") {
    redirect("/dashboard");
  }

  /**
   * Keep a single unified data fetching execution path for both new and resuming users.
   * This future-proofs the page if repository data is needed by components when resuming,
   * and respects the existing caching TTL inside githubService.syncGithub.
   */
  try {
    await githubService.syncGithub(user.id);
  } catch (err) {
    console.warn("[Onboarding] Non-fatal error syncing GitHub data during page load:", err);
  }

  const repositories = await projectService.getAvailableProjects(user.id);

  /**
   * Render the client shell, specifying whether onboarding should resume directly at
   * the LeetCode modal. This is active when Case C is met (profileStatus == INCOMPLETE
   * and featuredProjectsSelected == true).
   */
  return (
    <OnboardingClient
      repositories={repositories}
      resumeAtLeetcode={user.featuredProjectsSelected}
      isLeetcodeVerified={user.isLeetcodeVerified}
    />
  );
}