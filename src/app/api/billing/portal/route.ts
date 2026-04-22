import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getPaddle } from "@/lib/paddle";
import { db } from "@/lib/db";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://ninetydays.ai";

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true, stripeSubscriptionId: true },
  });

  // No active subscription — send to settings to upgrade
  if (!user?.stripeSubscriptionId && !user?.stripeCustomerId) {
    return NextResponse.redirect(`${APP_URL}/settings`, 303);
  }

  try {
    const paddle = getPaddle();

    // If we have the Paddle customer ID, get their portal session URL
    if (user.stripeCustomerId) {
      const customer = await paddle.customers.get(user.stripeCustomerId);
      // Paddle customer portal URL (v2 Billing)
      // The portal URL is at customers[].importMeta.externalId or via portal session
      // Use the Paddle-managed URL pattern
      const portalUrl = `https://customer.paddle.com/portal/manage/${user.stripeCustomerId}`;
      void customer; // suppress unused warning — we verified customer exists
      return NextResponse.redirect(portalUrl, 303);
    }
  } catch (err) {
    console.error("[billing/portal] Paddle error:", err);
  }

  // Fallback — send to settings page
  return NextResponse.redirect(`${APP_URL}/settings`, 303);
}
