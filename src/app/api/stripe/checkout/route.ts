import { NextResponse } from "next/server";

// Migrated to Lemon Squeezy. Use /api/checkout instead.
export async function POST() {
  return NextResponse.json({ error: "Deprecated. Use /api/checkout." }, { status: 410 });
}
