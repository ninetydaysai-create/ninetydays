import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { defaultModel } from "@/lib/ai";
import { generateObject } from "ai";
import { z } from "zod";
import { buildLinkedInOptimizationPrompt } from "@/prompts/linkedin-optimizer";
import { ResumeAnalysisResult } from "@/types/resume";
import { assertPlanAllows } from "@/lib/plan-guard";

export const maxDuration = 60;

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, Math.round(n)));

const LinkedInResultSchema = z.object({
  outputHeadline: z.string(),
  outputSummary: z.string(),
  alternatives: z.array(z.string()),
  keywordsAdded: z.array(z.string()),
  keywordsMissing: z.array(z.string()),
  profileScore: z.number(),
  scoreBreakdown: z.object({
    keywords:     z.number(),
    hook:         z.number(),
    credibility:  z.number(),
    callToAction: z.number(),
  }),
}).transform((d) => ({
  ...d,
  profileScore: clamp(d.profileScore, 0, 100),
  scoreBreakdown: {
    keywords:     clamp(d.scoreBreakdown.keywords, 0, 25),
    hook:         clamp(d.scoreBreakdown.hook, 0, 25),
    credibility:  clamp(d.scoreBreakdown.credibility, 0, 25),
    callToAction: clamp(d.scoreBreakdown.callToAction, 0, 25),
  },
}));

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

  let object;
  try {
    const result = await generateObject({
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
    object = result.object;
  } catch (err) {
    console.error("[linkedin/optimize] generateObject failed:", err);
    return NextResponse.json({ error: "AI generation failed — please try again." }, { status: 500 });
  }

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
