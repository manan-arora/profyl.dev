"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getProfylPageData } from "@/lib/services/profyl-page.service";
import {
  ensureSourceDataFresh,
  runDerivedDataPipeline,
  ensureProfileDataFresh,
} from "@/lib/services/freshness.service";

const SAFE_SAVE_ERROR = "Couldn't save your changes. Please try again.";

// Schema for validating URL fields (permits empty string which maps to null)
const urlSchema = z
  .string()
  .url()
  .or(z.literal(""))
  .transform((v) => (v === "" ? null : v))
  .nullable()
  .optional();

// Schema for Profile updates
const profileSaveSchema = z.object({
  name: z
    .string()
    .max(100)
    .nullable()
    .optional()
    .transform((v) => (v === "" ? null : v)),
  headline: z
    .string()
    .max(150)
    .nullable()
    .optional()
    .transform((v) => (v === "" ? null : v)),
  bio: z
    .string()
    .max(180)
    .nullable()
    .optional()
    .transform((v) => (v === "" ? null : v)), // Enforces 180 limit
  currentRole: z
    .string()
    .max(60)
    .nullable()
    .optional()
    .transform((v) => (v === "" ? null : v)),
  currentCompany: z
    .string()
    .max(60)
    .nullable()
    .optional()
    .transform((v) => (v === "" ? null : v)),
  yearsExperience: z.number().int().min(0).nullable().optional(),
  location: z
    .string()
    .max(40)
    .nullable()
    .optional()
    .transform((v) => (v === "" ? null : v)),
  college: z
    .string()
    .max(80)
    .nullable()
    .optional()
    .transform((v) => (v === "" ? null : v)),
  degree: z
    .string()
    .max(20)
    .nullable()
    .optional()
    .transform((v) => (v === "" ? null : v)),
  graduationYear: z
    .number()
    .int()
    .min(1900)
    .max(2100)
    .or(z.literal(0))
    .nullable()
    .optional()
    .transform((v) => (v === 0 ? null : v)),
  branch: z
    .string()
    .max(30)
    .nullable()
    .optional()
    .transform((v) => (v === "" ? null : v)),
  techStack: z.array(z.string().max(50)).max(8), // Enforces max 8 technologies limit
  linkedinUrl: urlSchema,
  portfolioUrl: urlSchema,
  resumeUrl: urlSchema,
});

// Schema for Project/Repository metadata updates
const projectSaveSchema = z.object({
  id: z.string(),
  isFeatured: z.boolean(),
  displayOrder: z.number().int().min(1).max(4).nullable().optional(),
  customTitle: z
    .string()
    .max(100)
    .nullable()
    .optional()
    .transform((v) => (v === "" ? null : v)),
  customDescription: z
    .string()
    .max(1000)
    .nullable()
    .optional()
    .transform((v) => (v === "" ? null : v)),
  liveDemoUrl: urlSchema,
  topics: z.array(z.string().max(50)).max(20), // Enforces max 20 topics per repository limit
});

