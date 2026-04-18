/**
 * Rate limiter with Upstash Redis backend + in-memory fallback.
 * Redis: production-grade, survives serverless cold starts and multiple instances.
 * Fallback: in-memory Map (per-instance), used when Redis is not configured.
 */

import { Ratelimit } from "@upstash/ratelimit";
import { getRedis } from "@/lib/redis";

// ── In-memory fallback ──────────────────────────────────────────────────────

interface MemEntry { count: number; resetAt: number }
const memStore = new Map<string, MemEntry>();

setInterval(() => {
  const now = Date.now();
  for (const [k, e] of memStore) if (now > e.resetAt) memStore.delete(k);
}, 5 * 60 * 1000);

function memRateLimit(
  key: string, max: number, windowMs: number
): { allowed: boolean; retryAfterSecs?: number } {
  const now = Date.now();
  const entry = memStore.get(key);

  if (!entry || now > entry.resetAt) {
    memStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }
  if (entry.count >= max) {
    return { allowed: false, retryAfterSecs: Math.ceil((entry.resetAt - now) / 1000) };
  }
  entry.count++;
  return { allowed: true };
}

// ── Upstash Redis cache of Ratelimit instances ──────────────────────────────
const limiterCache = new Map<string, Ratelimit>();

function getLimiter(max: number, windowMs: number): Ratelimit | null {
  const redis = getRedis();
  if (!redis) return null;

  const cacheKey = `${max}:${windowMs}`;
  if (limiterCache.has(cacheKey)) return limiterCache.get(cacheKey)!;

  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(max, `${Math.round(windowMs / 1000)} s`),
    analytics: true,
  });
  limiterCache.set(cacheKey, limiter);
  return limiter;
}

// ── Public API ──────────────────────────────────────────────────────────────

export async function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): Promise<{ allowed: boolean; retryAfterSecs?: number }> {
  const limiter = getLimiter(maxRequests, windowMs);

  if (limiter) {
    const { success, reset } = await limiter.limit(key);
    if (!success) {
      const retryAfterSecs = Math.max(0, Math.ceil((reset - Date.now()) / 1000));
      return { allowed: false, retryAfterSecs };
    }
    return { allowed: true };
  }

  // Fallback to in-memory
  return memRateLimit(key, maxRequests, windowMs);
}

export function getClientIp(req: Request): string {
  const headers = new Headers((req as Request).headers);
  return (
    headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    headers.get("x-real-ip") ??
    "unknown"
  );
}
