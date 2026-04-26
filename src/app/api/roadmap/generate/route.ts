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

const TaskSchema = z.object({
  label:        z.string(),
  description:  z.string(),
  resourceUrls: z.array(z.string()),
  hours:        z.number(),
  impactScore:  z.number(),
  whyItMatters: z.string(),
  gapLabel:     z.string().optional(),
});

const WeekSchema = z.object({
  weekNumber: z.number(),
  theme: z.string(),
  estimatedHours: z.number(),
  deliverable: z.string(),
  tasks: z.array(TaskSchema),
});

const RoadmapSchema = z.object({ weeks: z.array(WeekSchema) });

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
  if (!gapReport) return NextResponse.json({ error: "No gap report found. Complete gap analysis first." }, { status: 404 });

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      targetRole: true,
      hoursPerWeek: true,
      targetTimeline: true,
      targetCompanyType: true,
      learningStyle: true,
      targetReason: true,
      githubUrl: true,
      githubSignal: true,
    },
  });

  const targetRole = (user?.targetRole ?? "product_swe") as TargetRole;

  const planning: PlanningContext = {
    hoursPerWeek:       user?.hoursPerWeek        ?? 10,
    targetTimeline:     user?.targetTimeline       ?? "6_months",
    targetCompanyType:  user?.targetCompanyType    ?? "any_product",
    learningStyle:      user?.learningStyle        ?? "mix",
    targetReason:       user?.targetReason         ?? "growth",
  };

  // Fetch GitHub signal — use cached value if available, otherwise fetch live
  let githubSignal = user?.githubSignal
    ? (user.githubSignal as unknown as import("@/lib/github-signal").GitHubSignal)
    : null;

  if (!githubSignal && user?.githubUrl) {
    githubSignal = await fetchGitHubSignal(user.githubUrl);
    if (githubSignal) {
      // Cache for future regenerations (fire-and-forget)
      db.user.update({ where: { id: userId }, data: { githubSignal: githubSignal as unknown as import("@prisma/client").Prisma.InputJsonValue } }).catch(() => {});
    }
  }

  const gapReportResult: GapReportResult = {
    skillGaps:     (gapReport.skillGaps as unknown) as GapReportResult["skillGaps"],
    projectGaps:   (gapReport.projectGaps as unknown) as GapReportResult["projectGaps"],
    storyGaps:     (gapReport.storyGaps as unknown) as GapReportResult["storyGaps"],
    totalGapScore: gapReport.totalGapScore,
    summary:       "",
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
        overallScore:     analysis.overallScore,
        skillsFound:      (analysis.skillsFound as string[]) ?? [],
        techYears:        (analysis.techYears as Record<string, number>) ?? {},
        starStoriesCount: analysis.starStoriesCount,
        impactScore:      analysis.impactScore,
        projectComplexity: analysis.projectComplexity,
      }
    : undefined;

  const { object } = await generateObject({
    model: defaultModel,
    schema: RoadmapSchema,
    prompt: buildRoadmapPrompt(gapReportResult, targetRole, planning, resumeText, resumeSignal, githubSignal),
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
          weekNumber:     w.weekNumber,
          theme:          w.theme,
          estimatedHours: w.estimatedHours,
          deliverable:    w.deliverable,
          deliverableDone: false,
          tasks: {
            create: w.tasks.map((t) => ({
              label:         t.label,
              description:   t.description,
              // Replace AI-hallucinated URLs with curated library links (or search fallbacks)
              resourceUrls:  enrichTaskResources(t.label, t.gapLabel),
              hours:         t.hours,
              impactScore:   Math.min(10, Math.max(1, Math.round(t.impactScore))),
              whyItMatters:  t.whyItMatters,
              gapLabel:      t.gapLabel ?? null,
              completed:     false,
            })),
          },
        })),
      },
    },
  });

  await db.activityLog.create({
    data: { userId, type: "roadmap_generated", metadata: { roadmapId: roadmap.id } },
  });

  // Fire-and-forget — don't block the response
  triggerRoadmapReadyEmail(userId, targetRole, weeks[0]?.theme ?? "Foundation").catch(() => {});

  return NextResponse.json({ roadmapId: roadmap.id });
}
