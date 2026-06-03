import { stripe } from '../../../lib/stripe'
import { createServiceClient } from '../../../lib/supabase-service'
import { mapStripeStatus } from '../../../lib/subscription'
import { NextResponse } from 'next/server'
import type Stripe from 'stripe'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook signature verification failed'
    return NextResponse.json({ error: message }, { status: 400 })
  }

  const supabase = createServiceClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId
        const customerId = session.customer as string | null
        const subscriptionId = session.subscription as string | null

        if (!userId || !subscriptionId) break

        // Fetch the subscription to read its real status (don't assume active).
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)

        await supabase
          .from('profiles')
          .update({
            subscription_status: mapStripeStatus(subscription.status),
            stripe_subscription_id: subscriptionId,
            ...(customerId ? { stripe_customer_id: customerId } : {}),
          })
          .eq('id', userId)
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        await supabase
          .from('profiles')
          .update({
            subscription_status: mapStripeStatus(subscription.status),
            stripe_subscription_id: subscription.id,
          })
          .eq('stripe_customer_id', customerId)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        await supabase
          .from('profiles')
          .update({
            subscription_status: 'free',
            stripe_subscription_id: null,
          })
          .eq('stripe_customer_id', customerId)
        break
      }
    }
  } catch (err) {
    // Return 500 so Stripe retries the event rather than dropping it.
    const message = err instanceof Error ? err.message : 'Webhook handler failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
