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
    select: { paddleCustomerId: true, paddleSubscriptionId: true },
  });

  // No Paddle customer yet — send to settings to subscribe
  if (!user?.paddleCustomerId) {
    return NextResponse.redirect(`${APP_URL}/settings`, 303);
  }

  try {
    const paddle = getPaddle();
    const session = await paddle.customerPortalSessions.create(
      user.paddleCustomerId,
      user.paddleSubscriptionId ? [user.paddleSubscriptionId] : [],
    );

    const portalUrl = session.urls?.general?.overview;
    if (portalUrl) {
      return NextResponse.redirect(portalUrl, 303);
    }
  } catch (err) {
    console.error("[billing/portal] Paddle error:", err);
  }

  return NextResponse.redirect(`${APP_URL}/settings`, 303);
}
