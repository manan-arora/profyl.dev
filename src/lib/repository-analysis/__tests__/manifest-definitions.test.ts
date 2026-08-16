import { describe, it, expect } from "vitest";
import { isSupportedManifest, SUPPORTED_MANIFESTS } from "../manifest-definitions";

describe("Supported Manifest Registry", () => {
  it("should contain exactly the six V1 manifests", () => {
    const expected = [
      "package.json",
      "requirements.txt",
      "pyproject.toml",
      "pom.xml",
      "build.gradle",
      "go.mod",
    ];
    
    expect(SUPPORTED_MANIFESTS.size).toBe(6);
    for (const manifest of expected) {
      expect(SUPPORTED_MANIFESTS.has(manifest as any)).toBe(true);
    }
  });

  it("should recognize all six V1 manifests via isSupportedManifest", () => {
    const manifests = [
      "package.json",
      "requirements.txt",
      "pyproject.toml",
      "pom.xml",
      "build.gradle",
      "go.mod",
    ];

    for (const manifest of manifests) {
      expect(isSupportedManifest(manifest)).toBe(true);
    }
  });

  it("should NOT recognize build.gradle.kts", () => {
    expect(isSupportedManifest("build.gradle.kts")).toBe(false);
  });

  it("should NOT recognize Kotlin-specific or Gradle Kotlin DSL manifests", () => {
    expect(isSupportedManifest("settings.gradle.kts")).toBe(false);
    expect(isSupportedManifest("App.kt")).toBe(false);
  });

  it("should NOT recognize arbitrary unsupported filenames", () => {
    expect(isSupportedManifest("README.md")).toBe(false);
    expect(isSupportedManifest("package-lock.json")).toBe(false);
    expect(isSupportedManifest("cargo.toml")).toBe(false);
  });
});
