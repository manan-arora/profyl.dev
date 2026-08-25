"use server";

import { getCurrentUser } from "@/lib/auth/current-user";
import { projectService } from "@/lib/services/project.service";
import { leetcodeService } from "@/lib/services/leetcode.service";
import { completeOnboardingPreparation } from "@/lib/onboarding/preparation";

export async function saveFeaturedProjectsAction(
    selectedProjectIds: string[]
) {
    const user = await getCurrentUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    await projectService.saveFeaturedProjects(
        user.id,
        selectedProjectIds
    );

    return { success: true };
}

/**
 * Server Action to generate and persist a LeetCode verification token for the current user.
 * 
 * @param username - The submitted LeetCode username
 * @returns Generated verification token
 */
export async function generateLeetcodeVerificationTokenAction(username: string) {
    const user = await getCurrentUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    const result = await leetcodeService.generateVerificationToken(
        user.id,
        username
    );

    return result;
}

/**
 * Server Action to verify a user's LeetCode profile ownership.
 * 
 * @param username - The LeetCode username to verify
 * @returns Result object with verified status
 */
export async function verifyLeetcodeOwnershipAction(username: string) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  await leetcodeService.verifyOwnership(user.id, username);

  return { verified: true };
}

/**
 * Server Action to complete the onboarding preparation workflow for a verified user.
 * 
 * @returns Result object indicating success
 */
export async function completeOnboardingPreparationAction() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  await completeOnboardingPreparation(user.id);

  return { success: true };
}