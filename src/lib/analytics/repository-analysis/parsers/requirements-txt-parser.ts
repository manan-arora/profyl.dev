import { ManifestParser } from "@/types/scanner";

// Python package name pattern (PEP 508 / PEP 503)
// Standard names must start and end with an alphanumeric character, and can contain alphanumeric, _, -, and .
const VALID_PYTHON_PACKAGE_NAME_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9._-]*[a-zA-Z0-9]$|^[a-zA-Z0-9]$/;

export class RequirementsTxtParser implements ManifestParser {
  parse(content: string): string[] {
    if (!content) {
      return [];
    }

    const dependencies: string[] = [];
    const lines = content.split(/\r?\n/);

    for (const line of lines) {
      // 1. Strip inline comments and trim whitespace
      let cleaned = line.split("#")[0].trim();

      // 2. Ignore empty or comment-only lines
      if (!cleaned) {
        continue;
      }

      // 3. Ignore unsupported / non-standard package sources (VCS URLs, local paths, pip flags)
      //    Also ignore lines containing '@', which PEP 508 reserves for direct URL references (e.g. pkg @ https://...).
      //    A bare 'pkg@' or 'pkg @ ...' is treated as ambiguous/malformed rather than silently stripped.
      if (
        cleaned.startsWith("-") ||
        cleaned.startsWith("/") ||
        cleaned.startsWith(".") ||
        cleaned.includes("://") ||
        cleaned.includes("@") ||
        cleaned.startsWith("git+") ||
        cleaned.startsWith("hg+") ||
        cleaned.startsWith("svn+") ||
        cleaned.startsWith("bzr+")
      ) {
        continue;
      }

      // 4. Strip environment markers (anything after ;)
      if (cleaned.includes(";")) {
        cleaned = cleaned.split(";")[0].trim();
      }

      // 5. Strip version specifiers (==, >=, <=, ~=, !=, >, <)
      //    '@' is handled in step 3 (lines containing '@' are skipped entirely).
      const specifierIndex = cleaned.search(/(==|>=|<=|~=|!=|>|<)/);
      if (specifierIndex !== -1) {
        cleaned = cleaned.substring(0, specifierIndex).trim();
      }

      // 6. Strip extras ([socks])
      if (cleaned.includes("[")) {
        cleaned = cleaned.split("[")[0].trim();
      }

      // 7. Validate that the remaining token is a valid Python package-name shape
      if (VALID_PYTHON_PACKAGE_NAME_REGEX.test(cleaned)) {
        dependencies.push(cleaned);
      }
    }

    return dependencies;
  }
}
