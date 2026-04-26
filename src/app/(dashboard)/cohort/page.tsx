"use client";

import { useEffect, useState } from "react";
import { Users, Flame, CheckSquare, Loader2, Trophy } from "lucide-react";
import { ROLE_LABELS } from "@/lib/constants";
import { TargetRole } from "@prisma/client";
import { toast } from "sonner";

interface CohortMember {
  userId: string;
  displayName: string;
  initial: string;
  readinessScore: number | null;
  streak: number;
  tasksThisWeek: number;
  joinedAt: string;
}

interface CohortData {
  group: { id: string; targetRole: string; weekSlot: number };
  members: CohortMember[];
  self: string;
}

const AVATAR_COLORS = [
  "bg-indigo-500/20 text-indigo-400",
  "bg-violet-500/20 text-violet-400",
  "bg-emerald-500/20 text-emerald-400",
  "bg-amber-500/20 text-amber-400",
  "bg-rose-500/20 text-rose-400",
];

function ReadinessRing({ score }: { score: number | null }) {
  if (score === null) return <span className="text-xs text-slate-500">No data yet</span>;
  const color = score >= 70 ? "text-emerald-400" : score >= 40 ? "text-amber-400" : "text-red-400";
  return <span className={`text-lg font-black ${color}`}>{score}<span className="text-xs font-semibold text-slate-500">%</span></span>;
}

export default function CohortPage() {
  const [data, setData] = useState<CohortData | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkin, setCheckin] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    fetch("/api/cohort")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function postCheckin() {
    if (!checkin.trim()) return;
    setPosting(true);
    await fetch("/api/activity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "cohort_checkin", metadata: { note: checkin } }),
    }).catch(() => {});
    toast.success("Check-in posted!");
    setCheckin("");
    setPosting(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!data || "error" in data) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 space-y-3">
        <Users className="h-12 w-12 text-slate-500 mx-auto" />
        <p className="text-lg font-semibold text-white">Complete onboarding to join a cohort</p>
        <p className="text-slate-400 text-sm">Set your target role first, then your accountability group will be assigned.</p>
      </div>
    );
  }

  const { group, members, self } = data;
  const roleLabel = ROLE_LABELS[group.targetRole as TargetRole] ?? group.targetRole.replace(/_/g, " ");
  const sorted = [...members].sort((a, b) => (b.readinessScore ?? 0) - (a.readinessScore ?? 0));
  const isGroupForming = members.length <= 1;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-[#161820] rounded-2xl border border-white/10 p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-11 w-11 rounded-xl bg-rose-500/10 flex items-center justify-center shrink-0">
            <Users className="h-5 w-5 text-rose-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Your Accountability Group</h1>
            <p className="text-slate-400 text-sm">5 engineers · same role · Week {group.weekSlot}</p>
          </div>
        </div>
        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
          <span className="text-xs font-semibold text-slate-300">{roleLabel}</span>
        </div>
      </div>

      {isGroupForming ? (
        /* Group still forming */
        <div className="bg-[#161820] rounded-2xl border border-white/10 p-8 text-center space-y-3">
          <div className="h-14 w-14 rounded-full bg-indigo-500/10 flex items-center justify-center mx-auto">
            <Users className="h-6 w-6 text-indigo-400" />
          </div>
          <p className="text-white font-semibold text-lg">Your group is forming</p>
          <p className="text-slate-400 text-sm max-w-xs mx-auto leading-relaxed">
            Other {roleLabel} engineers will be matched to your group as they join this week.
            Check back soon.
          </p>
        </div>
      ) : (
        /* Member cards */
        <div className="space-y-3">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide px-1">Group members — ranked by readiness</p>
          {sorted.map((m, i) => {
            const isSelf = m.userId === self;
            const colorClass = AVATAR_COLORS[i % AVATAR_COLORS.length];
            return (
              <div
                key={m.userId}
                className={`bg-[#161820] rounded-2xl border p-4 flex items-center gap-4 transition-all ${isSelf ? "border-indigo-500/40 ring-1 ring-indigo-500/20" : "border-white/10"}`}
              >
                {/* Rank + avatar */}
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-bold text-slate-500 w-4 text-center">
                    {i === 0 ? <Trophy className="h-3.5 w-3.5 text-amber-400 inline" /> : `#${i + 1}`}
                  </span>
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-sm font-black shrink-0 ${colorClass}`}>
                    {m.initial}
                  </div>
                </div>

                {/* Name + self badge */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white truncate">{m.displayName}</p>
                    {isSelf && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 shrink-0">You</span>}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">Joined week {group.weekSlot}</p>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-5 shrink-0">
                  <div className="text-center">
                    <ReadinessRing score={m.readinessScore} />
                    <p className="text-[10px] text-slate-500 mt-0.5">Readiness</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-0.5">
                      <Flame className={`h-4 w-4 ${m.streak > 0 ? "text-orange-400" : "text-slate-600"}`} />
                      <span className={`text-base font-black ${m.streak > 0 ? "text-orange-400" : "text-slate-600"}`}>{m.streak}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">Streak</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-0.5">
                      <CheckSquare className={`h-4 w-4 ${m.tasksThisWeek > 0 ? "text-emerald-400" : "text-slate-600"}`} />
                      <span className={`text-base font-black ${m.tasksThisWeek > 0 ? "text-emerald-400" : "text-slate-600"}`}>{m.tasksThisWeek}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">This week</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Weekly check-in */}
      <div className="bg-[#161820] rounded-2xl border border-white/10 p-5">
        <p className="text-sm font-bold text-white mb-1">Weekly check-in</p>
        <p className="text-xs text-slate-500 mb-3">What did you work on this week? Your group will see this soon.</p>
        <textarea
          value={checkin}
          onChange={(e) => setCheckin(e.target.value)}
          placeholder="e.g. Finished Week 3 tasks, did 2 mock interviews, fixed my resume bullet points..."
          rows={3}
          className="w-full text-sm text-white bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 resize-none placeholder:text-slate-500 focus:outline-none focus:border-white/20"
        />
        <button
          onClick={postCheckin}
          disabled={posting || !checkin.trim()}
          className="mt-2 px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors flex items-center gap-2"
        >
          {posting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          Post check-in
        </button>
      </div>
    </div>
  );
}
