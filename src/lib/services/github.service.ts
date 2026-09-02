import { randomUUID } from "crypto";
import { getGithubAccessToken } from "@/lib/auth/oauth";
import {
    getGithubContributions,
    getGithubMergedPRCount,
    getGithubProfile,
    getGithubRepositoriesGraphQL,
} from "@/lib/github/client";
import {
    calculateActiveWeeks,
    calculateLanguageDistribution,
    calculateLongestStreak,
    normalizeContributionCalendar,
} from "@/lib/github/normalizers";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

interface SyncGithubResult {
    githubUsername: string;
    repositoriesSynced: number;
}

/**
 * Orchestrates fetching, filtering, and persisting a user's GitHub data.
 *
 * Flow:
 * 1. Retrieve GitHub OAuth token
 * 2. Fetch profile, repositories (GraphQL paginated), and contribution calendar in parallel
 * 3. Determine eligible repositories (public, non-fork, non-archived)
 * 4. Normalize contribution calendar data and calculate global stats
 * 5. Aggregate language distribution directly from GraphQL byte counts
 * 6. Persist user, profile, and GitHub cache in an atomic transaction
 * 7. Bulk UPSERT repositories in a single O(1) PostgreSQL statement
 * 8. Atomic delete of stale repositories no longer eligible
 * 9. Return synchronization summary
 */
