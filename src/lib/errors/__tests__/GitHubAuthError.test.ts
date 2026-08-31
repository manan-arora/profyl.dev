import { describe, it, expect } from "vitest";
import { GitHubAuthError } from "../GitHubAuthError";

describe("GitHubAuthError", () => {
  it("should create an error with custom message and default user message", () => {
    const error = new GitHubAuthError("OAuth token not found");

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("GitHubAuthError");
    expect(error.message).toBe("OAuth token not found");
    expect(error.userMessage).toBe(
      "Your GitHub access needs to be reconnected. Please sign out and sign in with GitHub again.",
    );
  });

  it("should accept a custom user message", () => {
    const customMessage = "Custom reconnect message";
    const error = new GitHubAuthError("API error", customMessage);

    expect(error.message).toBe("API error");
    expect(error.userMessage).toBe(customMessage);
  });

  it("should be instanceof GitHubAuthError", () => {
    const error = new GitHubAuthError("test");
    expect(error instanceof GitHubAuthError).toBe(true);
  });

  it("should be instanceof Error", () => {
    const error = new GitHubAuthError("test");
    expect(error instanceof Error).toBe(true);
  });
});
