import { NextResponse } from "next/server";

// Migrated to Lemon Squeezy. Use /api/webhooks/lemonsqueezy instead.
export async function POST() {
  return NextResponse.json({ error: "Deprecated. Use /api/webhooks/lemonsqueezy." }, { status: 410 });
}
