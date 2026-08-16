import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getGithubRepositoryTree } from "../client";

describe("getGithubRepositoryTree", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("should retrieve the recursive repository tree correctly", async () => {
    const mockResponse = {
      sha: "tree_sha_123",
      url: "https://api.github.com/repos/owner/repo/git/trees/tree_sha_123",
      tree: [
        {
          path: "package.json",
          mode: "100644",
          type: "blob",
          sha: "blob_sha_1",
          size: 250,
          url: "https://api.github.com/repos/owner/repo/git/blobs/blob_sha_1",
        },
        {
          path: "src",
          mode: "040000",
          type: "tree",
          sha: "tree_sha_2",
          url: "https://api.github.com/repos/owner/repo/git/trees/tree_sha_2",
        },
        {
          path: "src/index.ts",
          mode: "100644",
          type: "blob",
          sha: "blob_sha_2",
          size: 120,
          url: "https://api.github.com/repos/owner/repo/git/blobs/blob_sha_2",
        },
      ],
      truncated: false,
    };

    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const result = await getGithubRepositoryTree("token", "owner", "repo", "main");

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://api.github.com/repos/owner/repo/git/trees/main?recursive=1",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer token",
        }),
      })
    );

    expect(result.sha).toBe("tree_sha_123");
    expect(result.truncated).toBe(false);
    expect(result.tree).toHaveLength(3);
    
    // Distinguish files/blobs and directories/trees
    const packageJson = result.tree.find((entry) => entry.path === "package.json");
    expect(packageJson).toBeDefined();
    expect(packageJson?.type).toBe("blob");
    expect(packageJson?.size).toBe(250);

    const srcDir = result.tree.find((entry) => entry.path === "src");
    expect(srcDir).toBeDefined();
    expect(srcDir?.type).toBe("tree");
  });

  it("should propagate error when the HTTP request fails", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: "Not Found",
    } as Response);

    await expect(
      getGithubRepositoryTree("token", "owner", "repo", "main")
    ).rejects.toThrow("GitHub API request failed with status: 404 Not Found");
  });

  it("should propagate error when the response is missing tree", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ sha: "foo" }),
    } as Response);

    await expect(
      getGithubRepositoryTree("token", "owner", "repo", "main")
    ).rejects.toThrow("GitHub Git Trees API response missing tree or malformed");
  });
});
