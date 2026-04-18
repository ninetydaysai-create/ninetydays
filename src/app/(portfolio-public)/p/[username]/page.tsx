import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { GitFork, Globe, Zap } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const portfolio = await db.portfolio.findUnique({
    where: { username, isPublic: true },
    include: { user: { select: { name: true } } },
  });
  if (!portfolio) return { title: "Portfolio not found" };
  return {
    title: `${portfolio.user.name ?? username} — NinetyDays Portfolio`,
    description: portfolio.bio.slice(0, 160),
  };
}

export default async function PublicPortfolioPage({ params }: Props) {
  const { username } = await params;

  const portfolio = await db.portfolio.findUnique({
    where: { username, isPublic: true },
    include: {
      user: { select: { name: true, targetRole: true } },
      projects: { where: { featured: true }, orderBy: { sortOrder: "asc" } },
    },
  });

  if (!portfolio) notFound();

  // Increment view count (fire and forget)
  db.portfolio.update({ where: { id: portfolio.id }, data: { views: { increment: 1 } } }).catch(() => null);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="border-b px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          <span className="font-bold text-sm">NinetyDays</span>
        </Link>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-16 space-y-12">
        {/* Hero */}
        <div>
          <h1 className="text-3xl font-bold">{portfolio.user.name ?? username}</h1>
          {portfolio.headline && (
            <p className="text-lg text-muted-foreground mt-1">{portfolio.headline}</p>
          )}
          {portfolio.user.targetRole && (
            <Badge variant="secondary" className="mt-3">
              Targeting {portfolio.user.targetRole.replace(/_/g, " ")}
            </Badge>
          )}
        </div>

        {/* Bio */}
        {portfolio.bio && (
          <div>
            <h2 className="text-lg font-semibold mb-3">About</h2>
            <p className="text-muted-foreground leading-relaxed">{portfolio.bio}</p>
          </div>
        )}

        {/* Projects */}
        {portfolio.projects.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Projects</h2>
            <div className="space-y-4">
              {portfolio.projects.map((project) => (
                <Card key={project.id}>
                  <CardContent className="pt-5 pb-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{project.title}</h3>
                          {project.stars !== null && (
                            <span className="text-xs text-muted-foreground">⭐ {project.stars}</span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                        <div className="flex flex-wrap gap-1 mt-3">
                          {(project.techTags as string[]).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {project.githubUrl && (
                          <Link href={project.githubUrl} target="_blank">
                            <GitFork className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                          </Link>
                        )}
                        {project.url && (
                          <Link href={project.url} target="_blank">
                            <Globe className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="border-t pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Built with{" "}
            <Link href="/" className="underline underline-offset-2 hover:text-foreground">
              NinetyDays
            </Link>{" "}
            — AI-powered career transition platform
          </p>
        </div>
      </main>
    </div>
  );
}
