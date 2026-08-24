import { describe, it, expect, vi, beforeEach } from "vitest";
import { persistAnalytics } from "../analytics.service";
import { prisma } from "@/lib/prisma";
import { AnalyticsComputationResult } from "@/lib/analytics/analytics-engine";
import { Tier } from "@/generated/prisma/client";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: vi.fn((cb) => cb(prisma)),
    repository: {
      update: vi.fn(),
    },
    analytics: {
      upsert: vi.fn(),
    },
  },
}));

describe("analyticsService.persistAnalytics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockAnalyticsResult: AnalyticsComputationResult = {
    userId: "user123",
    profylScore: 733,
    tier: Tier.STRONG,
    githubScore: 72,
    projectsScore: 81,
    leetcodeScore: 64,
    consistencyScore: 76,
    radar: {
      buildActivity: 70,
      technicalRange: 81,
      problemSolving: 64,
      consistency: 76,
      openSource: 78,
    },
    signalBreakdown: {
      github: 72,
      projects: 81,
      leetcode: 64,
      consistency: 76,
    },
    components: {
      buildActivity: {} as any,
      technicalRange: {} as any,
      problemSolving: {} as any,
      consistency: {} as any,
      openSource: {} as any,
    },
    featuredAnalysis: {
      repositories: [
        {
          repositoryId: "repo_analyzed",
          parsedManifests: [],
          artifacts: [],
          technologies: [
            {
              technologyId: "react",
              name: "React",
              signals: ["Frontend"],
              evidence: [],
            },
          ],
          outcome: "analyzed",
        },
        {
          repositoryId: "repo_unsupported",
          parsedManifests: [],
          artifacts: [],
          technologies: [],
          outcome: "unsupported",
        },
        {
          repositoryId: "repo_failed",
          parsedManifests: [],
          artifacts: [],
          technologies: [],
          outcome: "failed",
        },
      ],
      totalRepositories: 3,
      analyzedRepositories: 1,
    },
  };

  it("should successfully persist analyzed repositories and upsert user Analytics data", async () => {
    vi.mocked(prisma.repository.update).mockResolvedValue({} as any);
    vi.mocked(prisma.analytics.upsert).mockResolvedValue({} as any);

    await persistAnalytics(mockAnalyticsResult);

    // Should call repository update only for "analyzed" repositories
    expect(prisma.repository.update).toHaveBeenCalledTimes(1);
    expect(prisma.repository.update).toHaveBeenCalledWith({
      where: { id: "repo_analyzed" },
      data: {
        detectedTechnologies: [
          {
            technologyId: "react",
            name: "React",
            signals: ["Frontend"],
            evidence: [],
          },
        ],
        detectedSignals: ["Frontend"],
      },
    });

    // Should upsert Analytics with correct data
    expect(prisma.analytics.upsert).toHaveBeenCalledTimes(1);
    expect(prisma.analytics.upsert).toHaveBeenCalledWith({
      where: { userId: "user123" },
      update: expect.objectContaining({
        profylScore: 733,
        tier: Tier.STRONG,
        githubScore: 72,
        projectsScore: 81,
        leetcodeScore: 64,
        consistencyScore: 76,
      }),
      create: expect.objectContaining({
        userId: "user123",
        profylScore: 733,
        tier: Tier.STRONG,
        githubScore: 72,
        projectsScore: 81,
        leetcodeScore: 64,
        consistencyScore: 76,
      }),
    });
  });

  it("should preserve null values and keep 0 values intact", async () => {
    const mockNullAnalyticsResult: AnalyticsComputationResult = {
      ...mockAnalyticsResult,
      profylScore: null,
      tier: null,
      projectsScore: null,
      githubScore: 0,
      radar: {
        ...mockAnalyticsResult.radar,
        technicalRange: null,
        buildActivity: 0,
      },
      signalBreakdown: {
        ...mockAnalyticsResult.signalBreakdown,
        projects: null,
        github: 0,
      },
      featuredAnalysis: {
        repositories: [],
        totalRepositories: 0,
        analyzedRepositories: 0,
      },
    };

    vi.mocked(prisma.analytics.upsert).mockResolvedValue({} as any);

    await persistAnalytics(mockNullAnalyticsResult);

    expect(prisma.analytics.upsert).toHaveBeenCalledWith({
      where: { userId: "user123" },
      update: expect.objectContaining({
        profylScore: null,
        tier: null,
        githubScore: 0,
        projectsScore: null,
      }),
      create: expect.objectContaining({
        userId: "user123",
        profylScore: null,
        tier: null,
        githubScore: 0,
        projectsScore: null,
      }),
    });
  });

  it("should propagate transaction failures", async () => {
    vi.mocked(prisma.repository.update).mockRejectedValueOnce(
      new Error("Database transaction failed")
    );

    await expect(persistAnalytics(mockAnalyticsResult)).rejects.toThrow(
      "Database transaction failed"
    );
  });
});
