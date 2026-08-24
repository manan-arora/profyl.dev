import { describe, it, expect } from "vitest";
import { calculateConsistency } from "../consistency-scorer";

describe("Consistency Scorer", () => {
  it("should return zero score and null components when both inputs are missing or null", () => {
    const result = calculateConsistency({
      github: null,
      leetcode: null,
    });

    expect(result).toEqual({
      score: 0,
      githubConsistency: null,
      leetcodeConsistency: null,
      githubActiveWeekScore: null,
      githubGapScore: null,
      leetcodeActiveDayScore: null,
      leetcodeGapScore: null,
    });
  });

  describe("GitHub Consistency Component (Weekly, 60/40)", () => {
    it("should return 100 for all-active GitHub calendar", () => {
      const result = calculateConsistency({
        github: {
          totalPeriods: 53,
          activePeriods: 53,
          longestInactiveGap: 0,
        },
      });

      expect(result.githubActiveWeekScore).toBe(100);
      expect(result.githubGapScore).toBe(100);
      expect(result.githubConsistency).toBe(100);
      expect(result.score).toBe(100);
    });

    it("should return 0 for all-inactive GitHub calendar", () => {
      const result = calculateConsistency({
        github: {
          totalPeriods: 53,
          activePeriods: 0,
          longestInactiveGap: 53,
        },
      });

      expect(result.githubActiveWeekScore).toBe(0);
      expect(result.githubGapScore).toBe(0);
      expect(result.githubConsistency).toBe(0);
      expect(result.score).toBe(0);
    });

    it("should correctly apply 60% active week coverage + 40% gap score weighting without assuming 52 weeks", () => {
      // 53 weekly buckets (e.g. partial boundary week)
      // activePeriods: 40, totalPeriods: 53, longestInactiveGap: 4
      const result = calculateConsistency({
        github: {
          totalPeriods: 53,
          activePeriods: 40,
          longestInactiveGap: 4,
        },
      });

      // Active Week Score = (40 / 53) * 100 = 75.47169...
      expect(result.githubActiveWeekScore).toBeCloseTo(75.47, 1);
      // Gap Score = 100 * (1 - 4 / 53) = 92.4528...
      expect(result.githubGapScore).toBeCloseTo(92.45, 1);
      // GitHub Consistency = 75.47169 * 0.60 + 92.45283 * 0.40 = 82.264...
      expect(result.githubConsistency).toBeCloseTo(82.26, 1);
    });
  });

  describe("LeetCode Consistency Component (Daily, 60/40)", () => {
    it("should return 100 for all-active LeetCode calendar", () => {
      const result = calculateConsistency({
        leetcode: {
          totalPeriods: 366,
          activePeriods: 366,
          longestInactiveGap: 0,
        },
      });

      expect(result.leetcodeActiveDayScore).toBe(100);
      expect(result.leetcodeGapScore).toBe(100);
      expect(result.leetcodeConsistency).toBe(100);
      expect(result.score).toBe(100);
    });

    it("should return 0 for all-inactive LeetCode calendar", () => {
      const result = calculateConsistency({
        leetcode: {
          totalPeriods: 366,
          activePeriods: 0,
          longestInactiveGap: 366,
        },
      });

      expect(result.leetcodeActiveDayScore).toBe(0);
      expect(result.leetcodeGapScore).toBe(0);
      expect(result.leetcodeConsistency).toBe(0);
      expect(result.score).toBe(0);
    });

    it("should correctly apply 60% active day coverage + 40% gap score weighting on daily metrics", () => {
      // activePeriods: 180, totalPeriods: 366, longestInactiveGap: 30
      const result = calculateConsistency({
        leetcode: {
          totalPeriods: 366,
          activePeriods: 180,
          longestInactiveGap: 30,
        },
      });

      // Active Day Score = (180 / 366) * 100 = 49.1803...
      expect(result.leetcodeActiveDayScore).toBeCloseTo(49.18, 1);
      // Gap Score = 100 * (1 - 30 / 366) = 91.8032...
      expect(result.leetcodeGapScore).toBeCloseTo(91.8, 1);
      // LeetCode Consistency = 49.1803 * 0.60 + 91.8032 * 0.40 = 66.2295...
      expect(result.leetcodeConsistency).toBeCloseTo(66.23, 1);
    });
  });

  describe("50/50 Platform Weighting and End-to-End PRD Example", () => {
    it("should compute PRD Sections 11–13 example resulting in Consistency = 74", () => {
      // PRD Example:
      // GitHub: 40/53 active weeks, 4-week max gap -> GitHub Consistency ~82.26
      // LeetCode: 180/366 active days, 30-day max gap -> LeetCode Consistency ~66.23
      // Overall Consistency = 82.26 * 0.50 + 66.23 * 0.50 = 74.245 => 74
      const result = calculateConsistency({
        github: {
          totalPeriods: 53,
          activePeriods: 40,
          longestInactiveGap: 4,
        },
        leetcode: {
          totalPeriods: 366,
          activePeriods: 180,
          longestInactiveGap: 30,
        },
      });

      expect(result.githubConsistency).toBeCloseTo(82.26, 1);
      expect(result.leetcodeConsistency).toBeCloseTo(66.23, 1);
      expect(result.score).toBe(74);
    });

    it("should renormalize score when GitHub metrics are missing", () => {
      const result = calculateConsistency({
        github: null,
        leetcode: {
          totalPeriods: 366,
          activePeriods: 180,
          longestInactiveGap: 30,
        },
      });

      expect(result.githubConsistency).toBeNull();
      expect(result.leetcodeConsistency).toBeCloseTo(66.23, 1);
      expect(result.score).toBe(66);
    });

    it("should renormalize score when LeetCode metrics are missing", () => {
      const result = calculateConsistency({
        github: {
          totalPeriods: 53,
          activePeriods: 40,
          longestInactiveGap: 4,
        },
        leetcode: null,
      });

      expect(result.githubConsistency).toBeCloseTo(82.26, 1);
      expect(result.leetcodeConsistency).toBeNull();
      expect(result.score).toBe(82);
    });
  });

  describe("Edge Cases and Division Safety", () => {
    it("should handle totalPeriods = 0 safely without producing NaN or Infinity", () => {
      const result = calculateConsistency({
        github: {
          totalPeriods: 0,
          activePeriods: 0,
          longestInactiveGap: 0,
        },
        leetcode: {
          totalPeriods: 0,
          activePeriods: 0,
          longestInactiveGap: 0,
        },
      });

      expect(result.githubActiveWeekScore).toBe(0);
      expect(result.githubGapScore).toBe(0);
      expect(result.githubConsistency).toBe(0);

      expect(result.leetcodeActiveDayScore).toBe(0);
      expect(result.leetcodeGapScore).toBe(0);
      expect(result.leetcodeConsistency).toBe(0);

      expect(result.score).toBe(0);
      expect(Number.isNaN(result.score)).toBe(false);
    });
  });
});
