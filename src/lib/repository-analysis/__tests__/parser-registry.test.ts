import { describe, it, expect } from "vitest";
import { getParser } from "../parser-registry";

describe("Parser Registry (Static)", () => {
  it("should map implemented manifests to parsers", () => {
    expect(getParser("package.json")).toBeDefined();
    expect(getParser("requirements.txt")).toBeDefined();
    expect(getParser("pyproject.toml")).toBeDefined();
    expect(getParser("pom.xml")).toBeDefined();
    expect(getParser("build.gradle")).toBeDefined();
    expect(getParser("build.gradle.kts")).toBeDefined();
    expect(getParser("go.mod")).toBeDefined();
  });
});
