import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { fastModel } from "@/lib/ai";
import { generateObject } from "ai";
import { z } from "zod";

const RepoDescriptionSchema = z.object({
  description: z.string(),
  techTags: z.array(z.string()),
});

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Try cookie-based OAuth token first, fall back to public username lookup
  const cookieStore = await cookies();
  const githubToken = cookieStore.get("github_token")?.value;
  const cookieUsername = cookieStore.get("github_username")?.value;

  let githubUsername: string;
  let fetchUrl: string;
  const headers: Record<string, string> = {
    "User-Agent": "NinetyDays/1.0",
    Accept: "application/vnd.github.v3+json",
  };

  if (githubToken) {
    // Use authenticated endpoint to fetch the authed user's own repos
    fetchUrl =
      "https://api.github.com/user/repos?sort=updated&per_page=20&type=owner&affiliation=owner";
    headers["Authorization"] = `Bearer ${githubToken}`;
    githubUsername = cookieUsername ?? "github-user";
  } else {
    // Fall back to public username lookup (body must be read here since no cookie)
    const body = (await req.json()) as { githubUsername?: string };
    if (!body.githubUsername) {
      return NextResponse.json(
        { error: "GitHub not connected", needsAuth: true },
        { status: 401 }
      );
    }
    githubUsername = body.githubUsername;
    fetchUrl = `https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=20&type=public`;
  }

  const res = await fetch(fetchUrl, { headers });

  if (!res.ok) {
    return NextResponse.json({ error: "GitHub user not found or API error" }, { status: res.status });
  }

  const repos = await res.json() as Array<{
    id: number;
    name: string;
    description: string | null;
    html_url: string;
    stargazers_count: number;
    language: string | null;
    fork: boolean;
    topics: string[];
  }>;

  // Filter out forks, sort by stars
  const ownRepos = repos
    .filter((r) => !r.fork)
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 8);

  // Ensure portfolio row exists
  const portfolio = await db.portfolio.upsert({
    where: { userId },
    create: {
      userId,
      username: githubUsername,
      bio: "",
      isPublic: false,
    },
    update: {},
  });

  // Upsert each repo as a PortfolioProject
  const projects = await Promise.all(
    ownRepos.map(async (repo, idx) => {
      let description = repo.description ?? repo.name;
      let techTags: string[] = repo.topics?.length
        ? repo.topics
        : repo.language
        ? [repo.language]
        : [];

      // If no description, generate one with AI
      if (!repo.description && repo.language) {
        try {
          const { object } = await generateObject({
            model: fastModel,
            schema: RepoDescriptionSchema,
            prompt: `GitHub repo name: "${repo.name}". Language: ${repo.language}. Topics: ${repo.topics?.join(", ") || "none"}. Write a 1-sentence description and extract 3-5 tech tags.`,
          });
          description = object.description;
          techTags = object.techTags;
        } catch {
          // ignore AI failures, use fallback
        }
      }

      const existing = await db.portfolioProject.findFirst({
        where: { portfolioId: portfolio.id, githubUrl: repo.html_url },
      });

      if (existing) {
        return db.portfolioProject.update({
          where: { id: existing.id },
          data: { stars: repo.stargazers_count, description, techTags, sortOrder: idx },
        });
      }

      return db.portfolioProject.create({
        data: {
          portfolioId: portfolio.id,
          title: repo.name,
          description,
          techTags,
          githubUrl: repo.html_url,
          isGithub: true,
          stars: repo.stargazers_count,
          sortOrder: idx,
          featured: idx < 3,
        },
      });
    })
  );

  return NextResponse.json({ projects: projects.length });
}
