/**
 * In-memory JD score cache keyed by SHA-256 hash of JD text.
 * TTL: 24 hours. Avoids duplicate Claude calls for the same JD.
 * Per-serverless-instance — production would use Redis.
 */

import { createHash } from "crypto";

interface CacheEntry {
  result: unknown;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();
const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// Cleanup expired entries every 30 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of cache) {
    if (now > entry.expiresAt) cache.delete(key);
  }
}, 30 * 60 * 1000);

export function hashJd(jdText: string): string {
  return createHash("sha256").update(jdText.trim()).digest("hex").slice(0, 16);
}

export function getCachedScore(jdHash: string): unknown | null {
  const entry = cache.get(jdHash);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) { cache.delete(jdHash); return null; }
  return entry.result;
}

export function setCachedScore(jdHash: string, result: unknown): void {
  cache.set(jdHash, { result, expiresAt: Date.now() + TTL_MS });
}
