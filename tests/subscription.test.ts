import { describe, it, expect } from 'vitest'
import { mapStripeStatus } from '../lib/subscription'

describe('mapStripeStatus', () => {
  it('grants Pro access for active subscriptions', () => {
    expect(mapStripeStatus('active')).toBe('active')
  })

  it('grants Pro access during a trial (revenue bug regression)', () => {
    // Trialing users must NOT be locked out of Pro features.
    expect(mapStripeStatus('trialing')).toBe('active')
  })

  it('revokes access for past_due, canceled and unpaid', () => {
    expect(mapStripeStatus('past_due')).toBe('free')
    expect(mapStripeStatus('canceled')).toBe('free')
    expect(mapStripeStatus('unpaid')).toBe('free')
  })

  it('treats incomplete states as free', () => {
    expect(mapStripeStatus('incomplete')).toBe('free')
    expect(mapStripeStatus('incomplete_expired')).toBe('free')
  })

  it('treats paused subscriptions as free', () => {
    expect(mapStripeStatus('paused')).toBe('free')
  })
})
