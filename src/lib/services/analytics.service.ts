import { prisma } from "@/lib/prisma";
import { AnalyticsComputationResult } from "@/lib/analytics/analytics-engine";

/**
 * Persists the results of an analytics computation to the database.
 * Updates repository-level analysis data for successfully analyzed featured repos,
 * and upserts the user's single Analytics record.
 * Done inside a single database transaction to guarantee atomic updates.
 *
 * @param result The calculated user analytics payload
 */
export async function persistAnalytics(
  result: AnalyticsComputationResult
): Promise<void> {
  const { userId, featuredAnalysis } = result;

  await prisma.$transaction(async (tx) => {
    // 1. Update successfully analyzed repositories
    for (const repoResult of featuredAnalysis.repositories) {
      if (repoResult.outcome === "analyzed") {
        const uniqueSignals = Array.from(
          new Set(repoResult.technologies.flatMap((t) => t.signals))
        );

        await tx.repository.update({
          where: {
            id: repoResult.repositoryId,
          },
          data: {
            detectedTechnologies: repoResult.technologies as any,
            detectedSignals: uniqueSignals,
          },
        });
      }
    }

    // 2. Upsert user Analytics record preserving nulls
    await tx.analytics.upsert({
      where: {
        userId,
      },
      update: {
        profylScore: result.profylScore,
        tier: result.tier,
        githubScore: result.githubScore,
        projectsScore: result.projectsScore,
        leetcodeScore: result.leetcodeScore,
        consistencyScore: result.consistencyScore,
        radar: result.radar as any,
        signalBreakdown: result.signalBreakdown as any,
        computedAt: new Date(),
      },
      create: {
        userId,
        profylScore: result.profylScore,
        tier: result.tier,
        githubScore: result.githubScore,
        projectsScore: result.projectsScore,
        leetcodeScore: result.leetcodeScore,
        consistencyScore: result.consistencyScore,
        radar: result.radar as any,
        signalBreakdown: result.signalBreakdown as any,
        computedAt: new Date(),
      },
    });
  });
}
export const analyticsService = {
  persistAnalytics,
};
