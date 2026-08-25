import { describe, it, expect } from "vitest";
import { AIOutputSchema } from "../output-schema";

describe("AIOutputSchema", () => {
  describe("Valid Shapes", () => {
    it("should pass validation for a perfectly formatted object with 3 strength chips", () => {
      const validData = {
        aiSignal: "Sustained building consistency and strong database concentration.",
        aiSummary: "The developer's profile shows a focus on full-stack application development with strong relational database skills.",
        strengthChips: ["Backend Systems", "Databases", "Authentication"],
        projectSummaries: [
          { repositoryId: "repo_1", summary: "A backend API with database connection." },
          { repositoryId: "repo_2", summary: "A real-time messaging application." },
        ],
      };

      const result = AIOutputSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should pass validation for a perfectly formatted object with 5 strength chips", () => {
      const validData = {
        aiSignal: "Broad full-stack project scope complemented by competitive programming participation.",
        aiSummary: "The candidate demonstrates practical engineering skills coupled with sustained problem solving capability.",
        strengthChips: ["React", "Next.js", "TypeScript", "Problem Solving", "Caching"],
        projectSummaries: [],
      };

      const result = AIOutputSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should pass validation when project summaries contain null values", () => {
      const validData = {
        aiSignal: "Highly focused backend infrastructure implementations.",
        aiSummary: "The projects reveal deep exposure to server-side frameworks and infrastructure automation.",
        strengthChips: ["Backend Systems", "Databases", "Caching"],
        projectSummaries: [
          { repositoryId: "repo_1", summary: null },
          { repositoryId: "repo_2", summary: "An event broker client." },
        ],
      };

      const result = AIOutputSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe("Invalid Shapes", () => {
    it("should fail validation if required fields are missing", () => {
      const missingSignal = {
        aiSummary: "The developer has consistent contributions over the last 12 months.",
        strengthChips: ["Databases", "Authentication", "Consistent Building"],
        projectSummaries: [],
      };

      const result = AIOutputSchema.safeParse(missingSignal);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toContain("aiSignal");
      }
    });

    it("should fail validation if fields have incorrect types", () => {
      const invalidTypes = {
        aiSignal: 12345, // Should be string
        aiSummary: "Strong backend orientation.",
        strengthChips: ["Databases", "Authentication", "Consistent Building"],
        projectSummaries: [],
      };

      const result = AIOutputSchema.safeParse(invalidTypes);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toContain("aiSignal");
      }
    });

    it("should fail validation if strengthChips has less than 3 items", () => {
      const tooFewChips = {
        aiSignal: "Sustained building consistency.",
        aiSummary: "Strong backend orientation.",
        strengthChips: ["Databases", "Authentication"], // 2 chips (min is 3)
        projectSummaries: [],
      };

      const result = AIOutputSchema.safeParse(tooFewChips);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toContain("strengthChips");
        expect(result.error.issues[0]?.message).toContain(">=3");
      }
    });

    it("should fail validation if strengthChips has more than 5 items", () => {
      const tooManyChips = {
        aiSignal: "Sustained building consistency.",
        aiSummary: "Strong backend orientation.",
        strengthChips: ["Databases", "Authentication", "Docker", "Next.js", "Redis", "Prisma"], // 6 chips (max is 5)
        projectSummaries: [],
      };

      const result = AIOutputSchema.safeParse(tooManyChips);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toContain("strengthChips");
        expect(result.error.issues[0]?.message).toContain("<=5");
      }
    });

    it("should fail validation if projectSummary summary field is undefined or not nullable", () => {
      const invalidSummaryValue = {
        aiSignal: "Sustained building consistency.",
        aiSummary: "Strong backend orientation.",
        strengthChips: ["Databases", "Authentication", "Docker"],
        projectSummaries: [
          { repositoryId: "repo_1" }, // missing summary field
        ],
      };

      const result = AIOutputSchema.safeParse(invalidSummaryValue);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toContain("summary");
      }
    });

    it("should fail validation if projectSummary repositoryId is missing", () => {
      const invalidRepoId = {
        aiSignal: "Sustained building consistency.",
        aiSummary: "Strong backend orientation.",
        strengthChips: ["Databases", "Authentication", "Docker"],
        projectSummaries: [
          { summary: "missing repositoryId field" },
        ],
      };

      const result = AIOutputSchema.safeParse(invalidRepoId);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toContain("repositoryId");
      }
    });
  });
});
