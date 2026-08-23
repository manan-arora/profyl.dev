import { describe, it, expect } from "vitest";
import { PackageJsonParser } from "../package-json-parser";
import { getParser } from "../../parser-registry";

describe("PackageJsonParser", () => {
  const parser = new PackageJsonParser();

  it("1. should extract dependencies", () => {
    const json = JSON.stringify({
      dependencies: {
        next: "^15.0.0",
        react: "^19.0.0",
      },
    });

    expect(parser.parse(json)).toEqual(["next", "react"]);
  });

  it("2. should extract devDependencies", () => {
    const json = JSON.stringify({
      devDependencies: {
        typescript: "^5.0.0",
        eslint: "^9.0.0",
      },
    });

    expect(parser.parse(json)).toEqual(["typescript", "eslint"]);
  });

  it("3. should combine both dependencies and devDependencies", () => {
    const json = JSON.stringify({
      dependencies: {
        next: "^15.0.0",
        react: "^19.0.0",
      },
      devDependencies: {
        typescript: "^5.0.0",
      },
    });

    expect(parser.parse(json)).toEqual(["next", "react", "typescript"]);
  });

  it("4. should not include package versions in output", () => {
    const json = JSON.stringify({
      dependencies: {
        "express": "4.18.2",
        "lodash": ">= 4.17.21",
      },
    });

    const result = parser.parse(json);
    expect(result).toEqual(["express", "lodash"]);
    expect(result).not.toContain("4.18.2");
    expect(result).not.toContain(">= 4.17.21");
  });

  it("5. should preserve scoped package names", () => {
    const json = JSON.stringify({
      dependencies: {
        "@prisma/client": "^6.0.0",
        "@clerk/nextjs": "^7.0.0",
      },
      devDependencies: {
        "@types/node": "^20.0.0",
      },
    });

    expect(parser.parse(json)).toEqual([
      "@prisma/client",
      "@clerk/nextjs",
      "@types/node",
    ]);
  });

  it("6. should return empty array when dependencies section is missing", () => {
    const json = JSON.stringify({
      name: "my-package",
      version: "1.0.0",
    });

    expect(parser.parse(json)).toEqual([]);
  });

  it("7. should return empty array when dependency sections are empty objects", () => {
    const json = JSON.stringify({
      dependencies: {},
      devDependencies: {},
    });

    expect(parser.parse(json)).toEqual([]);
  });

  it("8. should fail clearly on malformed JSON", () => {
    const invalidJson = "{ dependencies: { 'next': '15.0.0' } "; // missing closing brace

    expect(() => parser.parse(invalidJson)).toThrow(
      "Failed to parse package.json: Invalid JSON format"
    );
  });

  it("9. should fail clearly when dependency sections are not objects", () => {
    const jsonArray = JSON.stringify({
      dependencies: ["next", "react"],
    });

    expect(() => parser.parse(jsonArray)).toThrow(
      'Failed to parse package.json: Section "dependencies" must be an object'
    );

    const jsonString = JSON.stringify({
      devDependencies: "typescript@5.0.0",
    });

    expect(() => parser.parse(jsonString)).toThrow(
      'Failed to parse package.json: Section "devDependencies" must be an object'
    );
  });

  it("10. should be available via getParser('package.json')", () => {
    const registeredParser = getParser("package.json");
    expect(registeredParser).toBeDefined();
    expect(registeredParser).toBeInstanceOf(PackageJsonParser);

    const json = JSON.stringify({
      dependencies: {
        zod: "^3.0.0",
      },
    });
    expect(registeredParser?.parse(json)).toEqual(["zod"]);
  });
});
