import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { defaultModel } from "@/lib/ai";
import { generateObject } from "ai";
import { z } from "zod";
import { assertPlanAllows } from "@/lib/plan-guard";
import { buildResumeAnalysisPrompt } from "@/prompts/resume-analysis";
import { parseTimelineYears, mergeTimelineWithModel } from "@/lib/timeline-parser";

const ResumeAnalysisSchema = z.object({
  overallScore: z.number(),
  skillsFound: z.array(z.string()),
  techYears: z.record(z.string(), z.number()),
  starStoriesCount: z.number(),
  impactScore: z.number(),
  projectComplexity: z.number(),
  signalDepthScore: z.number(),
  signalDepthMap: z.record(z.string(), z.enum(["STRONG", "MODERATE", "WEAK"])),
  weakBullets: z.array(z.object({
    original: z.string(),
    rewrite: z.string(),
    reason: z.string(),
  })),
  roleMatchScores: z.array(z.object({
    role: z.string(),
    score: z.number(),
    missingSignals: z.array(z.string()),
  })),
  summary: z.string(),
});

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const _planGuard = await assertPlanAllows(userId, "resume_analysis"); if (_planGuard) return _planGuard;

  const { resumeId } = await req.json();
  if (!resumeId) return NextResponse.json({ error: "resumeId required" }, { status: 400 });

  const resume = await db.resume.findUnique({
    where: { id: resumeId, userId },
  });
  if (!resume) return NextResponse.json({ error: "Resume not found" }, { status: 404 });

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { targetRole: true },
  });

  const start = Date.now();
  const { object } = await generateObject({
    model: defaultModel,
    schema: ResumeAnalysisSchema,
    prompt: buildResumeAnalysisPrompt(resume.rawText, user?.targetRole ?? "product_swe"),
  });

  // Merge deterministic timeline-parsed years with model-inferred years
  // Timeline evidence takes precedence over model inference
  const parsedYears = parseTimelineYears(resume.rawText);
  const finalTechYears = mergeTimelineWithModel(parsedYears, object.techYears);

  const analysis = await db.resumeAnalysis.create({
    data: {
      resumeId,
      userId,
      overallScore: object.overallScore,
      skillsFound: object.skillsFound,
      techYears: finalTechYears,
      starStoriesCount: object.starStoriesCount,
      impactScore: object.impactScore,
      projectComplexity: object.projectComplexity,
      keywordDensityScore: object.signalDepthScore, // repurposed DB column
      weakBullets: object.weakBullets,
      roleMatchScores: object.roleMatchScores,
      rawAnalysis: { ...object, techYears: finalTechYears }, // timeline-merged techYears
    },
  });

  await db.aiLog.create({
    data: {
      userId,
      module: "resume",
      model: "gpt-4o",
      promptTokens: 0,
      completionTokens: 0,
      latencyMs: Date.now() - start,
    },
  });

  await db.activityLog.create({
    data: { userId, type: "resume_analyzed", metadata: { score: object.overallScore } },
  });

  return NextResponse.json({ analysisId: analysis.id, score: analysis.overallScore });
}
