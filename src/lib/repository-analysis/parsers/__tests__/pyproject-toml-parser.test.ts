import { describe, it, expect, beforeEach } from "vitest";
import { PyprojectTomlParser } from "../pyproject-toml-parser";
import { getParser } from "../../parser-registry";

describe("PyprojectTomlParser", () => {
  let parser: PyprojectTomlParser;

  beforeEach(() => {
    parser = new PyprojectTomlParser();
  });

  // ---------------------------------------------------------------------------
  // PEP 621
  // ---------------------------------------------------------------------------

  it("1. should extract project.dependencies bare names", () => {
    const content = `
[project]
name = "myapp"
dependencies = [
    "fastapi>=0.115",
    "sqlalchemy>=2.0",
    "redis"
]
`;
    expect(parser.parse(content)).toEqual(["fastapi", "sqlalchemy", "redis"]);
  });

  it("2. should extract all project.optional-dependencies groups", () => {
    const content = `
[project]
name = "myapp"
dependencies = ["fastapi"]

[project.optional-dependencies]
dev = ["pytest>=8", "ruff"]
ml  = ["torch", "transformers"]
`;
    expect(parser.parse(content)).toEqual([
      "fastapi",
      "pytest",
      "ruff",
      "torch",
      "transformers",
    ]);
  });

  it("3. should handle a file with only optional-dependencies (no project.dependencies key)", () => {
    const content = `
[project]
name = "myapp"

[project.optional-dependencies]
dev = ["pytest>=8"]
`;
    expect(parser.parse(content)).toEqual(["pytest"]);
  });

  it("4. should correctly apply the PEP 508 strip pipeline", () => {
    const content = `
[project]
dependencies = [
    "requests[socks]>=2.31",
    "uvicorn>=0.20; python_version >= '3.9'",
    "requests @ https://example.com/requests.tar.gz",
    "mypackage~=1.2",
    "pkg!=1.5",
    "pkg2>=1.0,<2.0"
]
`;
    expect(parser.parse(content)).toEqual([
      "requests",
      "uvicorn",
      // "@" direct reference is skipped
      "mypackage",
      "pkg",
      "pkg2",
    ]);
  });

  // ---------------------------------------------------------------------------
  // Poetry
  // ---------------------------------------------------------------------------

  it("5. should extract tool.poetry.dependencies keys", () => {
    const content = `
[tool.poetry]
name = "myapp"
version = "0.1.0"

[tool.poetry.dependencies]
fastapi = "^0.115"
sqlalchemy = "^2.0"
redis = "*"
`;
    expect(parser.parse(content)).toEqual(["fastapi", "sqlalchemy", "redis"]);
  });

  it("6. should exclude the python key from tool.poetry.dependencies", () => {
    const content = `
[tool.poetry.dependencies]
python = "^3.11"
fastapi = "^0.115"
`;
    expect(parser.parse(content)).toEqual(["fastapi"]);
  });

  it("7. should extract all tool.poetry.group.<group>.dependencies keys", () => {
    const content = `
[tool.poetry.group.dev.dependencies]
pytest = "^8"
ruff   = "*"

[tool.poetry.group.test.dependencies]
httpx = "^0.27"
`;
    expect(parser.parse(content)).toEqual(["pytest", "ruff", "httpx"]);
  });

  it("8. should handle inline-table (object) values in Poetry dependencies", () => {
    const content = `
[tool.poetry.dependencies]
sqlalchemy = {version = "^2.0", extras = ["asyncio"]}
psycopg2   = {version = "^2.9", optional = true}
`;
    expect(parser.parse(content)).toEqual(["sqlalchemy", "psycopg2"]);
  });

  // ---------------------------------------------------------------------------
  // Combined
  // ---------------------------------------------------------------------------

  it("9. should extract from both [project] and [tool.poetry] when both are present", () => {
    const content = `
[project]
name = "myapp"
dependencies = ["fastapi>=0.115"]

[tool.poetry.dependencies]
python  = "^3.11"
uvicorn = "^0.20"
`;
    expect(parser.parse(content)).toEqual(["fastapi", "uvicorn"]);
  });

  // ---------------------------------------------------------------------------
  // Edge cases
  // ---------------------------------------------------------------------------

  it("10. should throw on invalid TOML content", () => {
    const content = `
[project
dependencies = ["fastapi"
`;
    expect(() => parser.parse(content)).toThrow();
  });

  it("11. should return an empty array when neither [project] nor [tool.poetry] is present", () => {
    const content = `
[build-system]
requires = ["setuptools", "wheel"]
build-backend = "setuptools.build_meta"

[tool.ruff]
line-length = 88
`;
    expect(parser.parse(content)).toEqual([]);
  });

  it("12. should be available through getParser('pyproject.toml')", () => {
    const registeredParser = getParser("pyproject.toml");
    expect(registeredParser).toBeDefined();
    expect(registeredParser).toBeInstanceOf(PyprojectTomlParser);
  });
});
