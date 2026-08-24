import { prisma } from "@/lib/prisma";
import { getGithubAccessToken } from "@/lib/auth/oauth";
import {
  analyzeFeaturedRepositories,
  FeaturedRepositoriesAnalysis,
} from "./repository-analysis/featured-repositories";
import { calculateTechnicalRange } from "./scoring/range-scorer";
import {
  calculateBuildActivity,
  BuildActivityResult,
} from "./scoring/build-activity-scorer";
import {
  calculateOpenSource,
  OpenSourceResult,
} from "./scoring/open-source-scorer";
import {
  calculateProblemSolving,
  ProblemSolvingResult,
} from "./scoring/problem-solving-scorer";
import {
  analyzeGithubCalendar,
  analyzeLeetcodeCalendar,
} from "./calendar-analysis";
import {
  calculateConsistency,
  ConsistencyResult,
} from "./scoring/consistency-scorer";
import {
  calculateProfylScore,
  ProfylScoreResult,
  Tier,
} from "./scoring/profyl-scorer";

export interface AnalyticsComputationResult {
  userId: string;
  profylScore: number | null;
  tier: Tier | null;
  githubScore: number;
  projectsScore: number | null;
  leetcodeScore: number;
  consistencyScore: number;

  radar: {
    buildActivity: number;
    technicalRange: number | null;
    problemSolving: number;
    consistency: number;
    openSource: number;
  };

  signalBreakdown: {
    github: number;
    projects: number | null;
    leetcode: number;
    consistency: number;
  };

  components: {
    buildActivity: BuildActivityResult;
    technicalRange: {
      score: number;
      signals: string[];
    } | null;
    problemSolving: ProblemSolvingResult;
    consistency: ConsistencyResult;
    openSource: OpenSourceResult;
  };

  featuredAnalysis: FeaturedRepositoriesAnalysis;
}

/**
 * Orchestrates the user-level analytics computation flow by loading user cache records,
 * running repository tree scanners on featured repos, and executing all dimension scorers.
 *
 * @param userId The ID of the user to compute analytics for
 * @returns The complete AnalyticsComputationResult holding all component scores and breakdown metrics
 */
export async function computeAnalytics(
  userId: string
): Promise<AnalyticsComputationResult> {
  // 1. Load all required data in parallel
  const [githubCache, leetcodeCache, previousAnalytics, allRepos] =
    await Promise.all([
      prisma.gitHubCache.findUnique({ where: { userId } }),
      prisma.leetCodeCache.findUnique({ where: { userId } }),
      prisma.analytics.findUnique({ where: { userId } }),
      prisma.repository.findMany({ where: { userId } }),
    ]);

  // Retrieve GitHub OAuth access token from Clerk
  const accessToken = await getGithubAccessToken(userId);

  // 2. Perform analysis on featured repositories
  const featuredAnalysis = await analyzeFeaturedRepositories(
    userId,
    accessToken
  );

  // 3. Calculate Technical Range
  let technicalRangeScore: number | null = null;
  let technicalRangeComponentResult: {
    score: number;
    signals: string[];
  } | null = null;

  const analyzedRepos = featuredAnalysis.repositories.filter(
    (r) => r.outcome === "analyzed"
  );

  if (analyzedRepos.length > 0) {
    const allTechnologies = analyzedRepos.flatMap((r) => r.technologies);
    technicalRangeComponentResult = calculateTechnicalRange(allTechnologies);
    technicalRangeScore = technicalRangeComponentResult.score;
  } else {
    // If no repos were analyzed successfully, fall back to previous analytics value if present
    if (
      previousAnalytics &&
      previousAnalytics.projectsScore !== null &&
      previousAnalytics.projectsScore !== undefined
    ) {
      technicalRangeScore = previousAnalytics.projectsScore;
      technicalRangeComponentResult = {
        score: technicalRangeScore,
        signals: [],
      };
    }
  }

  // 4. Calculate Build Activity
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);

  const activeProjectsCount = allRepos.filter((repo) => {
    return (
      !repo.isFork &&
      !repo.isArchived &&
      repo.githubUpdatedAt &&
      new Date(repo.githubUpdatedAt) >= twelveMonthsAgo
    );
  }).length;

  const buildActivityResult = calculateBuildActivity({
    totalContributionsLastYear: githubCache?.totalContributionsLastYear ?? null,
    activeProjects: activeProjectsCount,
  });

  // 5. Calculate Open Source
  const openSourceResult = calculateOpenSource({
    ossPrsMerged: githubCache?.ossPrsMerged ?? null,
    starsEarned: githubCache?.starsEarned ?? null,
    forksEarned: githubCache?.forksEarned ?? null,
  });

  // 6. Calculate Problem Solving
  const problemSolvingResult = calculateProblemSolving({
    totalSolved: leetcodeCache?.problemsSolved ?? 0,
    easySolved: leetcodeCache?.easySolved ?? 0,
    mediumSolved: leetcodeCache?.mediumSolved ?? 0,
    hardSolved: leetcodeCache?.hardSolved ?? 0,
    percentileRank: leetcodeCache?.percentile ?? null,
  });

  // 7. Calculate Consistency
  const githubConsistencyMetrics = analyzeGithubCalendar(
    githubCache?.contributionCalendar as any
  );
  const leetcodeConsistencyMetrics = analyzeLeetcodeCalendar(
    leetcodeCache?.normalizedSubmissionCalendar as any
  );

  const consistencyResult = calculateConsistency({
    github: githubCache ? githubConsistencyMetrics : null,
    leetcode: leetcodeCache ? leetcodeConsistencyMetrics : null,
  });

  // 8. Calculate final aggregated Profyl Score and user Tier
  const profylResult = calculateProfylScore({
    buildActivity: buildActivityResult.score,
    technicalRange: technicalRangeScore,
    problemSolving: problemSolvingResult.score,
    consistency: consistencyResult.score,
    openSource: openSourceResult.score,
  });

  // 9. Return the complete aggregated results
  return {
    userId,
    profylScore: profylResult.profylScore,
    tier: profylResult.tier,
    githubScore: profylResult.githubScore,
    projectsScore: profylResult.projectsScore,
    leetcodeScore: profylResult.leetcodeScore,
    consistencyScore: profylResult.consistencyScore,

    radar: profylResult.radar,
    signalBreakdown: profylResult.signalBreakdown,

    components: {
      buildActivity: buildActivityResult,
      technicalRange: technicalRangeComponentResult,
      problemSolving: problemSolvingResult,
      consistency: consistencyResult,
      openSource: openSourceResult,
    },

    featuredAnalysis,
  };
}
