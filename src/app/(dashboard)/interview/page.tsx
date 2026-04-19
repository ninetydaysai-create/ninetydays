"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, ArrowRight, Trophy, Loader2, Brain, Cpu, Users, Package, ChevronDown, ChevronUp, Building2 } from "lucide-react";
import { format } from "date-fns";
import { InterviewType } from "@prisma/client";
import { COMPANIES } from "@/lib/companies";

interface Session {
  id: string;
  type: InterviewType;
  overallScore: number | null;
  status: string;
  startedAt: string;
  companyName?: string | null;
}

const typeConfig: Record<InterviewType, { label: string; description: string; icon: React.ElementType; color: string }> = {
  behavioral: {
    label: "Behavioral",
    description: "Leadership, impact, conflict, growth stories",
    icon: Users,
    color: "text-blue-500",
  },
  system_design: {
    label: "System Design",
    description: "Scalability, architecture, trade-offs",
    icon: Cpu,
    color: "text-blue-500",
  },
  ml_concepts: {
    label: "ML Concepts",
    description: "ML fundamentals, model selection, deployment",
    icon: Brain,
    color: "text-emerald-500",
  },
  product_sense: {
    label: "Product Sense",
    description: "Product thinking, metrics, prioritization",
    icon: Package,
    color: "text-amber-500",
  },
};

