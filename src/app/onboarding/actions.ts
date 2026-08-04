"use server";

import { getCurrentUser } from "@/lib/auth/current-user";
import { projectService } from "@/lib/services/project.service";

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