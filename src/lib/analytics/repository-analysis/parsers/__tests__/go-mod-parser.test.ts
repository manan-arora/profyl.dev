import { describe, expect, it } from "vitest";
import { getParser } from "../../parser-registry";
import { GoModParser } from "../go-mod-parser";

describe("GoModParser", () => {
  const parser = new GoModParser();

  it("extracts direct dependencies from single-line and block require directives", () => {
    const content = `module example.com/app

go 1.23
toolchain go1.24.1

require github.com/foo/bar v1.2.3

require (
  github.com/baz/qux v2.0.0
  golang.org/x/tools v0.20.0
)`;

    expect(parser.parse(content)).toEqual([
      "github.com/foo/bar",
      "github.com/baz/qux",
      "golang.org/x/tools",
    ]);
  });

  it("ignores indirect dependencies, non-require directives, and duplicates", () => {
    const content = `require github.com/foo/bar v1.0.0
require github.com/ignored/one v1.0.0 // indirect

replace github.com/foo/bar => example.com/fork v1.1.0
exclude github.com/ignored/two v1.0.0
retract v1.2.0

require (
  github.com/foo/bar v1.1.0
  github.com/kept/module v0.4.0 // useful comment
  github.com/ignored/three v1.0.0 // indirect
)
`;

    expect(parser.parse(content)).toEqual([
      "github.com/foo/bar",
      "github.com/kept/module",
    ]);
  });

  it("returns an empty list when no direct require dependencies exist", () => {
    expect(parser.parse("module example.com/app\n\ngo 1.23\n")).toEqual([]);
    expect(parser.parse("")).toEqual([]);
  });

  it("is available through the parser registry", () => {
    expect(getParser("go.mod")).toBeInstanceOf(GoModParser);
  });
});
