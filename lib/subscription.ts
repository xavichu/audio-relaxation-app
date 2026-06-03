import type Stripe from 'stripe'

/**
 * Stripe subscription statuses that should grant Pro access.
 * `trialing` is included so trial users are NOT locked out.
 */
const PRO_STATUSES: ReadonlySet<Stripe.Subscription.Status> = new Set([
  'active',
  'trialing',
])

export type AppSubscriptionStatus = 'active' | 'free'

/** Maps a raw Stripe subscription status to our internal access level. */
export function mapStripeStatus(status: Stripe.Subscription.Status): AppSubscriptionStatus {
  return PRO_STATUSES.has(status) ? 'active' : 'free'
}
