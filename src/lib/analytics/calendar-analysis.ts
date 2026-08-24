import { NormalizedContributionCalendar } from "@/types/github";
import { NormalizedSubmissionCalendar } from "@/lib/leetcode/normalizers";

export interface CalendarConsistencyMetrics {
  totalPeriods: number;
  activePeriods: number;
  longestInactiveGap: number;
}

/**
 * Extracts consistency metrics (weekly activity periods) from GitHub's normalized contribution calendar.
 *
 * For GitHub:
 * - A period is a week.
 * - A week is active if at least one day in that week has count > 0.
 * - totalPeriods: number of weekly buckets present in the calendar (e.g. 52 or 53).
 * - activePeriods: number of active weeks.
 * - longestInactiveGap: maximum number of consecutive inactive weeks.
 *
 * @param calendar Persisted NormalizedContributionCalendar (or null/undefined)
 * @returns CalendarConsistencyMetrics for GitHub
 */
export function analyzeGithubCalendar(
  calendar?: NormalizedContributionCalendar | null
): CalendarConsistencyMetrics {
  if (
    !calendar ||
    !Array.isArray(calendar.weeks) ||
    calendar.weeks.length === 0
  ) {
    return {
      totalPeriods: 0,
      activePeriods: 0,
      longestInactiveGap: 0,
    };
  }

  const totalPeriods = calendar.weeks.length;
  let activePeriods = 0;
  let maxInactiveGap = 0;
  let currentInactiveGap = 0;

  for (const week of calendar.weeks) {
    const days = week && Array.isArray(week.days) ? week.days : [];
    const isActiveWeek = days.some(
      (day) => typeof day.count === "number" && day.count > 0
    );

    if (isActiveWeek) {
      activePeriods++;
      currentInactiveGap = 0;
    } else {
      currentInactiveGap++;
      if (currentInactiveGap > maxInactiveGap) {
        maxInactiveGap = currentInactiveGap;
      }
    }
  }

  return {
    totalPeriods,
    activePeriods,
    longestInactiveGap: maxInactiveGap,
  };
}

/**
 * Extracts consistency metrics (daily activity periods) from LeetCode's normalized submission calendar.
 *
 * For LeetCode:
 * - A period is a day.
 * - A day is active when count > 0.
 * - totalPeriods: number of normalized days present (e.g. 366 or 367).
 * - activePeriods: number of active days.
 * - longestInactiveGap: maximum number of consecutive inactive days.
 *
 * Note: Does not use level to determine activity; strictly relies on count > 0.
 *
 * @param calendar Persisted NormalizedSubmissionCalendar (or null/undefined)
 * @returns CalendarConsistencyMetrics for LeetCode
 */
export function analyzeLeetcodeCalendar(
  calendar?: NormalizedSubmissionCalendar | null
): CalendarConsistencyMetrics {
  if (
    !calendar ||
    !Array.isArray(calendar.days) ||
    calendar.days.length === 0
  ) {
    return {
      totalPeriods: 0,
      activePeriods: 0,
      longestInactiveGap: 0,
    };
  }

  const totalPeriods = calendar.days.length;
  let activePeriods = 0;
  let maxInactiveGap = 0;
  let currentInactiveGap = 0;

  for (const day of calendar.days) {
    const isActiveDay = typeof day.count === "number" && day.count > 0;

    if (isActiveDay) {
      activePeriods++;
      currentInactiveGap = 0;
    } else {
      currentInactiveGap++;
      if (currentInactiveGap > maxInactiveGap) {
        maxInactiveGap = currentInactiveGap;
      }
    }
  }

  return {
    totalPeriods,
    activePeriods,
    longestInactiveGap: maxInactiveGap,
  };
}
