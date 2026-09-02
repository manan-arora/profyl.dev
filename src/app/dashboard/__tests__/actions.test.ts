/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { saveChangesAction, retryDerivedDataPipelineAction } from "../actions";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getProfylPageData } from "@/lib/services/profyl-page.service";
import {
  ensureSourceDataFresh,
  runDerivedDataPipeline,
} from "@/lib/services/freshness.service";

// Mock dependencies
vi.mock("@/lib/prisma", () => ({
  prisma: {
    repository: {
      findMany: vi.fn(),
    },
    profile: {
      findUnique: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/lib/auth/current-user", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("@/lib/services/profyl-page.service", () => ({
  getProfylPageData: vi.fn(),
}));

vi.mock("@/lib/services/freshness.service", () => ({
  ensureSourceDataFresh: vi.fn(),
  runDerivedDataPipeline: vi.fn(),
}));

describe("Dashboard Save/Publish Action", () => {
  const mockUser = {
    id: "user_123",
    clerkId: "clerk_123",
    email: "test@example.com",
    githubUsername: "testuser",
    slug: "testuser",
    profileStatus: "DRAFT",
    isPublished: false,
    publishedAt: null,
  };

  const validProfile = {
    name: "Alex Karim",
    headline: "Senior Platform Engineer",
    bio: "Passionate engineer with extensive cloud experience.",
    currentRole: "Platform Lead",
    currentCompany: "Acme Corp",
    yearsExperience: 8,
    location: "San Francisco, CA",
    college: "UC Berkeley",
    degree: "B.S.",
    graduationYear: 2018,
    branch: "Computer Science",
    techStack: ["React", "TypeScript", "Node.js", "Docker"],
    linkedinUrl: "https://linkedin.com/in/alex",
    portfolioUrl: "https://alex.dev",
    resumeUrl: "https://drive.google.com/file/d/123/view",
  };

  const validProject = {
    id: "repo_1",
    isFeatured: true,
    displayOrder: 1,
    customTitle: "My Project",
    customDescription: "A custom description of my project.",
    liveDemoUrl: "https://demo.myproject.com",
    topics: ["react", "nextjs"],
  };

  const mockTx = {
    profile: {
      update: vi.fn(),
    },
    repository: {
      update: vi.fn(),
    },
    user: {
      update: vi.fn(),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock behavior
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser as any);
    vi.mocked(prisma.repository.findMany).mockResolvedValue([
      { id: "repo_1" },
    ] as any);
    vi.mocked(prisma.$transaction).mockImplementation(async (cb) =>
      cb(mockTx as any),
    );
    vi.mocked(getProfylPageData).mockResolvedValue({} as any);
    vi.mocked(prisma.profile.findUnique).mockResolvedValue({} as any);
    vi.mocked(ensureSourceDataFresh).mockResolvedValue({
      anyRefreshed: false,
    } as any);
    vi.mocked(runDerivedDataPipeline).mockResolvedValue(undefined);

    mockTx.profile.update.mockResolvedValue({} as any);
    mockTx.repository.update.mockResolvedValue({} as any);
    mockTx.user.update.mockResolvedValue({} as any);
  });

  describe("Validation Limits", () => {
    it("should fail validation if bio exceeds 180 characters", async () => {
      const invalidProfile = {
        ...validProfile,
        bio: "a".repeat(181),
      };

      const result = await saveChangesAction({
        profile: invalidProfile,
        projects: [validProject],
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Profile validation failed");
      expect(result.error).toContain("bio");
    });

    it("should fail validation if tech stack exceeds 6 items", async () => {
      const invalidProfile = {
        ...validProfile,
        techStack: ["1", "2", "3", "4", "5", "6", "7"],
      };

      const result = await saveChangesAction({
        profile: invalidProfile,
        projects: [validProject],
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Profile validation failed");
      expect(result.error).toContain("techStack");
    });

    it("should fail validation if a project topics list exceeds 20 items", async () => {
      const invalidProject = {
        ...validProject,
        topics: Array.from({ length: 21 }, (_, i) => `topic-${i}`),
      };

      const result = await saveChangesAction({
        profile: validProfile,
        projects: [invalidProject],
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Project validation failed");
      expect(result.error).toContain("topics");
    });

    it("should fail validation if URL fields are invalid", async () => {
      const invalidProfile = {
        ...validProfile,
        linkedinUrl: "not-a-valid-url",
      };

      const result = await saveChangesAction({
        profile: invalidProfile,
        projects: [validProject],
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Profile validation failed");
    });

    it("should fail validation if currentRole exceeds 60 characters", async () => {
      const invalidProfile = {
        ...validProfile,
        currentRole: "a".repeat(61),
      };

      const result = await saveChangesAction({
        profile: invalidProfile,
        projects: [validProject],
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Profile validation failed");
      expect(result.error).toContain("currentRole");
    });

    it("should fail validation if location exceeds 40 characters", async () => {
      const invalidProfile = {
        ...validProfile,
        location: "a".repeat(41),
      };

      const result = await saveChangesAction({
        profile: invalidProfile,
        projects: [validProject],
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Profile validation failed");
      expect(result.error).toContain("location");
    });

    it("should fail validation if degree exceeds 20 characters", async () => {
      const invalidProfile = {
        ...validProfile,
        degree: "a".repeat(21),
      };

      const result = await saveChangesAction({
        profile: invalidProfile,
        projects: [validProject],
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Profile validation failed");
      expect(result.error).toContain("degree");
    });

    it("should fail if there are more than 4 featured projects", async () => {
      const projects = Array.from({ length: 5 }, (_, i) => ({
        ...validProject,
        id: `repo_${i}`,
        isFeatured: true,
      }));

      vi.mocked(prisma.repository.findMany).mockResolvedValue(
        projects.map((p) => ({ id: p.id })) as any,
      );

      const result = await saveChangesAction({
        profile: validProfile,
        projects,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("You can feature a maximum of 4 projects");
    });

    it("should fail validation if a non-featured project contains custom metadata", async () => {
      const customNonFeaturedProject = {
        ...validProject,
        isFeatured: false,
        customTitle: "Bypassed Title",
      };

      vi.mocked(prisma.repository.findMany).mockResolvedValue([
        { id: customNonFeaturedProject.id },
      ] as any);

      const result = await saveChangesAction({
        profile: validProfile,
        projects: [customNonFeaturedProject],
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Only featured projects can be customized.");
    });
  });

  describe("Ownership Authorization", () => {
    it("should fail if one or more modified repositories do not belong to the user", async () => {
      // Mock db returning only 1 repo when 2 were submitted
      vi.mocked(prisma.repository.findMany).mockResolvedValue([
        { id: "repo_1" },
      ] as any);

      const result = await saveChangesAction({
        profile: validProfile,
        projects: [validProject, { ...validProject, id: "repo_2" }],
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain(
        "do not exist or do not belong to this user",
      );
    });
  });

  describe("Profile Status Transitions", () => {
    it("should transition profileStatus from DRAFT to PUBLISHED and set publishedAt", async () => {
      const result = await saveChangesAction({
        profile: validProfile,
        projects: [validProject],
        hasProjectChanges: true,
      });

      expect(result.success).toBe(true);
      expect(result.profileStatus).toBe("PUBLISHED");
      expect(mockTx.user.update).toHaveBeenCalledWith({
        where: { id: "user_123" },
        data: expect.objectContaining({
          profileStatus: "PUBLISHED",
          isPublished: true,
          publishedAt: expect.any(Date),
        }),
      });
    });

    it("should preserve publishedAt and not update User table if profile is already PUBLISHED", async () => {
      const alreadyPublishedUser = {
        ...mockUser,
        profileStatus: "PUBLISHED",
        isPublished: true,
        publishedAt: new Date("2026-08-15T12:00:00Z"),
      };
      vi.mocked(getCurrentUser).mockResolvedValue(alreadyPublishedUser as any);

      const result = await saveChangesAction({
        profile: validProfile,
        projects: [validProject],
        hasProjectChanges: true,
      });

      expect(result.success).toBe(true);
      expect(result.profileStatus).toBe("PUBLISHED");
      expect(mockTx.user.update).not.toHaveBeenCalled();
    });
  });

  describe("Transaction Rollback", () => {
    it("should catch transaction failures and return a clean error without saving changes", async () => {
      // Force profile update to fail inside transaction
      mockTx.profile.update.mockRejectedValue(
        new Error("Database transaction failed"),
      );

      const result = await saveChangesAction({
        profile: validProfile,
        projects: [validProject],
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe(
        "Couldn't save your changes. Please try again.",
      );
    });

    it("should hide unexpected server exceptions from the client", async () => {
      vi.mocked(getProfylPageData).mockRejectedValueOnce(
        new Error("Unexpected filesystem path: C:/internal/profile-data"),
      );

      const result = await saveChangesAction({
        profile: validProfile,
        projects: [validProject],
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe(
        "Couldn't save your changes. Please try again.",
      );
      expect(result.error).not.toContain("filesystem");
      expect(result.error).not.toContain("C:/internal");
    });
  });

  describe("Pipeline Resilience & Retry Action", () => {
    it("should commit user edits even if subsequent pipeline execution fails", async () => {
      vi.mocked(runDerivedDataPipeline).mockRejectedValueOnce(
        new Error("Gemini quota exceeded"),
      );

      const result = await saveChangesAction({
        profile: validProfile,
        projects: [validProject],
        hasProjectChanges: true,
      });

      expect(result.success).toBe(true);
      expect(result.derivedDataFailed).toBe(true);
      expect(result.pipelineError).toBe(
        "Couldn't save your changes. Please try again.",
      );
      expect(mockTx.profile.update).toHaveBeenCalled();
    });

    it("should skip derived processing for profile-only saves", async () => {
      const result = await saveChangesAction({
        profile: validProfile,
        projects: [validProject],
        hasProjectChanges: false,
      });

      expect(result.success).toBe(true);
      expect(ensureSourceDataFresh).not.toHaveBeenCalled();
      expect(runDerivedDataPipeline).not.toHaveBeenCalled();
    });

    it("should run derived processing when projects changed", async () => {
      const result = await saveChangesAction({
        profile: validProfile,
        projects: [validProject],
        hasProjectChanges: true,
      });

      expect(result.success).toBe(true);
      expect(ensureSourceDataFresh).toHaveBeenCalledWith("user_123");
      expect(runDerivedDataPipeline).toHaveBeenCalledWith("user_123");
    });

    it("should run retryDerivedDataPipelineAction successfully without executing user edit transaction", async () => {
      const result = await retryDerivedDataPipelineAction();

      expect(result.success).toBe(true);
      expect(ensureSourceDataFresh).toHaveBeenCalled();
      expect(runDerivedDataPipeline).toHaveBeenCalled();
      expect(mockTx.profile.update).not.toHaveBeenCalled();
    });

    it("should return success: false when retryAction fails", async () => {
      vi.mocked(runDerivedDataPipeline).mockRejectedValueOnce(
        new Error("Internal API timeout"),
      );

      const result = await retryDerivedDataPipelineAction();

      expect(result.success).toBe(false);
      expect(result.error).toBe(
        "An unexpected error occurred during retry. Please try again.",
      );
    });
  });

  describe("Dirty Repository Filtering", () => {
    it("should execute 0 repository updates when projects array is empty (profile-only edit)", async () => {
      const result = await saveChangesAction({
        profile: validProfile,
        projects: [],
      });

      expect(result.success).toBe(true);
      expect(mockTx.profile.update).toHaveBeenCalled();
      expect(mockTx.repository.update).not.toHaveBeenCalled();
    });

    it("should execute 0 repository updates when 50 submitted repositories match database baseline", async () => {
      const repos = Array.from({ length: 50 }, (_, i) => ({
        id: `repo_${i}`,
        isFeatured: false,
        displayOrder: null,
        customTitle: null,
        customDescription: null,
        liveDemoUrl: null,
        topics: [],
      }));

      // Mock database state matching all 50 submitted repos
      vi.mocked(prisma.repository.findMany).mockResolvedValue(
        repos.map((r) => ({ ...r })) as any,
      );

      const result = await saveChangesAction({
        profile: validProfile,
        projects: repos,
      });

      expect(result.success).toBe(true);
      expect(mockTx.profile.update).toHaveBeenCalled();
      expect(mockTx.repository.update).not.toHaveBeenCalled();
    });

    it("should execute exactly 1 repository update when only 1 of multiple submitted projects is modified", async () => {
      const cleanRepo = {
        id: "repo_clean",
        isFeatured: false,
        displayOrder: null,
        customTitle: null,
        customDescription: null,
        liveDemoUrl: null,
        topics: ["react"],
      };

      const dirtyRepoSubmitted = {
        id: "repo_dirty",
        isFeatured: true,
        displayOrder: 1,
        customTitle: "Updated Title",
        customDescription: "Updated Description",
        liveDemoUrl: "https://example.com",
        topics: ["react", "nextjs"],
      };

      // Mock DB state: repo_clean is unchanged, repo_dirty had old values in DB
      vi.mocked(prisma.repository.findMany).mockResolvedValue([
        { ...cleanRepo },
        {
          id: "repo_dirty",
          isFeatured: false,
          displayOrder: null,
          customTitle: null,
          customDescription: null,
          liveDemoUrl: null,
          topics: [],
        },
      ] as any);

      const result = await saveChangesAction({
        profile: validProfile,
        projects: [cleanRepo, dirtyRepoSubmitted],
      });

      expect(result.success).toBe(true);
      expect(mockTx.repository.update).toHaveBeenCalledTimes(1);
      expect(mockTx.repository.update).toHaveBeenCalledWith({
        where: { id: "repo_dirty" },
        data: {
          isFeatured: true,
          displayOrder: 1,
          customTitle: "Updated Title",
          customDescription: "Updated Description",
          liveDemoUrl: "https://example.com",
          topics: ["react", "nextjs"],
        },
      });
    });
  });
});
