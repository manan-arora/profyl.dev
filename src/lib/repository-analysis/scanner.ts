import { getGithubRepositoryTree } from "@/lib/github/client";
import { DEFAULT_MAX_SCAN_DEPTH, discoverManifests } from "./discovery";
import { RepositoryScanResult } from "@/types/scanner";

const ROOT_GRADLE_VERSION_CATALOG_PATH = "gradle/libs.versions.toml";

export interface ScanRepositoryOptions {
  repositoryId: string;
  owner: string;
  repo: string;
  accessToken: string;
  branch: string;
  maxDepth?: number;
}

/**
 * Scans a GitHub repository to discover supported manifest files.
 *
 * Flow:
 * 1. Fetch recursive repository tree via existing GitHub client.
 * 2. Run discoverManifests on tree entries.
 * 3. Return RepositoryScanResult preserving repositoryId, discovered manifests, and truncation status.
 */
export async function scanRepository({
  repositoryId,
  owner,
  repo,
  accessToken,
  branch,
  maxDepth = DEFAULT_MAX_SCAN_DEPTH,
}: ScanRepositoryOptions): Promise<RepositoryScanResult> {
  const treeResult = await getGithubRepositoryTree(
    accessToken,
    owner,
    repo,
    branch
  );

  const manifests = discoverManifests(treeResult.tree, maxDepth);
  const hasRootGradleVersionCatalog = treeResult.tree.some(
    (entry) =>
      entry.type === "blob" && entry.path === ROOT_GRADLE_VERSION_CATALOG_PATH
  );

  return {
    repositoryId,
    manifests,
    truncated: treeResult.truncated,
    hasRootGradleVersionCatalog,
  };
}