function ScorecardView({ scorecard }: { scorecard: unknown }) {
  if (!scorecard || typeof scorecard !== "object") {
    return <p className="text-sm text-slate-400">No scorecard available for this session.</p>;
  }
  const sc = scorecard as Record<string, unknown>;
  return (
    <div className="space-y-3 text-sm">
      {!!sc.feedback && (
        <div className="bg-slate-50 rounded-xl p-4 border">
          <p className="font-bold text-slate-700 text-xs uppercase tracking-widest mb-2">Overall feedback</p>
          <p className="text-slate-600 leading-relaxed">{String(sc.feedback)}</p>
        </div>
      )}
      {Array.isArray(sc.strengths) && sc.strengths.length > 0 && (
        <div>
          <p className="font-bold text-slate-700 text-xs uppercase tracking-widest mb-2">Strengths</p>
          <ul className="space-y-1">
            {sc.strengths.map((s: unknown, i: number) => (
              <li key={i} className="flex items-start gap-2 text-slate-600">
                <span className="text-emerald-500 font-bold shrink-0">✓</span>{String(s)}
              </li>
            ))}
          </ul>
        </div>
      )}
      {Array.isArray(sc.improvements) && sc.improvements.length > 0 && (
        <div>
          <p className="font-bold text-slate-700 text-xs uppercase tracking-widest mb-2">To improve</p>
          <ul className="space-y-1">
            {sc.improvements.map((s: unknown, i: number) => (
              <li key={i} className="flex items-start gap-2 text-slate-600">
                <span className="text-amber-500 font-bold shrink-0">→</span>{String(s)}
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* Fallback: render all keys */}
      {!sc.feedback && !sc.strengths && !sc.improvements && (
        <pre className="text-xs text-slate-400 bg-slate-50 rounded-lg p-3 overflow-auto">{JSON.stringify(sc, null, 2)}</pre>
      )}
    </div>
  );
}

export default function InterviewPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [starting, setStarting] = useState<InterviewType | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [scorecards, setScorecards] = useState<Record<string, unknown>>({});
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/interview/sessions")
      .then((r) => r.json())
      .then((data) => { setSessions(data.sessions ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function startSession(type: InterviewType, companyName?: string) {
    setStarting(type);
    try {
      const res = await fetch("/api/interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, companyName: companyName ?? undefined }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error ?? "Failed to start session");
        return;
      }
      const sessionId = res.headers.get("X-Session-Id");
      if (sessionId) {
        router.push(`/interview/${sessionId}`);
      }
    } finally {
      setStarting(null);
    }
  }

  async function loadScorecard(sessionId: string) {
    if (scorecards[sessionId] !== undefined) {
      setExpandedSession(expandedSession === sessionId ? null : sessionId);
      return;
    }
    const res = await fetch(`/api/interview/session/${sessionId}`);
    if (res.ok) {
      const data = await res.json();
      // API returns fields at the top level (not nested under "session")
      setScorecards(prev => ({ ...prev, [sessionId]: data.scorecard ?? null }));
      setExpandedSession(sessionId);
    }
  }

  const scores = sessions.map((s) => s.overallScore).filter((s): s is number => s !== null);
  const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
  const completedSessions = sessions.filter(s => s.status === "complete");

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Interview Prep</h1>
        <p className="text-muted-foreground mt-2 text-base leading-relaxed">
          AI mock interviews. Get scored with detailed feedback after each session.
        </p>
      </div>

      {/* Stats */}
      {sessions.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold">{sessions.length}</div>
              <div className="text-sm text-muted-foreground mt-1">Sessions done</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="flex items-center justify-center gap-1.5">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <div className="text-3xl font-bold">{avg ?? "—"}</div>
              </div>
              <div className="text-sm text-muted-foreground mt-1">Avg score</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold">
                {scores.length ? Math.max(...scores) : "—"}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Best score</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Start new session */}
      <div className="space-y-5">
        <h2 className="text-xl font-semibold">Start a mock interview</h2>

        {/* Company selector */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-slate-700">Optimize for a company</span>
            <span className="text-xs text-muted-foreground">(optional)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCompany(null)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                selectedCompany === null
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
              }`}
            >
              Any company
            </button>
            {COMPANIES.map((company) => (
              <button
                key={company.id}
                onClick={() => setSelectedCompany(selectedCompany === company.id ? null : company.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  selectedCompany === company.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-white text-slate-600 border-slate-200 hover:border-primary hover:text-primary"
                }`}
              >
                {company.name}
              </button>
            ))}
          </div>
          {selectedCompany && (
            <div className="flex items-center gap-2 text-sm text-primary font-medium">
              <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold">
                Optimized for {COMPANIES.find(c => c.id === selectedCompany)?.name}
              </span>
              <span className="text-slate-500 text-xs font-normal">— questions and evaluation will reflect their actual interview bar</span>
            </div>
          )}
        </div>

        {/* Interview type cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(Object.entries(typeConfig) as [InterviewType, typeof typeConfig[InterviewType]][]).map(
            ([type, config]) => {
              const Icon = config.icon;
              const isStarting = starting === type;
              return (
                <Card
                  key={type}
                  className="hover:border-primary transition-colors cursor-pointer group"
                  onClick={() => !starting && startSession(type, selectedCompany ?? undefined)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className={`h-10 w-10 rounded-lg bg-muted flex items-center justify-center mb-2`}>
                        <Icon className={`h-5 w-5 ${config.color}`} />
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors mt-1" />
                    </div>
                    <CardTitle className="text-base">{config.label}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-base text-muted-foreground mb-4">{config.description}</p>
                    <Button
                      size="sm"
                      className="w-full gap-2"
                      disabled={!!starting}
                      onClick={(e) => { e.stopPropagation(); startSession(type, selectedCompany ?? undefined); }}
                    >
                      {isStarting ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Starting...
                        </>
                      ) : (
                        <>
                          Start {config.label}
                          <ArrowRight className="h-3.5 w-3.5" />
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            }
          )}
        </div>
      </div>

      {/* Past sessions with scorecard */}
      {!loading && completedSessions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Past sessions</h2>
          <div className="space-y-3">
            {completedSessions.map(session => {
              const cfg = typeConfig[session.type];
              const Icon = cfg.icon;
              const isExpanded = expandedSession === session.id;
              const scoreColor =
                session.overallScore !== null && session.overallScore >= 70
                  ? "text-emerald-600"
                  : session.overallScore !== null && session.overallScore >= 50
                  ? "text-amber-600"
                  : "text-red-500";
              return (
                <div key={session.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <button
                    className="w-full text-left px-5 py-4 flex items-center gap-4"
                    onClick={() => loadScorecard(session.id)}
                  >
                    <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                      <Icon className={`h-5 w-5 ${cfg.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-slate-900">{cfg.label}</p>
                        {session.companyName && (
                          <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                            {COMPANIES.find(c => c.id === session.companyName)?.name ?? session.companyName}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500">{format(new Date(session.startedAt), "MMM d, yyyy")}</p>
                    </div>
                    {session.overallScore !== null && (
                      <div className={`text-2xl font-black shrink-0 ${scoreColor}`}>
                        {session.overallScore}<span className="text-sm font-normal text-slate-400">/100</span>
                      </div>
                    )}
                    {isExpanded
                      ? <ChevronUp className="h-5 w-5 text-slate-400 shrink-0" />
                      : <ChevronDown className="h-5 w-5 text-slate-400 shrink-0" />
                    }
                  </button>
                  {isExpanded && (
                    <div className="px-5 pb-5 border-t border-slate-100 pt-4 space-y-4">
                      <ScorecardView scorecard={scorecards[session.id]} />
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2"
                        onClick={() => router.push(`/interview`)}
                      >
                        Practice {cfg.label} again →
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* In-progress / non-complete session history (legacy view for incomplete sessions) */}
      {!loading && sessions.filter(s => s.status !== "complete").length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">In progress</h2>
          <div className="space-y-3">
            {sessions.filter(s => s.status !== "complete").map((s) => (
              <Card
                key={s.id}
                className="hover:border-primary transition-colors cursor-pointer"
                onClick={() => router.push(`/interview/${s.id}`)}
              >
                <CardContent className="pt-4 pb-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="font-medium">{typeConfig[s.type]?.label ?? s.type}</div>
                        {s.companyName && (
                          <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                            {COMPANIES.find(c => c.id === s.companyName)?.name ?? s.companyName}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(s.startedAt), "MMM d, yyyy")}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">In progress</Badge>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
