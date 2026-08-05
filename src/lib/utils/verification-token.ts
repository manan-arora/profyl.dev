import { randomBytes } from "crypto";

const ALLOWED_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const SUFFIX_LENGTH = 8;
const PREFIX = "PROFYL-";

/**
 * Generates a unique, secure verification token formatted as PROFYL-XXXXXXXX
 * using only unambiguous uppercase alphanumeric characters.
 * 
 * Suffix characters are selected uniformly using Node's crypto.randomBytes().
 * 
 * @returns Formatted verification token string
 */
export function generateVerificationToken(): string {
  const bytes = randomBytes(SUFFIX_LENGTH);
  let suffix = "";
  for (let i = 0; i < SUFFIX_LENGTH; i++) {
    // ALLOWED_CHARS has a length of exactly 32. Since 256 is a multiple of 32,
    // (bytes[i] % 32) is perfectly uniformly distributed.
    const charIndex = bytes[i] % ALLOWED_CHARS.length;
    suffix += ALLOWED_CHARS[charIndex];
  }
  return `${PREFIX}${suffix}`;
}
