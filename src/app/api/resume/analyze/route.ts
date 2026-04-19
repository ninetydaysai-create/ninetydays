export const maxDuration = 60;

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { defaultModel } from "@/lib/ai";
import { generateObject } from "ai";
import { z } from "zod";
import { assertPlanAllows } from "@/lib/plan-guard";
import { buildResumeAnalysisPrompt } from "@/prompts/resume-analysis";
import { parseTimelineYears, mergeTimelineWithModel } from "@/lib/timeline-parser";

// z.record() generates `propertyNames` in JSON Schema which Anthropic rejects.
// Use arrays of objects instead, then convert to records after generation.
const ResumeAnalysisSchema = z.object({
  overallScore: z.number(),
  skillsFound: z.array(z.string()),
  techYears: z.array(z.object({ skill: z.string(), years: z.number() })),
  starStoriesCount: z.number(),
  impactScore: z.number(),
  projectComplexity: z.number(),
  signalDepthScore: z.number(),
  signalDepthMap: z.array(z.object({ skill: z.string(), depth: z.enum(["STRONG", "MODERATE", "WEAK"]) })),
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
  let object: z.infer<typeof ResumeAnalysisSchema>;
  try {
    ({ object } = await generateObject({
      model: defaultModel,
      schema: ResumeAnalysisSchema,
      prompt: buildResumeAnalysisPrompt(resume.rawText, user?.targetRole ?? "product_swe"),
    }));
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("AI analysis error:", msg);
    return NextResponse.json({ error: `AI analysis failed: ${msg}` }, { status: 500 });
  }

  // Convert arrays → records (Anthropic doesn't support z.record/propertyNames)
  const techYearsRecord: Record<string, number> = Object.fromEntries(
    object.techYears.map(({ skill, years }) => [skill, years])
  );
  const signalDepthRecord: Record<string, string> = Object.fromEntries(
    object.signalDepthMap.map(({ skill, depth }) => [skill, depth])
  );

  // Merge deterministic timeline-parsed years with model-inferred years
  const parsedYears = parseTimelineYears(resume.rawText);
  const finalTechYears = mergeTimelineWithModel(parsedYears, techYearsRecord);

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
      rawAnalysis: { ...object, techYears: finalTechYears, signalDepthMap: signalDepthRecord },
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
