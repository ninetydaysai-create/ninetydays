import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getSubscription } from "@lemonsqueezy/lemonsqueezy.js";
import { setupLS } from "@/lib/lemonsqueezy";
import { db } from "@/lib/db";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://ninetydays.ai";

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  setupLS();

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { stripeSubscriptionId: true },
  });

  if (!user?.stripeSubscriptionId) {
    // No active subscription — send to settings page
    return NextResponse.redirect(`${APP_URL}/settings`, 303);
  }

  const { data, error } = await getSubscription(user.stripeSubscriptionId);

  if (error || !data?.data.attributes.urls.customer_portal) {
    console.error("[portal] LS error:", error);
    return NextResponse.redirect(`${APP_URL}/settings`, 303);
  }

  return NextResponse.redirect(data.data.attributes.urls.customer_portal, 303);
}
