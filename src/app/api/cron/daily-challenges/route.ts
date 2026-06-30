import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { fastModel } from "@/lib/ai";
import { generateText } from "ai";
import { DailyChallengeType, SkillDimension, TargetRole } from "@prisma/client";
import { buildChallengeGenerationPrompt } from "@/prompts/daily-challenge";
import { generateCoachingReason } from "@/lib/proactive-coaching";

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

  // Load user + skill scores + priority for each target user
  const users = await db.user.findMany({
    where: { id: { in: toProcess } },
    select: {
      id: true,
      targetRole: true,
      skillScores:   { select: { dimension: true, score: true } },
      careerProfile: { select: { priority: true } },
    },
  });

  const PRIORITY_DIMENSIONS: Record<string, SkillDimension[]> = {
    interview:    ["interview_confidence", "communication", "leadership"],
    resume:       ["impact_writing", "resume_quality", "ownership_language", "ats_score"],
    system_design:["system_design", "problem_solving"],
    product:      ["business_thinking"],
    ai:           ["ai_knowledge"],
  };

  let generated = 0;
  let failed = 0;

  await Promise.allSettled(
    users.map(async (user) => {
      const component = user.skillScores.filter((s) => s.dimension !== "recruiter_readiness");
      const priority  = (user.careerProfile?.priority as string[]) ?? [];

      let dimension: SkillDimension = ROLE_DEFAULT_DIMENSION[user.targetRole ?? "product_swe"] ?? "impact_writing";

      // Respect user's stated priority order
      for (const p of priority) {
        const dims = PRIORITY_DIMENSIONS[p] ?? [];
        const inCat = component.filter((s) => dims.includes(s.dimension as SkillDimension));
        if (inCat.length > 0) {
          dimension = inCat.reduce((min, s) => s.score < min.score ? s : min).dimension as SkillDimension;
          break;
        }
        if (dims.length > 0) { dimension = dims[0]; break; }
      }

      // No priority or no match: pick overall weakest
      if (!priority.length && component.length > 0) {
        dimension = component.reduce((min, s) => s.score < min.score ? s : min).dimension as SkillDimension;
      }

      const type = DIMENSION_TO_TYPE[dimension];
      const currentScore = user.skillScores.find((s) => s.dimension === dimension)?.score;
      const difficulty =
        currentScore === undefined ? "medium"
        : currentScore < 40       ? "easy"
        : currentScore < 70       ? "medium"
                                  : "hard";

      try {
        const [{ text }, coachingReason] = await Promise.all([
          generateText({
            model: fastModel,
            prompt: buildChallengeGenerationPrompt(type, dimension, user.targetRole ?? "product_swe", currentScore),
          }),
          generateCoachingReason(user.id, type, dimension, user.targetRole ?? "product_swe"),
        ]);

        await db.dailyChallenge.create({
          data: {
            userId:        user.id,
            coachingReason,
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
