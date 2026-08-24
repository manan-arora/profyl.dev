import { describe, it, expect } from "vitest";
import { calculateOpenSource } from "../open-source-scorer";

describe("Open Source Scorer", () => {
  it("should return zero score and zero components for zero activity", () => {
    const result = calculateOpenSource({
      ossPrsMerged: 0,
      starsEarned: 0,
      forksEarned: 0,
    });

    expect(result).toEqual({
      score: 0,
      contributionScore: 0,
      starsScore: 0,
      forksScore: 0,
      impactScore: 0,
    });
  });

  describe("External Contribution Score Curve and Saturation (60% Weight)", () => {
    it("should calculate contribution score using diminishing returns up to 50 PRs", () => {
      expect(calculateOpenSource({ ossPrsMerged: 0 }).contributionScore).toBe(0);

      const pr1 = calculateOpenSource({ ossPrsMerged: 1 }).contributionScore;
      expect(pr1).toBeCloseTo(17.63, 1);

      const pr5 = calculateOpenSource({ ossPrsMerged: 5 }).contributionScore;
      expect(pr5).toBeCloseTo(45.57, 1);

      const pr10 = calculateOpenSource({ ossPrsMerged: 10 }).contributionScore;
      expect(pr10).toBeCloseTo(60.98, 1);

      const pr20 = calculateOpenSource({ ossPrsMerged: 20 }).contributionScore;
      expect(pr20).toBeCloseTo(77.43, 1);

      const pr30 = calculateOpenSource({ ossPrsMerged: 30 }).contributionScore;
      expect(pr30).toBeCloseTo(87.34, 1);

      const pr40 = calculateOpenSource({ ossPrsMerged: 40 }).contributionScore;
      expect(pr40).toBeCloseTo(94.44, 1);

      const pr50 = calculateOpenSource({ ossPrsMerged: 50 }).contributionScore;
      expect(pr50).toBe(100);
    });

    it("should saturate contribution score at 100 for merged PRs >= 50", () => {
      expect(calculateOpenSource({ ossPrsMerged: 50 }).contributionScore).toBe(100);
      expect(calculateOpenSource({ ossPrsMerged: 100 }).contributionScore).toBe(100);
      expect(calculateOpenSource({ ossPrsMerged: 500 }).contributionScore).toBe(100);
    });
  });

  describe("Stars Score Curve and Saturation (70% Impact Weight)", () => {
    it("should calculate stars score using diminishing returns up to 100 stars", () => {
      expect(calculateOpenSource({ starsEarned: 0 }).starsScore).toBe(0);

      const s1 = calculateOpenSource({ starsEarned: 1 }).starsScore;
      expect(s1).toBeCloseTo(15.02, 1);

      const s5 = calculateOpenSource({ starsEarned: 5 }).starsScore;
      expect(s5).toBeCloseTo(38.83, 1);

      const s10 = calculateOpenSource({ starsEarned: 10 }).starsScore;
      expect(s10).toBeCloseTo(51.96, 1);

      const s25 = calculateOpenSource({ starsEarned: 25 }).starsScore;
      expect(s25).toBeCloseTo(70.6, 1);

      const s50 = calculateOpenSource({ starsEarned: 50 }).starsScore;
      expect(s50).toBeCloseTo(85.2, 1);

      const s100 = calculateOpenSource({ starsEarned: 100 }).starsScore;
      expect(s100).toBe(100);
    });

    it("should saturate stars score at 100 for stars >= 100", () => {
      expect(calculateOpenSource({ starsEarned: 100 }).starsScore).toBe(100);
      expect(calculateOpenSource({ starsEarned: 250 }).starsScore).toBe(100);
    });
  });

  describe("Forks Score Curve and Saturation (30% Impact Weight)", () => {
    it("should calculate forks score using diminishing returns up to 20 forks", () => {
      expect(calculateOpenSource({ forksEarned: 0 }).forksScore).toBe(0);

      const f1 = calculateOpenSource({ forksEarned: 1 }).forksScore;
      expect(f1).toBeCloseTo(22.77, 1);

      const f2 = calculateOpenSource({ forksEarned: 2 }).forksScore;
      expect(f2).toBeCloseTo(36.09, 1);

      const f5 = calculateOpenSource({ forksEarned: 5 }).forksScore;
      expect(f5).toBeCloseTo(58.85, 1);

      const f10 = calculateOpenSource({ forksEarned: 10 }).forksScore;
      expect(f10).toBeCloseTo(78.76, 1);

      const f20 = calculateOpenSource({ forksEarned: 20 }).forksScore;
      expect(f20).toBe(100);
    });

    it("should saturate forks score at 100 for forks >= 20", () => {
      expect(calculateOpenSource({ forksEarned: 20 }).forksScore).toBe(100);
      expect(calculateOpenSource({ forksEarned: 50 }).forksScore).toBe(100);
    });
  });

  describe("Impact Weighting (70% Stars / 30% Forks) and Final 60/40 Combination", () => {
    it("should apply 70/30 weighting to stars and forks for impact score", () => {
      // 100 stars (100) + 0 forks (0) -> impact = 70
      const starsOnly = calculateOpenSource({ starsEarned: 100, forksEarned: 0 });
      expect(starsOnly.impactScore).toBe(70);

      // 0 stars (0) + 20 forks (100) -> impact = 30
      const forksOnly = calculateOpenSource({ starsEarned: 0, forksEarned: 20 });
      expect(forksOnly.impactScore).toBe(30);

      // 100 stars (100) + 20 forks (100) -> impact = 100
      const bothFull = calculateOpenSource({ starsEarned: 100, forksEarned: 20 });
      expect(bothFull.impactScore).toBe(100);
    });

    it("should apply 60/40 weighting between Contribution and Impact scores", () => {
      // 50 PRs (100 contribution) + 0 impact -> 100 * 0.60 = 60
      const prOnly = calculateOpenSource({ ossPrsMerged: 50 });
      expect(prOnly.score).toBe(60);

      // 0 PRs + 100 stars + 20 forks (100 impact) -> 100 * 0.40 = 40
      const impactOnly = calculateOpenSource({ starsEarned: 100, forksEarned: 20 });
      expect(impactOnly.score).toBe(40);
    });

    it("should compute PRD Section 11 example correctly resulting in Open Source = 73", () => {
      // PRD Section 11:
      // Merged PRs = 20 (contributionScore ~77.43)
      // Stars = 25 (starsScore ~70.60)
      // Forks = 5 (forksScore ~58.85)
      // Impact Score = 70.60 * 0.70 + 58.85 * 0.30 = 67.07
      // Final Open Source = 77.43 * 0.60 + 67.07 * 0.40 = 73.29 => 73
      const result = calculateOpenSource({
        ossPrsMerged: 20,
        starsEarned: 25,
        forksEarned: 5,
      });

      expect(result.contributionScore).toBeCloseTo(77.43, 1);
      expect(result.starsScore).toBeCloseTo(70.6, 1);
      expect(result.forksScore).toBeCloseTo(58.85, 1);
      expect(result.impactScore).toBeCloseTo(67.07, 1);
      expect(result.score).toBe(73);
    });
  });

  describe("Defensive Input Handling", () => {
    it("should handle undefined, null, negative numbers, or NaN defensively without throwing", () => {
      const result = calculateOpenSource({
        ossPrsMerged: null,
        starsEarned: undefined,
        forksEarned: -5,
      });

      expect(result).toEqual({
        score: 0,
        contributionScore: 0,
        starsScore: 0,
        forksScore: 0,
        impactScore: 0,
      });

      const nanResult = calculateOpenSource({
        ossPrsMerged: NaN,
        starsEarned: NaN,
        forksEarned: NaN,
      });

      expect(nanResult).toEqual({
        score: 0,
        contributionScore: 0,
        starsScore: 0,
        forksScore: 0,
        impactScore: 0,
      });
    });
  });
});
