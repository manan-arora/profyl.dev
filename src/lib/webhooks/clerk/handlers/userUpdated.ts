import { UserJSON } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function handleUserUpdated(data: UserJSON) {
  const clerkId = data.id;

  // Extract primary email
  const primaryEmailId = data.primary_email_address_id;
  const emailObj = data.email_addresses.find((e) => e.id === primaryEmailId);
  const email =
    emailObj?.email_address || data.email_addresses[0]?.email_address;

  if (!email) {
    throw new Error(
      `[Clerk Webhook] Missing email address for update of user: ${clerkId}`,
    );
  }

  // Extract name and avatar URL
  const name =
    `${data.first_name || ""} ${data.last_name || ""}`.trim() || null;
  const avatarUrl = data.image_url || null;

  console.log(`[Clerk Webhook] Updating user: ${clerkId}`);

  // Extract GitHub OAuth identity details from external_accounts
  const githubAccount = data.external_accounts.find(
    (acc) => acc.provider === "oauth_github",
  );

  // Update identity fields managed by Clerk/GitHub.
  // Do NOT modify application-owned fields (e.g. slug, profileStatus, scores, AI summaries).
  // If no GitHub account, it's valid — user may have disconnected temporarily.
  // Do not fail the webhook; just skip GitHub field updates.

  const updateData: any = {
    email,
    name,
    avatarUrl,
  };

  // Only update GitHub fields if a GitHub account exists
  if (githubAccount) {
    const githubUsername = githubAccount.username || data.username;
    if (githubUsername) {
      updateData.githubUsername = githubUsername;
    }
  }

  await prisma.user.updateMany({
    where: { clerkId },
    data: updateData,
  });
}
