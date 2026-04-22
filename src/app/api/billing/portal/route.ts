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
  if (!user?.stripeCustomerId) {
    return NextResponse.redirect(`${APP_URL}/settings`, 303);
  }

  try {
    const paddle = getPaddle();

    // Create a Paddle Customer Portal Session — returns a short-lived URL
    const session = await paddle.customerPortalSessions.create(
      user.stripeCustomerId,
      // subscriptionIds limits the portal to just this subscription (optional but cleaner)
      user.stripeSubscriptionId ? [user.stripeSubscriptionId] : [],
    );

    const portalUrl = session.urls?.general?.overview;
    if (portalUrl) {
      return NextResponse.redirect(portalUrl, 303);
    }
  } catch (err) {
    console.error("[billing/portal] Paddle error:", err);
  }

  // Fallback — send to settings page
  return NextResponse.redirect(`${APP_URL}/settings`, 303);
}
