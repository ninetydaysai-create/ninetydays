import { db } from "@/lib/db";
import { fastModel } from "@/lib/ai";
import { generateText } from "ai";
import { SkillDimension } from "@prisma/client";
import { differenceInDays } from "date-fns";

// ─── Why today's challenge was chosen ─────────────────────────────────────────
// Generates 1-2 sentences connecting the challenge to the user's real situation.
// Called during challenge creation (lazy-gen and cron). Uses Haiku for speed.

export async function generateCoachingReason(
  userId: string,
  challengeType: string,
  dimension: string,
  targetRole: string
): Promise<string> {
  try {
    const [skillScore, recentRejections, recentHistory, profile] = await Promise.all([
      db.userSkillScore.findFirst({
        where: { userId, dimension: dimension as SkillDimension },
        select: { score: true },
      }),
      db.jobApplication.findMany({
        where: { userId, status: "rejected" },
        orderBy: { updatedAt: "desc" },
        take: 3,
        select: { company: true, rejectionStage: true, updatedAt: true },
      }),
      db.skillScoreHistory.findMany({
        where: { userId, dimension: dimension as SkillDimension },
        orderBy: { recordedAt: "desc" },
        take: 3,
        select: { score: true, recordedAt: true },
      }),
      db.careerProfile.findUnique({
        where: { userId },
        select: { targetCompanies: true, currentStage: true },
      }),
    ]);

    const score     = skillScore?.score;
    const topCompany = (profile?.targetCompanies as string[])?.[0];
    const stage     = profile?.currentStage;

    // Context signals to feed the prompt
    const signals: string[] = [];

    if (score !== undefined) {
      signals.push(`${dimension.replace(/_/g, " ")} score: ${score}/100${score < 50 ? " (needs urgent work)" : score < 70 ? " (building)" : " (strong)"}`);
    }

    if (recentRejections.length > 0) {
      const latest = recentRejections[0];
      const daysAgo = differenceInDays(new Date(), latest.updatedAt);
      signals.push(
        `recent rejection at ${latest.company} — ${latest.rejectionStage?.replace(/_/g, " ") ?? "unknown stage"}${daysAgo <= 1 ? " (yesterday)" : daysAgo <= 3 ? ` (${daysAgo} days ago)` : ""}`
      );
    }

    // Recent score movement
    if (recentHistory.length >= 2) {
      const delta = recentHistory[0].score - recentHistory[recentHistory.length - 1].score;
      if (delta > 0) signals.push(`${dimension.replace(/_/g, " ")} improved ${delta} pts recently — keep momentum`);
      if (delta < 0) signals.push(`${dimension.replace(/_/g, " ")} dropped ${Math.abs(delta)} pts — needs attention`);
    }

    if (topCompany) signals.push(`target company: ${topCompany}`);
    if (stage === "applying") signals.push("currently applying — getting rejections is the main feedback signal");
    if (stage === "getting_interviews") signals.push("getting interviews — conversion to offer is the next hurdle");

    if (signals.length === 0) {
      return `This ${challengeType.replace(/_/g, " ")} challenge targets your ${dimension.replace(/_/g, " ")} — one of the key dimensions for ${targetRole.replace(/_/g, " ")} roles.`;
    }

    const { text } = await generateText({
      model: fastModel,
      prompt: `A ${targetRole.replace(/_/g, " ")} candidate is starting their daily ${challengeType.replace(/_/g, " ")} challenge targeting ${dimension.replace(/_/g, " ")}.

Their situation today:
${signals.map(s => `- ${s}`).join("\n")}

Write exactly 1-2 sentences explaining WHY this challenge was chosen for them today. Be specific — reference their score, recent rejection, or trend. Sound like a coach who knows their full context, not a generic message. No "Great job" or "Keep it up" filler.`,
    });

    return text.trim();
  } catch {
    // Non-critical — fall back to a simple message
    return `Targeting your ${dimension.replace(/_/g, " ")} today — one of the key gaps between where you are and where you want to be.`;
  }
}

