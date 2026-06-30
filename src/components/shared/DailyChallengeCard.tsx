"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Zap,
  MessageSquare,
  FileEdit,
  BookOpen,
  Brain,
  Star,
  CheckCircle2,
  Loader2,
  ChevronRight,
} from "lucide-react";

type ChallengeType =
  | "interview_question"
  | "flashcard"
  | "case_study"
  | "star_story"
  | "bullet_rewrite"
  | "ai_conversation";

interface Challenge {
  id: string;
  type: ChallengeType;
  dimension: string | null;
  difficulty: string;
  prompt: string;
  userResponse: string | null;
  aiFeedback: AiFeedback | null;
  score: number | null;
  completedAt: string | null;
}

interface AiFeedback {
  verdict: string;
  strengths: string[];
  improvements: string[];
}

const TYPE_CONFIG: Record<
  ChallengeType,
  { label: string; icon: React.ElementType; bg: string; text: string; border: string }
> = {
  interview_question: {
    label: "Interview Question",
    icon: MessageSquare,
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/20",
  },
  star_story: {
    label: "STAR Story",
    icon: Star,
    bg: "bg-violet-500/10",
    text: "text-violet-400",
    border: "border-violet-500/20",
  },
  bullet_rewrite: {
    label: "Bullet Rewrite",
    icon: FileEdit,
    bg: "bg-indigo-500/10",
    text: "text-indigo-400",
    border: "border-indigo-500/20",
  },
  case_study: {
    label: "Case Study",
    icon: BookOpen,
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/20",
  },
  flashcard: {
    label: "Flashcard",
    icon: Zap,
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/20",
  },
  ai_conversation: {
    label: "AI Scenario",
    icon: Brain,
    bg: "bg-pink-500/10",
    text: "text-pink-400",
    border: "border-pink-500/20",
  },
};

const DIFFICULTY_CONFIG: Record<string, { label: string; color: string }> = {
  easy:   { label: "Easy",   color: "text-emerald-400" },
  medium: { label: "Medium", color: "text-amber-400"   },
  hard:   { label: "Hard",   color: "text-red-400"     },
};

function scoreColor(score: number) {
  if (score >= 70) return "text-emerald-400";
  if (score >= 40) return "text-amber-400";
  return "text-red-400";
}

function DimensionLabel({ dimension }: { dimension: string | null }) {
  if (!dimension) return null;
  const label = dimension
    .split("_")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
  return (
    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-white/[0.04] px-2 py-0.5 rounded-md border border-white/[0.06]">
      {label}
    </span>
  );
}

export function DailyChallengeCard() {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [response, setResponse] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/daily-challenge")
      .then((r) => r.json())
      .then((data) => {
        if (data.challenge) setChallenge(data.challenge);
      })
      .catch(() => setError("Failed to load today's challenge"))
      .finally(() => setIsLoading(false));
  }, []);

  function handleSubmit() {
    if (!challenge || !response.trim() || response.trim().length < 30) return;
    setError(null);

    startTransition(async () => {
      const res = await fetch("/api/daily-challenge/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId: challenge.id, userResponse: response }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Submission failed — please try again");
        return;
      }
      setChallenge(data.challenge);
    });
  }

  // ── Skeleton ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="bg-[#161820] rounded-2xl border border-white/10 shadow-sm p-6 animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-8 w-8 rounded-lg bg-white/[0.06]" />
          <div className="h-4 w-32 rounded bg-white/[0.06]" />
          <div className="h-4 w-20 rounded bg-white/[0.06]" />
        </div>
        <div className="h-4 w-full rounded bg-white/[0.06] mb-2" />
        <div className="h-4 w-3/4 rounded bg-white/[0.06]" />
      </div>
    );
  }

  // ── Error / no challenge ───────────────────────────────────────────────────
  if (!challenge) {
    return (
      <div className="bg-[#161820] rounded-2xl border border-white/10 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="h-4 w-4 text-indigo-400" />
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Daily Challenge</span>
        </div>
        <p className="text-slate-400 text-sm">{error ?? "No challenge available — check back soon."}</p>
      </div>
    );
  }

  const config = TYPE_CONFIG[challenge.type] ?? TYPE_CONFIG.interview_question;
  const Icon = config.icon;
  const diffConfig = DIFFICULTY_CONFIG[challenge.difficulty] ?? DIFFICULTY_CONFIG.medium;
  const isCompleted = !!challenge.completedAt;
  const feedback = challenge.aiFeedback as AiFeedback | null;

  return (
    <div className="bg-[#161820] rounded-2xl border border-white/10 shadow-sm p-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-2 mb-4 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className={`h-8 w-8 rounded-lg ${config.bg} flex items-center justify-center shrink-0`}>
            <Icon className={`h-4 w-4 ${config.text}`} />
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Daily Challenge</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <DimensionLabel dimension={challenge.dimension} />
          <span className={`text-[10px] font-bold uppercase tracking-wider ${diffConfig.color}`}>
            {diffConfig.label}
          </span>
        </div>
      </div>

      {/* ── Type badge ── */}
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${config.bg} border ${config.border} mb-4`}>
        <Icon className={`h-3 w-3 ${config.text}`} />
        <span className={`text-[11px] font-bold ${config.text}`}>{config.label}</span>
      </div>

      {/* ── Challenge prompt ── */}
      <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 mb-4">
        <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{challenge.prompt}</p>
      </div>

      {isCompleted ? (
        /* ── Completed state ── */
        <div className="space-y-4">
          {/* Score */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.08]">
            <div className="shrink-0 text-center">
              <div className={`text-4xl font-black tabular-nums ${challenge.score !== null ? scoreColor(challenge.score) : "text-white"}`}>
                {challenge.score ?? "—"}
              </div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wide mt-0.5">/ 100</div>
            </div>
            <div className="min-w-0">
              {feedback?.verdict && (
                <p className="text-sm text-slate-200 leading-snug">{feedback.verdict}</p>
              )}
            </div>
          </div>

          {/* Strengths */}
          {feedback?.strengths?.length ? (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 mb-1.5">Strengths</p>
              <ul className="space-y-1">
                {feedback.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* Improvements */}
          {feedback?.improvements?.length ? (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500 mb-1.5">To improve</p>
              <ul className="space-y-1">
                {feedback.improvements.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <ChevronRight className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <p className="text-xs text-slate-600 pt-1">Come back tomorrow for your next challenge.</p>
        </div>
      ) : (
        /* ── Active state ── */
        <div className="space-y-3">
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Write your response here — aim for 3-5 sentences with specific examples…"
            rows={5}
            className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 resize-none focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-colors"
          />

          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className={`text-xs tabular-nums ${response.length < 30 ? "text-slate-600" : "text-slate-400"}`}>
              {response.length} chars {response.length < 30 && `· need ${30 - response.length} more`}
            </span>
            <button
              onClick={handleSubmit}
              disabled={isPending || response.trim().length < 30}
              className="h-9 px-4 sm:px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors flex items-center gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Evaluating…
                </>
              ) : (
                "Submit for AI feedback"
              )}
            </button>
          </div>

          {error && (
            <p className="text-xs text-red-400 mt-1">{error}</p>
          )}
        </div>
      )}
    </div>
  );
}
