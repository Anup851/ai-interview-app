import { isSupabaseConfigured, supabase } from '../lib/supabase.js'

function monthStartIso() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
}

export async function getSubscription(userId) {
  if (!isSupabaseConfigured || !userId) return { plan_name: 'demo', status: 'active' }

  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  return data || { plan_name: 'free', status: 'active' }
}

export async function getUsageSummary(userId) {
  if (!isSupabaseConfigured || !userId) return { plan: 'demo', limits: {}, used: {} }

  const subscription = await getSubscription(userId)
  const { data, error } = await supabase
    .from('usage_events')
    .select('type, quantity')
    .eq('user_id', userId)
    .gte('created_at', monthStartIso())
  if (error) throw error

  const used = (data || []).reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + item.quantity
    return acc
  }, {})

  return {
    plan: subscription.plan_name || 'free',
    status: subscription.status || 'active',
    limits: {},
    used
  }
}

export async function assertUsageAllowed(userId, type) {
  void userId
  void type
  return true
}

export async function trackUsage(userId, type, metadata = {}, quantity = 1) {
  if (!isSupabaseConfigured || !userId) return null

  const { data, error } = await supabase
    .from('usage_events')
    .insert({ user_id: userId, type, quantity, metadata })
    .select('*')
    .single()
  if (error) throw error
  return data
}
