import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { SkillDimension } from "@prisma/client";
import { TrendingUp } from "lucide-react";

const LABELS: Record<string, string> = {
  resume_quality:       "Resume Quality",
  ats_score:            "ATS Score",
  ownership_language:   "Ownership Language",
  impact_writing:       "Impact Writing",
  interview_confidence: "Interview Confidence",
  system_design:        "System Design",
  business_thinking:    "Business Thinking",
  leadership:           "Leadership",
  communication:        "Communication",
  ai_knowledge:         "AI Knowledge",
  problem_solving:      "Problem Solving",
  recruiter_readiness:  "Recruiter Readiness",
};

// Color the "after" bar based on current score tier
function barColor(score: number): string {
  if (score >= 70) return "bg-emerald-500";
  if (score >= 40) return "bg-amber-500";
  return "bg-red-500";
}

function deltaColor(delta: number): string {
  if (delta > 0) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
  return "text-red-400 bg-red-500/10 border-red-500/20";
}

interface DimensionDelta {
  dimension: string;
  before: number;
  after: number;
  delta: number;
  firstDate: Date;
  source: string;
}

export async function TransformationView() {
  const { userId } = await auth();
  if (!userId) return null;

  const [historyRaw, currentRaw] = await Promise.all([
    db.skillScoreHistory.findMany({
      where:   { userId },
      orderBy: { recordedAt: "asc" },
      select:  { dimension: true, score: true, recordedAt: true, source: true },
    }),
    db.userSkillScore.findMany({
      where:  { userId },
      select: { dimension: true, score: true },
    }),
  ]);

  if (historyRaw.length === 0) return null;

  // First recorded score per dimension ("before")
  const firstByDimension = new Map<string, { score: number; date: Date; source: string }>();
  for (const entry of historyRaw) {
    if (!firstByDimension.has(entry.dimension)) {
      firstByDimension.set(entry.dimension, {
        score:  entry.score,
        date:   entry.recordedAt,
        source: entry.source,
      });
    }
  }

  // Current score per dimension ("after")
  const currentByDimension = new Map(currentRaw.map((r) => [r.dimension, r.score]));

  // Build deltas — only where there's been genuine improvement
  const deltas: DimensionDelta[] = [];
  for (const [dim, first] of firstByDimension.entries()) {
    const after = currentByDimension.get(dim as SkillDimension);
    if (after === undefined) continue;
    const delta = after - first.score;
    if (delta <= 0) continue; // skip flat or regressed dimensions
    deltas.push({
      dimension: dim,
      before:    first.score,
      after,
      delta,
      firstDate: first.date,
      source:    first.source,
    });
  }

  if (deltas.length === 0) return null;

  // Sort biggest improvement first
  deltas.sort((a, b) => b.delta - a.delta);

  const sourceLabel = (s: string) => {
    if (s === "resume_analyze") return "resume analysis";
    if (s === "interview")      return "mock interview";
    if (s === "quiz")           return "quiz";
    if (s === "practice")       return "practice";
    return s.replace(/_/g, " ");
  };

  return (
    <div className="bg-[#161820] rounded-2xl border border-white/10 shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
          <TrendingUp className="h-4 w-4 text-emerald-400" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Your Transformation</p>
          <p className="text-sm text-slate-500 mt-0.5">
            {deltas.length} skill{deltas.length !== 1 ? "s" : ""} improved since you started
          </p>
        </div>
      </div>

      {/* Dimension cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {deltas.map((d) => {
          const pctGain = d.before > 0 ? Math.round((d.delta / d.before) * 100) : d.delta;
          const color = barColor(d.after);

          return (
            <div key={d.dimension} className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-4">
              {/* Label + delta badge */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 leading-tight">
                  {LABELS[d.dimension] ?? d.dimension}
                </p>
                <span className={`shrink-0 text-[11px] font-black px-2 py-0.5 rounded-lg border tabular-nums ${deltaColor(d.delta)}`}>
                  +{d.delta}
                </span>
              </div>

              {/* Before → After numbers */}
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-2xl font-black tabular-nums text-slate-500">{d.before}</span>
                <span className="text-slate-600 font-bold">→</span>
                <span className={`text-3xl font-black tabular-nums ${d.after >= 70 ? "text-emerald-400" : d.after >= 40 ? "text-amber-400" : "text-red-400"}`}>
                  {d.after}
                </span>
                <span className="text-xs text-slate-600 ml-auto tabular-nums">+{pctGain}%</span>
              </div>

              {/* Stacked bars */}
              <div className="space-y-1.5">
                {/* Before bar */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-600 w-9 shrink-0">Before</span>
                  <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <div className="h-full bg-white/20 rounded-full" style={{ width: `${d.before}%` }} />
                  </div>
                </div>
                {/* After bar */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 w-9 shrink-0">Now</span>
                  <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${d.after}%` }} />
                  </div>
                </div>
              </div>

              {/* Source + date */}
              <p className="text-[10px] text-slate-600 mt-2.5">
                Started via {sourceLabel(d.source)} ·{" "}
                {d.firstDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
