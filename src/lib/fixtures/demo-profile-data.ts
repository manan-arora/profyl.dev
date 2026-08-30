import { ProfylPageData } from "@/types/profyl-page";

function generateDemoCalendar() {
  const weeks = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 365);
  const startDay = startDate.getDay();
  startDate.setDate(startDate.getDate() - startDay); // Align to Sunday

  let current = new Date(startDate);
  for (let w = 0; w < 53; w++) {
    const days = [];
    const weekFirstDay = current.toISOString().split("T")[0];
    for (let d = 0; d < 7; d++) {
      const dateStr = current.toISOString().split("T")[0];
      const seed = Math.sin(w * 7 + d) * 10000;
      const rand = seed - Math.floor(seed);
      let count = 0;
      let level = "NONE";

      const isWeekend = d === 0 || d === 6;
      const isQuietMonth = current.getMonth() === 11 || current.getMonth() === 5; // Dec, Jun

      if (!isQuietMonth) {
        if (isWeekend) {
          if (rand > 0.85) {
            count = Math.floor(rand * 3) + 1;
          }
        } else {
          if (rand > 0.45) { // ~55% active weekdays
            count = Math.floor(rand * 5) + 1;
          }
        }
      } else {
        if (rand > 0.85) {
          count = 1;
        }
      }

      if (count > 0) {
        if (count >= 5) level = "FOURTH_QUARTILE";
        else if (count >= 3) level = "THIRD_QUARTILE";
        else if (count >= 2) level = "SECOND_QUARTILE";
        else level = "FIRST_QUARTILE";
      }

      days.push({
        date: dateStr,
        count,
        level,
        weekday: d,
      });

      current.setDate(current.getDate() + 1);
    }
    weeks.push({
      firstDay: weekFirstDay,
      days,
    });
  }
  return { weeks };
}

