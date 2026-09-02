import { prisma } from "@/lib/prisma";
import { githubService } from "@/lib/services/github.service";
import { leetcodeService } from "@/lib/services/leetcode.service";
import { computeAnalytics } from "@/lib/analytics/analytics-engine";
import { persistAnalytics } from "@/lib/services/analytics.service";
import { generateAndPersistAIInsights } from "@/lib/ai/ai-insights.service";
import { createTracker, PerformanceTracker } from "@/lib/utils/timing";

/**
 * Checks cache age using cacheExpiresAt and synchronizes external source data
 * concurrently (GitHub + LeetCode) if missing or stale (older than the 12-hour threshold).
 * Preserves failure isolation so that a failure in one platform sync does not invalidate or zero the other.
 *
 * @param userId - The ID of the user whose source data to check.
 * @param tracker - Optional performance tracker instance.
 * @returns Object indicating which sources were refreshed.
 */
export async function ensureSourceDataFresh(
  userId: string,
  tracker?: PerformanceTracker
): Promise<{
  anyRefreshed: boolean;
  githubRefreshed: boolean;
  leetcodeRefreshed: boolean;
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      githubCache: true,
      leetcodeCache: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const now = new Date();

  // 1. Check GitHub cache freshness
  const isGithubCurrent =
    user.githubCache &&
    user.githubCache.cacheExpiresAt &&
    user.githubCache.cacheExpiresAt > now;

  // 2. Check LeetCode cache freshness (only if verified)
  const isLeetcodeVerifiedAndNeeded =
    Boolean(user.isLeetcodeVerified && user.leetcodeCache?.username);
  const isLeetcodeCurrent =
    !isLeetcodeVerifiedAndNeeded ||
    Boolean(
      user.leetcodeCache &&
        user.leetcodeCache.cacheExpiresAt &&
        user.leetcodeCache.cacheExpiresAt > now
    );

  const tasks: Promise<"github" | "leetcode">[] = [];
  const taskTypes: ("github" | "leetcode")[] = [];

  if (!isGithubCurrent) {
    taskTypes.push("github");
    tasks.push(
      (async () => {
        if (tracker) tracker.startStage("githubSync");
        try {
          await githubService.syncGithub(userId);
          return "github" as const;
        } finally {
          if (tracker) tracker.endStage("githubSync");
        }
      })()
    );
  }

  if (!isLeetcodeCurrent) {
    taskTypes.push("leetcode");
    tasks.push(
      (async () => {
        if (tracker) tracker.startStage("leetcodeSync");
        try {
          await leetcodeService.syncLeetcodeData(userId);
          return "leetcode" as const;
        } finally {
          if (tracker) tracker.endStage("leetcodeSync");
        }
      })()
    );
  }

  let githubRefreshed = false;
  let leetcodeRefreshed = false;

  if (tasks.length > 0) {
    const results = await Promise.allSettled(tasks);
    let githubError: unknown = null;
    let leetcodeError: unknown = null;

    results.forEach((result, idx) => {
      const type = taskTypes[idx];
      if (result.status === "fulfilled") {
        if (type === "github") githubRefreshed = true;
        if (type === "leetcode") leetcodeRefreshed = true;
      } else {
        console.error(`[FreshnessService] Platform sync failed for ${type}:`, result.reason);
        if (type === "github") githubError = result.reason;
        if (type === "leetcode") leetcodeError = result.reason;
      }
    });

    // If both failed when both were required, rethrow error
    if (tasks.length === 2 && githubError && leetcodeError) {
      throw githubError;
    }
  }

  return {
    anyRefreshed: githubRefreshed || leetcodeRefreshed,
    githubRefreshed,
    leetcodeRefreshed,
  };
}

/**
 * Performs analytics recalculation and AI insights generation on the current
 * database caches. Does not trigger external API synchronization.
 *
 * @param userId - The ID of the user.
 * @param tracker - Optional performance tracker instance.
 */
export async function runDerivedDataPipeline(
  userId: string,
  tracker?: PerformanceTracker
): Promise<void> {
  const activeTracker = tracker || createTracker();

  // 1. Compute analytics
  const analyticsResult = await activeTracker.measureAsync("computeAnalytics", () =>
    computeAnalytics(userId)
  );

  // 2. Persist analytics
  await activeTracker.measureAsync("persistAnalytics", () =>
    persistAnalytics(analyticsResult)
  );

  // 3. Generate and persist AI insights
  await activeTracker.measureAsync("generateAndPersistAIInsights", () =>
    generateAndPersistAIInsights(userId, analyticsResult)
  );
}

/**
 * Ensures all profile-related data is fresh:
 * 1. Checks and updates external source caches (GitHub and LeetCode) concurrently if they are older than 12 hours.
 * 2. Runs the derived data pipeline (analytics + AI) if any source cache was refreshed, or if
 *    persisted analytics or AI insights are missing or older than 12 hours.
 *
 * @param userId - The ID of the user.
 * @returns boolean - True if any refresh was actually executed, false otherwise.
 */
export async function ensureProfileDataFresh(userId: string): Promise<boolean> {
  const tracker = createTracker();
  tracker.startStage("ensureSourceDataFresh");
  const { anyRefreshed } = await ensureSourceDataFresh(userId, tracker);
  tracker.endStage("ensureSourceDataFresh");

  const now = new Date();
  const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);

  const [analytics, aiInsights] = await Promise.all([
    prisma.analytics.findUnique({ where: { userId } }),
    prisma.aIInsights.findUnique({ where: { userId } }),
  ]);

  const needsDerived =
    anyRefreshed ||
    !analytics ||
    !analytics.computedAt ||
    analytics.computedAt < twelveHoursAgo ||
    !aiInsights ||
    !aiInsights.generatedAt ||
    aiInsights.generatedAt < twelveHoursAgo;

  if (needsDerived) {
    await runDerivedDataPipeline(userId, tracker);
    tracker.logSummary(`ensureProfileDataFresh for user ${userId}`);
    return true;
  }

  tracker.logSummary(`ensureProfileDataFresh (cache current) for user ${userId}`);
  return false;
}

/**
 * Schedules background revalidation using Next.js `after()` when available,
 * or falls back to an unhandled promise catch block for non-Next environments (e.g. unit tests).
 *
 * @param userId - The ID of the user whose profile data to revalidate in the background.
 */
export function scheduleBackgroundRevalidation(userId: string): void {
  const runBackground = async () => {
    try {
      await ensureProfileDataFresh(userId);
    } catch (err) {
      console.error(`[BackgroundRevalidation] Background refresh failed for user ${userId}:`, err);
    }
  };

  try {
    // Dynamic import/require of Next.js 'after' from next/server
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const nextServer = require("next/server");
    if (typeof nextServer.after === "function") {
      nextServer.after(runBackground);
      return;
    }
  } catch {
    // Fallback if 'next/server' is not in execution context
  }

  // Fallback fire-and-forget for tests or non-Next contexts
  void runBackground();
}

