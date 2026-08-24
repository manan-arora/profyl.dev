import { Tier } from "@/generated/prisma/client";

export { Tier };

export interface ProfylScoreInput {
  buildActivity: number;
  technicalRange: number | null;
  problemSolving: number;
  consistency: number;
  openSource: number;
}

export interface ProfylScoreResult {
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
}

/**
 * Derives the locked V1 user-facing Tier off the final rounded 0-1000 Profyl Score.
 *
 * Tier Bands:
 * - Exceptional: 850+
 * - Strong:      700-849
 * - Solid:       550-699
 * - Growing:     <550
 *
 * @param score Final rounded 0-1000 Profyl Score
 * @returns User-facing Tier enum
 */
export function getProfylTier(score: number): Tier {
  const s = Math.max(0, score || 0);
  if (s >= 850) {
    return Tier.EXCEPTIONAL;
  }
  if (s >= 700) {
    return Tier.STRONG;
  }
  if (s >= 550) {
    return Tier.SOLID;
  }
  return Tier.GROWING;
}

/**
 * Final aggregation scorer for the Profyl Score and Signal Breakdown.
 *
 * Flow:
 * 1. Takes the 5 normalized radar scores (0-100).
 * 2. Computes the 4 Signal Breakdown values (0-100):
 *    - GitHub = Build Activity * 0.75 + Open Source * 0.25
 *    - Projects = Technical Range
 *    - LeetCode = Problem Solving
 *    - Consistency = Consistency
 * 3. Computes the arithmetic average of the 4 Signal Breakdown values (0-100).
 * 4. Multiplies by 10 and rounds to integer at the end (0-1000).
 * 5. Derives the user-facing Tier from the final Profyl Score.
 *
 * @param input The five Engineering Radar dimension scores (0-100)
 * @returns ProfylScoreResult containing final Profyl score, tier, radar breakdown, and signal breakdown
 */
export function calculateProfylScore(
  input: ProfylScoreInput
): ProfylScoreResult {
  const buildActivity = Math.min(100, Math.max(0, input.buildActivity || 0));
  const problemSolving = Math.min(100, Math.max(0, input.problemSolving || 0));
  const consistency = Math.min(100, Math.max(0, input.consistency || 0));
  const openSource = Math.min(100, Math.max(0, input.openSource || 0));

  const github = buildActivity * 0.75 + openSource * 0.25;
  const leetcode = problemSolving;
  const consistencySignal = consistency;

  const isTechnicalRangeNull = input.technicalRange === null;
  const technicalRange = isTechnicalRangeNull
    ? null
    : Math.min(100, Math.max(0, input.technicalRange || 0));

  const projects = technicalRange;
  const profylScore = isTechnicalRangeNull
    ? null
    : Math.min(1000, Math.max(0, Math.round(((github + projects! + leetcode + consistencySignal) / 4) * 10)));
  const tier = profylScore === null ? null : getProfylTier(profylScore);

  return {
    profylScore,
    tier,

    githubScore: github,
    projectsScore: projects,
    leetcodeScore: leetcode,
    consistencyScore: consistencySignal,

    radar: {
      buildActivity,
      technicalRange,
      problemSolving,
      consistency,
      openSource,
    },

    signalBreakdown: {
      github,
      projects,
      leetcode,
      consistency: consistencySignal,
    },
  };
}
