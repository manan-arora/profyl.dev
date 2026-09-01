import { UserJSON, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { ProfileStatus } from "@/generated/prisma/client";

export async function handleUserCreated(data: UserJSON) {
  const clerkId = data.id;

  // Extract primary email address
  const primaryEmailId = data.primary_email_address_id;
  const emailObj = data.email_addresses.find((e) => e.id === primaryEmailId);
  const email = emailObj?.email_address || data.email_addresses[0]?.email_address;

  if (!email) {
    throw new Error(`[Clerk Webhook] Missing email address for user: ${clerkId}`);
  }

  // Extract GitHub OAuth identity details from external_accounts
  const githubAccount = data.external_accounts.find(
    (acc) => acc.provider === "oauth_github"
  );

  if (!githubAccount) {
    throw new Error(`[Clerk Webhook] No GitHub account linked for user: ${clerkId}`);
  }

  const githubId = githubAccount.provider_user_id;
  const githubUsername = githubAccount.username || data.username;

  if (!githubId || !githubUsername) {
    throw new Error(`[Clerk Webhook] Missing GitHub account details for user: ${clerkId}`);
  }

  // Generate unique slug from githubUsername
  const slug = githubUsername.toLowerCase();

  // Extract name and avatar URL
  const name = `${data.first_name || ""} ${data.last_name || ""}`.trim() || null;
  const avatarUrl = data.image_url || null;

  console.log(`[Clerk Webhook] Processing user creation: ${clerkId} (GitHub: ${githubUsername}, Slug: ${slug})`);

  // 1. Check if user already exists for this exact clerkId
  const existingUserByClerkId = await prisma.user.findUnique({
    where: { clerkId },
  });

  if (existingUserByClerkId) {
    console.log(`[Clerk Webhook] User already exists for clerkId ${clerkId}. Updating identity fields.`);
    // Update identity fields managed by Clerk/GitHub.
    // Do NOT overwrite application-owned fields (e.g. slug, profileStatus).
    await prisma.user.update({
      where: { clerkId },
      data: {
        email,
        name,
        avatarUrl,
        githubId,
        githubUsername,
      },
    });
    return;
  }

  // 2. Check if a User record exists with matching email or githubId under a different clerkId
  const collisionUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { githubId }],
    },
  });

  if (collisionUser && collisionUser.clerkId !== clerkId) {
    const oldClerkId = collisionUser.clerkId;
    console.log(`[Clerk Webhook] Collision detected with existing User record ${collisionUser.id} (clerkId: ${oldClerkId}). Verifying with Clerk API...`);

    let isNotFoundInClerk = false;
    try {
      const client = await clerkClient();
      await client.users.getUser(oldClerkId);
      // If getUser succeeds, oldClerkId is still active in Clerk!
    } catch (err: any) {
      if (
        err?.status === 404 ||
        err?.errors?.[0]?.code === "resource_not_found" ||
        err?.message?.includes("not found")
      ) {
        isNotFoundInClerk = true;
      } else {
        // Any non-404 error (500, rate limit, network timeout) must fail safely without deletion
        throw new Error(
          `[Clerk Webhook] Transient error verifying Clerk user ${oldClerkId}: ${err?.message || err}. Aborting orphan deletion.`
        );
      }
    }

    if (!isNotFoundInClerk) {
      // The matching email/GitHub identity belongs to an active Clerk user!
      throw new Error(
        `[Clerk Webhook] Conflict: Cannot create user ${clerkId}. Matching email/GitHub identity belongs to active Clerk user ${oldClerkId}.`
      );
    }

    // Authoritative 404 confirmed from Clerk API! Clean up orphaned DB record.
    console.log(`[Clerk Webhook] Clerk API confirmed user ${oldClerkId} is 404 Not Found. Cleaning up orphaned DB record ${collisionUser.id}.`);
    await prisma.user.delete({
      where: { id: collisionUser.id },
    });
  }

  // 3. Create fresh User record for newClerkId
  console.log(`[Clerk Webhook] Creating fresh User record for clerkId: ${clerkId}`);
  await prisma.user.create({
    data: {
      clerkId,
      email,
      name,
      avatarUrl,
      githubId,
      githubUsername,
      slug,
      profileStatus: ProfileStatus.INCOMPLETE,
    },
  });
}

