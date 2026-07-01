/**
 * Closed-loop career intelligence.
 *
 * Analyzes recent outcomes (rejections, interview scores, skill trends) and
 * automatically updates the user's CareerProfile.priority — which cascades
 * into daily challenge selection, AI mentor coaching context, and the
 * Career Command Center mission items without any additional work.
 *
 * Triggered: after every rejection, after low interview scores, and daily via cron.
 */

import { db } from "@/lib/db";
import { fastModel } from "@/lib/ai";
import { generateText } from "ai";
import { SkillDimension } from "@prisma/client";

// ─── Mappings ─────────────────────────────────────────────────────────────────

const REJECTION_STAGE_TO_DIMENSION: Record<string, string> = {
  saved:            "resume_quality",
  applied:          "resume_quality",
  recruiter_screen: "communication",
  technical:        "system_design",
  final_round:      "leadership",
};

const DIMENSION_TO_PRIORITY: Record<string, string> = {
  resume_quality:       "resume",
  ats_score:            "resume",
  ownership_language:   "resume",
  impact_writing:       "resume",
  interview_confidence: "interview",
  communication:        "interview",
  leadership:           "interview",
  system_design:        "system_design",
  problem_solving:      "system_design",
  business_thinking:    "product",
  ai_knowledge:         "ai",
};

const PRIORITY_LABELS: Record<string, string> = {
  interview:    "Interview Skills",
  resume:       "Resume & Writing",
  system_design:"System Design",
  product:      "Product Thinking",
  ai:           "AI & ML Knowledge",
};

// ─── Signal types ─────────────────────────────────────────────────────────────

interface Signal {
  priorityKey: string;
  reason:      string;
  urgency:     number; // 1-10, higher = more urgent to address
}

// ─── Core analysis ────────────────────────────────────────────────────────────

async function gatherSignals(userId: string): Promise<Signal[]> {
  const cutoff30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [rejections, skillScores, recentChallenges, recentInterviews] = await Promise.all([
    db.jobApplication.findMany({
      where: { userId, status: "rejected", updatedAt: { gte: cutoff30d } },
      select: { rejectionStage: true },
      orderBy: { updatedAt: "desc" },
      take: 15,
    }),
    db.userSkillScore.findMany({ where: { userId } }),
    db.dailyChallenge.findMany({
      where: { userId, completedAt: { not: null }, createdAt: { gte: cutoff30d } },
      select: { dimension: true, score: true },
      orderBy: { createdAt: "desc" },
      take: 14,
    }),
    db.interviewSession.findMany({
      where: { userId, status: "complete", completedAt: { gte: cutoff30d } },
      select: { overallScore: true, type: true },
      take: 5,
    }),
  ]);

  const signals: Signal[] = [];

  // ── Signal 1: Rejection pattern by stage ──────────────────────────────────
  const byStage: Record<string, number> = {};
  for (const r of rejections) {
    if (r.rejectionStage) byStage[r.rejectionStage] = (byStage[r.rejectionStage] ?? 0) + 1;
  }
  for (const [stage, count] of Object.entries(byStage)) {
    if (count >= 2) {
      const dim = REJECTION_STAGE_TO_DIMENSION[stage] ?? "resume_quality";
      const pKey = DIMENSION_TO_PRIORITY[dim] ?? "resume";
      signals.push({
        priorityKey: pKey,
        reason:      `${count} rejections at ${stage.replace(/_/g, " ")} stage`,
        urgency:     Math.min(10, count * 3),
      });
    }
  }

  // ── Signal 2: Skill score in weak zone (<50) ──────────────────────────────
  for (const s of skillScores) {
    if (s.dimension === "recruiter_readiness") continue;
    if (s.score < 50) {
      const pKey = DIMENSION_TO_PRIORITY[s.dimension] ?? "resume";
      signals.push({
        priorityKey: pKey,
        reason:      `${s.dimension.replace(/_/g, " ")} score is ${s.score}/100`,
        urgency:     Math.round((50 - s.score) / 5), // 0-10
      });
    }
  }

  // ── Signal 3: Consistently low challenge scores on a dimension ────────────
  const byDim: Record<string, number[]> = {};
  for (const c of recentChallenges) {
    if (c.dimension && c.score !== null) {
      (byDim[c.dimension] ??= []).push(c.score);
    }
  }
  for (const [dim, scores] of Object.entries(byDim)) {
    if (scores.length >= 2) {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      if (avg < 55) {
        const pKey = DIMENSION_TO_PRIORITY[dim as SkillDimension] ?? "resume";
        signals.push({
          priorityKey: pKey,
          reason:      `avg ${Math.round(avg)}/100 on recent ${dim.replace(/_/g, " ")} challenges`,
          urgency:     Math.round((55 - avg) / 10),
        });
      }
    }
  }

  // ── Signal 4: Low interview scores ───────────────────────────────────────
  const scores = recentInterviews.map(s => s.overallScore).filter(Boolean) as number[];
  if (scores.length >= 2) {
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    if (avg < 55) {
      signals.push({
        priorityKey: "interview",
        reason:      `avg interview score ${Math.round(avg)}/100`,
        urgency:     Math.round((55 - avg) / 10),
      });
    }
  }

  return signals;
}

