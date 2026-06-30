import { Paddle, Environment } from "@paddle/paddle-node-sdk";

let _paddle: Paddle | null = null;

export function getPaddle(): Paddle {
  if (_paddle) return _paddle;
  const apiKey = process.env.PADDLE_API_KEY;
  if (!apiKey) throw new Error("PADDLE_API_KEY is not set");
  const env = process.env.PADDLE_ENV === "sandbox" ? Environment.sandbox : Environment.production;
  _paddle = new Paddle(apiKey, { environment: env });
  return _paddle;
}

export type PaddlePlan = "monthly" | "annual" | "sprint";

export const PADDLE_PRICES: Record<PaddlePlan, string> = {
  monthly: process.env.PADDLE_PRICE_MONTHLY ?? "",
  annual:  process.env.PADDLE_PRICE_ANNUAL  ?? "",
  sprint:  process.env.PADDLE_PRICE_SPRINT  ?? "",
};

export function getPaddlePriceId(plan: PaddlePlan): string {
  const id = PADDLE_PRICES[plan];
  if (!id) throw new Error(`PADDLE_PRICE_${plan.toUpperCase()} env var is not set`);
  return id;
}

// Sprint price ID for webhook identification
export const SPRINT_PRICE_ID = process.env.PADDLE_PRICE_SPRINT ?? "";

/**
 * Creates a Paddle Billing transaction and returns the hosted checkout URL.
 * custom_data.userId is preserved in webhook events for user identification.
 */
export async function createCheckoutUrl({
  plan, userId, email, successUrl,
}: {
  plan: PaddlePlan; userId: string; email: string; successUrl: string;
}): Promise<string> {
  const paddle = getPaddle();
  const transaction = await paddle.transactions.create({
    items: [{ priceId: getPaddlePriceId(plan), quantity: 1 }],
    customData: { userId, email } as Record<string, string>,
    checkout: { url: successUrl },
  });
  const url = (transaction as unknown as { checkout?: { url?: string } }).checkout?.url;
  if (!url) throw new Error("Paddle did not return a checkout URL");
  return url;
}

/** Returns the Paddle customer portal URL so users can manage billing. */
export async function createPortalUrl(paddleCustomerId: string): Promise<string> {
  const paddle = getPaddle();
  // SDK: create(customerId, subscriptionIds: string[])
  const session = await paddle.customerPortalSessions.create(paddleCustomerId, []);
  const urls = (session as unknown as { urls?: { general?: { overview?: string } } }).urls;
  const url = urls?.general?.overview;
  if (!url) throw new Error("Paddle did not return a portal URL");
  return url;
}

/** Verifies a Paddle webhook and returns the parsed event, or null if invalid. */
export function unmarshalPaddleWebhook(
  rawBody: string,
  signature: string
): Record<string, unknown> | null {
  const secret = process.env.PADDLE_WEBHOOK_SECRET;
  if (!secret) return null;
  try {
    const paddle = getPaddle();
    const event = paddle.webhooks.unmarshal(rawBody, secret, signature);
    return event as unknown as Record<string, unknown>;
  } catch {
    return null;
  }
}
