import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserStreak } from "@/lib/streak";
import { getISOWeek } from "date-fns";

const MAX_GROUP_SIZE = 5;

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { targetRole: true, name: true },
  });
  if (!user?.targetRole) {
    return NextResponse.json({ error: "Complete onboarding first" }, { status: 400 });
  }

  const targetRole = user.targetRole;
  const currentWeek = getISOWeek(new Date());

  // Find or create group membership
  let member = await db.cohortMember.findUnique({
    where: { userId },
    include: { group: { include: { members: true } } },
  });

  if (!member) {
    // Find an open group: same role, formed this week or last week, under capacity
    const openGroup = await db.cohortGroup.findFirst({
      where: {
        targetRole,
        weekSlot: { gte: currentWeek - 1 },
        members: { none: {} },  // will re-query with count below
      },
      include: { _count: { select: { members: true } } },
    });

    // Re-query properly with member count filter
    const availableGroup = await db.cohortGroup.findFirst({
      where: {
        targetRole,
        weekSlot: { gte: currentWeek - 1 },
      },
      include: { _count: { select: { members: true } } },
      orderBy: { createdAt: "asc" },
    });

    let groupId: string;
    if (availableGroup && availableGroup._count.members < MAX_GROUP_SIZE) {
      groupId = availableGroup.id;
    } else {
      const newGroup = await db.cohortGroup.create({
        data: { targetRole, weekSlot: currentWeek },
      });
      groupId = newGroup.id;
    }

    member = await db.cohortMember.create({
      data: { userId, groupId },
      include: { group: { include: { members: true } } },
    });
  }

  const group = member.group;
  const allMembers = group.members;

  // Fetch enriched data for each member
  const enriched = await Promise.all(
    allMembers.map(async (m) => {
      const [memberUser, latestGap, streakData, weeklyTasks] = await Promise.all([
        db.user.findUnique({ where: { id: m.userId }, select: { name: true, targetRole: true } }),
        db.gapReport.findFirst({
          where: { userId: m.userId },
          orderBy: { createdAt: "desc" },
          select: { totalGapScore: true },
        }),
        getUserStreak(m.userId),
        db.activityLog.count({
          where: {
            userId: m.userId,
            type: "task_completed",
            createdAt: { gte: new Date(Date.now() - 7 * 86_400_000) },
          },
        }),
      ]);

      const fullName = memberUser?.name ?? "Anonymous";
      const parts = fullName.trim().split(" ");
      const displayName =
        parts.length >= 2
          ? `${parts[0]} ${parts[parts.length - 1][0]}.`
          : parts[0];

      return {
        userId: m.userId,
        displayName,
        initial: fullName[0]?.toUpperCase() ?? "?",
        readinessScore: latestGap?.totalGapScore ?? null,
        streak: streakData.currentStreak,
        tasksThisWeek: weeklyTasks,
        joinedAt: m.joinedAt,
      };
    })
  );

  return NextResponse.json({
    group: { id: group.id, targetRole: group.targetRole, weekSlot: group.weekSlot },
    members: enriched,
    self: userId,
  });
}
