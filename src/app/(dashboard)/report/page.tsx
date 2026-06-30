import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { differenceInDays } from "date-fns";
import { TrendingUp, Award, MessageSquare, Target, Building2, ChevronRight } from "lucide-react";
import Link from "next/link";
import { ROLE_LABELS } from "@/lib/constants";
import { TargetRole, SkillDimension } from "@prisma/client";
import { getCompanyReadiness } from "@/lib/company-readiness";
import { ShareReportButton } from "@/components/report/ShareReportButton";

const DIM_LABELS: Record<string, string> = {
  resume_quality:"Resume Quality", ats_score:"ATS Score", ownership_language:"Ownership Language",
  impact_writing:"Impact Writing", interview_confidence:"Interview Confidence", system_design:"System Design",
  business_thinking:"Business Thinking", leadership:"Leadership", communication:"Communication",
  ai_knowledge:"AI Knowledge", problem_solving:"Problem Solving",
};

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

export default async function ReportPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [user, skillScores, skillHistory, roadmap, sessions, deliverables, gapReport] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: {
        name: true, targetRole: true,
        careerProfile: { select: { careerGoal: true, targetCompanies: true } },
      },
    }),
    db.userSkillScore.findMany({ where: { userId } }),
    db.skillScoreHistory.findMany({ where: { userId }, orderBy: { recordedAt: "asc" } }),
    db.roadmap.findUnique({
      where: { userId },
      include: { weeks: { include: { tasks: { select: { completed: true } } } } },
    }),
    db.interviewSession.findMany({ where: { userId, status: "complete" }, select: { overallScore: true } }),
    db.deliverable.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, select: { id: true, title: true, type: true, aiScore: true } }),
    db.gapReport.findFirst({ where: { userId }, orderBy: { createdAt: "desc" }, select: { totalGapScore: true } }),
  ]);

  const roleLabel       = ROLE_LABELS[user?.targetRole as TargetRole] ?? "Target Role";
  const targetCompanies = (user?.careerProfile?.targetCompanies as string[]) ?? [];
  const dayCount        = roadmap ? differenceInDays(new Date(), new Date(roadmap.startedAt)) + 1 : 0;
  const allTasks        = roadmap?.weeks.flatMap(w => w.tasks) ?? [];
  const doneTasks       = allTasks.filter(t => t.completed).length;
  const avgInterview    = sessions.length
    ? Math.round(sessions.map(s => s.overallScore ?? 0).reduce((a, b) => a + b, 0) / sessions.length)
    : null;

  // Current scores
  const currentScores = Object.fromEntries(skillScores.map(s => [s.dimension, s.score]));

  // "Before" = first recorded score per dimension
  const beforeScores: Record<string, number> = {};
  for (const entry of skillHistory) {
    if (!(entry.dimension in beforeScores)) beforeScores[entry.dimension] = entry.score;
  }

  // Dimensions with improvement
  const improvements = (Object.keys(DIM_LABELS) as SkillDimension[])
    .filter(d => currentScores[d] !== undefined && (currentScores[d] - (beforeScores[d] ?? currentScores[d])) > 0)
    .sort((a, b) => (currentScores[b] - (beforeScores[b] ?? 0)) - (currentScores[a] - (beforeScores[a] ?? 0)));

  // Company readiness
  const companies = getCompanyReadiness(currentScores, user?.targetRole ?? "product_swe").slice(0, 6);

  const deliverableTypeLabels: Record<string, string> = {
    resume_bullets:"Resume Bullets", linkedin_summary:"LinkedIn Summary", star_story:"STAR Story",
    portfolio_project:"Portfolio Project", interview_answers:"Interview Answers",
    case_study:"Case Study", flashcard_deck:"Flashcard Deck", project_doc:"Project Doc",
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-600 p-6 sm:p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-500/20">
        <div className="absolute inset-0 opacity-[0.12] pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
        <div className="relative">
          <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-2">Career Transformation Report</p>
          <h1 className="text-3xl sm:text-4xl font-black mb-1">{user?.name ?? "Your Journey"}</h1>
          <p className="text-indigo-200 text-base mb-4">{roleLabel}</p>
          {user?.careerProfile?.careerGoal && (
            <p className="text-indigo-100 italic text-sm mb-4">"{user.careerProfile.careerGoal}"</p>
          )}
          <ShareReportButton />
        </div>
      </div>

      {/* Journey stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Days Active",       value: dayCount,                        color: "text-indigo-400"  },
          { label: "Tasks Completed",   value: `${doneTasks}/${allTasks.length}`, color: "text-emerald-400" },
          { label: "Deliverables Built",value: deliverables.length,              color: "text-orange-400"  },
          { label: "Mock Interviews",   value: sessions.length,                  color: "text-purple-400"  },
        ].map(s => (
          <div key={s.label} className="bg-[#161820] rounded-2xl border border-white/10 p-4 text-center">
            <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-400 mt-1 font-bold uppercase tracking-wide">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Overall readiness */}
      {gapReport && (
        <div className="bg-[#161820] rounded-2xl border border-white/10 p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Overall Readiness</p>
          <div className="flex items-center gap-4">
            <span className={`text-5xl font-black tabular-nums ${scoreColor(gapReport.totalGapScore)}`}>
              {gapReport.totalGapScore}%
            </span>
            <div className="flex-1">
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${barColor(gapReport.totalGapScore)}`}
                  style={{ width: `${gapReport.totalGapScore}%` }}
                />
              </div>
              <p className="text-sm text-slate-400 mt-2">
                {gapReport.totalGapScore >= 70
                  ? "Competitive for top product companies"
                  : `${70 - gapReport.totalGapScore}% away from the apply threshold`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Skill transformation — before vs now */}
      {improvements.length > 0 && (
        <div className="bg-[#161820] rounded-2xl border border-white/10 p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Skill Transformation</p>
              <p className="text-sm text-slate-500">{improvements.length} dimensions improved</p>
            </div>
          </div>

          <div className="space-y-4">
            {improvements.map(dim => {
              const before  = beforeScores[dim] ?? currentScores[dim];
              const now     = currentScores[dim];
              const delta   = now - before;
              return (
                <div key={dim}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-semibold text-white">{DIM_LABELS[dim]}</span>
                    <span className="text-xs text-emerald-400 font-bold">+{delta} pts</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-600 w-10 shrink-0">Before</span>
                      <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                        <div className="h-full bg-white/20 rounded-full" style={{ width: `${before}%` }} />
                      </div>
                      <span className="text-[10px] text-slate-500 w-6 text-right">{before}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 w-10 shrink-0">Now</span>
                      <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${barColor(now)}`} style={{ width: `${now}%` }} />
                      </div>
                      <span className={`text-[10px] font-bold w-6 text-right ${scoreColor(now)}`}>{now}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Company readiness */}
      {companies.length > 0 && (
        <div className="bg-[#161820] rounded-2xl border border-white/10 p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
              <Building2 className="h-4 w-4 text-blue-400" />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Company Readiness</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {companies.map(c => (
              <div key={c.name} className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3">
                <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 font-black text-sm text-white">
                  {c.logo}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white">{c.name}</p>
                  <p className={`text-xs font-semibold ${c.statusColor}`}>{c.status}</p>
                </div>
                <p className="text-xl font-black tabular-nums text-white">{c.score}%</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interview performance */}
      {sessions.length > 0 && (
        <div className="bg-[#161820] rounded-2xl border border-white/10 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
              <MessageSquare className="h-4 w-4 text-purple-400" />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Interview Performance</p>
          </div>
          <div className="flex items-center gap-6">
            <div>
              <p className={`text-4xl font-black tabular-nums ${avgInterview !== null ? scoreColor(avgInterview) : "text-white"}`}>
                {avgInterview ?? "—"}<span className="text-lg text-slate-500 font-normal">/100</span>
              </p>
              <p className="text-sm text-slate-400 mt-1">avg score across {sessions.length} session{sessions.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
        </div>
      )}

      {/* Deliverables portfolio */}
      {deliverables.length > 0 && (
        <div className="bg-[#161820] rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
                <Award className="h-4 w-4 text-orange-400" />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Career Assets Built</p>
            </div>
            <Link href="/deliverables" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              View all <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {deliverables.slice(0, 8).map(d => (
              <div key={d.id} className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{d.title}</p>
                  <p className="text-[10px] text-slate-500">{deliverableTypeLabels[d.type] ?? d.type}</p>
                </div>
                {d.aiScore !== null && (
                  <span className={`text-sm font-black tabular-nums ${scoreColor(d.aiScore)}`}>{d.aiScore}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next focus */}
      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="h-9 w-9 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0">
            <Target className="h-5 w-5 text-indigo-400" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-1">Keep Going</p>
            <p className="font-bold text-white text-base">Every day compounds.</p>
            <p className="text-slate-300 text-sm mt-1">
              {dayCount < 90
                ? `${90 - dayCount} days left in your 90-day transformation. Keep the pace.`
                : "You've completed the 90-day journey. Apply what you've built."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
