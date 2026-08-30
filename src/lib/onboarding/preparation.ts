import { prisma } from "@/lib/prisma";
import { ensureSourceDataFresh, runDerivedDataPipeline } from "@/lib/services/freshness.service";

/**
 * Orchestrates the full backend onboarding preparation sequence:
 * 1. Validate the required verified LeetCode prerequisite.
 * 2. Ensure required source data is fresh.
 * 3. Run the derived-data pipeline to compute/persist analytics and AI insights.
 * 4. Only after successful completion, set profileStatus to DRAFT.
 *
 * All failures inside individual steps propagate outwards to notify the caller
 * and prevent transitioning the user to DRAFT status.
 *
 * @param userId - The ID of the user to prepare onboarding for.
 */
export async function completeOnboardingPreparation(userId: string): Promise<void> {
  // 1. Retrieve the user to check verification status and caches
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      leetcodeCache: true,
    },
  });

  if (!user || !user.isLeetcodeVerified || !user.leetcodeCache || !user.leetcodeCache.username) {
    throw new Error("User does not have a verified LeetCode connection");
  }

  // 2. Ensure required source data is fresh (syncs caches if older than 12h)
  await ensureSourceDataFresh(userId);

  // 3. Run runDerivedDataPipeline()
  await runDerivedDataPipeline(userId);

  // 4. Transition profileStatus to DRAFT
  await prisma.user.update({
    where: { id: userId },
    data: { profileStatus: "DRAFT" },
  });
}
