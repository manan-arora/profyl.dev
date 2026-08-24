import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  analyzeManifests,
  getRootGradleVersionCatalogContent,
  parseManifest,
} from "../orchestration";
import * as parserRegistry from "../parser-registry";
import * as repositoryScanner from "../scanner";
import * as githubClient from "@/lib/github/client";
import {
  ManifestParser,
  DiscoveredManifest,
  RepositoryScanResult,
} from "@/types/scanner";

describe("parseManifest", () => {
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
      '{\n  "dependencies": { "next": "16.2.10" }\n}',
    );

    const manifest: DiscoveredManifest = {
      path: "apps/web/package.json",
      type: "package.json",
    };

    const result = await parseManifest({
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
      "main",
    );

    // Verify parser received decoded UTF-8 text directly
    expect(mockParser.parse).toHaveBeenCalledWith(
      '{\n  "dependencies": { "next": "16.2.10" }\n}',
    );

    expect(result).toEqual({
      manifest,
      dependencies: ["next", "react", "@prisma/client"],
    });
  });

  it("should fetch the repository-root Gradle version catalog when present", async () => {
    vi.spyOn(githubClient, "getGithubFileContent").mockResolvedValueOnce(`
[libraries]
postgresql = { module = "org.postgresql:postgresql", version = "42.7.0" }

[plugins]
spring-boot = { id = "org.springframework.boot", version = "3.4.0" }
`);

    const catalog = await getRootGradleVersionCatalogContent(
      "token123",
      "octocat",
      "hello-world",
      "main",
    );

    expect(githubClient.getGithubFileContent).toHaveBeenCalledWith(
      "token123",
      "octocat",
      "hello-world",
      "gradle/libs.versions.toml",
      "main",
    );
    expect(catalog).toContain("[libraries]");
    expect(catalog).toContain("org.postgresql:postgresql");
  });

  it("should not fetch a Gradle version catalog when no root catalog is available", async () => {
    const mockParser = {
      parse: vi.fn().mockReturnValue([]),
      parseWithContext: vi.fn().mockReturnValue(["org.springframework.boot"]),
    };

    vi.spyOn(parserRegistry, "getParser").mockReturnValue(
      mockParser as ManifestParser,
    );

    vi.spyOn(githubClient, "getGithubFileContent").mockResolvedValueOnce(`
plugins {
 alias(libs.plugins.spring.boot)
}
`);

    const manifest: DiscoveredManifest = {
      path: "android/app/build.gradle.kts",
      type: "build.gradle.kts",
    };

    const result = await parseManifest({
      manifest,
      owner: "octocat",
      repo: "hello-world",
      accessToken: "token123",
      branch: "main",
      gradleVersionCatalogContent: undefined,
    });

    expect(githubClient.getGithubFileContent).toHaveBeenCalledTimes(1);
    expect(githubClient.getGithubFileContent).toHaveBeenCalledWith(
      "token123",
      "octocat",
      "hello-world",
      "android/app/build.gradle.kts",
      "main",
    );
    expect(mockParser.parseWithContext).toHaveBeenCalledWith(
      expect.stringContaining("alias(libs.plugins.spring.boot)"),
      {
        manifestPath: "android/app/build.gradle.kts",
        gradleVersionCatalogContent: undefined,
      },
    );
    expect(result).toEqual({
      manifest,
      dependencies: ["org.springframework.boot"],
    });
  });

  it("should reuse the same repository-root Gradle catalog across multiple manifests", async () => {
    const rootCatalog = `
[libraries]
postgresql = { module = "org.postgresql:postgresql", version = "42.7.0" }

[plugins]
spring-boot = { id = "org.springframework.boot", version = "3.4.0" }
`;

    const mockParser = {
      parse: vi.fn().mockReturnValue([]),
      parseWithContext: vi.fn().mockImplementation((content: string) => {
        if (content.includes("implementation(libs.postgresql)")) {
          return ["org.postgresql:postgresql"];
        }
        return ["org.springframework.boot"];
      }),
    };

    vi.spyOn(parserRegistry, "getParser").mockReturnValue(
      mockParser as ManifestParser,
    );

    vi
      .spyOn(githubClient, "getGithubFileContent")
      .mockResolvedValueOnce(rootCatalog).mockResolvedValueOnce(`
plugins {
 alias(libs.plugins.spring.boot)
}

dependencies {
 implementation(libs.postgresql)
}
`).mockResolvedValueOnce(`
plugins {
 alias(libs.plugins.spring.boot)
}
`);

    await analyzeManifests({
      manifests: [
        {
          path: "android/app/build.gradle.kts",
          type: "build.gradle.kts",
        },
        {
          path: "android/feature/build.gradle",
          type: "build.gradle",
        },
      ],
      hasRootGradleVersionCatalog: true,
      owner: "octocat",
      repo: "hello-world",
      accessToken: "token123",
      branch: "main",
    });

    expect(githubClient.getGithubFileContent).toHaveBeenCalledTimes(3);
    expect(githubClient.getGithubFileContent).toHaveBeenNthCalledWith(
      1,
      "token123",
      "octocat",
      "hello-world",
      "gradle/libs.versions.toml",
      "main",
    );
    expect(githubClient.getGithubFileContent).toHaveBeenNthCalledWith(
      2,
      "token123",
      "octocat",
      "hello-world",
      "android/app/build.gradle.kts",
      "main",
    );
    expect(githubClient.getGithubFileContent).toHaveBeenNthCalledWith(
      3,
      "token123",
      "octocat",
      "hello-world",
      "android/feature/build.gradle",
      "main",
    );
    expect(mockParser.parseWithContext).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("implementation(libs.postgresql)"),
      {
        manifestPath: "android/app/build.gradle.kts",
        gradleVersionCatalogContent: rootCatalog,
      },
    );
    expect(mockParser.parseWithContext).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("alias(libs.plugins.spring.boot)"),
      {
        manifestPath: "android/feature/build.gradle",
        gradleVersionCatalogContent: rootCatalog,
      },
    );
  });

  it("should parse every discovered manifest in order", async () => {
    const mockParser: ManifestParser = {
      parse: vi.fn().mockReturnValue(["dependency"]),
    };

    vi.spyOn(parserRegistry, "getParser").mockReturnValue(mockParser);
    vi.spyOn(githubClient, "getGithubFileContent")
      .mockResolvedValueOnce("package content")
      .mockResolvedValueOnce("go content")
      .mockResolvedValueOnce("pom content");

    const manifests: DiscoveredManifest[] = [
      { path: "web/package.json", type: "package.json" },
      { path: "services/go.mod", type: "go.mod" },
      { path: "server/pom.xml", type: "pom.xml" },
    ];

    await expect(
      analyzeManifests({
        manifests,
        hasRootGradleVersionCatalog: false,
        owner: "octocat",
        repo: "hello-world",
        accessToken: "token123",
        branch: "main",
      }),
    ).resolves.toEqual(
      manifests.map((manifest) => ({ manifest, dependencies: ["dependency"] })),
    );

    expect(mockParser.parse).toHaveBeenCalledTimes(3);
  });

  it("should compose scanRepository and analyzeManifests", async () => {
    const scan: RepositoryScanResult = {
      repositoryId: "repo_123",
      manifests: [{ path: "package.json", type: "package.json" }],
      artifacts: [{ path: "Dockerfile", type: "dockerfile" }],
      truncated: false,
      hasRootGradleVersionCatalog: false,
    };
    const mockParser: ManifestParser = {
      parse: vi.fn().mockReturnValue(["next"]),
    };

    vi.spyOn(repositoryScanner, "scanRepository").mockResolvedValue(scan);
    vi.spyOn(parserRegistry, "getParser").mockReturnValue(mockParser);
    vi.spyOn(githubClient, "getGithubFileContent").mockResolvedValue(
      '{ "dependencies": { "next": "16.2.10" } }',
    );

    const { analyzeRepository } = await import("../orchestration");
    const result = await analyzeRepository({
      repositoryId: "repo_123",
      owner: "octocat",
      repo: "hello-world",
      accessToken: "token123",
      branch: "main",
    });

    expect(repositoryScanner.scanRepository).toHaveBeenCalledWith({
      repositoryId: "repo_123",
      owner: "octocat",
      repo: "hello-world",
      accessToken: "token123",
      branch: "main",
      maxDepth: undefined,
    });
    expect(result).toEqual({
      repositoryId: "repo_123",
      parsedManifests: [
        { manifest: scan.manifests[0], dependencies: ["next"] },
      ],
      artifacts: [{ path: "Dockerfile", type: "dockerfile" }],
      technologies: [
        {
          technologyId: "docker",
          name: "Docker",
          signals: ["Infrastructure"],
          evidence: [
            {
              source: "artifact",
              identifier: "dockerfile",
              path: "Dockerfile",
            },
          ],
        },
        {
          technologyId: "nextjs",
          name: "Next.js",
          signals: ["Frontend", "Backend"],
          evidence: [
            {
              source: "manifest",
              ecosystem: "npm",
              identifier: "next",
              path: "package.json",
            },
          ],
        },
      ],
      outcome: "analyzed",
    });

    // Verify it doesn't expose any unwanted/raw scan fields
    expect(result).not.toHaveProperty("scan");
    expect(result).not.toHaveProperty("manifests");
    expect(result).not.toHaveProperty("truncated");
    expect(result).not.toHaveProperty("hasRootGradleVersionCatalog");
  });

  it("should throw an error when no parser is registered for the manifest type", async () => {
    vi.spyOn(parserRegistry, "getParser").mockReturnValue(undefined);

    const manifest: DiscoveredManifest = {
      path: "pom.xml",
      type: "pom.xml",
    };

    await expect(
      parseManifest({
        manifest,
        owner: "octocat",
        repo: "hello-world",
        accessToken: "token123",
        branch: "main",
      }),
    ).rejects.toThrow("No parser registered for manifest type: pom.xml");
  });

  it("should propagate GitHub content retrieval errors", async () => {
    const mockParser: ManifestParser = {
      parse: () => [],
    };
    vi.spyOn(parserRegistry, "getParser").mockReturnValue(mockParser);

    vi.spyOn(githubClient, "getGithubFileContent").mockRejectedValueOnce(
      new Error("GitHub API request failed with status: 404 Not Found"),
    );

    const manifest: DiscoveredManifest = {
      path: "go.mod",
      type: "go.mod",
    };

    await expect(
      parseManifest({
        manifest,
        owner: "octocat",
        repo: "hello-world",
        accessToken: "token123",
        branch: "main",
      }),
    ).rejects.toThrow("GitHub API request failed with status: 404 Not Found");
  });
});