// ─── Proactive morning coaching message ───────────────────────────────────────
// Called by the proactive-coaching cron at 07:30 UTC.
// Generates a personalized coaching push notification based on the last 48h.

export async function generateProactiveCoachingMessage(userId: string): Promise<string | null> {
  try {
    const cutoff48h = new Date(Date.now() - 48 * 60 * 60 * 1000);

    const [user, recentRejections, recentScoreChanges, recentChallenge, streakData, gapReport] = await Promise.all([
      db.user.findUnique({
        where: { id: userId },
        select: {
          name: true,
          targetRole: true,
          careerProfile: { select: { targetCompanies: true, priority: true, currentStage: true } },
        },
      }),
      db.jobApplication.findMany({
        where: { userId, status: "rejected", updatedAt: { gte: cutoff48h } },
        select: { company: true, rejectionStage: true, aiInsight: true },
      }),
      db.skillScoreHistory.findMany({
        where: { userId, recordedAt: { gte: cutoff48h } },
        select: { dimension: true, score: true, source: true },
        orderBy: { recordedAt: "desc" },
      }),
      db.dailyChallenge.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: { type: true, dimension: true, coachingReason: true, completedAt: true, score: true },
      }),
      db.activityLog.findMany({
        where: { userId, createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
        select: { createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      db.gapReport.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: { totalGapScore: true },
      }),
    ]);

    const targetRole    = user?.targetRole?.replace(/_/g, " ") ?? "your target role";
    const topCompany    = (user?.careerProfile?.targetCompanies as string[])?.[0];
    const priority      = (user?.careerProfile?.priority as string[])?.[0];
    const readiness     = gapReport?.totalGapScore;
    const daysSinceActivity = streakData.length > 0
      ? differenceInDays(new Date(), streakData[0].createdAt)
      : 99;

    const signals: string[] = [];

    // Recent rejections
    if (recentRejections.length > 0) {
      const r = recentRejections[0];
      signals.push(`rejected at ${r.company} (${r.rejectionStage?.replace(/_/g, " ") ?? "unknown stage"} stage) in the last 48h`);
      if (r.aiInsight) signals.push(`coaching note: ${r.aiInsight.slice(0, 120)}`);
    }

    // Recent score improvements
    const improvements = recentScoreChanges.filter((_, i) => i === 0); // just latest for brevity
    if (improvements.length > 0) {
      signals.push(`${improvements[0].dimension.replace(/_/g, " ")} just updated to ${improvements[0].score}/100 via ${improvements[0].source}`);
    }

    // Daily challenge yesterday
    if (recentChallenge?.completedAt) {
      signals.push(`completed yesterday's ${recentChallenge.type?.replace(/_/g, " ")} challenge — scored ${recentChallenge.score ?? "unscored"}/100`);
    } else if (recentChallenge && !recentChallenge.completedAt) {
      signals.push("yesterday's daily challenge was not completed");
    }

    // Inactivity
    if (daysSinceActivity >= 2) signals.push(`${daysSinceActivity} days since last activity`);

    // Overall readiness
    if (readiness !== null && readiness !== undefined) signals.push(`overall readiness: ${readiness}%`);

    if (signals.length === 0) return null;

    const { text } = await generateText({
      model: fastModel,
      prompt: `You are a proactive AI career coach. Write a short, direct coaching message (2-3 sentences max) for a ${targetRole} candidate${topCompany ? ` targeting ${topCompany}` : ""}.

Their last 48 hours:
${signals.map(s => `- ${s}`).join("\n")}

The message should:
1. Reference something specific from their actual data above
2. Give one concrete action they should take today
3. Sound like a coach who has been watching their journey — not a generic reminder

No greetings. No "Hey [name]". No filler phrases. Just the coaching message.`,
    });

    return text.trim();
  } catch {
    return null;
  }
}
