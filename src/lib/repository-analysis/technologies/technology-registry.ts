import { SupportedArtifact } from "@/types/scanner";
import { TechnologyDefinition, Ecosystem } from "./technology-types";
import { applicationStackTechnologies } from "./registry/application-stack";
import { databaseTechnologies } from "./registry/database";
import { authenticationTechnologies } from "./registry/authentication";
import { integrationsTechnologies } from "./registry/integrations";
import { aiMlTechnologies } from "./registry/ai-ml";
import { infrastructureTechnologies } from "./registry/infrastructure";
import { cachingTechnologies } from "./registry/caching";
import { realtimeTechnologies } from "./registry/realtime";
import { backgroundJobsTechnologies } from "./registry/background-jobs";

/**
 * Single source of truth containing all canonical technology definitions
 * aggregated across category files.
 */
export const technologyRegistry: TechnologyDefinition[] = [
  ...applicationStackTechnologies,
  ...databaseTechnologies,
  ...authenticationTechnologies,
  ...integrationsTechnologies,
  ...aiMlTechnologies,
  ...infrastructureTechnologies,
  ...cachingTechnologies,
  ...realtimeTechnologies,
  ...backgroundJobsTechnologies,
];

// Derived reverse lookup indexes to enable O(1) matching performance in the detector.

/**
 * Quick lookup index for retrieving full technology definition schemas by their canonical ID.
 */
export const technologyById = new Map<string, TechnologyDefinition>();

/**
 * Reverse mapping to find matching canonical technology IDs from an ecosystem-specific package/module name.
 * Structures: Record<Ecosystem, Map<DependencyName, TechnologyIds[]>>
 */
export const manifestLookup: Record<Ecosystem, Map<string, string[]>> = {
  npm: new Map(),
  python: new Map(),
  maven: new Map(),
  gradle: new Map(),
  go: new Map(),
};

/**
 * Reverse mapping to find matching canonical technology IDs from a discovered artifact type.
 * Structures: Map<ArtifactType, TechnologyIds[]>
 */
export const artifactLookup = new Map<SupportedArtifact, string[]>();

// Automatically populate the derived O(1) lookup maps on module load.
for (const tech of technologyRegistry) {
  // Index full definitions by their canonical ID
  technologyById.set(tech.id, tech);

  // Map package identifiers to technology IDs grouped by manifest ecosystem type
  if (tech.detection.manifest) {
    for (const [ecoStr, identifiers] of Object.entries(tech.detection.manifest)) {
      const ecosystem = ecoStr as Ecosystem;
      const map = manifestLookup[ecosystem];
      if (identifiers) {
        for (const id of identifiers) {
          let list = map.get(id);
          if (!list) {
            list = [];
            map.set(id, list);
          }
          list.push(tech.id);
        }
      }
    }
  }

  // Map configuration/infrastructure file types (artifacts) to technology IDs
  if (tech.detection.artifact) {
    for (const artType of tech.detection.artifact) {
      let list = artifactLookup.get(artType);
      if (!list) {
        list = [];
        artifactLookup.set(artType, list);
      }
      list.push(tech.id);
    }
  }
}
