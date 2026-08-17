import { describe, it, expect } from "vitest";
import { getParser } from "../parser-registry";
import { SupportedManifest } from "@/types/scanner";

describe("Parser Registry (Static)", () => {
  it("should map implemented manifests to parsers and return undefined for unimplemented parsers", () => {
    expect(getParser("package.json")).toBeDefined();
    expect(getParser("requirements.txt")).toBeDefined();
    expect(getParser("pyproject.toml")).toBeDefined();
    expect(getParser("pom.xml")).toBeDefined();
    expect(getParser("build.gradle")).toBeDefined();
    expect(getParser("build.gradle.kts")).toBeDefined();

    const unmappedTypes: SupportedManifest[] = [
      "go.mod",
    ];

    for (const type of unmappedTypes) {
      expect(getParser(type)).toBeUndefined();
    }
  });
});
