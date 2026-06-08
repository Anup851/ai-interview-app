import { createClient } from 'npm:@supabase/supabase-js@2'
import { jsonResponse } from '../_shared/cors.ts'

function hex(buffer: ArrayBuffer) {
  return [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

async function verifyStripeSignature(body: string, signature: string, secret: string) {
  const parts = Object.fromEntries(signature.split(',').map((part) => {
    const [key, value] = part.split('=')
    return [key, value]
  }))
  if (!parts.t || !parts.v1) return false

  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const expected = hex(await crypto.subtle.sign('HMAC', key, encoder.encode(`${parts.t}.${body}`)))
  return expected === parts.v1
}

function subscriptionPayload(subscription: Record<string, any>) {
  return {
    stripe_subscription_id: subscription.id,
    plan_name: 'pro',
    status: subscription.status,
    current_period_start: subscription.current_period_start ? new Date(subscription.current_period_start * 1000).toISOString() : null,
    current_period_end: subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : null,
    cancel_at_period_end: Boolean(subscription.cancel_at_period_end)
  }
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405)

  try {
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    if (!webhookSecret) return jsonResponse({ error: 'STRIPE_WEBHOOK_SECRET is not configured' }, 503)

    const body = await req.text()
    const signature = req.headers.get('stripe-signature') || ''
    const valid = await verifyStripeSignature(body, signature, webhookSecret)
    if (!valid) return jsonResponse({ error: 'Invalid Stripe signature' }, 400)

    const event = JSON.parse(body)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const adminClient = createClient(supabaseUrl, serviceKey)

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const userId = session.metadata?.user_id
      if (userId) {
        await adminClient
          .from('subscriptions')
          .upsert({
            user_id: userId,
            stripe_customer_id: session.customer,
            stripe_subscription_id: session.subscription,
            plan_name: 'pro',
            status: 'active'
          }, { onConflict: 'user_id' })
      }
    }

    if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object
      const next = event.type === 'customer.subscription.deleted'
        ? { ...subscriptionPayload(subscription), plan_name: 'free', status: 'canceled' }
        : subscriptionPayload(subscription)

      await adminClient
        .from('subscriptions')
        .update(next)
        .eq('stripe_subscription_id', subscription.id)
    }

    return jsonResponse({ received: true })
  } catch (error) {
    return jsonResponse({ error: error.message || 'Webhook failed' }, 500)
  }
})
