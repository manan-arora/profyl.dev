import { describe, it, expect } from "vitest";
import { calculateBuildActivity } from "../build-activity-scorer";

describe("calculateBuildActivity", () => {
  it("should handle 0 contributions and 0 active projects", () => {
    const result = calculateBuildActivity({
      totalContributionsLastYear: 0,
      activeProjects: 0,
    });

    expect(result).toEqual({
      score: 0,
      contributionScore: 0,
      activeProjectScore: 0,
    });
  });

  describe("Contribution Volume Curve and Saturation", () => {
    it("should calculate contribution scores according to diminishing returns formula", () => {
      expect(
        calculateBuildActivity({ totalContributionsLastYear: 0 })
          .contributionScore
      ).toBe(0);

      const c25 = calculateBuildActivity({ totalContributionsLastYear: 25 })
        .contributionScore;
      expect(c25).toBeCloseTo(44.54, 1);

      const c50 = calculateBuildActivity({ totalContributionsLastYear: 50 })
        .contributionScore;
      expect(c50).toBeCloseTo(53.76, 1);

      const c100 = calculateBuildActivity({ totalContributionsLastYear: 100 })
        .contributionScore;
      expect(c100).toBeCloseTo(63.1, 1);

      const c250 = calculateBuildActivity({ totalContributionsLastYear: 250 })
        .contributionScore;
      expect(c250).toBeCloseTo(75.54, 1);

      const c500 = calculateBuildActivity({ totalContributionsLastYear: 500 })
        .contributionScore;
      expect(c500).toBeCloseTo(85.0, 1);

      const c750 = calculateBuildActivity({ totalContributionsLastYear: 750 })
        .contributionScore;
      expect(c750).toBeCloseTo(90.53, 1);

      const c1000 = calculateBuildActivity({ totalContributionsLastYear: 1000 })
        .contributionScore;
      expect(c1000).toBeCloseTo(94.46, 1);

      const c1500 = calculateBuildActivity({ totalContributionsLastYear: 1500 })
        .contributionScore;
      expect(c1500).toBe(100);
    });

    it("should saturate contribution score at 100 for contributions >= 1500", () => {
      expect(
        calculateBuildActivity({ totalContributionsLastYear: 1500 })
          .contributionScore
      ).toBe(100);

      expect(
        calculateBuildActivity({ totalContributionsLastYear: 2000 })
          .contributionScore
      ).toBe(100);

      expect(
        calculateBuildActivity({ totalContributionsLastYear: 5000 })
          .contributionScore
      ).toBe(100);
    });
  });

  describe("Active Projects Curve and Saturation", () => {
    it("should calculate active project scores according to diminishing returns formula", () => {
      expect(
        calculateBuildActivity({ activeProjects: 0 }).activeProjectScore
      ).toBe(0);

      const p1 = calculateBuildActivity({ activeProjects: 1 })
        .activeProjectScore;
      expect(p1).toBeCloseTo(22.77, 1);

      const p2 = calculateBuildActivity({ activeProjects: 2 })
        .activeProjectScore;
      expect(p2).toBeCloseTo(36.09, 1);

      const p3 = calculateBuildActivity({ activeProjects: 3 })
        .activeProjectScore;
      expect(p3).toBeCloseTo(45.53, 1);

      const p5 = calculateBuildActivity({ activeProjects: 5 })
        .activeProjectScore;
      expect(p5).toBeCloseTo(58.85, 1);

      const p10 = calculateBuildActivity({ activeProjects: 10 })
        .activeProjectScore;
      expect(p10).toBeCloseTo(78.76, 1);

      const p15 = calculateBuildActivity({ activeProjects: 15 })
        .activeProjectScore;
      expect(p15).toBeCloseTo(91.07, 1);

      const p20 = calculateBuildActivity({ activeProjects: 20 })
        .activeProjectScore;
      expect(p20).toBe(100);
    });

    it("should saturate active project score at 100 for active projects >= 20", () => {
      expect(
        calculateBuildActivity({ activeProjects: 20 }).activeProjectScore
      ).toBe(100);

      expect(
        calculateBuildActivity({ activeProjects: 25 }).activeProjectScore
      ).toBe(100);

      expect(
        calculateBuildActivity({ activeProjects: 50 }).activeProjectScore
      ).toBe(100);
    });
  });

  describe("Weighting and Combined Score Calculation", () => {
    it("should apply 50/50 weighting correctly", () => {
      // 1500 contributions = 100 contribution score
      // 0 active projects = 0 active project score
      // Total = 100 * 0.5 + 0 * 0.5 = 50
      const result = calculateBuildActivity({
        totalContributionsLastYear: 1500,
        activeProjects: 0,
      });

      expect(result.contributionScore).toBe(100);
      expect(result.activeProjectScore).toBe(0);
      expect(result.score).toBe(50);
    });

    it("should compute PRD Section 13 example correctly", () => {
      // 350 contributions -> contributionScore ~79.97
      // 10 active projects -> activeProjectScore ~78.76
      // weighted: 79.972 * 0.5 + 78.761 * 0.5 = 79.366 => Math.round = 79
      const result = calculateBuildActivity({
        totalContributionsLastYear: 350,
        activeProjects: 10,
      });

      expect(result.contributionScore).toBeCloseTo(80.13, 1);
      expect(result.activeProjectScore).toBeCloseTo(78.76, 1);
      expect(result.score).toBe(79);
    });
  });

  describe("Missing Data Handling", () => {
    it("should renormalize active project score when contribution data is missing", () => {
      const result = calculateBuildActivity({
        totalContributionsLastYear: null,
        activeProjects: 10,
      });

      expect(result.contributionScore).toBeNull();
      expect(result.activeProjectScore).toBeCloseTo(78.76, 1);
      expect(result.score).toBe(79);
    });

    it("should renormalize contribution score when active projects count is missing", () => {
      const result = calculateBuildActivity({
        totalContributionsLastYear: 500,
        activeProjects: undefined,
      });

      expect(result.contributionScore).toBeCloseTo(85.0, 1);
      expect(result.activeProjectScore).toBeNull();
      expect(result.score).toBe(85);
    });

    it("should return score = 0 and null components when both inputs are missing", () => {
      const result = calculateBuildActivity({
        totalContributionsLastYear: null,
        activeProjects: undefined,
      });

      expect(result).toEqual({
        score: 0,
        contributionScore: null,
        activeProjectScore: null,
      });
    });
  });
});
