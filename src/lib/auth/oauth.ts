import { clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

/**
 * Retrieves the GitHub OAuth access token for a given user from Clerk.
 * 
 * @param userId The internal database ID of the Profyl user.
 * @returns The GitHub OAuth access token string.
 * @throws Error if the user does not exist or has no GitHub OAuth access token.
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

  console.log("Internal user:", user);

  const oauthAccessTokens = await client.users.getUserOauthAccessToken(
    user.clerkId,
    "github"
  );

  console.log(oauthAccessTokens);

  const tokenObj = oauthAccessTokens.data?.[0];
  const accessToken = tokenObj?.token;

  if (!accessToken) {
    throw new Error(`No GitHub OAuth access token found for user`);
  }

  return accessToken;
}
