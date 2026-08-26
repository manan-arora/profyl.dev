import { prisma } from "@/lib/prisma";
import { leetcodeService } from "@/lib/services/leetcode.service";
import { computeAnalytics } from "@/lib/analytics/analytics-engine";
import { persistAnalytics } from "@/lib/services/analytics.service";
import { generateAndPersistAIInsights } from "@/lib/ai/ai-insights.service";

/**
 * Orchestrates the full backend onboarding preparation sequence:
 * 1. Ensure verified LeetCode cache data is current/fresh (expiresAt > now).
 * 2. Unconditionally compute and persist authoritative user analytics metrics.
 * 3. Generate and persist AI insights based on the pre-computed analytics.
 * 4. Transition user's profile status to DRAFT.
 *
 * All failures inside individual steps propagate outwards to notify the caller
 * and prevent transitioning the user to DRAFT status.
 *
 * @param userId - The ID of the user to prepare onboarding for.
 */
export async function completeOnboardingPreparation(userId: string): Promise<void> {
  // 1. Ensure verified LeetCode data is current/fresh
  const leetcodeCache = await prisma.leetCodeCache.findUnique({
    where: { userId },
  });

  if (!leetcodeCache || !leetcodeCache.username) {
    throw new Error("User does not have a verified LeetCode connection");
  }

  const now = new Date();
  const isLeetcodeCurrent =
    leetcodeCache.cacheExpiresAt &&
    leetcodeCache.cacheExpiresAt > now;

  if (!isLeetcodeCurrent) {
    await leetcodeService.syncLeetcodeData(userId);
  }

  // 2. Unconditionally compute and persist analytics
  const analyticsResult = await computeAnalytics(userId);
  await persistAnalytics(analyticsResult);

  // 3. Generate and persist AI insights
  await generateAndPersistAIInsights(userId, analyticsResult);

  // 4. Transition profileStatus to DRAFT
  await prisma.user.update({
    where: { id: userId },
    data: { profileStatus: "DRAFT" },
  });
}
