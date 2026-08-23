import { getGithubFileContent } from "@/lib/github/client";
import {
  ContextualManifestParser,
  DiscoveredManifest,
  ParsedManifest,
  RepositoryAnalysisResult,
  RepositoryScanResult,
} from "@/types/scanner";
import { scanRepository, ScanRepositoryOptions } from "./scanner";
import { getParser } from "./parser-registry";
import { detectTechnologies } from "./technologies/technology-detector";

export interface ParseManifestOptions {
  manifest: DiscoveredManifest;
  owner: string;
  repo: string;
  accessToken: string;
  branch: string;
  gradleVersionCatalogContent?: string;
}

// Identifies parsers that can consume the optional Gradle catalog context.
function isContextualManifestParser(
  parser: object,
): parser is ContextualManifestParser {
  return (
    "parseWithContext" in parser &&
    typeof parser.parseWithContext === "function"
  );
}

const ROOT_GRADLE_VERSION_CATALOG_PATH = "gradle/libs.versions.toml";

// Gradle catalogs are intentionally resolved only from the repository root.
// No ancestor-directory probing is performed here.
/** Fetches the conventional root Gradle version catalog for later parser use. */
export async function getRootGradleVersionCatalogContent(
  accessToken: string,
  owner: string,
  repo: string,
  branch: string,
): Promise<string> {
  return getGithubFileContent(
    accessToken,
    owner,
    repo,
    ROOT_GRADLE_VERSION_CATALOG_PATH,
    branch,
  );
}

/**
 * Orchestrates parsing a single discovered manifest:
 * 1. Resolves registered parser for the manifest type.
 * 2. Fetches raw decoded text content from GitHub.
 * 3. Invokes parser.parse(content).
 * 4. Returns ParsedManifest containing manifest reference and raw dependency identifiers.
 */
export async function parseManifest({
  manifest,
  owner,
  repo,
  accessToken,
  branch,
  gradleVersionCatalogContent,
}: ParseManifestOptions): Promise<ParsedManifest> {
  const parser = getParser(manifest.type);
  if (!parser) {
    throw new Error(`No parser registered for manifest type: ${manifest.type}`);
  }

  const content = await getGithubFileContent(
    accessToken,
    owner,
    repo,
    manifest.path,
    branch,
  );

  let dependencies: string[];

  if (isContextualManifestParser(parser)) {
    dependencies = parser.parseWithContext(content, {
      manifestPath: manifest.path,
      gradleVersionCatalogContent:
        manifest.type === "build.gradle" || manifest.type === "build.gradle.kts"
          ? gradleVersionCatalogContent
          : undefined,
    });
  } else {
    dependencies = parser.parse(content);
  }

  return {
    manifest,
    dependencies,
  };
}

export interface AnalyzeManifestsOptions {
  manifests: DiscoveredManifest[];
  hasRootGradleVersionCatalog: boolean;
  owner: string;
  repo: string;
  accessToken: string;
  branch: string;
}

// Identifies both supported Gradle manifest variants for shared catalog setup.
const isGradleManifest = (manifest: DiscoveredManifest): boolean =>
  manifest.type === "build.gradle" || manifest.type === "build.gradle.kts";

/**
 * Parses every discovered manifest in discovery order.
 * Fetches one shared root Gradle catalog when at least one Gradle manifest
 * requires it, then passes that content to each Gradle parser.
 */
export async function analyzeManifests({
  manifests,
  hasRootGradleVersionCatalog,
  owner,
  repo,
  accessToken,
  branch,
}: AnalyzeManifestsOptions): Promise<ParsedManifest[]> {
  const hasGradleManifest = manifests.some(isGradleManifest);
  const gradleVersionCatalogContent =
    hasGradleManifest && hasRootGradleVersionCatalog
      ? await getRootGradleVersionCatalogContent(
          accessToken,
          owner,
          repo,
          branch,
        )
      : undefined;

  const parsedManifests: ParsedManifest[] = [];
  for (const manifest of manifests) {
    parsedManifests.push(
      await parseManifest({
        manifest,
        owner,
        repo,
        accessToken,
        branch,
        gradleVersionCatalogContent,
      }),
    );
  }

  return parsedManifests;
}

export type AnalyzeRepositoryOptions = ScanRepositoryOptions;

/**
 * Runs the repository analysis pipeline from tree scanning through manifest
 * parsing, leaving artifact analysis for a later orchestration stage.
 */
export async function analyzeRepository({
  repositoryId,
  owner,
  repo,
  accessToken,
  branch,
  maxDepth,
}: AnalyzeRepositoryOptions): Promise<RepositoryAnalysisResult> {
  const scan: RepositoryScanResult = await scanRepository({
    repositoryId,
    owner,
    repo,
    accessToken,
    branch,
    maxDepth,
  });

  const parsedManifests = await analyzeManifests({
    manifests: scan.manifests,
    hasRootGradleVersionCatalog: scan.hasRootGradleVersionCatalog,
    owner,
    repo,
    accessToken,
    branch,
  });

  const technologies = detectTechnologies(parsedManifests, scan.artifacts);

  return {
    repositoryId: scan.repositoryId,
    parsedManifests,
    artifacts: scan.artifacts,
    technologies,
  };
}
