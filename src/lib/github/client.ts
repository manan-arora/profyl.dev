import { GithubProfile, GithubRepository } from "@/types/github";

const GITHUB_API_BASE_URL = "https://api.github.com";

async function request<T>(
  endpoint: string,
  accessToken: string
): Promise<T> {
  const url = `${GITHUB_API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2026-03-10",
    },
  });

  if (!response.ok) {
    throw new Error(
      `GitHub API request failed with status: ${response.status} ${response.statusText}`
    );
  }

  return response.json() as Promise<T>;
}

export async function getGithubProfile(
  accessToken: string
): Promise<GithubProfile> {
  return request<GithubProfile>("/user", accessToken);
}

export async function getGithubRepositories(
  accessToken: string
): Promise<GithubRepository[]> {
  return request<GithubRepository[]>(
    "/user/repos?per_page=100&sort=updated&direction=desc",
    accessToken
  );
}