export async function saveChangesAction(payload: {
  profile: unknown;
  projects: unknown[];
  hasProjectChanges?: boolean;
}) {
  try {
    // 1. Authenticate user
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // 2. Validate payload input server-side
    const parsedProfile = profileSaveSchema.safeParse(payload.profile);
    if (!parsedProfile.success) {
      return {
        success: false,
        error: `Profile validation failed: ${parsedProfile.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")}`,
      };
    }

    const parsedProjects: z.infer<typeof projectSaveSchema>[] = [];
    for (const p of payload.projects) {
      const parsed = projectSaveSchema.safeParse(p);
      if (!parsed.success) {
        return {
          success: false,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          error: `Project validation failed for ID ${String((p as any)?.id || "unknown")}: ${parsed.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")}`,
        };
      }
      parsedProjects.push(parsed.data);
    }

    // 3. Verify every repository being modified belongs to the authenticated user
    const projectIds = parsedProjects.map((p) => p.id);
    if (projectIds.length > 0) {
      const userRepos = await prisma.repository.findMany({
        where: {
          id: { in: projectIds },
          userId: user.id,
        },
        select: { id: true },
      });

      if (userRepos.length !== projectIds.length) {
        return {
          success: false,
          error:
            "One or more projects do not exist or do not belong to this user.",
        };
      }
    }

    // 4. Validate max 4 featured projects
    const featuredProjects = parsedProjects.filter((p) => p.isFeatured);
    if (featuredProjects.length > 4) {
      return {
        success: false,
        error: "You can feature a maximum of 4 projects.",
      };
    }

    let finalStatus = user.profileStatus;

    // 5. Run Prisma Transaction
    await prisma.$transaction(async (tx) => {
      // Persist profile changes
      await tx.profile.update({
        where: { userId: user.id },
        data: {
          name: parsedProfile.data.name,
          headline: parsedProfile.data.headline,
          bio: parsedProfile.data.bio,
          currentRole: parsedProfile.data.currentRole,
          currentCompany: parsedProfile.data.currentCompany,
          yearsExperience: parsedProfile.data.yearsExperience,
          location: parsedProfile.data.location,
          college: parsedProfile.data.college,
          degree: parsedProfile.data.degree,
          graduationYear: parsedProfile.data.graduationYear,
          branch: parsedProfile.data.branch,
          techStack: parsedProfile.data.techStack,
          linkedinUrl: parsedProfile.data.linkedinUrl,
          portfolioUrl: parsedProfile.data.portfolioUrl,
          resumeUrl: parsedProfile.data.resumeUrl,
        },
      });

      // Persist editable repository/project metadata individually
      for (const repo of parsedProjects) {
        await tx.repository.update({
          where: { id: repo.id },
          data: {
            isFeatured: repo.isFeatured,
            displayOrder: repo.displayOrder,
            customTitle: repo.customTitle,
            customDescription: repo.customDescription,
            liveDemoUrl: repo.liveDemoUrl,
            topics: repo.topics,
          },
        });
      }

      // Handle profileStatus draft/published rules
      if (user.profileStatus === "DRAFT") {
        finalStatus = "PUBLISHED";
        await tx.user.update({
          where: { id: user.id },
          data: {
            profileStatus: "PUBLISHED",
            isPublished: true,
            publishedAt: user.publishedAt || new Date(),
          },
        });
      }
    });

    let derivedDataFailed = false;
    let pipelineError: string | null = null;

    if (payload.hasProjectChanges) {
      try {
        // Ensure external source data is current, then run derived metrics calculation
        await ensureSourceDataFresh(user.id);
        await runDerivedDataPipeline(user.id);
      } catch (error: any) {
        console.error(
          "Pipeline execution failed during saveChangesAction:",
          error,
        );
        derivedDataFailed = true;
        pipelineError = SAFE_SAVE_ERROR;
      }
    }

    // 6. Fetch canonical persisted data and raw records after successful transaction commit
    const canonicalData = await getProfylPageData({ userId: user.id });
    if (!canonicalData) {
      return { success: false, error: "Failed to read updated profile data" };
    }

    const rawProfile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    const rawRepositories = await prisma.repository.findMany({
      where: { userId: user.id },
      orderBy: { githubUpdatedAt: "desc" },
    });

    return {
      success: true,
      canonicalData,
      rawProfile,
      rawRepositories,
      profileStatus: finalStatus,
      derivedDataFailed,
      pipelineError,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error saving profile changes:", error);
    return {
      success: false,
      error: SAFE_SAVE_ERROR,
    };
  }
}

/**
 * Retries execution of the derived data/AI insights generation pipeline
 * without repeating the database transaction for user edits.
 */
export async function retryDerivedDataPipelineAction() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    await ensureSourceDataFresh(user.id);
    await runDerivedDataPipeline(user.id);

    const canonicalData = await getProfylPageData({ userId: user.id });
    if (!canonicalData) {
      return { success: false, error: "Failed to read updated profile data" };
    }

    const rawProfile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    const rawRepositories = await prisma.repository.findMany({
      where: { userId: user.id },
      orderBy: { githubUpdatedAt: "desc" },
    });

    return {
      success: true,
      canonicalData,
      rawProfile,
      rawRepositories,
    };
  } catch (error: any) {
    console.error("Retry pipeline execution failed:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred during retry.",
    };
  }
}

/**
 * Server action to verify profile freshness on dashboard access/reload.
 * Performs a freshness sync and returns updated canonical and raw data if required.
 */
export async function checkDashboardFreshnessAction() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const refreshed = await ensureProfileDataFresh(user.id);

    const canonicalData = await getProfylPageData({ userId: user.id });
    if (!canonicalData) {
      return { success: false, error: "Failed to read updated profile data" };
    }

    const rawProfile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    const rawRepositories = await prisma.repository.findMany({
      where: { userId: user.id },
      orderBy: { githubUpdatedAt: "desc" },
    });

    return {
      success: true,
      refreshed,
      canonicalData,
      rawProfile,
      rawRepositories,
    };
  } catch (error: any) {
    console.error("Dashboard freshness check failed:", error);
    return {
      success: false,
      error:
        error.message || "An unexpected error occurred during freshness check.",
    };
  }
}
