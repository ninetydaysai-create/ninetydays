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

export function getPaddlePriceId(plan: PaddlePlan): string {
  const map: Record<PaddlePlan, string | undefined> = {
    monthly: process.env.PADDLE_PRICE_MONTHLY,
    annual:  process.env.PADDLE_PRICE_ANNUAL,
    sprint:  process.env.PADDLE_PRICE_SPRINT,
  };
  const id = map[plan];
  if (!id) throw new Error(`PADDLE_PRICE_${plan.toUpperCase()} env var is not set`);
  return id;
}
