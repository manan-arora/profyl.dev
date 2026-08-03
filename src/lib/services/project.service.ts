import { prisma } from "@/lib/prisma";

/**
 * Fetches repositories belonging to the user, sorted by most recently updated.
 * 
 * Since GitHub Sync already filters out private, forked, and archived
 * repositories before persisting them, this service does not repeat that filtering.
 * 
 * @param userId - The ID of the user whose repositories to fetch
 * @returns Array of repository objects, ordered by githubUpdatedAt DESC
 */
async function getAvailableProjects(userId: string) {
    return prisma.repository.findMany({
        where: {
            userId,
        },
        orderBy: {
            githubUpdatedAt: "desc",
        },
        select: {
            id: true,
            name: true,
            description: true,
            primaryLanguage: true,
            stars: true,
            githubUpdatedAt: true,
            isFeatured: true,
            topics: true,
        }
    });
}

/**
 * Persists the user's featured project selection in a single database transaction.
 * 
 * Rules:
 * - maximum 4 projects allowed
 * - every project must belong to the user
 * - displayOrder is assigned sequentially (1-4) based on the order of projectIds in the array
 * 
 * @param userId - The ID of the user configuring their featured projects
 * @param projectIds - An ordered array of repository IDs to feature
 */
async function saveFeaturedProjects(userId: string, projectIds: string[]) {
    // Validate input length
    if (projectIds.length > 4) {
        throw new Error("You can feature a maximum of 4 projects");
    }

    // Validate duplicate IDs
    const uniqueProjectIds = Array.from(new Set(projectIds));
    if (uniqueProjectIds.length !== projectIds.length) {
        throw new Error("Duplicate project IDs are not allowed");
    }

    await prisma.$transaction(async (tx) => {
        // Validate ownership and existence of all projects
        if (projectIds.length > 0) {
            const count = await tx.repository.count({
                where: {
                    id: { in: projectIds },
                    userId,
                },
            });

            if (count !== projectIds.length) {
                throw new Error("One or more projects do not exist or do not belong to this user");
            }
        }

        // Clear previous featured projects for this user
        await tx.repository.updateMany({
            where: {
                userId,
            },
            data: {
                isFeatured: false,
                displayOrder: null,
            },
        });

        // Feature selected projects and assign displayOrder sequentially
        for (let i = 0; i < projectIds.length; i++) {
            const projectId = projectIds[i];
            await tx.repository.update({
                where: {
                    id: projectId,
                },
                data: {
                    isFeatured: true,
                    displayOrder: i + 1,
                },
            });
        }
    });
}

export const projectService = {
    getAvailableProjects,
    saveFeaturedProjects,
};

