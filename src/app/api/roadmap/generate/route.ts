import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { syncUser } from "@/lib/sync-user";
import { defaultModel } from "@/lib/ai";
import { generateObject } from "ai";
import { z } from "zod";
import { buildRoadmapPrompt } from "@/prompts/roadmap-generator";
import { GapReportResult } from "@/types/gaps";
import { TargetRole } from "@prisma/client";
import { assertPlanAllows } from "@/lib/plan-guard";

const TaskSchema = z.object({
  label: z.string(),
  description: z.string(),
  resourceUrls: z.array(z.string()),
  hours: z.number(),
  impactScore: z.number(),    // 1-10: how much this task boosts readiness
  whyItMatters: z.string(),   // e.g. "Asked in 80% of ML Engineer interviews"
});

const WeekSchema = z.object({
  weekNumber: z.number(),
  theme: z.string(),
  estimatedHours: z.number(),
  deliverable: z.string(),
  tasks: z.array(TaskSchema),
});

// Anthropic structured output requires a root object — wrap the array
const RoadmapSchema = z.object({ weeks: z.array(WeekSchema) });

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await syncUser(userId);

  const _planGuard = await assertPlanAllows(userId, "roadmap_generation");
  if (_planGuard) return _planGuard;

  const { gapReportId, hoursPerWeek = 10 } = await req.json();

  const gapReport = await db.gapReport.findFirst({
    where: gapReportId ? { id: gapReportId, userId } : { userId },
    orderBy: { createdAt: "desc" },
  });
  if (!gapReport) return NextResponse.json({ error: "No gap report found. Complete gap analysis first." }, { status: 404 });

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { targetRole: true },
  });

  const targetRole = (user?.targetRole ?? "product_swe") as TargetRole;

  const gapReportResult: GapReportResult = {
    skillGaps: (gapReport.skillGaps as unknown) as GapReportResult["skillGaps"],
    projectGaps: (gapReport.projectGaps as unknown) as GapReportResult["projectGaps"],
    storyGaps: (gapReport.storyGaps as unknown) as GapReportResult["storyGaps"],
    totalGapScore: gapReport.totalGapScore,
    summary: "",
  };

  // Fetch resume + analysis for deep signal calibration
  const analysis = await db.resumeAnalysis.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { resume: { select: { rawText: true } } },
  });

  const resumeText = analysis?.resume?.rawText ?? undefined;
  const resumeSignal = analysis
    ? {
        overallScore: analysis.overallScore,
        skillsFound: (analysis.skillsFound as string[]) ?? [],
        techYears: (analysis.techYears as Record<string, number>) ?? {},
        starStoriesCount: analysis.starStoriesCount,
        impactScore: analysis.impactScore,
        projectComplexity: analysis.projectComplexity,
      }
    : undefined;

  const { object } = await generateObject({
    model: defaultModel,
    schema: RoadmapSchema,
    prompt: buildRoadmapPrompt(gapReportResult, targetRole, hoursPerWeek, resumeText, resumeSignal),
  });
  const weeks = object.weeks;

  // Delete existing roadmap (cascade deletes weeks + tasks)
  await db.roadmap.deleteMany({ where: { userId } });

  const roadmap = await db.roadmap.create({
    data: {
      userId,
      gapReportId: gapReport.id,
      targetRole,
      startedAt: new Date(),
      weeks: {
        create: weeks.map((w) => ({
          weekNumber: w.weekNumber,
          theme: w.theme,
          estimatedHours: w.estimatedHours,
          deliverable: w.deliverable,
          deliverableDone: false,
          tasks: {
            create: w.tasks.map((t) => ({
              label: t.label,
              description: t.description,
              resourceUrls: t.resourceUrls,
              hours: t.hours,
              impactScore: Math.min(10, Math.max(1, Math.round(t.impactScore))),
              whyItMatters: t.whyItMatters,
              completed: false,
            })),
          },
        })),
      },
    },
  });

  // Track usage for plan guard (lifetime count)
  await db.activityLog.create({
    data: { userId, type: "roadmap_generated", metadata: { roadmapId: roadmap.id } },
  });

  return NextResponse.json({ roadmapId: roadmap.id });
}
