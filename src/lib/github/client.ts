import {
  GithubContributionsData,
  GithubGraphQLResponse,
  GithubProfile,
  GithubRepository,
  GithubSearchIssuesResponse,
} from "@/types/github";

const GITHUB_API_BASE_URL = "https://api.github.com";
const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";

const GET_GITHUB_CONTRIBUTIONS_QUERY = `
query {
  viewer {
    login
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks {
          firstDay
          contributionDays {
            date
            contributionCount
            contributionLevel
            weekday
          }
        }
      }
    }
  }
}
`;

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

export async function getGithubContributions(
  accessToken: string
): Promise<GithubContributionsData> {
  const response = await fetch(GITHUB_GRAPHQL_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ query: GET_GITHUB_CONTRIBUTIONS_QUERY }),
  });

  if (!response.ok) {
    throw new Error(
      `GitHub GraphQL API request failed with status: ${response.status} ${response.statusText}`
    );
  }

  const result: GithubGraphQLResponse<GithubContributionsData> =
    await response.json();

  if (result.errors && result.errors.length > 0) {
    const errorMessages = result.errors.map((e) => e.message).join("; ");
    throw new Error(`GitHub GraphQL API returned errors: ${errorMessages}`);
  }

  if (!result.data || !result.data.viewer) {
    throw new Error("GitHub GraphQL API response missing data");
  }

  return result.data;
}

export async function getGithubMergedPRCount(
  accessToken: string,
  username: string
): Promise<number> {
  const endpoint = `/search/issues?q=${encodeURIComponent(
    `is:pr is:merged author:${username}`
  )}`;

  const response = await request<GithubSearchIssuesResponse>(
    endpoint,
    accessToken
  );

  if (!response || typeof response.total_count !== "number") {
    throw new Error(
      "GitHub Search API response missing total_count field"
    );
  }

  return response.total_count;
}

export async function getGithubRepositoryLanguages(
  accessToken: string,
  owner: string,
  repo: string
): Promise<Record<string, number>> {
  const endpoint = `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/languages`;
  const response = await request<Record<string, number>>(endpoint, accessToken);

  if (!response || typeof response !== "object") {
    throw new Error("GitHub Languages API response missing data or malformed");
  }

  return response;
}


