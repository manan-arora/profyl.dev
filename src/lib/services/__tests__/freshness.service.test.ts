import { describe, it, expect, vi, beforeEach } from "vitest";
import { ensureSourceDataFresh, runDerivedDataPipeline, ensureProfileDataFresh } from "../freshness.service";
import { prisma } from "@/lib/prisma";
import { githubService } from "@/lib/services/github.service";
import { leetcodeService } from "@/lib/services/leetcode.service";
import { computeAnalytics } from "@/lib/analytics/analytics-engine";
import { persistAnalytics } from "@/lib/services/analytics.service";
import { generateAndPersistAIInsights } from "@/lib/ai/ai-insights.service";

// Mock dependencies
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    analytics: {
      findUnique: vi.fn(),
    },
    aIInsights: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("@/lib/services/github.service", () => ({
  githubService: {
    syncGithub: vi.fn(),
  },
}));

vi.mock("@/lib/services/leetcode.service", () => ({
  leetcodeService: {
    syncLeetcodeData: vi.fn(),
  },
}));

vi.mock("@/lib/analytics/analytics-engine", () => ({
  computeAnalytics: vi.fn(),
}));

vi.mock("@/lib/services/analytics.service", () => ({
  persistAnalytics: vi.fn(),
}));

vi.mock("@/lib/ai/ai-insights.service", () => ({
  generateAndPersistAIInsights: vi.fn(),
}));

