import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

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

  return NextResponse.json({
    id: session.id,
    type: session.type,
    role: session.role,
    status: session.status,
    transcript: session.transcript,
    scorecard: session.scorecard,
    overallScore: session.overallScore,
    companyName: session.companyName,
  });
}
