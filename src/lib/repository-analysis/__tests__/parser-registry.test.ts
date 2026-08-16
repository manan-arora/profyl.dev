import { describe, it, expect } from "vitest";
import { getParser } from "../parser-registry";
import { SupportedManifest } from "@/types/scanner";

describe("Parser Registry (Static)", () => {
  it("should map package.json, requirements.txt, pyproject.toml, and pom.xml to their parsers and return undefined for unimplemented parsers", () => {
    // Phase 2A, 2B, 2C, and 2D parsers are registered
    expect(getParser("package.json")).toBeDefined();
    expect(getParser("requirements.txt")).toBeDefined();
    expect(getParser("pyproject.toml")).toBeDefined();
    expect(getParser("pom.xml")).toBeDefined();

    // Phase 2E-2F parsers are not yet implemented
    const unmappedTypes: SupportedManifest[] = [
      "build.gradle",
      "go.mod",
    ];

    for (const type of unmappedTypes) {
      expect(getParser(type)).toBeUndefined();
    }
  });
});
