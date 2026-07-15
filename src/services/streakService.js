import { readLocalValue, writeLocalValue } from '../utils/localStore.js'
import { isSupabaseConfigured, supabase } from '../lib/supabase.js'
import { createActivity } from './activityService.js'

const KEY = 'preppilot:daily-streak'

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

function fallbackStreak() {
  return readLocalValue(KEY, { completedDates: [], goal: 'Finish one prep action today' })
}

export async function getStreak(userId) {
  if (!isSupabaseConfigured || !userId) return fallbackStreak()

  const { data, error } = await supabase
    .from('user_streaks')
    .select('completed_dates, goal, updated_at')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  if (!data) return fallbackStreak()
  return {
    completedDates: data.completed_dates || [],
    goal: data.goal || 'Finish one prep action today',
    updatedAt: data.updated_at
  }
}

export async function saveStreak(userId, state) {
  if (!isSupabaseConfigured || !userId) {
    writeLocalValue(KEY, state)
    return state
  }

  const payload = {
    user_id: userId,
    completed_dates: Array.isArray(state.completedDates) ? state.completedDates : [],
    goal: state.goal || 'Finish one prep action today'
  }

  const { data, error } = await supabase
    .from('user_streaks')
    .upsert(payload, { onConflict: 'user_id' })
    .select('*')
    .single()
  if (error) throw error
  try {
    await createActivity(userId, 'profile', 'Updated daily prep streak', { goal: payload.goal, completed_dates: payload.completed_dates })
  } catch {
    // Ignore activity write failures so the primary streak update still succeeds.
  }
  return {
    completedDates: data.completed_dates || [],
    goal: data.goal || 'Finish one prep action today',
    updatedAt: data.updated_at
  }
}

export async function completeToday(userId) {
  const current = await getStreak(userId)
  const today = todayKey()
  const completedDates = current.completedDates.includes(today)
    ? current.completedDates
    : [...current.completedDates, today].sort()
  const next = { ...current, completedDates }
  return saveStreak(userId, next)
}

export async function setDailyGoal(userId, goal) {
  const current = await getStreak(userId)
  const next = { ...current, goal }
  return saveStreak(userId, next)
}

export function streakCount(state = fallbackStreak()) {
  const dates = new Set(state.completedDates)
  let count = 0
  const cursor = new Date()
  while (dates.has(cursor.toISOString().slice(0, 10))) {
    count += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return count
}

export function isTodayComplete(state = fallbackStreak()) {
  return state.completedDates.includes(todayKey())
}
