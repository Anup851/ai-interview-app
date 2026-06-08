import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders, jsonResponse } from '../_shared/cors.ts'

const stripeApi = 'https://api.stripe.com/v1'

async function stripeRequest(path: string, body: URLSearchParams) {
  const secretKey = Deno.env.get('STRIPE_SECRET_KEY')
  if (!secretKey) throw new Error('STRIPE_SECRET_KEY is not configured')

  const response = await fetch(`${stripeApi}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error?.message || 'Stripe request failed')
  return data
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405)

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const priceId = Deno.env.get('STRIPE_PRICE_ID_PRO')
    const siteUrl = Deno.env.get('SITE_URL')

    if (!priceId) return jsonResponse({ error: 'STRIPE_PRICE_ID_PRO is not configured' }, 503)
    if (!siteUrl) return jsonResponse({ error: 'SITE_URL is not configured' }, 503)

    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: req.headers.get('Authorization') || '' } }
    })
    const adminClient = createClient(supabaseUrl, serviceKey)

    const { data: authData, error: authError } = await authClient.auth.getUser()
    if (authError || !authData.user) return jsonResponse({ error: 'Not authenticated' }, 401)

    const { data: subscription } = await adminClient
      .from('subscriptions')
      .select('*')
      .eq('user_id', authData.user.id)
      .maybeSingle()

    let customerId = subscription?.stripe_customer_id
    if (!customerId) {
      const customer = await stripeRequest('/customers', new URLSearchParams({
        email: authData.user.email || '',
        'metadata[user_id]': authData.user.id
      }))
      customerId = customer.id
      await adminClient
        .from('subscriptions')
        .upsert({ user_id: authData.user.id, stripe_customer_id: customerId, plan_name: 'free', status: 'active' }, { onConflict: 'user_id' })
    }

    const session = await stripeRequest('/checkout/sessions', new URLSearchParams({
      mode: 'subscription',
      customer: customerId,
      'line_items[0][price]': priceId,
      'line_items[0][quantity]': '1',
      success_url: `${siteUrl}/app/profile?checkout=success`,
      cancel_url: `${siteUrl}/app/profile?checkout=cancelled`,
      'metadata[user_id]': authData.user.id
    }))

    return jsonResponse({ url: session.url })
  } catch (error) {
    return jsonResponse({ error: error.message || 'Checkout failed' }, 500)
  }
})
