import { describe, it, expect } from "vitest";
import {
  analyzeGithubCalendar,
  analyzeLeetcodeCalendar,
} from "../calendar-analysis";
import { NormalizedContributionCalendar } from "@/types/github";
import { NormalizedSubmissionCalendar } from "@/lib/leetcode/normalizers";

describe("Calendar Analysis Layer", () => {
  describe("analyzeGithubCalendar", () => {
    it("should return zero metrics for null, undefined, or empty calendar", () => {
      expect(analyzeGithubCalendar(null)).toEqual({
        totalPeriods: 0,
        activePeriods: 0,
        longestInactiveGap: 0,
      });

      expect(analyzeGithubCalendar(undefined)).toEqual({
        totalPeriods: 0,
        activePeriods: 0,
        longestInactiveGap: 0,
      });

      expect(analyzeGithubCalendar({ weeks: [] })).toEqual({
        totalPeriods: 0,
        activePeriods: 0,
        longestInactiveGap: 0,
      });
    });

    it("should accurately count total periods and active weeks across 53 weekly buckets", () => {
      const mockCalendar: NormalizedContributionCalendar = {
        weeks: Array.from({ length: 53 }, (_, weekIdx) => ({
          firstDay: `2025-01-${String(weekIdx + 1).padStart(2, "0")}`,
          days: Array.from({ length: 7 }, (_, dayIdx) => ({
            date: `2025-01-${String(weekIdx * 7 + dayIdx + 1).padStart(2, "0")}`,
            count: weekIdx % 2 === 0 ? 1 : 0, // Every even week is active
            level: "FIRST_DAY",
            weekday: dayIdx,
          })),
        })),
      };

      const result = analyzeGithubCalendar(mockCalendar);
      expect(result.totalPeriods).toBe(53);
      expect(result.activePeriods).toBe(27); // 0, 2, 4 ... 52 = 27 active weeks
      expect(result.longestInactiveGap).toBe(1); // Single inactive week between active weeks
    });

    it("should calculate longest inactive week gap correctly", () => {
      // 10 weeks: active, active, inactive, inactive, inactive, active, inactive, inactive, inactive, inactive
      const mockCalendar: NormalizedContributionCalendar = {
        weeks: [
          { firstDay: "w1", days: [{ date: "d1", count: 2, level: "L1", weekday: 0 }] },
          { firstDay: "w2", days: [{ date: "d2", count: 1, level: "L1", weekday: 0 }] },
          { firstDay: "w3", days: [{ date: "d3", count: 0, level: "L0", weekday: 0 }] },
          { firstDay: "w4", days: [{ date: "d4", count: 0, level: "L0", weekday: 0 }] },
          { firstDay: "w5", days: [{ date: "d5", count: 0, level: "L0", weekday: 0 }] },
          { firstDay: "w6", days: [{ date: "d6", count: 5, level: "L2", weekday: 0 }] },
          { firstDay: "w7", days: [{ date: "d7", count: 0, level: "L0", weekday: 0 }] },
          { firstDay: "w8", days: [{ date: "d8", count: 0, level: "L0", weekday: 0 }] },
          { firstDay: "w9", days: [{ date: "d9", count: 0, level: "L0", weekday: 0 }] },
          { firstDay: "w10", days: [{ date: "d10", count: 0, level: "L0", weekday: 0 }] },
        ],
      };

      const result = analyzeGithubCalendar(mockCalendar);
      expect(result.totalPeriods).toBe(10);
      expect(result.activePeriods).toBe(3);
      expect(result.longestInactiveGap).toBe(4); // w7, w8, w9, w10 = 4 consecutive inactive weeks
    });

    it("should handle all-active and all-inactive GitHub calendars", () => {
      const allActive: NormalizedContributionCalendar = {
        weeks: Array.from({ length: 52 }, (_, idx) => ({
          firstDay: `w${idx}`,
          days: [{ date: `d${idx}`, count: 1, level: "L1", weekday: 0 }],
        })),
      };

      const activeResult = analyzeGithubCalendar(allActive);
      expect(activeResult.totalPeriods).toBe(52);
      expect(activeResult.activePeriods).toBe(52);
      expect(activeResult.longestInactiveGap).toBe(0);

      const allInactive: NormalizedContributionCalendar = {
        weeks: Array.from({ length: 52 }, (_, idx) => ({
          firstDay: `w${idx}`,
          days: [{ date: `d${idx}`, count: 0, level: "L0", weekday: 0 }],
        })),
      };

      const inactiveResult = analyzeGithubCalendar(allInactive);
      expect(inactiveResult.totalPeriods).toBe(52);
      expect(inactiveResult.activePeriods).toBe(0);
      expect(inactiveResult.longestInactiveGap).toBe(52);
    });

    it("should detect activity on first and last boundary weeks correctly", () => {
      const mockCalendar: NormalizedContributionCalendar = {
        weeks: [
          { firstDay: "w1", days: [{ date: "d1", count: 3, level: "L1", weekday: 0 }] },
          { firstDay: "w2", days: [{ date: "d2", count: 0, level: "L0", weekday: 0 }] },
          { firstDay: "w3", days: [{ date: "d3", count: 0, level: "L0", weekday: 0 }] },
          { firstDay: "w4", days: [{ date: "d4", count: 4, level: "L1", weekday: 0 }] },
        ],
      };

      const result = analyzeGithubCalendar(mockCalendar);
      expect(result.totalPeriods).toBe(4);
      expect(result.activePeriods).toBe(2);
      expect(result.longestInactiveGap).toBe(2);
    });
  });

  describe("analyzeLeetcodeCalendar", () => {
    it("should return zero metrics for null, undefined, or empty LeetCode calendar", () => {
      expect(analyzeLeetcodeCalendar(null)).toEqual({
        totalPeriods: 0,
        activePeriods: 0,
        longestInactiveGap: 0,
      });

      expect(analyzeLeetcodeCalendar(undefined)).toEqual({
        totalPeriods: 0,
        activePeriods: 0,
        longestInactiveGap: 0,
      });

      expect(
        analyzeLeetcodeCalendar({
          startDate: "2025-08-24",
          endDate: "2026-08-24",
          days: [],
        })
      ).toEqual({
        totalPeriods: 0,
        activePeriods: 0,
        longestInactiveGap: 0,
      });
    });

    it("should strictly evaluate active day based on count > 0, independent of level property", () => {
      const mockCalendar: NormalizedSubmissionCalendar = {
        startDate: "2026-01-01",
        endDate: "2026-01-03",
        days: [
          { date: "2026-01-01", weekday: 4, count: 5, level: 0 }, // count > 0, but level artificially set to 0 -> MUST BE ACTIVE
          { date: "2026-01-02", weekday: 5, count: 0, level: 4 }, // count = 0, but level artificially set to 4 -> MUST BE INACTIVE
          { date: "2026-01-03", weekday: 6, count: 2, level: 1 }, // count > 0 -> ACTIVE
        ],
      };

      const result = analyzeLeetcodeCalendar(mockCalendar);
      expect(result.totalPeriods).toBe(3);
      expect(result.activePeriods).toBe(2); // days 1 and 3 are active
      expect(result.longestInactiveGap).toBe(1); // day 2 is inactive
    });

    it("should calculate longest inactive day gap across 366 days", () => {
      const days = Array.from({ length: 366 }, (_, idx) => {
        // Gap of 30 consecutive inactive days from index 10 to 39
        const isInactive = idx >= 10 && idx < 40;
        return {
          date: `2026-day-${idx}`,
          weekday: idx % 7,
          count: isInactive ? 0 : 3,
          level: isInactive ? 0 : 2,
        };
      });

      const mockCalendar: NormalizedSubmissionCalendar = {
        startDate: "2025-08-24",
        endDate: "2026-08-24",
        days,
      };

      const result = analyzeLeetcodeCalendar(mockCalendar);
      expect(result.totalPeriods).toBe(366);
      expect(result.activePeriods).toBe(336); // 366 - 30 = 336
      expect(result.longestInactiveGap).toBe(30);
    });

    it("should handle all-active and all-inactive LeetCode calendars", () => {
      const allActive: NormalizedSubmissionCalendar = {
        startDate: "2025-08-24",
        endDate: "2026-08-24",
        days: Array.from({ length: 366 }, (_, idx) => ({
          date: `d${idx}`,
          weekday: idx % 7,
          count: 1,
          level: 1,
        })),
      };

      const activeResult = analyzeLeetcodeCalendar(allActive);
      expect(activeResult.totalPeriods).toBe(366);
      expect(activeResult.activePeriods).toBe(366);
      expect(activeResult.longestInactiveGap).toBe(0);

      const allInactive: NormalizedSubmissionCalendar = {
        startDate: "2025-08-24",
        endDate: "2026-08-24",
        days: Array.from({ length: 366 }, (_, idx) => ({
          date: `d${idx}`,
          weekday: idx % 7,
          count: 0,
          level: 0,
        })),
      };

      const inactiveResult = analyzeLeetcodeCalendar(allInactive);
      expect(inactiveResult.totalPeriods).toBe(366);
      expect(inactiveResult.activePeriods).toBe(0);
      expect(inactiveResult.longestInactiveGap).toBe(366);
    });

    it("should handle activity on the first and last dates of the window", () => {
      const days = [
        { date: "2025-08-24", weekday: 0, count: 1, level: 1 }, // First day active
        { date: "2025-08-25", weekday: 1, count: 0, level: 0 },
        { date: "2025-08-26", weekday: 2, count: 0, level: 0 },
        { date: "2025-08-27", weekday: 3, count: 0, level: 0 },
        { date: "2025-08-28", weekday: 4, count: 10, level: 4 }, // Last day active
      ];

      const result = analyzeLeetcodeCalendar({
        startDate: "2025-08-24",
        endDate: "2025-08-28",
        days,
      });

      expect(result.totalPeriods).toBe(5);
      expect(result.activePeriods).toBe(2);
      expect(result.longestInactiveGap).toBe(3);
    });
  });
});
