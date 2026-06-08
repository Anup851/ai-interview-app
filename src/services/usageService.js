import { isSupabaseConfigured, supabase } from '../lib/supabase.js'

const FREE_LIMITS = {
  resume_analysis: 3,
  question_generation: 5,
  mock_interview: 2,
  feedback_report: 5
}

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
    limits: subscription.plan_name === 'free' ? FREE_LIMITS : {},
    used
  }
}

export async function assertUsageAllowed(userId, type) {
  if (!isSupabaseConfigured || !userId) return true

  const summary = await getUsageSummary(userId)
  const limit = summary.limits[type]
  if (!limit) return true

  const used = summary.used[type] || 0
  if (used >= limit) {
    throw new Error(`Monthly ${type.replaceAll('_', ' ')} limit reached for the free plan.`)
  }
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
