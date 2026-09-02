import { prisma } from "@/lib/prisma";
import {
  User,
  Profile,
  GitHubCache,
  LeetCodeCache,
  Repository,
  Tier,
} from "@/generated/prisma/client";
import { AnalyticsComputationResult } from "../analytics/analytics-engine";
import {
  analyzeGithubCalendar,
  analyzeLeetcodeCalendar,
} from "../analytics/calendar-analysis";
import { LeetcodeContestHistoryItem } from "@/types/leetcode";
import { getGithubAccessToken } from "@/lib/auth/oauth";
import { getGithubReadme } from "@/lib/github/client";

export interface EvaluationAIContext {
  profylScore: number | null;
  tier: Tier | null;

  radar: {
    buildActivity: number;
    technicalRange: number | null;
    problemSolving: number;
    consistency: number;
    openSource: number;
  };

  signalBreakdown: {
    github: number;
    projects: number | null;
    leetcode: number;
    consistency: number;
  };

  components: {
    buildActivity: {
      score: number;
      contributionScore: number | null;
      activeProjectScore: number | null;
    };

    technicalRange: {
      score: number;
      signals: string[];
    } | null;

    problemSolving: {
      score: number;
      volumeScore: number;
      difficultyScore: number;
      contestScore: number | null;
    };

    consistency: {
      score: number;
      githubConsistency: number | null;
      leetcodeConsistency: number | null;
      githubActiveWeekScore: number | null;
      githubGapScore: number | null;
      leetcodeActiveDayScore: number | null;
      leetcodeGapScore: number | null;
    };

    openSource: {
      score: number;
      contributionScore: number;
      starsScore: number;
      forksScore: number;
      impactScore: number;
    };
  };
}

export interface GitHubActivityPattern {
  activeWeeks?: number;
  totalWeeks?: number;
  longestStreak?: number;
  longestInactiveGap?: number;

  recentActivity?: {
    last4Weeks?: number;
    previous4Weeks?: number;
  };
}

export interface GitHubAIContext {
  contributionsLastYear?: number;
  publicRepositories?: number;

  activeWeeks?: number;
  longestStreak?: number;

  ossPrsMerged?: number;
  starsEarned?: number;
  forksEarned?: number;

  languageDistribution?: unknown;

  activityPattern?: GitHubActivityPattern;
}

export interface LeetCodeRatingPoint {
  date: string;
  rating: number;
}

export interface LeetCodeActivityPattern {
  activeDays?: number;
  totalDays?: number;
  longestStreak?: number;
  longestInactiveGap?: number;

  recentActivity?: {
    last30Days?: number;
    previous30Days?: number;
  };
}

export interface LeetCodeAIContext {
  problemsSolved?: number;
  easySolved?: number;
  mediumSolved?: number;
  hardSolved?: number;

  percentile?: number | null;

  contest?: {
    available: boolean;
    rating?: number | null;
    contestsParticipated?: number | null;
    ratingHistory?: LeetCodeRatingPoint[];
  };

  activityPattern?: LeetCodeActivityPattern;
}

export interface ProjectAIContext {
  id: string;

  title?: string;
  description?: string;

  primaryLanguage?: string;
  topics?: string[];

  stars?: number;
  forks?: number;

  projectUrl?: string | null;
  projectUrlSource?: "liveDemo" | "homepage" | null;

  technologies: string[];
  signals: string[];

  analysisOutcome: "analyzed" | "unsupported" | "failed";

  readme?: string | null;
}

export interface AIContext {
  evaluation: EvaluationAIContext;
  github: GitHubAIContext;
  leetcode: LeetCodeAIContext;
  projects: ProjectAIContext[];
}

export interface AIContextSources {
  user: User;
  profile: Profile | null;
  githubCache: GitHubCache | null;
  leetcodeCache: LeetCodeCache | null;
  featuredRepositories: Repository[];
  analyticsResult: AnalyticsComputationResult;
}

const MAX_README_CHARS_PER_PROJECT = 6000;

