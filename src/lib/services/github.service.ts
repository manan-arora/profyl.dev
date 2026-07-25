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
 * 2. Fetch profile + repositories in parallel
 * 3. Filter repositories
 * 4. Persist GitHub cache
 * 5. Persist repositories
 * 6. Update user table with github id and github username from github api (if changed)
 * 7. Return sync summary
 */
async function syncGithub(userId: string): Promise<SyncGithubResult> {
    const accessToken = await getGithubAccessToken(userId);

    const [profile, allRepositories] = await Promise.all([
        getGithubProfile(accessToken),
        getGithubRepositories(accessToken),
    ]);

    const filteredRepositories = allRepositories.filter(
        (repo) => !repo.private && !repo.fork && !repo.archived
    );

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

    const githubCacheUpsert = prisma.gitHubCache.upsert({
        where: {
            userId,
        },
        update: githubCacheData,
        create: {
            userId,
            ...githubCacheData,
        },
    });

    /**
     * Persist repositories
     */
    const repositoryUpserts = filteredRepositories.map((repo) => {
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
        };

        return prisma.repository.upsert({
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
    });


    //update the user with github id and github username from github api
    const userUpdate = prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            githubId: String(profile.id),
            githubUsername: profile.login,
        },
    });

    await prisma.$transaction([
        userUpdate,
        githubCacheUpsert,
        ...repositoryUpserts,
    ]);

    return {
        githubUsername: profile.login,
        repositoriesSynced: filteredRepositories.length,
    };
}

export const githubService = {
    syncGithub,
};