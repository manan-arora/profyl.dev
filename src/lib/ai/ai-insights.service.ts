import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { AIInsights } from "@/generated/prisma/client";
import { AnalyticsComputationResult } from "../analytics/analytics-engine";
import { loadAIContextSources, buildAIContext } from "./context-builder";
import { generateAIOutput } from "./generator";
import { PROMPT_VERSION } from "./prompts";
import { GEMINI_MODEL } from "./config";

/**
 * Deterministic JSON stringifier that recursively sorts object keys,
 * preserves array ordering, preserves null values, and implements
 * standard JSON undefined semantics (omits undefined object fields,
 * represents undefined array elements as null).
 */
export function deterministicStringify(value: any): string {
  if (value === null) {
    return "null";
  }

  if (typeof value === "undefined") {
    return "undefined";
  }

  if (typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    const elements = value.map((el) => {
      if (typeof el === "undefined") {
        return "null";
      }
      return deterministicStringify(el);
    });
    return "[" + elements.join(",") + "]";
  }

  const keys = Object.keys(value)
    .filter((key) => typeof value[key] !== "undefined")
    .sort();

  const pairs = keys.map((key) => {
    return `${JSON.stringify(key)}:${deterministicStringify(value[key])}`;
  });

  return "{" + pairs.join(",") + "}";
}

/**
 * High-level service function that generates and persists AI insights.
 * Utilizes a 12-hour SWR caching mechanism validated against sourceHash and promptVersion.
 * Persists results and project summaries transactionally after validating repository ownership.
 *
 * @param userId - The unique identifier of the user.
 * @param analyticsResult - The pre-computed analytics computation result.
 * @returns The persisted/generated AIInsights record.
 */
export async function generateAndPersistAIInsights(
  userId: string,
  analyticsResult: AnalyticsComputationResult
): Promise<AIInsights> {
  // 1. Load context sources and build normalized AIContext
  const sources = await loadAIContextSources(userId, analyticsResult);
  const context = buildAIContext(sources);

  // 2. Compute deterministic SHA-256 hash of the normalized AIContext
  const serializedContext = deterministicStringify(context);
  const sourceHash = createHash("sha256").update(serializedContext).digest("hex");

  // 3. Lookup persisted AIInsights record
  const persisted = await prisma.aIInsights.findUnique({
    where: { userId },
  });

  // 4. Validate reuse criteria (exists, matching hash, matching prompt version, within 12-hour SWR window)
  const now = new Date();
  const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);

  const isReusable =
    persisted &&
    persisted.sourceHash === sourceHash &&
    persisted.promptVersion === PROMPT_VERSION &&
    persisted.generatedAt &&
    persisted.generatedAt >= twelveHoursAgo;

  if (isReusable) {
    return persisted;
  }

  // 5. Call low-level Gemini generation (outside the database transaction)
  const aiOutput = await generateAIOutput(context);

  // 6. Build Set of authorized featured repository IDs from sources to enforce ownership
  const userFeaturedRepoIds = new Set(sources.featuredRepositories.map((repo) => repo.id));

  // 7. Persist AI output and project summaries transactionally
  const [updatedInsight] = await prisma.$transaction([
    prisma.aIInsights.upsert({
      where: { userId },
      update: {
        aiSignal: aiOutput.aiSignal,
        aiSummary: aiOutput.aiSummary,
        aiEvidence: aiOutput.aiEvidence,
        strengthChips: aiOutput.strengthChips,
        sourceHash,
        promptVersion: PROMPT_VERSION,
        modelVersion: GEMINI_MODEL,
        generatedAt: now,
      },
      create: {
        userId,
        aiSignal: aiOutput.aiSignal,
        aiSummary: aiOutput.aiSummary,
        aiEvidence: aiOutput.aiEvidence,
        strengthChips: aiOutput.strengthChips,
        sourceHash,
        promptVersion: PROMPT_VERSION,
        modelVersion: GEMINI_MODEL,
        generatedAt: now,
      },
    }),
    ...aiOutput.projectSummaries
      .filter((proj) => userFeaturedRepoIds.has(proj.repositoryId))
      .map((proj) =>
        prisma.repository.update({
          where: { id: proj.repositoryId },
          data: {
            projectSummary: proj.summary,
          },
        })
      ),
  ]);

  return updatedInsight;
}