function boundReadme(readme?: string | null): string | null {
  if (!readme) return null;
  if (readme.length > MAX_README_CHARS_PER_PROJECT) {
    return readme.substring(0, MAX_README_CHARS_PER_PROJECT);
  }
  return readme;
}

/**
 * Pure, deterministic transformer that converts raw sources into structured AIContext.
 */
export function buildAIContext(sources: AIContextSources): AIContext {
  const res = sources.analyticsResult;
  const evaluation: EvaluationAIContext = {
    profylScore: res.profylScore,
    tier: res.tier,
    radar: {
      buildActivity: res.radar.buildActivity,
      technicalRange: res.radar.technicalRange,
      problemSolving: res.radar.problemSolving,
      consistency: res.radar.consistency,
      openSource: res.radar.openSource,
    },
    signalBreakdown: {
      github: res.signalBreakdown.github,
      projects: res.signalBreakdown.projects,
      leetcode: res.signalBreakdown.leetcode,
      consistency: res.signalBreakdown.consistency,
    },
    components: {
      buildActivity: {
        score: res.components.buildActivity.score,
        contributionScore: res.components.buildActivity.contributionScore,
        activeProjectScore: res.components.buildActivity.activeProjectScore,
      },
      technicalRange: res.components.technicalRange
        ? {
            score: res.components.technicalRange.score,
            signals: res.components.technicalRange.signals,
          }
        : null,
      problemSolving: {
        score: res.components.problemSolving.score,
        volumeScore: res.components.problemSolving.volumeScore,
        difficultyScore: res.components.problemSolving.difficultyScore,
        contestScore: res.components.problemSolving.contestScore,
      },
      consistency: {
        score: res.components.consistency.score,
        githubConsistency: res.components.consistency.githubConsistency,
        leetcodeConsistency: res.components.consistency.leetcodeConsistency,
        githubActiveWeekScore: res.components.consistency.githubActiveWeekScore,
        githubGapScore: res.components.consistency.githubGapScore,
        leetcodeActiveDayScore:
          res.components.consistency.leetcodeActiveDayScore,
        leetcodeGapScore: res.components.consistency.leetcodeGapScore,
      },
      openSource: {
        score: res.components.openSource.score,
        contributionScore: res.components.openSource.contributionScore,
        starsScore: res.components.openSource.starsScore,
        forksScore: res.components.openSource.forksScore,
        impactScore: res.components.openSource.impactScore,
      },
    },
  };

  const githubCache = sources.githubCache;
  const github: GitHubAIContext = {};

  if (githubCache) {
    github.contributionsLastYear =
      githubCache.totalContributionsLastYear ?? undefined;
    github.publicRepositories = githubCache.publicRepoCount ?? undefined;
    github.activeWeeks = githubCache.activeWeeks ?? undefined;
    github.longestStreak = githubCache.longestStreak ?? undefined;
    github.ossPrsMerged = githubCache.ossPrsMerged ?? undefined;
    github.starsEarned = githubCache.starsEarned ?? undefined;
    github.forksEarned = githubCache.forksEarned ?? undefined;
    github.languageDistribution = githubCache.languageDistribution ?? undefined;

    const calendar = githubCache.contributionCalendar as any;
    const consistency = analyzeGithubCalendar(calendar);

    let recentActivity:
      | { last4Weeks?: number; previous4Weeks?: number }
      | undefined = undefined;
    if (calendar && Array.isArray(calendar.weeks)) {
      const weeks = calendar.weeks;
      const len = weeks.length;

      let last4Count = 0;
      for (let i = Math.max(0, len - 4); i < len; i++) {
        const days = weeks[i]?.days || [];
        for (const d of days) {
          last4Count += d.count || 0;
        }
      }

      let prev4Count = 0;
      for (let i = Math.max(0, len - 8); i < Math.max(0, len - 4); i++) {
        const days = weeks[i]?.days || [];
        for (const d of days) {
          prev4Count += d.count || 0;
        }
      }

      recentActivity = {
        last4Weeks: last4Count,
        previous4Weeks: prev4Count,
      };
    }

    github.activityPattern = {
      activeWeeks: consistency.activePeriods,
      totalWeeks: consistency.totalPeriods,
      longestStreak: githubCache.longestStreak ?? undefined,
      longestInactiveGap: consistency.longestInactiveGap,
      recentActivity,
    };
  }

  const leetcodeCache = sources.leetcodeCache;
  const leetcode: LeetCodeAIContext = {};

  if (leetcodeCache) {
    leetcode.problemsSolved = leetcodeCache.problemsSolved ?? undefined;
    leetcode.easySolved = leetcodeCache.easySolved ?? undefined;
    leetcode.mediumSolved = leetcodeCache.mediumSolved ?? undefined;
    leetcode.hardSolved = leetcodeCache.hardSolved ?? undefined;
    leetcode.percentile = leetcodeCache.percentile ?? undefined;

    const ratingHistory: LeetCodeRatingPoint[] = [];
    if (Array.isArray(leetcodeCache.ratingHistory)) {
      for (const item of leetcodeCache.ratingHistory as unknown as LeetcodeContestHistoryItem[]) {
        if (item && typeof item === "object") {
          if (item.attended === false) continue;

          const rating = item.rating;
          if (typeof rating !== "number" || Number.isNaN(rating)) continue;

          let dateStr = "";
          if (
            item.contest &&
            typeof item.contest === "object" &&
            typeof item.contest.startTime === "number"
          ) {
            const timestampMs = item.contest.startTime * 1000;
            dateStr = new Date(timestampMs).toISOString().split("T")[0];
          }

          if (dateStr) {
            ratingHistory.push({
              date: dateStr,
              rating: rating,
            });
          }
        }
      }
      ratingHistory.sort((a, b) => a.date.localeCompare(b.date));
    }

    const hasContestData =
      leetcodeCache.contestRating !== null &&
      leetcodeCache.contestRating !== undefined;
    leetcode.contest = {
      available: hasContestData,
      rating: hasContestData ? leetcodeCache.contestRating : null,
      contestsParticipated: hasContestData
        ? leetcodeCache.contestsParticipated
        : null,
      ratingHistory,
    };

    const leetcodeCalendar = leetcodeCache.normalizedSubmissionCalendar as any;
    const leetcodeConsistency = analyzeLeetcodeCalendar(leetcodeCalendar);

    let leetcodeRecentActivity:
      | { last30Days?: number; previous30Days?: number }
      | undefined = undefined;
    let leetcodeLongestStreak = 0;

    if (leetcodeCalendar && Array.isArray(leetcodeCalendar.days)) {
      const days = leetcodeCalendar.days;
      const len = days.length;

      let last30Count = 0;
      for (let i = Math.max(0, len - 30); i < len; i++) {
        last30Count += days[i]?.count || 0;
      }

      let prev30Count = 0;
      for (let i = Math.max(0, len - 60); i < Math.max(0, len - 30); i++) {
        prev30Count += days[i]?.count || 0;
      }

      leetcodeRecentActivity = {
        last30Days: last30Count,
        previous30Days: prev30Count,
      };

      let currentStreak = 0;
      for (const day of days) {
        if (day && typeof day.count === "number" && day.count > 0) {
          currentStreak++;
          if (currentStreak > leetcodeLongestStreak) {
            leetcodeLongestStreak = currentStreak;
          }
        } else {
          currentStreak = 0;
        }
      }
    }

    leetcode.activityPattern = {
      activeDays: leetcodeConsistency.activePeriods,
      totalDays: leetcodeConsistency.totalPeriods,
      longestStreak: leetcodeLongestStreak,
      longestInactiveGap: leetcodeConsistency.longestInactiveGap,
      recentActivity: leetcodeRecentActivity,
    };
  }

  const projects: ProjectAIContext[] = sources.featuredRepositories.map(
    (repo) => {
      const repoAnalysis = sources.analyticsResult.featuredAnalysis.repositories.find(
        (r) => r.repositoryId === repo.id
      );

      const title = repo.customTitle ?? repo.name;
      const description =
        repo.customDescription ?? repo.description ?? undefined;

      const projectUrl = repo.liveDemoUrl ?? repo.homepageUrl ?? null;
      const projectUrlSource = repo.liveDemoUrl
        ? "liveDemo"
        : repo.homepageUrl
        ? "homepage"
        : null;

      let technologies: string[] = [];
      let signals: string[] = [];
      let outcome: "analyzed" | "unsupported" | "failed" = "unsupported";

      if (repoAnalysis) {
        technologies = repoAnalysis.technologies.map((t) => t.name);
        signals = Array.from(
          new Set(repoAnalysis.technologies.flatMap((t) => t.signals))
        );
        outcome = repoAnalysis.outcome;
      } else {
        if (
          repo.detectedTechnologies &&
          Array.isArray(repo.detectedTechnologies)
        ) {
          technologies = (repo.detectedTechnologies as any[])
            .map((t) => t.name)
            .filter((t): t is string => typeof t === "string");
        }
        if (repo.detectedSignals && Array.isArray(repo.detectedSignals)) {
          signals = repo.detectedSignals.filter(
            (s): s is string => typeof s === "string"
          );
        }
        outcome = technologies.length > 0 ? "analyzed" : "unsupported";
      }

      const topics =
        repo.topics && Array.isArray(repo.topics)
          ? repo.topics.filter((t): t is string => typeof t === "string")
          : undefined;

      const readme = boundReadme(repo.readme);

      const projectContext: ProjectAIContext = {
        id: repo.id,
        title,
        description,
        primaryLanguage: repo.primaryLanguage ?? undefined,
        topics,
        stars: repo.stars,
        forks: repo.forks,
        projectUrl,
        projectUrlSource,
        technologies,
        signals,
        analysisOutcome: outcome,
      };

      if (readme !== null) {
        projectContext.readme = readme;
      }

      return projectContext;
    }
  );

  return {
    evaluation,
    github,
    leetcode,
    projects,
  };
}

