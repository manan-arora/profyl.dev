import { formatInTimeZone } from "date-fns-tz";

export interface NormalizedCalendarDay {
  date: string;
  weekday: number;
  count: number;
  level: number;
}

export interface NormalizedSubmissionCalendar {
  startDate: string;
  endDate: string;
  days: NormalizedCalendarDay[];
}

const TIME_ZONE = "UTC";

/**
 * Derives the deterministic LeetCode activity level (0-4) from a daily submission count.
 * 
 * - count = 0   → level 0
 * - count = 1–2 → level 1
 * - count = 3–5 → level 2
 * - count = 6–9 → level 3
 * - count >= 10 → level 4
 */
export function deriveLeetCodeActivityLevel(count: number): number {
  if (count <= 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 9) return 3;
  return 4;
}

/**
 * Normalizes raw LeetCode submission calendar data into Profyl's complete day-wise calendar.
 * All timestamp-to-date conversions and calendar-window calculations are strictly executed in UTC.
 * Covers `today - 1 calendar year` through `today`, inclusive.
 * 
 * @param rawCalendar Raw LeetCode submission calendar (Record<string, number>, stringified JSON, or null/undefined)
 * @param referenceDate Optional reference date (defaults to current date; injectable for deterministic testing)
 * @returns NormalizedSubmissionCalendar with complete day range including count: 0 for missing dates
 */
export function normalizeSubmissionCalendar(
  rawCalendar?: Record<string, number> | string | null,
  referenceDate: Date = new Date()
): NormalizedSubmissionCalendar {
  let parsedMap: Record<string, number> = {};

  if (typeof rawCalendar === "string") {
    try {
      const parsed = JSON.parse(rawCalendar);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        parsedMap = parsed;
      }
    } catch {
      parsedMap = {};
    }
  } else if (
    rawCalendar &&
    typeof rawCalendar === "object" &&
    !Array.isArray(rawCalendar)
  ) {
    parsedMap = rawCalendar as Record<string, number>;
  }

  // Aggregate raw timestamps into a UTC "yyyy-MM-dd" -> submission count map
  const dailyCountMap: Record<string, number> = {};

  for (const [timestampKey, countVal] of Object.entries(parsedMap)) {
    const numericTs = Number(timestampKey);
    const count = Number(countVal);

    if (Number.isNaN(numericTs) || Number.isNaN(count) || count <= 0) {
      continue;
    }

    // LeetCode timestamps are unix seconds (10 digits) or milliseconds (13 digits)
    const dateObj =
      numericTs > 1e11 ? new Date(numericTs) : new Date(numericTs * 1000);
    const dateStr = formatInTimeZone(dateObj, TIME_ZONE, "yyyy-MM-dd");
    dailyCountMap[dateStr] = (dailyCountMap[dateStr] || 0) + count;
  }

  // Generate UTC date window: referenceDate - 1 calendar year to referenceDate (inclusive)
  const refYear = referenceDate.getUTCFullYear();
  const refMonth = referenceDate.getUTCMonth();
  const refDate = referenceDate.getUTCDate();

  const endDateObj = new Date(Date.UTC(refYear, refMonth, refDate));
  const startDateObj = new Date(Date.UTC(refYear - 1, refMonth, refDate));

  const startDate = formatInTimeZone(startDateObj, TIME_ZONE, "yyyy-MM-dd");
  const endDate = formatInTimeZone(endDateObj, TIME_ZONE, "yyyy-MM-dd");

  const days: NormalizedCalendarDay[] = [];
  const curr = new Date(startDateObj.getTime());

  while (curr.getTime() <= endDateObj.getTime()) {
    const dateStr = formatInTimeZone(curr, TIME_ZONE, "yyyy-MM-dd");
    const count = dailyCountMap[dateStr] ?? 0;
    const weekday = curr.getUTCDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday in UTC
    const level = deriveLeetCodeActivityLevel(count);

    days.push({
      date: dateStr,
      weekday,
      count,
      level,
    });

    curr.setUTCDate(curr.getUTCDate() + 1);
  }

  return {
    startDate,
    endDate,
    days,
  };
}
