export type SupportedManifest =
  | "package.json"
  | "requirements.txt"
  | "pyproject.toml"
  | "pom.xml"
  | "build.gradle"
  | "go.mod";

export interface DiscoveredManifest {
  path: string;
  type: SupportedManifest;
}

export interface RepositoryScanResult {
  repositoryId: string;
  manifests: DiscoveredManifest[];
  truncated: boolean;
}

export interface ManifestParser {
  parse(content: string): string[];
}

export interface ParsedManifest {
  manifest: DiscoveredManifest;
  dependencies: string[];
}


