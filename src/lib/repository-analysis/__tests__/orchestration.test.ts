import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getRootGradleVersionCatalogContent,
  parseDiscoveredManifest,
} from "../orchestration";
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
     "main"
   );

   expect(githubClient.getGithubFileContent).toHaveBeenCalledWith(
     "token123",
     "octocat",
     "hello-world",
     "gradle/libs.versions.toml",
     "main"
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
     mockParser as ManifestParser
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

   const result = await parseDiscoveredManifest({
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
     "main"
   );
   expect(mockParser.parseWithContext).toHaveBeenCalledWith(
     expect.stringContaining("alias(libs.plugins.spring.boot)"),
     {
       manifestPath: "android/app/build.gradle.kts",
       gradleVersionCatalogContent: undefined,
     }
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
     mockParser as ManifestParser
   );

   vi.spyOn(githubClient, "getGithubFileContent")
     .mockResolvedValueOnce(`
plugins {
 alias(libs.plugins.spring.boot)
}

dependencies {
 implementation(libs.postgresql)
}
`)
     .mockResolvedValueOnce(`
plugins {
 alias(libs.plugins.spring.boot)
}
`);

   await Promise.all([
     parseDiscoveredManifest({
       manifest: {
         path: "android/app/build.gradle.kts",
         type: "build.gradle.kts",
       },
       owner: "octocat",
       repo: "hello-world",
       accessToken: "token123",
       branch: "main",
       gradleVersionCatalogContent: rootCatalog,
     }),
     parseDiscoveredManifest({
       manifest: {
         path: "android/feature/build.gradle",
         type: "build.gradle",
       },
       owner: "octocat",
       repo: "hello-world",
       accessToken: "token123",
       branch: "main",
       gradleVersionCatalogContent: rootCatalog,
     }),
   ]);

   expect(githubClient.getGithubFileContent).toHaveBeenCalledTimes(2);
   expect(githubClient.getGithubFileContent).toHaveBeenNthCalledWith(
     1,
     "token123",
     "octocat",
     "hello-world",
     "android/app/build.gradle.kts",
     "main"
   );
   expect(githubClient.getGithubFileContent).toHaveBeenNthCalledWith(
     2,
     "token123",
     "octocat",
     "hello-world",
     "android/feature/build.gradle",
     "main"
   );
   expect(mockParser.parseWithContext).toHaveBeenNthCalledWith(
     1,
     expect.stringContaining("implementation(libs.postgresql)"),
     {
       manifestPath: "android/app/build.gradle.kts",
       gradleVersionCatalogContent: rootCatalog,
     }
   );
   expect(mockParser.parseWithContext).toHaveBeenNthCalledWith(
     2,
     expect.stringContaining("alias(libs.plugins.spring.boot)"),
     {
       manifestPath: "android/feature/build.gradle",
       gradleVersionCatalogContent: rootCatalog,
     }
   );
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
