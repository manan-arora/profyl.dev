/**
 * Thrown when GitHub authentication or authorization fails.
 * Used to distinguish revoked/missing token from other API errors.
 */
export class GitHubAuthError extends Error {
  constructor(
    message: string,
    public readonly userMessage: string = "Your GitHub access needs to be reconnected. Please sign out and sign in with GitHub again.",
  ) {
    super(message);
    this.name = "GitHubAuthError";
  }
}
