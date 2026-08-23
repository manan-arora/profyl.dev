import { ManifestParser } from "@/types/scanner";

export class GoModParser implements ManifestParser {
  parse(content: string): string[] {
    if (!content) {
      return [];
    }

    const dependencies: string[] = [];
    const seen = new Set<string>();
    let inRequireBlock = false;

    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim();

      if (!line || line.startsWith("//")) {
        continue;
      }

      if (inRequireBlock) {
        if (line === ")") {
          inRequireBlock = false;
          continue;
        }

        this.addDependency(line, dependencies, seen);
        continue;
      }

      if (/^require\s*\(\s*$/.test(line)) {
        inRequireBlock = true;
        continue;
      }

      if (/^require\s+/.test(line)) {
        this.addDependency(
          line.substring("require".length).trim(),
          dependencies,
          seen,
        );
      }
    }

    return dependencies;
  }

  private addDependency(
    line: string,
    dependencies: string[],
    seen: Set<string>,
  ): void {
    if (/\s\/\/\s*indirect\b/.test(line)) {
      return;
    }

    const moduleName = line.split(/\s+/)[0];
    if (!moduleName || moduleName === ")" || seen.has(moduleName)) {
      return;
    }

    seen.add(moduleName);
    dependencies.push(moduleName);
  }
}
