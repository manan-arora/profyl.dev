import { describe, it, expect } from "vitest";
import { GithubTreeEntry } from "@/types/github";
import { discoverManifests, getPathDepth, DEFAULT_MAX_SCAN_DEPTH } from "../discovery";

describe("getPathDepth", () => {
  it("should return 0 for root files", () => {
    expect(getPathDepth("package.json")).toBe(0);
  });

  it("should return correct depth for nested files", () => {
    expect(getPathDepth("backend/pom.xml")).toBe(1);
    expect(getPathDepth("apps/api/pom.xml")).toBe(2);
    expect(getPathDepth("apps/api/service/go.mod")).toBe(3);
  });
});

describe("discoverManifests", () => {
  it("Test 1 — should discover root manifest", () => {
    const tree: GithubTreeEntry[] = [
      { path: "package.json", type: "blob", sha: "s1", url: "u1" },
    ];

    const result = discoverManifests(tree);
    expect(result).toEqual([
      { path: "package.json", type: "package.json" },
    ]);
  });

  it("Test 2 — should discover nested manifest", () => {
    const tree: GithubTreeEntry[] = [
      { path: "backend/pom.xml", type: "blob", sha: "s1", url: "u1" },
    ];

    const result = discoverManifests(tree);
    expect(result).toEqual([
      { path: "backend/pom.xml", type: "pom.xml" },
    ]);
  });

  it("Test 3 — should discover multiple manifests", () => {
    const tree: GithubTreeEntry[] = [
      { path: "frontend/package.json", type: "blob", sha: "s1", url: "u1" },
      { path: "backend/pom.xml", type: "blob", sha: "s2", url: "u2" },
      { path: "worker/requirements.txt", type: "blob", sha: "s3", url: "u3" },
    ];

    const result = discoverManifests(tree);
    expect(result).toEqual([
      { path: "frontend/package.json", type: "package.json" },
      { path: "backend/pom.xml", type: "pom.xml" },
      { path: "worker/requirements.txt", type: "requirements.txt" },
    ]);
  });

  it("Test 4 — should preserve same manifest filename at multiple paths", () => {
    const tree: GithubTreeEntry[] = [
      { path: "apps/web/package.json", type: "blob", sha: "s1", url: "u1" },
      { path: "apps/api/package.json", type: "blob", sha: "s2", url: "u2" },
    ];

    const result = discoverManifests(tree);
    expect(result).toEqual([
      { path: "apps/web/package.json", type: "package.json" },
      { path: "apps/api/package.json", type: "package.json" },
    ]);
  });

  it("Test 5 — should ignore unsupported files", () => {
    const tree: GithubTreeEntry[] = [
      { path: "README.md", type: "blob", sha: "s1", url: "u1" },
      { path: "src/index.ts", type: "blob", sha: "s2", url: "u2" },
      { path: "tsconfig.json", type: "blob", sha: "s3", url: "u3" },
      { path: "Dockerfile", type: "blob", sha: "s4", url: "u4" },
    ];

    const result = discoverManifests(tree);
    expect(result).toEqual([]);
  });

  it("Test 6 — should ignore directory/tree entries", () => {
    const tree: GithubTreeEntry[] = [
      { path: "backend", type: "tree", sha: "s1", url: "u1" },
      { path: "package.json", type: "tree", sha: "s2", url: "u2" }, // edge case: directory named package.json
    ];

    const result = discoverManifests(tree);
    expect(result).toEqual([]);
  });

  it("Test 7 — should respect maxDepth", () => {
    const tree: GithubTreeEntry[] = [
      { path: "package.json", type: "blob", sha: "s0", url: "u0" }, // depth 0
      { path: "backend/pom.xml", type: "blob", sha: "s1", url: "u1" }, // depth 1
      { path: "apps/api/pom.xml", type: "blob", sha: "s2", url: "u2" }, // depth 2
      { path: "apps/api/service/go.mod", type: "blob", sha: "s3", url: "u3" }, // depth 3
    ];

    expect(discoverManifests(tree, 0)).toEqual([
      { path: "package.json", type: "package.json" },
    ]);

    expect(discoverManifests(tree, 1)).toEqual([
      { path: "package.json", type: "package.json" },
      { path: "backend/pom.xml", type: "pom.xml" },
    ]);

    expect(discoverManifests(tree, 2)).toEqual([
      { path: "package.json", type: "package.json" },
      { path: "backend/pom.xml", type: "pom.xml" },
      { path: "apps/api/pom.xml", type: "pom.xml" },
    ]);
  });

  it("Test 8 — should exclude build.gradle.kts and Kotlin manifests", () => {
    const tree: GithubTreeEntry[] = [
      { path: "build.gradle.kts", type: "blob", sha: "s1", url: "u1" },
      { path: "app/build.gradle.kts", type: "blob", sha: "s2", url: "u2" },
      { path: "settings.gradle.kts", type: "blob", sha: "s3", url: "u3" },
      { path: "build.gradle", type: "blob", sha: "s4", url: "u4" },
    ];

    const result = discoverManifests(tree);
    expect(result).toEqual([
      { path: "build.gradle", type: "build.gradle" },
    ]);
  });

  it("Test 9 — should handle empty tree", () => {
    expect(discoverManifests([])).toEqual([]);
  });

  it("Test 10 — should validate maxDepth parameter", () => {
    const tree: GithubTreeEntry[] = [];

    expect(() => discoverManifests(tree, -1)).toThrow(
      "maxDepth must be a non-negative integer"
    );

    expect(() => discoverManifests(tree, 2.5)).toThrow(
      "maxDepth must be a non-negative integer"
    );
  });
});
