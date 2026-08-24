import { describe, it, expect, vi, beforeEach } from "vitest";
import { analyzeFeaturedRepositories } from "../featured-repositories";
import * as orchestration from "../orchestration";
import { prisma } from "@/lib/prisma";
import { RepositoryAnalysisResult } from "@/types/scanner";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    repository: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock("../orchestration", () => ({
  analyzeRepository: vi.fn(),
}));

describe("analyzeFeaturedRepositories", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return empty results when the user has zero featured repositories", async () => {
    vi.mocked(prisma.repository.findMany).mockResolvedValueOnce([]);

    const result = await analyzeFeaturedRepositories("user123", "token123");

    expect(prisma.repository.findMany).toHaveBeenCalledWith({
      where: {
        userId: "user123",
        isFeatured: true,
      },
      orderBy: {
        displayOrder: "asc",
      },
    });
    expect(orchestration.analyzeRepository).not.toHaveBeenCalled();

    expect(result).toEqual({
      repositories: [],
      totalRepositories: 0,
      analyzedRepositories: 0,
    });
  });

  it("should coordinate mixed outcomes across 4 featured repositories preserving displayOrder", async () => {
    // 4 mock database repositories
    const mockDbRepos = [
      {
        id: "repo_analyzed_with_signals",
        name: "Repo A",
        githubUrl: "https://github.com/ownerA/repoA",
        defaultBranch: "main",
        displayOrder: 1,
      },
      {
        id: "repo_analyzed_no_signals",
        name: "Repo B",
        githubUrl: "https://github.com/ownerB/repoB",
        defaultBranch: "master",
        displayOrder: 2,
      },
      {
        id: "repo_unsupported",
        name: "Repo C",
        githubUrl: "https://github.com/ownerC/repoC/", // Trailing slash testing
        defaultBranch: "develop",
        displayOrder: 3,
      },
      {
        id: "repo_failed",
        name: "Repo D",
        githubUrl: "https://github.com/ownerD/repoD",
        defaultBranch: "main",
        displayOrder: 4,
      },
    ];

    vi.mocked(prisma.repository.findMany).mockResolvedValueOnce(mockDbRepos as any);

    // Mock analysis results corresponding to each repo status
    const mockAnalysisA: RepositoryAnalysisResult = {
      repositoryId: "repo_analyzed_with_signals",
      parsedManifests: [{ manifest: { path: "package.json", type: "package.json" }, dependencies: ["react"] }],
      artifacts: [],
      technologies: [{ technologyId: "react", name: "React", signals: ["Frontend"], evidence: [] }],
      outcome: "analyzed",
    };

    const mockAnalysisB: RepositoryAnalysisResult = {
      repositoryId: "repo_analyzed_no_signals",
      parsedManifests: [{ manifest: { path: "package.json", type: "package.json" }, dependencies: [] }],
      artifacts: [],
      technologies: [],
      outcome: "analyzed", // Zero signals, but has manifest -> analyzed
    };

    const mockAnalysisC: RepositoryAnalysisResult = {
      repositoryId: "repo_unsupported",
      parsedManifests: [],
      artifacts: [],
      technologies: [],
      outcome: "unsupported", // No manifests -> unsupported
    };

    const mockAnalysisD: RepositoryAnalysisResult = {
      repositoryId: "repo_failed",
      parsedManifests: [],
      artifacts: [],
      technologies: [],
      outcome: "failed",
      error: "GitHub API request failed",
    };

    vi.mocked(orchestration.analyzeRepository)
      .mockResolvedValueOnce(mockAnalysisA)
      .mockResolvedValueOnce(mockAnalysisB)
      .mockResolvedValueOnce(mockAnalysisC)
      .mockResolvedValueOnce(mockAnalysisD);

    const result = await analyzeFeaturedRepositories("user123", "token123");

    // Verify analyzeRepository calls have correct owners, repo names, and defaultBranches
    expect(orchestration.analyzeRepository).toHaveBeenNthCalledWith(1, {
      repositoryId: "repo_analyzed_with_signals",
      owner: "ownerA",
      repo: "repoA",
      accessToken: "token123",
      branch: "main",
    });

    expect(orchestration.analyzeRepository).toHaveBeenNthCalledWith(2, {
      repositoryId: "repo_analyzed_no_signals",
      owner: "ownerB",
      repo: "repoB",
      accessToken: "token123",
      branch: "master",
    });

    expect(orchestration.analyzeRepository).toHaveBeenNthCalledWith(3, {
      repositoryId: "repo_unsupported",
      owner: "ownerC",
      repo: "repoC",
      accessToken: "token123",
      branch: "develop",
    });

    expect(orchestration.analyzeRepository).toHaveBeenNthCalledWith(4, {
      repositoryId: "repo_failed",
      owner: "ownerD",
      repo: "repoD",
      accessToken: "token123",
      branch: "main",
    });

    // Verify result aggregation
    expect(result.totalRepositories).toBe(4);
    expect(result.analyzedRepositories).toBe(2); // Only repoA and repoB have outcome === "analyzed"
    expect(result.repositories).toHaveLength(4);
    expect(result.repositories[0]).toEqual(mockAnalysisA);
    expect(result.repositories[1]).toEqual(mockAnalysisB);
    expect(result.repositories[2]).toEqual(mockAnalysisC);
    expect(result.repositories[3]).toEqual(mockAnalysisD);
  });
});
