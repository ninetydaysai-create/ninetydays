import { NextResponse } from "next/server";
import { getPaddle } from "@/lib/paddle";
import { db } from "@/lib/db";
import { Plan } from "@prisma/client";

/**
 * Paddle webhook handler.
 *
 * Events handled:
 *   transaction.completed      → one-time Sprint purchase OR subscription payment
 *   subscription.created       → new monthly/annual subscription → grant Pro
 *   subscription.updated       → plan change / status change → sync
 *   subscription.canceled      → mark end date, keep Pro until period expires
 *   subscription.paused        → treat as canceled (Pro until period ends)
 */

export async function POST(req: Request) {
  const body = await req.text();

  // ── Signature verification ────────────────────────────────────────────────────
  const secret = process.env.PADDLE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });

  const paddle = getPaddle();

  let event: Awaited<ReturnType<typeof paddle.webhooks.unmarshal>>;
  try {
    event = await paddle.webhooks.unmarshal(body, secret, req.headers.get("paddle-signature") ?? "");
  } catch (err) {
    console.error("[paddle-webhook] signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = event.data as any;
  const customData = (data?.customData ?? data?.custom_data ?? {}) as Record<string, string>;
  const userId = customData?.userId ?? customData?.user_id;

  // ── transaction.completed — Sprint one-time payment ────────────────────────
  if (event.eventType === "transaction.completed") {
    if (!userId) return NextResponse.json({ received: true });

    const isSprint = customData?.plan === "sprint";

    if (isSprint) {
      const sprintEnd = new Date();
      sprintEnd.setDate(sprintEnd.getDate() + 90);

      await db.user.update({
        where: { id: userId },
        data: {
          plan: Plan.PRO,
          stripeCurrentPeriodEnd: sprintEnd,
        },
      });

      await db.notification.create({
        data: {
          userId,
          type: "sprint_activated",
          title: "90-Day Sprint activated!",
          body: "You have full Pro access for 90 days. Let's get you interview-ready.",
        },
      }).catch(() => {});
    }

    return NextResponse.json({ received: true });
  }

  // ── subscription.created — new subscription ───────────────────────────────
  if (event.eventType === "subscription.created") {
    if (!userId) return NextResponse.json({ received: true });

    const subId       = String(data?.id ?? "");
    const custId      = String(data?.customerId ?? "");
    const renewsAt    = data?.nextBilledAt ? new Date(data.nextBilledAt) : null;
    const firstItemId = data?.items?.[0]?.price?.id ?? null;

    await db.user.update({
      where: { id: userId },
      data: {
        plan: Plan.PRO,
        stripeSubscriptionId:   subId,
        stripeCustomerId:       custId,
        stripePriceId:          firstItemId,
        stripeCurrentPeriodEnd: renewsAt,
      },
    });

    // Referral reward
    const subscriber = await db.user.findUnique({
      where: { id: userId },
      select: { referredBy: true },
    });
    if (subscriber?.referredBy) {
      await db.notification.create({
        data: {
          userId: subscriber.referredBy,
          type: "referral_converted",
          title: "Your referral just upgraded to Pro!",
          body: "You've earned 1 free month — reach out to team@ninetydays.ai to claim your credit.",
        },
      }).catch(() => {});
    }

    return NextResponse.json({ received: true });
  }

  // ── subscription.updated — plan change / resume ────────────────────────────
  if (event.eventType === "subscription.updated") {
    const subId    = String(data?.id ?? "");
    const status   = data?.status ?? "";
    const isActive = ["active", "trialing", "past_due"].includes(status);
    const renewsAt = data?.nextBilledAt ? new Date(data.nextBilledAt) : null;
    const priceId  = data?.items?.[0]?.price?.id ?? null;

    await db.user.updateMany({
      where: { stripeSubscriptionId: subId },
      data: {
        plan: isActive ? Plan.PRO : Plan.FREE,
        stripePriceId: priceId,
        stripeCurrentPeriodEnd: renewsAt,
      },
    });

    return NextResponse.json({ received: true });
  }

  // ── subscription.canceled / subscription.paused ────────────────────────────
  if (event.eventType === "subscription.canceled" || event.eventType === "subscription.paused") {
    const subId  = String(data?.id ?? "");
    const endsAt = data?.canceledAt ? new Date(data.canceledAt)
                 : data?.scheduledChange?.effectiveAt ? new Date(data.scheduledChange.effectiveAt)
                 : null;

    await db.user.updateMany({
      where: { stripeSubscriptionId: subId },
      data: {
        // Keep PRO — cron will downgrade when stripeCurrentPeriodEnd passes
        stripeCurrentPeriodEnd: endsAt,
      },
    });

    return NextResponse.json({ received: true });
  }

  return NextResponse.json({ received: true });
}
