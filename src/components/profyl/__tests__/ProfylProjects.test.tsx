// @vitest-environment jsdom
import "@testing-library/jest-dom";
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { ProfylProjects } from "../ProfylProjects";
import { ProfylPageData, ProfylProject } from "@/types/profyl-page";

const makeProject = (id: string, name: string): ProfylProject => ({
  id,
  name,
  description: "Test description",
  stars: 5,
  primaryLanguage: "TypeScript",
  detectedTechnologies: [],
  liveDemoUrl: null,
  githubUrl: `https://github.com/test/${name}`,
  topics: ["react", "nextjs"],
  projectSummary: "Test AI summary",
});

const baseData: ProfylPageData = {
  underTheHood: null,
  identity: {
    avatarUrl: null,
    name: "Alex",
    currentRole: null,
    currentCompany: null,
    location: null,
    yearsExperience: null,
    bio: null,
    githubUrl: null,
    leetcodeUrl: null,
    linkedinUrl: null,
    portfolioUrl: null,
    resumeUrl: null,
    college: null,
    degree: null,
    branch: null,
    graduationYear: null,
    email: "alex@example.com",
    techStack: [],
  },
  evaluation: {
    profylScore: 750,
    tier: "Strong",
    percentile: 90,
    radar: [],
    signalBreakdown: [],
  },
  ai: {
    signal: null,
    summary: null,
    evidence: [],
    strengthChips: [],
  },
  quantifiedSignals: {
    leetcodeProblemsSolved: 100,
    leetcodePercentile: 85,
    leetcodeContestRating: 1600,
    githubContributionsLast12Months: 250,
    githubPublicRepositories: 10,
    connectedProjects: 4,
  },
  projects: [],
  github: {
    contributionCalendar: null,
    totalContributionsLast12Months: 250,
    ossPrsMerged: 5,
    starsEarned: 12,
    longestStreak: 15,
    activeWeeks: 35,
    languageDistribution: [],
    monthlyContributionSeries: [],
  },
  leetcode: {
    contestRating: 1600,
    overallRank: 120000,
    problemsSolved: 100,
    contestsParticipated: 12,
    difficultyDistribution: { easy: 50, medium: 40, hard: 10 },
    ratingHistory: [],
  },
};

describe("ProfylProjects Component", () => {
  it("renders a filler element when project count is 3 (odd)", () => {
    const data: ProfylPageData = {
      ...baseData,
      projects: [
        makeProject("1", "proj-1"),
        makeProject("2", "proj-2"),
        makeProject("3", "proj-3"),
      ],
    };

    const { container } = render(<ProfylProjects data={data} />);
    const filler = container.querySelector('div[aria-hidden="true"]');
    expect(filler).toBeInTheDocument();
    expect(filler).toHaveClass("bg-[#0D0D0D]");
  });

  it("renders a filler element when project count is 1 (odd)", () => {
    const data: ProfylPageData = {
      ...baseData,
      projects: [makeProject("1", "proj-1")],
    };

    const { container } = render(<ProfylProjects data={data} />);
    const filler = container.querySelector('div[aria-hidden="true"]');
    expect(filler).toBeInTheDocument();
    expect(filler).toHaveClass("bg-[#0D0D0D]");
  });

  it("does NOT render a filler element when project count is 2 or 4 (even)", () => {
    const data2: ProfylPageData = {
      ...baseData,
      projects: [makeProject("1", "proj-1"), makeProject("2", "proj-2")],
    };

    const { container: container2 } = render(<ProfylProjects data={data2} />);
    expect(container2.querySelector('div[aria-hidden="true"]')).toBeNull();

    const data4: ProfylPageData = {
      ...baseData,
      projects: [
        makeProject("1", "proj-1"),
        makeProject("2", "proj-2"),
        makeProject("3", "proj-3"),
        makeProject("4", "proj-4"),
      ],
    };

    const { container: container4 } = render(<ProfylProjects data={data4} />);
    expect(container4.querySelector('div[aria-hidden="true"]')).toBeNull();
  });
});
