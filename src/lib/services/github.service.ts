import { getGithubAccessToken } from "@/lib/auth/oauth";
import { getGithubProfile, getGithubRepositories } from "@/lib/github/client";
import { prisma } from "@/lib/prisma";

interface SyncGithubResult {
    githubUsername: string;
    repositoriesSynced: number;
}

/**
 * Orchestrates fetching, filtering, and persisting a user's GitHub data.
 *
 * Flow:
 * 1. Retrieve GitHub OAuth token
 * 2. Fetch profile and repositories in parallel
 * 3. Determine eligible repositories
 * 4. Persist user and GitHub cache
 * 5. Upsert eligible repositories
 * 6. Delete repositories that are no longer eligible
 * 7. Return synchronization summary
 */
async function syncGithub(userId: string): Promise<SyncGithubResult> {
    const accessToken = await getGithubAccessToken(userId);

    const [profile, allRepositories] = await Promise.all([
        getGithubProfile(accessToken),
        getGithubRepositories(accessToken),
    ]);

    console.log(profile.login);
console.log(allRepositories.length);

    const eligibleRepositories = allRepositories.filter(
        (repo) => !repo.private && !repo.fork && !repo.archived
    );

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