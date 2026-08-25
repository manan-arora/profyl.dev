import { getGeminiClient } from "./client";
import { GEMINI_MODEL } from "./config";
import { SYSTEM_PROMPT, buildUserPrompt } from "./prompts";
import { AIContext } from "./context-builder";
import { AIOutput, AIOutputSchema } from "./output-schema";

/**
 * Static JSON Schema representing the AIOutput contract for structured Gemini generation calls.
 * Enforces field types, minimum/maximum items for strengthChips, and project summary nullability.
 */
export const GEMINI_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    aiSignal: { type: "string" },
    aiSummary: { type: "string" },
    aiEvidence: { type: "string" },
    strengthChips: {
      type: "array",
      items: { type: "string" },
      minItems: 3,
      maxItems: 5,
    },
    projectSummaries: {
      type: "array",
      items: {
        type: "object",
        properties: {
          repositoryId: { type: "string" },
          summary: {
            type: "string",
            nullable: true,
          },
        },
        required: ["repositoryId", "summary"],
      },
    },
  },
  required: [
    "aiSignal",
    "aiSummary",
    "aiEvidence",
    "strengthChips",
    "projectSummaries",
  ],
};

/**
 * Calls the Gemini API to generate structured profile insights for the given developer context.
 * Performs explicit JSON parsing and validates the structure using the application-level AIOutputSchema.
 */
export async function generateAIOutput(context: AIContext): Promise<AIOutput> {
  const client = getGeminiClient();
  const contextJson = JSON.stringify(context);

  const response = await client.models.generateContent({
    model: GEMINI_MODEL,
    contents: buildUserPrompt(contextJson),
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: GEMINI_RESPONSE_SCHEMA,
    },
  });

  const text = response.text;
  if (!text || text.trim() === "") {
    throw new Error("Gemini API returned an empty text response.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (error: any) {
    throw new Error(
      `Failed to parse Gemini JSON response: ${error.message}. Raw text: ${text}`
    );
  }

  return AIOutputSchema.parse(parsed);
}
