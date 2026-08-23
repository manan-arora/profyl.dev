export interface BuildActivityInput {
  totalContributionsLastYear?: number | null;
  activeProjects?: number | null;
}

export interface BuildActivityResult {
  score: number;
  contributionScore: number | null;
  activeProjectScore: number | null;
}

/**
 * Calculates the Contribution Volume component score (0-100).
 * Formula: min(100, 100 * log(1 + totalContributionsLastYear) / log(1501))
 * Saturated at 1,500 contributions.
 * Returns null if totalContributionsLastYear is null or undefined.
 */
function calculateContributionScore(
  totalContributionsLastYear?: number | null
): number | null {
  if (
    totalContributionsLastYear === undefined ||
    totalContributionsLastYear === null ||
    Number.isNaN(totalContributionsLastYear)
  ) {
    return null;
  }

  const contributions = Math.max(0, totalContributionsLastYear);
  if (contributions === 0) {
    return 0;
  }
  if (contributions >= 1500) {
    return 100;
  }

  const rawScore = 100 * (Math.log(1 + contributions) / Math.log(1501));
  return Math.min(100, Math.max(0, rawScore));
}

/**
 * Calculates the Active Project component score (0-100).
 * Formula: min(100, 100 * log(1 + activeProjects) / log(21))
 * Saturated at 20 active projects.
 * Returns null if activeProjects is null or undefined.
 */
function calculateActiveProjectScore(
  activeProjects?: number | null
): number | null {
  if (
    activeProjects === undefined ||
    activeProjects === null ||
    Number.isNaN(activeProjects)
  ) {
    return null;
  }

  const projects = Math.max(0, activeProjects);
  if (projects === 0) {
    return 0;
  }
  if (projects >= 20) {
    return 100;
  }

  const rawScore = 100 * (Math.log(1 + projects) / Math.log(21));
  return Math.min(100, Math.max(0, rawScore));
}

/**
 * Standalone pure scoring function for Build Activity based on GitHub contribution
 * volume and active public projects.
 *
 * Formula:
 * - Contribution Score (50% Weight)
 * - Active Project Score (50% Weight)
 *
 * If one component is missing (null/undefined), the available component is renormalized.
 * If both components are missing, the overall score is 0 and both components return null.
 *
 * @param input GitHub activity statistics
 * @returns BuildActivityResult with overall score and component scores
 */
export function calculateBuildActivity(
  input: BuildActivityInput
): BuildActivityResult {
  const contributionScore = calculateContributionScore(
    input.totalContributionsLastYear
  );
  const activeProjectScore = calculateActiveProjectScore(input.activeProjects);

  let rawTotalScore: number;

  if (contributionScore !== null && activeProjectScore !== null) {
    // Both components available (50% / 50% weighting)
    rawTotalScore = contributionScore * 0.50 + activeProjectScore * 0.50;
  } else if (contributionScore !== null) {
    // Only contribution score available
    rawTotalScore = contributionScore;
  } else if (activeProjectScore !== null) {
    // Only active project score available
    rawTotalScore = activeProjectScore;
  } else {
    // Neither available
    rawTotalScore = 0;
  }

  const score = Math.min(100, Math.max(0, Math.round(rawTotalScore)));

  return {
    score,
    contributionScore,
    activeProjectScore,
  };
}
