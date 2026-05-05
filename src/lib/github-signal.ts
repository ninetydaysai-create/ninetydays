export interface GitHubSignal {
  username: string;
  publicRepos: number;
  topLanguages: string[];
  topRepos: { name: string; description: string; stars: number; language: string }[];
}

const FETCH_TIMEOUT_MS = 5_000;

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

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(
      `https://api.github.com/users/${username}/repos?sort=updated&per_page=20&type=owner`,
      { headers, signal: controller.signal, next: { revalidate: 3600 } }
    );

    // Rate-limited or auth failure — return null silently so roadmap still generates
    if (res.status === 403 || res.status === 429) {
      console.warn(`[github-signal] rate limited for ${username} (HTTP ${res.status})`);
      return null;
    }

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
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      console.warn(`[github-signal] fetch timed out after ${FETCH_TIMEOUT_MS}ms for ${username}`);
    }
    return null;
  } finally {
    clearTimeout(timer);
  }
}
