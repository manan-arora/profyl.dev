import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { githubService } from "../github.service";
import * as oauth from "@/lib/auth/oauth";
import * as githubClient from "@/lib/github/client";
import { prisma } from "@/lib/prisma";
import { GitHubAuthError } from "@/lib/errors/GitHubAuthError";

vi.mock("@/lib/auth/oauth", () => ({
  getGithubAccessToken: vi.fn(),
}));

vi.mock("@/lib/github/client", () => ({
  getGithubProfile: vi.fn(),
  getGithubRepositories: vi.fn(),
  getGithubContributions: vi.fn(),
  getGithubMergedPRCount: vi.fn(),
  getGithubRepositoryLanguages: vi.fn(),
  getGithubReadme: vi.fn(),
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
      findMany: vi.fn().mockResolvedValue([]),
      createMany: vi.fn(),
      update: vi.fn(),
      upsert: vi.fn(),
      deleteMany: vi.fn(),
    },
    profile: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe("githubService.syncGithub", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.repository.findMany).mockResolvedValue([]);
  });

  it("should sync repositories and correctly persist the defaultBranch field via createMany for new repos", async () => {
    vi.mocked(oauth.getGithubAccessToken).mockResolvedValue("mock-token");
    vi.mocked(githubClient.getGithubReadme).mockResolvedValue("## Mock README");
    vi.mocked(prisma.profile.findUnique).mockResolvedValue(null);

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

    // Check Profile name and bio creation
    expect(prisma.profile.create).toHaveBeenCalledWith({
      data: {
        userId: "user_123",
        name: "Test User",
        bio: "bio",
      },
    });

    // Check repository createMany maps defaultBranch and readme for new repos
    expect(prisma.repository.createMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          userId: "user_123",
          githubRepoId: "999",
          name: "test-repo",
          defaultBranch: "develop", // Verifies custom default branch mapping
          stars: 42,
          forks: 7,
          readme: "## Mock README",
        }),
      ],
    });
  });

  it("should complete sync successfully even if getGithubReadme fails (swallows error)", async () => {
    vi.mocked(oauth.getGithubAccessToken).mockResolvedValue("mock-token");
    vi.mocked(githubClient.getGithubReadme).mockRejectedValue(
      new Error("GitHub API Error 404"),
    );
    vi.mocked(prisma.profile.findUnique).mockResolvedValue(null);

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
        homepage: null,
        language: "TypeScript",
        stargazers_count: 42,
        forks_count: 7,
        default_branch: "main",
        topics: [],
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
    vi.mocked(githubClient.getGithubRepositoryLanguages).mockResolvedValue({});

    const result = await githubService.syncGithub("user_123");

    expect(result.repositoriesSynced).toBe(1);

    // Check repository createMany maps readme as null due to failure
    expect(prisma.repository.createMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          readme: null,
        }),
      ],
    });
  });

  it("should not overwrite Profile.name if it is already populated", async () => {
    vi.mocked(oauth.getGithubAccessToken).mockResolvedValue("mock-token");
    vi.mocked(githubClient.getGithubReadme).mockResolvedValue("## Mock README");

    // Profile already has a name
    vi.mocked(prisma.profile.findUnique).mockResolvedValue({
      id: "profile_123",
      userId: "user_123",
      name: "Custom User Name",
    } as any);

    vi.mocked(githubClient.getGithubProfile).mockResolvedValue({
      id: 12345,
      login: "testuser",
      name: "GitHub Name", // Different name from GitHub
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

    vi.mocked(githubClient.getGithubRepositories).mockResolvedValue([]);
    // Mock existing profile with both name and bio populated
    vi.mocked(prisma.profile.findUnique).mockResolvedValue({
      id: "profile_1",
      userId: "user_123",
      name: "Existing Name",
      bio: "Existing Bio",
      headline: null,
      currentRole: null,
      currentCompany: null,
      yearsExperience: null,
      college: null,
      graduationYear: null,
      techStack: null,
      linkedinUrl: null,
      portfolioUrl: null,
      resumeUrl: null,
      branch: null,
      degree: null,
      location: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await githubService.syncGithub("user_123");

    // Profile.update should not be called to overwrite name or bio
    expect(prisma.profile.update).not.toHaveBeenCalled();
    expect(prisma.profile.create).not.toHaveBeenCalled();
  });

  it("should not overwrite or sync profile bio on subsequent syncs even if existing profile bio is null", async () => {
    vi.mocked(oauth.getGithubAccessToken).mockResolvedValue("mock-token");
    vi.mocked(prisma.profile.findUnique).mockResolvedValue({
      id: "profile_1",
      userId: "user_123",
      name: "Existing Name",
      bio: null,
      headline: null,
      currentRole: null,
      currentCompany: null,
      yearsExperience: null,
      college: null,
      graduationYear: null,
      techStack: null,
      linkedinUrl: null,
      portfolioUrl: null,
      resumeUrl: null,
      branch: null,
      degree: null,
      location: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    vi.mocked(githubClient.getGithubProfile).mockResolvedValue({
      id: 12345,
      login: "testuser",
      name: "Test User",
      avatar_url: "https://avatar.url",
      bio: "New GitHub Bio",
      company: null,
      location: null,
      blog: null,
      public_repos: 1,
      followers: 10,
      following: 5,
      created_at: "2020-01-01T00:00:00Z",
      updated_at: "2020-01-01T00:00:00Z",
    });

    vi.mocked(githubClient.getGithubRepositories).mockResolvedValue([]);
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

    await githubService.syncGithub("user_123");

    expect(prisma.profile.update).not.toHaveBeenCalled();
    expect(prisma.profile.create).not.toHaveBeenCalled();
  });

  it("should throw GitHubAuthError when Clerk has no GitHub OAuth token", async () => {
    vi.mocked(oauth.getGithubAccessToken).mockRejectedValue(
      new GitHubAuthError("No GitHub OAuth access token found for user"),
    );

    await expect(githubService.syncGithub("user_123")).rejects.toThrow(
      GitHubAuthError,
    );
    const error = new GitHubAuthError("test");
    expect(error).toBeInstanceOf(GitHubAuthError);
  });

  it("should throw GitHubAuthError when GitHub API returns 401 Unauthorized", async () => {
    vi.mocked(oauth.getGithubAccessToken).mockResolvedValue("mock-token");
    vi.mocked(githubClient.getGithubProfile).mockRejectedValue(
      new GitHubAuthError("GitHub API returned 401 Unauthorized"),
    );

    await expect(githubService.syncGithub("user_123")).rejects.toThrow(
      GitHubAuthError,
    );
  });

  it("should throw generic Error when GitHub API returns 403 Forbidden", async () => {
    vi.mocked(oauth.getGithubAccessToken).mockResolvedValue("mock-token");
    vi.mocked(githubClient.getGithubProfile).mockRejectedValue(
      new Error("GitHub API request failed with status: 403 Forbidden"),
    );

    // Should throw Error, not GitHubAuthError
    const error = await githubService.syncGithub("user_123").catch((e) => e);
    expect(error).toBeInstanceOf(Error);
    expect(error).not.toBeInstanceOf(GitHubAuthError);
  });

  it("should throw generic Error when GitHub API returns 500 Server Error", async () => {
    vi.mocked(oauth.getGithubAccessToken).mockResolvedValue("mock-token");
    vi.mocked(githubClient.getGithubProfile).mockRejectedValue(
      new Error(
        "GitHub API request failed with status: 500 Internal Server Error",
      ),
    );

    // Should throw Error, not GitHubAuthError
    const error = await githubService.syncGithub("user_123").catch((e) => e);
    expect(error).toBeInstanceOf(Error);
    expect(error).not.toBeInstanceOf(GitHubAuthError);
  });

  it("should update existing repositories using repository.update instead of createMany", async () => {
    vi.mocked(oauth.getGithubAccessToken).mockResolvedValue("mock-token");
    vi.mocked(githubClient.getGithubReadme).mockResolvedValue("## Updated README");
    vi.mocked(prisma.profile.findUnique).mockResolvedValue(null);

    // Existing repository in DB
    vi.mocked(prisma.repository.findMany).mockResolvedValue([
      { id: "repo_db_id_123", githubRepoId: "999" } as any,
    ]);

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

    vi.mocked(githubClient.getGithubRepositories).mockResolvedValue([
      {
        id: 999,
        name: "test-repo",
        full_name: "testuser/test-repo",
        description: "Updated description",
        private: false,
        fork: false,
        archived: false,
        html_url: "https://github.com/testuser/test-repo",
        homepage: null,
        language: "TypeScript",
        stargazers_count: 50,
        forks_count: 8,
        default_branch: "main",
        topics: ["react"],
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
    vi.mocked(githubClient.getGithubRepositoryLanguages).mockResolvedValue({});

    await githubService.syncGithub("user_123");

    // Should NOT call createMany
    expect(prisma.repository.createMany).not.toHaveBeenCalled();

    // Should call repository.update targeting existing DB record ID
    expect(prisma.repository.update).toHaveBeenCalledWith({
      where: { id: "repo_db_id_123" },
      data: expect.objectContaining({
        name: "test-repo",
        description: "Updated description",
        stars: 50,
        forks: 8,
        readme: "## Updated README",
      }),
    });
  });
});
