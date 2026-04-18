import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sessions = await db.interviewSession.findMany({
    where: { userId },
    orderBy: { startedAt: "desc" },
    take: 20,
    select: {
      id: true,
      type: true,
      role: true,
      status: true,
      overallScore: true,
      startedAt: true,
      companyName: true,
    },
  });

  return NextResponse.json({ sessions });
}
