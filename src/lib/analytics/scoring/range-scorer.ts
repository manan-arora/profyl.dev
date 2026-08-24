import { DetectedTechnology } from "../repository-analysis/technologies/technology-types";

/**
 * Centralized weight mapping for the Technical Range scoring layer.
 * Modify these values to change the score contribution of specific signals.
 */
export const TECHNICAL_RANGE_WEIGHTS: Record<string, number> = {
  "Frontend": 5,
  "Backend": 10,
  "Database": 12,
  "Authentication": 8,
  "External Integrations": 10,
  "AI / ML": 15,
  "Infrastructure": 10,
  "Caching": 8,
  "Background Jobs": 11,
  "Real-time": 11,
};

export interface TechnicalRangeResult {
  score: number;
  signals: string[];
}

/**
 * Calculates the Technical Range score based on unique signals from DetectedTechnology[].
 * Multiple technologies declaring the same signal only contribute that signal's weight once.
 * 
 * @param technologies The array of detected technologies with their signals
 * @returns TechnicalRangeResult containing the total score and unique signals found
 */
export function calculateTechnicalRange(
  technologies: DetectedTechnology[]
): TechnicalRangeResult {
  const uniqueSignals = new Set<string>();
  let score = 0;

  for (const tech of technologies) {
    for (const signal of tech.signals) {
      if (!signal || uniqueSignals.has(signal)) {
        continue;
      }

      uniqueSignals.add(signal);

      const weight = TECHNICAL_RANGE_WEIGHTS[signal];
      if (weight !== undefined) {
        score += weight;
      }
    }
  }

  return {
    score,
    signals: Array.from(uniqueSignals),
  };
}
