import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { projectService } from "@/lib/services/project.service";
import OnboardingClient from "./OnboardingClient";
import { githubService } from "@/lib/services/github.service";

export default async function OnboardingPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  console.log("Loading onboarding for", user.id);

  await githubService.syncGithub(user.id);

  console.log("Sync completed");

  const repositories = await projectService.getAvailableProjects(user.id);

  return <OnboardingClient repositories={repositories} />;
}
