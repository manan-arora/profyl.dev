"use server";

import { getCurrentUser } from "@/lib/auth/current-user";
import { projectService } from "@/lib/services/project.service";
import { leetcodeService } from "@/lib/services/leetcode.service";
import { computeAnalytics } from "@/lib/analytics/analytics-engine";
import { persistAnalytics } from "@/lib/services/analytics.service";

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
 * Helper function to safely compute and persist user analytics after LeetCode synchronization.
 * Any errors during this process are logged and do not propagate to the caller.
 */
async function computeAndPersistAnalytics(userId: string) {
  try {
    const result = await computeAnalytics(userId);
    await persistAnalytics(result);
  } catch (error) {
    console.error("Failed to compute or persist analytics after LeetCode sync:", error);
  }
}

/**
 * Server Action to synchronize a verified user's LeetCode data.
 * 
 * @returns Result object with synced status
 */
export async function syncLeetcodeDataAction() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  await leetcodeService.syncLeetcodeData(user.id);
  await computeAndPersistAnalytics(user.id);

  return { synced: true };
}

/**
 * Server Action to retry synchronization for a verified user's LeetCode data.
 * 
 * @returns Result object with synced status
 */
export async function retryLeetcodeSyncAction() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  await leetcodeService.syncLeetcodeData(user.id);
  await computeAndPersistAnalytics(user.id);

  return { synced: true };
}