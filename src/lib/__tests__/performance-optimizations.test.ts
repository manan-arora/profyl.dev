import { describe, it, expect, vi } from "vitest";
import { mapWithConcurrency } from "@/lib/utils/concurrency";
import { PerformanceTracker } from "@/lib/utils/timing";

describe("P0 + P1 Performance Utilities", () => {
  describe("mapWithConcurrency", () => {
    it("should process items with bounded concurrency limit and preserve original output order", async () => {
      const items = [100, 50, 80, 20, 10];
      let activeExecutions = 0;
      let maxSimultaneousExecutions = 0;

      const results = await mapWithConcurrency(items, 2, async (item, index) => {
        activeExecutions++;
        if (activeExecutions > maxSimultaneousExecutions) {
          maxSimultaneousExecutions = activeExecutions;
        }

        // simulate async delay
        await new Promise((resolve) => setTimeout(resolve, item));

        activeExecutions--;
        return { index, value: item * 2 };
      });

      expect(maxSimultaneousExecutions).toBeLessThanOrEqual(2);
      expect(results).toEqual([
        { index: 0, value: 200 },
        { index: 1, value: 100 },
        { index: 2, value: 160 },
        { index: 3, value: 40 },
        { index: 4, value: 20 },
      ]);
    });

    it("should return empty array for empty input", async () => {
      const results = await mapWithConcurrency([], 4, async (item) => item);
      expect(results).toEqual([]);
    });
  });

  describe("PerformanceTracker", () => {
    it("should record stage durations and track operation counts", async () => {
      const tracker = new PerformanceTracker();

      tracker.incrementCount("githubApiRequests", 3);
      tracker.incrementCount("manifestsFetched", 5);

      await tracker.measureAsync("testStage", async () => {
        await new Promise((resolve) => setTimeout(resolve, 20));
      });

      const metrics = tracker.getMetrics();
      expect(metrics.totalDurationMs).toBeGreaterThanOrEqual(15);
      expect(metrics.stages.testStage).toBeGreaterThanOrEqual(15);
      expect(metrics.counts.githubApiRequests).toBe(3);
      expect(metrics.counts.manifestsFetched).toBe(5);
    });
  });
});
