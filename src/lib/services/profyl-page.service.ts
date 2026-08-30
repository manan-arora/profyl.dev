import { prisma } from "@/lib/prisma";
import { ProfylPageData, ProfylProject } from "@/types/profyl-page";
import { DetectedTechnology } from "@/lib/analytics/repository-analysis/technologies/technology-types";

/**
 * Parsed AI evidence string (period-separated sentence list) to string[] preserving original punctuation.
 */
export function parseEvidence(evidenceStr: string | null | undefined): string[] {
  if (!evidenceStr) return [];
  return evidenceStr
    .split(/\.\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => (s.endsWith(".") ? s : s + "."));
}

/**
 * Unified read layer that aggregates and formats User, Profile, Repository, GitHubCache, LeetCodeCache, Analytics, and AIInsights tables.
 * Employs cold-start checks, precedence logic, monthly contributions derivation, and charting formats.
 *
 * @param params - Query parameters containing either userId or slug.
 * @returns Formatted ProfylPageData object or null if user is not found.
 */
export async function getProfylPageData(params: {
  userId?: string;
  slug?: string;
}): Promise<ProfylPageData | null> {
  const { userId, slug } = params;

  if (!userId && !slug) {
    return null;
  }

  // Retrieve user with joined records
  const user = await prisma.user.findUnique({
    where: userId ? { id: userId } : { slug: slug },
    include: {
      profile: true,
      githubCache: true,
      leetcodeCache: true,
      analytics: true,
      aiInsights: true,
      repositories: true,
    },
  });

  if (!user) {
    return null;
  }

  const {
    profile,
    githubCache,
    leetcodeCache,
    analytics,
    aiInsights,
    repositories,
  } = user;

  // 1. Resolve Identity Precedence
  const name = profile?.name ?? user.githubUsername;
  const avatarUrl = user.avatarUrl; // direct value, no fallback strings

  const githubUrl = `https://github.com/${user.githubUsername}`;
  const leetcodeUrl = leetcodeCache?.username
    ? `https://leetcode.com/${leetcodeCache.username}`
    : null;

  // 2. Count Featured Projects
  const featuredRepos = repositories
    .filter((repo) => repo.isFeatured)
    .sort((a, b) => {
      if (a.displayOrder === null || a.displayOrder === undefined) return 1;
      if (b.displayOrder === null || b.displayOrder === undefined) return -1;
      return a.displayOrder - b.displayOrder;
    });

  const projects: ProfylProject[] = featuredRepos.map((repo) => ({
    id: repo.id,
    name: repo.customTitle ?? repo.name,
    description: repo.customDescription ?? repo.description,
    stars: repo.stars,
    primaryLanguage: repo.primaryLanguage,
    detectedTechnologies: Array.isArray(repo.detectedTechnologies)
      ? (repo.detectedTechnologies as unknown as DetectedTechnology[])
      : [],
    topics: Array.isArray(repo.topics) ? (repo.topics as string[]) : [],
    githubUrl: repo.githubUrl,
    liveDemoUrl: repo.liveDemoUrl,
    projectSummary: repo.projectSummary,
  }));

  // Aggregate Under the Hood metrics
  const techNamesSet = new Set<string>();
  const capabilityCounts: Record<string, number> = {};

  featuredRepos.forEach((repo) => {
    // 1. Technologies
    const repoTechs = Array.isArray(repo.detectedTechnologies)
      ? (repo.detectedTechnologies as unknown as DetectedTechnology[])
      : [];
    repoTechs.forEach((t) => {
      if (t.name) {
        techNamesSet.add(t.name);
      }
    });

    // 2. Capabilities/Signals
    const repoSignals = Array.isArray(repo.detectedSignals)
      ? (repo.detectedSignals as unknown as string[])
      : [];
    repoSignals.forEach((sig) => {
      if (sig) {
        capabilityCounts[sig] = (capabilityCounts[sig] || 0) + 1;
      }
    });
  });

  const underTheHood = {
    capabilities: Object.entries(capabilityCounts)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label)),
    technologies: Array.from(techNamesSet).sort((a, b) => a.localeCompare(b)),
  };

  // 3. Cold Start Percentile Logic
  const totalUserCount = await prisma.user.count();
  const percentile =
    totalUserCount >= 100 &&
    analytics?.profylPercentile !== null &&
    analytics?.profylPercentile !== undefined
      ? Math.round(analytics.profylPercentile)
      : null;

  // 4. Map Analytics Radar
  const rawRadar = (analytics?.radar as Record<string, any>) || {};
  const radar = [
    { subject: "Build Activity", value: Number(rawRadar.buildActivity) || 0 },
    { subject: "Technical Range", value: Number(rawRadar.technicalRange) || 0 },
    { subject: "Problem Solving", value: Number(rawRadar.problemSolving) || 0 },
    { subject: "Consistency", value: Number(rawRadar.consistency) || 0 },
    { subject: "Open Source", value: Number(rawRadar.openSource) || 0 },
  ];

  // 5. Map Signal Breakdown
  const rawBreakdown = (analytics?.signalBreakdown as Record<string, any>) || {};
  const signalBreakdown = [
    { name: "GitHub", value: Number(rawBreakdown.github) || 0 },
    { name: "Projects", value: Number(rawBreakdown.projects) || 0 },
    { name: "LeetCode", value: Number(rawBreakdown.leetcode) || 0 },
    { name: "Consistency", value: Number(rawBreakdown.consistency) || 0 },
  ];

  // 6. Map AI Content
  const ai = {
    signal: aiInsights?.aiSignal ?? null,
    summary: aiInsights?.aiSummary ?? null,
    evidence: parseEvidence(aiInsights?.aiEvidence),
    strengthChips: Array.isArray(aiInsights?.strengthChips)
      ? (aiInsights.strengthChips as string[])
      : [],
  };

  // 7. Map GitHub Contributions & Monthly Series
  const calendar = (githubCache?.contributionCalendar as any) || null;
  const monthlyContributionGroups: Record<string, number> = {};

  if (calendar && Array.isArray(calendar.weeks)) {
    calendar.weeks.forEach((week: any) => {
      if (week && Array.isArray(week.days)) {
        week.days.forEach((day: any) => {
          if (day && day.date) {
            const monthKey = day.date.substring(0, 7); // YYYY-MM
            monthlyContributionGroups[monthKey] =
              (monthlyContributionGroups[monthKey] || 0) + (day.count || 0);
          }
        });
      }
    });
  }

  const sortedMonthKeys = Object.keys(monthlyContributionGroups).sort();
  const monthlyContributionSeries = sortedMonthKeys.map((key) => {
    const [year, monthStr] = key.split("-");
    const date = new Date(parseInt(year), parseInt(monthStr) - 1, 1);
    const monthName = date.toLocaleString("en-US", { month: "short" });
    return {
      month: monthName,
      contributions: monthlyContributionGroups[key],
    };
  });

  // Language Distribution sorted by percentage DESC
  const languageDistribution: { language: string; percentage: number }[] = [];
  if (githubCache?.languageDistribution && typeof githubCache.languageDistribution === "object") {
    Object.entries(githubCache.languageDistribution).forEach(([lang, pct]) => {
      if (typeof pct === "number") {
        languageDistribution.push({ language: lang, percentage: pct });
      }
    });
  }
  languageDistribution.sort((a, b) => b.percentage - a.percentage);

  const github = {
    contributionCalendar: calendar,
    totalContributionsLast12Months: githubCache?.totalContributionsLastYear ?? null,
    ossPrsMerged: githubCache?.ossPrsMerged ?? null,
    starsEarned: githubCache?.starsEarned ?? null,
    longestStreak: githubCache?.longestStreak ?? null,
    activeWeeks: githubCache?.activeWeeks ?? null,
    languageDistribution,
    monthlyContributionSeries,
  };

  // 8. Map LeetCode History & Distribution
  const difficultyDistribution = {
    easy: leetcodeCache?.easySolved ?? 0,
    medium: leetcodeCache?.mediumSolved ?? 0,
    hard: leetcodeCache?.hardSolved ?? 0,
  };

  const ratingHistoryPoints: { contest: string; rating: number }[] = [];
  if (leetcodeCache && Array.isArray(leetcodeCache.ratingHistory)) {
    // Sort and format rating history
    const sortedHistory = [...leetcodeCache.ratingHistory].sort((a: any, b: any) => {
      const timeA = a?.contest?.startTime || 0;
      const timeB = b?.contest?.startTime || 0;
      return timeA - timeB;
    });

    sortedHistory.forEach((item: any) => {
      if (item && typeof item === "object" && item.attended !== false) {
        const rating = item.rating;
        if (typeof rating === "number" && !Number.isNaN(rating)) {
          let title = item.contest?.title || "";
          if (!title && item.contest?.startTime) {
            title = new Date(item.contest.startTime * 1000).toLocaleDateString("en-US", {
              month: "short",
              year: "2-digit",
            });
          }
          ratingHistoryPoints.push({
            contest: title,
            rating: Math.round(rating),
          });
        }
      }
    });
  }

  const leetcode = {
    contestRating: leetcodeCache?.contestRating ?? null,
    overallRank: leetcodeCache?.overallRanking ?? null,
    problemsSolved: leetcodeCache?.problemsSolved ?? null,
    contestsParticipated: leetcodeCache?.contestsParticipated ?? null,
    difficultyDistribution,
    ratingHistory: ratingHistoryPoints,
  };

  const quantifiedSignals = {
    leetcodeProblemsSolved: leetcodeCache?.problemsSolved ?? null,
    leetcodePercentile: leetcodeCache?.percentile ?? null,
    leetcodeContestRating: leetcodeCache?.contestRating ?? null,
    githubContributionsLast12Months: githubCache?.totalContributionsLastYear ?? null,
    githubPublicRepositories: githubCache?.publicRepoCount ?? null,
    connectedProjects: projects.length,
  };

  return {
    underTheHood,
    identity: {
      avatarUrl,
      name,
      currentRole: profile?.currentRole ?? null,
      currentCompany: profile?.currentCompany ?? null,
      location: profile?.location ?? null,
      yearsExperience: profile?.yearsExperience ?? null,
      bio: profile?.bio ?? null,
      githubUrl,
      leetcodeUrl,
      linkedinUrl: profile?.linkedinUrl ?? null,
      portfolioUrl: profile?.portfolioUrl ?? null,
      resumeUrl: profile?.resumeUrl ?? null,
      college: profile?.college ?? null,
      degree: profile?.degree ?? null,
      branch: profile?.branch ?? null,
      graduationYear: profile?.graduationYear ?? null,
      email: user.email,
      techStack: Array.isArray(profile?.techStack) ? (profile.techStack as string[]) : [],
    },
    evaluation: {
      profylScore: analytics?.profylScore ?? null,
      tier: analytics?.tier
        ? analytics.tier.charAt(0) + analytics.tier.slice(1).toLowerCase()
        : null,
      percentile,
      radar,
      signalBreakdown,
    },
    ai,
    quantifiedSignals,
    projects,
    github,
    leetcode,
  };
}
