import { describe, it, expect } from "vitest";
import { buildAIContext, AIContextSources } from "../context-builder";
import { Tier } from "@/generated/prisma/client";

// Helper to create mock sources with basic defaults
function createMockSources(overrides: Partial<AIContextSources> = {}): AIContextSources {
  return {
    user: {
      id: "user_123",
      clerkId: "clerk_123",
      email: "test@example.com",
      name: null,
      avatarUrl: null,
      githubId: "github_123",
      githubUsername: "testuser",
      slug: "testuser",
      profileStatus: "INCOMPLETE",
      isPublished: false,
      publishedAt: null,
      isLeetcodeVerified: false,
      featuredProjectsSelected: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    profile: null,
    githubCache: null,
    leetcodeCache: null,
    featuredRepositories: [],
    analyticsResult: {
      userId: "user_123",
      profylScore: null,
      tier: null,
      githubScore: 0,
      projectsScore: null,
      leetcodeScore: 0,
      consistencyScore: 0,
      radar: {
        buildActivity: 0,
        technicalRange: null,
        problemSolving: 0,
        consistency: 0,
        openSource: 0,
      },
      signalBreakdown: {
        github: 0,
        projects: null,
        leetcode: 0,
        consistency: 0,
      },
      components: {
        buildActivity: {
          score: 0,
          contributionScore: null,
          activeProjectScore: null,
        },
        technicalRange: null,
        problemSolving: {
          score: 0,
          volumeScore: 0,
          difficultyScore: 0,
          contestScore: null,
        },
        consistency: {
          score: 0,
          githubConsistency: null,
          leetcodeConsistency: null,
          githubActiveWeekScore: null,
          githubGapScore: null,
          leetcodeActiveDayScore: null,
          leetcodeGapScore: null,
        },
        openSource: {
          score: 0,
          contributionScore: 0,
          starsScore: 0,
          forksScore: 0,
          impactScore: 0,
        },
      },
      featuredAnalysis: {
        repositories: [],
        totalRepositories: 0,
        analyzedRepositories: 0,
      },
    },
    ...overrides,
  };
}

describe("buildAIContext", () => {
  describe("Developer Profile Fields Exclusion", () => {
    it("should produce identical context when profile fields change", () => {
      const baseSources = createMockSources({
        profile: {
          id: "profile_123",
          userId: "user_123",
          name: "Test User",
          headline: "Software Engineer",
          bio: "Original bio.",
          currentRole: "Engineer",
          currentCompany: "Acme Corp",
          yearsExperience: 5,
          location: "San Francisco, CA",
          college: "Stanford University",
          degree: "B.S.",
          graduationYear: 2020,
          branch: "Computer Science",
          techStack: ["TypeScript", "Next.js"],
          linkedinUrl: "https://linkedin.com/in/testuser",
          portfolioUrl: "https://testuser.dev",
          resumeUrl: "https://cloudinary.com/testuser/resume.pdf",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      const updatedSources = createMockSources({
        profile: {
          id: "profile_123",
          userId: "user_123",
          name: "Different User Name",
          headline: "Lead Architect",
          bio: "Brand new bio content.",
          currentRole: "Lead",
          currentCompany: "Different Corp",
          yearsExperience: 10,
          location: "New York, NY",
          college: "MIT",
          degree: "M.S.",
          graduationYear: 2015,
          branch: "Electrical Engineering",
          techStack: ["React", "Rust"],
          linkedinUrl: "https://linkedin.com/in/differentuser",
          portfolioUrl: "https://differentuser.dev",
          resumeUrl: "https://cloudinary.com/differentuser/resume.pdf",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      const context1 = buildAIContext(baseSources);
      const context2 = buildAIContext(updatedSources);

      expect(context1).toEqual(context2);
    });
  });

  describe("Evaluation Context", () => {
    it("should map the entire AnalyticsComputationResult directly", () => {
      const sources = createMockSources({
        analyticsResult: {
          userId: "user_123",
          profylScore: 820,
          tier: Tier.STRONG,
          githubScore: 85,
          projectsScore: 80,
          leetcodeScore: 75,
          consistencyScore: 90,
          radar: {
            buildActivity: 85,
            technicalRange: 80,
            problemSolving: 75,
            consistency: 90,
            openSource: 60,
          },
          signalBreakdown: {
            github: 85.5,
            projects: 80,
            leetcode: 75,
            consistency: 90,
          },
          components: {
            buildActivity: {
              score: 85,
              contributionScore: 90.5,
              activeProjectScore: 80,
            },
            technicalRange: {
              score: 80,
              signals: ["Frontend", "Backend"],
            },
            problemSolving: {
              score: 75,
              volumeScore: 78,
              difficultyScore: 72,
              contestScore: 80,
            },
            consistency: {
              score: 90,
              githubConsistency: 92,
              leetcodeConsistency: 88,
              githubActiveWeekScore: 95,
              githubGapScore: 90,
              leetcodeActiveDayScore: 85,
              leetcodeGapScore: 92,
            },
            openSource: {
              score: 60,
              contributionScore: 65,
              starsScore: 55,
              forksScore: 50,
              impactScore: 62,
            },
          },
          featuredAnalysis: {
            repositories: [],
            totalRepositories: 0,
            analyzedRepositories: 0,
          },
        },
      });

      const context = buildAIContext(sources);

      expect(context.evaluation).toEqual({
        profylScore: 820,
        tier: "STRONG",
        radar: {
          buildActivity: 85,
          technicalRange: 80,
          problemSolving: 75,
          consistency: 90,
          openSource: 60,
        },
        signalBreakdown: {
          github: 85.5,
          projects: 80,
          leetcode: 75,
          consistency: 90,
        },
        components: {
          buildActivity: {
            score: 85,
            contributionScore: 90.5,
            activeProjectScore: 80,
          },
          technicalRange: {
            score: 80,
            signals: ["Frontend", "Backend"],
          },
          problemSolving: {
            score: 75,
            volumeScore: 78,
            difficultyScore: 72,
            contestScore: 80,
          },
          consistency: {
            score: 90,
            githubConsistency: 92,
            leetcodeConsistency: 88,
            githubActiveWeekScore: 95,
            githubGapScore: 90,
            leetcodeActiveDayScore: 85,
            leetcodeGapScore: 92,
          },
          openSource: {
            score: 60,
            contributionScore: 65,
            starsScore: 55,
            forksScore: 50,
            impactScore: 62,
          },
        },
      });
    });

    it("should preserve null values in evaluation components", () => {
      const sources = createMockSources(); // Default uses nulls for projects/radar
      const context = buildAIContext(sources);

      expect(context.evaluation.profylScore).toBeNull();
      expect(context.evaluation.tier).toBeNull();
      expect(context.evaluation.radar.technicalRange).toBeNull();
      expect(context.evaluation.components.technicalRange).toBeNull();
    });
  });

  describe("GitHub Context", () => {
    it("should correctly map and derive GitHub metrics and activity patterns", () => {
      const sources = createMockSources({
        githubCache: {
          id: "cache_123",
          userId: "user_123",
          followers: 12,
          following: 10,
          publicRepoCount: 15,
          totalContributionsLastYear: 450,
          longestStreak: 18,
          activeWeeks: 35,
          ossPrsMerged: 8,
          starsEarned: 24,
          forksEarned: 6,
          languageDistribution: { TypeScript: 70, JavaScript: 30 },
          contributionCalendar: {
            weeks: [
              {
                firstDay: "2026-08-01",
                days: [
                  { date: "2026-08-01", count: 2, weekday: 6 },
                  { date: "2026-08-02", count: 3, weekday: 0 },
                ],
              },
              {
                firstDay: "2026-08-08",
                days: [
                  { date: "2026-08-08", count: 0, weekday: 6 },
                  { date: "2026-08-09", count: 0, weekday: 0 },
                ],
              },
              {
                firstDay: "2026-08-15",
                days: [
                  { date: "2026-08-15", count: 5, weekday: 6 },
                ],
              },
              {
                firstDay: "2026-08-22",
                days: [
                  { date: "2026-08-22", count: 10, weekday: 6 },
                ],
              },
            ],
          } as any,
          lastSyncedAt: new Date(),
          cacheExpiresAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      const context = buildAIContext(sources);

      expect(context.github.contributionsLastYear).toBe(450);
      expect(context.github.publicRepositories).toBe(15);
      expect(context.github.activeWeeks).toBe(35);
      expect(context.github.longestStreak).toBe(18);
      expect(context.github.ossPrsMerged).toBe(8);
      expect(context.github.starsEarned).toBe(24);
      expect(context.github.forksEarned).toBe(6);
      expect(context.github.languageDistribution).toEqual({
        TypeScript: 70,
        JavaScript: 30,
      });

      // Activity pattern checks
      const pattern = context.github.activityPattern;
      expect(pattern).toBeDefined();
      expect(pattern?.activeWeeks).toBe(3); // 3 weeks have count > 0
      expect(pattern?.totalWeeks).toBe(4);
      expect(pattern?.longestInactiveGap).toBe(1); // 1 week gap
      
      // recentActivity: last4Weeks has all weeks (sum: 2+3 + 0 + 5 + 10 = 20)
      // previous4Weeks is empty/0
      expect(pattern?.recentActivity?.last4Weeks).toBe(20);
      expect(pattern?.recentActivity?.previous4Weeks).toBe(0);
    });
  });

  describe("LeetCode Context", () => {
    it("should correctly map and derive LeetCode metrics and activity patterns", () => {
      const sources = createMockSources({
        leetcodeCache: {
          id: "cache_lc",
          userId: "user_123",
          username: "lc_user",
          problemsSolved: 320,
          easySolved: 100,
          mediumSolved: 180,
          hardSolved: 40,
          percentile: 88.5,
          contestsParticipated: 12,
          contestRating: 1650,
          overallRanking: 23000,
          contestGlobalRanking: 1500,
          ratingHistory: [
            {
              attended: true,
              rating: 1540.2, // Decimals should not be rounded in context builder
              contest: { title: "Contest 1", startTime: 1756813600 },
            },
            {
              attended: false,
              rating: 1560,
              contest: { title: "Contest 2", startTime: 1757813600 },
            },
            {
              attended: true,
              rating: 1650.5,
              contest: { title: "Contest 3", startTime: 1758813600 },
            },
          ] as any,
          submissionCalendar: {},
          normalizedSubmissionCalendar: {
            startDate: "2026-08-01",
            endDate: "2026-08-07",
            days: [
              { date: "2026-08-01", count: 1, weekday: 6, level: 1 },
              { date: "2026-08-02", count: 0, weekday: 0, level: 0 },
              { date: "2026-08-03", count: 3, weekday: 1, level: 2 },
              { date: "2026-08-04", count: 2, weekday: 2, level: 1 },
              { date: "2026-08-05", count: 0, weekday: 3, level: 0 },
              { date: "2026-08-06", count: 0, weekday: 4, level: 0 },
              { date: "2026-08-07", count: 5, weekday: 5, level: 2 },
            ],
          } as any,
          verificationToken: null,
          verificationTokenExpiresAt: null,
          verifiedAt: new Date(),
          lastSyncedAt: new Date(),
          cacheExpiresAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      const context = buildAIContext(sources);

      expect(context.leetcode.problemsSolved).toBe(320);
      expect(context.leetcode.easySolved).toBe(100);
      expect(context.leetcode.mediumSolved).toBe(180);
      expect(context.leetcode.hardSolved).toBe(40);
      expect(context.leetcode.percentile).toBe(88.5);

      // Contest availability and rating history checks
      expect(context.leetcode.contest?.available).toBe(true);
      expect(context.leetcode.contest?.rating).toBe(1650);
      expect(context.leetcode.contest?.contestsParticipated).toBe(12);

      // History must: filter attended = false, convert Unix seconds to yyyy-MM-dd, keep original floats
      const ratingHistory = context.leetcode.contest?.ratingHistory;
      expect(ratingHistory).toHaveLength(2);
      expect(ratingHistory?.[0]).toEqual({
        date: new Date(1756813600 * 1000).toISOString().split("T")[0],
        rating: 1540.2, // Decimals preserved!
      });
      expect(ratingHistory?.[1]).toEqual({
        date: new Date(1758813600 * 1000).toISOString().split("T")[0],
        rating: 1650.5,
      });

      // LeetCode activity pattern checks
      const pattern = context.leetcode.activityPattern;
      expect(pattern).toBeDefined();
      expect(pattern?.activeDays).toBe(4);
      expect(pattern?.totalDays).toBe(7);
      expect(pattern?.longestInactiveGap).toBe(2); // Aug 5 and 6
      expect(pattern?.longestStreak).toBe(2); // Aug 3 and 4
      
      // recentActivity checks
      expect(pattern?.recentActivity?.last30Days).toBe(1 + 0 + 3 + 2 + 0 + 0 + 5);
      expect(pattern?.recentActivity?.previous30Days).toBe(0);
    });

    it("should handle absent contest details appropriately", () => {
      const sources = createMockSources({
        leetcodeCache: {
          id: "cache_lc",
          userId: "user_123",
          username: "lc_user",
          problemsSolved: 0,
          easySolved: 0,
          mediumSolved: 0,
          hardSolved: 0,
          percentile: null,
          contestRating: null, // Null indicates unavailable
          contestsParticipated: null,
          overallRanking: null,
          contestGlobalRanking: null,
          ratingHistory: null,
          submissionCalendar: {},
          normalizedSubmissionCalendar: null,
          verificationToken: null,
          verificationTokenExpiresAt: null,
          verifiedAt: new Date(),
          lastSyncedAt: new Date(),
          cacheExpiresAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      const context = buildAIContext(sources);

      expect(context.leetcode.contest?.available).toBe(false);
      expect(context.leetcode.contest?.rating).toBeNull();
      expect(context.leetcode.contest?.contestsParticipated).toBeNull();
      expect(context.leetcode.contest?.ratingHistory).toEqual([]);
    });
  });

  describe("Projects Context", () => {
    it("should correctly map and normalize featured repositories", () => {
      const sources = createMockSources({
        featuredRepositories: [
          {
            id: "repo_1",
            userId: "user_123",
            githubRepoId: "111",
            name: "repo-name-1",
            description: "Default description",
            stars: 10,
            forks: 2,
            primaryLanguage: "TypeScript",
            topics: ["react", "nextjs"] as any,
            githubUrl: "https://github.com/testuser/repo-name-1",
            homepageUrl: "https://homepage-url.com",
            defaultBranch: "main",
            isFork: false,
            isArchived: false,
            isFeatured: true,
            displayOrder: 1,
            customTitle: "Custom Project Title",
            customDescription: "Custom description override",
            liveDemoUrl: "https://livedemo-url.com",
            projectSummary: null,
            detectedSignals: ["Frontend", "Backend"] as any,
            detectedTechnologies: [{ name: "Next.js", signals: ["Frontend"] }] as any,
            readme: "# My Project README content",
            lastSyncedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
            githubUpdatedAt: new Date(),
          },
          {
            id: "repo_2",
            userId: "user_123",
            githubRepoId: "222",
            name: "repo-name-2",
            description: "Default description 2",
            stars: 0,
            forks: 0,
            primaryLanguage: null,
            topics: null,
            githubUrl: "https://github.com/testuser/repo-name-2",
            homepageUrl: "https://fallback-homepage.com",
            defaultBranch: "main",
            isFork: false,
            isArchived: false,
            isFeatured: true,
            displayOrder: 2,
            customTitle: null,
            customDescription: null,
            liveDemoUrl: null,
            projectSummary: null,
            detectedSignals: null,
            detectedTechnologies: null,
            readme: null,
            lastSyncedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
            githubUpdatedAt: new Date(),
          },
        ],
        analyticsResult: {
          userId: "user_123",
          profylScore: null,
          tier: null,
          githubScore: 0,
          projectsScore: null,
          leetcodeScore: 0,
          consistencyScore: 0,
          radar: {
            buildActivity: 0,
            technicalRange: null,
            problemSolving: 0,
            consistency: 0,
            openSource: 0,
          },
          signalBreakdown: {
            github: 0,
            projects: null,
            leetcode: 0,
            consistency: 0,
          },
          components: {
            buildActivity: { score: 0, contributionScore: null, activeProjectScore: null },
            technicalRange: null,
            problemSolving: { score: 0, volumeScore: 0, difficultyScore: 0, contestScore: null },
            consistency: {
              score: 0,
              githubConsistency: null,
              leetcodeConsistency: null,
              githubActiveWeekScore: null,
              githubGapScore: null,
              leetcodeActiveDayScore: null,
              leetcodeGapScore: null,
            },
            openSource: { score: 0, contributionScore: 0, starsScore: 0, forksScore: 0, impactScore: 0 },
          },
          featuredAnalysis: {
            // Mock repository analysis result inside featuredAnalysis
            repositories: [
              {
                repositoryId: "repo_1",
                parsedManifests: [],
                artifacts: [],
                technologies: [
                  { technologyId: "nextjs", name: "Next.js", signals: ["Frontend"], evidence: [] },
                  { technologyId: "prisma", name: "Prisma", signals: ["Backend", "Database"], evidence: [] },
                ],
                outcome: "analyzed",
              },
            ],
            totalRepositories: 2,
            analyzedRepositories: 1,
          },
        },
      });

      const context = buildAIContext(sources);

      expect(context.projects).toHaveLength(2);

      // Project 1 validations: override checks, liveDemo precedence, technologies/signals aggregation from featuredAnalysis
      const p1 = context.projects[0];
      expect(p1?.id).toBe("repo_1");
      expect(p1?.title).toBe("Custom Project Title"); // Custom overrides name
      expect(p1?.description).toBe("Custom description override"); // Custom overrides description
      expect(p1?.primaryLanguage).toBe("TypeScript");
      expect(p1?.topics).toEqual(["react", "nextjs"]);
      expect(p1?.stars).toBe(10);
      expect(p1?.forks).toBe(2);
      expect(p1?.projectUrl).toBe("https://livedemo-url.com"); // Precedence over homepage
      expect(p1?.projectUrlSource).toBe("liveDemo");
      expect(p1?.technologies).toEqual(["Next.js", "Prisma"]);
      expect(p1?.signals).toEqual(["Frontend", "Backend", "Database"]);
      expect(p1?.analysisOutcome).toBe("analyzed");
      expect(p1?.readme).toBe("# My Project README content");

      // Project 2 validations: fallback checks, homepage URL, fallback technologies from db fields
      const p2 = context.projects[1];
      expect(p2?.id).toBe("repo_2");
      expect(p2?.title).toBe("repo-name-2"); // Fallback to name
      expect(p2?.description).toBe("Default description 2"); // Fallback to description
      expect(p2?.primaryLanguage).toBeUndefined();
      expect(p2?.topics).toBeUndefined();
      expect(p2?.stars).toBe(0);
      expect(p2?.forks).toBe(0);
      expect(p2?.projectUrl).toBe("https://fallback-homepage.com"); // Homepage URL fallback
      expect(p2?.projectUrlSource).toBe("homepage");
      expect(p2?.technologies).toEqual([]);
      expect(p2?.signals).toEqual([]);
      expect(p2?.analysisOutcome).toBe("unsupported"); // fallback outcome
      expect(p2?.readme).toBeUndefined();
    });

    it("should enforce a 6000-character bounding on project READMEs", () => {
      const longReadme = "# README\n" + "A".repeat(7000);
      const sources = createMockSources({
        featuredRepositories: [
          {
            id: "repo_1",
            userId: "user_123",
            githubRepoId: "111",
            name: "repo-name-1",
            description: null,
            stars: 0,
            forks: 0,
            primaryLanguage: null,
            topics: null,
            githubUrl: "https://github.com/testuser/repo-name-1",
            homepageUrl: null,
            defaultBranch: "main",
            isFork: false,
            isArchived: false,
            isFeatured: true,
            displayOrder: 1,
            customTitle: null,
            customDescription: null,
            liveDemoUrl: null,
            projectSummary: null,
            detectedSignals: null,
            detectedTechnologies: null,
            readme: longReadme,
            lastSyncedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
            githubUpdatedAt: new Date(),
          },
        ],
      });

      const context = buildAIContext(sources);
      const p1 = context.projects[0];
      
      expect(p1?.readme).toHaveLength(6000);
      expect(p1?.readme?.endsWith("A")).toBe(true);
    });
  });

  describe("AIContext Invalidation Rules", () => {
    it("should change context when a featured project's custom title or custom description changes", () => {
      const baseSources = createMockSources({
        featuredRepositories: [
          {
            id: "repo_1",
            githubRepoId: "123",
            userId: "user_123",
            name: "repo-name",
            stars: 10,
            forks: 5,
            primaryLanguage: "TypeScript",
            githubUrl: "https://github.com/user/repo",
            homepageUrl: null,
            isFork: false,
            isArchived: false,
            isFeatured: true,
            displayOrder: 1,
            customTitle: "Original Title",
            customDescription: "Original Description",
            lastSyncedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
            githubUpdatedAt: new Date(),
            defaultBranch: "main",
            detectedSignals: null,
            detectedTechnologies: null,
            readme: null,
            projectSummary: null,
          },
        ],
      });

      const updatedSources = createMockSources({
        featuredRepositories: [
          {
            ...baseSources.featuredRepositories[0],
            customTitle: "Updated Title",
          },
        ],
      });

      const context1 = buildAIContext(baseSources);
      const context2 = buildAIContext(updatedSources);

      expect(context1).not.toEqual(context2);
      expect(context2.projects[0].title).toBe("Updated Title");
    });

    it("should change context when featured project selection or order changes", () => {
      const r1 = {
        id: "repo_1",
        githubRepoId: "123",
        userId: "user_123",
        name: "repo-1",
        stars: 10,
        forks: 5,
        primaryLanguage: "TypeScript",
        githubUrl: "https://github.com/user/repo-1",
        homepageUrl: null,
        isFork: false,
        isArchived: false,
        isFeatured: true,
        displayOrder: 1,
        customTitle: null,
        customDescription: null,
        lastSyncedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        githubUpdatedAt: new Date(),
        defaultBranch: "main",
        detectedSignals: null,
        detectedTechnologies: null,
        readme: null,
        projectSummary: null,
      };

      const r2 = {
        ...r1,
        id: "repo_2",
        githubRepoId: "456",
        name: "repo-2",
        displayOrder: 2,
      };

      const baseSources = createMockSources({
        featuredRepositories: [r1, r2],
      });

      const updatedSources = createMockSources({
        featuredRepositories: [
          { ...r2, displayOrder: 1 },
          { ...r1, displayOrder: 2 },
        ],
      });

      const context1 = buildAIContext(baseSources);
      const context2 = buildAIContext(updatedSources);

      expect(context1).not.toEqual(context2);
    });

    it("should change context when GitHub or LeetCode cached metrics change", () => {
      const baseSources = createMockSources({
        githubCache: {
          id: "gh_123",
          userId: "user_123",
          followers: 10,
          following: 10,
          publicRepoCount: 5,
          totalContributionsLastYear: 100,
          contributionCalendar: { weeks: [] },
          activeWeeks: 10,
          longestStreak: 5,
          ossPrsMerged: 2,
          starsEarned: 20,
          forksEarned: 5,
          languageDistribution: { TypeScript: 80 },
          lastSyncedAt: new Date(),
          cacheExpiresAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      const updatedSources = createMockSources({
        ...baseSources,
        githubCache: {
          ...baseSources.githubCache!,
          totalContributionsLastYear: 120,
        },
      });

      const context1 = buildAIContext(baseSources);
      const context2 = buildAIContext(updatedSources);

      expect(context1).not.toEqual(context2);
      expect(context2.github.contributionsLastYear).toBe(120);
    });

    it("should change context when analytics metrics change", () => {
      const baseSources = createMockSources({
        analyticsResult: {
          userId: "user_123",
          profylScore: 750,
          tier: Tier.STRONG,
          githubScore: 80,
          projectsScore: 70,
          leetcodeScore: 60,
          consistencyScore: 90,
          radar: { buildActivity: 80, technicalRange: 75, problemSolving: 85, consistency: 90, openSource: 50 },
          signalBreakdown: { github: 80, projects: 75, leetcode: 85, consistency: 90 },
          components: {
            buildActivity: { score: 80, contributionScore: 85, activeProjectScore: 75 },
            technicalRange: { score: 75, signals: ["Frontend"] },
            problemSolving: { score: 85, volumeScore: 90, difficultyScore: 80, contestScore: 85 },
            consistency: { score: 90, githubConsistency: 92, leetcodeConsistency: 88, githubActiveWeekScore: 95, githubGapScore: 90, leetcodeActiveDayScore: 85, leetcodeGapScore: 92 },
            openSource: { score: 50, contributionScore: 55, starsScore: 45, forksScore: 40, impactScore: 50 },
          },
          featuredAnalysis: { repositories: [], totalRepositories: 0, analyzedRepositories: 0 },
        },
      });

      const updatedSources = createMockSources({
        ...baseSources,
        analyticsResult: {
          ...baseSources.analyticsResult,
          profylScore: 780,
        },
      });

      const context1 = buildAIContext(baseSources);
      const context2 = buildAIContext(updatedSources);

      expect(context1).not.toEqual(context2);
      expect(context2.evaluation.profylScore).toBe(780);
    });
  });
});
