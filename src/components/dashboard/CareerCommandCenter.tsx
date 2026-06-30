import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { getUserStreak } from "@/lib/streak";
import Link from "next/link";
import { Zap, CheckCircle2, ChevronRight, Target, Flame, Trophy } from "lucide-react";
import { ROLE_LABELS } from "@/lib/constants";
import { TargetRole } from "@prisma/client";
import { differenceInDays } from "date-fns";

function todayUTC(): Date {
  const n = new Date();
  return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate()));
}

interface MissionItem {
  icon: React.ElementType;
  label: string;
  sub: string;
  href: string;
  done: boolean;
  accent: string;
}

export async function CareerCommandCenter() {
  const { userId } = await auth();
  if (!userId) return null;

  const [user, gapReport, roadmap, dailyChallenge, streakData, deliverableCount] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { name: true, targetRole: true, careerProfile: { select: { careerGoal: true, targetCompanies: true } } },
    }),
    db.gapReport.findFirst({ where: { userId }, orderBy: { createdAt: "desc" }, select: { totalGapScore: true } }),
    db.roadmap.findUnique({
      where: { userId },
      include: {
        weeks: {
          include: {
            tasks: {
              include: { steps: { select: { completedAt: true } } },
            },
          },
          orderBy: { weekNumber: "asc" },
        },
      },
    }),
    db.dailyChallenge.findUnique({
      where: { userId_date: { userId, date: todayUTC() } },
      select: { completedAt: true, type: true, dimension: true, coachingReason: true },
    }),
    getUserStreak(userId),
    db.deliverable.count({ where: { userId } }),
  ]);

  const readiness       = gapReport?.totalGapScore ?? null;
  const roleLabel       = ROLE_LABELS[user?.targetRole as TargetRole] ?? "your target role";
  const targetCompanies = (user?.careerProfile?.targetCompanies as string[]) ?? [];
  const topCompany      = targetCompanies[0];
  const dayOfJourney    = roadmap ? differenceInDays(new Date(), new Date(roadmap.startedAt)) + 1 : 1;
  const streak          = streakData.currentStreak;

  // --- Roadmap progress ---
  const allTasks   = roadmap?.weeks.flatMap(w => w.tasks) ?? [];
  const doneTasks  = allTasks.filter(t => t.completed).length;
  const totalTasks = allTasks.length;

  // Current active task = first incomplete task in first incomplete week
  const currentWeek     = roadmap?.weeks.find(w => w.tasks.some(t => !t.completed));
  const currentTask     = currentWeek?.tasks.find(t => !t.completed) ?? null;
  const taskStepsDone   = currentTask?.steps.filter(s => s.completedAt).length ?? 0;
  const taskStepsTotal  = currentTask?.steps.length ?? 0;

  // --- Today's Mission (up to 3 items) ---
  const mission: MissionItem[] = [];

  // 1. Daily challenge
  mission.push({
    icon: Zap,
    label: dailyChallenge?.completedAt ? "Daily challenge done" : "Complete today's challenge",
    sub: dailyChallenge?.completedAt
      ? "✓ Streak maintained"
      : (dailyChallenge as { coachingReason?: string | null } | null)?.coachingReason
        ?? (dailyChallenge
          ? `${(dailyChallenge.type as string).replace(/_/g, " ")} · 5 min`
          : "5-min practice · AI-scored"),
    href: "/dashboard#challenge",
    done: !!dailyChallenge?.completedAt,
    accent: "text-amber-400",
  });

  // 2. Current roadmap task
  if (currentTask) {
    mission.push({
      icon: Target,
      label: currentTask.label,
      sub: taskStepsTotal > 0
        ? `Step ${taskStepsDone + 1} of ${taskStepsTotal} · Level ${currentWeek?.weekNumber}`
        : `Level ${currentWeek?.weekNumber}: ${currentWeek?.theme ?? "Continue your plan"}`,
      href: `/roadmap/task/${currentTask.id}`,
      done: false,
      accent: "text-indigo-400",
    });
  }

  // 3. Contextual recommendation based on progress
  if (mission.length < 3) {
    if (!roadmap) {
      mission.push({
        icon: Target,
        label: "Generate your 90-day plan",
        sub: "Personalized to your resume + target role",
        href: "/roadmap",
        done: false,
        accent: "text-emerald-400",
      });
    } else if (readiness !== null && readiness < 50) {
      mission.push({
        icon: Target,
        label: "Run a mock interview",
        sub: "Boost your interview confidence score",
        href: "/interview",
        done: false,
        accent: "text-purple-400",
      });
    } else {
      mission.push({
        icon: Trophy,
        label: "Review your deliverables",
        sub: `${deliverableCount} career assets built — add more`,
        href: "/deliverables",
        done: deliverableCount === 0,
        accent: "text-orange-400",
      });
    }
  }

  return (
    <div className="rounded-2xl overflow-hidden relative bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-600 text-white shadow-xl shadow-indigo-500/20">
      {/* Dot grid texture */}
      <div
        className="absolute inset-0 opacity-[0.15] pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "20px 20px" }}
      />

      <div className="relative p-5 sm:p-7">
        {/* Identity row */}
        <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
          <div>
            <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-1">
              Day {dayOfJourney} of 90
              {topCompany ? ` · Target: ${topCompany}` : ` · ${roleLabel}`}
            </p>
            <h1 className="text-2xl sm:text-3xl font-black leading-tight">
              {user?.name ? `${user.name.split(" ")[0]}'s Mission` : "Today's Mission"}
            </h1>
          </div>

          {/* Quick stats */}
          <div className="flex items-center gap-4 shrink-0">
            {readiness !== null && (
              <div className="text-center">
                <p className="text-2xl font-black tabular-nums">{readiness}%</p>
                <p className="text-[10px] text-indigo-200 uppercase tracking-wide font-bold">Readiness</p>
              </div>
            )}
            {streak > 0 && (
              <div className="text-center">
                <div className="flex items-center gap-1 justify-center">
                  <Flame className="h-4 w-4 text-orange-300" />
                  <p className="text-2xl font-black tabular-nums">{streak}</p>
                </div>
                <p className="text-[10px] text-indigo-200 uppercase tracking-wide font-bold">Day streak</p>
              </div>
            )}
            {totalTasks > 0 && (
              <div className="text-center">
                <p className="text-2xl font-black tabular-nums">{doneTasks}/{totalTasks}</p>
                <p className="text-[10px] text-indigo-200 uppercase tracking-wide font-bold">Tasks done</p>
              </div>
            )}
          </div>
        </div>

        {/* Mission items */}
        <div className="space-y-2">
          {mission.map((item, i) => {
            const Icon = item.icon;
            return (
              <Link key={i} href={item.href}>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${
                  item.done
                    ? "bg-white/10 opacity-60"
                    : "bg-white/15 hover:bg-white/20"
                }`}>
                  <div className="h-7 w-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                    {item.done
                      ? <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                      : <Icon className="h-4 w-4 text-white" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold leading-tight ${item.done ? "line-through text-indigo-200" : "text-white"}`}>
                      {item.label}
                    </p>
                    <p className="text-[11px] text-indigo-200 mt-0.5 truncate">{item.sub}</p>
                  </div>
                  {!item.done && <ChevronRight className="h-4 w-4 text-indigo-300 shrink-0" />}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Readiness progress bar */}
        {readiness !== null && (
          <div className="mt-5 pt-4 border-t border-white/15">
            <div className="flex items-center justify-between text-xs text-indigo-200 mb-1.5">
              <span>Readiness to {roleLabel}</span>
              <span className="font-bold text-white">{readiness}% → 90%</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(readiness, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
