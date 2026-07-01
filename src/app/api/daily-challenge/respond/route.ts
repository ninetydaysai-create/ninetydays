import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { defaultModel } from "@/lib/ai";
import { generateObject } from "ai";
import { z } from "zod";
import { SkillDimension } from "@prisma/client";
import { buildChallengeEvaluationPrompt } from "@/prompts/daily-challenge";
import { applyPracticeScore } from "@/lib/skill-scores";
import { captureServerEvent, EVENTS } from "@/lib/analytics";

const EvaluationSchema = z.object({
  score:        z.number().min(0).max(100),
  verdict:      z.string(),
  strengths:    z.array(z.string()).max(3),
  improvements: z.array(z.string()).max(3),
});

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { challengeId, userResponse } = await req.json();
  if (!challengeId || !userResponse?.trim()) {
    return NextResponse.json({ error: "challengeId and userResponse required" }, { status: 400 });
  }
  if (userResponse.trim().length < 30) {
    return NextResponse.json({ error: "Response too short — aim for at least 2-3 sentences" }, { status: 422 });
  }

  const challenge = await db.dailyChallenge.findUnique({ where: { id: challengeId, userId } });
  if (!challenge) return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
  if (challenge.completedAt) return NextResponse.json({ error: "Already submitted" }, { status: 409 });

  const user = await db.user.findUnique({ where: { id: userId }, select: { targetRole: true } });

  const { object: evaluation } = await generateObject({
    model: defaultModel,
    schema: EvaluationSchema,
    prompt: buildChallengeEvaluationPrompt(
      challenge.type,
      challenge.dimension ?? "impact_writing",
      user?.targetRole ?? "product_swe",
      challenge.prompt,
      userResponse.trim()
    ),
  });

  const aiFeedback = {
    verdict:      evaluation.verdict,
    strengths:    evaluation.strengths,
    improvements: evaluation.improvements,
  };

  const updated = await db.dailyChallenge.update({
    where: { id: challengeId },
    data: {
      userResponse: userResponse.trim(),
      aiFeedback,
      score:       evaluation.score,
      completedAt: new Date(),
    },
  });

  // Feed score into skill dimension history
  if (challenge.dimension) {
    await applyPracticeScore(
      userId,
      challengeId,
      challenge.dimension as SkillDimension,
      evaluation.score
    );
  }

  await db.activityLog.create({
    data: {
      userId,
      type: "daily_challenge_complete",
      metadata: { score: evaluation.score, dimension: challenge.dimension, type: challenge.type },
    },
  });

  captureServerEvent(userId, EVENTS.CHALLENGE_COMPLETED, {
    score: evaluation.score, challengeType: challenge.type, dimension: challenge.dimension,
  });
  return NextResponse.json({ challenge: updated, evaluation });
}
