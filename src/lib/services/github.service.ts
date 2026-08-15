import { getGithubAccessToken } from "@/lib/auth/oauth";
import {
    getGithubContributions,
    getGithubMergedPRCount,
    getGithubProfile,
    getGithubRepositories,
    getGithubRepositoryLanguages,
} from "@/lib/github/client";
import {
    aggregateLanguageBytes,
    calculateActiveWeeks,
    calculateForksEarned,
    calculateLanguageDistribution,
    calculateLongestStreak,
    calculateStarsEarned,
    normalizeContributionCalendar,
} from "@/lib/github/normalizers";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

const LANGUAGE_FETCH_CONCURRENCY = 5;

interface SyncGithubResult {
    githubUsername: string;
    repositoriesSynced: number;
}

/**
 * Orchestrates fetching, filtering, and persisting a user's GitHub data.
 *
 * Flow:
 * 1. Retrieve GitHub OAuth token
 * 2. Fetch profile, repositories, and contribution calendar in parallel
 * 3. Determine eligible repositories
 * 4. Normalize contribution calendar data
 * 5. Persist user and GitHub cache (including total contributions and contribution calendar)
 * 6. Upsert eligible repositories
 * 7. Delete repositories that are no longer eligible
 * 8. Return synchronization summary
 */
async function syncGithub(userId: string): Promise<SyncGithubResult> {
    const accessToken = await getGithubAccessToken(userId);

    const [profile, allRepositories, contributionsData] = await Promise.all([
        getGithubProfile(accessToken),
        getGithubRepositories(accessToken),
        getGithubContributions(accessToken),
    ]);

    console.log(profile.login);
    console.log(allRepositories.length);

    const rawCalendar =
        contributionsData.viewer.contributionsCollection.contributionCalendar;
    const totalContributionsLastYear = rawCalendar.totalContributions;
    const normalizedCalendar = normalizeContributionCalendar(rawCalendar);

    const activeWeeks = calculateActiveWeeks(normalizedCalendar);
    const longestStreak = calculateLongestStreak(normalizedCalendar);

    const ossPrsMerged = await getGithubMergedPRCount(accessToken, profile.login);

    const eligibleRepositories = allRepositories.filter(
        (repo) => !repo.private && !repo.fork && !repo.archived
    );

    const starsEarned = calculateStarsEarned(eligibleRepositories);
    const forksEarned = calculateForksEarned(eligibleRepositories);

    let languageDistribution: Record<string, number> = {};
    try {
        if (eligibleRepositories.length > 0) {
            const languageResponses: Record<string, number>[] = [];

            for (let i = 0; i < eligibleRepositories.length; i += LANGUAGE_FETCH_CONCURRENCY) {
                const batch = eligibleRepositories.slice(i, i + LANGUAGE_FETCH_CONCURRENCY);
                const batchResults = await Promise.all(
                    batch.map((repo) => {
                        const parts = repo.full_name.split("/");
                        const owner = parts[0] || profile.login;
                        const repoName = parts[1] || repo.name;
                        return getGithubRepositoryLanguages(accessToken, owner, repoName);
                    })
                );
                languageResponses.push(...batchResults);
            }

            const aggregatedBytes = aggregateLanguageBytes(languageResponses);
            languageDistribution = calculateLanguageDistribution(aggregatedBytes);
        }
    } catch (error) {
        console.warn("Language fetch failed; preserving existing languageDistribution:", error);
        const existingCache = await prisma.gitHubCache.findUnique({
            where: { userId },
            select: { languageDistribution: true },
        });
        if (existingCache?.languageDistribution && typeof existingCache.languageDistribution === "object") {
            languageDistribution = existingCache.languageDistribution as Record<string, number>;
        }
    }

    console.log(eligibleRepositories.length);

    const eligibleGithubRepoIds = eligibleRepositories.map(repo => String(repo.id));

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

        // Upsert eligible repositories
        await Promise.all(
            eligibleRepositories.map((repo) => {
                const repositoryData = {
                    name: repo.name,
                    description: repo.description,

                    stars: repo.stargazers_count,
                    forks: repo.forks_count,

                    primaryLanguage: repo.language,

                    topics: repo.topics,

                    githubUrl: repo.html_url,
                    homepageUrl: repo.homepage,

                    isFork: repo.fork,
                    isArchived: repo.archived,

                    lastSyncedAt: syncedAt,
                    githubUpdatedAt: new Date(repo.updated_at),
                };

                return tx.repository.upsert({
                    where: {
                        githubRepoId: String(repo.id),
                    },
                    update: repositoryData,
                    create: {
                        userId,
                        githubRepoId: String(repo.id),
                        ...repositoryData,
                    },
                });
            })
        );

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