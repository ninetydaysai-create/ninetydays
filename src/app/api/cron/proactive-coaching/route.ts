import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateProactiveCoachingMessage } from "@/lib/proactive-coaching";

// Cron: /api/cron/proactive-coaching — runs daily at 07:30 UTC
// Generates a personalized coaching nudge for recently active users
// based on the last 48 hours of their activity, rejections, and skill changes.
// Batch-capped at 15 per run.
export async function GET(req: Request) {
  const cronSecret = process.env.VERCEL_CRON_SECRET ?? process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

  // Find recently active users who haven't already received a coaching nudge today
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);

  const recentlyActiveIds = await db.activityLog.findMany({
    where: { createdAt: { gte: threeDaysAgo } },
    select: { userId: true },
    distinct: ["userId"],
  });

  const activeUserIds = recentlyActiveIds.map((r) => r.userId);
  if (activeUserIds.length === 0) return NextResponse.json({ sent: 0 });

  // Skip users who already have a proactive coaching notification today
  const alreadyNotified = await db.notification.findMany({
    where: {
      userId: { in: activeUserIds },
      type: "proactive_coaching",
      createdAt: { gte: startOfDay },
    },
    select: { userId: true },
  });
  const alreadyDone = new Set(alreadyNotified.map((n) => n.userId));

  const toProcess = activeUserIds.filter((id) => !alreadyDone.has(id)).slice(0, 15);
  if (toProcess.length === 0) return NextResponse.json({ sent: 0 });

  let sent = 0;
  let failed = 0;

  await Promise.allSettled(
    toProcess.map(async (userId) => {
      try {
        const message = await generateProactiveCoachingMessage(userId);
        if (!message) return; // not enough context for this user

        await db.notification.create({
          data: {
            userId,
            type: "proactive_coaching",
            title: "Your coaching update",
            body: message,
          },
        });
        sent++;
      } catch {
        failed++;
      }
    })
  );

  return NextResponse.json({ sent, failed, considered: toProcess.length });
}
