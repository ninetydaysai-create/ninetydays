import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { syncUser } from "@/lib/sync-user";
import { defaultModel } from "@/lib/ai";
import { generateObject } from "ai";
import { z } from "zod";
import { buildGapEnginePrompt } from "@/prompts/gap-engine";
import { ResumeAnalysisResult } from "@/types/resume";
import { enrichGapsWithLinks } from "@/lib/resource-links";

export const maxDuration = 60;

const GapItemSchema = z.object({
  id:                z.string(),
  label:             z.string(),
  description:       z.string(),
  severity:          z.enum(["critical", "major", "minor"]),
  estimatedHours:    z.number().min(0).max(200),
  resourceLinks:     z.array(z.string()),
  resolved:          z.boolean().default(false),
  impactIfIgnored:   z.string().optional(),
  fixStrategy:       z.enum(["learn", "build", "document", "reframe"]).optional(),
  interviewQuestion: z.string().optional(),
});

const GapReportSchema = z.object({
  skillGaps:     z.array(GapItemSchema),
  projectGaps:   z.array(GapItemSchema),
  storyGaps:     z.array(GapItemSchema),
  totalGapScore: z.number().min(0).max(100),
  summary:       z.string(),
});

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await syncUser(userId);

  const { analysisId } = await req.json();
  if (!analysisId) return NextResponse.json({ error: "analysisId required" }, { status: 400 });

  const analysis = await db.resumeAnalysis.findUnique({
    where: { id: analysisId, userId },
    include: { resume: { select: { rawText: true } } },
  });
  if (!analysis) return NextResponse.json({ error: "Analysis not found" }, { status: 404 });

  // Require target role to be set before running gap analysis
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      targetRole:        true,
      yearsExperience:   true,
      currentRole:       true,
      targetCompanyType: true,
    },
  });

  if (!user?.targetRole) {
    return NextResponse.json(
      { error: "Set your target role in Settings before running gap analysis." },
      { status: 400 }
    );
  }

  const targetRole = user.targetRole;
  const rawAnalysis = analysis.rawAnalysis as unknown as ResumeAnalysisResult;

  let object;
  try {
    ({ object } = await generateObject({
      model: defaultModel,
      schema: GapReportSchema,
      prompt: buildGapEnginePrompt(
        rawAnalysis,
        targetRole,
        analysis.resume?.rawText ?? undefined,
        user?.yearsExperience ?? undefined,
        user?.currentRole ?? undefined,
        user?.targetCompanyType ?? undefined,
      ),
    }));
  } catch (err) {
    console.error("[gaps/generate] generateObject failed:", err);
    return NextResponse.json(
      { error: "AI generation failed. Please try again in a moment." },
      { status: 500 }
    );
  }

  // Enrich each gap with curated resource links from our library
  const skillGaps  = enrichGapsWithLinks(object.skillGaps);
  const projectGaps = enrichGapsWithLinks(object.projectGaps);
  const storyGaps  = enrichGapsWithLinks(object.storyGaps);

  const report = await db.gapReport.upsert({
    where: { analysisId },
    create: {
      userId,
      analysisId,
      skillGaps,
      projectGaps,
      storyGaps,
      totalGapScore: object.totalGapScore,
      summary:       object.summary,
    },
    update: {
      skillGaps,
      projectGaps,
      storyGaps,
      totalGapScore: object.totalGapScore,
      summary:       object.summary,
    },
  });

  return NextResponse.json({ gapReportId: report.id, totalGapScore: report.totalGapScore });
}
