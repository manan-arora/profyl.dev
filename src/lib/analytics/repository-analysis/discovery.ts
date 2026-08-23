import { GithubTreeEntry } from "@/types/github";
import { DiscoveredManifest } from "@/types/scanner";
import { isSupportedManifest } from "./manifest-definitions";

export const DEFAULT_MAX_SCAN_DEPTH = 5;

/**
 * Calculates directory depth of a file path based on directory segments before the filename.
 * - "package.json" -> depth 0
 * - "backend/pom.xml" -> depth 1
 * - "apps/api/pom.xml" -> depth 2
 */
export function getPathDepth(filePath: string): number {
  const parts = filePath.split("/");
  return parts.length - 1;
}

/**
 * Discovers supported manifests from recursive repository tree entries.
 *
 * @param tree Array of GitHub repository tree entries
 * @param maxDepth Maximum directory depth allowed (default: 5). Must be a non-negative integer.
 * @returns Array of discovered manifest objects preserving input order
 */
export function discoverManifests(
  tree: GithubTreeEntry[],
  maxDepth: number = DEFAULT_MAX_SCAN_DEPTH
): DiscoveredManifest[] {
  if (!Number.isInteger(maxDepth) || maxDepth < 0) {
    throw new Error("maxDepth must be a non-negative integer");
  }

  if (!Array.isArray(tree) || tree.length === 0) {
    return [];
  }

  const discovered: DiscoveredManifest[] = [];

  for (const entry of tree) {
    // Only file/blob entries count (ignore "tree" directory entries)
    if (entry.type !== "blob") {
      continue;
    }

    const depth = getPathDepth(entry.path);
    if (depth > maxDepth) {
      continue;
    }

    const filename = entry.path.substring(entry.path.lastIndexOf("/") + 1);

    if (isSupportedManifest(filename)) {
      discovered.push({
        path: entry.path,
        type: filename,
      });
    }
  }

  return discovered;
}
