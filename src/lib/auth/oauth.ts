import { clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { GitHubAuthError } from "@/lib/errors/GitHubAuthError";

/**
 * Retrieves the GitHub OAuth access token for a given user from Clerk.
 *
 * @param userId The internal database ID of the Profyl user.
 * @returns The GitHub OAuth access token string.
 * @throws GitHubAuthError if the user does not exist or has no GitHub OAuth access token.
 */

export async function getGithubAccessToken(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { clerkId: true },
  });

  if (!user) {
    throw new Error(`User not found`);
  }

  const client = await clerkClient();

  const oauthAccessTokens = await client.users.getUserOauthAccessToken(
    user.clerkId,
    "github",
  );

  const tokenObj = oauthAccessTokens.data?.[0];
  const accessToken = tokenObj?.token;

  if (!accessToken) {
    throw new GitHubAuthError(
      `No GitHub OAuth access token found for user`,
      "Your GitHub access needs to be reconnected. Please sign out and sign in with GitHub again.",
    );
  }

  return accessToken;
}
