import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface GitHubRepo {
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  topics: string[];
  created_at: string;
  updated_at: string;
  fork: boolean;
}

@Injectable()
export class GitHubService implements OnModuleInit {
  private username: string;
  private headers: Record<string, string>;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    this.username = this.config.get<string>('GITHUB_USERNAME')!;
    const token = this.config.get<string>('GITHUB_TOKEN');

    this.headers = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'johnscodinglab-portfolio-backend',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async getRepos() {
    const response = await fetch(
      `https://api.github.com/users/${this.username}/repos?per_page=100&sort=updated`,
      { headers: this.headers },
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const repos: GitHubRepo[] = await response.json();

    // Filter out forks and map to a cleaner shape
    return repos
      .filter((repo) => !repo.fork)
      .map((repo) => ({
        name: repo.name,
        description: repo.description,
        url: repo.html_url,
        homepage: repo.homepage,
        language: repo.language,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        topics: repo.topics,
        updatedAt: repo.updated_at,
      }));
  }

  async getProfile() {
    const response = await fetch(
      `https://api.github.com/users/${this.username}`,
      { headers: this.headers },
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const profile = await response.json();

    return {
      name: profile.name,
      bio: profile.bio,
      avatarUrl: profile.avatar_url,
      publicRepos: profile.public_repos,
      followers: profile.followers,
      profileUrl: profile.html_url,
    };
  }
}