/**
 * Orchestrator database loader that queries all required entities from Prisma
 * and compiles them into the expected sources format.
 * Concurrent fetching is used for missing repository README files via Promise.all.
 */
export async function loadAIContextSources(
  userId: string,
  analyticsResult: AnalyticsComputationResult
): Promise<AIContextSources> {
  const [user, profile, githubCache, leetcodeCache, featuredRepositories] =
    await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.profile.findUnique({ where: { userId } }),
      prisma.gitHubCache.findUnique({ where: { userId } }),
      prisma.leetCodeCache.findUnique({ where: { userId } }),
      prisma.repository.findMany({
        where: { userId, isFeatured: true },
        orderBy: { displayOrder: "asc" },
      }),
    ]);

  if (!user) {
    throw new Error(`User not found for ID: ${userId}`);
  }

  // Concurrently fetch README for any featured repo missing a readme field in DB
  try {
    const accessToken = await getGithubAccessToken(userId);
    if (accessToken) {
      await Promise.all(
        featuredRepositories.map(async (repo) => {
          if (!repo.readme) {
            try {
              const cleanUrl = repo.githubUrl.replace(/\/$/, "");
              const parts = cleanUrl.split("/");
              const name = parts[parts.length - 1] || repo.name;
              const owner = parts[parts.length - 2] || "";
              if (owner && name) {
                const readmeContent = await getGithubReadme(accessToken, owner, name);
                repo.readme = readmeContent;
              }
            } catch {
              // Missing README is safely ignored (defaults to null)
            }
          }
        })
      );
    }
  } catch {
    // If access token fetch fails, proceed without fetching new READMEs
  }

  return {
    user,
    profile,
    githubCache,
    leetcodeCache,
    featuredRepositories,
    analyticsResult,
  };
}
