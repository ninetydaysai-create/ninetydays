export interface GitHubSignal {
  username: string;
  publicRepos: number;
  topLanguages: string[];
  topRepos: { name: string; description: string; stars: number; language: string }[];
}

export async function fetchGitHubSignal(githubUrl: string): Promise<GitHubSignal | null> {
  const match = githubUrl.match(/github\.com\/([^/?#]+)/);
  if (!match) return null;
  const username = match[1];

  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "NinetyDays/1.0",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  try {
    const res = await fetch(
      `https://api.github.com/users/${username}/repos?sort=updated&per_page=20&type=owner`,
      { headers, next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;

    const repos = (await res.json()) as Array<{
      name: string;
      description: string | null;
      stargazers_count: number;
      language: string | null;
      fork: boolean;
    }>;

    const own = repos.filter((r) => !r.fork);
    const languages = [...new Set(own.map((r) => r.language).filter(Boolean) as string[])];
    const topRepos = own
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 5)
      .map((r) => ({
        name: r.name,
        description: r.description ?? "",
        stars: r.stargazers_count,
        language: r.language ?? "unknown",
      }));

    return { username, publicRepos: own.length, topLanguages: languages, topRepos };
  } catch {
    return null;
  }
}
