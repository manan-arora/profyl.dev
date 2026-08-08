import { prisma } from "@/lib/prisma";
import { generateVerificationToken as generateRandomToken } from "@/lib/utils/verification-token";
import { getLeetcodeAbout } from "@/lib/leetcode/client";

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

  const existingConnection = await prisma.leetCodeCache.findFirst({
    where: {
      username: normalizedUsername,
      user: {
        isLeetcodeVerified: true,
      },
    },
  });

  if (existingConnection) {
    throw new Error(
      "This LeetCode username is already connected to another Profyl account."
    );
  }

  // Always generate a fresh token and expiration time
  const token = generateRandomToken();
  const expiresAt = new Date(
    Date.now() + VERIFICATION_TOKEN_EXPIRY_MINUTES * 60 * 1000
  );

  await prisma.leetCodeCache.upsert({
    where: {
      userId,
    },
    update: {
      verificationToken: token,
      verificationTokenExpiresAt: expiresAt,
    },
    create: {
      userId,
      verificationToken: token,
      verificationTokenExpiresAt: expiresAt,
    },
  });

  return token;
}

/**
 * Verifies LeetCode profile ownership by fetching the user's 'about' field from the LeetCode API
 * and comparing it against the generated verification token in the cache.
 * 
 * If they match, marks the user as verified and persists their LeetCode username atomically.
 * 
 * @param userId - The user's ID
 * @param username - The LeetCode username submitted by the user
 */
async function verifyOwnership(
  userId: string,
  username: string
): Promise<void> {
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

  // 1. Race-condition check: check if username is already connected to another verified account
  const existingConnection = await prisma.leetCodeCache.findFirst({
    where: {
      username: normalizedUsername,
      user: {
        isLeetcodeVerified: true,
      },
    },
  });

  if (existingConnection) {
    throw new Error(
      "This LeetCode username is already connected to another Profyl account."
    );
  }

  // 2. Retrieve the active verification token and expiry
  const cache = await prisma.leetCodeCache.findUnique({
    where: {
      userId,
    },
  });

  if (!cache || !cache.verificationToken) {
    throw new Error("No active verification code found. Please generate a new verification code.");
  }

  if (cache.verificationTokenExpiresAt && cache.verificationTokenExpiresAt < new Date()) {
    throw new Error("Verification code has expired. Please generate a new code.");
  }

  // 3. Call external API client to get user's 'about' section
  const clientResponse = await getLeetcodeAbout(normalizedUsername);

  // 4. Compare token against returned 'about' string (trimmed, case-sensitive)
  const dbToken = cache.verificationToken.trim();
  const apiAbout = clientResponse.about.trim();

  if (dbToken !== apiAbout) {
    throw new Error(
      "Verification code does not match. Please ensure the code is added to your LeetCode profile README."
    );
  }

  // 5. Atomic database updates via transaction:
  // - Mark User as verified
  // - Persist username, set verifiedAt, and clear token details in LeetCodeCache
  await prisma.$transaction([
    prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        isLeetcodeVerified: true,
      },
    }),
    prisma.leetCodeCache.update({
      where: {
        userId,
      },
      data: {
        username: normalizedUsername,
        verifiedAt: new Date(),
        verificationToken: null,
        verificationTokenExpiresAt: null,
      },
    }),
  ]);
}

export const leetcodeService = {
  generateVerificationToken,
  verifyOwnership,
};
