export interface OpenSourceInput {
  ossPrsMerged?: number | null;
  starsEarned?: number | null;
  forksEarned?: number | null;
}

export interface OpenSourceResult {
  score: number;
  contributionScore: number;
  starsScore: number;
  forksScore: number;
  impactScore: number;
}

/**
 * Calculates the External Contribution Score (0-100).
 * Formula: min(100, 100 * log(1 + ossPrsMerged) / log(51))
 * Saturation point: 50 merged PRs.
 */
function calculateContributionScore(ossPrsMerged?: number | null): number {
  if (
    ossPrsMerged === undefined ||
    ossPrsMerged === null ||
    Number.isNaN(ossPrsMerged)
  ) {
    return 0;
  }

  const prs = Math.max(0, ossPrsMerged);
  if (prs === 0) return 0;
  if (prs >= 50) return 100;

  const rawScore = 100 * (Math.log(1 + prs) / Math.log(51));
  return Math.min(100, Math.max(0, rawScore));
}

/**
 * Calculates the Stars Score (0-100).
 * Formula: min(100, 100 * log(1 + starsEarned) / log(101))
 * Saturation point: 100 stars.
 */
function calculateStarsScore(starsEarned?: number | null): number {
  if (
    starsEarned === undefined ||
    starsEarned === null ||
    Number.isNaN(starsEarned)
  ) {
    return 0;
  }

  const stars = Math.max(0, starsEarned);
  if (stars === 0) return 0;
  if (stars >= 100) return 100;

  const rawScore = 100 * (Math.log(1 + stars) / Math.log(101));
  return Math.min(100, Math.max(0, rawScore));
}

/**
 * Calculates the Forks Score (0-100).
 * Formula: min(100, 100 * log(1 + forksEarned) / log(21))
 * Saturation point: 20 forks.
 */
function calculateForksScore(forksEarned?: number | null): number {
  if (
    forksEarned === undefined ||
    forksEarned === null ||
    Number.isNaN(forksEarned)
  ) {
    return 0;
  }

  const forks = Math.max(0, forksEarned);
  if (forks === 0) return 0;
  if (forks >= 20) return 100;

  const rawScore = 100 * (Math.log(1 + forks) / Math.log(21));
  return Math.min(100, Math.max(0, rawScore));
}

/**
 * Standalone pure scoring function for Open Source based on GitHub activity signals.
 *
 * Formula:
 * - Contribution Score (60% Weight): 50 PR saturation curve
 * - Impact Score (40% Weight): Stars Score (70% Impact Weight) + Forks Score (30% Impact Weight)
 * - Overall Open Source Score: Contribution Score * 0.60 + Impact Score * 0.40
 *
 * @param input GitHub open-source statistics (ossPrsMerged, starsEarned, forksEarned)
 * @returns OpenSourceResult containing overall score and sub-component breakdown
 */
export function calculateOpenSource(input: OpenSourceInput): OpenSourceResult {
  const contributionScore = calculateContributionScore(input.ossPrsMerged);
  const starsScore = calculateStarsScore(input.starsEarned);
  const forksScore = calculateForksScore(input.forksEarned);

  const impactScore = starsScore * 0.70 + forksScore * 0.30;

  const rawTotalScore = contributionScore * 0.60 + impactScore * 0.40;
  const score = Math.min(100, Math.max(0, Math.round(rawTotalScore)));

  return {
    score,
    contributionScore,
    starsScore,
    forksScore,
    impactScore,
  };
}
