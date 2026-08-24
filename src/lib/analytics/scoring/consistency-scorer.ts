import { CalendarConsistencyMetrics } from "../calendar-analysis";

export interface ConsistencyInput {
  github?: CalendarConsistencyMetrics | null;
  leetcode?: CalendarConsistencyMetrics | null;
}

export interface ConsistencyResult {
  score: number;
  githubConsistency: number | null;
  leetcodeConsistency: number | null;
  githubActiveWeekScore: number | null;
  githubGapScore: number | null;
  leetcodeActiveDayScore: number | null;
  leetcodeGapScore: number | null;
}

interface PlatformConsistencyScores {
  activeScore: number;
  gapScore: number;
  consistencyScore: number;
}

/**
 * Helper function to calculate coverage score, gap score, and platform consistency score (0-100).
 *
 * Platform Consistency = Active Score * 0.60 + Gap Score * 0.40
 * Where:
 * - Active Score = (activePeriods / totalPeriods) * 100
 * - Gap Score = 100 * (1 - longestInactiveGap / totalPeriods)
 *
 * If totalPeriods <= 0, returns scores of 0 to avoid division by zero.
 */
function calculatePlatformScores(
  metrics?: CalendarConsistencyMetrics | null
): PlatformConsistencyScores | null {
  if (!metrics) {
    return null;
  }

  const totalPeriods = Math.max(0, metrics.totalPeriods || 0);
  if (totalPeriods <= 0) {
    return {
      activeScore: 0,
      gapScore: 0,
      consistencyScore: 0,
    };
  }

  const activePeriods = Math.min(
    totalPeriods,
    Math.max(0, metrics.activePeriods || 0)
  );
  const longestInactiveGap = Math.min(
    totalPeriods,
    Math.max(0, metrics.longestInactiveGap || 0)
  );

  const rawActiveScore = (activePeriods / totalPeriods) * 100;
  const activeScore = Math.min(100, Math.max(0, rawActiveScore));

  const rawGapScore = 100 * (1 - longestInactiveGap / totalPeriods);
  const gapScore = Math.min(100, Math.max(0, rawGapScore));

  const consistencyScore = activeScore * 0.60 + gapScore * 0.40;

  return {
    activeScore,
    gapScore,
    consistencyScore,
  };
}

/**
 * Standalone pure scoring function for Consistency based on pre-analyzed calendar metrics.
 *
 * Formula:
 * - GitHub Consistency = GitHub Active Week Score * 0.60 + GitHub Gap Score * 0.40
 * - LeetCode Consistency = LeetCode Active Day Score * 0.60 + LeetCode Gap Score * 0.40
 * - Overall Consistency = GitHub Consistency * 0.50 + LeetCode Consistency * 0.50
 *
 * If one platform's metrics are missing (null/undefined), the available platform's score
 * is renormalized to 100%. If both are missing, overall score is 0.
 *
 * @param input Pre-analyzed metrics for GitHub and LeetCode
 * @returns ConsistencyResult containing final score and component breakdown
 */
export function calculateConsistency(
  input: ConsistencyInput
): ConsistencyResult {
  const githubCalc = calculatePlatformScores(input.github);
  const leetcodeCalc = calculatePlatformScores(input.leetcode);

  const githubActiveWeekScore = githubCalc ? githubCalc.activeScore : null;
  const githubGapScore = githubCalc ? githubCalc.gapScore : null;
  const githubConsistency = githubCalc ? githubCalc.consistencyScore : null;

  const leetcodeActiveDayScore = leetcodeCalc ? leetcodeCalc.activeScore : null;
  const leetcodeGapScore = leetcodeCalc ? leetcodeCalc.gapScore : null;
  const leetcodeConsistency = leetcodeCalc ? leetcodeCalc.consistencyScore : null;

  let rawTotalScore: number;

  if (githubConsistency !== null && leetcodeConsistency !== null) {
    // Standard 50/50 weighting
    rawTotalScore = githubConsistency * 0.50 + leetcodeConsistency * 0.50;
  } else if (githubConsistency !== null) {
    // Only GitHub metrics available
    rawTotalScore = githubConsistency;
  } else if (leetcodeConsistency !== null) {
    // Only LeetCode metrics available
    rawTotalScore = leetcodeConsistency;
  } else {
    // Neither available
    rawTotalScore = 0;
  }

  const score = Math.min(100, Math.max(0, Math.round(rawTotalScore)));

  return {
    score,
    githubConsistency,
    leetcodeConsistency,
    githubActiveWeekScore,
    githubGapScore,
    leetcodeActiveDayScore,
    leetcodeGapScore,
  };
}
