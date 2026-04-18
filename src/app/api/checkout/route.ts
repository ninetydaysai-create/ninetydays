import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createCheckout } from "@lemonsqueezy/lemonsqueezy.js";
import { setupLS, getLSVariantId, type LSPlan } from "@/lib/lemonsqueezy";
import { db } from "@/lib/db";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://ninetydays.ai";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  setupLS();

  const formData = await req.formData();
  const rawPlan  = formData.get("plan") as string | null;
  const interval = formData.get("interval") as string | null;

  // Normalise plan
  let plan: LSPlan;
  if      (rawPlan === "sprint")      plan = "sprint";
  else if (rawPlan === "monthly_15")  plan = "monthly_15";
  else if (rawPlan === "annual" || interval === "year") plan = "annual";
  else                                 plan = "monthly";

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  const variantId = getLSVariantId(plan);
  const storeId   = process.env.LEMONSQUEEZY_STORE_ID!;

  const isSprint = plan === "sprint";

  const { data, error } = await createCheckout(storeId, variantId, {
    checkoutData: {
      email: user?.email ?? undefined,
      // custom data is passed through to the webhook
      custom: { user_id: userId, plan },
    },
    productOptions: {
      redirectUrl: isSprint
        ? `${APP_URL}/dashboard?upgraded=1&plan=sprint`
        : `${APP_URL}/dashboard?upgraded=1`,
      receiptButtonText: "Go to dashboard",
      receiptThankYouNote: "Thank you! Your Pro access is now active.",
    },
    checkoutOptions: {
      embed: false,
      media: false,
      logo: true,
    },
  });

  if (error || !data?.data.attributes.url) {
    console.error("[checkout] LS error:", error);
    return NextResponse.json({ error: "Failed to create checkout" }, { status: 500 });
  }

  return NextResponse.redirect(data.data.attributes.url, 303);
}
