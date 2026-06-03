import { stripe } from '../../../../lib/stripe'
import { createClient } from '../../../../lib/supabase-server'
import { createServiceClient } from '../../../../lib/supabase-service'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function DELETE() {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch stripe customer so we can cancel their subscription
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, stripe_subscription_id')
      .eq('id', user.id)
      .single()

    // Cancel active Stripe subscription immediately (no refund; see Terms)
    if (profile?.stripe_subscription_id) {
      try {
        await stripe.subscriptions.cancel(profile.stripe_subscription_id)
      } catch {
        // Subscription may already be cancelled; continue deletion
      }
    }

    // Delete the Supabase user via the service-role client — this cascades to
    // the profiles row through the ON DELETE CASCADE FK defined in schema.sql
    const serviceClient = createServiceClient()
    const { error: deleteError } = await serviceClient.auth.admin.deleteUser(user.id)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ deleted: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
