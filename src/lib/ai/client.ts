import { GoogleGenAI } from "@google/genai";
import { getGeminiApiKey } from "./config";

/**
 * Creates and returns an instance of the GoogleGenAI client.
 * Calls getGeminiApiKey() to ensure the API key is explicitly validated before instantiation.
 */
export function getGeminiClient(): GoogleGenAI {
  const apiKey = getGeminiApiKey();
  return new GoogleGenAI({ apiKey });
}
