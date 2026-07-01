import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { differenceInDays, format } from "date-fns";
import { defaultModel } from "@/lib/ai";
import { generateText } from "ai";
import { buildCareerContext } from "@/lib/career-context";
import { ROLE_LABELS } from "@/lib/constants";
import { TargetRole } from "@prisma/client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

// ─── Event types ──────────────────────────────────────────────────────────────

type EventKind =
  | "start" | "resume_analyzed" | "level_complete" | "skill_milestone"
  | "interview" | "application" | "rejection" | "deliverable"
  | "readiness_milestone" | "goal_set" | "challenge_streak";

interface TimelineEvent {
  date: Date;
  day: number;           // days since journey start
  kind: EventKind;
  title: string;
  subtitle?: string;
  emoji: string;
  highlight: boolean;    // major milestone — shown larger
}

// ─── Event builders ───────────────────────────────────────────────────────────

function buildEvents(data: {
  startedAt: Date;
  activityLogs: { type: string; metadata: unknown; createdAt: Date }[];
  skillHistory: { dimension: string; score: number; source: string; recordedAt: Date }[];
  sessions: { overallScore: number | null; type: string; completedAt: Date | null }[];
  applications: { company: string; status: string; appliedAt: Date | null; rejectionStage: string | null; updatedAt: Date }[];
  deliverables: { title: string; type: string; createdAt: Date }[];
  gapHistory: { totalGapScore: number; createdAt: Date }[];
  careerProfileSet: boolean;
}): TimelineEvent[] {
  const { startedAt } = data;
  const events: TimelineEvent[] = [];

  function dayNum(date: Date) {
    return Math.max(1, differenceInDays(date, startedAt) + 1);
  }

  // Journey start
  events.push({ date: startedAt, day: 1, kind: "start", title: "Started your 90-day journey", emoji: "🚀", highlight: true });

  // Goal engine set
  if (data.careerProfileSet) {
    // approximate — we don't have the exact date, use earliest activity
    const firstActivity = data.activityLogs[data.activityLogs.length - 1];
    if (firstActivity) {
      events.push({ date: firstActivity.createdAt, day: dayNum(firstActivity.createdAt), kind: "goal_set", title: "Goal Engine configured", subtitle: "AI coaching personalised to your target", emoji: "🎯", highlight: false });
    }
  }

  // Resume analyses (deduplicate to first + significant improvements)
  const resumeActivities = data.activityLogs.filter(a => a.type === "resume_analyzed");
  resumeActivities.forEach((a, i) => {
    const meta = a.metadata as { score?: number } | null;
    const score = meta?.score;
    const isFirst = i === 0;
    events.push({
      date: a.createdAt, day: dayNum(a.createdAt), kind: "resume_analyzed",
      title: isFirst ? `Resume analyzed — Score: ${score ?? "??"}/100` : `Resume re-analyzed — Score: ${score ?? "??"}/100`,
      subtitle: isFirst && score !== undefined && score < 60 ? "Starting point identified — clear path to improve" : undefined,
      emoji: "📄", highlight: isFirst,
    });
  });

  // Skill score milestones — dimension crossing 70 for the first time
  const dimensionPeaks: Record<string, number> = {};
  for (const h of data.skillHistory.sort((a, b) => a.recordedAt.getTime() - b.recordedAt.getTime())) {
    const prev = dimensionPeaks[h.dimension] ?? 0;
    if (prev < 70 && h.score >= 70) {
      events.push({
        date: h.recordedAt, day: dayNum(h.recordedAt), kind: "skill_milestone",
        title: `${h.dimension.replace(/_/g, " ")} reached Strong level`,
        subtitle: `Score: ${h.score}/100 — now in recruiter-ready territory`,
        emoji: "⭐", highlight: true,
      });
    }
    if (h.score > prev) dimensionPeaks[h.dimension] = h.score;
  }

  // Readiness milestones (50% and 70%)
  let crossed50 = false, crossed70 = false;
  for (const g of data.gapHistory.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())) {
    if (!crossed50 && g.totalGapScore >= 50) {
      events.push({ date: g.createdAt, day: dayNum(g.createdAt), kind: "readiness_milestone", title: "Readiness crossed 50%", subtitle: "Past the halfway threshold — momentum building", emoji: "📈", highlight: true });
      crossed50 = true;
    }
    if (!crossed70 && g.totalGapScore >= 70) {
      events.push({ date: g.createdAt, day: dayNum(g.createdAt), kind: "readiness_milestone", title: "Readiness crossed 70% — now competitive", subtitle: "You can start applying to your target companies", emoji: "🏆", highlight: true });
      crossed70 = true;
    }
  }

  // Interview sessions
  for (const s of data.sessions) {
    if (!s.completedAt) continue;
    events.push({
      date: s.completedAt, day: dayNum(s.completedAt), kind: "interview",
      title: `Mock ${s.type.replace(/_/g, " ")} interview — ${s.overallScore ?? "??"}/100`,
      subtitle: s.overallScore !== null && s.overallScore >= 70 ? "Strong performance" : s.overallScore !== null && s.overallScore < 50 ? "Room to improve — keep practicing" : undefined,
      emoji: "🎤", highlight: s.overallScore !== null && s.overallScore >= 75,
    });
  }

  // Job applications
  for (const a of data.applications) {
    if (a.appliedAt) {
      events.push({ date: a.appliedAt, day: dayNum(a.appliedAt), kind: "application", title: `Applied to ${a.company}`, emoji: "📨", highlight: false });
    }
    if (a.status === "rejected" && a.rejectionStage) {
      events.push({
        date: a.updatedAt, day: dayNum(a.updatedAt), kind: "rejection",
        title: `Rejected at ${a.company}`,
        subtitle: `Stage: ${a.rejectionStage.replace(/_/g, " ")} — insight generated`,
        emoji: "📊", highlight: false,
      });
    }
    if (a.status === "offer") {
      events.push({ date: a.updatedAt, day: dayNum(a.updatedAt), kind: "application", title: `Offer received at ${a.company}! 🎉`, emoji: "🏅", highlight: true });
    }
  }

  // Deliverables (show first, then every 5th)
  const delivs = data.deliverables.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  delivs.forEach((d, i) => {
    if (i === 0 || (i + 1) % 5 === 0) {
      events.push({
        date: d.createdAt, day: dayNum(d.createdAt), kind: "deliverable",
        title: i === 0 ? `First career asset: "${d.title}"` : `${i + 1} deliverables built — "${d.title}"`,
        emoji: "💼", highlight: i === 0 || (i + 1) % 10 === 0,
      });
    }
  });

  // Level completions (deduplicated task_completed from activity logs — use distinct week completions)
  const levelCompletions = data.activityLogs
    .filter(a => a.type === "task_completed")
    .map(a => ({ date: a.createdAt, meta: a.metadata as { taskLabel?: string } | null }));

  // We don't have week-level completion events directly. Use every 4th task completion as a proxy.
  const taskCompletionDates = levelCompletions.map(l => l.date).sort((a, b) => a.getTime() - b.getTime());
  const levelCompletionDates = taskCompletionDates.filter((_, i) => (i + 1) % 4 === 0).slice(0, 12);
  levelCompletionDates.forEach((d, i) => {
    events.push({
      date: d, day: dayNum(d), kind: "level_complete",
      title: `Level ${i + 1} milestones completed`,
      emoji: "✅", highlight: i === 0 || (i + 1) % 3 === 0,
    });
  });

  // Sort by date, dedupe events on same day by keeping only distinct kind
  const sorted = events.sort((a, b) => a.date.getTime() - b.date.getTime());

  // Limit to 30 most meaningful events
  const highlights = sorted.filter(e => e.highlight);
  const others = sorted.filter(e => !e.highlight);
  const combined = [...highlights, ...others]
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 35);

  return combined;
}

