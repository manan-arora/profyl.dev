import { getGithubFileContent } from "@/lib/github/client";
import {
  ContextualManifestParser,
  DiscoveredManifest,
  ParsedManifest,
} from "@/types/scanner";
import { getParser } from "./parser-registry";

export interface ParseManifestOptions {
  manifest: DiscoveredManifest;
  owner: string;
  repo: string;
  accessToken: string;
  branch: string;
  gradleVersionCatalogContent?: string;
}

function isContextualManifestParser(
  parser: object
): parser is ContextualManifestParser {
  return "parseWithContext" in parser && typeof parser.parseWithContext === "function";
}

const ROOT_GRADLE_VERSION_CATALOG_PATH = "gradle/libs.versions.toml";

// Gradle catalogs are intentionally resolved only from the repository root.
// No ancestor-directory probing is performed here.
export async function getRootGradleVersionCatalogContent(
  accessToken: string,
  owner: string,
  repo: string,
  branch: string
): Promise<string> {
  return getGithubFileContent(
    accessToken,
    owner,
    repo,
    ROOT_GRADLE_VERSION_CATALOG_PATH,
    branch
  );
}

/**
 * Orchestrates parsing a single discovered manifest:
 * 1. Resolves registered parser for the manifest type.
 * 2. Fetches raw decoded text content from GitHub.
 * 3. Invokes parser.parse(content).
 * 4. Returns ParsedManifest containing manifest reference and raw dependency identifiers.
 */
export async function parseDiscoveredManifest({
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
    branch
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
