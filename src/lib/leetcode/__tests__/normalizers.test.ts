import { describe, it, expect } from "vitest";
import {
  deriveLeetCodeActivityLevel,
  normalizeSubmissionCalendar,
} from "../normalizers";

describe("LeetCode Submission Calendar Normalizer", () => {
  describe("deriveLeetCodeActivityLevel", () => {
    it("should return level 0 for count <= 0", () => {
      expect(deriveLeetCodeActivityLevel(0)).toBe(0);
      expect(deriveLeetCodeActivityLevel(-1)).toBe(0);
    });

    it("should return level 1 for 1-2 submissions", () => {
      expect(deriveLeetCodeActivityLevel(1)).toBe(1);
      expect(deriveLeetCodeActivityLevel(2)).toBe(1);
    });

    it("should return level 2 for 3-5 submissions", () => {
      expect(deriveLeetCodeActivityLevel(3)).toBe(2);
      expect(deriveLeetCodeActivityLevel(4)).toBe(2);
      expect(deriveLeetCodeActivityLevel(5)).toBe(2);
    });

    it("should return level 3 for 6-9 submissions", () => {
      expect(deriveLeetCodeActivityLevel(6)).toBe(3);
      expect(deriveLeetCodeActivityLevel(7)).toBe(3);
      expect(deriveLeetCodeActivityLevel(8)).toBe(3);
      expect(deriveLeetCodeActivityLevel(9)).toBe(3);
    });

    it("should return level 4 for >= 10 submissions", () => {
      expect(deriveLeetCodeActivityLevel(10)).toBe(4);
      expect(deriveLeetCodeActivityLevel(15)).toBe(4);
      expect(deriveLeetCodeActivityLevel(100)).toBe(4);
    });
  });

  describe("normalizeSubmissionCalendar", () => {
    const fixedReferenceDate = new Date("2026-08-24T12:00:00Z");

    it("should generate a complete 1-calendar-year window (today - 1 year to today, inclusive)", () => {
      const result = normalizeSubmissionCalendar({}, fixedReferenceDate);

      // 2025-08-24 to 2026-08-24 is 366 days in a non-leap year interval
      expect(result.startDate).toBe("2025-08-24");
      expect(result.endDate).toBe("2026-08-24");
      expect(result.days).toHaveLength(366);

      expect(result.days[0].date).toBe("2025-08-24");
      expect(result.days[result.days.length - 1].date).toBe("2026-08-24");
    });

    it("should assign count: 0 and level: 0 to missing dates", () => {
      const result = normalizeSubmissionCalendar({}, fixedReferenceDate);

      for (const day of result.days) {
        expect(day.count).toBe(0);
        expect(day.level).toBe(0);
        expect(typeof day.weekday).toBe("number");
        expect(day.weekday).toBeGreaterThanOrEqual(0);
        expect(day.weekday).toBeLessThanOrEqual(6);
      }
    });

    it("should correctly populate raw activity on known dates using Unix timestamp keys in seconds", () => {
      // 2026-08-24 00:00:00 UTC timestamp = 1787529600
      // 2025-08-24 00:00:00 UTC timestamp = 1756003200
      const targetTsFirst = 1756003200; // 2025-08-24
      const targetTsLast = 1787529600; // 2026-08-24
      const targetTsMid = 1770000000; // mid-window date (~2026-02-02)

      const rawCalendar: Record<string, number> = {
        [targetTsFirst]: 1, // level 1
        [targetTsMid]: 4, // level 2
        [targetTsLast]: 12, // level 4
      };

      const result = normalizeSubmissionCalendar(rawCalendar, fixedReferenceDate);

      const firstDay = result.days.find((d) => d.date === "2025-08-24");
      expect(firstDay).toBeDefined();
      expect(firstDay?.count).toBe(1);
      expect(firstDay?.level).toBe(1);

      const lastDay = result.days.find((d) => d.date === "2026-08-24");
      expect(lastDay).toBeDefined();
      expect(lastDay?.count).toBe(12);
      expect(lastDay?.level).toBe(4);
    });

    it("should assign timestamps near midnight UTC (23:45 UTC) to the correct UTC date regardless of local machine timezone", () => {
      // 2026-08-24 23:45:00 UTC = 1787615100 seconds
      // In IST (+05:30), this is 2026-08-25 05:15:00. In UTC, it MUST be 2026-08-24.
      const nearMidnightUtcTs = 1787615100;

      const rawCalendar: Record<string, number> = {
        [nearMidnightUtcTs]: 5,
      };

      const result = normalizeSubmissionCalendar(rawCalendar, fixedReferenceDate);

      const aug24 = result.days.find((d) => d.date === "2026-08-24");
      const aug25 = result.days.find((d) => d.date === "2026-08-25");

      expect(aug24).toBeDefined();
      expect(aug24?.count).toBe(5);
      expect(aug24?.level).toBe(2);

      // Verify it was NOT assigned to Aug 25
      if (aug25) {
        expect(aug25.count).toBe(0);
      }
    });

    it("should handle stringified JSON raw calendar input safely", () => {
      const rawString = JSON.stringify({
        "1787529600": 7, // 2026-08-24 -> level 3
      });

      const result = normalizeSubmissionCalendar(rawString, fixedReferenceDate);

      const lastDay = result.days.find((d) => d.date === "2026-08-24");
      expect(lastDay?.count).toBe(7);
      expect(lastDay?.level).toBe(3);
    });

    it("should handle null, undefined, or malformed input without throwing", () => {
      expect(() => normalizeSubmissionCalendar(null, fixedReferenceDate)).not.toThrow();
      expect(() => normalizeSubmissionCalendar(undefined, fixedReferenceDate)).not.toThrow();
      expect(() => normalizeSubmissionCalendar("invalid json", fixedReferenceDate)).not.toThrow();

      const nullResult = normalizeSubmissionCalendar(null, fixedReferenceDate);
      expect(nullResult.days.every((d) => d.count === 0)).toBe(true);
    });

    it("should handle leap year boundaries correctly", () => {
      // Reference date in leap year: 2024-03-01
      const leapReferenceDate = new Date("2024-03-01T12:00:00Z");
      const result = normalizeSubmissionCalendar({}, leapReferenceDate);

      expect(result.startDate).toBe("2023-03-01");
      expect(result.endDate).toBe("2024-03-01");
      // Includes Feb 29, 2024 (367 days inclusive)
      expect(result.days).toHaveLength(367);

      const feb29 = result.days.find((d) => d.date === "2024-02-29");
      expect(feb29).toBeDefined();
    });

    it("should assign correct weekdays (0=Sunday to 6=Saturday)", () => {
      // 2026-08-24 is a Monday (weekday 1)
      const result = normalizeSubmissionCalendar({}, fixedReferenceDate);
      const lastDay = result.days[result.days.length - 1];

      expect(lastDay.date).toBe("2026-08-24");
      expect(lastDay.weekday).toBe(1); // Monday
    });
  });
});
