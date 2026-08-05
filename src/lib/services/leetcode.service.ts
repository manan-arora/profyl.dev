import { prisma } from "@/lib/prisma";
import { generateVerificationToken as generateRandomToken } from "@/lib/utils/verification-token";
import { Prisma } from "@/generated/prisma/client";

const VERIFICATION_TOKEN_EXPIRY_MINUTES = 30;
const LEETCODE_USERNAME_REGEX = /^[a-zA-Z0-9_-]+$/;

/**
 * Validates and normalizes the LeetCode username, generates a new verification token
 * and its expiry time, persists these details to the LeetCodeCache, and returns the token.
 * 
 * If the username is already taken by another account, throws a user-friendly error.
 * 
 * @param userId - The user's ID
 * @param username - The LeetCode username submitted by the user
 * @returns The generated verification token string
 */
async function generateVerificationToken(
  userId: string,
  username: string
): Promise<string> {
  const normalizedUsername = username.trim();

  // Validate that the username is not empty
  if (!normalizedUsername) {
    throw new Error("LeetCode username is required");
  }

  // Validate that the username matches LeetCode's allowed character set
  if (!LEETCODE_USERNAME_REGEX.test(normalizedUsername)) {
    throw new Error(
      "Invalid LeetCode username. Only alphanumeric characters, underscores, and hyphens are allowed."
    );
  }

  // Always generate a fresh token and expiration time
  const token = generateRandomToken();
  const expiresAt = new Date(
    Date.now() + VERIFICATION_TOKEN_EXPIRY_MINUTES * 60 * 1000
  );

  try {
    await prisma.leetCodeCache.upsert({
      where: {
        userId,
      },
      update: {
        username: normalizedUsername,
        verificationToken: token,
        verificationTokenExpiresAt: expiresAt,
      },
      create: {
        userId,
        username: normalizedUsername,
        verificationToken: token,
        verificationTokenExpiresAt: expiresAt,
      },
    });

    return token;
  } catch (error) {
    // Catch database unique constraint violations (e.g. if username is already in use)
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new Error(
        "This LeetCode username is already connected to another Profyl account."
      );
    }
    throw error;
  }
}

export const leetcodeService = {
  generateVerificationToken,
};
