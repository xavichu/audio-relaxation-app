// In-memory sliding-window rate limiter.
// On serverless each instance has its own Map, so this is best-effort — it
// prevents accidental hammering within a single warm instance but won't stop
// distributed abuse. For stricter limits, replace with Upstash Redis.

interface Window {
  count: number
  resetAt: number
}

const store = new Map<string, Window>()

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now()
  const existing = store.get(key)

  if (!existing || existing.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs }
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt }
  }

  existing.count += 1
  return { allowed: true, remaining: limit - existing.count, resetAt: existing.resetAt }
}
