import { prisma } from "@/lib/prisma";
import { githubService } from "@/lib/services/github.service";
import { leetcodeService } from "@/lib/services/leetcode.service";
import { computeAnalytics } from "@/lib/analytics/analytics-engine";
import { persistAnalytics } from "@/lib/services/analytics.service";
import { generateAndPersistAIInsights } from "@/lib/ai/ai-insights.service";

/**
 * Checks cache age using cacheExpiresAt and synchronizes external source data
 * if missing or stale (older than the 12-hour threshold).
 *
 * @param userId - The ID of the user whose source data to check.
 * @returns Object indicating which sources were refreshed.
 */
export async function ensureSourceDataFresh(userId: string): Promise<{
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
  let githubRefreshed = false;
  let leetcodeRefreshed = false;

  // 1. Check GitHub cache freshness
  const isGithubCurrent =
    user.githubCache &&
    user.githubCache.cacheExpiresAt &&
    user.githubCache.cacheExpiresAt > now;

  if (!isGithubCurrent) {
    await githubService.syncGithub(userId);
    githubRefreshed = true;
  }

  // 2. Check LeetCode cache freshness (only if verified)
  if (user.isLeetcodeVerified && user.leetcodeCache?.username) {
    const isLeetcodeCurrent =
      user.leetcodeCache.cacheExpiresAt &&
      user.leetcodeCache.cacheExpiresAt > now;

    if (!isLeetcodeCurrent) {
      await leetcodeService.syncLeetcodeData(userId);
      leetcodeRefreshed = true;
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
 */
export async function runDerivedDataPipeline(userId: string): Promise<void> {
  // 1. Compute analytics
  const analyticsResult = await computeAnalytics(userId);

  // 2. Persist analytics
  await persistAnalytics(analyticsResult);

  // 3. Generate and persist AI insights
  await generateAndPersistAIInsights(userId, analyticsResult);
}

/**
 * Ensures all profile-related data is fresh:
 * 1. Checks and updates external source caches (GitHub and LeetCode) if they are older than 12 hours.
 * 2. Runs the derived data pipeline (analytics + AI) if any source cache was refreshed, or if
 *    persisted analytics or AI insights are missing or older than 12 hours.
 *
 * @param userId - The ID of the user.
 * @returns boolean - True if any refresh was actually executed, false otherwise.
 */
export async function ensureProfileDataFresh(userId: string): Promise<boolean> {
  const { anyRefreshed } = await ensureSourceDataFresh(userId);

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
    await runDerivedDataPipeline(userId);
    return true;
  }

  return false;
}
