import { SupportedManifest, ManifestParser } from "@/types/scanner";

/**
 * Static mapping of SupportedManifest types to ManifestParser implementations.
 * Individual parsers will be added here as they are implemented in subsequent tasks.
 */
const PARSER_MAP: Partial<Record<SupportedManifest, ManifestParser>> = {};

/**
 * Retrieves the registered ManifestParser for a supported manifest type,
 * or undefined if no parser is available yet.
 */
export function getParser(type: SupportedManifest): ManifestParser | undefined {
  return PARSER_MAP[type];
}