// ─── AI narrative ─────────────────────────────────────────────────────────────

async function generateNarrative(
  ctx: Awaited<ReturnType<typeof buildCareerContext>>,
  events: TimelineEvent[],
  dayCount: number
): Promise<string> {
  const roleLabel = ROLE_LABELS[ctx.targetRole as TargetRole] ?? ctx.targetRole.replace(/_/g, " ");
  const highlights = events.filter(e => e.highlight).map(e => `Day ${e.day}: ${e.title}`).slice(0, 8);
  const improvements = Object.entries(ctx.skillScores)
    .filter(([d]) => d !== "recruiter_readiness")
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4)
    .map(([d, s]) => `${d.replace(/_/g, " ")}: ${s}/100`);

  const { text } = await generateText({
    model: defaultModel,
    prompt: `Write a 3-paragraph career journey narrative in first person for someone building toward ${roleLabel}${ctx.targetCompanies[0] ? ` at ${ctx.targetCompanies[0]}` : ""}.

Journey: ${dayCount} days active
${ctx.careerGoal ? `Goal: "${ctx.careerGoal}"` : ""}
Current readiness: ${ctx.roadmapTasksDone > 0 ? "progressing" : "just started"}
Tasks done: ${ctx.roadmapTasksDone}/${ctx.roadmapTasksTotal}
Deliverables: ${ctx.deliverableCount}
Interviews: ${ctx.interviewSessionCount}${ctx.avgInterviewScore ? ` (avg ${ctx.avgInterviewScore}/100)` : ""}
Key milestones:
${highlights.map(h => `  - ${h}`).join("\n")}
Current skill scores: ${improvements.join(", ")}

Paragraph 1: Where the journey began — the starting point, initial challenges, what the scores showed.
Paragraph 2: The growth — key turning points, skills built, evidence gathered.
Paragraph 3: Where they are now and what the next chapter looks like.

Rules: specific numbers, real milestones, past/present tense. Read like a coach who watched every step. No generic motivation. No "you should". Under 200 words total.`,
  });

  return text.trim();
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function TimelinePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const ctx = await buildCareerContext(userId);

  const [roadmap, activityLogs, skillHistory, sessions, applications, deliverables, gapHistory, careerProfile] = await Promise.all([
    db.roadmap.findUnique({ where: { userId }, select: { startedAt: true } }),
    db.activityLog.findMany({ where: { userId }, orderBy: { createdAt: "asc" }, select: { type: true, metadata: true, createdAt: true } }),
    db.skillScoreHistory.findMany({ where: { userId }, orderBy: { recordedAt: "asc" }, select: { dimension: true, score: true, source: true, recordedAt: true } }),
    db.interviewSession.findMany({ where: { userId, status: "complete" }, select: { overallScore: true, type: true, completedAt: true } }),
    db.jobApplication.findMany({ where: { userId }, select: { company: true, status: true, appliedAt: true, rejectionStage: true, updatedAt: true } }),
    db.deliverable.findMany({ where: { userId }, orderBy: { createdAt: "asc" }, select: { title: true, type: true, createdAt: true } }),
    db.gapReport.findMany({ where: { userId }, orderBy: { createdAt: "asc" }, select: { totalGapScore: true, createdAt: true } }),
    db.careerProfile.findUnique({ where: { userId }, select: { careerGoal: true } }),
  ]);

  if (!roadmap) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 space-y-4">
        <p className="text-2xl font-bold text-white">No journey yet</p>
        <p className="text-slate-400">Generate your roadmap to start your 90-day journey.</p>
        <Link href="/roadmap" className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-colors">
          Go to Roadmap <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const startedAt  = new Date(roadmap.startedAt);
  const dayCount   = differenceInDays(new Date(), startedAt) + 1;
  const roleLabel  = ROLE_LABELS[ctx.targetRole as TargetRole] ?? ctx.targetRole.replace(/_/g, " ");

  const events = buildEvents({
    startedAt,
    activityLogs: activityLogs.map(a => ({ ...a, createdAt: new Date(a.createdAt) })),
    skillHistory: skillHistory.map(h => ({ ...h, recordedAt: new Date(h.recordedAt) })),
    sessions: sessions.map(s => ({ ...s, completedAt: s.completedAt ? new Date(s.completedAt) : null })),
    applications: applications.map(a => ({ ...a, appliedAt: a.appliedAt ? new Date(a.appliedAt) : null, updatedAt: new Date(a.updatedAt) })),
    deliverables: deliverables.map(d => ({ ...d, createdAt: new Date(d.createdAt) })),
    gapHistory: gapHistory.map(g => ({ ...g, createdAt: new Date(g.createdAt) })),
    careerProfileSet: !!careerProfile?.careerGoal,
  });

  const narrative = events.length > 1 ? await generateNarrative(ctx, events, dayCount) : null;

  // Group events into chapters by phase
  const phase1End = differenceInDays(startedAt, startedAt) + 30;
  const phase2End = phase1End + 30;

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Career Intelligence</p>
        <h1 className="text-2xl font-bold text-white">Your Journey</h1>
        <p className="text-slate-400 text-sm mt-1">
          Day {dayCount} · {roleLabel}{ctx.targetCompanies[0] ? ` · Targeting ${ctx.targetCompanies[0]}` : ""}
        </p>
      </div>

      {/* AI narrative */}
      {narrative && (
        <div className="bg-[#161820] rounded-2xl border border-white/10 shadow-sm p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-violet-400 mb-4">Your Story</p>
          <div className="space-y-3">
            {narrative.split("\n\n").filter(Boolean).map((para, i) => (
              <p key={i} className="text-slate-200 text-sm leading-relaxed">{para}</p>
            ))}
          </div>
        </div>
      )}

      {/* Visual timeline */}
      {events.length > 0 && (
        <div className="bg-[#161820] rounded-2xl border border-white/10 shadow-sm p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Timeline</p>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[19px] top-0 bottom-0 w-px bg-white/10" />

            <div className="space-y-1">
              {events.map((event, i) => {
                const dayDiff = i > 0 ? event.day - events[i - 1].day : 0;
                const showChapterBreak = i > 0 && (
                  (events[i - 1].day <= 30 && event.day > 30) ||
                  (events[i - 1].day <= 60 && event.day > 60)
                );
                const chapterLabel = event.day <= 30 ? null : event.day <= 60 ? "Month 2 — Building" : "Month 3 — Applying";

                return (
                  <div key={i}>
                    {/* Chapter break */}
                    {showChapterBreak && chapterLabel && (
                      <div className="relative flex items-center gap-3 py-4 pl-10">
                        <div className="absolute left-0 right-0 border-t border-white/[0.06]" />
                        <span className="relative bg-[#161820] pr-3 text-[10px] font-bold uppercase tracking-widest text-slate-600 z-10 ml-10">
                          {chapterLabel}
                        </span>
                      </div>
                    )}

                    {/* Event row */}
                    <div className={`relative flex items-start gap-4 py-3 ${event.highlight ? "opacity-100" : "opacity-70"}`}>
                      {/* Dot */}
                      <div className={`relative z-10 flex items-center justify-center shrink-0 ${
                        event.highlight
                          ? "h-10 w-10 rounded-xl bg-[#161820] border-2 border-indigo-500/50 text-base"
                          : "h-8 w-8 rounded-lg bg-[#161820] border border-white/10 text-sm"
                      }`}>
                        {event.emoji}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pt-1">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <p className={`font-semibold leading-snug ${event.highlight ? "text-white text-sm" : "text-slate-300 text-xs"}`}>
                            {event.title}
                          </p>
                          <span className="text-[10px] text-slate-600 shrink-0 tabular-nums whitespace-nowrap">
                            Day {event.day} · {format(event.date, "MMM d")}
                          </span>
                        </div>
                        {event.subtitle && (
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{event.subtitle}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Today marker */}
              <div className="relative flex items-center gap-4 pt-3">
                <div className="relative z-10 flex items-center justify-center h-10 w-10 rounded-xl bg-indigo-500/20 border-2 border-indigo-500/50 text-base shrink-0">
                  📍
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-sm font-bold text-indigo-300">You are here — Day {dayCount}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {ctx.roadmapTasksTotal > 0
                      ? `${ctx.roadmapTasksDone}/${ctx.roadmapTasksTotal} tasks complete · ${Math.round((ctx.roadmapTasksDone / ctx.roadmapTasksTotal) * 100)}% through the journey`
                      : "Journey in progress"}
                  </p>
                </div>
                <span className="text-[10px] text-slate-600 shrink-0 tabular-nums">{format(new Date(), "MMM d, yyyy")}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export CTA */}
      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-5 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm font-bold text-white">Share your transformation</p>
          <p className="text-xs text-slate-400 mt-0.5">Export your full 90-day portfolio as a shareable page or PDF</p>
        </div>
        <Link href="/report" className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-colors shrink-0">
          Export portfolio <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
