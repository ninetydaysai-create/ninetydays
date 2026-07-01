"use client";

import { Flame, CheckCircle2, AlertTriangle } from "lucide-react";

interface StreakCardProps {
  streak: number;
  longestStreak: number;
  todayDone: boolean;
}

export function StreakCard({ streak, longestStreak, todayDone }: StreakCardProps) {
  return (
    <div className="bg-[#161820] rounded-2xl border border-white/10 shadow-sm p-5">
      <div className="flex items-center gap-4">
        {/* Flame icon */}
        <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${
          streak >= 3 ? "bg-orange-500/15" : "bg-white/5"
        }`}>
          <Flame
            className={`h-6 w-6 ${streak >= 1 ? "text-orange-400" : "text-slate-500"}`}
            fill={streak >= 1 ? "currentColor" : "none"}
          />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">
              Day {streak}
            </span>
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Current streak
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            Best: {longestStreak} {longestStreak === 1 ? "day" : "days"}
          </p>
        </div>
      </div>

      {/* Status row */}
      <div className={`mt-4 flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold ${
        todayDone
          ? "bg-emerald-500/10 text-emerald-400"
          : "bg-amber-500/10 text-amber-400"
      }`}>
        {todayDone ? (
          <>
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
            Activity logged today
          </>
        ) : (
          <>
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            Complete a task to keep your streak
          </>
        )}
      </div>
    </div>
  );
}
