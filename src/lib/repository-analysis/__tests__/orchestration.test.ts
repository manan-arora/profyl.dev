import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { parseDiscoveredManifest } from "../orchestration";
import * as parserRegistry from "../parser-registry";
import * as githubClient from "@/lib/github/client";
import { ManifestParser, DiscoveredManifest } from "@/types/scanner";

describe("parseDiscoveredManifest", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should fetch decoded content and route it to the mapped parser", async () => {
    const mockParser: ManifestParser = {
      parse: vi.fn().mockReturnValue(["next", "react", "@prisma/client"]),
    };

    vi.spyOn(parserRegistry, "getParser").mockReturnValue(mockParser);

    vi.spyOn(githubClient, "getGithubFileContent").mockResolvedValueOnce(
      '{\n  "dependencies": { "next": "16.2.10" }\n}'
    );

    const manifest: DiscoveredManifest = {
      path: "apps/web/package.json",
      type: "package.json",
    };

    const result = await parseDiscoveredManifest({
      manifest,
      owner: "octocat",
      repo: "hello-world",
      accessToken: "token123",
      branch: "main",
    });

    expect(parserRegistry.getParser).toHaveBeenCalledWith("package.json");

    expect(githubClient.getGithubFileContent).toHaveBeenCalledWith(
      "token123",
      "octocat",
      "hello-world",
      "apps/web/package.json",
      "main"
    );

    // Verify parser received decoded UTF-8 text directly
    expect(mockParser.parse).toHaveBeenCalledWith(
      '{\n  "dependencies": { "next": "16.2.10" }\n}'
    );

    expect(result).toEqual({
      manifest,
      dependencies: ["next", "react", "@prisma/client"],
    });
  });

  it("should throw an error when no parser is registered for the manifest type", async () => {
    vi.spyOn(parserRegistry, "getParser").mockReturnValue(undefined);

    const manifest: DiscoveredManifest = {
      path: "pom.xml",
      type: "pom.xml",
    };

    await expect(
      parseDiscoveredManifest({
        manifest,
        owner: "octocat",
        repo: "hello-world",
        accessToken: "token123",
        branch: "main",
      })
    ).rejects.toThrow("No parser registered for manifest type: pom.xml");
  });

  it("should propagate GitHub content retrieval errors", async () => {
    const mockParser: ManifestParser = {
      parse: () => [],
    };
    vi.spyOn(parserRegistry, "getParser").mockReturnValue(mockParser);

    vi.spyOn(githubClient, "getGithubFileContent").mockRejectedValueOnce(
      new Error("GitHub API request failed with status: 404 Not Found")
    );

    const manifest: DiscoveredManifest = {
      path: "go.mod",
      type: "go.mod",
    };

    await expect(
      parseDiscoveredManifest({
        manifest,
        owner: "octocat",
        repo: "hello-world",
        accessToken: "token123",
        branch: "main",
      })
    ).rejects.toThrow("GitHub API request failed with status: 404 Not Found");
  });
});
