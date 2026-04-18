import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { streamText } from "ai";
import { defaultModel } from "@/lib/ai";
import { buildInterviewSystemPrompt } from "@/prompts/interview-evaluator";
import { assertPlanAllows } from "@/lib/plan-guard";
import { TranscriptMessage } from "@/types/interview";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const _planGuard = await assertPlanAllows(userId, "interview_session"); if (_planGuard) return _planGuard;

  const { sessionId, message } = await req.json();

  const session = await db.interviewSession.findUnique({
    where: { id: sessionId, userId },
  });
  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

  const transcript = ((session.transcript as unknown) as TranscriptMessage[]) ?? [];
  const userTurn: TranscriptMessage = {
    role: "user",
    content: message,
    timestamp: new Date().toISOString(),
  };
  const updatedTranscript = [...transcript, userTurn];

  // Count user answers so far
  const userAnswers = updatedTranscript.filter((m) => m.role === "user").length;
  const isLastQuestion = userAnswers >= session.questionsCount;

  const systemPrompt = buildInterviewSystemPrompt(session.role, session.type, session.companyName ?? undefined);

  const result = streamText({
    model: defaultModel,
    system: systemPrompt,
    messages: updatedTranscript.map((m) => ({ role: m.role, content: m.content })),
    onFinish: async ({ text }) => {
      try {
        const assistantTurn: TranscriptMessage = {
          role: "assistant",
          content: text,
          timestamp: new Date().toISOString(),
        };
        const finalTranscript = [...updatedTranscript, assistantTurn];

        await db.interviewSession.update({
          where: { id: sessionId },
          data: {
            transcript: finalTranscript as unknown as object[],
            status: isLastQuestion ? "complete" : "active",
            completedAt: isLastQuestion ? new Date() : null,
          },
        });
      } catch (err) {
        console.error("[interview/respond] failed to save transcript:", err);
      }
    },
  });

  return result.toTextStreamResponse();
}
