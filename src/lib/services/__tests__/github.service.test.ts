import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { githubService } from "../github.service";
import * as oauth from "@/lib/auth/oauth";
import * as githubClient from "@/lib/github/client";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/auth/oauth", () => ({
  getGithubAccessToken: vi.fn(),
}));

vi.mock("@/lib/github/client", () => ({
  getGithubProfile: vi.fn(),
  getGithubRepositories: vi.fn(),
  getGithubContributions: vi.fn(),
  getGithubMergedPRCount: vi.fn(),
  getGithubRepositoryLanguages: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: vi.fn((cb) => cb(prisma)),
    user: {
      update: vi.fn(),
    },
    gitHubCache: {
      upsert: vi.fn(),
    },
    repository: {
      upsert: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

describe("githubService.syncGithub", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should sync repositories and correctly persist the defaultBranch field", async () => {
    vi.mocked(oauth.getGithubAccessToken).mockResolvedValue("mock-token");

    vi.mocked(githubClient.getGithubProfile).mockResolvedValue({
      id: 12345,
      login: "testuser",
      name: "Test User",
      avatar_url: "https://avatar.url",
      bio: "bio",
      company: null,
      location: null,
      blog: null,
      public_repos: 2,
      followers: 10,
      following: 5,
      created_at: "2020-01-01T00:00:00Z",
      updated_at: "2020-01-01T00:00:00Z",
    });

    vi.mocked(githubClient.getGithubRepositories).mockResolvedValue([
      {
        id: 999,
        name: "test-repo",
        full_name: "testuser/test-repo",
        description: "A test repository",
        private: false,
        fork: false,
        archived: false,
        html_url: "https://github.com/testuser/test-repo",
        homepage: "https://homepage.com",
        language: "TypeScript",
        stargazers_count: 42,
        forks_count: 7,
        default_branch: "develop", // Non-standard default branch
        topics: ["nextjs", "prisma"],
        created_at: "2025-01-01T00:00:00Z",
        updated_at: "2025-01-02T00:00:00Z",
        pushed_at: "2025-01-02T00:00:00Z",
      },
    ]);

    vi.mocked(githubClient.getGithubContributions).mockResolvedValue({
      viewer: {
        login: "testuser",
        contributionsCollection: {
          contributionCalendar: {
            totalContributions: 100,
            weeks: [],
          },
        },
      },
    });

    vi.mocked(githubClient.getGithubMergedPRCount).mockResolvedValue(5);
    vi.mocked(githubClient.getGithubRepositoryLanguages).mockResolvedValue({
      TypeScript: 1000,
    });

    const result = await githubService.syncGithub("user_123");

    expect(result).toEqual({
      githubUsername: "testuser",
      repositoriesSynced: 1,
    });

    // Check user profile update
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "user_123" },
      data: {
        githubId: "12345",
        githubUsername: "testuser",
      },
    });

    // Check repository upsert maps defaultBranch
    expect(prisma.repository.upsert).toHaveBeenCalledWith({
      where: { githubRepoId: "999" },
      update: expect.objectContaining({
        name: "test-repo",
        defaultBranch: "develop", // Verifies custom default branch mapping
        stars: 42,
        forks: 7,
      }),
      create: expect.objectContaining({
        userId: "user_123",
        githubRepoId: "999",
        name: "test-repo",
        defaultBranch: "develop",
        stars: 42,
        forks: 7,
      }),
    });
  });
});
