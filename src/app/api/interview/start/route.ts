import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { syncUser } from "@/lib/sync-user";
import { streamText } from "ai";
import { defaultModel } from "@/lib/ai";
import { buildInterviewSystemPrompt } from "@/prompts/interview-evaluator";
import { assertPlanAllows } from "@/lib/plan-guard";
import { InterviewType, TargetRole } from "@prisma/client";
import { TranscriptMessage } from "@/types/interview";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await syncUser(userId);

  const _planGuard = await assertPlanAllows(userId, "interview_session"); if (_planGuard) return _planGuard;

  const body = await req.json();
  const type = (body.type ?? "behavioral") as InterviewType;
  const role = (body.role ?? "product_swe") as TargetRole;
  const companyName = typeof body.companyName === "string" ? body.companyName : undefined;

  const systemPrompt = buildInterviewSystemPrompt(role, type, companyName);

  // Create session record
  const session = await db.interviewSession.create({
    data: {
      userId,
      type,
      role,
      status: "active",
      questionsCount: 5,
      transcript: [],
      companyName: companyName ?? null,
    },
  });

  // Stream the opening question
  const result = streamText({
    model: defaultModel,
    system: systemPrompt,
    messages: [
      { role: "user", content: "Please begin the interview." },
    ],
    onFinish: async ({ text }) => {
      const openingMessage: TranscriptMessage = {
        role: "assistant",
        content: text,
        timestamp: new Date().toISOString(),
      };
      await db.interviewSession.update({
        where: { id: session.id },
        data: { transcript: [openingMessage] as unknown as object[] },
      });
    },
  });

  // Return sessionId in header so client can read it
  const response = result.toTextStreamResponse();
  const headers = new Headers(response.headers);
  headers.set("X-Session-Id", session.id);

  return new Response(response.body, {
    status: response.status,
    headers,
  });
}