async function syncGithub(userId: string): Promise<SyncGithubResult> {
    const accessToken = await getGithubAccessToken(userId);

    const [profile, allRepoNodes, contributionsData] = await Promise.all([
        getGithubProfile(accessToken),
        getGithubRepositoriesGraphQL(accessToken),
        getGithubContributions(accessToken),
    ]);

    const rawCalendar =
        contributionsData.viewer.contributionsCollection.contributionCalendar;
    const totalContributionsLastYear = rawCalendar.totalContributions;
    const normalizedCalendar = normalizeContributionCalendar(rawCalendar);

    const activeWeeks = calculateActiveWeeks(normalizedCalendar);
    const longestStreak = calculateLongestStreak(normalizedCalendar);

    const ossPrsMerged = await getGithubMergedPRCount(accessToken, profile.login);

    const eligibleRepositories = allRepoNodes.filter(
        (repo) => !repo.isPrivate && !repo.isFork && !repo.isArchived
    );

    const starsEarned = eligibleRepositories.reduce(
        (sum, repo) => sum + (repo.stargazerCount || 0),
        0
    );
    const forksEarned = eligibleRepositories.reduce(
        (sum, repo) => sum + (repo.forkCount || 0),
        0
    );

    // Aggregate language bytes directly from GraphQL response
    const languageBytesMap: Record<string, number> = {};
    for (const repo of eligibleRepositories) {
        if (repo.languages?.edges) {
            for (const edge of repo.languages.edges) {
                if (edge?.node?.name && typeof edge.size === "number") {
                    const langName = edge.node.name;
                    languageBytesMap[langName] = (languageBytesMap[langName] || 0) + edge.size;
                }
            }
        }
    }
    const languageDistribution = calculateLanguageDistribution(languageBytesMap);

    const eligibleGithubRepoIds = eligibleRepositories.map((repo) => String(repo.databaseId));

    const syncedAt = new Date();
    const CACHE_TTL_HOURS = 12;

    const cacheExpiresAt = new Date(
        syncedAt.getTime() + CACHE_TTL_HOURS * 60 * 60 * 1000
    );

    /**
     * Persist GitHub cache
     */
    const githubCacheData = {
        followers: profile.followers,
        following: profile.following,
        publicRepoCount: profile.public_repos,

        totalContributionsLastYear,
        contributionCalendar: normalizedCalendar as unknown as Prisma.InputJsonValue,

        activeWeeks,
        longestStreak,
        ossPrsMerged,
        starsEarned,
        forksEarned,
        languageDistribution: languageDistribution as unknown as Prisma.InputJsonValue,

        lastSyncedAt: syncedAt,
        cacheExpiresAt,
    };

    await prisma.$transaction(async (tx) => {
        // Update the user with github id and github username from github api
        await tx.user.update({
            where: {
                id: userId,
            },
            data: {
                githubId: String(profile.id),
                githubUsername: profile.login,
            },
        });

        // Sync user profile name and bio (not overwriting if already populated)
        const existingProfile = await tx.profile.findUnique({
            where: { userId },
        });

        if (existingProfile) {
            if (!existingProfile.name && profile.name) {
                await tx.profile.update({
                    where: { userId },
                    data: { name: profile.name },
                });
            }
        } else {
            await tx.profile.create({
                data: {
                    userId,
                    name: profile.name ?? null,
                    bio: profile.bio ?? null,
                },
            });
        }

        // Persist GitHub cache
        await tx.gitHubCache.upsert({
            where: {
                userId,
            },
            update: githubCacheData,
            create: {
                userId,
                ...githubCacheData,
            },
        });

        // Fetch existing repositories for the user to preserve primary keys for existing records
        const existingRepos = await tx.repository.findMany({
            where: { userId },
            select: {
                id: true,
                githubRepoId: true,
            },
        });
        const existingRepoMap = new Map(
            existingRepos.map((r) => [r.githubRepoId, r.id])
        );

        if (eligibleRepositories.length > 0) {
            const valueTuples: string[] = [];
            const params: unknown[] = [];
            let paramIdx = 1;

            for (const repo of eligibleRepositories) {
                const githubRepoIdStr = String(repo.databaseId);
                const existingId = existingRepoMap.get(githubRepoIdStr) || randomUUID();
                const topicsArray = repo.repositoryTopics?.nodes
                    ? repo.repositoryTopics.nodes.map((n) => n.topic.name)
                    : [];
                const defaultBranch = repo.defaultBranchRef?.name || "main";

                valueTuples.push(
                    `($${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}::jsonb, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}::timestamptz, $${paramIdx++}::timestamptz, NOW(), NOW())`
                );

                params.push(
                    existingId,
                    userId,
                    githubRepoIdStr,
                    repo.name,
                    repo.description ?? null,
                    repo.stargazerCount || 0,
                    repo.forkCount || 0,
                    repo.primaryLanguage?.name ?? null,
                    JSON.stringify(topicsArray),
                    repo.url,
                    repo.homepageUrl ?? null,
                    defaultBranch,
                    repo.isFork,
                    repo.isArchived,
                    syncedAt.toISOString(),
                    new Date(repo.updatedAt).toISOString()
                );
            }

            const bulkUpsertSql = `
                INSERT INTO "Repository" (
                    "id", "userId", "githubRepoId", "name", "description", "stars", "forks",
                    "primaryLanguage", "topics", "githubUrl", "homepageUrl", "defaultBranch",
                    "isFork", "isArchived", "lastSyncedAt", "githubUpdatedAt", "createdAt", "updatedAt"
                )
                VALUES ${valueTuples.join(", ")}
                ON CONFLICT ("githubRepoId") DO UPDATE SET
                    "name" = EXCLUDED."name",
                    "description" = EXCLUDED."description",
                    "stars" = EXCLUDED."stars",
                    "forks" = EXCLUDED."forks",
                    "primaryLanguage" = EXCLUDED."primaryLanguage",
                    "topics" = EXCLUDED."topics",
                    "githubUrl" = EXCLUDED."githubUrl",
                    "homepageUrl" = EXCLUDED."homepageUrl",
                    "defaultBranch" = EXCLUDED."defaultBranch",
                    "isFork" = EXCLUDED."isFork",
                    "isArchived" = EXCLUDED."isArchived",
                    "lastSyncedAt" = EXCLUDED."lastSyncedAt",
                    "githubUpdatedAt" = EXCLUDED."githubUpdatedAt",
                    "updatedAt" = NOW();
            `;

            await tx.$executeRawUnsafe(bulkUpsertSql, ...params);
        }

        // Delete stale repositories (same user, githubRepoId not in eligibleGithubRepoIds)
        await tx.repository.deleteMany({
            where: {
                userId,
                githubRepoId: {
                    notIn: eligibleGithubRepoIds,
                },
            },
        });
    });

    return {
        githubUsername: profile.login,
        repositoriesSynced: eligibleRepositories.length,
    };
}

export const githubService = {
    syncGithub,
};