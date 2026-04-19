"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2, Target, TrendingUp, CheckCircle2, AlertTriangle, Zap, Clock,
  ArrowRight, ChevronDown, ChevronUp, RotateCcw, Briefcase, ShieldAlert, Search,
} from "lucide-react";

interface BlockingGap {
  label: string;
  severity: "critical" | "major" | "minor";
  hoursToFix: number;
  action: string;
  signalFound?: string;
}

interface JobMatch {
  id: string;
  companyName: string | null;
  roleTitle: string;
  matchScore: number;
  strengths: string[];
  blockingGaps: BlockingGap[];
  improvementPlan: string | null;
  redFlags?: string[];
  createdAt: string;
}

const SEVERITY_STYLE = {
  critical: "bg-red-50 text-red-600 border-red-200",
  major: "bg-amber-50 text-amber-600 border-amber-200",
  minor: "bg-yellow-50 text-yellow-700 border-yellow-200",
};

const SEVERITY_DOT = {
  critical: "bg-red-500",
  major: "bg-amber-500",
  minor: "bg-yellow-400",
};

function ScoreRing({ score }: { score: number }) {
  const color = score >= 70 ? "text-emerald-400" : score >= 50 ? "text-amber-400" : "text-red-400";
  const bgColor = score >= 70 ? "bg-emerald-500/10" : score >= 50 ? "bg-amber-500/10" : "bg-red-500/10";
  const ringColor = score >= 70 ? "ring-emerald-500/20" : score >= 50 ? "ring-amber-500/20" : "ring-red-500/20";
  const label = score >= 70 ? "Strong match" : score >= 50 ? "Partial match" : "Significant gaps";

  return (
    <div className={`flex flex-col items-center justify-center h-40 w-40 rounded-full ring-8 ${ringColor} ${bgColor}`}>
      <span className={`text-5xl font-black ${color}`}>{score}</span>
      <span className="text-slate-400 text-sm font-medium">/ 100</span>
      <span className={`text-xs font-bold mt-1 ${color}`}>{label}</span>
    </div>
  );
}

