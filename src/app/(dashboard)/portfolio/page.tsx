"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Globe, GitFork, Copy, Eye, Loader2, Sparkles, ExternalLink, CheckCircle2, Link2 } from "lucide-react";
import { toast } from "sonner";

interface Project {
  id: string;
  title: string;
  description: string;
  techTags: string[];
  githubUrl: string | null;
  stars: number | null;
  featured: boolean;
}

interface Portfolio {
  id: string;
  username: string;
  bio: string;
  headline: string | null;
  isPublic: boolean;
  views: number;
  projects: Project[];
}

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [plan, setPlan] = useState<"FREE" | "PRO">("FREE");
  const [loading, setLoading] = useState(true);
  const [githubUsername, setGithubUsername] = useState("");
  const [importing, setImporting] = useState(false);
  const [generatingBio, setGeneratingBio] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://ninetydays.ai";

  const loadData = useCallback(async () => {
    const [pRes, planRes] = await Promise.all([
      fetch("/api/portfolio"),
      fetch("/api/user/plan"),
    ]);
    if (pRes.ok) {
      const d = await pRes.json();
      setPortfolio(d.portfolio ?? null);
    }
    if (planRes.ok) {
      const d = await planRes.json();
      setPlan(d.plan ?? "FREE");
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Handle GitHub OAuth callback query params
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("github_connected") === "1") {
      toast.success("GitHub connected! You can now import your repos.");
      // Clean up URL without reload
      window.history.replaceState({}, "", window.location.pathname);
    } else if (params.get("github_error") === "1") {
      toast.error("GitHub connection failed. Please try again.");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  async function handleImportGitHub() {
    if (!githubUsername.trim()) { toast.error("Enter your GitHub username"); return; }
    setImporting(true);
    const res = await fetch("/api/portfolio/github/repos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ githubUsername: githubUsername.trim() }),
    });
    if (res.ok) {
      const d = await res.json();
      toast.success(`Imported ${d.projects} projects from GitHub`);
      await loadData();
    } else {
      const e = await res.json();
      toast.error(e.error ?? "Import failed");
    }
    setImporting(false);
  }

  async function handleGenerateBio() {
    setGeneratingBio(true);
    const res = await fetch("/api/portfolio/bio/generate", { method: "POST" });
    if (res.ok) {
      toast.success("Bio generated!");
      await loadData();
    } else {
      toast.error("Failed to generate bio");
    }
    setGeneratingBio(false);
  }

  async function handlePublish() {
    setPublishing(true);
    const res = await fetch("/api/portfolio/publish", { method: "POST" });
    if (res.ok) {
      toast.success(portfolio?.isPublic ? "Portfolio unpublished" : "Portfolio is now live!");
      await loadData();
    } else {
      const e = await res.json();
      toast.error(e.error ?? "Failed to update visibility");
    }
    setPublishing(false);
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const publicUrl = portfolio ? `${appUrl}/p/${portfolio.username}` : null;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Portfolio Builder</h1>
        <p className="text-muted-foreground mt-2 text-base">Your public portfolio page — the link you put on every application.</p>
      </div>

      {/* GitHub Import */}
      <div className="bg-[#1a1b23] rounded-2xl border border-white/10 p-7 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center">
              <GitFork className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Import from GitHub</h2>
              <p className="text-sm text-muted-foreground">Fetch your repos and let AI write descriptions</p>
            </div>
          </div>
          {/* OAuth connect button */}
          <a href="/api/auth/github">
            <Button variant="outline" size="sm" className="gap-2 shrink-0">
              <Link2 className="h-3.5 w-3.5" />
              Connect GitHub
            </Button>
          </a>
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <Label className="text-sm font-semibold mb-1.5 block">
              GitHub username{" "}
              <span className="font-normal text-muted-foreground">(or connect via OAuth above for private repos)</span>
            </Label>
            <Input
              placeholder="e.g. gauravmalviya"
              value={githubUsername}
              onChange={(e) => setGithubUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleImportGitHub()}
              className="h-11"
            />
          </div>
          <div className="flex items-end">
            <Button onClick={handleImportGitHub} disabled={importing} className="h-11 px-5 gap-2">
              {importing ? <><Loader2 className="h-4 w-4 animate-spin" />Importing...</> : <><GitFork className="h-4 w-4" />Import</>}
            </Button>
          </div>
        </div>
      </div>

      {portfolio && (
        <>
          {/* Status + actions */}
          <div className="bg-[#1a1b23] rounded-2xl border border-white/10 p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className={`h-2.5 w-2.5 rounded-full ${portfolio.isPublic ? "bg-emerald-500" : "bg-slate-400"}`} />
                <div>
                  <p className="font-semibold">{portfolio.isPublic ? "Portfolio is live" : "Portfolio is private"}</p>
                  {publicUrl && portfolio.isPublic && (
                    <p className="text-sm text-muted-foreground mt-0.5">{publicUrl}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {portfolio.isPublic && (
                  <>
                    <div className="flex items-center gap-1.5 text-sm text-slate-400 bg-white/5 px-3 py-1.5 rounded-lg">
                      <Eye className="h-3.5 w-3.5" />{portfolio.views} views
                    </div>
                    <Button size="sm" variant="outline" className="gap-1.5" onClick={() => { navigator.clipboard.writeText(publicUrl!); toast.success("Link copied!"); }}>
                      <Copy className="h-3.5 w-3.5" />Copy link
                    </Button>
                    <a href={publicUrl!} target="_blank" rel="noreferrer">
                      <Button size="sm" variant="outline" className="gap-1.5">
                        <ExternalLink className="h-3.5 w-3.5" />View
                      </Button>
                    </a>
                  </>
                )}
                {plan === "FREE" ? (
                  <a href="/settings">
                    <Button size="sm" className="gap-1.5">Upgrade to publish</Button>
                  </a>
                ) : (
                  <Button size="sm" onClick={handlePublish} disabled={publishing} className={portfolio.isPublic ? "bg-slate-700 hover:bg-slate-800" : ""}>
                    {publishing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : portfolio.isPublic ? "Unpublish" : "Publish portfolio"}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="bg-[#1a1b23] rounded-2xl border border-white/10 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold">Bio</h2>
              <Button size="sm" variant="outline" onClick={handleGenerateBio} disabled={generatingBio} className="gap-1.5 text-xs">
                {generatingBio ? <><Loader2 className="h-3 w-3 animate-spin" />Generating...</> : <><Sparkles className="h-3 w-3" />Generate with AI</>}
              </Button>
            </div>
            <p className="text-base text-muted-foreground leading-relaxed">
              {portfolio.bio || "No bio yet. Click 'Generate with AI' to create one automatically from your profile."}
            </p>
          </div>

          {/* Projects */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Projects ({portfolio.projects.length})</h2>
            </div>
            {portfolio.projects.length === 0 ? (
              <div className="bg-[#1a1b23] rounded-2xl border border-white/10 p-10 text-center shadow-sm">
                <GitFork className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-semibold">No projects yet</p>
                <p className="text-base text-muted-foreground mt-1">Enter your GitHub username above to import your repositories.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {portfolio.projects.map((p) => (
                  <div key={p.id} className="bg-[#1a1b23] rounded-2xl border border-white/10 p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">{p.title}</p>
                          {p.featured && <Badge variant="secondary" className="text-xs">Featured</Badge>}
                          {p.stars !== null && <span className="text-xs text-muted-foreground">⭐ {p.stars}</span>}
                        </div>
                        <p className="text-base text-muted-foreground leading-relaxed line-clamp-2">{p.description}</p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {(p.techTags as string[]).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                      {p.githubUrl && (
                        <a href={p.githubUrl} target="_blank" rel="noreferrer" className="shrink-0">
                          <Button size="sm" variant="ghost" className="gap-1 text-xs">
                            <ExternalLink className="h-3.5 w-3.5" />View
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {!portfolio && (
        <div className="bg-[#1a1b23] rounded-2xl border border-white/10 p-10 text-center shadow-sm">
          <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="font-semibold text-lg">No portfolio yet</p>
          <p className="text-base text-muted-foreground mt-1">Enter your GitHub username above to create your portfolio automatically.</p>
        </div>
      )}
    </div>
  );
}