function deriveNewPriority(signals: Signal[], currentPriority: string[]): string[] | null {
  if (signals.length === 0) return null;

  // Sum urgency per priority key
  const urgencyMap: Record<string, number> = {};
  for (const s of signals) {
    urgencyMap[s.priorityKey] = (urgencyMap[s.priorityKey] ?? 0) + s.urgency;
  }

  // Sort by urgency descending
  const ranked = Object.entries(urgencyMap)
    .sort(([, a], [, b]) => b - a)
    .map(([key]) => key);

  // Build new priority: most urgent first, then keep remaining from current
  const rest = currentPriority.filter(p => !ranked.includes(p));
  const newPriority = [...ranked, ...rest].slice(0, 5);

  // No change if identical to current
  if (JSON.stringify(newPriority) === JSON.stringify(currentPriority)) return null;

  return newPriority;
}

async function generateAdaptationMessage(
  signals: Signal[],
  newPriority: string[],
  targetRole: string
): Promise<string> {
  const topSignals = signals.slice(0, 3).map(s => s.reason).join("; ");
  const newTop = PRIORITY_LABELS[newPriority[0]] ?? newPriority[0];

  const { text } = await generateText({
    model: fastModel,
    prompt: `A ${targetRole.replace(/_/g, " ")} candidate's learning plan just adapted automatically.

Signals that triggered this: ${topSignals}
New top priority: ${newTop}

Write 1-2 sentences explaining what changed and why. Sound like a coach. Be specific about the signals. Don't say "your learning path" — say what actually changed. No filler.`,
  });

  return text.trim();
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface AdaptationResult {
  adapted:     boolean;
  newPriority: string[] | null;
  message:     string | null;
}

/**
 * Analyzes outcomes and adapts priority if needed.
 * Safe to call fire-and-forget — never throws.
 */
export async function runAdaptationEngine(userId: string): Promise<AdaptationResult> {
  try {
    const [signals, user, profile] = await Promise.all([
      gatherSignals(userId),
      db.user.findUnique({ where: { id: userId }, select: { targetRole: true } }),
      db.careerProfile.findUnique({ where: { userId }, select: { priority: true } }),
    ]);

    const currentPriority = (profile?.priority as string[]) ?? [];
    const newPriority = deriveNewPriority(signals, currentPriority);

    if (!newPriority) return { adapted: false, newPriority: null, message: null };

    const targetRole = user?.targetRole ?? "product_swe";
    const message = await generateAdaptationMessage(signals, newPriority, targetRole);

    // Apply: update priority + notify user
    await db.careerProfile.upsert({
      where:  { userId },
      update: { priority: newPriority },
      create: { userId, priority: newPriority },
    });

    await db.notification.create({
      data: {
        userId,
        type:  "roadmap_adapted",
        title: "Your learning path just adapted",
        body:  message,
      },
    });

    return { adapted: true, newPriority, message };
  } catch (err) {
    console.error("[adaptation-engine]", err);
    return { adapted: false, newPriority: null, message: null };
  }
}
