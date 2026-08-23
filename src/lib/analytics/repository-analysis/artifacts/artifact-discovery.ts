import { GithubTreeEntry } from "@/types/github";
import { DiscoveredArtifact } from "@/types/scanner";
import { getPathDepth } from "../discovery";
import { getArtifactType } from "./artifact-definitions";

export const DEFAULT_MAX_ARTIFACT_DEPTH = 5;

/**
 * Discovers supported repository artifacts from tree metadata only.
 *
 * Entries are returned in input order and limited to files within maxDepth.
 */
export function discoverArtifacts(
  tree: GithubTreeEntry[],
  maxDepth: number = DEFAULT_MAX_ARTIFACT_DEPTH,
): DiscoveredArtifact[] {
  if (!Number.isInteger(maxDepth) || maxDepth < 0) {
    throw new Error("maxDepth must be a non-negative integer");
  }

  if (!Array.isArray(tree) || tree.length === 0) {
    return [];
  }

  const discovered: DiscoveredArtifact[] = [];
  const seen = new Set<string>();

  for (const entry of tree) {
    // GitHub tree entries include directories; only blobs represent files.
    if (entry.type !== "blob") {
      continue;
    }

    // Reuse manifest depth semantics: root files are depth 0.
    if (getPathDepth(entry.path) > maxDepth) {
      continue;
    }

    const type = getArtifactType(entry.path);
    if (!type) {
      continue;
    }

    // A recursive tree should not produce duplicate artifact paths.
    if (seen.has(entry.path)) {
      continue;
    }

    seen.add(entry.path);
    discovered.push({ path: entry.path, type });
  }

  return discovered;
}
