import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { scanRepository } from "../scanner";
import * as githubClient from "@/lib/github/client";
import { GithubRepositoryTree } from "@/types/github";

describe("scanRepository", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should preserve repositoryId, return discovered manifests/artifacts, and propagate truncated status", async () => {
    const mockTreeResult: GithubRepositoryTree = {
      sha: "tree_sha_123",
      url: "https://api.github.com/tree_sha_123",
      truncated: true,
      tree: [
        {
          path: "package.json",
          type: "blob",
          sha: "b1",
          url: "u1",
        },
        {
          path: "backend/pom.xml",
          type: "blob",
          sha: "b2",
          url: "u2",
        },
        {
          path: "README.md",
          type: "blob",
          sha: "b3",
          url: "u3",
        },
      ],
    };

    vi.spyOn(githubClient, "getGithubRepositoryTree").mockResolvedValueOnce(
      mockTreeResult
    );

    const result = await scanRepository({
      repositoryId: "repo_cat_123",
      owner: "octocat",
      repo: "hello-world",
      accessToken: "gho_token",
      branch: "main",
    });

    expect(githubClient.getGithubRepositoryTree).toHaveBeenCalledTimes(1);
    expect(githubClient.getGithubRepositoryTree).toHaveBeenCalledWith(
      "gho_token",
      "octocat",
      "hello-world",
      "main"
    );

    expect(result).toEqual({
      repositoryId: "repo_cat_123",
      manifests: [
        { path: "package.json", type: "package.json" },
        { path: "backend/pom.xml", type: "pom.xml" },
      ],
      artifacts: [],
      truncated: true,
      hasRootGradleVersionCatalog: false,
    });
  });

  it("should discover both manifests and artifacts from the same fetched tree, including Gradle version catalog detection", async () => {
    const mockTreeResult: GithubRepositoryTree = {
      sha: "tree_sha_456",
      url: "https://api.github.com/tree_sha_456",
      truncated: false,
      tree: [
        {
          path: "package.json",
          type: "blob",
          sha: "m1",
          url: "mu1",
        },
        {
          path: "Dockerfile",
          type: "blob",
          sha: "a1",
          url: "au1",
        },
        {
          path: ".github/workflows/deploy.yml",
          type: "blob",
          sha: "a2",
          url: "au2",
        },
        {
          path: "gradle/libs.versions.toml",
          type: "blob",
          sha: "g1",
          url: "gu1",
        },
      ],
    };

    vi.spyOn(githubClient, "getGithubRepositoryTree").mockResolvedValueOnce(
      mockTreeResult
    );

    const result = await scanRepository({
      repositoryId: "repo_cat_456",
      owner: "octocat",
      repo: "demo-repo",
      accessToken: "gho_token",
      branch: "main",
    });

    // Verify it was only called once, implying both lists were derived from the same tree
    expect(githubClient.getGithubRepositoryTree).toHaveBeenCalledTimes(1);

    expect(result).toEqual({
      repositoryId: "repo_cat_456",
      manifests: [
        { path: "package.json", type: "package.json" },
      ],
      artifacts: [
        { path: "Dockerfile", type: "dockerfile" },
        { path: ".github/workflows/deploy.yml", type: "github-actions" },
      ],
      truncated: false,
      hasRootGradleVersionCatalog: true,
    });
  });

  it("should handle empty or no-match trees correctly", async () => {
    const mockTreeResult: GithubRepositoryTree = {
      sha: "tree_sha_empty",
      url: "https://api.github.com/tree_sha_empty",
      truncated: false,
      tree: [
        {
          path: "README.md",
          type: "blob",
          sha: "r1",
          url: "ru1",
        },
        {
          path: "src/index.ts",
          type: "blob",
          sha: "s1",
          url: "su1",
        },
      ],
    };

    vi.spyOn(githubClient, "getGithubRepositoryTree").mockResolvedValueOnce(
      mockTreeResult
    );

    const result = await scanRepository({
      repositoryId: "repo_empty",
      owner: "octocat",
      repo: "empty-repo",
      accessToken: "gho_token",
      branch: "main",
    });

    expect(result).toEqual({
      repositoryId: "repo_empty",
      manifests: [],
      artifacts: [],
      truncated: false,
      hasRootGradleVersionCatalog: false,
    });
  });

  it("should propagate GitHub tree retrieval failures", async () => {
    vi.spyOn(githubClient, "getGithubRepositoryTree").mockRejectedValueOnce(
      new Error("GitHub API request failed with status: 404 Not Found")
    );

    await expect(
      scanRepository({
        repositoryId: "repo_404",
        owner: "octocat",
        repo: "unknown-repo",
        accessToken: "gho_token",
        branch: "main",
      })
    ).rejects.toThrow("GitHub API request failed with status: 404 Not Found");
  });
});
