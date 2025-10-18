/**
 * Redis-based Rate Limiting
 * Falls back to in-memory rate limiting if Redis is not configured
 */

import { Redis } from '@upstash/redis';

// Initialize Redis client (optional - falls back to in-memory if not configured)
let redis: Redis | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  try {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    console.log('[RATE LIMIT] Redis configured successfully');
  } catch (error) {
    console.warn('[RATE LIMIT] Failed to initialize Redis, falling back to in-memory:', error);
  }
} else {
  console.log('[RATE LIMIT] Redis not configured, using in-memory rate limiting');
}

// In-memory fallback (same as existing implementation)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

/**
 * Check rate limit using Redis or in-memory fallback
 *
 * @param key - Unique identifier for the rate limit (e.g., "login:user@example.com" or "upload:userId")
 * @param maxRequests - Maximum number of requests allowed in the time window
 * @param windowMs - Time window in milliseconds
 * @returns Object with allowed status and remaining requests
 */
export async function checkRateLimit(
  key: string,
  maxRequests: number = 5,
  windowMs: number = 60000 // 1 minute
): Promise<{ allowed: boolean; remaining: number; resetAt?: number }> {
  // Use Redis if available
  if (redis) {
    return checkRateLimitRedis(key, maxRequests, windowMs);
  }

  // Fall back to in-memory
  return checkRateLimitMemory(key, maxRequests, windowMs);
}

/**
 * Redis-based rate limiting (production)
 */
async function checkRateLimitRedis(
  key: string,
  maxRequests: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  try {
    const now = Date.now();
    const windowStart = now - windowMs;
    const redisKey = `ratelimit:${key}`;

    // Remove old entries outside the time window
    await redis!.zremrangebyscore(redisKey, 0, windowStart);

    // Count requests in current window
    const count = await redis!.zcard(redisKey);

    if (count >= maxRequests) {
      // Get the oldest request to calculate reset time
      const oldestRequests = await redis!.zrange(redisKey, 0, 0, { withScores: true }) as Array<{ member: string; score: number }>;
      const resetAt = oldestRequests.length > 0
        ? oldestRequests[0].score + windowMs
        : now + windowMs;

      return {
        allowed: false,
        remaining: 0,
        resetAt,
      };
    }

    // Add current request
    await redis!.zadd(redisKey, { score: now, member: `${now}:${Math.random()}` });

    // Set expiry on the key (cleanup)
    await redis!.expire(redisKey, Math.ceil(windowMs / 1000));

    return {
      allowed: true,
      remaining: maxRequests - (count + 1),
      resetAt: now + windowMs,
    };
  } catch (error) {
    console.error('[RATE LIMIT] Redis error, falling back to in-memory:', error);
    // Fall back to in-memory on Redis error
    return checkRateLimitMemory(key, maxRequests, windowMs);
  }
}

/**
 * In-memory rate limiting (development/fallback)
 */
function checkRateLimitMemory(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }

  record.count++;
  return { allowed: true, remaining: maxRequests - record.count, resetAt: record.resetAt };
}

/**
 * Clean up expired rate limit records (in-memory only)
 */
if (typeof setInterval !== 'undefined' && !redis) {
  setInterval(() => {
    const now = Date.now();
    const keysToDelete: string[] = [];

    rateLimitMap.forEach((record, key) => {
      if (now > record.resetAt) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => rateLimitMap.delete(key));
  }, 60000); // Clean up every minute
}

/**
 * Reset rate limit for a specific key
 * Useful for clearing rate limits after successful operations
 */
export async function resetRateLimit(key: string): Promise<void> {
  if (redis) {
    try {
      await redis.del(`ratelimit:${key}`);
    } catch (error) {
      console.error('[RATE LIMIT] Failed to reset rate limit in Redis:', error);
    }
  } else {
    rateLimitMap.delete(key);
  }
}

/**
 * Get current rate limit status without incrementing
 */
export async function getRateLimitStatus(
  key: string,
  maxRequests: number,
  windowMs: number
): Promise<{ count: number; remaining: number; resetAt: number }> {
  if (redis) {
    try {
      const now = Date.now();
      const windowStart = now - windowMs;
      const redisKey = `ratelimit:${key}`;

      // Clean up old entries
      await redis.zremrangebyscore(redisKey, 0, windowStart);

      // Get count
      const count = await redis.zcard(redisKey);

      // Get reset time
      const oldestRequests = await redis.zrange(redisKey, 0, 0, { withScores: true }) as Array<{ member: string; score: number }>;
      const resetAt = oldestRequests.length > 0
        ? oldestRequests[0].score + windowMs
        : now + windowMs;

      return {
        count,
        remaining: Math.max(0, maxRequests - count),
        resetAt,
      };
    } catch (error) {
      console.error('[RATE LIMIT] Failed to get status from Redis:', error);
      // Fall back to in-memory
    }
  }

  // In-memory fallback
  const record = rateLimitMap.get(key);
  if (!record || Date.now() > record.resetAt) {
    return { count: 0, remaining: maxRequests, resetAt: Date.now() + windowMs };
  }

  return {
    count: record.count,
    remaining: Math.max(0, maxRequests - record.count),
    resetAt: record.resetAt,
  };
}

/**
 * Generate standard rate limit headers for HTTP responses
 * These headers inform clients about their rate limit status
 *
 * @param limit - Maximum requests allowed
 * @param remaining - Requests remaining in current window
 * @param resetAt - Timestamp when the limit resets (milliseconds)
 * @returns Headers object with X-RateLimit-* headers
 */
export function getRateLimitHeaders(
  limit: number,
  remaining: number,
  resetAt: number
): Record<string, string> {
  const resetInSeconds = Math.ceil((resetAt - Date.now()) / 1000);

  return {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(resetAt / 1000).toString(), // Unix timestamp in seconds
    'Retry-After': resetInSeconds > 0 ? resetInSeconds.toString() : '0',
  };
}
