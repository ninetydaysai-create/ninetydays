import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const roadmap = await db.roadmap.findUnique({
    where: { userId },
    include: {
      weeks: {
        include: { tasks: true },
        orderBy: { weekNumber: "asc" },
      },
    },
  });

  if (!roadmap) return NextResponse.json({ roadmap: null, weeks: [] });

  return NextResponse.json({
    roadmap: {
      id: roadmap.id,
      startedAt: roadmap.startedAt,
      totalWeeks: roadmap.weeks.length,
    },
    weeks: roadmap.weeks,
  });
}
