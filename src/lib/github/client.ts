import {
  GithubContributionsData,
  GithubGraphQLResponse,
  GithubProfile,
  GithubRepository,
  GithubSearchIssuesResponse,
  GithubRepositoryTree,
  GithubFileContentResponse,
  GraphQLRepositoriesData,
  GraphQLRepositoryNode,
} from "@/types/github";
import { GitHubAuthError } from "@/lib/errors/GitHubAuthError";

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

const GET_GITHUB_REPOSITORIES_QUERY = `
query GetUserRepositories($cursor: String) {
  viewer {
    repositories(
      first: 100
      after: $cursor
      orderBy: { field: UPDATED_AT, direction: DESC }
      ownerAffiliations: [OWNER]
    ) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        databaseId
        name
        nameWithOwner
        description
        isPrivate
        isFork
        isArchived
        stargazerCount
        forkCount
        primaryLanguage {
          name
        }
        languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
          edges {
            size
            node {
              name
            }
          }
        }
        repositoryTopics(first: 10) {
          nodes {
            topic {
              name
            }
          }
        }
        url
        homepageUrl
        defaultBranchRef {
          name
        }
        updatedAt
      }
    }
  }
}
`;

async function request<T>(endpoint: string, accessToken: string): Promise<T> {
  const url = `${GITHUB_API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2026-03-10",
    },
  });

  if (!response.ok) {
    // Treat 401 as authentication failure
    if (response.status === 401) {
      throw new GitHubAuthError(
        `GitHub API returned ${response.status} ${response.statusText}`,
        "Your GitHub access needs to be reconnected. Please sign out and sign in with GitHub again.",
      );
    }

    // All other errors (403, 404, 500, etc.) are returned as generic errors
    throw new Error(
      `GitHub API request failed with status: ${response.status} ${response.statusText}`,
    );
  }

  return response.json() as Promise<T>;
}

export async function getGithubProfile(
  accessToken: string,
): Promise<GithubProfile> {
  return request<GithubProfile>("/user", accessToken);
}

export async function getGithubRepositories(
  accessToken: string,
): Promise<GithubRepository[]> {
  return request<GithubRepository[]>(
    "/user/repos?per_page=100&sort=updated&direction=desc",
    accessToken,
  );
}

export async function getGithubRepositoriesGraphQL(
  accessToken: string,
): Promise<GraphQLRepositoryNode[]> {
  const allNodes: GraphQLRepositoryNode[] = [];
  let hasNextPage = true;
  let cursor: string | null = null;

  while (hasNextPage) {
    const response = await fetch(GITHUB_GRAPHQL_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: GET_GITHUB_REPOSITORIES_QUERY,
        variables: { cursor },
      }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new GitHubAuthError(
          `GitHub API returned ${response.status} ${response.statusText}`,
          "Your GitHub access needs to be reconnected. Please sign out and sign in with GitHub again.",
        );
      }
      throw new Error(
        `GitHub GraphQL API request failed with status: ${response.status} ${response.statusText}`,
      );
    }

    const result: GithubGraphQLResponse<GraphQLRepositoriesData> =
      await response.json();

    if (result.errors && result.errors.length > 0) {
      const errorMessages = result.errors.map((e) => e.message).join("; ");
      throw new Error(`GitHub GraphQL API returned errors: ${errorMessages}`);
    }

    if (!result.data || !result.data.viewer || !result.data.viewer.repositories) {
      throw new Error("GitHub GraphQL API response missing repositories data");
    }

    const repoData = result.data.viewer.repositories;
    allNodes.push(...repoData.nodes);

    hasNextPage = repoData.pageInfo.hasNextPage;
    cursor = repoData.pageInfo.endCursor;
  }

  return allNodes;
}

export async function getGithubContributions(
  accessToken: string,
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
      `GitHub GraphQL API request failed with status: ${response.status} ${response.statusText}`,
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
  username: string,
): Promise<number> {
  const endpoint = `/search/issues?q=${encodeURIComponent(
    `is:pr is:merged author:${username}`,
  )}`;

  const response = await request<GithubSearchIssuesResponse>(
    endpoint,
    accessToken,
  );

  if (!response || typeof response.total_count !== "number") {
    throw new Error("GitHub Search API response missing total_count field");
  }

  return response.total_count;
}

export async function getGithubRepositoryLanguages(
  accessToken: string,
  owner: string,
  repo: string,
): Promise<Record<string, number>> {
  const endpoint = `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/languages`;
  const response = await request<Record<string, number>>(endpoint, accessToken);

  if (!response || typeof response !== "object") {
    throw new Error("GitHub Languages API response missing data or malformed");
  }

  return response;
}

export async function getGithubRepositoryTree(
  accessToken: string,
  owner: string,
  repo: string,
  branch: string,
): Promise<GithubRepositoryTree> {
  const endpoint = `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(
    repo,
  )}/git/trees/${encodeURIComponent(branch)}?recursive=1`;

  const response = await request<GithubRepositoryTree>(endpoint, accessToken);

  if (!response || !Array.isArray(response.tree)) {
    throw new Error("GitHub Git Trees API response missing tree or malformed");
  }

  return response;
}

export async function getGithubFileContent(
  accessToken: string,
  owner: string,
  repo: string,
  path: string,
  branch: string,
): Promise<string> {
  const encodedPath = path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  const endpoint = `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(
    repo,
  )}/contents/${encodedPath}?ref=${encodeURIComponent(branch)}`;

  const response = await request<
    GithubFileContentResponse | GithubFileContentResponse[]
  >(endpoint, accessToken);

  if (Array.isArray(response) || !response || typeof response !== "object") {
    throw new Error(
      `GitHub contents API returned non-file response for path: ${path}`,
    );
  }

  if (response.type !== "file") {
    throw new Error(
      `GitHub contents API path is not a file: ${path} (type: ${response.type})`,
    );
  }

  if (typeof response.content !== "string") {
    throw new Error(
      `GitHub contents API response missing content for path: ${path}`,
    );
  }

  if (response.encoding === "base64") {
    return Buffer.from(response.content, "base64").toString("utf-8");
  }

  return response.content;
}

export async function getGithubReadme(
  accessToken: string,
  owner: string,
  repo: string,
): Promise<string> {
  const endpoint = `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(
    repo,
  )}/readme`;

  const response = await request<GithubFileContentResponse>(
    endpoint,
    accessToken,
  );

  if (Array.isArray(response) || !response || typeof response !== "object") {
    throw new Error(
      `GitHub readme API returned non-file response for repo: ${owner}/${repo}`,
    );
  }

  if (typeof response.content !== "string") {
    throw new Error(
      `GitHub readme API response missing content for repo: ${owner}/${repo}`,
    );
  }

  if (response.encoding === "base64") {
    return Buffer.from(response.content, "base64").toString("utf-8");
  }

  return response.content;
}
