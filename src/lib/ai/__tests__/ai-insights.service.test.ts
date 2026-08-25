import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateAndPersistAIInsights, deterministicStringify } from "../ai-insights.service";
import { prisma } from "@/lib/prisma";
import { generateAIOutput } from "../generator";
import { loadAIContextSources, buildAIContext } from "../context-builder";
import { PROMPT_VERSION } from "../prompts";
import { GEMINI_MODEL } from "../config";
import { createHash } from "crypto";

// Mock prisma database client
vi.mock("@/lib/prisma", () => {
  const mockAIInsights = {
    findUnique: vi.fn(),
    upsert: vi.fn(),
  };
  const mockRepository = {
    update: vi.fn(),
  };
  return {
    prisma: {
      aIInsights: mockAIInsights,
      repository: mockRepository,
      $transaction: vi.fn((promises) => Promise.all(promises)),
    },
  };
});

// Mock builder and loading utilities
vi.mock("../context-builder", () => ({
  loadAIContextSources: vi.fn(),
  buildAIContext: vi.fn(),
}));

// Mock low-level Gemini generator
vi.mock("../generator", () => ({
  generateAIOutput: vi.fn(),
}));

describe("generateAndPersistAIInsights service", () => {
  const mockUserId = "user_123";
  const mockAnalyticsResult = {
    userId: mockUserId,
    profylScore: 780,
    tier: "STRONG" as any,
    githubScore: 80,
    projectsScore: 75,
    leetcodeScore: 85,
    consistencyScore: 90,
    radar: { buildActivity: 80, technicalRange: 75, problemSolving: 85, consistency: 90, openSource: 50 },
    signalBreakdown: { github: 80, projects: 75, leetcode: 85, consistency: 90 },
    components: {} as any,
    featuredAnalysis: {} as any,
  };

  const mockSources = {
    user: { id: mockUserId } as any,
    profile: null,
    githubCache: null,
    leetcodeCache: null,
    featuredRepositories: [
      { id: "repo_1", name: "project-one" } as any,
      { id: "repo_2", name: "project-two" } as any,
    ],
    analyticsResult: mockAnalyticsResult,
  };

  const mockContext = {
    developer: { name: "Test User" },
    evaluation: { profylScore: 780 },
    github: {},
    leetcode: {},
    projects: [
      { id: "repo_1", title: "project-one" },
      { id: "repo_2", title: "project-two" },
    ],
  };

  const mockGeneratedOutput = {
    aiSignal: "Strong backend experience.",
    aiSummary: "Experienced engineer focusing on cloud architecture.",
    aiEvidence: "Built multiple backend systems.",
    strengthChips: ["Backend", "Cloud", "Architecture"],
    projectSummaries: [
      { repositoryId: "repo_1", summary: "Awesome backend api." },
      { repositoryId: "repo_2", summary: "Messaging microservice." },
    ],
  };

  const currentHash = createHash("sha256")
    .update(deterministicStringify(mockContext))
    .digest("hex");

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(loadAIContextSources).mockResolvedValue(mockSources);
    vi.mocked(buildAIContext).mockReturnValue(mockContext as any);
    vi.mocked(generateAIOutput).mockResolvedValue(mockGeneratedOutput);
  });

  it("1. should return cached insight without calling generator when hash, version, and SWR are valid", async () => {
    const cachedRecord = {
      id: "insight_123",
      userId: mockUserId,
      aiSignal: "Cached signal.",
      aiSummary: "Cached summary.",
      aiEvidence: "Cached evidence.",
      strengthChips: ["Cached1", "Cached2", "Cached3"],
      sourceHash: currentHash,
      promptVersion: PROMPT_VERSION,
      modelVersion: GEMINI_MODEL,
      generatedAt: new Date(), // fresh (now)
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(prisma.aIInsights.findUnique).mockResolvedValue(cachedRecord);

    const result = await generateAndPersistAIInsights(mockUserId, mockAnalyticsResult);

    expect(prisma.aIInsights.findUnique).toHaveBeenCalledWith({ where: { userId: mockUserId } });
    expect(generateAIOutput).not.toHaveBeenCalled();
    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(result).toEqual(cachedRecord);
  });

  it("2. should generate and persist insights when cached record is missing", async () => {
    vi.mocked(prisma.aIInsights.findUnique).mockResolvedValue(null);
    const mockUpsertResult = { id: "new_insight" };
    vi.mocked(prisma.aIInsights.upsert).mockReturnValue(mockUpsertResult as any);

    const result = await generateAndPersistAIInsights(mockUserId, mockAnalyticsResult);

    expect(generateAIOutput).toHaveBeenCalledWith(mockContext);
    expect(prisma.$transaction).toHaveBeenCalled();
    expect(prisma.aIInsights.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: mockUserId },
        update: expect.objectContaining({
          aiSignal: mockGeneratedOutput.aiSignal,
          aiSummary: mockGeneratedOutput.aiSummary,
          aiEvidence: mockGeneratedOutput.aiEvidence,
          sourceHash: currentHash,
          promptVersion: PROMPT_VERSION,
          modelVersion: GEMINI_MODEL,
        }),
      })
    );
    expect(result).toEqual(mockUpsertResult);
  });

  it("3. should regenerate and persist when sourceHash mismatches", async () => {
    const cachedRecord = {
      id: "insight_123",
      userId: mockUserId,
      aiSignal: "Old signal",
      aiSummary: "Old summary",
      aiEvidence: "Old evidence",
      strengthChips: ["A", "B", "C"],
      sourceHash: "some_old_mismatched_hash",
      promptVersion: PROMPT_VERSION,
      modelVersion: GEMINI_MODEL,
      generatedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(prisma.aIInsights.findUnique).mockResolvedValue(cachedRecord);

    await generateAndPersistAIInsights(mockUserId, mockAnalyticsResult);

    expect(generateAIOutput).toHaveBeenCalled();
    expect(prisma.$transaction).toHaveBeenCalled();
    expect(prisma.aIInsights.upsert).toHaveBeenCalled();
  });

  it("4. should regenerate and persist when promptVersion mismatches", async () => {
    const cachedRecord = {
      id: "insight_123",
      userId: mockUserId,
      aiSignal: "Old signal",
      aiSummary: "Old summary",
      aiEvidence: "Old evidence",
      strengthChips: ["A", "B", "C"],
      sourceHash: currentHash,
      promptVersion: "0.1.0", // mismatched version
      modelVersion: GEMINI_MODEL,
      generatedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(prisma.aIInsights.findUnique).mockResolvedValue(cachedRecord);

    await generateAndPersistAIInsights(mockUserId, mockAnalyticsResult);

    expect(generateAIOutput).toHaveBeenCalled();
    expect(prisma.$transaction).toHaveBeenCalled();
  });

  it("5. should regenerate when insight is outside 12-hour SWR window", async () => {
    const thirteenHoursAgo = new Date(Date.now() - 13 * 60 * 60 * 1000);
    const cachedRecord = {
      id: "insight_123",
      userId: mockUserId,
      aiSignal: "Old signal",
      aiSummary: "Old summary",
      aiEvidence: "Old evidence",
      strengthChips: ["A", "B", "C"],
      sourceHash: currentHash,
      promptVersion: PROMPT_VERSION,
      modelVersion: GEMINI_MODEL,
      generatedAt: thirteenHoursAgo, // expired
      createdAt: thirteenHoursAgo,
      updatedAt: thirteenHoursAgo,
    };

    vi.mocked(prisma.aIInsights.findUnique).mockResolvedValue(cachedRecord);

    await generateAndPersistAIInsights(mockUserId, mockAnalyticsResult);

    expect(generateAIOutput).toHaveBeenCalled();
    expect(prisma.$transaction).toHaveBeenCalled();
  });

  it("6. should propagate generator failure and not write to DB", async () => {
    vi.mocked(prisma.aIInsights.findUnique).mockResolvedValue(null);
    vi.mocked(generateAIOutput).mockRejectedValue(new Error("Gemini quota exceeded"));

    await expect(
      generateAndPersistAIInsights(mockUserId, mockAnalyticsResult)
    ).rejects.toThrow("Gemini quota exceeded");

    expect(prisma.aIInsights.upsert).not.toHaveBeenCalled();
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("7. should verify persisted record contains all required fields", async () => {
    vi.mocked(prisma.aIInsights.findUnique).mockResolvedValue(null);
    await generateAndPersistAIInsights(mockUserId, mockAnalyticsResult);

    expect(prisma.aIInsights.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          userId: mockUserId,
          aiSignal: mockGeneratedOutput.aiSignal,
          aiSummary: mockGeneratedOutput.aiSummary,
          aiEvidence: mockGeneratedOutput.aiEvidence,
          strengthChips: mockGeneratedOutput.strengthChips,
          sourceHash: currentHash,
          promptVersion: PROMPT_VERSION,
          modelVersion: GEMINI_MODEL,
          generatedAt: expect.any(Date),
        }),
      })
    );
  });

  it("8. should serialize deterministically for matching contexts with different key orders, while preserving array order", async () => {
    const context1 = {
      a: 1,
      b: [3, 2, 1],
      c: { y: "y", x: "x" },
    };

    const context2 = {
      c: { x: "x", y: "y" },
      a: 1,
      b: [3, 2, 1],
    };

    const context3 = {
      a: 1,
      b: [1, 2, 3], // different array order
      c: { x: "x", y: "y" },
    };

    const str1 = deterministicStringify(context1);
    const str2 = deterministicStringify(context2);
    const str3 = deterministicStringify(context3);

    expect(str1).toBe(str2);
    expect(str1).not.toBe(str3); // arrays should preserve order, so different order means different hash
  });

  it("9. should persist project summaries to user's repositories in allowlist", async () => {
    vi.mocked(prisma.aIInsights.findUnique).mockResolvedValue(null);

    await generateAndPersistAIInsights(mockUserId, mockAnalyticsResult);

    expect(prisma.repository.update).toHaveBeenCalledTimes(2);
    expect(prisma.repository.update).toHaveBeenCalledWith({
      where: { id: "repo_1" },
      data: { projectSummary: "Awesome backend api." },
    });
    expect(prisma.repository.update).toHaveBeenCalledWith({
      where: { id: "repo_2" },
      data: { projectSummary: "Messaging microservice." },
    });
  });

  it("10. should ignore project summaries for repositories not owned by the user", async () => {
    vi.mocked(prisma.aIInsights.findUnique).mockResolvedValue(null);

    // Gemini response contains an unauthorized repositoryId
    const maliciousOutput = {
      ...mockGeneratedOutput,
      projectSummaries: [
        { repositoryId: "repo_1", summary: "Valid repo summary" },
        { repositoryId: "other_user_repo", summary: "Malicious write" },
      ],
    };
    vi.mocked(generateAIOutput).mockResolvedValue(maliciousOutput);

    await generateAndPersistAIInsights(mockUserId, mockAnalyticsResult);

    // Should update repo_1 but NOT other_user_repo
    expect(prisma.repository.update).toHaveBeenCalledTimes(1);
    expect(prisma.repository.update).toHaveBeenCalledWith({
      where: { id: "repo_1" },
      data: { projectSummary: "Valid repo summary" },
    });
    expect(prisma.repository.update).not.toHaveBeenCalledWith({
      where: { id: "other_user_repo" },
      data: expect.any(Object),
    });
  });

  it("11. should verify AI insight + repository summary updates are performed in a transaction", async () => {
    vi.mocked(prisma.aIInsights.findUnique).mockResolvedValue(null);

    await generateAndPersistAIInsights(mockUserId, mockAnalyticsResult);

    expect(prisma.$transaction).toHaveBeenCalled();
  });
});
