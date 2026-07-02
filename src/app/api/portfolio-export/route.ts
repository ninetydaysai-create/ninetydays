export const maxDuration = 120;

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { defaultModel } from "@/lib/ai";
import { generateText } from "ai";
import { buildCareerContext } from "@/lib/career-context";
import { captureServerEvent, EVENTS } from "@/lib/analytics";
import { getCompanyReadiness } from "@/lib/company-readiness";
import { differenceInDays } from "date-fns";
import crypto from "node:crypto";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://ninetydays.ai";

async function buildAiSummary(ctx: Awaited<ReturnType<typeof buildCareerContext>> & { readiness?: number }, dayCount: number): Promise<string> {
  const improvements = Object.entries(ctx.skillScores)
    .filter(([d]) => d !== "recruiter_readiness")
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([d, s]) => `${d.replace(/_/g, " ")}: ${s}/100`);

  const { text } = await generateText({
    model: defaultModel,
    prompt: `Write a 2-3 sentence career transformation summary for a professional portfolio. Make it specific, data-driven, and compelling — like a real milestone announcement, not marketing copy.

Candidate: ${ctx.name ?? "the candidate"}
Target role: ${ctx.targetRole.replace(/_/g, " ")}
${ctx.targetRoleTitle ? `Specific target: ${ctx.targetRoleTitle}` : ""}
${ctx.careerGoal ? `Goal: "${ctx.careerGoal}"` : ""}
Days active: ${dayCount}
Readiness: ${ctx.readiness ?? "not scored"}%
Tasks completed: ${ctx.roadmapTasksDone}/${ctx.roadmapTasksTotal}
Deliverables built: ${ctx.deliverableCount}
Mock interviews: ${ctx.interviewSessionCount}${ctx.avgInterviewScore ? ` (avg ${ctx.avgInterviewScore}/100)` : ""}
Strongest skills: ${improvements.join(", ")}
${ctx.targetCompanies.length ? `Targeting: ${ctx.targetCompanies.slice(0, 3).join(", ")}` : ""}

Start with where they were or how long the journey took. Show the key numbers. End with what's now possible. Use "I" perspective if name is present.`,
  });

  return text.trim();
}

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Build full career context
  const ctx = await buildCareerContext(userId);

  // Compute roadmap day count
  const roadmap = await db.roadmap.findUnique({
    where: { userId },
    select: { startedAt: true },
  });
  const dayCount = roadmap ? differenceInDays(new Date(), new Date(roadmap.startedAt)) + 1 : 0;

  // Deliverables with scores
  const deliverables = await db.deliverable.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { title: true, type: true, aiScore: true },
  });

  // Skill before/after
  const historyRaw = await db.skillScoreHistory.findMany({
    where: { userId },
    orderBy: { recordedAt: "asc" },
    select: { dimension: true, score: true },
  });
  const firstByDim: Record<string, number> = {};
  for (const h of historyRaw) {
    if (!(h.dimension in firstByDim)) firstByDim[h.dimension] = h.score;
  }
  const skillHistory: Record<string, { before: number; now: number; delta: number }> = {};
  for (const [dim, nowScore] of Object.entries(ctx.skillScores)) {
    if (dim === "recruiter_readiness") continue;
    const before = firstByDim[dim] ?? nowScore;
    if (nowScore - before > 0) {
      skillHistory[dim] = { before, now: nowScore, delta: nowScore - before };
    }
  }

  // Company readiness
  const companies = getCompanyReadiness(ctx.skillScores, ctx.targetRole).slice(0, 8);

  // Generate AI narrative
  const aiSummary = await buildAiSummary(ctx, dayCount);

  // Snapshot
  const snapshot = {
    name:             ctx.name,
    targetRole:       ctx.targetRole,
    targetRoleTitle:  ctx.targetRoleTitle,
    careerGoal:       ctx.careerGoal,
    targetCompanies:  ctx.targetCompanies,
    dayCount,
    readiness:        (await db.gapReport.findFirst({ where: { userId }, orderBy: { createdAt: "desc" }, select: { totalGapScore: true } }))?.totalGapScore ?? null,
    tasksDone:        ctx.roadmapTasksDone,
    tasksTotal:       ctx.roadmapTasksTotal,
    deliverableCount: ctx.deliverableCount,
    deliverables:     deliverables.slice(0, 12),
    skillScores:      ctx.skillScores,
    skillHistory,
    companies:        companies.map(c => ({ name: c.name, logo: c.logo, score: c.score, status: c.status, statusColor: c.statusColor })),
    sessions:         ctx.interviewSessionCount,
    avgInterviewScore:ctx.avgInterviewScore,
    generatedAt:      new Date().toISOString(),
  };

  // Upsert — preserve existing token so share links stay valid
  const existing = await db.portfolioExport.findUnique({ where: { userId }, select: { token: true } });
  const token = existing?.token ?? crypto.randomBytes(16).toString("hex");

  await db.portfolioExport.upsert({
    where:  { userId },
    update: { snapshot, aiSummary, updatedAt: new Date() },
    create: { userId, token, snapshot, aiSummary },
  });

  captureServerEvent(userId, EVENTS.PORTFOLIO_EXPORTED, {
    deliverableCount: ctx.deliverableCount, dayCount,
    hasAiSummary: true,
  });
  return NextResponse.json({
    url: `${APP_URL}/p/${token}`,
    token,
  });
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await db.portfolioExport.findUnique({
    where: { userId },
    select: { token: true, updatedAt: true },
  });

  if (!existing) return NextResponse.json({ export: null });

  return NextResponse.json({
    export: {
      url: `${APP_URL}/p/${existing.token}`,
      updatedAt: existing.updatedAt,
    },
  });
}
