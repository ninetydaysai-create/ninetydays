"use client";

import { useEffect, useState } from "react";
import { Activity } from "lucide-react";
import Link from "next/link";

// Mirror of SkillDimension enum — defined locally to keep this a pure client component
type SkillDimension =
  | "resume_quality"
  | "ats_score"
  | "ownership_language"
  | "impact_writing"
  | "interview_confidence"
  | "system_design"
  | "business_thinking"
  | "leadership"
  | "communication"
  | "ai_knowledge"
  | "problem_solving"
  | "recruiter_readiness";

const LABELS: Record<SkillDimension, string> = {
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

// Ordered list — composite shown separately above these
const DIMENSIONS: SkillDimension[] = [
  "resume_quality",
  "ats_score",
  "ownership_language",
  "impact_writing",
  "interview_confidence",
  "system_design",
  "business_thinking",
  "leadership",
  "communication",
  "ai_knowledge",
  "problem_solving",
];

function scoreColor(score: number) {
  if (score >= 70) return "text-emerald-400";
  if (score >= 40) return "text-amber-400";
  return "text-red-400";
}

function barColor(score: number) {
  if (score >= 70) return "bg-emerald-500";
  if (score >= 40) return "bg-amber-500";
  return "bg-red-500";
}

export interface EvidenceGraphProps {
  skillScores: Partial<Record<SkillDimension, number>>;
}

export function EvidenceGraph({ skillScores }: EvidenceGraphProps) {
  const composite = skillScores.recruiter_readiness;
  const hasScores = DIMENSIONS.some((d) => skillScores[d] !== undefined);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 100); return () => clearTimeout(t); }, []);

  return (
    <div className="bg-[#161820] rounded-2xl border border-white/10 shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
          <Activity className="h-4 w-4 text-indigo-400" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Career Readiness Profile</p>
          <p className="text-sm text-slate-500 mt-0.5">How recruiters see you across every dimension</p>
        </div>
      </div>

      {!hasScores ? (
        /* Empty state */
        <div className="py-8 text-center">
          <p className="text-slate-400 text-base mb-1">No skill data yet</p>
          <p className="text-slate-500 text-sm mb-5">
            Complete a resume analysis or mock interview to populate your profile.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/resume">
              <button className="h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-colors">
                Analyze resume
              </button>
            </Link>
            <Link href="/interview">
              <button className="h-9 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-sm transition-colors border border-white/10">
                Mock interview
              </button>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Recruiter Readiness composite — featured row */}
          {composite !== undefined && (
            <div className="mb-5 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-white">Recruiter Readiness</span>
                <span className={`text-xl font-black ${scoreColor(composite)}`}>{composite}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full transition-all duration-700 ${barColor(composite)}`}
                  style={{ width: mounted ? `${composite}%` : "0%" }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">Weighted composite of all dimensions below</p>
            </div>
          )}

          {/* Dimension bars */}
          <div className="space-y-3.5">
            {DIMENSIONS.map((dim) => {
              const score = skillScores[dim];
              return (
                <div key={dim} className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 w-28 sm:w-44 shrink-0 truncate">
                    {LABELS[dim]}
                  </span>
                  <div className="flex-1 bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-700 ${score !== undefined ? barColor(score) : ""}`}
                      style={{ width: score !== undefined && mounted ? `${score}%` : "0%" }}
                    />
                  </div>
                  <span
                    className={`text-xs font-bold w-9 text-right shrink-0 tabular-nums ${
                      score !== undefined ? scoreColor(score) : "text-slate-600"
                    }`}
                  >
                    {score !== undefined ? `${score}%` : "—"}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-5 mt-5 pt-4 border-t border-white/[0.06]">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-xs text-slate-500">Strong (70+)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
              <span className="text-xs text-slate-500">Building (40–69)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
              <span className="text-xs text-slate-500">Needs work (&lt;40)</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
