/**
 * Upstash Redis singleton with graceful in-memory fallback.
 * Set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN in .env to enable Redis.
 * Without those env vars, all operations silently use the in-memory fallback —
 * so local dev and CI work without Redis configured.
 */

import { Redis } from "@upstash/redis";

let _redis: Redis | null = null;

export function getRedis(): Redis | null {
  if (_redis) return _redis;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return null;

  _redis = new Redis({ url, token });
  return _redis;
}

/** Fire-and-forget Redis increment with fallback */
export async function redisIncr(key: string, ttlSeconds?: number): Promise<number> {
  const redis = getRedis();
  if (!redis) return 0;

  const count = await redis.incr(key);
  if (ttlSeconds && count === 1) {
    await redis.expire(key, ttlSeconds);
  }
  return count;
}

export async function redisGet<T>(key: string): Promise<T | null> {
  const redis = getRedis();
  if (!redis) return null;
  return redis.get<T>(key);
}

export async function redisSet(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  if (ttlSeconds) {
    await redis.set(key, value, { ex: ttlSeconds });
  } else {
    await redis.set(key, value);
  }
}
