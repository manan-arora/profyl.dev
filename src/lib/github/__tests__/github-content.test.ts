import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getGithubFileContent } from "../client";

describe("getGithubFileContent", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("should retrieve file content and decode base64 correctly", async () => {
    const rawText = "{\n  \"name\": \"profyl\"\n}";
    const base64Content = Buffer.from(rawText, "utf-8").toString("base64");

    const mockResponse = {
      type: "file",
      encoding: "base64",
      size: rawText.length,
      name: "package.json",
      path: "package.json",
      content: base64Content,
      sha: "sha123",
    };

    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const content = await getGithubFileContent(
      "token123",
      "owner",
      "repo",
      "package.json",
      "main"
    );

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://api.github.com/repos/owner/repo/contents/package.json?ref=main",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer token123",
        }),
      })
    );

    expect(content).toBe(rawText);
  });

  it("should handle nested paths with URL encoding", async () => {
    const rawText = "dependencies = []";
    const base64Content = Buffer.from(rawText, "utf-8").toString("base64");

    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        type: "file",
        encoding: "base64",
        content: base64Content,
      }),
    } as Response);

    const content = await getGithubFileContent(
      "token123",
      "owner",
      "repo",
      "apps/web/pyproject.toml",
      "main"
    );

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://api.github.com/repos/owner/repo/contents/apps/web/pyproject.toml?ref=main",
      expect.anything()
    );

    expect(content).toBe(rawText);
  });

  it("should throw an error when HTTP request fails (non-2xx)", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: "Not Found",
    } as Response);

    await expect(
      getGithubFileContent("token123", "owner", "repo", "missing.json", "main")
    ).rejects.toThrow("GitHub API request failed with status: 404 Not Found");
  });

  it("should throw an error when response represents a directory (array or type dir)", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { name: "file1.txt", type: "file" },
        { name: "file2.txt", type: "file" },
      ],
    } as Response);

    await expect(
      getGithubFileContent("token123", "owner", "repo", "src", "main")
    ).rejects.toThrow("GitHub contents API returned non-file response for path: src");

    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        type: "dir",
        name: "src",
        path: "src",
      }),
    } as Response);

    await expect(
      getGithubFileContent("token123", "owner", "repo", "src", "main")
    ).rejects.toThrow("GitHub contents API path is not a file: src (type: dir)");
  });
});
