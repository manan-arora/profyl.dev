import { XMLParser } from "fast-xml-parser";
import { ManifestParser } from "@/types/scanner";

const MAVEN_PROPERTY_REFERENCE_REGEX = /\$\{[^}]+\}/;

const xmlParser = new XMLParser({
  ignoreAttributes: true,
  parseTagValue: false,
  parseAttributeValue: false,
  trimValues: true,
  removeNSPrefix: true,
});

interface PomDependencyNode {
  groupId?: unknown;
  artifactId?: unknown;
  scope?: unknown;
}

function toArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

function extractText(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function isExcludedScope(scope: string | null): boolean {
  if (scope === null) {
    return false;
  }

  const normalizedScope = scope.toLowerCase();
  return normalizedScope === "test" || normalizedScope === "system";
}

/**
 * Parser for pom.xml manifests.
 *
 * V1 scope:
 *   - Reads only <project><dependencies><dependency> entries
 *   - Emits raw dependency identifiers as "groupId:artifactId"
 *   - Ignores versions, exclusions, parent POMs, dependencyManagement, and build plugins
 *   - Excludes test and system scoped dependencies
 *   - Skips dependencies whose groupId/artifactId are missing or property-based (${...})
 */
export class PomXmlParser implements ManifestParser {
  parse(content: string): string[] {
    let parsed: unknown;

    try {
      parsed = xmlParser.parse(content, true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Invalid XML format";
      throw new Error(`Failed to parse pom.xml: ${message}`);
    }

    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
      return [];
    }

    const project = (parsed as Record<string, unknown>)["project"];
    if (project === null || typeof project !== "object" || Array.isArray(project)) {
      return [];
    }

    const dependenciesNode = (project as Record<string, unknown>)["dependencies"];
    if (
      dependenciesNode === null ||
      typeof dependenciesNode !== "object" ||
      Array.isArray(dependenciesNode)
    ) {
      return [];
    }

    const dependencyNodes = toArray(
      (dependenciesNode as Record<string, unknown>)["dependency"] as
        | PomDependencyNode
        | PomDependencyNode[]
        | undefined
    );

    const dependencies: string[] = [];
    const seen = new Set<string>();

    for (const dependencyNode of dependencyNodes) {
      if (
        dependencyNode === null ||
        typeof dependencyNode !== "object" ||
        Array.isArray(dependencyNode)
      ) {
        continue;
      }

      const groupId = extractText(dependencyNode.groupId);
      const artifactId = extractText(dependencyNode.artifactId);
      const scope = extractText(dependencyNode.scope);

      if (groupId === null || artifactId === null) {
        continue;
      }

      if (
        MAVEN_PROPERTY_REFERENCE_REGEX.test(groupId) ||
        MAVEN_PROPERTY_REFERENCE_REGEX.test(artifactId)
      ) {
        continue;
      }

      if (isExcludedScope(scope)) {
        continue;
      }

      const identifier = `${groupId}:${artifactId}`;
      if (!seen.has(identifier)) {
        seen.add(identifier);
        dependencies.push(identifier);
      }
    }

    return dependencies;
  }
}
