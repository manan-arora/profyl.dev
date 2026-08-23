import { parseTOML } from "confbox/toml";
import { ManifestParser } from "@/types/scanner";

// Python package name pattern (PEP 508 / PEP 503).
// Names must start and end with an alphanumeric character and may contain alphanumeric, _, -, and .
const VALID_PYTHON_PACKAGE_NAME_REGEX =
  /^[a-zA-Z0-9][a-zA-Z0-9._-]*[a-zA-Z0-9]$|^[a-zA-Z0-9]$/;

/**
 * Strips PEP 508 extras, version specifiers, and environment markers from a
 * dependency string and returns only the bare package name.
 *
 * Mirrors the stripping pipeline in RequirementsTxtParser:
 *   1. Reject strings containing '@' (PEP 508 direct URL references).
 *   2. Strip environment markers (';' and everything after).
 *   3. Strip version specifiers ('==', '>=', '<=', '~=', '!=', '>', '<').
 *   4. Strip extras ('[...]').
 *   5. Validate name shape; return null if invalid.
 */
function extractPep508PackageName(raw: string): string | null {
  let cleaned = raw.trim();

  // 1. Reject direct URL references — '@' is reserved for 'pkg @ https://...'
  if (cleaned.includes("@")) {
    return null;
  }

  // 2. Strip environment markers (anything after ';')
  if (cleaned.includes(";")) {
    cleaned = cleaned.split(";")[0].trim();
  }

  // 3. Strip version specifiers (==, >=, <=, ~=, !=, >, <)
  const specifierIndex = cleaned.search(/(==|>=|<=|~=|!=|>|<)/);
  if (specifierIndex !== -1) {
    cleaned = cleaned.substring(0, specifierIndex).trim();
  }

  // 4. Strip extras ([socks])
  if (cleaned.includes("[")) {
    cleaned = cleaned.split("[")[0].trim();
  }

  // 5. Validate package name shape
  if (!VALID_PYTHON_PACKAGE_NAME_REGEX.test(cleaned)) {
    return null;
  }

  return cleaned;
}

/**
 * Parser for pyproject.toml manifests.
 *
 * Extracts raw Python package names from the following V1-scoped sections:
 *   - [project].dependencies              (PEP 621 main dependencies)
 *   - [project.optional-dependencies].*   (PEP 621 optional dependency groups)
 *   - [tool.poetry.dependencies]           (Poetry main dependencies)
 *   - [tool.poetry.group.*.dependencies]   (Poetry named groups)
 *
 * Out of scope: [build-system].requires, arbitrary [tool.*] sections.
 */
export class PyprojectTomlParser implements ManifestParser {
  parse(content: string): string[] {
    // parseTOML throws on malformed TOML — propagate as-is.
    const toml = parseTOML(content) as Record<string, unknown>;

    const dependencies: string[] = [];

    this.extractPep621(toml, dependencies);
    this.extractPoetry(toml, dependencies);

    return dependencies;
  }

  // ---------------------------------------------------------------------------
  // PEP 621
  // ---------------------------------------------------------------------------

  private extractPep621(
    toml: Record<string, unknown>,
    out: string[]
  ): void {
    const project = toml["project"];
    if (project === null || typeof project !== "object" || Array.isArray(project)) {
      return;
    }

    const projectObj = project as Record<string, unknown>;

    // [project].dependencies — string[]
    const mainDeps = projectObj["dependencies"];
    if (Array.isArray(mainDeps)) {
      for (const entry of mainDeps) {
        if (typeof entry === "string") {
          const name = extractPep508PackageName(entry);
          if (name !== null) {
            out.push(name);
          }
        }
      }
    }

    // [project.optional-dependencies].* — Record<string, string[]>
    const optionalDeps = projectObj["optional-dependencies"];
    if (
      optionalDeps !== null &&
      typeof optionalDeps === "object" &&
      !Array.isArray(optionalDeps)
    ) {
      const optObj = optionalDeps as Record<string, unknown>;
      for (const group of Object.values(optObj)) {
        if (Array.isArray(group)) {
          for (const entry of group) {
            if (typeof entry === "string") {
              const name = extractPep508PackageName(entry);
              if (name !== null) {
                out.push(name);
              }
            }
          }
        }
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Poetry
  // ---------------------------------------------------------------------------

  private extractPoetry(
    toml: Record<string, unknown>,
    out: string[]
  ): void {
    const tool = toml["tool"];
    if (tool === null || typeof tool !== "object" || Array.isArray(tool)) {
      return;
    }

    const poetry = (tool as Record<string, unknown>)["poetry"];
    if (poetry === null || typeof poetry !== "object" || Array.isArray(poetry)) {
      return;
    }

    const poetryObj = poetry as Record<string, unknown>;

    // [tool.poetry.dependencies] — Record<string, string | object>
    this.extractPoetryDepsObject(poetryObj["dependencies"], out);

    // [tool.poetry.group.*.dependencies] — one object per named group
    const groups = poetryObj["group"];
    if (
      groups !== null &&
      typeof groups === "object" &&
      !Array.isArray(groups)
    ) {
      const groupsObj = groups as Record<string, unknown>;
      for (const groupValue of Object.values(groupsObj)) {
        if (
          groupValue !== null &&
          typeof groupValue === "object" &&
          !Array.isArray(groupValue)
        ) {
          const groupDeps = (groupValue as Record<string, unknown>)["dependencies"];
          this.extractPoetryDepsObject(groupDeps, out);
        }
      }
    }
  }

  /**
   * Extracts package names from a Poetry-style dependencies object.
   * Values may be version strings, "*", or inline tables — only the keys matter.
   * The "python" key is excluded (it is a runtime constraint, not a package).
   */
  private extractPoetryDepsObject(
    depsObj: unknown,
    out: string[]
  ): void {
    if (
      depsObj === null ||
      typeof depsObj !== "object" ||
      Array.isArray(depsObj)
    ) {
      return;
    }

    for (const pkgName of Object.keys(depsObj as Record<string, unknown>)) {
      if (pkgName === "python") {
        continue;
      }
      if (VALID_PYTHON_PACKAGE_NAME_REGEX.test(pkgName)) {
        out.push(pkgName);
      }
    }
  }
}