function MatchCard({ match, defaultOpen = false }: { match: JobMatch; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const scoreColor = match.matchScore >= 70 ? "text-emerald-400" : match.matchScore >= 50 ? "text-amber-400" : "text-red-400";
  const scoreBg = match.matchScore >= 70 ? "bg-emerald-500/10 border-emerald-500/20" : match.matchScore >= 50 ? "bg-amber-500/10 border-amber-500/20" : "bg-red-500/10 border-red-500/20";

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <button className="w-full text-left px-6 py-4 flex items-center gap-4" onClick={() => setOpen(!open)}>
        <div className={`h-14 w-14 rounded-xl border flex flex-col items-center justify-center shrink-0 ${scoreBg}`}>
          <span className={`text-xl font-black ${scoreColor}`}>{match.matchScore}</span>
          <span className="text-slate-500 text-xs">%</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-900 text-base">
            {match.roleTitle}{match.companyName ? ` · ${match.companyName}` : ""}
          </p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-sm text-slate-500">
              {match.blockingGaps.filter(g => g.severity === "critical").length} critical gap{match.blockingGaps.filter(g => g.severity === "critical").length !== 1 ? "s" : ""} · {match.blockingGaps.reduce((a, g) => a + g.hoursToFix, 0)}h to close
            </span>
            {match.redFlags && match.redFlags.length > 0 && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                <ShieldAlert className="h-3 w-3" /> {match.redFlags.length} red flag{match.redFlags.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
        {open ? <ChevronUp className="h-5 w-5 text-slate-500 shrink-0" /> : <ChevronDown className="h-5 w-5 text-slate-500 shrink-0" />}
      </button>

      {open && (
        <div className="px-6 pb-6 border-t border-slate-200 pt-5 space-y-6 bg-white rounded-b-2xl">

          {/* Score + summary row */}
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <ScoreRing score={match.matchScore} />
            <div className="flex-1 space-y-4">
              {match.improvementPlan && (
                <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                  <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-2">To reach 75%+</p>
                  <p className="text-sm text-indigo-700 leading-relaxed">{match.improvementPlan}</p>
                </div>
              )}
              {/* Strengths */}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2.5">Evidence of match</p>
                <div className="space-y-2">
                  {match.strengths.map((s, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-slate-700 bg-emerald-50 rounded-lg px-3 py-2 border border-emerald-100">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Red flags — shown prominently if present */}
          {match.redFlags && match.redFlags.length > 0 && (
            <div className="rounded-xl border-2 border-red-200 bg-red-50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <ShieldAlert className="h-4 w-4 text-red-600 shrink-0" />
                <p className="text-sm font-bold text-red-600 uppercase tracking-widest">Red flags detected</p>
              </div>
              <div className="space-y-2">
                {match.redFlags.map((flag, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-red-700">
                    <span className="font-bold mt-0.5 shrink-0">✕</span>
                    {flag}
                  </div>
                ))}
              </div>
              <p className="text-xs text-red-600 mt-3 font-medium">
                Recruiters at product companies specifically filter for these patterns. Address them before applying.
              </p>
            </div>
          )}

          {/* Blocking gaps */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Blocking gaps — what&apos;s actually missing</p>
            <div className="space-y-3">
              {match.blockingGaps.map((gap, i) => (
                <div key={i} className={`rounded-xl border p-4 ${gap.severity === "critical" ? "border-red-200 bg-red-50" : gap.severity === "major" ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-slate-50"}`}>
                  <div className="flex items-start gap-3">
                    <div className={`h-2.5 w-2.5 rounded-full shrink-0 mt-1.5 ${SEVERITY_DOT[gap.severity]}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="font-bold text-slate-900 text-sm">{gap.label}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${SEVERITY_STYLE[gap.severity]}`}>
                          {gap.severity}
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {gap.hoursToFix}h to fix
                        </span>
                      </div>

                      {/* What the resume actually had (or didn't) */}
                      {gap.signalFound && (
                        <div className="flex items-start gap-1.5 bg-white border border-slate-200 rounded-lg px-3 py-1.5 mb-2">
                          <Search className="h-3 w-3 text-slate-500 shrink-0 mt-0.5" />
                          <p className="text-xs text-slate-500 italic">Found in resume: {gap.signalFound}</p>
                        </div>
                      )}

                      {/* What to do */}
                      <div className="flex items-start gap-1.5">
                        <Zap className="h-3.5 w-3.5 text-indigo-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-slate-700">{gap.action}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function JobMatchPage() {
  const [jdText, setJdText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<JobMatch | null>(null);
  const [history, setHistory] = useState<JobMatch[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    const res = await fetch("/api/job-match");
    if (res.ok) {
      const data = await res.json();
      setHistory(data.matches ?? []);
    }
    setLoadingHistory(false);
  }, []);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  async function analyze() {
    if (!jdText.trim() || jdText.trim().length < 50) {
      setError("Please paste a job description (at least a few sentences).");
      return;
    }
    setError(null);
    setAnalyzing(true);
    setResult(null);
    try {
      const res = await fetch("/api/job-match/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jdText }),
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data.match);
        setHistory((prev) => [data.match, ...prev]);
        setJdText("");
      } else {
        const err = await res.json().catch(() => ({}));
        setError(err.error ?? "Analysis failed. Please try again.");
      }
    } catch {
      setError("Network error — please try again.");
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Job Match Score</h1>
        <p className="text-slate-400 mt-1 text-base">
          Paste any job description — see exactly how well you match and what&apos;s blocking you.
        </p>
      </div>

      {/* Input card */}
      <div className="bg-[#161820] rounded-2xl border border-white/10 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="h-9 w-9 rounded-xl bg-indigo-500/10 flex items-center justify-center">
            <Briefcase className="h-5 w-5 text-indigo-400" />
          </div>
          <div>
            <p className="font-bold text-white">Paste job description</p>
            <p className="text-xs text-slate-400">Copy the full JD — the more detail, the more accurate your score</p>
          </div>
        </div>

        <Textarea
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
          placeholder="Paste the full job description here...&#10;&#10;e.g. 'We are looking for an ML Engineer to join our team...' "
          className="min-h-[180px] text-sm resize-none rounded-xl border-slate-200 focus:border-indigo-300"
          disabled={analyzing}
        />

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="flex items-center justify-between gap-4">
          <p className="text-xs text-slate-400">
            {jdText.length > 0 ? `${jdText.length} characters` : "Tip: include the full JD for best results"}
          </p>
          <Button
            onClick={analyze}
            disabled={analyzing || jdText.trim().length < 10}
            className="gap-2 h-11 px-6 bg-indigo-600 hover:bg-indigo-500"
          >
            {analyzing ? (
              <><Loader2 className="h-4 w-4 animate-spin" />Analyzing (~15s)...</>
            ) : (
              <><Target className="h-4 w-4" />Analyze my match</>
            )}
          </Button>
        </div>
      </div>

      {/* Latest result */}
      {result && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-white text-lg">Your match result</h2>
            <Button variant="ghost" size="sm" className="gap-1.5 text-slate-400" onClick={() => setResult(null)}>
              <RotateCcw className="h-3.5 w-3.5" /> Analyze another
            </Button>
          </div>
          <MatchCard match={result} defaultOpen={true} />

          {/* CTA to roadmap */}
          {result.matchScore < 70 && (
            <div className="bg-indigo-500/10 rounded-2xl border border-indigo-500/20 p-5 flex items-start gap-4">
              <Zap className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold text-indigo-300 text-sm">Close these gaps with your roadmap</p>
                <p className="text-base text-indigo-400 mt-0.5">Your 90-day plan already includes tasks that address these gaps. Check your current week.</p>
              </div>
              <a href="/roadmap">
                <Button size="sm" className="gap-1.5 shrink-0 bg-indigo-600 hover:bg-indigo-500">
                  View roadmap <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </a>
            </div>
          )}
          {result.matchScore >= 70 && (
            <div className="bg-emerald-500/10 rounded-2xl border border-emerald-500/20 p-5 flex items-start gap-4">
              <TrendingUp className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold text-emerald-400 text-sm">You&apos;re a strong candidate — apply now</p>
                <p className="text-base text-emerald-400 mt-0.5">A 70%+ match means you should apply. Most engineers wait too long. Go for it.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* History */}
      {!loadingHistory && history.filter(m => m.id !== result?.id).length > 0 && (
        <div className="space-y-3">
          <h2 className="font-bold text-white text-lg">Previous analyses</h2>
          {history.filter(m => m.id !== result?.id).map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loadingHistory && history.length === 0 && !result && (
        <div className="text-center py-12 text-slate-400">
          <Target className="h-10 w-10 mx-auto mb-3 text-slate-200" />
          <p className="font-medium text-slate-400">No analyses yet</p>
          <p className="text-base mt-1">Paste a job description above to see how well you match</p>
        </div>
      )}
    </div>
  );
}
