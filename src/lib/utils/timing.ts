/**
 * Lightweight, production-safe performance instrumentation and metrics collector.
 * Tracks stage durations and API/operation call counters.
 */

export interface TimingMetrics {
  totalDurationMs: number;
  stages: Record<string, number>;
  counts: {
    githubApiRequests: number;
    leetcodeApiRequests: number;
    repositoriesAnalyzed: number;
    manifestsFetched: number;
    readmesFetched: number;
    aiGenerations: number;
  };
}

export class PerformanceTracker {
  private startTime: number;
  private stageStarts: Map<string, number> = new Map();
  private stageDurations: Map<string, number> = new Map();
  
  public counts = {
    githubApiRequests: 0,
    leetcodeApiRequests: 0,
    repositoriesAnalyzed: 0,
    manifestsFetched: 0,
    readmesFetched: 0,
    aiGenerations: 0,
  };

  constructor() {
    this.startTime = performance.now();
  }

  startStage(stageName: string): void {
    this.stageStarts.set(stageName, performance.now());
  }

  endStage(stageName: string): number {
    const start = this.stageStarts.get(stageName);
    if (!start) return 0;
    const duration = Math.round(performance.now() - start);
    this.stageDurations.set(stageName, (this.stageDurations.get(stageName) || 0) + duration);
    this.stageStarts.delete(stageName);
    return duration;
  }

  async measureAsync<T>(stageName: string, fn: () => Promise<T>): Promise<T> {
    this.startStage(stageName);
    try {
      return await fn();
    } finally {
      this.endStage(stageName);
    }
  }

  incrementCount(metric: keyof PerformanceTracker["counts"], amount: number = 1): void {
    if (metric in this.counts) {
      this.counts[metric] += amount;
    }
  }

  getMetrics(): TimingMetrics {
    const totalDurationMs = Math.round(performance.now() - this.startTime);
    const stages: Record<string, number> = {};
    this.stageDurations.forEach((val, key) => {
      stages[key] = val;
    });

    return {
      totalDurationMs,
      stages,
      counts: { ...this.counts },
    };
  }

  logSummary(contextLabel: string): void {
    if (process.env.NODE_ENV === "development" || process.env.DEBUG_TIMING === "true") {
      const metrics = this.getMetrics();
      console.log(`[PROFYL TIMING] === ${contextLabel} (Total: ${metrics.totalDurationMs}ms) ===`);
      Object.entries(metrics.stages).forEach(([stage, duration]) => {
        console.log(`  - ${stage}: ${duration}ms`);
      });
      console.log(`  Counts:`, JSON.stringify(metrics.counts));
    }
  }
}

/** Global thread/request-safe tracker helper instance or factory */
export function createTracker(): PerformanceTracker {
  return new PerformanceTracker();
}
