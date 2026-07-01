import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { defaultModel, cachedSystemMessage } from "@/lib/ai";
import { streamText } from "ai";
import { buildCareerContext, formatCareerContextForAI } from "@/lib/career-context";

function buildActionPrompt(
  action: string,
  stepTitle: string,
  stepType: string,
  userInput?: string | null
): string {
  const prompts: Record<string, string> = {
    explain_again: `Re-explain "${stepTitle}" in completely different words. Keep it under 100 words.`,
    analogy:       `Give me one memorable analogy that makes "${stepTitle}" immediately click. Make it concrete and specific.`,
    interview:     `How does "${stepTitle}" come up in ${stepType === "why_it_matters" ? "product/engineering" : "technical"} interviews? What do interviewers actually expect to hear?`,
    simplify:      `Simplify the concept in "${stepTitle}". Assume I'm smart but encountering this for the first time.`,
    example:       `Give me one concrete, real-world example that illustrates "${stepTitle}". Be specific — name a company, tool, or scenario.`,
    takeaway:      `What is the single most important thing to remember from "${stepTitle}"? One sentence, maximum.`,
    compare:       `In the example gallery for "${stepTitle}", explain exactly what the Excellent example has that Bad and Average examples don't. Be specific.`,
    mistakes:      `What are the top 2 mistakes people make related to "${stepTitle}"? Name what goes wrong and why it matters.`,
    hint:          `Give me one small directional hint to approach the practice task for "${stepTitle}". Do not give the answer — just a direction.`,
    review:        `Review this response for "${stepTitle}":\n\n${userInput ?? "(nothing submitted yet)"}\n\nGive honest, specific feedback in 3-4 sentences.`,
    improve:       `Here's my response for "${stepTitle}":\n\n${userInput ?? "(nothing submitted yet)"}\n\nGive me 2 specific, concrete improvements I can make right now.`,
    criteria:      `What makes a strong deliverable for "${stepTitle}"? What would impress a recruiter or technical interviewer?`,
  };
  return prompts[action] ?? `Help me understand "${stepTitle}".`;
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { taskId, stepType, stepTitle, action, userInput, customMessage, conversationHistory } =
    await req.json();

  const [task, ctx] = await Promise.all([
    db.roadmapTask.findFirst({
      where: { id: taskId, week: { roadmap: { userId } } },
      select: { label: true, description: true },
    }),
    buildCareerContext(userId),
  ]);

  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  const systemPrompt = `You are an AI mentor helping with a specific learning task. You know this candidate's full career context — reference it when relevant.

Task: ${task.label}
${task.description ? `Description: ${task.description}` : ""}
Current step: ${stepTitle} (${stepType})

CANDIDATE CONTEXT:
${formatCareerContextForAI(ctx)}

Rules:
- Stay focused on this task and step.
- Reference their target companies, weak skills, or career goal when it adds value.
- Max 150 words unless asked for more.
- Give the actual answer immediately — no preamble.`;

  const userMessage =
    customMessage?.trim() ||
    buildActionPrompt(action, stepTitle, stepType, userInput);

  // Include last 4 exchanges (8 messages) for multi-turn context
  const history = ((conversationHistory ?? []) as { role: string; content: string }[])
    .filter((m) => m.role === "user" || m.role === "assistant")
    .slice(-8);

  const result = streamText({
    model: defaultModel,
    messages: [
      cachedSystemMessage(systemPrompt),
      ...history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
      { role: "user", content: userMessage },
    ],
  });

  return result.toTextStreamResponse();
}
