import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { differenceInDays } from "date-fns";
import { Suspense } from "react";
import { UpgradeSuccessToast } from "@/components/shared/UpgradeSuccessToast";
import { ShareProgressCard } from "@/components/shared/ShareProgressCard";
import { getUserStreak } from "@/lib/streak";
import { StreakCard } from "@/components/shared/StreakCard";
import {
  FileText,
  Target,
  Map,
  MessageSquare,
  Briefcase,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  TrendingUp,
  Brain,
  ChevronRight,
  ScanSearch,
} from "lucide-react";
import { GapItem } from "@/types/gaps";
import { ROLE_LABELS } from "@/lib/constants";
import { TargetRole } from "@prisma/client";


function getLevel(readiness: number): { level: number; label: string; next: number } {
  const thresholds = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  const level = thresholds.findIndex((t) => readiness < t) - 1;
  const l = Math.max(1, level === -1 ? 10 : level);
  const labels = ["", "Beginner", "Explorer", "Builder", "Practitioner", "Achiever", "Specialist", "Advanced", "Expert", "Elite", "Ready"];
  return { level: l, label: labels[l], next: thresholds[Math.min(l, 9)] };
}

function getRejectionRisk(score: number): { label: string; color: string; bg: string; advice: string } {
  if (score < 40) return { label: "Very High", color: "text-red-600", bg: "bg-red-50", advice: "Apply after reaching 60%" };
  if (score < 60) return { label: "High", color: "text-amber-500", bg: "bg-amber-50", advice: "Close critical gaps first" };
  if (score < 75) return { label: "Medium", color: "text-amber-600", bg: "bg-amber-50", advice: "Strengthen interview skills" };
  if (score < 88) return { label: "Low", color: "text-emerald-600", bg: "bg-emerald-50", advice: "Start applying now" };
  return { label: "Very Low", color: "text-emerald-700", bg: "bg-emerald-50", advice: "You're highly competitive" };
}

function getInterviewReadiness(avgScore: number | null, sessionCount: number): { label: string; color: string } {
  if (sessionCount === 0) return { label: "Not practiced", color: "text-slate-500" };
  if (!avgScore || avgScore < 45) return { label: "Needs work", color: "text-red-600" };
  if (avgScore < 65) return { label: "Getting there", color: "text-amber-600" };
  if (avgScore < 80) return { label: "Ready", color: "text-emerald-600" };
  return { label: "Strong", color: "text-emerald-700" };
}

