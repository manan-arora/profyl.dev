import { z } from "zod";

/**
 * Zod validation schema for the structured response returned by the AI generation layer.
 * Enforces primitive types, required fields, and strength chip count boundaries.
 */
export const AIOutputSchema = z.object({
  aiSignal: z.string(),
  aiSummary: z.string(),
  aiEvidence: z.string(),
  strengthChips: z.array(z.string()).min(3).max(5),
  projectSummaries: z.array(
    z.object({
      repositoryId: z.string(),
      summary: z.string().nullable(),
    })
  ),
});

/**
 * TypeScript type representation of the verified AI output.
 */
export type AIOutput = z.infer<typeof AIOutputSchema>;
