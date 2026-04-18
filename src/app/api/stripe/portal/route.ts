import { NextResponse } from "next/server";

// Migrated to Lemon Squeezy. Use /api/billing/portal instead.
export async function POST() {
  return NextResponse.json({ error: "Deprecated. Use /api/billing/portal." }, { status: 410 });
}