function weeksToReadiness(score: number, targetScore = 70): number | null {
  if (score >= targetScore) return null;
  return Math.ceil((targetScore - score) / 5); // ~5% per week with consistent effort
}

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  let user = await db.user.findUnique({
    where: { id: userId },
    include: {
      roadmap: { include: { weeks: { include: { tasks: true } } } },
      interviewSessions: { where: { status: "complete" }, select: { overallScore: true } },
      jobApplications: { select: { id: true } },
      portfolio: { select: { views: true } },
    },
  });

  if (!user) {
    const clerkUser = await currentUser();
    if (!clerkUser) redirect("/sign-in");
    await db.user.upsert({
      where: { id: userId },
      create: {
        id: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
        name: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null,
        avatarUrl: clerkUser.imageUrl,
      },
      update: {},
    });
    user = await db.user.findUnique({
      where: { id: userId },
      include: {
        roadmap: { include: { weeks: { include: { tasks: true } } } },
        interviewSessions: { where: { status: "complete" }, select: { overallScore: true } },
        jobApplications: { select: { id: true } },
        portfolio: { select: { views: true } },
      },
    });
  }

  if (!user) redirect("/sign-in");
  if (!user.onboardingDone) redirect("/onboarding");

  // Fetch gap report, resume analysis, and streak data
  const [gapReport, _latestAnalysis, streakData] = await Promise.all([
    db.gapReport.findFirst({ where: { userId }, orderBy: { createdAt: "desc" } }),
    db.resumeAnalysis.findFirst({ where: { userId }, orderBy: { createdAt: "desc" }, select: { overallScore: true } }),
    getUserStreak(userId),
  ]);

  // Career metrics
  const readinessScore = gapReport?.totalGapScore ?? null;
  const streak = streakData.currentStreak;
  const levelInfo = readinessScore !== null ? getLevel(readinessScore) : null;
  const roleLabel = ROLE_LABELS[user.targetRole as TargetRole] ?? "your target role";
  const weeksLeft = readinessScore !== null ? weeksToReadiness(readinessScore) : null;
  const rejectionRisk = readinessScore !== null ? getRejectionRisk(readinessScore) : null;

  const scores = user.interviewSessions.map((s) => s.overallScore).filter((s): s is number => s !== null);
  const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
  const interviewReadiness = getInterviewReadiness(avgScore, scores.length);

  // Gap data
  const allGaps: GapItem[] = gapReport
    ? [
        ...((gapReport.skillGaps as unknown) as GapItem[]),
        ...((gapReport.projectGaps as unknown) as GapItem[]),
        ...((gapReport.storyGaps as unknown) as GapItem[]),
      ]
    : [];
  const openGaps = allGaps.filter((g) => !g.resolved);
  const criticalGaps = openGaps.filter((g) => g.severity === "critical");
  const biggestBlocker = criticalGaps[0] ?? openGaps[0] ?? null;

  // Roadmap
  const roadmap = user.roadmap;
  const allTasks = roadmap?.weeks.flatMap((w) => w.tasks) ?? [];
  const completedTasks = allTasks.filter((t) => t.completed).length;
  const progressPct = allTasks.length ? Math.round((completedTasks / allTasks.length) * 100) : 0;
  const dayOfJourney = roadmap ? differenceInDays(new Date(), new Date(roadmap.startedAt)) + 1 : 0;

  const quickActions = [
    { href: "/resume", label: "Resume Analyzer", desc: "Score + AI rewrite your bullets", icon: FileText },
    { href: "/gaps", label: "Gap Engine", desc: "See exactly what's blocking you", icon: Target },
    { href: "/roadmap", label: "90-Day Roadmap", desc: "Your week-by-week action plan", icon: Map },
    { href: "/job-match", label: "Job Match Score", desc: "Paste any JD — see how well you match", icon: ScanSearch },
    { href: "/interview", label: "Mock Interview", desc: "AI-scored practice sessions", icon: MessageSquare },
    { href: "/portfolio", label: "Portfolio", desc: "Build your public recruiter page", icon: Sparkles },
  ];

  const TARGET_READINESS = 70;

  return (
    <div className="space-y-7">
      <Suspense fallback={null}><UpgradeSuccessToast /></Suspense>

      {/* ── Outcome hero banner ── */}
      <div className="rounded-2xl overflow-hidden relative bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-600 p-8 text-white shadow-xl shadow-indigo-500/20">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 70% 50%, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="relative">
          {readinessScore !== null ? (
            <>
              <p className="text-indigo-200 text-sm font-semibold mb-2 uppercase tracking-widest">
                {weeksLeft ? `${weeksLeft} weeks to ${roleLabel} readiness` : `You're ${roleLabel} ready`}
              </p>
              <h1 className="text-4xl font-bold mb-2">
                {user.name ? `Welcome back, ${user.name.split(" ")[0]}` : "Welcome back"}
              </h1>
              <p className="text-indigo-100 text-lg leading-relaxed mb-5">
                Current readiness: <span className="font-bold text-white">{readinessScore}%</span>
                {readinessScore < TARGET_READINESS && (
                  <> · Top companies expect <span className="font-bold text-white">{TARGET_READINESS}%+</span></>
                )}
              </p>
              <div className="flex items-center gap-4 max-w-md">
                <div className="flex-1 bg-white/20 rounded-full h-3">
                  <div
                    className="h-3 rounded-full bg-white transition-all"
                    style={{ width: `${Math.min(readinessScore, 100)}%` }}
                  />
                </div>
                <span className="text-lg font-bold shrink-0">{readinessScore}%</span>
              </div>
              {weeksLeft && (
                <p className="text-indigo-200 text-sm mt-3">
                  At current pace — you need {TARGET_READINESS - readinessScore}% more readiness to compete confidently
                </p>
              )}
            </>
          ) : (
            <>
              <p className="text-indigo-200 text-sm font-semibold mb-2 uppercase tracking-widest">
                {roadmap ? `Day ${dayOfJourney} of 90` : "Let's get started"}
              </p>
              <h1 className="text-4xl font-bold mb-3">
                {user.name ? `Welcome back, ${user.name.split(" ")[0]} 👋` : "Welcome back 👋"}
              </h1>
              <p className="text-indigo-100 text-lg">
                {roadmap
                  ? `${progressPct}% of your 90-day roadmap complete — keep pushing.`
                  : "Upload your resume to get your readiness score and 90-day plan."}
              </p>
            </>
          )}
        </div>
      </div>

      {/* ── Career outcome metrics ── */}
      {readinessScore !== null ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Readiness */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-indigo-600" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Readiness</span>
            </div>
            <div className={`text-4xl font-black ${readinessScore >= TARGET_READINESS ? "text-emerald-600" : readinessScore >= 50 ? "text-amber-500" : "text-red-500"}`}>
              {readinessScore}%
            </div>
            <div className="text-sm text-slate-500 mt-1">Target: {TARGET_READINESS}% to apply</div>
          </div>

          {/* Rejection risk */}
          {rejectionRisk && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-8 rounded-lg bg-red-50 flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Rejection risk</span>
              </div>
              <div className={`text-3xl font-black ${rejectionRisk.color}`}>{rejectionRisk.label}</div>
              <div className="text-sm text-slate-500 mt-1">{rejectionRisk.advice}</div>
            </div>
          )}

          {/* Interview readiness */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Brain className="h-4 w-4 text-blue-500" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Interviews</span>
            </div>
            <div className={`text-3xl font-black ${interviewReadiness.color}`}>{interviewReadiness.label}</div>
            <div className="text-sm text-slate-500 mt-1">
              {scores.length === 0 ? "Start mock interviews" : `${scores.length} session${scores.length > 1 ? "s" : ""} · avg ${avgScore}/100`}
            </div>
          </div>

          {/* Gaps remaining */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center">
                <Target className="h-4 w-4 text-amber-500" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Gaps left</span>
            </div>
            <div className="text-4xl font-black text-slate-900">{openGaps.length}</div>
            <div className="text-sm text-slate-500 mt-1">
              {criticalGaps.length > 0 ? `${criticalGaps.length} critical` : "No critical gaps"}
            </div>
          </div>
        </div>
      ) : (
        /* Fallback vanity metrics if no gap report yet */
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Day", value: dayOfJourney || "—", sub: "of 90", color: "text-amber-500", bg: "bg-amber-50" },
            { label: "Tasks", value: `${completedTasks}/${allTasks.length}`, sub: "completed", color: "text-indigo-500", bg: "bg-indigo-50" },
            { label: "Interview", value: avgScore ? `${avgScore}` : "—", sub: "avg score /100", color: "text-yellow-600", bg: "bg-yellow-50" },
            { label: "Jobs", value: user.jobApplications.length, sub: "tracked", color: "text-emerald-600", bg: "bg-emerald-50" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className={`h-8 w-8 rounded-lg ${s.bg} flex items-center justify-center mb-4`}>
                <div className="h-3 w-3 rounded-full bg-current opacity-60" />
              </div>
              <div className="text-4xl font-bold text-slate-900">{s.value}</div>
              <div className="text-sm text-slate-500 mt-1 font-semibold uppercase tracking-wide">{s.sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── If you apply today ── */}
      {readinessScore !== null && rejectionRisk && (
        <div className={`rounded-2xl border p-6 flex items-start justify-between gap-6 flex-wrap ${readinessScore >= TARGET_READINESS ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}>
          <div className="flex items-start gap-4">
            <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${readinessScore >= TARGET_READINESS ? "bg-emerald-100" : "bg-red-100"}`}>
              <AlertTriangle className={`h-5 w-5 ${readinessScore >= TARGET_READINESS ? "text-emerald-600" : "text-red-500"}`} />
            </div>
            <div>
              <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${readinessScore >= TARGET_READINESS ? "text-emerald-600" : "text-red-500"}`}>
                If you apply today
              </p>
              <p className="font-bold text-slate-900 text-base">
                {readinessScore >= TARGET_READINESS
                  ? "You are competitive for your target role"
                  : "Likely rejected at resume screen"}
              </p>
              <p className="text-slate-600 text-base mt-1">
                {readinessScore >= TARGET_READINESS
                  ? `Readiness ${readinessScore}% — above the ${TARGET_READINESS}% threshold. Start applying.`
                  : `Readiness ${readinessScore}% — need ${TARGET_READINESS - readinessScore}% more before applying confidently. ${biggestBlocker ? `Biggest blocker: ${biggestBlocker.label}.` : ""}`}
              </p>
            </div>
          </div>
          <Link href={readinessScore >= TARGET_READINESS ? "/jobs" : "/roadmap"} className="shrink-0">
            <button className={`h-10 px-5 rounded-xl font-semibold text-sm transition-colors flex items-center gap-2 ${readinessScore >= TARGET_READINESS ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-red-600 hover:bg-red-700 text-white"}`}>
              {readinessScore >= TARGET_READINESS ? "Track applications →" : "Close the gap →"}
            </button>
          </Link>
        </div>
      )}

      {/* ── Level + Streak ── */}
      {(levelInfo || streak > 0) && (
        <div className="grid grid-cols-2 gap-4">
          {levelInfo && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0">
                <span className="text-white font-black text-sm">L{levelInfo.level}</span>
              </div>
              <div>
                <p className="font-bold text-slate-900">{levelInfo.label}</p>
                <p className="text-sm text-slate-400 mt-0.5">
                  {levelInfo.level < 10
                    ? `${levelInfo.next - readinessScore!}% to Level ${levelInfo.level + 1}`
                    : "Max level reached"}
                </p>
              </div>
            </div>
          )}
          <StreakCard
            streak={streakData.currentStreak}
            longestStreak={streakData.longestStreak}
            todayDone={streakData.todayDone}
          />
        </div>
      )}

      {/* ── Biggest blocker ── */}
      {biggestBlocker && (
        <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-widest text-red-500 mb-1">Biggest blocker right now</p>
                <p className="font-bold text-slate-900 text-lg leading-snug">{biggestBlocker.label}</p>
                <p className="text-slate-500 text-base mt-1 leading-relaxed">{biggestBlocker.description}</p>
                <p className="text-sm text-slate-400 mt-2">~{biggestBlocker.estimatedHours}h to close · Addressing this alone could raise your readiness by 5–10%</p>
              </div>
            </div>
            <Link href="/gaps" className="shrink-0">
              <button className="h-10 px-5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-sm transition-colors flex items-center gap-2">
                Address this gap <ChevronRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
        </div>
      )}

      {/* ── Roadmap progress (if exists) ── */}
      {roadmap && allTasks.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Roadmap progress</p>
              <p className="font-bold text-slate-900">Day {dayOfJourney} of 90 · {progressPct}% complete</p>
            </div>
            <Link href="/roadmap">
              <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                Continue plan <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </Link>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5">
            <div className="bg-indigo-600 h-2.5 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
          </div>
          <p className="text-sm text-slate-400 mt-2">{completedTasks} of {allTasks.length} tasks done</p>

          {/* Share progress — only show if there's meaningful progress */}
          {readinessScore !== null && readinessScore >= 30 && (
            <div className="pt-4 border-t border-slate-100 mt-4">
              <ShareProgressCard
                readinessScore={readinessScore}
                weeksOnPlatform={Math.max(1, Math.ceil(dayOfJourney / 7))}
                roleLabel={roleLabel}
                userName={user.name}
              />
            </div>
          )}
        </div>
      )}

      {/* ── Quick actions ── */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-slate-900">Your tools</h2>
          {user.plan === "FREE" && (
            <Link href="/settings">
              <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                Upgrade to Pro ↗
              </button>
            </Link>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <div className="bg-white rounded-2xl p-5 border border-slate-100 card-hover cursor-pointer group">
                <div className="flex items-start justify-between mb-4">
                  <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                    <action.icon className="h-5 w-5 text-indigo-600" />
                  </div>
                  <span className="text-slate-300 group-hover:text-indigo-400 transition-colors text-lg leading-none">→</span>
                </div>
                <p className="font-bold text-slate-900">{action.label}</p>
                <p className="text-base text-slate-500 mt-1 leading-relaxed">{action.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Upgrade CTA for free users ── */}
      {user.plan === "FREE" && (
        <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-violet-50 p-6 flex items-center justify-between gap-6 flex-wrap">
          <div>
            <p className="text-base font-bold text-slate-900">Unlock your full 90-day transformation</p>
            <p className="text-slate-500 mt-1 text-base">
              Pro unlocks unlimited analyses, full roadmap, unlimited mock interviews, and a public portfolio.
            </p>
          </div>
          <Link href="/settings" className="shrink-0">
            <button className="h-10 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-colors flex items-center gap-2 shadow-lg shadow-indigo-500/25">
              <Sparkles className="h-4 w-4" />
              Upgrade to Pro — $9/mo
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}
