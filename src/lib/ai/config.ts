export const CONFIG_VERSION = "1.0.0";
export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

/**
 * Retrieves and validates the GEMINI_API_KEY environment variable.
 * Throws a descriptive error if the key is missing or blank.
 */
export function getGeminiApiKey(): string {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    throw new Error(
      "Missing GEMINI_API_KEY environment variable. The AI generation layer requires a valid API key configured."
    );
  }
  return apiKey;
}
