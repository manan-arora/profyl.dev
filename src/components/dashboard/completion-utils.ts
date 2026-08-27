import { LocalProfile, LocalRepository } from "./DashboardContext";

/**
 * Calculates the profile completion percentage out of 100 based on exact weights.
 */
export function calculateCompletionPercent(
  profile: LocalProfile,
  projects: LocalRepository[],
  user: { githubUsername: string; isLeetcodeVerified: boolean }
): number {
  let score = 0;

  // Checks if a string has non-whitespace characters
  const hasText = (val: string | null | undefined): boolean => {
    return typeof val === "string" && val.trim().length > 0;
  };

  // 1. Full Name — 8%
  if (hasText(profile.name)) score += 8;

  // 2. Bio — 8%
  if (hasText(profile.bio)) score += 8;

  // 3. Current Role — 7%
  if (hasText(profile.currentRole)) score += 7;

  // 4. Current Company — 5%
  if (hasText(profile.currentCompany)) score += 5;

  // 5. Years of Experience — 5%
  if (typeof profile.yearsExperience === "number" && profile.yearsExperience >= 0) score += 5;

  // 6. Location — 3%
  if (hasText(profile.location)) score += 3;

  // 7. College / University — 5%
  if (hasText(profile.college)) score += 5;

  // 8. Branch — 2%
  if (hasText(profile.branch)) score += 2;

  // 9. Graduation Year — 3%
  if (typeof profile.graduationYear === "number" && profile.graduationYear > 0) score += 3;

  // 10. Tech Stack — 8%
  if (Array.isArray(profile.techStack) && profile.techStack.length >= 1) score += 8;

  // 11. LinkedIn — 3%
  if (hasText(profile.linkedinUrl)) score += 3;

  // 12. Portfolio — 3%
  if (hasText(profile.portfolioUrl)) score += 3;

  // 13. Resume — 4%
  if (hasText(profile.resumeUrl)) score += 4;

  const featured = projects.filter((p) => p.isFeatured);
  if (featured.length >= 1) {
    // 14. Featured Projects — 15%
    score += 15;

    // 15. Project Customization — 6%
    if (featured.some((p) => hasText(p.customTitle) || hasText(p.customDescription))) {
      score += 6;
    }

    // 16. Project Topics — 3%
    if (featured.some((p) => Array.isArray(p.topics) && p.topics.length >= 1)) {
      score += 3;
    }
  }

  // 17. GitHub connection — 2.5%
  if (hasText(user.githubUsername)) score += 2.5;

  // 18. LeetCode connection — 2.5%
  if (user.isLeetcodeVerified) score += 2.5;

  return score;
}
