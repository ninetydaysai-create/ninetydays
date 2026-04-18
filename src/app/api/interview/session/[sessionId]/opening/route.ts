import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { streamText } from "ai";
import { defaultModel } from "@/lib/ai";
import { buildInterviewSystemPrompt } from "@/prompts/interview-evaluator";
import { TranscriptMessage } from "@/types/interview";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { sessionId } = await params;

  const session = await db.interviewSession.findUnique({
    where: { id: sessionId, userId },
  });
  if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const systemPrompt = buildInterviewSystemPrompt(session.role, session.type, session.companyName ?? undefined);

  const result = streamText({
    model: defaultModel,
    system: systemPrompt,
    messages: [{ role: "user", content: "Please begin the interview." }],
    onFinish: async ({ text }) => {
      const openingMessage: TranscriptMessage = {
        role: "assistant",
        content: text,
        timestamp: new Date().toISOString(),
      };
      await db.interviewSession.update({
        where: { id: sessionId },
        data: { transcript: [openingMessage] as unknown as object[] },
      });
    },
  });

  return result.toTextStreamResponse();
}
