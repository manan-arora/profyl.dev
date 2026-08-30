import { describe, it, expect, vi, beforeEach } from "vitest";
import { getProfylPageData, parseEvidence } from "../profyl-page.service";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      count: vi.fn(),
    },
  },
}));

describe("profylPageService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("parseEvidence", () => {
    it("should parse period-separated sentence strings into string[] keeping sentence punctuation", () => {
      const input = "Top 8% LeetCode percentile. 120 contributions. Knight tier.";
      const parsed = parseEvidence(input);
      expect(parsed).toEqual([
        "Top 8% LeetCode percentile.",
        "120 contributions.",
        "Knight tier.",
      ]);
    });

    it("should append a period if a sentence lacks one", () => {
      const input = "Top 8% LeetCode percentile. 120 contributions";
      const parsed = parseEvidence(input);
      expect(parsed).toEqual([
        "Top 8% LeetCode percentile.",
        "120 contributions.",
      ]);
    });

    it("should handle null or undefined gracefully", () => {
      expect(parseEvidence(null)).toEqual([]);
      expect(parseEvidence(undefined)).toEqual([]);
    });
  });

  describe("getProfylPageData", () => {
    const mockUserRecord = {
      id: "user_1",
      clerkId: "clerk_1",
      email: "test@example.com",
      name: "Clerk Name",
      avatarUrl: "https://example.com/avatar.png",
      githubUsername: "gituser",
      slug: "gituser",
      profileStatus: "DRAFT",
      profile: {
        name: "Profile Name",
        currentRole: "Backend Engineer",
        currentCompany: "Acme Corp",
        location: "Berlin, DE",
        yearsExperience: 5,
        bio: "Bio details",
        college: "Tech University",
        degree: "M.S.",
        branch: "Software Engineering",
        graduationYear: 2020,
        resumeUrl: "https://example.com/resume.pdf",
        techStack: ["Node.js", "TypeScript"],
      },
      githubCache: {
        totalContributionsLastYear: 1200,
        publicRepoCount: 15,
        contributionCalendar: {
          weeks: [
            {
              days: [
                { date: "2026-01-05", count: 10 },
                { date: "2026-01-06", count: 5 },
              ],
            },
            {
              days: [
                { date: "2026-02-12", count: 20 },
              ],
            },
          ],
        },
        languageDistribution: {
          TypeScript: 60,
          Go: 40,
        },
      },
      leetcodeCache: {
        username: "lcuser",
        problemsSolved: 150,
        percentile: 85.5,
        contestRating: 1800,
        easySolved: 50,
        mediumSolved: 70,
        hardSolved: 30,
        overallRanking: 12500,
        contestsParticipated: 12,
        ratingHistory: [
          {
            attended: true,
            rating: 1750,
            contest: { startTime: 1770000000 },
          },
          {
            attended: true,
            rating: 1800,
            contest: { startTime: 1770086400 },
          },
        ],
      },
      analytics: {
        profylScore: 750,
        tier: "STRONG",
        profylPercentile: 94.2,
        radar: {
          buildActivity: 80,
          technicalRange: 75,
          problemSolving: 85,
          consistency: 90,
          openSource: 70,
        },
        signalBreakdown: {
          github: 80,
          projects: 70,
          leetcode: 90,
          consistency: 85,
        },
      },
      aiInsights: {
        aiSignal: "Strong backend systems developer",
        aiSummary: "Proven track record in distributed infrastructure.",
        aiEvidence: "Top 8% LeetCode. 1200 commits.",
        strengthChips: ["Backend", "Infrastructure"],
      },
      repositories: [
        {
          id: "repo_1",
          name: "ledger",
          description: "append only ledger",
          stars: 120,
          primaryLanguage: "Rust",
          detectedTechnologies: [
            { technologyId: "rust", name: "Rust", signals: ["Backend"], evidence: [] },
            { technologyId: "postgresql", name: "PostgreSQL", signals: ["Database"], evidence: [] }
          ],
          githubUrl: "https://github.com/gituser/ledger",
          liveDemoUrl: "https://ledger.demo",
          projectSummary: "ledger summary",
          isFeatured: true,
          displayOrder: 1,
        },
      ],
    };

    it("should query user by id and map data structures correctly", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUserRecord as any);
      vi.mocked(prisma.user.count).mockResolvedValue(120); // Above cold-start threshold

      const data = await getProfylPageData({ userId: "user_1" });

      expect(data).not.toBeNull();
      expect(data?.identity.name).toBe("Profile Name"); // Profile.name precedence
      expect(data?.identity.currentCompany).toBe("Acme Corp");
      expect(data?.identity.college).toBe("Tech University");
      expect(data?.identity.degree).toBe("M.S.");
      expect(data?.identity.branch).toBe("Software Engineering");
      expect(data?.identity.graduationYear).toBe(2020);
      expect(data?.identity.avatarUrl).toBe("https://example.com/avatar.png");
      expect(data?.identity.leetcodeUrl).toBe("https://leetcode.com/lcuser");
      expect(data?.evaluation.profylScore).toBe(750);
      expect(data?.evaluation.tier).toBe("Strong");
      expect(data?.evaluation.percentile).toBe(94); // Math.round(94.2)
      expect(data?.ai.evidence).toEqual(["Top 8% LeetCode.", "1200 commits."]);

      // Monthly contributions check
      expect(data?.github.monthlyContributionSeries).toEqual([
        { month: "Jan", contributions: 15 },
        { month: "Feb", contributions: 20 },
      ]);
    });

    it("should resolve identity precedence (Profile.name -> githubUsername)", async () => {
      const recordWithClerkName = {
        ...mockUserRecord,
        name: "Clerk User Name",
        profile: {
          ...mockUserRecord.profile,
          name: "Profile Name",
        },
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(recordWithClerkName as any);
      vi.mocked(prisma.user.count).mockResolvedValue(120);

      const data = await getProfylPageData({ userId: "user_1" });
      expect(data?.identity.name).toBe("Profile Name"); // Should prefer Profile.name even if user.name exists

      const recordNoNameAtAll = {
        ...recordWithClerkName,
        profile: {
          ...recordWithClerkName.profile,
          name: null,
        },
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(recordNoNameAtAll as any);
      const data2 = await getProfylPageData({ userId: "user_1" });
      expect(data2?.identity.name).toBe("gituser"); // githubUsername precedence
    });

    it("should hide percentile under cold-start rule of 100 users", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUserRecord as any);
      vi.mocked(prisma.user.count).mockResolvedValue(50); // Under cold start threshold

      const data = await getProfylPageData({ userId: "user_1" });
      expect(data?.evaluation.percentile).toBeNull();
    });

    it("should aggregate underTheHood capabilities and technologies correctly", async () => {
      const recordWithVariousRepos = {
        ...mockUserRecord,
        repositories: [
          {
            id: "repo_1",
            name: "ledger",
            description: "append only ledger",
            stars: 120,
            primaryLanguage: "Rust",
            detectedTechnologies: [
              { technologyId: "rust", name: "Rust", signals: ["Backend"], evidence: [] },
              { technologyId: "postgresql", name: "PostgreSQL", signals: ["Database"], evidence: [] }
            ],
            detectedSignals: ["Backend", "Database"],
            topics: ["finance", "database"],
            isFeatured: true,
            displayOrder: 1,
          },
          {
            id: "repo_2",
            name: "pgstream",
            description: "cdc stream",
            stars: 40,
            primaryLanguage: "Go",
            detectedTechnologies: [
              { technologyId: "go", name: "Go", signals: ["Backend"], evidence: [] },
              // Duplicate technology "PostgreSQL" to test deduplication
              { technologyId: "postgresql", name: "PostgreSQL", signals: ["Database"], evidence: [] }
            ],
            detectedSignals: ["Backend", "Database"],
            topics: ["database", "streaming"],
            isFeatured: true,
            displayOrder: 2,
          },
          {
            // Non-featured repository (should be excluded)
            id: "repo_3",
            name: "unfeatured-app",
            description: "internal tool",
            stars: 2,
            primaryLanguage: "TypeScript",
            detectedTechnologies: [
              { technologyId: "react", name: "React", signals: ["Frontend"], evidence: [] }
            ],
            detectedSignals: ["Frontend"],
            topics: ["internal"],
            isFeatured: false,
            displayOrder: 3,
          },
          {
            // Repo with missing/null analysis data
            id: "repo_4",
            name: "unanalyzed-app",
            description: "no details",
            stars: 5,
            primaryLanguage: "Python",
            detectedTechnologies: null,
            detectedSignals: null,
            topics: null, // to test fallback
            isFeatured: true,
            displayOrder: 4,
          }
        ],
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(recordWithVariousRepos as any);
      vi.mocked(prisma.user.count).mockResolvedValue(120);

      const data = await getProfylPageData({ userId: "user_1" });

      expect(data).not.toBeNull();
      
      // Verification: duplicate technologies are deduplicated (Rust, PostgreSQL, Go)
      // Excluded: React (since repo_3 is not featured)
      expect(data?.underTheHood?.technologies).toEqual(["Go", "PostgreSQL", "Rust"]);

      // Verification: capabilities are counted across featured repos:
      // Backend is present in repo_1 and repo_2 -> count = 2
      // Database is present in repo_1 and repo_2 -> count = 2
      // Unanalyzed repo_4 has null signals, shouldn't crash or add counts
      // Non-featured repo_3 has Frontend signal, which is excluded
      expect(data?.underTheHood?.capabilities).toEqual([
        { label: "Backend", count: 2 },
        { label: "Database", count: 2 },
      ]);

      // Verification: Topics are mapped correctly to projects
      const project1 = data?.projects.find(p => p.id === "repo_1");
      expect(project1?.topics).toEqual(["finance", "database"]);

      // Verification: Fallback for empty topics
      const project4 = data?.projects.find(p => p.id === "repo_4");
      expect(project4?.topics).toEqual([]);
    });
  });
});
