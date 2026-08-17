import { parseTOML } from "confbox/toml";
import {
  ContextualManifestParser,
  ManifestParseContext,
} from "@/types/scanner";

const SUPPORTED_DEPENDENCY_CONFIGURATIONS = [
  "implementation",
  "api",
  "runtimeOnly",
  "compileOnly",
  "debugImplementation",
  "releaseImplementation",
  "kapt",
  "ksp",
] as const;

const SUPPORTED_DEPENDENCY_CONFIGURATION_PATTERN =
  SUPPORTED_DEPENDENCY_CONFIGURATIONS.join("|");

const DIRECT_PLUGIN_REGEX =
  /(?<![\w.])id\s*(?:\(\s*(["'])([^"'$\r\n]+)\1\s*\)|\s+(["'])([^"'$\r\n]+)\3)/g;

const CATALOG_PLUGIN_ALIAS_REGEX =
  /(?<![\w.])alias\s*\(\s*libs\.plugins\.([A-Za-z0-9._-]+)\s*\)/g;

const DIRECT_DEPENDENCY_REGEX = new RegExp(
  `(?<![\\w.])(${SUPPORTED_DEPENDENCY_CONFIGURATION_PATTERN})\\s*(?:\\(\\s*(["'])([^"'$\\r\\n]+)\\2\\s*\\)|\\s+(["'])([^"'$\\r\\n]+)\\4)`,
  "g"
);

const CATALOG_DEPENDENCY_ALIAS_REGEX = new RegExp(
  `(?<![\\w.])(${SUPPORTED_DEPENDENCY_CONFIGURATION_PATTERN})\\s*\\(\\s*libs\\.([A-Za-z0-9._-]+)\\s*\\)`,
  "g"
);

interface GradleVersionCatalog {
  libraries: Map<string, string>;
  plugins: Map<string, string>;
}

interface ExtractedIdentifierMatch {
  index: number;
  identifier: string;
}

function canonicalizeCatalogAlias(alias: string): string {
  return alias.trim().toLowerCase().replace(/[\s._-]+/g, ".");
}

function stripComments(content: string): string {
  let result = "";
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inLineComment = false;
  let inBlockComment = false;
  let escaped = false;

  for (let index = 0; index < content.length; index += 1) {
    const current = content[index];
    const next = index + 1 < content.length ? content[index + 1] : "";

    if (inLineComment) {
      if (current === "\n") {
        inLineComment = false;
        result += current;
      }
      continue;
    }

    if (inBlockComment) {
      if (current === "*" && next === "/") {
        inBlockComment = false;
        index += 1;
      }
      continue;
    }

    if (inSingleQuote) {
      result += current;
      if (!escaped && current === "'") {
        inSingleQuote = false;
      }
      escaped = current === "\\" && !escaped;
      continue;
    }

    if (inDoubleQuote) {
      result += current;
      if (!escaped && current === "\"") {
        inDoubleQuote = false;
      }
      escaped = current === "\\" && !escaped;
      continue;
    }

    escaped = false;

    if (current === "/" && next === "/") {
      inLineComment = true;
      index += 1;
      continue;
    }

    if (current === "/" && next === "*") {
      inBlockComment = true;
      index += 1;
      continue;
    }

    if (current === "'") {
      inSingleQuote = true;
      result += current;
      continue;
    }

    if (current === "\"") {
      inDoubleQuote = true;
      result += current;
      continue;
    }

    result += current;
  }

  return result;
}

function normalizeDependencyIdentifier(rawNotation: string): string | null {
  const trimmed = rawNotation.trim();
  if (trimmed.length === 0 || trimmed.includes("$")) {
    return null;
  }

  const segments = trimmed.split(":").map((segment) => segment.trim());
  if (segments.length < 2 || segments[0].length === 0 || segments[1].length === 0) {
    return null;
  }

  return `${segments[0]}:${segments[1]}`;
}

function extractCatalogLibraryIdentifier(entry: unknown): string | null {
  if (typeof entry === "string") {
    return normalizeDependencyIdentifier(entry);
  }

  if (entry === null || typeof entry !== "object" || Array.isArray(entry)) {
    return null;
  }

  const entryRecord = entry as Record<string, unknown>;
  const moduleValue = entryRecord["module"];
  if (typeof moduleValue === "string") {
    return normalizeDependencyIdentifier(moduleValue);
  }

  const group = entryRecord["group"];
  const name = entryRecord["name"];

  if (typeof group === "string" && typeof name === "string") {
    return normalizeDependencyIdentifier(`${group}:${name}`);
  }

  return null;
}

function extractCatalogPluginIdentifier(entry: unknown): string | null {
  if (entry === null || typeof entry !== "object" || Array.isArray(entry)) {
    return null;
  }

  const pluginId = (entry as Record<string, unknown>)["id"];
  if (typeof pluginId !== "string") {
    return null;
  }

  const trimmed = pluginId.trim();
  return trimmed.length > 0 && !trimmed.includes("$") ? trimmed : null;
}

function parseVersionCatalog(content: string | undefined): GradleVersionCatalog | null {
  if (!content) {
    return null;
  }

  try {
    const parsed = parseTOML(content) as Record<string, unknown>;
    const libraries = new Map<string, string>();
    const plugins = new Map<string, string>();

    const librariesNode = parsed["libraries"];
    if (
      librariesNode !== null &&
      typeof librariesNode === "object" &&
      !Array.isArray(librariesNode)
    ) {
      for (const [alias, value] of Object.entries(
        librariesNode as Record<string, unknown>
      )) {
        const identifier = extractCatalogLibraryIdentifier(value);
        if (identifier !== null) {
          libraries.set(canonicalizeCatalogAlias(alias), identifier);
        }
      }
    }

    const pluginsNode = parsed["plugins"];
    if (
      pluginsNode !== null &&
      typeof pluginsNode === "object" &&
      !Array.isArray(pluginsNode)
    ) {
      for (const [alias, value] of Object.entries(
        pluginsNode as Record<string, unknown>
      )) {
        const identifier = extractCatalogPluginIdentifier(value);
        if (identifier !== null) {
          plugins.set(canonicalizeCatalogAlias(alias), identifier);
        }
      }
    }

    return { libraries, plugins };
  } catch {
    return null;
  }
}

function collectMatches(
  content: string,
  versionCatalog: GradleVersionCatalog | null
): ExtractedIdentifierMatch[] {
  const matches: ExtractedIdentifierMatch[] = [];

  DIRECT_PLUGIN_REGEX.lastIndex = 0;
  CATALOG_PLUGIN_ALIAS_REGEX.lastIndex = 0;
  DIRECT_DEPENDENCY_REGEX.lastIndex = 0;
  CATALOG_DEPENDENCY_ALIAS_REGEX.lastIndex = 0;

  for (const match of content.matchAll(DIRECT_PLUGIN_REGEX)) {
    const identifier = (match[2] ?? match[4] ?? "").trim();
    if (identifier.length > 0) {
      matches.push({
        index: match.index ?? 0,
        identifier,
      });
    }
  }

  for (const match of content.matchAll(CATALOG_PLUGIN_ALIAS_REGEX)) {
    const alias = canonicalizeCatalogAlias(match[1] ?? "");
    const identifier = versionCatalog?.plugins.get(alias);

    if (identifier) {
      matches.push({
        index: match.index ?? 0,
        identifier,
      });
    }
  }

  for (const match of content.matchAll(DIRECT_DEPENDENCY_REGEX)) {
    const rawNotation = (match[3] ?? match[5] ?? "").trim();
    const identifier = normalizeDependencyIdentifier(rawNotation);

    if (identifier !== null) {
      matches.push({
        index: match.index ?? 0,
        identifier,
      });
    }
  }

  for (const match of content.matchAll(CATALOG_DEPENDENCY_ALIAS_REGEX)) {
    const alias = canonicalizeCatalogAlias(match[2] ?? "");
    const identifier = versionCatalog?.libraries.get(alias);

    if (identifier) {
      matches.push({
        index: match.index ?? 0,
        identifier,
      });
    }
  }

  return matches;
}

/**
 * Conservative Gradle parser for V1 repository analysis.
 *
 * Scope is intentionally narrow:
 * - static plugin IDs from common Groovy/Kotlin DSL forms
 * - static dependency coordinates from a small allowlist of configurations
 * - optional simple version-catalog alias resolution when orchestration
 *   provides `gradle/libs.versions.toml` contents
 *
 * Unsupported dynamic Gradle features are ignored rather than evaluated.
 */
export class GradleParser implements ContextualManifestParser {
  parse(content: string): string[] {
    return this.parseWithContext(content, {
      manifestPath: "build.gradle",
    });
  }

  parseWithContext(content: string, context: ManifestParseContext): string[] {
    if (!content) {
      return [];
    }

    const sanitizedContent = stripComments(content);
    const versionCatalog = parseVersionCatalog(
      context.gradleVersionCatalogContent
    );

    const orderedMatches = collectMatches(sanitizedContent, versionCatalog).sort(
      (left, right) => left.index - right.index
    );

    const identifiers: string[] = [];
    const seen = new Set<string>();

    for (const match of orderedMatches) {
      if (seen.has(match.identifier)) {
        continue;
      }

      seen.add(match.identifier);
      identifiers.push(match.identifier);
    }

    return identifiers;
  }
}
