import { describe, it, expect } from "vitest";
import {
  calculateProfylScore,
  getProfylTier,
  Tier,
} from "../profyl-scorer";

describe("Profyl Scorer Layer", () => {
  describe("getProfylTier", () => {
    it("should correctly map Profyl Score to tier boundaries", () => {
      expect(getProfylTier(1000)).toBe(Tier.EXCEPTIONAL);
      expect(getProfylTier(850)).toBe(Tier.EXCEPTIONAL);

      expect(getProfylTier(849)).toBe(Tier.STRONG);
      expect(getProfylTier(700)).toBe(Tier.STRONG);

      expect(getProfylTier(699)).toBe(Tier.SOLID);
      expect(getProfylTier(550)).toBe(Tier.SOLID);

      expect(getProfylTier(549)).toBe(Tier.GROWING);
      expect(getProfylTier(0)).toBe(Tier.GROWING);
    });
  });

  describe("calculateProfylScore", () => {
    it("should calculate score = 0 and tier = GROWING when all radar inputs are 0", () => {
      const result = calculateProfylScore({
        buildActivity: 0,
        technicalRange: 0,
        problemSolving: 0,
        consistency: 0,
        openSource: 0,
      });

      expect(result.profylScore).toBe(0);
      expect(result.tier).toBe(Tier.GROWING);
      expect(result.signalBreakdown).toEqual({
        github: 0,
        projects: 0,
        leetcode: 0,
        consistency: 0,
      });
      expect(result.githubScore).toBe(0);
      expect(result.projectsScore).toBe(0);
      expect(result.leetcodeScore).toBe(0);
      expect(result.consistencyScore).toBe(0);
    });

    it("should calculate score = 1000 and tier = EXCEPTIONAL when all radar inputs are 100", () => {
      const result = calculateProfylScore({
        buildActivity: 100,
        technicalRange: 100,
        problemSolving: 100,
        consistency: 100,
        openSource: 100,
      });

      expect(result.profylScore).toBe(1000);
      expect(result.tier).toBe(Tier.EXCEPTIONAL);
      expect(result.signalBreakdown).toEqual({
        github: 100,
        projects: 100,
        leetcode: 100,
        consistency: 100,
      });
    });

    it("should accurately compute PRD Section 3 example resulting in Profyl Score = 733 and Tier = STRONG", () => {
      // PRD Section 3 Example:
      // Build Activity = 70, Open Source = 78 -> GitHub = 70 * 0.75 + 78 * 0.25 = 72
      // Technical Range = 81 -> Projects = 81
      // Problem Solving = 64 -> LeetCode = 64
      // Consistency = 76 -> Consistency = 76
      // Signal Average = (72 + 81 + 64 + 76) / 4 = 73.25
      // Profyl Score = Math.round(73.25 * 10) = 733 -> Tier = STRONG
      const result = calculateProfylScore({
        buildActivity: 70,
        openSource: 78,
        technicalRange: 81,
        problemSolving: 64,
        consistency: 76,
      });

      expect(result.signalBreakdown.github).toBe(72);
      expect(result.signalBreakdown.projects).toBe(81);
      expect(result.signalBreakdown.leetcode).toBe(64);
      expect(result.signalBreakdown.consistency).toBe(76);

      expect(result.githubScore).toBe(72);
      expect(result.projectsScore).toBe(81);
      expect(result.leetcodeScore).toBe(64);
      expect(result.consistencyScore).toBe(76);

      expect(result.profylScore).toBe(733);
      expect(result.tier).toBe(Tier.STRONG);
    });

    it("should keep Signal Breakdown values unrounded and round only at the end", () => {
      // Build Activity = 71, Open Source = 77 -> GitHub = 71 * 0.75 + 77 * 0.25 = 53.25 + 19.25 = 72.5
      // Technical Range = 80.3 -> Projects = 80.3
      // Problem Solving = 64.1 -> LeetCode = 64.1
      // Consistency = 75.7 -> Consistency = 75.7
      // Signal Average = (72.5 + 80.3 + 64.1 + 75.7) / 4 = 292.6 / 4 = 73.15
      // Profyl Score = Math.round(731.5) = 732
      const result = calculateProfylScore({
        buildActivity: 71,
        openSource: 77,
        technicalRange: 80.3,
        problemSolving: 64.1,
        consistency: 75.7,
      });

      expect(result.signalBreakdown.github).toBe(72.5);
      expect(result.signalBreakdown.projects).toBe(80.3);
      expect(result.signalBreakdown.leetcode).toBe(64.1);
      expect(result.signalBreakdown.consistency).toBe(75.7);

      expect(result.profylScore).toBe(732);
      expect(result.tier).toBe(Tier.STRONG);
    });

    it("should defensively handle null, undefined, negative numbers, or NaN inputs", () => {
      const result = calculateProfylScore({
        buildActivity: null as unknown as number,
        technicalRange: undefined as unknown as number,
        problemSolving: -10,
        consistency: NaN,
        openSource: 120, // Clamped to 100
      });

      // GitHub = 0 * 0.75 + 100 * 0.25 = 25
      // Projects = 0, LeetCode = 0, Consistency = 0
      // Signal Average = 25 / 4 = 6.25
      // Profyl Score = Math.round(62.5) = 63 -> Tier = GROWING
      expect(result.signalBreakdown.github).toBe(25);
      expect(result.profylScore).toBe(63);
      expect(result.tier).toBe(Tier.GROWING);
    });

    it("should return null for projectsScore, profylScore, and tier when technicalRange is null", () => {
      const result = calculateProfylScore({
        buildActivity: 80,
        technicalRange: null,
        problemSolving: 70,
        consistency: 90,
        openSource: 60,
      });

      // Other radar and signal breakdown values remain correctly calculated
      expect(result.githubScore).toBe(80 * 0.75 + 60 * 0.25); // 75
      expect(result.leetcodeScore).toBe(70);
      expect(result.consistencyScore).toBe(90);

      expect(result.radar.buildActivity).toBe(80);
      expect(result.radar.problemSolving).toBe(70);
      expect(result.radar.consistency).toBe(90);
      expect(result.radar.openSource).toBe(60);

      expect(result.signalBreakdown.github).toBe(75);
      expect(result.signalBreakdown.leetcode).toBe(70);
      expect(result.signalBreakdown.consistency).toBe(90);

      // Null fields
      expect(result.projectsScore).toBeNull();
      expect(result.profylScore).toBeNull();
      expect(result.tier).toBeNull();
      expect(result.radar.technicalRange).toBeNull();
      expect(result.signalBreakdown.projects).toBeNull();
    });
  });
});
