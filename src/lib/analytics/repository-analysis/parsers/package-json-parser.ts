import { ManifestParser } from "@/types/scanner";

/**
 * Parser for package.json manifests.
 * Extracts raw package dependency names from `dependencies` and `devDependencies`.
 */
export class PackageJsonParser implements ManifestParser {
  parse(content: string): string[] {
    let parsed: unknown;

    try {
      parsed = JSON.parse(content);
    } catch {
      throw new Error("Failed to parse package.json: Invalid JSON format");
    }

    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("Failed to parse package.json: Root content must be a JSON object");
    }

    const obj = parsed as Record<string, unknown>;
    const dependencies: string[] = [];

    this.extractDependenciesFromSection(obj, "dependencies", dependencies);
    this.extractDependenciesFromSection(obj, "devDependencies", dependencies);

    return dependencies;
  }

  private extractDependenciesFromSection(
    obj: Record<string, unknown>,
    sectionName: "dependencies" | "devDependencies",
    outDependencies: string[]
  ): void {
    if (!(sectionName in obj) || obj[sectionName] === undefined) {
      return;
    }

    const section = obj[sectionName];

    if (section === null || typeof section !== "object" || Array.isArray(section)) {
      throw new Error(
        `Failed to parse package.json: Section "${sectionName}" must be an object`
      );
    }

    const sectionObj = section as Record<string, unknown>;
    for (const pkgName of Object.keys(sectionObj)) {
      outDependencies.push(pkgName);
    }
  }
}
