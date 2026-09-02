import { prisma } from "@/lib/prisma";
import { analyzeRepository } from "./orchestration";
import { RepositoryAnalysisResult } from "@/types/scanner";

export interface FeaturedRepositoriesAnalysis {
  repositories: RepositoryAnalysisResult[];
  totalRepositories: number;
  analyzedRepositories: number;
}

/**
 * Parses the owner and repository name from a GitHub URL.
 * e.g. "https://github.com/owner/repo" -> { owner: "owner", name: "repo" }
 *
 * @param githubUrl The full GitHub repository URL
 * @returns Object containing parsed owner and name
 */
function parseGithubUrl(githubUrl: string): { owner: string; name: string } {
  const cleanUrl = githubUrl.replace(/\/$/, "");
  const parts = cleanUrl.split("/");
  const name = parts[parts.length - 1] || "";
  const owner = parts[parts.length - 2] || "";
  return { owner, name };
}

/**
 * Loads the user's featured repositories (ordered by displayOrder) and analyzes each one.
 * Maps outcomes to "analyzed", "unsupported", or "failed".
 *
 * @param userId ID of the user whose featured repositories to analyze
 * @param accessToken GitHub OAuth access token
 * @returns FeaturedRepositoriesAnalysis summary containing per-repository results and metrics
 */
export async function analyzeFeaturedRepositories(
  userId: string,
  accessToken: string
): Promise<FeaturedRepositoriesAnalysis> {
  const featuredRepos = await prisma.repository.findMany({
    where: {
      userId,
      isFeatured: true,
    },
    orderBy: {
      displayOrder: "asc",
    },
  });

  const repositories = await Promise.all(
    featuredRepos.map((repo) => {
      const { owner, name } = parseGithubUrl(repo.githubUrl);
      return analyzeRepository({
        repositoryId: repo.id,
        owner,
        repo: name || repo.name,
        accessToken,
        branch: repo.defaultBranch || "main",
      });
    })
  );

  const totalRepositories = repositories.length;
  const analyzedRepositories = repositories.filter(
    (r) => r.outcome === "analyzed"
  ).length;

  return {
    repositories,
    totalRepositories,
    analyzedRepositories,
  };
}
