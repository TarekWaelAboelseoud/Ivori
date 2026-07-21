/**
 * Rate limiting backed by Upstash Redis (works correctly across Vercel's
 * multiple serverless instances). Falls back to an in-memory counter when
 * UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN aren't set, which is
 * fine for local dev but does NOT enforce limits reliably in production
 * on serverless — each cold start gets its own memory.
 */

import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'
import { env } from '@/lib/env'

const redis =
  env.upstashRedisUrl && env.upstashRedisToken
    ? new Redis({ url: env.upstashRedisUrl, token: env.upstashRedisToken })
    : null

if (!redis && process.env.NODE_ENV === 'production') {
  console.warn(
    '[rate-limit] UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN not set. ' +
      'Falling back to in-memory rate limiting, which does not work reliably ' +
      'across Vercel serverless instances. Set both env vars to fix this.'
  )
}

const buckets = new Map<string, { count: number; reset: number }>()

function memoryRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { ok: boolean; retryAfter?: number } {
  const now = Date.now()
  const entry = buckets.get(key)

  if (!entry || now > entry.reset) {
    buckets.set(key, { count: 1, reset: now + windowMs })
    return { ok: true }
  }

  if (entry.count >= limit) {
    return { ok: false, retryAfter: Math.ceil((entry.reset - now) / 1000) }
  }

  entry.count += 1
  return { ok: true }
}

// Ratelimit instances are meant to be reused across requests, so we cache
// one per (limit, windowMs) pair instead of constructing a new one per call.
const limiters = new Map<string, Ratelimit>()

function getLimiter(limit: number, windowMs: number): Ratelimit {
  const cacheKey = `${limit}:${windowMs}`
  let limiter = limiters.get(cacheKey)
  if (!limiter) {
    limiter = new Ratelimit({
      redis: redis as Redis,
      limiter: Ratelimit.slidingWindow(limit, `${windowMs} ms`),
      analytics: false,
      prefix: 'ivori-rl',
    })
    limiters.set(cacheKey, limiter)
  }
  return limiter
}

export async function rateLimit(
  key: string,
  limit = 8,
  windowMs = 60_000
): Promise<{ ok: boolean; retryAfter?: number }> {
  if (!redis) {
    return memoryRateLimit(key, limit, windowMs)
  }

  try {
    const { success, reset } = await getLimiter(limit, windowMs).limit(key)
    if (success) return { ok: true }
    return { ok: false, retryAfter: Math.max(1, Math.ceil((reset - Date.now()) / 1000)) }
  } catch (err) {
    console.error('[rate-limit] Upstash error, falling back to in-memory limiter:', err)
    return memoryRateLimit(key, limit, windowMs)
  }
}

export function clientIp(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  )
}
