import { SupportedArtifact } from "@/types/scanner";

// Keep artifact recognition centralized so discovery only coordinates tree traversal.
const ARTIFACT_FILENAME_TYPES: ReadonlyMap<string, SupportedArtifact> = new Map(
  [
    ["Dockerfile", "dockerfile"],
    ["docker-compose.yml", "docker-compose"],
    ["docker-compose.yaml", "docker-compose"],
    ["compose.yml", "docker-compose"],
    ["compose.yaml", "docker-compose"],
    ["vercel.json", "vercel"],
    ["render.yaml", "render"],
    ["netlify.toml", "netlify"],
    ["firebase.json", "firebase"],
  ],
);

function getFilename(filePath: string): string {
  return filePath.substring(filePath.lastIndexOf("/") + 1);
}

export function getArtifactType(
  filePath: string,
): SupportedArtifact | undefined {
  const filename = getFilename(filePath);
  const exactMatch = ARTIFACT_FILENAME_TYPES.get(filename);

  if (exactMatch) {
    return exactMatch;
  }

  // Workflow files are identified by their fixed GitHub Actions tree prefix.
  if (filePath.startsWith(".github/workflows/") && filename.length > 0) {
    return "github-actions";
  }

  // Generic YAML is intentionally excluded because tree metadata cannot prove
  // that a YAML file is a Kubernetes manifest.
  if (filename.endsWith(".tf")) {
    return "terraform";
  }

  return undefined;
}
