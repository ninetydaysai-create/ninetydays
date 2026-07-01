import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { resend, FROM_EMAIL } from "@/lib/resend";
import { render } from "@react-email/render";
import { DailyChallengeEmail } from "@/emails/DailyChallengeEmail";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://ninetydays.ai";

function todayUTC(): Date {
  const n = new Date();
  return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate()));
}

// Cron: /api/cron/daily-challenge-email — runs daily at 08:00 UTC
// Sends the daily challenge to users who:
//   1. Have opted in to daily emails (emailPreference.transactional = true)
//   2. Have a challenge generated today (not yet completed)
//   3. Have been active in the last 14 days (engaged users only)
// Batch-capped at 50 per run to stay within Resend rate limits.
export async function GET(req: Request) {
  const cronSecret = process.env.VERCEL_CRON_SECRET ?? process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "RESEND_API_KEY not configured" }, { status: 500 });
  }

  const date = todayUTC();
  const twoWeeksAgo = new Date(date.getTime() - 14 * 24 * 60 * 60 * 1000);

  // Find users with a challenge today that they haven't completed
  const challenges = await db.dailyChallenge.findMany({
    where: {
      date,
      completedAt: null,         // not yet done
      coachingReason: { not: null }, // has the "why today" context
      user: {
        onboardingDone: true,
        emailPreference: { transactional: true },
        activityLogs: {
          some: { createdAt: { gte: twoWeeksAgo } }, // recently active
        },
      },
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
    take: 50,
  });

  let sent = 0;
  let failed = 0;

  for (const challenge of challenges) {
    try {
      const html = await render(
        DailyChallengeEmail({
          name:           challenge.user.name ?? "",
          challengeType:  challenge.type,
          dimension:      challenge.dimension ?? "career skills",
          coachingReason: challenge.coachingReason!,
          challengeUrl:   `${APP_URL}/dashboard`,
        })
      );

      const typeLabel = challenge.type.replace(/_/g, " ")
        .replace(/\b\w/g, l => l.toUpperCase());

      await resend.emails.send({
        from:    FROM_EMAIL,
        to:      challenge.user.email,
        subject: `Your daily challenge: ${typeLabel} · 5 min`,
        html,
      });

      sent++;
    } catch {
      failed++;
    }
  }

  return NextResponse.json({ sent, failed, total: challenges.length });
}
