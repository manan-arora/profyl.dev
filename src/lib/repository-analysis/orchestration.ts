import { getGithubFileContent } from "@/lib/github/client";
import { DiscoveredManifest, ParsedManifest } from "@/types/scanner";
import { getParser } from "./parser-registry";

export interface ParseManifestOptions {
  manifest: DiscoveredManifest;
  owner: string;
  repo: string;
  accessToken: string;
  branch: string;
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

  const dependencies = parser.parse(content);

  return {
    manifest,
    dependencies,
  };
}
