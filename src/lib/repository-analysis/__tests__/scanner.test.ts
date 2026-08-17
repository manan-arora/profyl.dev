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

  it("should preserve repositoryId, return discovered manifests, and propagate truncated status", async () => {
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
      truncated: true,
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
