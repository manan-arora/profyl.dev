import { ParsedManifest, DiscoveredArtifact } from "@/types/scanner";
import { DetectedTechnology, TechnologyEvidence, Ecosystem } from "./technology-types";
import {
  technologyRegistry,
  technologyById,
  manifestLookup,
  artifactLookup,
} from "./technology-registry";

/**
 * Maps a supported manifest file type (e.g. "package.json") to its canonical package ecosystem.
 * Returns null if the manifest type is not supported by the technology layer.
 * 
 * @param type The manifest filename/type (e.g. "package.json")
 * @returns The matching Ecosystem name, or null if unsupported
 */
function manifestTypeToEcosystem(type: string): Ecosystem | null {
  switch (type) {
    case "package.json":
      return "npm";
    case "requirements.txt":
    case "pyproject.toml":
      return "python";
    case "pom.xml":
      return "maven";
    case "build.gradle":
    case "build.gradle.kts":
      return "gradle";
    case "go.mod":
      return "go";
    default:
      return null;
  }
}

/**
 * Main detection entrypoint that analyzes repository evidence (parsed manifests and discovered artifacts)
 * and resolves them against a declarative technology registry.
 * 
 * Normalizes all ecosystem-specific identifiers to canonical technologies, deduplicates by canonical ID,
 * gathers and combines evidence explaining why each tech was matched, and returns the sorted, deterministic list.
 * 
 * Uses derived index lookup maps (manifestLookup and artifactLookup) to achieve O(1) identifier matching.
 * 
 * @param parsedManifests Collection of already parsed dependency manifests
 * @param artifacts Collection of discovered repository configuration/infrastructure files
 * @returns A list of detected technologies with aggregated evidence, sorted alphabetically by ID
 */
export function detectTechnologies(
  parsedManifests: ParsedManifest[],
  artifacts: DiscoveredArtifact[]
): DetectedTechnology[] {
  const detectedMap = new Map<string, DetectedTechnology>();

  // Process manifest dependencies using O(1) index lookup
  for (const parsed of parsedManifests) {
    const ecosystem = manifestTypeToEcosystem(parsed.manifest.type);
    if (!ecosystem) {
      continue;
    }

    const dependencies = parsed.dependencies;
    const path = parsed.manifest.path;

    for (const dep of dependencies) {
      // Look up canonical technology IDs registered for this dependency under the active ecosystem
      const matchedTechIds = manifestLookup[ecosystem].get(dep);
      if (matchedTechIds) {
        for (const techId of matchedTechIds) {
          const tech = technologyById.get(techId);
          if (tech) {
            const evidence: TechnologyEvidence = {
              source: "manifest",
              ecosystem,
              identifier: dep,
              path,
            };

            addEvidence(detectedMap, tech.id, tech.name, tech.signals, evidence);
          }
        }
      }
    }
  }

  // Process artifacts using O(1) index lookup
  for (const artifact of artifacts) {
    const matchedTechIds = artifactLookup.get(artifact.type);
    if (matchedTechIds) {
      for (const techId of matchedTechIds) {
        const tech = technologyById.get(techId);
        if (tech) {
          const evidence: TechnologyEvidence = {
            source: "artifact",
            identifier: artifact.type,
            path: artifact.path,
          };

          addEvidence(detectedMap, tech.id, tech.name, tech.signals, evidence);
        }
      }
    }
  }

  // Convert map to sorted array to ensure deterministic output
  return Array.from(detectedMap.values()).sort((a, b) =>
    a.technologyId.localeCompare(b.technologyId)
  );
}

/**
 * Aggregates evidence for a given technology ID in the detection map.
 * Ensures that if a technology has already been detected, the new evidence is appended.
 * Deduplicates exact duplicate evidence records (e.g. identical package name matched multiple times in a single manifest).
 * 
 * @param detectedMap Map tracking detected technologies by their canonical ID
 * @param techId Canonical ID of the technology
 * @param name Canonical user-facing name of the technology
 * @param signals Signals declared for the technology (e.g., ["Database"])
 * @param newEvidence The new manifest or artifact match evidence to add
 */
function addEvidence(
  detectedMap: Map<string, DetectedTechnology>,
  techId: string,
  name: string,
  signals: string[],
  newEvidence: TechnologyEvidence
) {
  let detected = detectedMap.get(techId);
  if (!detected) {
    detected = {
      technologyId: techId,
      name,
      signals: [...signals],
      evidence: [],
    };
    detectedMap.set(techId, detected);
  }

  // Avoid duplicate evidence (e.g. same identifier in the same file)
  const isDuplicateEvidence = detected.evidence.some((ev) => {
    if (ev.source !== newEvidence.source || ev.path !== newEvidence.path) {
      return false;
    }
    if (ev.source === "manifest" && newEvidence.source === "manifest") {
      return (
        ev.ecosystem === newEvidence.ecosystem &&
        ev.identifier === newEvidence.identifier
      );
    }
    if (ev.source === "artifact" && newEvidence.source === "artifact") {
      return ev.identifier === newEvidence.identifier;
    }
    return false;
  });

  if (!isDuplicateEvidence) {
    detected.evidence.push(newEvidence);
  }
}
export { technologyRegistry };
