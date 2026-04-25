import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ROLE_LABELS } from "@/lib/constants";
import { TargetRole } from "@prisma/client";
import { differenceInDays } from "date-fns";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      plan: true,
      name: true,
      targetRole: true,
      hoursPerWeek:      true,
      targetTimeline:    true,
      targetCompanyType: true,
      learningStyle:     true,
      roadmap: { select: { startedAt: true } },
      gapReports: { orderBy: { createdAt: "desc" }, take: 1, select: { totalGapScore: true } },
    },
  });

  const latestGap = user?.gapReports?.[0];
  const roadmapStartedAt = user?.roadmap?.startedAt;
  const dayOfJourney = roadmapStartedAt
    ? differenceInDays(new Date(), new Date(roadmapStartedAt)) + 1
    : 0;
  const weeksOnPlatform = Math.max(1, Math.ceil(dayOfJourney / 7));

  // Compute task streak: consecutive calendar days (UTC) with at least one completed task
  const taskLogs = await db.activityLog.findMany({
    where: { userId, type: "task_completed" },
    select: { createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  function computeStreak(logs: { createdAt: Date }[]): number {
    if (!logs.length) return 0;
    const days = new Set(logs.map((l) => l.createdAt.toISOString().slice(0, 10)));
    const todayStr = new Date().toISOString().slice(0, 10);
    // Allow streak to include today OR allow yesterday as the most recent (so opening the app
    // mid-day doesn't break a streak the user earned yesterday)
    let cursor = days.has(todayStr) ? new Date() : new Date(Date.now() - 86_400_000);
    let streak = 0;
    while (true) {
      const key = cursor.toISOString().slice(0, 10);
      if (!days.has(key)) break;
      streak++;
      cursor = new Date(cursor.getTime() - 86_400_000);
    }
    return streak;
  }

  const streak = computeStreak(taskLogs);

  return NextResponse.json({
    plan:              user?.plan ?? "FREE",
    name:              user?.name ?? null,
    readinessScore:    latestGap?.totalGapScore ?? null,
    roleLabel:         user?.targetRole ? (ROLE_LABELS[user.targetRole as TargetRole] ?? "your target role") : "your target role",
    targetRole:        user?.targetRole ?? null,
    weeksOnPlatform,
    hoursPerWeek:      user?.hoursPerWeek      ?? 10,
    targetTimeline:    user?.targetTimeline     ?? null,
    targetCompanyType: user?.targetCompanyType  ?? null,
    learningStyle:     user?.learningStyle      ?? null,
    streak,
  });
}
