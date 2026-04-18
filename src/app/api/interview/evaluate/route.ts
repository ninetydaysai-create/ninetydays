import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { defaultModel } from "@/lib/ai";
import { generateObject } from "ai";
import { z } from "zod";
import { buildInterviewEvaluationPrompt } from "@/prompts/interview-evaluator";
import { TranscriptMessage } from "@/types/interview";
import { ResumeAnalysisResult } from "@/types/resume";
import { GapReportResult } from "@/types/gaps";

const ScorecardSchema = z.object({
  overallScore: z.number(),
  verdict: z.enum(["Strong Hire", "Hire", "No Hire", "Strong No Hire"]),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
  questionScores: z.array(z.object({
    questionNumber: z.number(),
    question: z.string(),
    userAnswer: z.string(),
    score: z.number(),
    feedback: z.string(),
    idealAnswer: z.string(),
  })),
});

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { sessionId } = await req.json();
  if (!sessionId) return NextResponse.json({ error: "sessionId required" }, { status: 400 });

  const session = await db.interviewSession.findUnique({
    where: { id: sessionId, userId },
  });
  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });
  if (session.overallScore !== null) {
    return NextResponse.json({ scorecard: session.scorecard });
  }

  // Fetch candidate context in parallel for cross-reference evaluation
  const [latestAnalysis, latestGapReport] = await Promise.all([
    db.resumeAnalysis.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { rawAnalysis: true, skillsFound: true },
    }),
    db.gapReport.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { skillGaps: true, storyGaps: true },
    }),
  ]);

  // Build candidate context from analysis + gap report
  const rawAnalysis = latestAnalysis?.rawAnalysis as unknown as ResumeAnalysisResult | null;
  const signalDepthMap = rawAnalysis?.signalDepthMap as Record<string, string> | undefined;

  const skillGaps = (latestGapReport?.skillGaps as unknown as GapReportResult["skillGaps"]) ?? [];
  const storyGaps = (latestGapReport?.storyGaps as unknown as GapReportResult["storyGaps"]) ?? [];

  const candidateContext = {
    signalDepthMap,
    skillsFound: (latestAnalysis?.skillsFound as string[]) ?? [],
    resumeSummary: rawAnalysis?.summary,
    criticalGaps: skillGaps.filter((g) => g.severity === "critical").map((g) => g.label),
    majorGaps: skillGaps.filter((g) => g.severity === "major").map((g) => g.label),
    storyGaps: storyGaps.map((g) => g.label),
  };

  const transcript = ((session.transcript as unknown) as TranscriptMessage[]) ?? [];

  const { object: scorecard } = await generateObject({
    model: defaultModel,
    schema: ScorecardSchema,
    prompt: buildInterviewEvaluationPrompt(transcript, session.role, session.type, candidateContext),
  });

  const updated = await db.interviewSession.update({
    where: { id: sessionId },
    data: {
      overallScore: scorecard.overallScore,
      scorecard: scorecard as unknown as object,
      status: "complete",
      completedAt: new Date(),
    },
  });

  return NextResponse.json({ scorecard: updated.scorecard });
}
