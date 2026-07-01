import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { defaultModel, cachedSystemMessage } from "@/lib/ai";
import { streamText } from "ai";
import { PLAN_LIMITS } from "@/lib/constants";
import { buildCareerContext, formatCareerContextForAI } from "@/lib/career-context";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { message } = await req.json();
  if (!message?.trim()) return NextResponse.json({ error: "Message required" }, { status: 400 });

  // Load career context + plan + conversation history + resume text in parallel
  const [ctx, userPlan, recentHistory, latestResume] = await Promise.all([
    buildCareerContext(userId),
    db.user.findUnique({ where: { id: userId }, select: { plan: true } }),
    db.mentorMessage.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 12 }),
    db.resume.findFirst({ where: { userId }, orderBy: { createdAt: "desc" }, select: { rawText: true } }),
  ]);

  // Plan guard — enforce daily message limit
  const plan = (userPlan?.plan ?? "FREE") as "FREE" | "PRO";
  const dailyLimit = PLAN_LIMITS[plan].mentorMessagesPerDay;
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const todayCount = await db.mentorMessage.count({
    where: { userId, role: "user", createdAt: { gte: startOfDay } },
  });
  if (todayCount >= dailyLimit) {
    return NextResponse.json(
      {
        error: `Daily mentor limit reached (${dailyLimit} messages/day). ${plan === "FREE" ? "Upgrade to PRO for 100 messages/day." : "Resets at midnight."}`,
        upgradeRequired: plan === "FREE",
      },
      { status: 429 }
    );
  }

  const resumeSnippet = latestResume?.rawText
    ? `RESUME (first 2500 chars):\n${latestResume.rawText.slice(0, 2500)}\n\n`
    : "";

  const systemPrompt = `You are an AI career mentor inside NinetyDays.ai. You are NOT a generic assistant — you are this specific candidate's personal coach. You have persistent memory of their entire career journey.

${resumeSnippet}CANDIDATE CONTEXT (updated in real-time):
${formatCareerContextForAI(ctx)}

MENTORING RULES:
1. Never say "great question", "I understand", or offer options. Give ONE direct answer.
2. Lead with action: "Do THIS: [specific executable task]" — not a category, a task.
3. Reference their actual data. Say "Your ${ctx.weakestDimensions[0] ?? "system design"} score is ${ctx.skillScores[ctx.weakestDimensions[0]?.replace(/ /g, "_") ?? ""] ?? "low"} — this will cause rejections at ${ctx.targetCompanies[0] ?? "top product companies"}."
4. If no resume analyzed yet: "Stop guessing. Run resume analysis first."
5. If asked what to do next: look at critical gaps + pending tasks, issue ONE command.
6. Max 150 words unless they ask for a full breakdown.
7. Never hedge. Be direct about what will cause rejections and what is exactly right.
8. If they mention a specific company, name exactly what that company expects in interviews.
9. End every response with the single next action.`;

  // Reverse to get chronological order
  const historyMessages = recentHistory.reverse().map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  // Save user message first
  await db.mentorMessage.create({
    data: { userId, role: "user", content: message.trim() },
  });

  // Stream response — system prompt cached (stable career context, large token count)
  const result = streamText({
    model: defaultModel,
    messages: [
      cachedSystemMessage(systemPrompt),
      ...historyMessages,
      { role: "user", content: message.trim() },
    ],
    onFinish: async ({ text }) => {
      await db.mentorMessage.create({
        data: { userId, role: "assistant", content: text },
      });
    },
  });

  return result.toTextStreamResponse();
}
