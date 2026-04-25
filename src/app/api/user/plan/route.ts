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

  return NextResponse.json({
    plan:              user?.plan ?? "FREE",
    name:              user?.name ?? null,
    readinessScore:    latestGap?.totalGapScore ?? null,
    roleLabel:         user?.targetRole ? (ROLE_LABELS[user.targetRole as TargetRole] ?? "your target role") : "your target role",
    weeksOnPlatform,
    hoursPerWeek:      user?.hoursPerWeek      ?? 10,
    targetTimeline:    user?.targetTimeline     ?? null,
    targetCompanyType: user?.targetCompanyType  ?? null,
    learningStyle:     user?.learningStyle      ?? null,
  });
}
