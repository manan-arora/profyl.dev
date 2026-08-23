export interface ProblemSolvingInput {
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  percentileRank?: number | null;
}

export interface ProblemSolvingResult {
  score: number;
  volumeScore: number;
  difficultyScore: number;
  contestScore: number | null;
}

/**
 * Calculates the Volume component score (0-100).
 * - 0-50 solved: linear scale 10 * (solved / 50)
 * - 50-1000 solved: logarithmic diminishing returns 10 + 90 * log((solved + 50) / 100) / log(10.5)
 * - >= 1000 solved: saturated at 100
 */
function calculateVolumeScore(totalSolved: number): number {
  if (totalSolved <= 0) {
    return 0;
  }
  if (totalSolved <= 50) {
    return 10 * (totalSolved / 50);
  }
  if (totalSolved >= 1000) {
    return 100;
  }

  const logNumerator = Math.log((totalSolved + 50) / 100);
  const logDenominator = Math.log(10.5); // log(21 / 2)
  const rawVolume = 10 + 90 * (logNumerator / logDenominator);

  return Math.min(100, Math.max(0, rawVolume));
}

/**
 * Calculates the Difficulty Depth component score (0-100).
 * Easy = 1, Medium = 2, Hard = 4
 * Difficulty Index = (Easy*1 + Medium*2 + Hard*4) / totalSolved
 * Difficulty Score = (Difficulty Index / 4) * 100
 */
function calculateDifficultyScore(
  totalSolved: number,
  easySolved: number,
  mediumSolved: number,
  hardSolved: number
): number {
  if (totalSolved <= 0) {
    return 0;
  }

  const difficultyIndex =
    (easySolved * 1 + mediumSolved * 2 + hardSolved * 4) / totalSolved;
  const rawDifficulty = (difficultyIndex / 4) * 100;

  return Math.min(100, Math.max(0, rawDifficulty));
}

/**
 * Calculates the Contest Performance component score (0-100).
 * Returns null if percentileRank is missing/null/undefined.
 */
function calculateContestScore(percentileRank?: number | null): number | null {
  if (
    percentileRank === undefined ||
    percentileRank === null ||
    Number.isNaN(percentileRank)
  ) {
    return null;
  }
  return Math.min(100, Math.max(0, percentileRank));
}

/**
 * Standalone pure scoring function for Problem Solving activity based on LeetCode data.
 * 
 * Formula:
 * - Volume Score (40% Weight)
 * - Difficulty Score (30% Weight)
 * - Contest Score (30% Weight)
 * 
 * When Contest Score is missing (null/undefined), the score is calculated using
 * Volume and Difficulty renormalized over 0.70 to avoid penalizing missing data.
 * 
 * @param input LeetCode performance statistics
 * @returns ProblemSolvingResult with overall score and individual component scores
 */
export function calculateProblemSolving(
  input: ProblemSolvingInput
): ProblemSolvingResult {
  const totalSolved = Math.max(0, input.totalSolved || 0);
  const easySolved = Math.max(0, input.easySolved || 0);
  const mediumSolved = Math.max(0, input.mediumSolved || 0);
  const hardSolved = Math.max(0, input.hardSolved || 0);

  const volumeScore = calculateVolumeScore(totalSolved);
  const difficultyScore = calculateDifficultyScore(
    totalSolved,
    easySolved,
    mediumSolved,
    hardSolved
  );
  const contestScore = calculateContestScore(input.percentileRank);

  let rawTotalScore: number;

  if (contestScore === null) {
    // Missing contest data: exclude Contest Score and renormalize over 0.70
    rawTotalScore = (volumeScore * 0.40 + difficultyScore * 0.30) / 0.70;
  } else {
    // Standard 40% / 30% / 30% weighting
    rawTotalScore =
      volumeScore * 0.40 + difficultyScore * 0.30 + contestScore * 0.30;
  }

  const score = Math.min(100, Math.max(0, Math.round(rawTotalScore)));

  return {
    score,
    volumeScore,
    difficultyScore,
    contestScore,
  };
}
