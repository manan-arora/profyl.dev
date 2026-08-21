import { SupportedArtifact } from "@/types/scanner";

export type DetectionSource = "manifest" | "artifact";

export type Ecosystem = "npm" | "python" | "maven" | "gradle" | "go";

export interface TechnologyDefinition {
  id: string;
  name: string;
  detection: {
    manifest?: {
      npm?: string[];
      python?: string[];
      maven?: string[];
      gradle?: string[];
      go?: string[];
    };
    artifact?: SupportedArtifact[];
  };
  signals: string[];
}

export interface ManifestEvidence {
  source: "manifest";
  ecosystem: Ecosystem;
  identifier: string;
  path: string;
}

export interface ArtifactEvidence {
  source: "artifact";
  identifier: SupportedArtifact;
  path: string;
}

export type TechnologyEvidence = ManifestEvidence | ArtifactEvidence;

export interface DetectedTechnology {
  technologyId: string;
  name: string;
  signals: string[];
  evidence: TechnologyEvidence[];
}
