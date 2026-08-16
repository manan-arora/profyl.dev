import { SupportedManifest, ManifestParser } from "@/types/scanner";
import { PackageJsonParser } from "./parsers/package-json-parser";
import { RequirementsTxtParser } from "./parsers/requirements-txt-parser";
import { PyprojectTomlParser } from "./parsers/pyproject-toml-parser";
import { PomXmlParser } from "./parsers/pom-xml-parser";

/**
 * Static mapping of SupportedManifest types to ManifestParser implementations.
 */
const PARSER_MAP: Partial<Record<SupportedManifest, ManifestParser>> = {
  "package.json": new PackageJsonParser(),
  "requirements.txt": new RequirementsTxtParser(),
  "pyproject.toml": new PyprojectTomlParser(),
  "pom.xml": new PomXmlParser(),
};

/**
 * Retrieves the registered ManifestParser for a supported manifest type,
 * or undefined if no parser is available yet.
 */
export function getParser(type: SupportedManifest): ManifestParser | undefined {
  return PARSER_MAP[type];
}
