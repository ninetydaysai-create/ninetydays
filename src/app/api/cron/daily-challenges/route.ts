import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { fastModel } from "@/lib/ai";
import { generateText } from "ai";
import { DailyChallengeType, SkillDimension, TargetRole } from "@prisma/client";
import { buildChallengeGenerationPrompt } from "@/prompts/daily-challenge";

function todayUTC(): Date {
  const n = new Date();
  return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate()));
}

const DIMENSION_TO_TYPE: Record<SkillDimension, DailyChallengeType> = {
  resume_quality:       "bullet_rewrite",
  ats_score:            "bullet_rewrite",
  ownership_language:   "bullet_rewrite",
  impact_writing:       "bullet_rewrite",
  interview_confidence: "interview_question",
  system_design:        "interview_question",
  business_thinking:    "case_study",
  leadership:           "star_story",
  communication:        "star_story",
  ai_knowledge:         "flashcard",
  problem_solving:      "case_study",
  recruiter_readiness:  "interview_question",
};

const ROLE_DEFAULT_DIMENSION: Record<string, SkillDimension> = {
  product_swe:    "impact_writing",
  staff_eng:      "leadership",
  ml_eng:         "ai_knowledge",
  ai_pm:          "business_thinking",
  data_scientist: "problem_solving",
};

// Cron: /api/cron/daily-challenges — runs daily at 07:00 UTC
// Pre-generates challenges for users active in the last 3 days.
// Batch-capped at 20 per run to stay within Vercel function timeout.
export async function GET(req: Request) {
  const cronSecret = process.env.VERCEL_CRON_SECRET ?? process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const date = todayUTC();
  const threeDaysAgo = new Date(date.getTime() - 3 * 24 * 60 * 60 * 1000);

  // Find recently active users who don't have today's challenge yet
  const recentlyActiveIds = await db.activityLog.findMany({
    where: { createdAt: { gte: threeDaysAgo } },
    select: { userId: true },
    distinct: ["userId"],
  });

  const activeUserIds = recentlyActiveIds.map((r) => r.userId);
  if (activeUserIds.length === 0) return NextResponse.json({ generated: 0 });

  const alreadyHaveChallenge = await db.dailyChallenge.findMany({
    where: { date, userId: { in: activeUserIds } },
    select: { userId: true },
  });
  const alreadyDone = new Set(alreadyHaveChallenge.map((c) => c.userId));
  const toProcess = activeUserIds.filter((id) => !alreadyDone.has(id)).slice(0, 20);

  if (toProcess.length === 0) return NextResponse.json({ generated: 0 });

  // Load user + skill scores for each target user
  const users = await db.user.findMany({
    where: { id: { in: toProcess } },
    select: {
      id: true,
      targetRole: true,
      skillScores: { select: { dimension: true, score: true } },
    },
  });

  let generated = 0;
  let failed = 0;

  await Promise.allSettled(
    users.map(async (user) => {
      const component = user.skillScores.filter((s) => s.dimension !== "recruiter_readiness");
      const dimension: SkillDimension =
        component.length > 0
          ? component.reduce((min, s) => (s.score < min.score ? s : min)).dimension
          : (ROLE_DEFAULT_DIMENSION[user.targetRole ?? "product_swe"] ?? "impact_writing");

      const type = DIMENSION_TO_TYPE[dimension];
      const currentScore = user.skillScores.find((s) => s.dimension === dimension)?.score;
      const difficulty =
        currentScore === undefined ? "medium"
        : currentScore < 40       ? "easy"
        : currentScore < 70       ? "medium"
                                  : "hard";

      try {
        const { text } = await generateText({
          model: fastModel,
          prompt: buildChallengeGenerationPrompt(type, dimension, user.targetRole ?? "product_swe", currentScore),
        });

        await db.dailyChallenge.create({
          data: {
            userId:     user.id,
            date,
            type,
            dimension,
            difficulty,
            prompt: text.trim(),
          },
        });
        generated++;
      } catch {
        failed++;
      }
    })
  );

  return NextResponse.json({ generated, failed, usersConsidered: users.length });
}
