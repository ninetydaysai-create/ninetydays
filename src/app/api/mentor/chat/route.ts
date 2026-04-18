import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { defaultModel } from "@/lib/ai";
import { streamText } from "ai";
import { ResumeAnalysisResult } from "@/types/resume";
import { GapReportResult } from "@/types/gaps";
import { PLAN_LIMITS } from "@/lib/constants";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { message } = await req.json();
  if (!message?.trim()) return NextResponse.json({ error: "Message required" }, { status: 400 });

  // Load all candidate context in parallel
  const [user, latestAnalysis, latestGapReport, roadmap, recentHistory, latestResume] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { name: true, targetRole: true, yearsExperience: true, currentCompany: true, plan: true },
    }),
    db.resumeAnalysis.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { rawAnalysis: true, overallScore: true, skillsFound: true },
    }),
    db.gapReport.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { skillGaps: true, projectGaps: true, storyGaps: true, totalGapScore: true },
    }),
    db.roadmap.findUnique({
      where: { userId },
      include: {
        weeks: {
          orderBy: { weekNumber: "asc" },
          include: {
            tasks: { select: { label: true, completed: true, impactScore: true } },
          },
        },
      },
    }),
    db.mentorMessage.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 12, // last 6 exchanges
    }),
    db.resume.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { rawText: true },
    }),
  ]);

  // Plan guard — enforce daily message limit
  const plan = (user?.plan ?? "FREE") as "FREE" | "PRO";
  const dailyLimit = PLAN_LIMITS[plan].mentorMessagesPerDay;
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const todayCount = await db.mentorMessage.count({
    where: { userId, role: "user", createdAt: { gte: startOfDay } },
  });
  if (todayCount >= dailyLimit) {
    return NextResponse.json(
      { error: `Daily mentor limit reached (${dailyLimit} messages/day). ${plan === "FREE" ? "Upgrade to PRO for 100 messages/day." : "Resets at midnight."}` },
      { status: 429 }
    );
  }

  // Build context
  const rawAnalysis = latestAnalysis?.rawAnalysis as unknown as ResumeAnalysisResult | null;
  const signalDepthMap = rawAnalysis?.signalDepthMap;
  const skillGaps = (latestGapReport?.skillGaps as unknown as GapReportResult["skillGaps"]) ?? [];
  const storyGaps = (latestGapReport?.storyGaps as unknown as GapReportResult["storyGaps"]) ?? [];
  const projectGaps = (latestGapReport?.projectGaps as unknown as GapReportResult["projectGaps"]) ?? [];

  // Find current week in roadmap
  const completedTaskCount = roadmap?.weeks.flatMap((w) => w.tasks).filter((t) => t.completed).length ?? 0;
  const totalTaskCount = roadmap?.weeks.flatMap((w) => w.tasks).length ?? 0;
  const currentWeek = roadmap?.weeks.find((w) => w.tasks.some((t) => !t.completed));
  const pendingThisWeek = currentWeek?.tasks.filter((t) => !t.completed).map((t) => t.label) ?? [];

  const strongSkills = signalDepthMap
    ? Object.entries(signalDepthMap).filter(([, d]) => d === "STRONG").map(([s]) => s)
    : (latestAnalysis?.skillsFound as string[] ?? []).slice(0, 5);

  const criticalGaps = skillGaps.filter((g) => g.severity === "critical").map((g) => g.label);
  const majorGaps = skillGaps.filter((g) => g.severity === "major").map((g) => g.label);

  const resumeSnippet = latestResume?.rawText
    ? `\nRESUME CONTENT (first 2500 chars):\n${latestResume.rawText.slice(0, 2500)}\n`
    : "";

  const systemPrompt = `You are an AI career mentor embedded inside NinetyDays.ai, a platform helping engineers transition from service companies (TCS, Infosys, Wipro) to product companies.

You are NOT a generic AI assistant. You are this specific candidate's personal coach. You know everything about them:
${resumeSnippet}
CANDIDATE PROFILE:
- Name: ${user?.name ?? "the user"}
- Current company background: ${user?.currentCompany ?? "service company"}
- Years experience: ${user?.yearsExperience ?? "unknown"}
- Target role: ${user?.targetRole?.replace(/_/g, " ") ?? "product company engineering role"}
- Resume readiness score: ${latestAnalysis?.overallScore ?? "not yet analyzed"}/100
- Readiness gap score: ${latestGapReport?.totalGapScore ?? "not yet analyzed"}/100

WHAT THEY'RE STRONG AT (resume evidence):
${strongSkills.length > 0 ? strongSkills.join(", ") : "Not yet analyzed — encourage them to run resume analysis"}

CRITICAL GAPS TO CLOSE:
${criticalGaps.length > 0 ? criticalGaps.join(", ") : "None identified yet"}

MAJOR GAPS:
${majorGaps.length > 0 ? majorGaps.join(", ") : "None identified yet"}

PROJECT GAPS:
${projectGaps.filter((g) => g.severity !== "minor").map((g) => g.label).join(", ") || "None"}

STORY GAPS (interview readiness):
${storyGaps.map((g) => g.label).join(", ") || "None identified yet"}

ROADMAP PROGRESS:
${roadmap ? `${completedTaskCount}/${totalTaskCount} tasks completed` : "No roadmap generated yet"}
${currentWeek ? `Currently on Week ${currentWeek.weekNumber}: "${currentWeek.theme}"` : ""}
${pendingThisWeek.length > 0 ? `Pending this week:\n${pendingThisWeek.map((t) => `- ${t}`).join("\n")}` : ""}

YOUR MENTORING STYLE:
1. Be direct and specific — never say "great question" or "I understand your concern"
2. Always reference their actual data: "Your System Design gap is critical" not "system design is important"
3. Give one concrete next action per response, not a list of 10 things
4. If they haven't analyzed their resume yet, push them to do that first — you can't advise without data
5. If they ask what to do next, look at pending tasks this week and critical gaps, then give ONE specific recommendation
6. Keep responses under 200 words unless they ask for a detailed explanation
7. Be encouraging but honest — don't sugarcoat reality
8. If they mention a specific company (Google, Stripe, Meta), tailor advice to that company's bar`;

  // Reverse to get chronological order
  const historyMessages = recentHistory.reverse().map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  // Save user message first
  await db.mentorMessage.create({
    data: { userId, role: "user", content: message.trim() },
  });

  // Stream response
  const result = streamText({
    model: defaultModel,
    system: systemPrompt,
    messages: [
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
