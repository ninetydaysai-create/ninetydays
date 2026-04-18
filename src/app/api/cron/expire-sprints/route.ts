import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Plan } from "@prisma/client";

/**
 * Cron: expire Sprint (one-time $49) access when 90-day period ends.
 * Sprint users have plan=PRO, stripeSubscriptionId=null, stripeCurrentPeriodEnd set.
 * Runs daily at 02:00 UTC — see vercel.json.
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // Sprint users: Pro plan, no subscription ID, period expired
  const expired = await db.user.findMany({
    where: {
      plan: Plan.PRO,
      stripeSubscriptionId: null,
      stripeCurrentPeriodEnd: { lt: now },
    },
    select: { id: true },
  });

  if (expired.length === 0) return NextResponse.json({ expired: 0 });

  await db.user.updateMany({
    where: { id: { in: expired.map((u) => u.id) } },
    data: {
      plan: Plan.FREE,
      stripeCurrentPeriodEnd: null,
    },
  });

  // Notify each expired user
  await db.notification.createMany({
    data: expired.map((u) => ({
      userId: u.id,
      type: "sprint_expired",
      title: "Your 90-Day Sprint has ended",
      body: "Upgrade to Pro ($9/mo) to keep your AI mentor, roadmap, and interview coaching.",
    })),
    skipDuplicates: true,
  });

  return NextResponse.json({ expired: expired.length });
}
