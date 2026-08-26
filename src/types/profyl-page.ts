import { NormalizedContributionCalendar } from "./github";
import { DetectedTechnology } from "@/lib/analytics/repository-analysis/technologies/technology-types";

export type MonthlyContribution = {
  month: string;
  contributions: number;
};

export type ProfylProject = {
  id: string;
  name: string;
  description: string | null;
  stars: number;
  primaryLanguage: string | null;
  detectedTechnologies: DetectedTechnology[];
  topics: string[];
  githubUrl: string;
  liveDemoUrl: string | null;
  projectSummary: string | null;
};

export type UnderTheHoodCapability = {
  label: string;
  count: number;
};

export type ProfylPageData = {
  underTheHood: {
    capabilities: UnderTheHoodCapability[];
    technologies: string[];
  } | null;
  identity: {
    avatarUrl: string | null;
    name: string;
    currentRole: string | null;
    location: string | null;
    yearsExperience: number | null;
    bio: string | null;
    githubUrl: string | null;
    leetcodeUrl: string | null;
    linkedinUrl: string | null;
    portfolioUrl: string | null;
    resumeUrl: string | null;
    email: string | null;
    techStack: string[];
  };

  evaluation: {
    profylScore: number | null;
    tier: string | null;
    percentile: number | null;
    radar: {
      subject: string;
      value: number;
    }[];
    signalBreakdown: {
      name: string;
      value: number;
    }[];
  };

  ai: {
    signal: string | null;
    summary: string | null;
    evidence: string[];
    strengthChips: string[];
  };

  quantifiedSignals: {
    leetcodeProblemsSolved: number | null;
    leetcodePercentile: number | null;
    leetcodeContestRating: number | null;
    githubContributionsLast12Months: number | null;
    githubPublicRepositories: number | null;
    connectedProjects: number;
  };

  projects: ProfylProject[];

  github: {
    contributionCalendar: NormalizedContributionCalendar | null;
    totalContributionsLast12Months: number | null;
    ossPrsMerged: number | null;
    starsEarned: number | null;
    longestStreak: number | null;
    activeWeeks: number | null;
    languageDistribution: {
      language: string;
      percentage: number;
    }[];
    monthlyContributionSeries: MonthlyContribution[];
  };

  leetcode: {
    contestRating: number | null;
    overallRank: number | null;
    problemsSolved: number | null;
    contestsParticipated: number | null;
    difficultyDistribution: {
      easy: number;
      medium: number;
      hard: number;
    };
    ratingHistory: {
      contest: string;
      rating: number;
    }[];
  };
};
