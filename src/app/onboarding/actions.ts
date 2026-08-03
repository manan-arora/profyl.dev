"use server";

import { getCurrentUser } from "@/lib/auth/current-user";
import { projectService } from "@/lib/services/project.service";
import { prisma } from "@/lib/prisma";
import { ProfileStatus } from "@/generated/prisma/client";

export async function completeOnboarding(
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

    await prisma.user.update({
        where: {
            id: user.id,
        },
        data: {
            profileStatus: ProfileStatus.DRAFT,
        },
    });

    return { success: true };
}