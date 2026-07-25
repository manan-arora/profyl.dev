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

  topics: string[];

  created_at: string;
  updated_at: string;
  pushed_at: string;
}