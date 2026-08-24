import { describe, it, expect, vi, beforeEach } from "vitest";
import { computeAnalytics } from "../analytics-engine";
import { prisma } from "@/lib/prisma";
import * as oauth from "@/lib/auth/oauth";
import * as featuredRepos from "../repository-analysis/featured-repositories";
import { Tier } from "../scoring/profyl-scorer";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    gitHubCache: {
      findUnique: vi.fn(),
    },
    leetCodeCache: {
      findUnique: vi.fn(),
    },
    analytics: {
      findUnique: vi.fn(),
    },
    repository: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth/oauth", () => ({
  getGithubAccessToken: vi.fn(),
}));

vi.mock("../repository-analysis/featured-repositories", () => ({
  analyzeFeaturedRepositories: vi.fn(),
}));

describe("Analytics Engine - computeAnalytics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockGithubCache = {
    totalContributionsLastYear: 100,
    contributionCalendar: {
      weeks: [
        {
          days: [{ count: 5 }, { count: 0 }],
        },
      ],
    },
    ossPrsMerged: 5,
    starsEarned: 10,
    forksEarned: 2,
  };

  const mockLeetcodeCache = {
    problemsSolved: 120,
    easySolved: 40,
    mediumSolved: 60,
    hardSolved: 20,
    percentile: 85.5,
    normalizedSubmissionCalendar: {
      days: [{ count: 1 }, { count: 0 }],
    },
  };

  const mockUserRepos = [
    {
      id: "repo1",
      isFork: false,
      isArchived: false,
      githubUpdatedAt: new Date(), // updated recently
    },
    {
      id: "repo2",
      isFork: false,
      isArchived: false,
      githubUpdatedAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000 * 2), // 2 years ago (not active)
    },
  ];

  it("should perform successful complete computation when Technical Range is available", async () => {
    vi.mocked(prisma.gitHubCache.findUnique).mockResolvedValueOnce(mockGithubCache as any);
    vi.mocked(prisma.leetCodeCache.findUnique).mockResolvedValueOnce(mockLeetcodeCache as any);
    vi.mocked(prisma.analytics.findUnique).mockResolvedValueOnce(null);
    vi.mocked(prisma.repository.findMany).mockResolvedValueOnce(mockUserRepos as any);
    vi.mocked(oauth.getGithubAccessToken).mockResolvedValueOnce("token123");

    // 1 analyzed repo with React -> Frontend (5 points)
    vi.mocked(featuredRepos.analyzeFeaturedRepositories).mockResolvedValueOnce({
      repositories: [
        {
          repositoryId: "repo1",
          parsedManifests: [],
          artifacts: [],
          technologies: [
            {
              technologyId: "react",
              name: "React",
              signals: ["Frontend"],
              evidence: [],
            },
          ],
          outcome: "analyzed",
        },
      ],
      totalRepositories: 1,
      analyzedRepositories: 1,
    });

    const result = await computeAnalytics("user123");

    // Verify token retrieval & repository scans
    expect(oauth.getGithubAccessToken).toHaveBeenCalledWith("user123");
    expect(featuredRepos.analyzeFeaturedRepositories).toHaveBeenCalledWith("user123", "token123");

    // Technical Range calculated based on analyzed repo (Frontend signal weight = 5)
    expect(result.projectsScore).toBe(5);
    expect(result.components.technicalRange?.signals).toContain("Frontend");

    // Assert that Profyl score and tier are computed successfully
    expect(result.profylScore).toBeGreaterThan(0);
    expect(result.tier).toBeDefined();
    expect(result.tier).not.toBeNull();
  });

  it("should successfully calculate Technical Range = 0 when repository is analyzed with zero recognized signals", async () => {
    vi.mocked(prisma.gitHubCache.findUnique).mockResolvedValueOnce(mockGithubCache as any);
    vi.mocked(prisma.leetCodeCache.findUnique).mockResolvedValueOnce(mockLeetcodeCache as any);
    vi.mocked(prisma.analytics.findUnique).mockResolvedValueOnce(null);
    vi.mocked(prisma.repository.findMany).mockResolvedValueOnce(mockUserRepos as any);
    vi.mocked(oauth.getGithubAccessToken).mockResolvedValueOnce("token123");

    vi.mocked(featuredRepos.analyzeFeaturedRepositories).mockResolvedValueOnce({
      repositories: [
        {
          repositoryId: "repo1",
          parsedManifests: [],
          artifacts: [],
          technologies: [], // zero signals
          outcome: "analyzed",
        },
      ],
      totalRepositories: 1,
      analyzedRepositories: 1,
    });

    const result = await computeAnalytics("user123");

    expect(result.projectsScore).toBe(0);
    expect(result.profylScore).not.toBeNull();
    expect(result.tier).not.toBeNull();
  });

  it("should exclude unsupported and failed repositories from Technical Range calculation", async () => {
    vi.mocked(prisma.gitHubCache.findUnique).mockResolvedValueOnce(mockGithubCache as any);
    vi.mocked(prisma.leetCodeCache.findUnique).mockResolvedValueOnce(mockLeetcodeCache as any);
    vi.mocked(prisma.analytics.findUnique).mockResolvedValueOnce(null);
    vi.mocked(prisma.repository.findMany).mockResolvedValueOnce(mockUserRepos as any);
    vi.mocked(oauth.getGithubAccessToken).mockResolvedValueOnce("token123");

    vi.mocked(featuredRepos.analyzeFeaturedRepositories).mockResolvedValueOnce({
      repositories: [
        {
          repositoryId: "repo_analyzed",
          parsedManifests: [],
          artifacts: [],
          technologies: [
            {
              technologyId: "react",
              name: "React",
              signals: ["Frontend"],
              evidence: [],
            },
          ],
          outcome: "analyzed",
        },
        {
          repositoryId: "repo_unsupported",
          parsedManifests: [],
          artifacts: [],
          technologies: [
            {
              technologyId: "unsupported_tech",
              name: "Unsupported",
              signals: ["Database"], // should be excluded
              evidence: [],
            },
          ],
          outcome: "unsupported",
        },
        {
          repositoryId: "repo_failed",
          parsedManifests: [],
          artifacts: [],
          technologies: [
            {
              technologyId: "failed_tech",
              name: "Failed Tech",
              signals: ["AI / ML"], // should be excluded
              evidence: [],
            },
          ],
          outcome: "failed",
        },
      ],
      totalRepositories: 3,
      analyzedRepositories: 1,
    });

    const result = await computeAnalytics("user123");

    // Only "react" (Frontend) should be included -> 5 points
    expect(result.projectsScore).toBe(5);
    expect(result.components.technicalRange?.signals).not.toContain("Database");
    expect(result.components.technicalRange?.signals).not.toContain("AI / ML");
  });

  it("should fall back to previous Analytics projectsScore when zero repositories are successfully analyzed", async () => {
    vi.mocked(prisma.gitHubCache.findUnique).mockResolvedValueOnce(mockGithubCache as any);
    vi.mocked(prisma.leetCodeCache.findUnique).mockResolvedValueOnce(mockLeetcodeCache as any);
    vi.mocked(prisma.analytics.findUnique).mockResolvedValueOnce({
      projectsScore: 42,
    } as any);
    vi.mocked(prisma.repository.findMany).mockResolvedValueOnce(mockUserRepos as any);
    vi.mocked(oauth.getGithubAccessToken).mockResolvedValueOnce("token123");

    vi.mocked(featuredRepos.analyzeFeaturedRepositories).mockResolvedValueOnce({
      repositories: [
        {
          repositoryId: "repo_unsupported",
          parsedManifests: [],
          artifacts: [],
          technologies: [],
          outcome: "unsupported",
        },
      ],
      totalRepositories: 1,
      analyzedRepositories: 0,
    });

    const result = await computeAnalytics("user123");

    expect(result.projectsScore).toBe(42);
    expect(result.profylScore).not.toBeNull();
    expect(result.tier).not.toBeNull();
  });

  it("should return null for projectsScore, profylScore, and tier when zero analyzed repos and no previous Analytics exist", async () => {
    vi.mocked(prisma.gitHubCache.findUnique).mockResolvedValueOnce(mockGithubCache as any);
    vi.mocked(prisma.leetCodeCache.findUnique).mockResolvedValueOnce(mockLeetcodeCache as any);
    vi.mocked(prisma.analytics.findUnique).mockResolvedValueOnce(null); // No previous analytics
    vi.mocked(prisma.repository.findMany).mockResolvedValueOnce(mockUserRepos as any);
    vi.mocked(oauth.getGithubAccessToken).mockResolvedValueOnce("token123");

    vi.mocked(featuredRepos.analyzeFeaturedRepositories).mockResolvedValueOnce({
      repositories: [
        {
          repositoryId: "repo_failed",
          parsedManifests: [],
          artifacts: [],
          technologies: [],
          outcome: "failed",
        },
      ],
      totalRepositories: 1,
      analyzedRepositories: 0,
    });

    const result = await computeAnalytics("user123");

    // Verify nulls propagate correctly
    expect(result.projectsScore).toBeNull();
    expect(result.profylScore).toBeNull();
    expect(result.tier).toBeNull();

    // Other scores are still computed
    expect(result.githubScore).toBeGreaterThan(0);
    expect(result.leetcodeScore).toBeGreaterThan(0);
    expect(result.consistencyScore).toBeGreaterThan(0);
  });
});
