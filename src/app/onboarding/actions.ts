"use server";

import { getCurrentUser } from "@/lib/auth/current-user";
import { projectService } from "@/lib/services/project.service";
import { leetcodeService } from "@/lib/services/leetcode.service";
import { completeOnboardingPreparation } from "@/lib/onboarding/preparation";
import { getSafeServerErrorMessage } from "@/lib/errors/safe-error";

export async function saveFeaturedProjectsAction(
    selectedProjectIds: string[]
) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return { success: false, error: "Unauthorized" };
        }

        await projectService.saveFeaturedProjects(
            user.id,
            selectedProjectIds
        );

        return { success: true };
    } catch (error: unknown) {
        console.error("Error saving featured projects:", error);
        return {
            success: false,
            error: getSafeServerErrorMessage(
                error,
                "Unable to save featured projects. Please try again."
            ),
        };
    }
}

/**
 * Server Action to generate and persist a LeetCode verification token for the current user.
 * 
 * @param username - The submitted LeetCode username
 * @returns Result object with status and token or error message
 */
export async function generateLeetcodeVerificationTokenAction(username: string) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return { success: false, error: "Unauthorized" };
        }

        const token = await leetcodeService.generateVerificationToken(
            user.id,
            username
        );

        return { success: true, token };
    } catch (error: unknown) {
        console.error("Error generating LeetCode verification token:", error);
        return {
            success: false,
            error: getSafeServerErrorMessage(
                error,
                "Failed to generate verification code. Please try again."
            ),
        };
    }
}

/**
 * Server Action to verify a user's LeetCode profile ownership.
 * 
 * @param username - The LeetCode username to verify
 * @returns Result object with verified status
 */
export async function verifyLeetcodeOwnershipAction(username: string) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    await leetcodeService.verifyOwnership(user.id, username);

    return { success: true, verified: true };
  } catch (error: unknown) {
    console.error("Error verifying LeetCode ownership:", error);
    return {
      success: false,
      error: getSafeServerErrorMessage(
        error,
        "Verification failed. Please try again."
      ),
    };
  }
}

/**
 * Server Action to complete the onboarding preparation workflow for a verified user.
 * 
 * @returns Result object indicating success
 */
export async function completeOnboardingPreparationAction() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    await completeOnboardingPreparation(user.id);

    return { success: true };
  } catch (error: unknown) {
    console.error("Error completing onboarding preparation:", error);
    return {
      success: false,
      error: getSafeServerErrorMessage(
        error,
        "Couldn't finish preparing your Profyl. Please try again."
      ),
    };
  }
}
