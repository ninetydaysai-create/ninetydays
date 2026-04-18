import { lemonSqueezySetup } from "@lemonsqueezy/lemonsqueezy.js";

/**
 * Call once at the top of any server-side file that uses the LS SDK.
 * Safe to call multiple times — LS setup is idempotent.
 */
export function setupLS() {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY;
  if (!apiKey) throw new Error("LEMONSQUEEZY_API_KEY is not set");
  lemonSqueezySetup({ apiKey });
}

/** Lemon Squeezy variant IDs — one per plan, LS handles all currencies internally */
export type LSPlan = "monthly" | "annual" | "sprint" | "monthly_15";

export function getLSVariantId(plan: LSPlan): string {
  const map: Record<LSPlan, string | undefined> = {
    monthly:    process.env.LS_VARIANT_PRO_MONTHLY,
    annual:     process.env.LS_VARIANT_PRO_ANNUAL,
    sprint:     process.env.LS_VARIANT_SPRINT,
    monthly_15: process.env.LS_VARIANT_PRO_MONTHLY_15,
  };
  const id = map[plan];
  if (!id) throw new Error(`LS_VARIANT_${plan.toUpperCase()} is not set`);
  return id;
}
