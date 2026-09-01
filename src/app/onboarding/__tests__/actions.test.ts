import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  saveFeaturedProjectsAction,
  generateLeetcodeVerificationTokenAction,
  verifyLeetcodeOwnershipAction,
  completeOnboardingPreparationAction,
} from "../actions";
import { getCurrentUser } from "@/lib/auth/current-user";
import { projectService } from "@/lib/services/project.service";
import { leetcodeService } from "@/lib/services/leetcode.service";
import { completeOnboardingPreparation } from "@/lib/onboarding/preparation";

vi.mock("@/lib/auth/current-user", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("@/lib/services/project.service", () => ({
  projectService: {
    saveFeaturedProjects: vi.fn(),
  },
}));

vi.mock("@/lib/services/leetcode.service", () => ({
  leetcodeService: {
    generateVerificationToken: vi.fn(),
    verifyOwnership: vi.fn(),
  },
}));

vi.mock("@/lib/onboarding/preparation", () => ({
  completeOnboardingPreparation: vi.fn(),
}));

describe("Onboarding Server Actions Error Handling", () => {
  const mockUser = {
    id: "user_123",
    clerkId: "clerk_123",
    email: "test@example.com",
    githubUsername: "testuser",
    slug: "testuser",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser as any);
  });

  describe("saveFeaturedProjectsAction", () => {
    it("should return Unauthorized if no current user", async () => {
      vi.mocked(getCurrentUser).mockResolvedValueOnce(null);
      const res = await saveFeaturedProjectsAction(["repo_1"]);
      expect(res).toEqual({ success: false, error: "Unauthorized" });
    });

    it("should return success when saveFeaturedProjects succeeds", async () => {
      vi.mocked(projectService.saveFeaturedProjects).mockResolvedValueOnce();
      const res = await saveFeaturedProjectsAction(["repo_1"]);
      expect(res).toEqual({ success: true });
    });

    it("should return safe generic error message on database or unexpected failure", async () => {
      const spyConsole = vi.spyOn(console, "error").mockImplementation(() => {});
      vi.mocked(projectService.saveFeaturedProjects).mockRejectedValueOnce(
        new Error("PrismaClientKnownRequestError: DB connection timeout"),
      );

      const res = await saveFeaturedProjectsAction(["repo_1"]);
      expect(res).toEqual({
        success: false,
        error: "Unable to save featured projects. Please try again.",
      });
      expect(spyConsole).toHaveBeenCalled();
      spyConsole.mockRestore();
    });
  });

  describe("generateLeetcodeVerificationTokenAction", () => {
    it("should return Unauthorized if no current user", async () => {
      vi.mocked(getCurrentUser).mockResolvedValueOnce(null);
      const res = await generateLeetcodeVerificationTokenAction("leetcode_user");
      expect(res).toEqual({ success: false, error: "Unauthorized" });
    });

    it("should return token when generation succeeds", async () => {
      vi.mocked(leetcodeService.generateVerificationToken).mockResolvedValueOnce(
        "PROFYL-ABC12345",
      );
      const res = await generateLeetcodeVerificationTokenAction("leetcode_user");
      expect(res).toEqual({ success: true, token: "PROFYL-ABC12345" });
    });

    it("should return human-readable domain error message for known failures", async () => {
      vi.mocked(leetcodeService.generateVerificationToken).mockRejectedValueOnce(
        new Error("This LeetCode username is already connected to another Profyl account."),
      );
      const res = await generateLeetcodeVerificationTokenAction("leetcode_user");
      expect(res).toEqual({
        success: false,
        error: "This LeetCode username is already connected to another Profyl account.",
      });
    });

    it("should return safe generic fallback error for internal server errors", async () => {
      const spyConsole = vi.spyOn(console, "error").mockImplementation(() => {});
      vi.mocked(leetcodeService.generateVerificationToken).mockRejectedValueOnce(
        new Error("LEETCODE_API_URL environment variable is not defined"),
      );
      const res = await generateLeetcodeVerificationTokenAction("leetcode_user");
      expect(res).toEqual({
        success: false,
        error: "Failed to generate verification code. Please try again.",
      });
      expect(spyConsole).toHaveBeenCalled();
      spyConsole.mockRestore();
    });
  });

  describe("verifyLeetcodeOwnershipAction", () => {
    it("should return Unauthorized if no current user", async () => {
      vi.mocked(getCurrentUser).mockResolvedValueOnce(null);
      const res = await verifyLeetcodeOwnershipAction("leetcode_user");
      expect(res).toEqual({ success: false, error: "Unauthorized" });
    });

    it("should return verified: true when verification succeeds", async () => {
      vi.mocked(leetcodeService.verifyOwnership).mockResolvedValueOnce();
      const res = await verifyLeetcodeOwnershipAction("leetcode_user");
      expect(res).toEqual({ success: true, verified: true });
    });

    it("should return expected domain error message on token mismatch", async () => {
      vi.mocked(leetcodeService.verifyOwnership).mockRejectedValueOnce(
        new Error(
          "Verification code does not match. Please ensure the code is added to your LeetCode profile README.",
        ),
      );
      const res = await verifyLeetcodeOwnershipAction("leetcode_user");
      expect(res).toEqual({
        success: false,
        error:
          "Verification code does not match. Please ensure the code is added to your LeetCode profile README.",
      });
    });

    it("should return expected domain error message on profile not found", async () => {
      vi.mocked(leetcodeService.verifyOwnership).mockRejectedValueOnce(
        new Error("LeetCode profile not found"),
      );
      const res = await verifyLeetcodeOwnershipAction("invalid_user");
      expect(res).toEqual({
        success: false,
        error: "LeetCode profile not found",
      });
    });

    it("should return safe generic error message on unexpected server error", async () => {
      const spyConsole = vi.spyOn(console, "error").mockImplementation(() => {});
      vi.mocked(leetcodeService.verifyOwnership).mockRejectedValueOnce(
        new Error("Internal Prisma $transaction deadlock error"),
      );
      const res = await verifyLeetcodeOwnershipAction("leetcode_user");
      expect(res).toEqual({
        success: false,
        error: "Verification failed. Please try again.",
      });
      expect(spyConsole).toHaveBeenCalled();
      spyConsole.mockRestore();
    });
  });

  describe("completeOnboardingPreparationAction", () => {
    it("should return Unauthorized if no current user", async () => {
      vi.mocked(getCurrentUser).mockResolvedValueOnce(null);
      const res = await completeOnboardingPreparationAction();
      expect(res).toEqual({ success: false, error: "Unauthorized" });
    });

    it("should return success when preparation completes", async () => {
      vi.mocked(completeOnboardingPreparation).mockResolvedValueOnce();
      const res = await completeOnboardingPreparationAction();
      expect(res).toEqual({ success: true });
    });

    it("should return safe generic error message on unexpected error", async () => {
      const spyConsole = vi.spyOn(console, "error").mockImplementation(() => {});
      vi.mocked(completeOnboardingPreparation).mockRejectedValueOnce(
        new Error("Gemini AI API quota exceeded"),
      );
      const res = await completeOnboardingPreparationAction();
      expect(res).toEqual({
        success: false,
        error: "Couldn't finish preparing your Profyl. Please try again.",
      });
      expect(spyConsole).toHaveBeenCalled();
      spyConsole.mockRestore();
    });
  });
});
