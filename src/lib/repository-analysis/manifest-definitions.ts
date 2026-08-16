import { SupportedManifest } from "@/types/scanner";

export const SUPPORTED_MANIFESTS: ReadonlySet<string> = new Set<SupportedManifest>([
  "package.json",
  "requirements.txt",
  "pyproject.toml",
  "pom.xml",
  "build.gradle",
  "go.mod",
]);

export function isSupportedManifest(filename: string): filename is SupportedManifest {
  return SUPPORTED_MANIFESTS.has(filename);
}
