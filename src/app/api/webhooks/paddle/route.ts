import { NextResponse } from "next/server";
import { getPaddle } from "@/lib/paddle";
import { db } from "@/lib/db";
import { Plan } from "@prisma/client";

/**
 * Paddle webhook handler.
 *
 * Events handled:
 *   transaction.completed      → one-time Sprint purchase OR subscription payment
 *   transaction.payment_failed → notify user of failed payment
 *   subscription.created       → new monthly/annual subscription → grant Pro
 *   subscription.updated       → plan change / status change → sync
 *   subscription.canceled      → mark end date, keep Pro until period expires
 *   subscription.paused        → treat as canceled (Pro until period ends)
 *   adjustment.created         → refund → downgrade user immediately
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
      // Idempotency: skip if already a PRO Sprint user with a future end date
      const existing = await db.user.findUnique({
        where: { id: userId },
        select: { plan: true, stripeCurrentPeriodEnd: true, stripeSubscriptionId: true },
      });
      const alreadyActive =
        existing?.plan === Plan.PRO &&
        existing.stripeCurrentPeriodEnd !== null &&
        existing.stripeCurrentPeriodEnd > new Date() &&
        !existing.stripeSubscriptionId; // Sprint has no subscription ID

      if (!alreadyActive) {
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
    }

    return NextResponse.json({ received: true });
  }

  // ── transaction.payment_failed — notify user ───────────────────────────────
  if (event.eventType === "transaction.payment_failed") {
    if (!userId) return NextResponse.json({ received: true });

    await db.notification.create({
      data: {
        userId,
        type: "payment_failed",
        title: "Payment failed",
        body: "We couldn't process your payment. Please update your billing details to keep your Pro access.",
      },
    }).catch(() => {});

    return NextResponse.json({ received: true });
  }

  // ── subscription.created — new subscription ───────────────────────────────
  if (event.eventType === "subscription.created") {
    if (!userId) return NextResponse.json({ received: true });

    const subId       = String(data?.id ?? "");
    const custId      = String(data?.customerId ?? "");
    const renewsAt    = data?.nextBilledAt ? new Date(data.nextBilledAt) : null;
    const firstItemId = data?.items?.[0]?.price?.id ?? null;

    // Idempotency: skip if this subscription is already stored for this user
    const existing = await db.user.findUnique({
      where: { id: userId },
      select: { stripeSubscriptionId: true },
    });
    if (existing?.stripeSubscriptionId === subId) {
      return NextResponse.json({ received: true });
    }

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
    const subId     = String(data?.id ?? "");
    const status    = data?.status ?? "";
    const isPastDue = status === "past_due";
    const isActive  = ["active", "trialing", "past_due"].includes(status);
    const renewsAt  = data?.nextBilledAt ? new Date(data.nextBilledAt) : null;
    const priceId   = data?.items?.[0]?.price?.id ?? null;

    await db.user.updateMany({
      where: { stripeSubscriptionId: subId },
      data: {
        plan: isActive ? Plan.PRO : Plan.FREE,
        stripePriceId: priceId,
        stripeCurrentPeriodEnd: renewsAt,
      },
    });

    // Warn user when payment is overdue but access is still active
    if (isPastDue) {
      const affected = await db.user.findFirst({
        where: { stripeSubscriptionId: subId },
        select: { id: true },
      });
      if (affected) {
        await db.notification.create({
          data: {
            userId: affected.id,
            type: "payment_past_due",
            title: "Payment overdue",
            body: "Your subscription payment is overdue. Please update your billing details to avoid losing access.",
          },
        }).catch(() => {});
      }
    }

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

  // ── adjustment.created — refund → downgrade immediately ───────────────────
  if (event.eventType === "adjustment.created") {
    const action = data?.action as string | undefined;
    if (action !== "refund") return NextResponse.json({ received: true });

    const custId = String(data?.customerId ?? "");
    const subId  = data?.subscriptionId ? String(data.subscriptionId) : null;

    // Prefer lookup by subscriptionId; fall back to customerId
    const user = subId
      ? await db.user.findFirst({ where: { stripeSubscriptionId: subId }, select: { id: true } })
      : custId
        ? await db.user.findFirst({ where: { stripeCustomerId: custId }, select: { id: true } })
        : null;

    if (user) {
      await db.user.update({
        where: { id: user.id },
        data: {
          plan: Plan.FREE,
          stripeSubscriptionId:   null,
          stripePriceId:          null,
          stripeCurrentPeriodEnd: null,
        },
      });

      await db.notification.create({
        data: {
          userId: user.id,
          type: "refund_processed",
          title: "Refund processed",
          body: "Your refund has been processed and your account has been moved to the free plan.",
        },
      }).catch(() => {});
    }

    return NextResponse.json({ received: true });
  }

  return NextResponse.json({ received: true });
}
