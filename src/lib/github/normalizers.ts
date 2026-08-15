import {
  GithubContributionCalendar,
  NormalizedContributionCalendar,
  NormalizedContributionDay,
} from "@/types/github";

/**
 * Normalizes GitHub's GraphQL ContributionCalendar response into Profyl's internal representation.
 *
 * Mapping:
 * - firstDay -> firstDay
 * - contributionDays -> days
 * - contributionCount -> count
 * - contributionLevel -> level
 * - date -> date
 * - weekday -> weekday
 *
 * @param calendar Raw GithubContributionCalendar object from GitHub GraphQL API
 * @returns NormalizedContributionCalendar
 */
export function normalizeContributionCalendar(
  calendar?: GithubContributionCalendar | null
): NormalizedContributionCalendar {
  if (!calendar || !Array.isArray(calendar.weeks)) {
    return { weeks: [] };
  }

  return {
    weeks: calendar.weeks.map((week) => ({
      firstDay: week.firstDay,
      days: (week.contributionDays || []).map((day) => ({
        date: day.date,
        count: day.contributionCount,
        level: day.contributionLevel,
        weekday: day.weekday,
      })),
    })),
  };
}

/**
 * Calculates the total number of active weeks from a NormalizedContributionCalendar.
 * A week is active if at least one day in that week has count > 0.
 *
 * @param calendar NormalizedContributionCalendar object or null/undefined
 * @returns Total count of active weeks
 */
export function calculateActiveWeeks(
  calendar?: NormalizedContributionCalendar | null
): number {
  if (!calendar || !Array.isArray(calendar.weeks)) {
    return 0;
  }

  let activeWeeksCount = 0;

  for (const week of calendar.weeks) {
    if (!Array.isArray(week.days)) continue;
    const hasActiveDay = week.days.some((day) => day.count > 0);
    if (hasActiveDay) {
      activeWeeksCount++;
    }
  }

  return activeWeeksCount;
}

/**
 * Calculates the maximum consecutive active-day streak from a NormalizedContributionCalendar.
 * Contribution days are sorted chronologically by date prior to calculation.
 * A day with count === 0 resets the streak.
 *
 * @param calendar NormalizedContributionCalendar object or null/undefined
 * @returns Maximum consecutive days with count > 0
 */
export function calculateLongestStreak(
  calendar?: NormalizedContributionCalendar | null
): number {
  if (!calendar || !Array.isArray(calendar.weeks)) {
    return 0;
  }

  const allDays: NormalizedContributionDay[] = [];

  for (const week of calendar.weeks) {
    if (Array.isArray(week.days)) {
      allDays.push(...week.days);
    }
  }

  if (allDays.length === 0) {
    return 0;
  }

  // Sort days chronologically by date
  allDays.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

  let maxStreak = 0;
  let currentStreak = 0;

  for (const day of allDays) {
    if (day.count > 0) {
      currentStreak++;
      if (currentStreak > maxStreak) {
        maxStreak = currentStreak;
      }
    } else {
      currentStreak = 0;
    }
  }

  return maxStreak;
}

/**
 * Calculates the total stargazers_count across a collection of eligible repositories.
 * Operates purely on the provided array and does not mutate the input.
 *
 * @param repositories Array of repository objects containing stargazers_count (or null/undefined)
 * @returns Total count of earned stars
 */
export function calculateStarsEarned(
  repositories?: Array<{ stargazers_count: number }> | null
): number {
  if (!repositories || !Array.isArray(repositories) || repositories.length === 0) {
    return 0;
  }

  return repositories.reduce((total, repo) => {
    const stars = typeof repo.stargazers_count === "number" ? repo.stargazers_count : 0;
    return total + stars;
  }, 0);
}

/**
 * Calculates the total forks_count across a collection of eligible repositories.
 * Operates purely on the provided array and does not mutate the input.
 *
 * @param repositories Array of repository objects containing forks_count (or null/undefined)
 * @returns Total count of earned forks
 */
export function calculateForksEarned(
  repositories?: Array<{ forks_count: number }> | null
): number {
  if (!repositories || !Array.isArray(repositories) || repositories.length === 0) {
    return 0;
  }

  return repositories.reduce((total, repo) => {
    const forks = typeof repo.forks_count === "number" ? repo.forks_count : 0;
    return total + forks;
  }, 0);
}



/**
 * Aggregates raw language byte counts across multiple repositories.
 * Operates purely and does not mutate input objects.
 *
 * @param languageResponses Array of language byte maps (e.g. [{ TypeScript: 12000 }, { Python: 5000 }])
 * @returns Combined record of total bytes per language
 */
export function aggregateLanguageBytes(
  languageResponses?: Record<string, number>[] | null
): Record<string, number> {
  if (!languageResponses || !Array.isArray(languageResponses) || languageResponses.length === 0) {
    return {};
  }

  const aggregate: Record<string, number> = {};

  for (const repoLangs of languageResponses) {
    if (!repoLangs || typeof repoLangs !== "object") continue;
    for (const [lang, bytes] of Object.entries(repoLangs)) {
      if (typeof bytes === "number" && bytes > 0) {
        aggregate[lang] = (aggregate[lang] || 0) + bytes;
      }
    }
  }

  return aggregate;
}

/**
 * Converts aggregated language byte counts into percentage distribution.
 * Percentages are rounded to 2 decimal places.
 * Returns {} if total bytes is 0 or input is empty (prevents division by zero).
 *
 * @param aggregatedBytes Map of language -> total byte count
 * @returns Map of language -> percentage (0-100)
 */
export function calculateLanguageDistribution(
  aggregatedBytes?: Record<string, number> | null
): Record<string, number> {
  if (!aggregatedBytes || typeof aggregatedBytes !== "object") {
    return {};
  }

  const entries = Object.entries(aggregatedBytes).filter(
    ([_, bytes]) => typeof bytes === "number" && bytes > 0
  );

  if (entries.length === 0) {
    return {};
  }

  const totalBytes = entries.reduce((sum, [_, bytes]) => sum + bytes, 0);

  if (totalBytes <= 0) {
    return {};
  }

  const distribution: Record<string, number> = {};

  for (const [lang, bytes] of entries) {
    const percentage = Number(((bytes / totalBytes) * 100).toFixed(2));
    distribution[lang] = percentage;
  }

  return distribution;
}



