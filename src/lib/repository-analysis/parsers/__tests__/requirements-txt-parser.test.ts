import { describe, it, expect } from "vitest";
import { RequirementsTxtParser } from "../requirements-txt-parser";
import { getParser } from "../../parser-registry";

describe("RequirementsTxtParser", () => {
  const parser = new RequirementsTxtParser();

  it("1. should parse simple package names", () => {
    expect(parser.parse("fastapi")).toEqual(["fastapi"]);
  });

  it("2. should parse packages with == version constraints", () => {
    expect(parser.parse("fastapi==0.115.0")).toEqual(["fastapi"]);
  });

  it("3. should parse packages with other version specifiers (>=, <=, ~=, !=)", () => {
    expect(parser.parse("fastapi>=0.100")).toEqual(["fastapi"]);
    expect(parser.parse("fastapi<=1.0")).toEqual(["fastapi"]);
    expect(parser.parse("fastapi~=1.2")).toEqual(["fastapi"]);
    expect(parser.parse("fastapi!=1.5")).toEqual(["fastapi"]);
  });

  it("4. should parse packages with multiple comma-separated version constraints", () => {
    expect(parser.parse("fastapi>=1.0,<2.0")).toEqual(["fastapi"]);
  });

  it("5. should strip extras and return only the base package name", () => {
    expect(parser.parse("requests[socks]>=2.31")).toEqual(["requests"]);
  });

  it("6. should strip environment markers", () => {
    expect(parser.parse('uvicorn>=0.20; python_version >= "3.9"')).toEqual(["uvicorn"]);
  });

  it("7. should ignore blank lines and whitespace-only lines", () => {
    const input = "\n\n   \nfastapi\n\t\n";
    expect(parser.parse(input)).toEqual(["fastapi"]);
  });

  it("8. should ignore full-line comments", () => {
    const input = "# Web framework\nfastapi\n# Another comment";
    expect(parser.parse(input)).toEqual(["fastapi"]);
  });

  it("9. should support inline comments", () => {
    expect(parser.parse("redis>=5.0 # Redis client")).toEqual(["redis"]);
  });

  it("10. should parse multiple requirements maintaining their order", () => {
    const input = "fastapi\nrequests[socks]>=2.31\nuvicorn>=0.20; python_version >= '3.9'";
    expect(parser.parse(input)).toEqual(["fastapi", "requests", "uvicorn"]);
  });

  it("11. should ignore unsupported requirements (VCS, editable, local paths)", () => {
    const input = [
      "git+https://github.com/django/django.git@stable/4.2.x#egg=Django",
      "-e .",
      "./local-package",
      "/absolute/path/to/package",
      "-r requirements-dev.txt",
    ].join("\n");

    expect(parser.parse(input)).toEqual([]);
  });

  it("12. should ignore malformed/ambiguous lines and invalid package names", () => {
    const input = [
      "!!!invalid_name",
      "some_package_name_ending_in_-",
      "-just-a-dash",
      "pkg@", // Ambiguous version specifier with nothing following
    ].join("\n");

    expect(parser.parse(input)).toEqual([]);
  });

  it("13. should be available through getParser('requirements.txt')", () => {
    const registeredParser = getParser("requirements.txt");
    expect(registeredParser).toBeDefined();
    expect(registeredParser).toBeInstanceOf(RequirementsTxtParser);
  });

  it("14. should return empty array for empty input", () => {
    expect(parser.parse("")).toEqual([]);
  });

  it("15. should correctly handle leading/trailing whitespace around lines", () => {
    const input = "   fastapi==0.115.0   \n  requests>=2.31  ";
    expect(parser.parse(input)).toEqual(["fastapi", "requests"]);
  });
});
