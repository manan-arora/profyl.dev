export interface GithubProfile {
  id: number;
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  company: string | null;
  location: string | null;
  blog: string | null;

  public_repos: number;
  followers: number;
  following: number;

  created_at: string;
  updated_at: string;
}

export interface GithubRepository {
     id: number;
  name: string;
  full_name: string;
  description: string | null;

  private: boolean;
  fork: boolean;
  archived: boolean;

  html_url: string;
  homepage: string | null;

  language: string | null;

  stargazers_count: number;
  forks_count: number;

  default_branch: string;

  topics: string[];

  created_at: string;
  updated_at: string;
  pushed_at: string;
}

export interface GithubContributionDay {
  date: string;
  contributionCount: number;
  contributionLevel: string;
  weekday: number;
}

export interface GithubContributionWeek {
  firstDay: string;
  contributionDays: GithubContributionDay[];
}

export interface GithubContributionCalendar {
  totalContributions: number;
  weeks: GithubContributionWeek[];
}

export interface GithubContributionsCollection {
  contributionCalendar: GithubContributionCalendar;
}

export interface GithubContributionsViewer {
  login: string;
  contributionsCollection: GithubContributionsCollection;
}

export interface GithubContributionsData {
  viewer: GithubContributionsViewer;
}

export interface GithubGraphQLError {
  message: string;
  locations?: Array<{ line: number; column: number }>;
  path?: Array<string | number>;
  extensions?: Record<string, unknown>;
}

export interface GithubGraphQLResponse<T> {
  data?: T;
  errors?: GithubGraphQLError[];
}

export interface NormalizedContributionDay {
  date: string;
  count: number;
  level: string;
  weekday: number;
}

export interface NormalizedContributionWeek {
  firstDay: string;
  days: NormalizedContributionDay[];
}

export interface NormalizedContributionCalendar {
  weeks: NormalizedContributionWeek[];
}

export interface GithubSearchIssuesResponse {
  total_count: number;
}

export interface GithubTreeEntry {
  path: string;
  type: "blob" | "tree";
  sha: string;
  size?: number;
  url: string;
}

export interface GithubRepositoryTree {
  sha: string;
  url: string;
  tree: GithubTreeEntry[];
  truncated: boolean;
}

export interface GithubFileContentResponse {
  type: string;
  encoding?: string;
  size: number;
  name: string;
  path: string;
  content?: string;
  sha: string;
}

export interface GraphQLRepositoryLanguageEdge {
  size: number;
  node: {
    name: string;
  };
}

export interface GraphQLRepositoryTopicNode {
  topic: {
    name: string;
  };
}

export interface GraphQLRepositoryNode {
  databaseId: number;
  name: string;
  nameWithOwner: string;
  description: string | null;
  isPrivate: boolean;
  isFork: boolean;
  isArchived: boolean;
  stargazerCount: number;
  forkCount: number;
  primaryLanguage: { name: string } | null;
  languages: {
    edges: GraphQLRepositoryLanguageEdge[];
  };
  repositoryTopics: {
    nodes: GraphQLRepositoryTopicNode[];
  };
  url: string;
  homepageUrl: string | null;
  defaultBranchRef: { name: string } | null;
  updatedAt: string;
}

export interface GraphQLRepositoriesData {
  viewer: {
    repositories: {
      pageInfo: {
        hasNextPage: boolean;
        endCursor: string | null;
      };
      nodes: GraphQLRepositoryNode[];
    };
  };
}
