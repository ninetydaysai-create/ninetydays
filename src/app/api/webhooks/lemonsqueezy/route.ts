import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { Plan } from "@prisma/client";

/**
 * Lemon Squeezy webhook handler.
 *
 * Events handled:
 *   order_created          → Sprint ($49 one-time) → grant 90-day Pro
 *   subscription_created   → new monthly/annual subscription → grant Pro
 *   subscription_updated   → plan or status changed → sync plan
 *   subscription_cancelled → user cancelled → keep Pro until period ends
 *   subscription_expired   → period ended after cancel → downgrade to Free
 */

interface LSMeta {
  event_name: string;
  custom_data?: { user_id?: string; plan?: string };
}

interface LSAttributes {
  // order fields
  status: string;
  variant_id: number;
  customer_email: string;
  identifier: string;
  // subscription fields
  customer_id: number;
  renews_at: string | null;
  ends_at: string | null;
  urls: { customer_portal: string };
}

interface LSPayload {
  meta: LSMeta;
  data: {
    id: string;
    type: string;
    attributes: LSAttributes;
  };
}

export async function POST(req: Request) {
  const body = await req.text();

  // ── Verify signature ────────────────────────────────────────────────────────
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });

  const signature = req.headers.get("x-signature");
  const digest = crypto.createHmac("sha256", secret).update(body).digest("hex");

  if (!signature || signature !== digest) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(body) as LSPayload;
  const { event_name, custom_data } = payload.meta;
  const userId = custom_data?.user_id;

  if (!userId) {
    // Some LS events (e.g. subscription_payment_success) don't carry custom_data.
    // Fall back to looking up user by LS subscription/order ID.
    return NextResponse.json({ received: true });
  }

  const attrs = payload.data.attributes;

  // ── order_created — Sprint one-time payment ─────────────────────────────────
  if (event_name === "order_created" && attrs.status === "paid") {
    const sprintEnd = new Date();
    sprintEnd.setDate(sprintEnd.getDate() + 90);

    await db.user.update({
      where: { id: userId },
      data: {
        plan: Plan.PRO,
        stripeCustomerId: String(attrs.customer_email), // store email as customer ref
        stripeCurrentPeriodEnd: sprintEnd,
        // No subscription ID for one-time orders
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

    return NextResponse.json({ received: true });
  }

  // ── subscription_created — new subscription ─────────────────────────────────
  if (event_name === "subscription_created") {
    const endsAt   = attrs.renews_at ? new Date(attrs.renews_at) : null;
    const subId    = payload.data.id;
    const custId   = String(attrs.customer_id);

    await db.user.update({
      where: { id: userId },
      data: {
        plan: Plan.PRO,
        stripeSubscriptionId:  subId,
        stripeCustomerId:      custId,
        stripePriceId:         String(attrs.variant_id),
        stripeCurrentPeriodEnd: endsAt,
      },
    });

    // ── Referral reward — notify referrer on first subscription ───────────────
    const newSubscriber = await db.user.findUnique({
      where: { id: userId },
      select: { referredBy: true },
    });

    if (newSubscriber?.referredBy) {
      await db.notification.create({
        data: {
          userId: newSubscriber.referredBy,
          type: "referral_converted",
          title: "Your referral just upgraded to Pro!",
          body: "You've earned 1 free month — reach out to team@ninetydays.ai to claim your credit.",
        },
      }).catch(() => {});
    }

    return NextResponse.json({ received: true });
  }

  // ── subscription_updated ────────────────────────────────────────────────────
  if (event_name === "subscription_updated") {
    const isActive = ["active", "on_trial"].includes(attrs.status);
    const endsAt   = attrs.renews_at ? new Date(attrs.renews_at) : null;

    await db.user.updateMany({
      where: { stripeSubscriptionId: payload.data.id },
      data: {
        plan: isActive ? Plan.PRO : Plan.FREE,
        stripePriceId: String(attrs.variant_id),
        stripeCurrentPeriodEnd: endsAt,
      },
    });

    return NextResponse.json({ received: true });
  }

  // ── subscription_cancelled — keep Pro until period ends ─────────────────────
  if (event_name === "subscription_cancelled") {
    const endsAt = attrs.ends_at ? new Date(attrs.ends_at) : null;

    await db.user.updateMany({
      where: { stripeSubscriptionId: payload.data.id },
      data: {
        // Keep PRO — cron will downgrade when stripeCurrentPeriodEnd passes
        stripeCurrentPeriodEnd: endsAt,
      },
    });

    return NextResponse.json({ received: true });
  }

  // ── subscription_expired — downgrade to Free ────────────────────────────────
  if (event_name === "subscription_expired") {
    await db.user.updateMany({
      where: { stripeSubscriptionId: payload.data.id },
      data: {
        plan: Plan.FREE,
        stripeSubscriptionId: null,
        stripePriceId: null,
        stripeCurrentPeriodEnd: null,
      },
    });

    return NextResponse.json({ received: true });
  }

  return NextResponse.json({ received: true });
}
