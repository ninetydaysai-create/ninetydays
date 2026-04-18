"use client";

import { Flame, CheckCircle2, AlertTriangle } from "lucide-react";

interface StreakCardProps {
  streak: number;
  longestStreak: number;
  todayDone: boolean;
}

export function StreakCard({ streak, longestStreak, todayDone }: StreakCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-center gap-4">
        {/* Flame icon */}
        <div
          className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${
            streak >= 3 ? "bg-orange-50" : "bg-slate-50"
          }`}
        >
          <Flame
            className={`h-6 w-6 ${streak >= 1 ? "text-orange-500" : "text-slate-400"}`}
            fill={streak >= 1 ? "currentColor" : "none"}
          />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              Day {streak}
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            current streak
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            Best: {longestStreak} {longestStreak === 1 ? "day" : "days"}
          </p>
        </div>
      </div>

      {/* Status row */}
      <div
        className={`mt-4 flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold ${
          todayDone
            ? "bg-emerald-50 text-emerald-700"
            : "bg-amber-50 text-amber-700"
        }`}
      >
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
