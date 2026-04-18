import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { resend, FROM_EMAIL } from "@/lib/resend";
import { render } from "@react-email/render";
import { WeeklyDigestEmail } from "@/emails/WeeklyDigestEmail";
import { differenceInWeeks, startOfWeek } from "date-fns";

export async function GET(req: Request) {
  // Auth: Vercel cron sends `Authorization: Bearer {VERCEL_CRON_SECRET}`
  // Fall back to legacy CRON_SECRET for compatibility. Allow through if neither is set (local dev).
  const cronSecret = process.env.VERCEL_CRON_SECRET ?? process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // Guard: require Resend to be configured
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { error: "RESEND_API_KEY not configured — digest skipped" },
      { status: 503 }
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://ninetydays.ai";
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday

  const users = await db.user.findMany({
    where: {
      onboardingDone: true,
    },
    include: {
      roadmap: {
        include: {
          weeks: {
            include: { tasks: true },
            orderBy: { weekNumber: "asc" },
          },
        },
      },
      gapReports: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: {
          analysis: {
            select: { overallScore: true, roleMatchScores: true },
          },
        },
      },
      emailPreference: true,
      activityLogs: {
        where: {
          createdAt: { gte: weekStart },
          type: "task_complete",
        },
        select: { createdAt: true },
      },
    },
    take: 500,
  });

  let sent = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const user of users) {
    try {
      // Skip users who opted out of weekly digest (null emailPreference = opted in by default)
      if (user.emailPreference && !user.emailPreference.weeklyDigest) {
        skipped++;
        continue;
      }

      // Skip users with no gap report (haven't run the analyzer yet)
      const latestGapReport = user.gapReports[0];
      if (!latestGapReport) {
        skipped++;
        continue;
      }

      // Skip users with no roadmap
      if (!user.roadmap) {
        skipped++;
        continue;
      }

      const allTasks = user.roadmap.weeks.flatMap((w) => w.tasks);
      const done = allTasks.filter((t) => t.completed).length;
      const pct = allTasks.length ? Math.round((done / allTasks.length) * 100) : 0;
      const pendingTasks = allTasks.filter((t) => !t.completed);

      // Skip users who have completed everything
      if (pendingTasks.length === 0) {
        skipped++;
        continue;
      }

      const weekNumber = Math.min(
        differenceInWeeks(new Date(), user.roadmap.startedAt) + 1,
        12
      );

      const currentWeek = user.roadmap.weeks.find(
        (w) => w.weekNumber === weekNumber
      );

      // totalGapScore IS the readiness score (0–100, higher = more ready) — same as dashboard
      const readiness = Math.max(0, Math.min(100, latestGapReport.totalGapScore ?? 0));

      // Tasks completed this week (from activityLogs)
      const tasksThisWeek = user.activityLogs.length;

      // Target role label from roadmap
      const roleLabel = user.roadmap.targetRole
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase());

      const html = await render(
        WeeklyDigestEmail({
          name: user.name ?? "Developer",
          weekNumber,
          tasksCompleted: done,
          tasksTotal: allTasks.length,
          currentWeekTheme: currentWeek?.theme ?? "Keep going",
          progressPct: pct,
          dashboardUrl: `${appUrl}/roadmap`,
          nextSteps: pendingTasks.slice(0, 3).map((t) => t.label),
        })
      );

      await resend.emails.send({
        from: FROM_EMAIL,
        to: user.email,
        subject: `Week ${weekNumber} check-in: You're ${readiness}% ready for ${roleLabel} — ${tasksThisWeek} tasks this week`,
        html,
      });

      sent++;
    } catch (err) {
      errors.push(`${user.email}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return NextResponse.json({ sent, skipped, errors: errors.slice(0, 10) });
}
