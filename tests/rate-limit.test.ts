import { describe, it, expect } from 'vitest'
import { rateLimit } from '../lib/rate-limit'

describe('rateLimit', () => {
  it('allows requests within the limit', () => {
    const result = rateLimit('test-key-allow', 5, 60_000)
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(4)
  })

  it('tracks consecutive requests against the same key', () => {
    const key = 'test-key-consecutive'
    for (let i = 0; i < 3; i++) rateLimit(key, 3, 60_000)
    const last = rateLimit(key, 3, 60_000)
    expect(last.allowed).toBe(false)
    expect(last.remaining).toBe(0)
  })

  it('does not bleed across different keys', () => {
    rateLimit('key-a', 1, 60_000)
    rateLimit('key-a', 1, 60_000) // exhausted
    const other = rateLimit('key-b', 1, 60_000)
    expect(other.allowed).toBe(true)
  })

  it('resets the window after expiry', () => {
    const key = 'test-key-expired'
    // Simulate an already-expired window by using a -1 ms window
    rateLimit(key, 1, -1)
    const fresh = rateLimit(key, 1, 60_000)
    expect(fresh.allowed).toBe(true)
  })

  it('provides a resetAt timestamp in the future', () => {
    const before = Date.now()
    const { resetAt } = rateLimit('test-key-reset', 5, 10_000)
    expect(resetAt).toBeGreaterThan(before)
  })
})
