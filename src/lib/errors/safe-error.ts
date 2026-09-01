/**
 * Checks if an error is a known domain/operational error with a human-readable message.
 * Returns the message if safe, otherwise returns the fallback message for internal exceptions.
 */
export function getSafeServerErrorMessage(
  error: unknown,
  fallbackMessage: string,
): string {
  if (error instanceof Error) {
    const msg = error.message;
    const isKnownDomainError =
      msg.includes("LeetCode username") ||
      msg.includes("Profyl account") ||
      msg.includes("verification code") ||
      msg.includes("Verification code") ||
      msg.includes("LeetCode profile not found") ||
      msg.includes("LeetCode API request timed out") ||
      msg.includes("Unauthorized");

    if (isKnownDomainError) {
      return msg;
    }
  }
  return fallbackMessage;
}

/**
 * Defense-in-depth fallback for client-side catch blocks.
 * Prevents Next.js framework error messages or raw stack traces from reaching UI toasts.
 */
export function sanitizeClientError(
  error: unknown,
  fallbackMessage: string,
): string {
  if (error instanceof Error && error.message) {
    const msg = error.message;
    if (
      msg.includes("Server Components render") ||
      msg.includes("Server Action") ||
      msg.includes("digest") ||
      msg.includes("An error occurred in the Server")
    ) {
      return fallbackMessage;
    }
    return msg;
  }
  return fallbackMessage;
}
