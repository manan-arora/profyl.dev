import { describe, it, expect } from "vitest";
import { getParser } from "../parser-registry";
import { SupportedManifest } from "@/types/scanner";

describe("Parser Registry (Static)", () => {
  it("should return undefined for unmapped manifest types", () => {
    const manifestTypes: SupportedManifest[] = [
      "package.json",
      "requirements.txt",
      "pyproject.toml",
      "pom.xml",
      "build.gradle",
      "go.mod",
    ];

    for (const type of manifestTypes) {
      expect(getParser(type)).toBeUndefined();
    }
  });
});
