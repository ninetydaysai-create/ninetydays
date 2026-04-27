import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { syncUser } from "@/lib/sync-user";
import { defaultModel } from "@/lib/ai";
import { generateObject } from "ai";
import { z } from "zod";
import { buildRoadmapPrompt, PlanningContext } from "@/prompts/roadmap-generator";
import { GapReportResult } from "@/types/gaps";
import { TargetRole } from "@prisma/client";
import { assertPlanAllows } from "@/lib/plan-guard";
import { fetchGitHubSignal } from "@/lib/github-signal";
import { enrichTaskResources } from "@/lib/resource-links";
import { triggerRoadmapReadyEmail } from "@/lib/email-triggers";

export const maxDuration = 60;

// 7-day TTL for cached GitHub signal
const GITHUB_SIGNAL_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const TaskSchema = z.object({
  label:        z.string(),
  description:  z.string(),
  resourceUrls: z.array(z.string()),
  hours:        z.number().int().min(1).max(40),
  impactScore:  z.number(),
  whyItMatters: z.string(),
  gapLabel:     z.string().optional(),
});

const WeekSchema = z.object({
  weekNumber:     z.number().int().min(1).max(12),
  theme:          z.string(),
  estimatedHours: z.number().int().min(1).max(60),
  deliverable:    z.string(),
  tasks:          z.array(TaskSchema).min(1).max(6),
});

const RoadmapSchema = z.object({
  weeks:        z.array(WeekSchema).min(1).max(12),
  applyReadyAt: z.number().int().min(1).max(12).optional(),
});

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await syncUser(userId);

  const _planGuard = await assertPlanAllows(userId, "roadmap_generation");
  if (_planGuard) return _planGuard;

  const { gapReportId } = await req.json();

  const gapReport = await db.gapReport.findFirst({
    where: gapReportId ? { id: gapReportId, userId } : { userId },
    orderBy: { createdAt: "desc" },
  });
  if (!gapReport) {
    return NextResponse.json(
      { error: "No gap report found. Complete gap analysis first." },
      { status: 404 }
    );
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      targetRole:             true,
      hoursPerWeek:           true,
      targetTimeline:         true,
      targetCompanyType:      true,
      learningStyle:          true,
      targetReason:           true,
      yearsExperience:        true,
      currentRole:            true,
      githubUrl:              true,
      githubSignal:           true,
      githubSignalUpdatedAt:  true,
    },
  });

  if (!user?.targetRole) {
    return NextResponse.json(
      { error: "Set your target role in Settings before generating your roadmap." },
      { status: 400 }
    );
  }

  const targetRole = user.targetRole as TargetRole;

  const planning: PlanningContext = {
    hoursPerWeek:      user.hoursPerWeek      ?? 10,
    targetTimeline:    user.targetTimeline     ?? "6_months",
    targetCompanyType: user.targetCompanyType  ?? "any_product",
    learningStyle:     user.learningStyle      ?? "mix",
    targetReason:      user.targetReason       ?? "growth",
    yearsExperience:   user.yearsExperience    ?? undefined,
    currentRole:       user.currentRole        ?? undefined,
  };

  // GitHub signal: use cache if fresh (< 7 days), otherwise fetch live
  const signalAge = user.githubSignalUpdatedAt
    ? Date.now() - new Date(user.githubSignalUpdatedAt).getTime()
    : Infinity;
  const cachedSignalFresh = signalAge < GITHUB_SIGNAL_TTL_MS;

  let githubSignal = (cachedSignalFresh && user.githubSignal)
    ? (user.githubSignal as unknown as import("@/lib/github-signal").GitHubSignal)
    : null;

  if (!githubSignal && user.githubUrl) {
    try {
      githubSignal = await fetchGitHubSignal(user.githubUrl);
    } catch (err) {
      console.error("[roadmap/generate] GitHub signal fetch failed:", err);
    }
    if (githubSignal) {
      db.user.update({
        where: { id: userId },
        data: {
          githubSignal:          githubSignal as unknown as import("@prisma/client").Prisma.InputJsonValue,
          githubSignalUpdatedAt: new Date(),
        },
      }).catch((err) => console.error("[roadmap/generate] GitHub signal cache write failed:", err));
    }
  }

  const gapReportResult: GapReportResult = {
    skillGaps:     (gapReport.skillGaps  as unknown) as GapReportResult["skillGaps"],
    projectGaps:   (gapReport.projectGaps as unknown) as GapReportResult["projectGaps"],
    storyGaps:     (gapReport.storyGaps  as unknown) as GapReportResult["storyGaps"],
    totalGapScore: gapReport.totalGapScore,
    summary:       gapReport.summary ?? "",
  };

  // Use the resume linked to THIS gap report's analysis — not the latest
  const analysis = await db.resumeAnalysis.findUnique({
    where:   { id: gapReport.analysisId },
    include: { resume: { select: { rawText: true } } },
  });

  const resumeText = analysis?.resume?.rawText ?? undefined;
  const resumeSignal = analysis
    ? {
        overallScore:      analysis.overallScore,
        skillsFound:       (analysis.skillsFound as string[])            ?? [],
        techYears:         (analysis.techYears   as Record<string, number>) ?? {},
        starStoriesCount:  analysis.starStoriesCount,
        impactScore:       analysis.impactScore,
        projectComplexity: analysis.projectComplexity,
      }
    : undefined;

  let object;
  try {
    ({ object } = await generateObject({
      model: defaultModel,
      schema: RoadmapSchema,
      prompt: buildRoadmapPrompt(gapReportResult, targetRole, planning, resumeText, resumeSignal, githubSignal ?? null),
    }));
  } catch (err) {
    console.error("[roadmap/generate] generateObject failed:", err);
    return NextResponse.json(
      { error: "AI generation failed. Please try again in a moment." },
      { status: 500 }
    );
  }

  const weeks = object.weeks;

  // Atomic: delete old roadmap + create new one in a single transaction
  const roadmap = await db.$transaction(async (tx) => {
    await tx.roadmap.deleteMany({ where: { userId } });
    return tx.roadmap.create({
      data: {
        userId,
        gapReportId:  gapReport.id,
        targetRole,
        applyReadyAt: object.applyReadyAt ?? null,
        startedAt:    new Date(),
        weeks: {
          create: weeks.map((w) => ({
            weekNumber:      w.weekNumber,
            theme:           w.theme,
            estimatedHours:  w.estimatedHours,
            deliverable:     w.deliverable,
            deliverableDone: false,
            tasks: {
              create: w.tasks.map((t) => ({
                label:        t.label,
                description:  t.description,
                resourceUrls: enrichTaskResources(t.label, t.gapLabel),
                hours:        t.hours,
                impactScore:  Math.min(10, Math.max(1, Math.round(t.impactScore))),
                whyItMatters: t.whyItMatters,
                gapLabel:     t.gapLabel ?? null,
                completed:    false,
              })),
            },
          })),
        },
      },
    });
  });

  await db.activityLog.create({
    data: { userId, type: "roadmap_generated", metadata: { roadmapId: roadmap.id } },
  });

  triggerRoadmapReadyEmail(userId, targetRole, weeks[0]?.theme ?? "Foundation")
    .catch((err) => console.error("[roadmap/generate] Email trigger failed:", err));

  return NextResponse.json({ roadmapId: roadmap.id });
}
