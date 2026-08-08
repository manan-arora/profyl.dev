import { LeetcodeAboutResponse } from "@/types/leetcode";

const REQUEST_TIMEOUT_MS = 10_000;

export async function getLeetcodeAbout(
    username: string
): Promise<LeetcodeAboutResponse> {
    const baseUrl = process.env.LEETCODE_API_URL;

    if (!baseUrl) {
        throw new Error("LEETCODE_API_URL environment variable is not defined");
    }

    const url = `${baseUrl.replace(/\/$/, "")}/${username}/about`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
        const response = await fetch(url, {
            signal: controller.signal,
        });

        if (!response.ok) {
            throw new Error(
                `LeetCode API request failed with status ${response.status} ${response.statusText}`
            );
        }

        const data = await response.json();

        // The deployed API returns HTTP 200 even when the username doesn't exist.
        if (Array.isArray(data?.errors) && data.errors.length > 0) {
            const message = data.errors[0]?.message;

            if (message === "That user does not exist.") {
                throw new Error("LeetCode profile not found");
            }

            throw new Error(
                `LeetCode API error: ${message ?? "Unknown API error"}`
            );
        }

        return data as LeetcodeAboutResponse;
    } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
            throw new Error("LeetCode API request timed out");
        }

        throw error;
    } finally {
        clearTimeout(timeoutId);
    }
}