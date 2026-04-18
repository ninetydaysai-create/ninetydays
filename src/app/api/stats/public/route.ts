import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Cache user count for 10 minutes — avoids a DB hit on every score page load
let cachedCount: number | null = null;
let cacheExpiresAt = 0;
const CACHE_TTL = 10 * 60 * 1000;

// Social-proof floor: never show below this even in early days
const BASE_COUNT = 400;

export async function GET() {
  const now = Date.now();

  if (cachedCount !== null && now < cacheExpiresAt) {
    return NextResponse.json({ userCount: cachedCount }, {
      headers: { "Cache-Control": "public, max-age=300" },
    });
  }

  try {
    const dbCount = await db.user.count();
    // Add base count so early users don't see "Join 3 engineers"
    const total = dbCount + BASE_COUNT;
    // Round down to nearest 50 for believability ("2,450+" not "2,453+")
    cachedCount = Math.floor(total / 50) * 50;
    cacheExpiresAt = now + CACHE_TTL;
  } catch {
    // Fallback if DB is down — show base count
    cachedCount = BASE_COUNT;
    cacheExpiresAt = now + 60_000;
  }

  return NextResponse.json({ userCount: cachedCount }, {
    headers: { "Cache-Control": "public, max-age=300" },
  });
}
