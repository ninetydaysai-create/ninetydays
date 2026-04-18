import { NextResponse } from "next/server";
import { redisIncr, redisGet, getRedis } from "@/lib/redis";

/**
 * A/B event store — Redis-backed with in-memory fallback.
 * Key pattern: ab:{test}:{variant}:{event}  → integer count
 */

// In-memory fallback (used when Redis not configured)
const memStore = new Map<string, number>();

export interface ABEvent {
  test: string;
  variant: string;
  event: string;
  geo?: string; // e.g. "IN", "US", "other"
}

export async function POST(req: Request) {
  try {
    const { test, variant, event, geo: clientGeo } = await req.json() as ABEvent;
    if (!test || !variant || !event) {
      return NextResponse.json({ error: "test, variant, event required" }, { status: 400 });
    }

    // Prefer Vercel's server-side country header (more reliable than client-supplied)
    const country = (req.headers.get("x-vercel-ip-country") ?? clientGeo ?? "other").toUpperCase();
    // Bucket: IN stays as IN, US stays as US, everything else → "other"
    const geo = country === "IN" ? "IN" : country === "US" ? "US" : "other";

    // Key pattern: ab:{test}:{variant}:{event}:{geo}
    const geoKey   = `ab:${test}:${variant}:${event}:${geo}`;
    const totalKey = `ab:${test}:${variant}:${event}`;

    if (getRedis()) {
      await Promise.all([redisIncr(geoKey), redisIncr(totalKey)]);
    } else {
      memStore.set(geoKey,   (memStore.get(geoKey)   ?? 0) + 1);
      memStore.set(totalKey, (memStore.get(totalKey) ?? 0) + 1);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
}

/** Used by /api/analytics/results to read counts */
export async function getEventCounts(): Promise<Map<string, number>> {
  const redis = getRedis();
  if (!redis) return memStore;

  // Scan all ab:* keys
  const keys: string[] = [];
  let cursor = 0;
  do {
    const [nextCursor, batch] = await redis.scan(cursor, { match: "ab:*", count: 100 });
    cursor = Number(nextCursor);
    keys.push(...(batch as string[]));
  } while (cursor !== 0);

  const result = new Map<string, number>();
  if (keys.length > 0) {
    const values = await redis.mget<number[]>(...keys);
    keys.forEach((k, i) => result.set(k.replace("ab:", ""), values[i] ?? 0));
  }
  return result;
}
