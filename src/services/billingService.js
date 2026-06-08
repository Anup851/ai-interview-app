import { isSupabaseConfigured, supabase } from '../lib/supabase.js'

export async function startProCheckout() {
  if (!isSupabaseConfigured) throw new Error('Connect Supabase before starting checkout.')

  const { data, error } = await supabase.functions.invoke('create-checkout-session')
  if (error || data?.error) throw new Error(data?.error || error?.message || 'Could not start checkout.')
  if (!data?.url) throw new Error('Checkout session did not return a URL.')

  window.location.assign(data.url)
}
