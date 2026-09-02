import { describe, it, expect, vi, beforeEach } from "vitest";
import { githubService } from "../github.service";
import * as oauth from "@/lib/auth/oauth";
import * as githubClient from "@/lib/github/client";
import { prisma } from "@/lib/prisma";
import { GitHubAuthError } from "@/lib/errors/GitHubAuthError";
import { GraphQLRepositoryNode } from "@/types/github";

vi.mock("@/lib/auth/oauth", () => ({
  getGithubAccessToken: vi.fn(),
}));

vi.mock("@/lib/github/client", () => ({
  getGithubProfile: vi.fn(),
  getGithubRepositories: vi.fn(),
  getGithubRepositoriesGraphQL: vi.fn(),
  getGithubContributions: vi.fn(),
  getGithubMergedPRCount: vi.fn(),
  getGithubRepositoryLanguages: vi.fn(),
  getGithubReadme: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: vi.fn((cb) => cb(prisma)),
    $executeRawUnsafe: vi.fn().mockResolvedValue(1),
    user: {
      update: vi.fn().mockResolvedValue({}),
    },
    gitHubCache: {
      upsert: vi.fn().mockResolvedValue({}),
      findUnique: vi.fn().mockResolvedValue(null),
    },
    repository: {
      findMany: vi.fn().mockResolvedValue([]),
      createMany: vi.fn().mockResolvedValue({ count: 0 }),
      update: vi.fn().mockResolvedValue({}),
      deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
    },
    profile: {
      findUnique: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({}),
      update: vi.fn().mockResolvedValue({}),
    },
  },
}));

function createMockGraphQLNode(overrides: Partial<GraphQLRepositoryNode> = {}): GraphQLRepositoryNode {
  return {
    databaseId: 999,
    name: "test-repo",
    nameWithOwner: "testuser/test-repo",
    description: "A test repository",
    isPrivate: false,
    isFork: false,
    isArchived: false,
    stargazerCount: 42,
    forkCount: 7,
    primaryLanguage: { name: "TypeScript" },
    languages: {
      edges: [
        { size: 1000, node: { name: "TypeScript" } },
        { size: 500, node: { name: "JavaScript" } },
      ],
    },
    repositoryTopics: {
      nodes: [{ topic: { name: "nextjs" } }, { topic: { name: "prisma" } }],
    },
    url: "https://github.com/testuser/test-repo",
    homepageUrl: "https://homepage.com",
    defaultBranchRef: { name: "develop" },
    updatedAt: "2025-01-02T00:00:00Z",
    ...overrides,
  };
}

describe("githubService.syncGithub", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.repository.findMany).mockResolvedValue([]);
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
      public_repos: 1,
      followers: 10,
      following: 5,
      created_at: "2020-01-01T00:00:00Z",
      updated_at: "2020-01-01T00:00:00Z",
    });
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
  });

  it("should sync repositories using GraphQL pagination and bulk UPSERT", async () => {
    const mockRepoNode = createMockGraphQLNode();
    vi.mocked(githubClient.getGithubRepositoriesGraphQL).mockResolvedValue([mockRepoNode]);

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

    // Check Profile creation
    expect(prisma.profile.create).toHaveBeenCalledWith({
      data: {
        userId: "user_123",
        name: "Test User",
        bio: "bio",
      },
    });

    // Check bulk UPSERT raw SQL execution
    expect(prisma.$executeRawUnsafe).toHaveBeenCalledTimes(1);
    const rawSqlCall = vi.mocked(prisma.$executeRawUnsafe).mock.calls[0];
    expect(rawSqlCall[0]).toContain('INSERT INTO "Repository"');
    expect(rawSqlCall[0]).toContain('ON CONFLICT ("githubRepoId") DO UPDATE SET');
  });

  it("should handle 0 eligible repositories cleanly", async () => {
    vi.mocked(githubClient.getGithubRepositoriesGraphQL).mockResolvedValue([]);

    const result = await githubService.syncGithub("user_123");

    expect(result.repositoriesSynced).toBe(0);
    expect(prisma.$executeRawUnsafe).not.toHaveBeenCalled();
    expect(prisma.repository.deleteMany).toHaveBeenCalledWith({
      where: {
        userId: "user_123",
        githubRepoId: { notIn: [] },
      },
    });
  });

  it("should filter out private, forked, and archived repositories", async () => {
    const validRepo = createMockGraphQLNode({ databaseId: 101 });
    const privateRepo = createMockGraphQLNode({ databaseId: 102, isPrivate: true });
    const forkRepo = createMockGraphQLNode({ databaseId: 103, isFork: true });
    const archivedRepo = createMockGraphQLNode({ databaseId: 104, isArchived: true });

    vi.mocked(githubClient.getGithubRepositoriesGraphQL).mockResolvedValue([
      validRepo,
      privateRepo,
      forkRepo,
      archivedRepo,
    ]);

    const result = await githubService.syncGithub("user_123");

    expect(result.repositoriesSynced).toBe(1);
    expect(prisma.repository.deleteMany).toHaveBeenCalledWith({
      where: {
        userId: "user_123",
        githubRepoId: { notIn: ["101"] },
      },
    });
  });

  it("should handle 44 and 250 repositories without timing out or throwing P2028", async () => {
    const repos44 = Array.from({ length: 44 }, (_, i) =>
      createMockGraphQLNode({ databaseId: 1000 + i, name: `repo-${i}` })
    );

    vi.mocked(githubClient.getGithubRepositoriesGraphQL).mockResolvedValue(repos44);

    const result = await githubService.syncGithub("user_123");

    expect(result.repositoriesSynced).toBe(44);
    // Verified: exactly 1 bulk UPSERT query for all 44 repos!
    expect(prisma.$executeRawUnsafe).toHaveBeenCalledTimes(1);
  });

  it("should satisfy idempotency when executed multiple times", async () => {
    const mockRepoNode = createMockGraphQLNode();
    vi.mocked(githubClient.getGithubRepositoriesGraphQL).mockResolvedValue([mockRepoNode]);

    await githubService.syncGithub("user_123");
    await githubService.syncGithub("user_123");

    expect(prisma.$executeRawUnsafe).toHaveBeenCalledTimes(2);
    expect(prisma.user.update).toHaveBeenCalledTimes(2);
  });

  it("should throw and roll back transaction when persistence fails", async () => {
    const mockRepoNode = createMockGraphQLNode();
    vi.mocked(githubClient.getGithubRepositoriesGraphQL).mockResolvedValue([mockRepoNode]);

    // Simulate database failure during bulk upsert
    vi.mocked(prisma.$executeRawUnsafe).mockRejectedValue(new Error("Database connection lost"));

    await expect(githubService.syncGithub("user_123")).rejects.toThrow("Database connection lost");
  });

  it("should throw GitHubAuthError when Clerk has no GitHub OAuth token", async () => {
    vi.mocked(oauth.getGithubAccessToken).mockRejectedValue(
      new GitHubAuthError("No GitHub OAuth access token found for user")
    );

    await expect(githubService.syncGithub("user_123")).rejects.toThrow(GitHubAuthError);
  });
});