describe("Freshness & Derived Data Pipeline Services", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("ensureSourceDataFresh", () => {
    it("should throw if user is not found", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null as any);
      await expect(ensureSourceDataFresh("user_123")).rejects.toThrow("User not found");
    });

    it("should sync GitHub and not sync LeetCode if GitHub is stale and LeetCode is fresh", async () => {
      const now = new Date();
      const mockUser = {
        id: "user_123",
        isLeetcodeVerified: true,
        githubCache: {
          cacheExpiresAt: new Date(now.getTime() - 1000), // stale
        },
        leetcodeCache: {
          username: "lc_user",
          cacheExpiresAt: new Date(now.getTime() + 100000), // fresh
        },
      };
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);

      const result = await ensureSourceDataFresh("user_123");

      expect(githubService.syncGithub).toHaveBeenCalledWith("user_123");
      expect(leetcodeService.syncLeetcodeData).not.toHaveBeenCalled();
      expect(result).toEqual({
        anyRefreshed: true,
        githubRefreshed: true,
        leetcodeRefreshed: false,
      });
    });

    it("should sync LeetCode and not sync GitHub if LeetCode is stale and GitHub is fresh", async () => {
      const now = new Date();
      const mockUser = {
        id: "user_123",
        isLeetcodeVerified: true,
        githubCache: {
          cacheExpiresAt: new Date(now.getTime() + 100000), // fresh
        },
        leetcodeCache: {
          username: "lc_user",
          cacheExpiresAt: new Date(now.getTime() - 1000), // stale
        },
      };
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);

      const result = await ensureSourceDataFresh("user_123");

      expect(githubService.syncGithub).not.toHaveBeenCalled();
      expect(leetcodeService.syncLeetcodeData).toHaveBeenCalledWith("user_123");
      expect(result).toEqual({
        anyRefreshed: true,
        githubRefreshed: false,
        leetcodeRefreshed: true,
      });
    });

    it("should skip LeetCode sync if user is not verified, even if LeetCode cache is stale", async () => {
      const now = new Date();
      const mockUser = {
        id: "user_123",
        isLeetcodeVerified: false,
        githubCache: {
          cacheExpiresAt: new Date(now.getTime() + 100000), // fresh
        },
        leetcodeCache: {
          username: "lc_user",
          cacheExpiresAt: new Date(now.getTime() - 1000), // stale
        },
      };
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);

      const result = await ensureSourceDataFresh("user_123");

      expect(githubService.syncGithub).not.toHaveBeenCalled();
      expect(leetcodeService.syncLeetcodeData).not.toHaveBeenCalled();
      expect(result).toEqual({
        anyRefreshed: false,
        githubRefreshed: false,
        leetcodeRefreshed: false,
      });
    });

    it("should skip all syncs if caches are fresh", async () => {
      const now = new Date();
      const mockUser = {
        id: "user_123",
        isLeetcodeVerified: true,
        githubCache: {
          cacheExpiresAt: new Date(now.getTime() + 100000), // fresh
        },
        leetcodeCache: {
          username: "lc_user",
          cacheExpiresAt: new Date(now.getTime() + 100000), // fresh
        },
      };
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);

      const result = await ensureSourceDataFresh("user_123");

      expect(githubService.syncGithub).not.toHaveBeenCalled();
      expect(leetcodeService.syncLeetcodeData).not.toHaveBeenCalled();
      expect(result).toEqual({
        anyRefreshed: false,
        githubRefreshed: false,
        leetcodeRefreshed: false,
      });
    });

    it("should sync both if both are stale", async () => {
      const now = new Date();
      const mockUser = {
        id: "user_123",
        isLeetcodeVerified: true,
        githubCache: null, // stale
        leetcodeCache: {
          username: "lc_user",
          cacheExpiresAt: null, // stale
        },
      };
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);

      const result = await ensureSourceDataFresh("user_123");

      expect(githubService.syncGithub).toHaveBeenCalledWith("user_123");
      expect(leetcodeService.syncLeetcodeData).toHaveBeenCalledWith("user_123");
      expect(result).toEqual({
        anyRefreshed: true,
        githubRefreshed: true,
        leetcodeRefreshed: true,
      });
    });
  });

  describe("runDerivedDataPipeline", () => {
    it("should compute analytics, persist analytics, and generate AI insights in order", async () => {
      const mockResult = { score: 95 };
      vi.mocked(computeAnalytics).mockResolvedValue(mockResult as any);

      await runDerivedDataPipeline("user_123");

      expect(computeAnalytics).toHaveBeenCalledWith("user_123");
      expect(persistAnalytics).toHaveBeenCalledWith(mockResult);
      expect(generateAndPersistAIInsights).toHaveBeenCalledWith("user_123", mockResult);
    });
  });

  describe("ensureProfileDataFresh", () => {
    it("should run pipeline and return true if any source cache was refreshed", async () => {
      const now = new Date();
      const mockUser = {
        id: "user_123",
        isLeetcodeVerified: false,
        githubCache: null, // stale to trigger refresh
      };
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(prisma.analytics.findUnique).mockResolvedValue({ computedAt: now } as any);
      vi.mocked(prisma.aIInsights.findUnique).mockResolvedValue({ generatedAt: now } as any);
      vi.mocked(computeAnalytics).mockResolvedValue({ score: 95 } as any);

      const result = await ensureProfileDataFresh("user_123");

      expect(result).toBe(true);
      expect(computeAnalytics).toHaveBeenCalledWith("user_123");
    });

    it("should run pipeline and return true if analytics is missing or stale", async () => {
      const now = new Date();
      const mockUser = {
        id: "user_123",
        isLeetcodeVerified: false,
        githubCache: {
          cacheExpiresAt: new Date(now.getTime() + 100000), // fresh
        },
      };
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      // Analytics missing:
      vi.mocked(prisma.analytics.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.aIInsights.findUnique).mockResolvedValue({ generatedAt: now } as any);
      vi.mocked(computeAnalytics).mockResolvedValue({ score: 95 } as any);

      const result = await ensureProfileDataFresh("user_123");

      expect(result).toBe(true);
      expect(computeAnalytics).toHaveBeenCalledWith("user_123");
    });

    it("should run pipeline and return true if AI insights is stale (older than 12h)", async () => {
      const now = new Date();
      const mockUser = {
        id: "user_123",
        isLeetcodeVerified: false,
        githubCache: {
          cacheExpiresAt: new Date(now.getTime() + 100000), // fresh
        },
      };
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(prisma.analytics.findUnique).mockResolvedValue({ computedAt: now } as any);
      // AI Insights older than 12h:
      vi.mocked(prisma.aIInsights.findUnique).mockResolvedValue({
        generatedAt: new Date(now.getTime() - 13 * 60 * 60 * 1000),
      } as any);
      vi.mocked(computeAnalytics).mockResolvedValue({ score: 95 } as any);

      const result = await ensureProfileDataFresh("user_123");

      expect(result).toBe(true);
      expect(computeAnalytics).toHaveBeenCalledWith("user_123");
    });

    it("should skip pipeline and return false if everything is fresh", async () => {
      const now = new Date();
      const mockUser = {
        id: "user_123",
        isLeetcodeVerified: false,
        githubCache: {
          cacheExpiresAt: new Date(now.getTime() + 100000), // fresh
        },
      };
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(prisma.analytics.findUnique).mockResolvedValue({ computedAt: now } as any);
      vi.mocked(prisma.aIInsights.findUnique).mockResolvedValue({ generatedAt: now } as any);

      const result = await ensureProfileDataFresh("user_123");

      expect(result).toBe(false);
      expect(computeAnalytics).not.toHaveBeenCalled();
    });
  });
});
