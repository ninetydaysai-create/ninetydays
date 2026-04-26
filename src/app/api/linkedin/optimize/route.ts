import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { defaultModel } from "@/lib/ai";
import { generateObject } from "ai";
import { z } from "zod";
import { buildLinkedInOptimizationPrompt } from "@/prompts/linkedin-optimizer";
import { ResumeAnalysisResult } from "@/types/resume";
import { assertPlanAllows } from "@/lib/plan-guard";

const LinkedInResultSchema = z.object({
  outputHeadline: z.string(),
  outputSummary: z.string(),
  alternatives: z.array(z.string()),
  keywordsAdded: z.array(z.string()),
  keywordsMissing: z.array(z.string()),
  profileScore: z.number().min(0).max(100),
  scoreBreakdown: z.object({
    keywords:     z.number().min(0).max(25),
    hook:         z.number().min(0).max(25),
    credibility:  z.number().min(0).max(25),
    callToAction: z.number().min(0).max(25),
  }),
});

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const _planGuard = await assertPlanAllows(userId, "linkedin_optimization");
  if (_planGuard) return _planGuard;

  const { headline, summary, jobDescriptions = [] } = await req.json();
  if (!headline) return NextResponse.json({ error: "headline required" }, { status: 400 });

  const [user, latestAnalysis] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { targetRole: true },
    }),
    db.resumeAnalysis.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { rawAnalysis: true, skillsFound: true },
    }),
  ]);

  const rawAnalysis = latestAnalysis?.rawAnalysis as unknown as ResumeAnalysisResult | null;
  const signalDepthMap = rawAnalysis?.signalDepthMap;
  const skillsWithEvidence = (latestAnalysis?.skillsFound as string[]) ?? [];

  const { object } = await generateObject({
    model: defaultModel,
    schema: LinkedInResultSchema,
    prompt: buildLinkedInOptimizationPrompt(
      headline,
      summary ?? "",
      user?.targetRole ?? "product_swe",
      jobDescriptions,
      signalDepthMap as Record<string, string> | undefined,
      skillsWithEvidence
    ),
  });

  await db.linkedinOptimization.create({
    data: {
      userId,
      inputHeadline: headline,
      inputSummary: summary ?? "",
      outputHeadline: object.outputHeadline,
      outputSummary: object.outputSummary,
      alternatives: object.alternatives,
    },
  });

  return NextResponse.json(object);
}
