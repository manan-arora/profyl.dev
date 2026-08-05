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