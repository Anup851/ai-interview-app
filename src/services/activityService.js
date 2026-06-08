import { activity as demoActivity } from '../data/mockData.js'
import { isSupabaseConfigured, supabase } from '../lib/supabase.js'

export async function listActivity(userId) {
  if (!isSupabaseConfigured) return demoActivity
  if (!userId) return []
  const { data, error } = await supabase
    .from('activity_events')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(8)
  if (error) throw error
  return data.map((item) => ({
    title: item.title,
    time: new Date(item.created_at).toLocaleDateString(),
    type: item.type
  }))
}

export async function createActivity(userId, type, title, metadata = {}) {
  if (!isSupabaseConfigured || !userId) return null
  const { error } = await supabase.from('activity_events').insert({ user_id: userId, type, title, metadata })
  if (error) throw error
  return true
}
