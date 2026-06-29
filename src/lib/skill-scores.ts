import { SkillDimension } from "@prisma/client";
import { db } from "@/lib/db";

export type SkillScoreSource =
  | "task_complete"
  | "quiz"
  | "interview"
  | "resume_analyze"
  | "practice"
  | "derived";

export interface SkillScoreUpdate {
  userId: string;
  dimension: SkillDimension;
  score: number;
  source: SkillScoreSource;
  sourceId?: string;
}

function clamp(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

// ─── Core writers ─────────────────────────────────────────────────────────────

export async function updateSkillScore({
  userId,
  dimension,
  score,
  source,
  sourceId,
}: SkillScoreUpdate): Promise<void> {
  const s = clamp(score);
  await db.$transaction([
    db.userSkillScore.upsert({
      where: { userId_dimension: { userId, dimension } },
      update: { score: s },
      create: { userId, dimension, score: s },
    }),
    db.skillScoreHistory.create({
      data: { userId, dimension, score: s, source, sourceId: sourceId ?? null },
    }),
  ]);
}

export async function updateSkillScores(
  updates: SkillScoreUpdate[]
): Promise<void> {
  if (!updates.length) return;
  await db.$transaction(
    updates.flatMap(({ userId, dimension, score, source, sourceId }) => {
      const s = clamp(score);
      return [
        db.userSkillScore.upsert({
          where: { userId_dimension: { userId, dimension } },
          update: { score: s },
          create: { userId, dimension, score: s },
        }),
        db.skillScoreHistory.create({
          data: { userId, dimension, score: s, source, sourceId: sourceId ?? null },
        }),
      ];
    })
  );
}

// ─── Readers ──────────────────────────────────────────────────────────────────

export async function getSkillScores(
  userId: string
): Promise<Partial<Record<SkillDimension, number>>> {
  const rows = await db.userSkillScore.findMany({ where: { userId } });
  return Object.fromEntries(
    rows.map((r) => [r.dimension, r.score])
  ) as Partial<Record<SkillDimension, number>>;
}

export async function getSkillHistory(
  userId: string,
  dimension: SkillDimension,
  limit = 30
) {
  return db.skillScoreHistory.findMany({
    where: { userId, dimension },
    orderBy: { recordedAt: "asc" },
    take: limit,
    select: { score: true, source: true, recordedAt: true },
  });
}

// ─── Derived: recruiter readiness ─────────────────────────────────────────────

// Weighted composite of the dimensions that recruiters actually look at.
// Called after any update that touches a component dimension.
const RECRUITER_WEIGHTS: Partial<Record<SkillDimension, number>> = {
  resume_quality:       0.25,
  interview_confidence: 0.20,
  ownership_language:   0.15,
  impact_writing:       0.15,
  communication:        0.15,
  ats_score:            0.10,
};

export async function recomputeRecruiterReadiness(userId: string): Promise<void> {
  const current = await getSkillScores(userId);

  let weightedSum = 0;
  let totalWeight = 0;
  for (const [dim, weight] of Object.entries(RECRUITER_WEIGHTS) as [SkillDimension, number][]) {
    const score = current[dim];
    if (score !== undefined) {
      weightedSum += score * weight;
      totalWeight += weight;
    }
  }
  if (totalWeight === 0) return;

  await updateSkillScore({
    userId,
    dimension: "recruiter_readiness",
    score: weightedSum / totalWeight,
    source: "derived",
  });
}

// ─── Adapters ─────────────────────────────────────────────────────────────────

// Called after a resume analysis is saved. Maps analysis fields → skill dimensions.
export async function applyResumeAnalysisScores(
  userId: string,
  analysisId: string,
  analysis: {
    overallScore: number;
    keywordDensityScore: number; // stored as signalDepthScore in route, repurposed column
    impactScore: number;
  }
): Promise<void> {
  await updateSkillScores([
    { userId, dimension: "resume_quality",  score: analysis.overallScore,        source: "resume_analyze", sourceId: analysisId },
    { userId, dimension: "ats_score",       score: analysis.keywordDensityScore, source: "resume_analyze", sourceId: analysisId },
    { userId, dimension: "impact_writing",  score: analysis.impactScore,         source: "resume_analyze", sourceId: analysisId },
  ]);
  await recomputeRecruiterReadiness(userId);
}

// Called after an interview session is evaluated. Maps type + overall score → dimensions.
// Each interview type also bumps the specific skill dimension for that interview category.
const INTERVIEW_TYPE_DIMENSION: Record<string, SkillDimension> = {
  behavioral:    "leadership",
  system_design: "system_design",
  ml_concepts:   "ai_knowledge",
  product_sense: "business_thinking",
};

export async function applyInterviewScores(
  userId: string,
  sessionId: string,
  overallScore: number,
  type: string
): Promise<void> {
  const specificDimension = INTERVIEW_TYPE_DIMENSION[type];
  const updates: SkillScoreUpdate[] = [
    { userId, dimension: "interview_confidence", score: overallScore, source: "interview", sourceId: sessionId },
  ];
  if (specificDimension && specificDimension !== "interview_confidence") {
    updates.push({ userId, dimension: specificDimension, score: overallScore, source: "interview", sourceId: sessionId });
  }
  await updateSkillScores(updates);
  await recomputeRecruiterReadiness(userId);
}

// Called when a quiz step is completed inside a task.
export async function applyQuizScore(
  userId: string,
  taskId: string,
  dimension: SkillDimension,
  score: number
): Promise<void> {
  await updateSkillScore({ userId, dimension, score, source: "quiz", sourceId: taskId });
  await recomputeRecruiterReadiness(userId);
}

// Called when a practice step receives AI feedback with a score.
export async function applyPracticeScore(
  userId: string,
  taskId: string,
  dimension: SkillDimension,
  score: number
): Promise<void> {
  await updateSkillScore({ userId, dimension, score, source: "practice", sourceId: taskId });
  await recomputeRecruiterReadiness(userId);
}
