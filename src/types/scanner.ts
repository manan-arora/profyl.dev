export type SupportedManifest =
  | "package.json"
  | "requirements.txt"
  | "pyproject.toml"
  | "pom.xml"
  | "build.gradle"
  | "build.gradle.kts"
  | "go.mod";

export interface DiscoveredManifest {
  path: string;
  type: SupportedManifest;
}

export interface RepositoryScanResult {
  repositoryId: string;
  manifests: DiscoveredManifest[];
  truncated: boolean;
  hasRootGradleVersionCatalog: boolean;
}

export interface ManifestParser {
  parse(content: string): string[];
}

/**
 * Optional parser context for manifests that can deterministically use
 * additional already-fetched repository files without performing I/O.
 *
 * Current V1 usage is intentionally narrow: Gradle parsers may receive the
 * static contents of a nearby `gradle/libs.versions.toml` file so they can
 * resolve simple version-catalog aliases.
 */
export interface ManifestParseContext {
  manifestPath: string;
  gradleVersionCatalogContent?: string;
}

export interface ContextualManifestParser extends ManifestParser {
  parseWithContext(content: string, context: ManifestParseContext): string[];
}

export interface ParsedManifest {
  manifest: DiscoveredManifest;
  dependencies: string[];
}

export interface RepositoryAnalysisResult {
  scan: RepositoryScanResult;
  parsedManifests: ParsedManifest[];
}
