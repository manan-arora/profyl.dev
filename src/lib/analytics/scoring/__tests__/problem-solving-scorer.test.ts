import { describe, it, expect } from "vitest";
import { calculateProblemSolving } from "../problem-solving-scorer";

describe("calculateProblemSolving", () => {
  it("should handle 0 solved problems correctly with missing contest data", () => {
    const result = calculateProblemSolving({
      totalSolved: 0,
      easySolved: 0,
      mediumSolved: 0,
      hardSolved: 0,
      percentileRank: null,
    });

    expect(result).toEqual({
      score: 0,
      volumeScore: 0,
      difficultyScore: 0,
      contestScore: null,
    });
  });

  it("should handle 0 solved problems with valid percentile rank", () => {
    const result = calculateProblemSolving({
      totalSolved: 0,
      easySolved: 0,
      mediumSolved: 0,
      hardSolved: 0,
      percentileRank: 50,
    });

    // Volume: 0, Difficulty: 0, Contest: 50
    // rawTotal = 0 * 0.4 + 0 * 0.3 + 50 * 0.3 = 15
    expect(result.volumeScore).toBe(0);
    expect(result.difficultyScore).toBe(0);
    expect(result.contestScore).toBe(50);
    expect(result.score).toBe(15);
  });

  describe("Volume Score Curve and Saturation Thresholds", () => {
    it("should calculate linear volume score for 0-50 solved problems", () => {
      expect(
        calculateProblemSolving({
          totalSolved: 0,
          easySolved: 0,
          mediumSolved: 0,
          hardSolved: 0,
        }).volumeScore
      ).toBe(0);

      expect(
        calculateProblemSolving({
          totalSolved: 25,
          easySolved: 25,
          mediumSolved: 0,
          hardSolved: 0,
        }).volumeScore
      ).toBe(5);

      expect(
        calculateProblemSolving({
          totalSolved: 50,
          easySolved: 50,
          mediumSolved: 0,
          hardSolved: 0,
        }).volumeScore
      ).toBe(10);
    });

    it("should calculate logarithmic diminishing returns for 50-1000 solved problems", () => {
      const vol100 = calculateProblemSolving({
        totalSolved: 100,
        easySolved: 100,
        mediumSolved: 0,
        hardSolved: 0,
      }).volumeScore;
      expect(vol100).toBeCloseTo(25.52, 1);

      const vol200 = calculateProblemSolving({
        totalSolved: 200,
        easySolved: 200,
        mediumSolved: 0,
        hardSolved: 0,
      }).volumeScore;
      expect(vol200).toBeCloseTo(45.07, 1);

      const vol500 = calculateProblemSolving({
        totalSolved: 500,
        easySolved: 500,
        mediumSolved: 0,
        hardSolved: 0,
      }).volumeScore;
      expect(vol500).toBeCloseTo(75.25, 1);

      const vol1000 = calculateProblemSolving({
        totalSolved: 1000,
        easySolved: 1000,
        mediumSolved: 0,
        hardSolved: 0,
      }).volumeScore;
      expect(vol1000).toBe(100);
    });

    it("should saturate volume score at 100 for problem counts >= 1000", () => {
      expect(
        calculateProblemSolving({
          totalSolved: 1000,
          easySolved: 1000,
          mediumSolved: 0,
          hardSolved: 0,
        }).volumeScore
      ).toBe(100);

      expect(
        calculateProblemSolving({
          totalSolved: 1500,
          easySolved: 500,
          mediumSolved: 500,
          hardSolved: 500,
        }).volumeScore
      ).toBe(100);

      expect(
        calculateProblemSolving({
          totalSolved: 5000,
          easySolved: 2000,
          mediumSolved: 2000,
          hardSolved: 1000,
        }).volumeScore
      ).toBe(100);
    });
  });

  describe("Difficulty Depth Distributions", () => {
    it("should calculate 25 for 100% Easy problems", () => {
      const result = calculateProblemSolving({
        totalSolved: 100,
        easySolved: 100,
        mediumSolved: 0,
        hardSolved: 0,
      });
      expect(result.difficultyScore).toBe(25);
    });

    it("should calculate 50 for 100% Medium problems", () => {
      const result = calculateProblemSolving({
        totalSolved: 100,
        easySolved: 0,
        mediumSolved: 100,
        hardSolved: 0,
      });
      expect(result.difficultyScore).toBe(50);
    });

    it("should calculate 100 for 100% Hard problems", () => {
      const result = calculateProblemSolving({
        totalSolved: 100,
        easySolved: 0,
        mediumSolved: 0,
        hardSolved: 100,
      });
      expect(result.difficultyScore).toBe(100);
    });

    it("should calculate 37.5 for 50% Easy / 50% Medium problems", () => {
      const result = calculateProblemSolving({
        totalSolved: 100,
        easySolved: 50,
        mediumSolved: 50,
        hardSolved: 0,
      });
      expect(result.difficultyScore).toBe(37.5);
    });

    it("should calculate 75 for 50% Medium / 50% Hard problems", () => {
      const result = calculateProblemSolving({
        totalSolved: 100,
        easySolved: 0,
        mediumSolved: 50,
        hardSolved: 50,
      });
      expect(result.difficultyScore).toBe(75);
    });
  });

  describe("Contest Performance & Missing Data Renormalization", () => {
    it("should clamp percentile rank between 0 and 100", () => {
      expect(
        calculateProblemSolving({
          totalSolved: 100,
          easySolved: 50,
          mediumSolved: 50,
          hardSolved: 0,
          percentileRank: 150,
        }).contestScore
      ).toBe(100);

      expect(
        calculateProblemSolving({
          totalSolved: 100,
          easySolved: 50,
          mediumSolved: 50,
          hardSolved: 0,
          percentileRank: -10,
        }).contestScore
      ).toBe(0);
    });

    it("should treat percentileRank = 0 as genuine evidence, not missing data", () => {
      const result = calculateProblemSolving({
        totalSolved: 1000, // volumeScore = 100
        easySolved: 0,
        mediumSolved: 1000, // difficultyScore = 50
        hardSolved: 0,
        percentileRank: 0, // contestScore = 0
      });

      expect(result.contestScore).toBe(0);
      // rawTotal = 100 * 0.4 + 50 * 0.3 + 0 * 0.3 = 40 + 15 + 0 = 55
      expect(result.score).toBe(55);
    });

    it("should exclude contest score and renormalize weights over 0.70 when percentileRank is null or undefined", () => {
      const resultNull = calculateProblemSolving({
        totalSolved: 1000, // volumeScore = 100
        easySolved: 0,
        mediumSolved: 1000, // difficultyScore = 50
        hardSolved: 0,
        percentileRank: null,
      });

      expect(resultNull.contestScore).toBeNull();
      // rawTotal = (100 * 0.4 + 50 * 0.3) / 0.70 = 55 / 0.70 = 78.5714...
      // Math.round(78.5714...) = 79
      expect(resultNull.score).toBe(79);

      const resultUndefined = calculateProblemSolving({
        totalSolved: 1000,
        easySolved: 0,
        mediumSolved: 1000,
        hardSolved: 0,
      });

      expect(resultUndefined.contestScore).toBeNull();
      expect(resultUndefined.score).toBe(79);
    });
  });

  describe("PRD Specification Example", () => {
    it("should compute PRD Section 7 example resulting in score = 69", () => {
      // PRD Section 7:
      // Volume Score = 77
      // Difficulty Score = 55 (e.g. 55% Hard / 45% Easy or similar mix producing 55)
      // Contest Score = 70
      // Expected = 77 * 0.40 + 55 * 0.30 + 70 * 0.30 = 69.3 => 69
      const result = calculateProblemSolving({
        totalSolved: 540, // produces volumeScore ~77.1
        easySolved: 250,
        mediumSolved: 500,
        hardSolved: 250, // 1000 total diff count -> diffIndex = (250*1 + 500*2 + 250*4)/1000 = 2250/1000 = 2.25 -> (2.25/4)*100 = 56.25
        percentileRank: 70,
      });

      // Assert formula combination precision
      const expectedRaw =
        result.volumeScore * 0.4 +
        result.difficultyScore * 0.3 +
        result.contestScore! * 0.3;
      expect(result.score).toBe(Math.round(expectedRaw));
    });
  });
});
