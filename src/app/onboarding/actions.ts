"use server";

import { getCurrentUser } from "@/lib/auth/current-user";
import { projectService } from "@/lib/services/project.service";
import { leetcodeService } from "@/lib/services/leetcode.service";

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
 * Server Action to verify a user's LeetCode profile ownership and persist profile data.
 * 
 * @param username - The LeetCode username to verify
 * @returns Result object with success status
 */
export async function completeLeetcodeConnectionAction(username: string) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  await leetcodeService.verifyOwnership(user.id, username);

  try {
    await leetcodeService.syncLeetcodeData(user.id);

    return {
      verified: true,
      synced: true,
    };
  } catch (error) {
    console.error("LeetCode sync failed:", error);

    return {
      verified: true,
      synced: false,
    };
  }
}

export async function retryLeetcodeSyncAction() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  await leetcodeService.syncLeetcodeData(user.id);

  return {
    synced: true,
  };
}