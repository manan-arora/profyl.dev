import { UserJSON } from "@clerk/nextjs/server";
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

  console.log(`[Clerk Webhook] Upserting user: ${clerkId} (GitHub: ${githubUsername}, Slug: ${slug})`);

  // Perform Prisma upsert to guarantee idempotency
  await prisma.user.upsert({
    where: { clerkId },
    create: {
      clerkId,
      email,
      githubId,
      githubUsername,
      slug,
      profileStatus: ProfileStatus.INCOMPLETE,
    },
    update: {
      email,
      githubId,
      githubUsername,
      slug,
    },
  });
}
