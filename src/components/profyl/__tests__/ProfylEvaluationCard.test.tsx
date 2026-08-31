// @vitest-environment jsdom
import "@testing-library/jest-dom";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProfylEvaluationCard } from "../ProfylEvaluationCard";
import { ProfylPageData } from "@/types/profyl-page";

const mockData: ProfylPageData = {
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
    radar: [
      { subject: "Build Activity", value: 80 },
      { subject: "Technical Range", value: 70 },
      { subject: "Problem Solving", value: 60 },
      { subject: "Consistency", value: 75 },
      { subject: "Open Source", value: 50 },
    ],
    signalBreakdown: [
      { name: "GitHub", value: 80 },
      { name: "Projects", value: 70 },
      { name: "LeetCode", value: 60 },
      { name: "Consistency", value: 75 },
    ],
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
    difficultyDistribution: {
      easy: 50,
      medium: 40,
      hard: 10,
    },
    ratingHistory: [],
  },
};

describe("ProfylEvaluationCard Component", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders headers and does not render ⓘ on Score Composition", async () => {
    render(<ProfylEvaluationCard data={mockData} />);
    await vi.advanceTimersByTimeAsync(1000);

    // Renders the score value and tier
    expect(screen.getByText("750")).toBeInTheDocument();
    expect(screen.getByText("Strong")).toBeInTheDocument();

    // Renders trigger buttons
    expect(screen.getByLabelText("About Profyl Score")).toBeInTheDocument();
    expect(screen.getByLabelText("About Specialization Radar")).toBeInTheDocument();

    // No info button for Score Composition
    const compositionHeader = screen.getByText("Score Composition");
    const compositionContainer = compositionHeader.parentElement;
    expect(compositionContainer?.querySelector("button")).toBeNull();
  });

  it("toggles Profyl Score popover and displays approved copy and link", async () => {
    render(<ProfylEvaluationCard data={mockData} />);
    await vi.advanceTimersByTimeAsync(1000);

    const scoreButton = screen.getByLabelText("About Profyl Score");
    
    // Closed initially
    expect(screen.queryByRole("dialog")).toBeNull();

    // Opens on click
    fireEvent.click(scoreButton);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText(/A single rating built from four signals/i)).toBeInTheDocument();
    
    // Check link is present and points to correct section
    const link = screen.getByRole("link", { name: /Learn how Profyl Rating works/i });
    expect(link).toBeInTheDocument();
    expect(link.getAttribute("href")).toBe("/docs/scoring#profyl-rating");

    // Closes on click again
    fireEvent.click(scoreButton);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("toggles Specialization Radar popover and displays approved copy and link", async () => {
    render(<ProfylEvaluationCard data={mockData} />);
    await vi.advanceTimersByTimeAsync(1000);

    const radarButton = screen.getByLabelText("About Specialization Radar");
    
    // Closed initially
    expect(screen.queryByRole("dialog")).toBeNull();

    // Opens on click
    fireEvent.click(radarButton);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText(/Shows your engineering profile across/i)).toBeInTheDocument();
    expect(screen.getByText(/A 0 means no supported signals were detected/i)).toBeInTheDocument();
    expect(screen.getByText(/If only some projects are supported/i)).toBeInTheDocument();
    
    // Check link
    const link = screen.getByRole("link", { name: /Learn how the radar works/i });
    expect(link).toBeInTheDocument();
    expect(link.getAttribute("href")).toBe("/docs/scoring#specialization-radar");
  });

  it("closes the active popover when Escape is pressed", async () => {
    render(<ProfylEvaluationCard data={mockData} />);
    await vi.advanceTimersByTimeAsync(1000);

    const scoreButton = screen.getByLabelText("About Profyl Score");
    fireEvent.click(scoreButton);
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    // Press Escape
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("only allows one popover to be open at a time", async () => {
    render(<ProfylEvaluationCard data={mockData} />);
    await vi.advanceTimersByTimeAsync(1000);

    const scoreButton = screen.getByLabelText("About Profyl Score");
    const radarButton = screen.getByLabelText("About Specialization Radar");

    // Open score
    fireEvent.click(scoreButton);
    expect(screen.getByText("Profyl Score", { selector: "h4" })).toBeInTheDocument();

    // Click radar
    fireEvent.click(radarButton);
    expect(screen.queryByText("Profyl Score", { selector: "h4" })).toBeNull();
    expect(screen.getByText("Specialization Radar", { selector: "h4" })).toBeInTheDocument();
  });
});
