import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getPaddle, getPaddlePriceId, type PaddlePlan } from "@/lib/paddle";
import { db } from "@/lib/db";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://ninetydays.ai";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const rawPlan = formData.get("plan") as string | null;
  const interval = formData.get("interval") as string | null;

  // Normalise plan
  let plan: PaddlePlan;
  if      (rawPlan === "sprint")                        plan = "sprint";
  else if (rawPlan === "annual" || interval === "year") plan = "annual";
  else                                                   plan = "monthly";

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  const paddle   = getPaddle();
  const priceId  = getPaddlePriceId(plan);
  const isSprint = plan === "sprint";

  // Create a one-time transaction — Paddle generates a hosted checkout URL.
  // customData is passed through to the webhook so we know which user upgraded.
  const transaction = await paddle.transactions.create({
    items: [{ priceId, quantity: 1 }],
    customData: { userId, plan } as Record<string, unknown>,
    checkout: {
      url: isSprint
        ? `${APP_URL}/dashboard?upgraded=1&plan=sprint`
        : `${APP_URL}/dashboard?upgraded=1`,
    },
    ...(user?.email ? { customer: { email: user.email } } : {}),
  });

  const checkoutUrl = transaction.checkout?.url;
  if (!checkoutUrl) {
    console.error("[checkout] No checkout URL from Paddle transaction", transaction);
    return NextResponse.json({ error: "Failed to create checkout" }, { status: 500 });
  }

  return NextResponse.redirect(checkoutUrl, 303);
}