export const demoProfylData: ProfylPageData = {
  identity: {
    avatarUrl: null,
    name: "Alex Morgan",
    currentRole: "Software Engineer",
    currentCompany: "Mirevon Labs",
    location: "Bengaluru",
    yearsExperience: 1,
    bio: "Building products, solving problems, and always wondering if there’s an O(log n) way to do it.",
    githubUrl: "/demo/dummy",
    leetcodeUrl: "/demo/dummy",
    linkedinUrl: "/demo/dummy",
    portfolioUrl: "/demo/dummy",
    resumeUrl: "/demo/dummy",
    college: "IIIT Hyderabad",
    degree: "B.Tech",
    branch: "CSE",
    graduationYear: 2025,
    email: "/demo/dummy",
    techStack: ["TypeScript", "Next.js", "React", "Go", "Docker", "Node.js", "PostgreSQL", "Python", "TailwindCSS"],
  },

  evaluation: {
    profylScore: 760,
    tier: "Strong",
    percentile: 94,
    radar: [
      { subject: "Build Activity", value: 84 },
      { subject: "Technical Range", value: 84 },
      { subject: "Problem Solving", value: 64 },
      { subject: "Consistency", value: 80 },
      { subject: "Open Source", value: 52 },
    ],
    signalBreakdown: [
      { name: "GitHub", value: 76 },
      { name: "Projects", value: 84 },
      { name: "LeetCode", value: 64 },
      { name: "Consistency", value: 80 },
    ],
  },

  ai: {
    signal: "Product-oriented builder with strong TypeScript and web development experience, complemented by developer tooling and practical systems work.",
    summary: "Experience spanning **product engineering**, **developer tooling**, and **web application development**. Project work includes a GitHub Action for **pull request quality checks**, a Dockerized developer operations dashboard, and command-line tooling built with **Go and Python**. Solved over **300 algorithmic problems** with a concentration on medium-difficulty problem solving.",
    evidence: [
      "Solved 314 LeetCode challenges, with 172 focused on medium-difficulty problems.",
      "Built 4 featured projects spanning GitHub automation, developer tooling, web dashboards, and command-line utilities.",
      "Maintained 382 GitHub contributions across 38 active weeks, reflecting consistent hands-on building."
    ],
    strengthChips: [
      "TypeScript",
      "Next.js",
      "API Design",
      "Product Engineering"
    ],
  },

  quantifiedSignals: {
    leetcodeProblemsSolved: 314,
    leetcodePercentile: 88,
    leetcodeContestRating: 1702,
    githubContributionsLast12Months: 382,
    githubPublicRepositories: 14,
    connectedProjects: 4,
  },

  underTheHood: {
    capabilities: [
      { label: "Frontend State", count: 2 },
      { label: "API Design", count: 2 },
      { label: "Database Schemas", count: 2 },
      { label: "Containerization", count: 1 }
    ],
    technologies: ["React", "TypeScript", "Next.js", "Docker", "Node.js", "Go", "Python", "Flask", "Redis", "SQLite", "PostgreSQL"],
  },

  projects: [
    {
      id: "demo-p1",
      name: "PR Size Guard",
      description: "GitHub Action and dashboard checking bundle size delta, code coverage, and visual regressions inline in PR comments.",
      stars: 32,
      primaryLanguage: "TypeScript",
      detectedTechnologies: [
        {
          technologyId: "nextjs",
          name: "Next.js",
          signals: ["Fullstack framework"],
          evidence: [{ source: "manifest", ecosystem: "npm", identifier: "next", path: "package.json" }]
        },
        {
          technologyId: "typescript",
          name: "TypeScript",
          signals: ["Typed JavaScript"],
          evidence: [{ source: "manifest", ecosystem: "npm", identifier: "typescript", path: "package.json" }]
        }
      ],
      topics: ["github-action", "typescript", "bundle-size", "developer-tooling"],
      githubUrl: "/demo/dummy",
      liveDemoUrl: "/demo/dummy",
      projectSummary: "Built to automate code review chores for teams. Written in TypeScript and run as a serverless API on Vercel, integrating directly with GitHub REST API and deploying visual regression checks on AWS S3."
    },
    {
      id: "demo-p2",
      name: "DevFlow Dashboard",
      description: "An operations console for developer workspace management. Integrates local dev environments, resource utilization charts, and quick-access scripts.",
      stars: 18,
      primaryLanguage: "TypeScript",
      detectedTechnologies: [
        {
          technologyId: "react",
          name: "React",
          signals: ["UI library"],
          evidence: [{ source: "manifest", ecosystem: "npm", identifier: "react", path: "package.json" }]
        },
        {
          technologyId: "docker",
          name: "Docker",
          signals: ["Container orchestration"],
          evidence: [{ source: "artifact", identifier: "dockerfile", path: "Dockerfile" }]
        }
      ],
      topics: ["developer-productivity", "nextjs", "react", "dashboard", "docker"],
      githubUrl: "/demo/dummy",
      liveDemoUrl: null,
      projectSummary: "A productivity dashboard that runs locally via Docker. Displays CPU/memory allocations, aggregates workspace project folders, and allows triggering shell commands from a web console using WebSockets."
    },
    {
      id: "demo-p3",
      name: "Redis JSON CLI",
      description: "A lightweight terminal client and interactive REPL built for debugging Redis JSON keys with live autocompletion.",
      stars: 12,
      primaryLanguage: "Go",
      detectedTechnologies: [
        {
          technologyId: "go",
          name: "Go",
          signals: ["Go modules"],
          evidence: [{ source: "manifest", ecosystem: "go", identifier: "go", path: "go.mod" }]
        }
      ],
      topics: ["cli", "redis", "go", "json", "repl"],
      githubUrl: "/demo/dummy",
      liveDemoUrl: null,
      projectSummary: "A small terminal tool written in Go to simplify querying nested Redis JSON fields during local development. Leverages the bubbletea library for visual CLI feedback."
    },
    {
      id: "demo-p4",
      name: "CronKeep",
      description: "A simple visual scheduler and alert manager for cron jobs running across multiple VPS instances.",
      stars: 7,
      primaryLanguage: "Python",
      detectedTechnologies: [
        {
          technologyId: "python",
          name: "Python",
          signals: ["Python app"],
          evidence: [{ source: "manifest", ecosystem: "python", identifier: "Flask", path: "requirements.txt" }]
        }
      ],
      topics: ["cron", "python", "alerts", "vps"],
      githubUrl: "/demo/dummy",
      liveDemoUrl: null,
      projectSummary: "A dashboard that polls lightweight status endpoints from remote cron scripts and triggers Discord/Slack webhooks on failures."
    }
  ],

  github: {
    contributionCalendar: generateDemoCalendar(),
    totalContributionsLast12Months: 382,
    ossPrsMerged: 4,
    starsEarned: 15,
    longestStreak: 18,
    activeWeeks: 38,
    languageDistribution: [
      { language: "TypeScript", percentage: 72 },
      { language: "Go", percentage: 15 },
      { language: "Python", percentage: 10 },
      { language: "CSS", percentage: 3 }
    ],
    monthlyContributionSeries: [
      { month: "Sep", contributions: 25 },
      { month: "Oct", contributions: 34 },
      { month: "Nov", contributions: 45 },
      { month: "Dec", contributions: 12 },
      { month: "Jan", contributions: 38 },
      { month: "Feb", contributions: 42 },
      { month: "Mar", contributions: 48 },
      { month: "Apr", contributions: 32 },
      { month: "May", contributions: 15 },
      { month: "Jun", contributions: 28 },
      { month: "Jul", contributions: 33 },
      { month: "Aug", contributions: 30 }
    ],
  },

  leetcode: {
    contestRating: 1702,
    overallRank: 145000,
    problemsSolved: 314,
    contestsParticipated: 16,
    difficultyDistribution: {
      easy: 118,
      medium: 172,
      hard: 24,
    },
    ratingHistory: [
      { contest: "Contest 1", rating: 1450 },
      { contest: "Contest 2", rating: 1485 },
      { contest: "Contest 3", rating: 1510 },
      { contest: "Contest 4", rating: 1490 },
      { contest: "Contest 5", rating: 1540 },
      { contest: "Contest 6", rating: 1585 },
      { contest: "Contest 7", rating: 1610 },
      { contest: "Contest 8", rating: 1630 },
      { contest: "Contest 9", rating: 1615 },
      { contest: "Contest 10", rating: 1640 },
      { contest: "Contest 11", rating: 1675 },
      { contest: "Contest 12", rating: 1695 },
      { contest: "Contest 13", rating: 1665 },
      { contest: "Contest 14", rating: 1685 },
      { contest: "Contest 15", rating: 1690 },
      { contest: "Contest 16", rating: 1702 }
    ],
  },
};
