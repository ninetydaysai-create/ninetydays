import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { differenceInDays } from "date-fns";

export async function GET(req: Request) {
  const cronSecret = process.env.VERCEL_CRON_SECRET ?? process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const now = new Date();
  let notificationsCreated = 0;

  // Find users who have a roadmap + gap report but haven't completed a task in 3+ days
  const users = await db.user.findMany({
    where: { onboardingDone: true },
    select: {
      id: true,
      name: true,
      roadmap: {
        select: {
          startedAt: true,
          weeks: {
            select: {
              weekNumber: true,
              tasks: {
                select: { id: true, completed: true, completedAt: true },
              },
            },
          },
        },
      },
      gapReports: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { totalGapScore: true, createdAt: true },
      },
    },
  });

  for (const user of users) {
    if (!user.roadmap) continue;

    const allTasks = user.roadmap.weeks.flatMap((w) => w.tasks);
    if (allTasks.length === 0) continue;

    const completedTasks = allTasks.filter((t) => t.completed);
    const incompleteTasks = allTasks.filter((t) => !t.completed);

    // Skip users with no incomplete tasks (they're done!)
    if (incompleteTasks.length === 0) continue;

    // Find most recent task completion
    const lastCompleted = completedTasks
      .map((t) => t.completedAt)
      .filter((d): d is Date => d !== null)
      .sort((a, b) => b.getTime() - a.getTime())[0];

    const daysSinceLastTask = lastCompleted
      ? differenceInDays(now, lastCompleted)
      : differenceInDays(now, user.roadmap.startedAt);

    // ── "Falling behind" notification: 3+ days with no task completion ──
    if (daysSinceLastTask >= 3) {
      // Don't spam — check if we already sent one in last 3 days
      const recentNotif = await db.notification.findFirst({
        where: {
          userId: user.id,
          type: "falling_behind",
          createdAt: { gte: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000) },
        },
      });

      if (!recentNotif) {
        await db.notification.create({
          data: {
            userId: user.id,
            type: "falling_behind",
            title: "You're falling behind your plan",
            body: `${daysSinceLastTask} days without completing a task. Even 30 min today keeps your momentum. Your next task is waiting.`,
          },
        });
        notificationsCreated++;
      }
    }

    // ── Day milestones: 30 / 60 / 90 ──
    const dayOfJourney = differenceInDays(now, user.roadmap.startedAt) + 1;
    const milestones: Array<{ day: number; type: string; title: string; body: string }> = [
      {
        day: 30,
        type: "day_30",
        title: "30 days into your journey!",
        body: "You're 1/3 through your 90-day career transformation. Check your readiness score and see how far you've come.",
      },
      {
        day: 60,
        type: "day_60",
        title: "60 days strong — 2/3 done!",
        body: "Two months in. If you've been following the plan, you should be close to interview-ready. Check your score.",
      },
      {
        day: 90,
        type: "day_90",
        title: "Day 90 — you made it!",
        body: "You've completed your 90-day transformation journey. Time to reflect, apply, and celebrate your progress.",
      },
    ];

    for (const milestone of milestones) {
      if (dayOfJourney >= milestone.day && dayOfJourney < milestone.day + 2) {
        const existing = await db.notification.findFirst({
          where: { userId: user.id, type: milestone.type },
        });
        if (!existing) {
          await db.notification.create({
            data: {
              userId: user.id,
              type: milestone.type,
              title: milestone.title,
              body: milestone.body,
            },
          });
          notificationsCreated++;
        }
      }
    }

    // ── Readiness milestones: 50% and 70% ──
    const readinessScore = user.gapReports[0]?.totalGapScore;
    if (readinessScore != null) {
      const readinessMilestones = [
        {
          threshold: 70,
          type: "milestone_70",
          title: "You're in the apply zone!",
          body: `${readinessScore}% readiness — you're now competitive for your target role. Start applying to companies on your list.`,
        },
        {
          threshold: 50,
          type: "milestone_50",
          title: "Halfway there — 50% readiness!",
          body: "You've crossed the halfway mark. Keep the momentum. Focus on interview prep and your top 2 remaining gaps.",
        },
      ];

      for (const rm of readinessMilestones) {
        if (readinessScore >= rm.threshold) {
          const existing = await db.notification.findFirst({
            where: { userId: user.id, type: rm.type },
          });
          if (!existing) {
            await db.notification.create({
              data: {
                userId: user.id,
                type: rm.type,
                title: rm.title,
                body: rm.body,
              },
            });
            notificationsCreated++;
          }
        }
      }
    }
  }

  return NextResponse.json({
    ok: true,
    usersChecked: users.length,
    notificationsCreated,
  });
}
