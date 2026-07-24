import { UserJSON } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function handleUserUpdated(data: UserJSON) {
  const clerkId = data.id;

  // Extract primary email
  const primaryEmailId = data.primary_email_address_id;
  const emailObj = data.email_addresses.find((e) => e.id === primaryEmailId);
  const email = emailObj?.email_address || data.email_addresses[0]?.email_address;

  if (!email) {
    throw new Error(`[Clerk Webhook] Missing email address for update of user: ${clerkId}`);
  }

  console.log(`[Clerk Webhook] Updating user: ${clerkId} (New Email: ${email})`);

   // Extract GitHub OAuth identity details from external_accounts
  const githubAccount = data.external_accounts.find(
    (acc) => acc.provider === "oauth_github"
  );

  if (!githubAccount) {
    throw new Error(`[Clerk Webhook] No GitHub account linked for user: ${clerkId}`);
  }

  const githubUsername = githubAccount.username || data.username;

  if (!githubUsername) {
    throw new Error(`[Clerk Webhook] Missing GitHub account details for user: ${clerkId}`);
  }


// Update identity fields managed by Clerk/GitHub.
// Do NOT modify application-owned fields (e.g. slug, profileStatus, scores, AI summaries).
  await prisma.user.updateMany({
    where: { clerkId },
    data: {
  email,
  githubUsername,
}
  });
}
