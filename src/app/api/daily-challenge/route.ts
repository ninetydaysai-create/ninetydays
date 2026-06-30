import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { fastModel } from "@/lib/ai";
import { generateText } from "ai";
import { DailyChallengeType, SkillDimension, TargetRole } from "@prisma/client";
import { buildChallengeGenerationPrompt } from "@/prompts/daily-challenge";
import { generateCoachingReason } from "@/lib/proactive-coaching";

// UTC midnight for today — used as the @@unique date key
function todayUTC(): Date {
  const n = new Date();
  return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate()));
}

// Which challenge type best targets each dimension
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

// Fallback dimension priority per role when no skill scores exist
const ROLE_DEFAULT_DIMENSION: Record<string, SkillDimension> = {
  product_swe:    "impact_writing",
  staff_eng:      "leadership",
  ml_eng:         "ai_knowledge",
  ai_pm:          "business_thinking",
  data_scientist: "problem_solving",
};

// Goal Engine priority → skill dimensions (ordered by importance within each area)
const PRIORITY_DIMENSIONS: Record<string, SkillDimension[]> = {
  interview:    ["interview_confidence", "communication", "leadership"],
  resume:       ["impact_writing", "resume_quality", "ownership_language", "ats_score"],
  system_design:["system_design", "problem_solving"],
  product:      ["business_thinking"],
  ai:           ["ai_knowledge"],
};

function pickDimension(
  scores: { dimension: SkillDimension; score: number }[],
  targetRole: TargetRole | null,
  priority: string[] = []
): SkillDimension {
  const component = scores.filter((s) => s.dimension !== "recruiter_readiness");

  // If user has set a priority, find the weakest dimension in their top priority area
  for (const priorityKey of priority) {
    const dims = PRIORITY_DIMENSIONS[priorityKey] ?? [];
    const inCategory = component.filter((s) => dims.includes(s.dimension));
    if (inCategory.length > 0) {
      return inCategory.reduce((min, s) => (s.score < min.score ? s : min)).dimension;
    }
    // No scores yet for this category — return first dim in it
    if (dims.length > 0) return dims[0];
  }

  // No priority set: pick overall weakest
  if (component.length === 0) {
    return ROLE_DEFAULT_DIMENSION[targetRole ?? "product_swe"] ?? "impact_writing";
  }
  return component.reduce((min, s) => (s.score < min.score ? s : min)).dimension;
}

async function generateChallenge(userId: string): Promise<{
  type: DailyChallengeType;
  dimension: SkillDimension;
  prompt: string;
  difficulty: string;
  coachingReason: string;
}> {
  const [user, scores, profile] = await Promise.all([
    db.user.findUnique({ where: { id: userId }, select: { targetRole: true } }),
    db.userSkillScore.findMany({ where: { userId } }),
    db.careerProfile.findUnique({ where: { userId }, select: { priority: true } }),
  ]);

  const priority = (profile?.priority as string[]) ?? [];
  const dimension = pickDimension(scores, user?.targetRole ?? null, priority);
  const type = DIMENSION_TO_TYPE[dimension];
  const currentScore = scores.find((s) => s.dimension === dimension)?.score;
  const roleStr = user?.targetRole ?? "product_swe";

  // Generate challenge prompt + coaching reason in parallel (both use Haiku)
  const [{ text }, coachingReason] = await Promise.all([
    generateText({
      model: fastModel,
      prompt: buildChallengeGenerationPrompt(type, dimension, roleStr, currentScore),
    }),
    generateCoachingReason(userId, type, dimension, roleStr),
  ]);

  // Derive difficulty from current score
  const difficulty =
    currentScore === undefined ? "medium"
    : currentScore < 40       ? "easy"
    : currentScore < 70       ? "medium"
                              : "hard";

  return { type, dimension, prompt: text.trim(), difficulty, coachingReason };
}

// GET /api/daily-challenge — returns today's challenge, generating it if needed
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const date = todayUTC();

  // Return existing challenge if already generated today
  const existing = await db.dailyChallenge.findUnique({
    where: { userId_date: { userId, date } },
  });
  if (existing) return NextResponse.json({ challenge: existing });

  // Generate and persist a new challenge
  try {
    const { type, dimension, prompt, difficulty, coachingReason } = await generateChallenge(userId);

    const challenge = await db.dailyChallenge.create({
      data: { userId, date, type, dimension, difficulty, prompt, coachingReason },
    });

    return NextResponse.json({ challenge });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("daily-challenge generation error:", msg);
    return NextResponse.json({ error: "Failed to generate challenge" }, { status: 500 });
  }
}
