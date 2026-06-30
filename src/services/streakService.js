import { readLocalValue, writeLocalValue } from '../utils/localStore.js'

const KEY = 'preppilot:daily-streak'

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

export function getStreak() {
  return readLocalValue(KEY, { completedDates: [], goal: 'Finish one prep action today' })
}

export function completeToday() {
  const current = getStreak()
  const today = todayKey()
  const completedDates = current.completedDates.includes(today)
    ? current.completedDates
    : [...current.completedDates, today].sort()
  const next = { ...current, completedDates }
  writeLocalValue(KEY, next)
  return next
}

export function setDailyGoal(goal) {
  const next = { ...getStreak(), goal }
  writeLocalValue(KEY, next)
  return next
}

export function streakCount(state = getStreak()) {
  const dates = new Set(state.completedDates)
  let count = 0
  const cursor = new Date()
  while (dates.has(cursor.toISOString().slice(0, 10))) {
    count += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return count
}

export function isTodayComplete(state = getStreak()) {
  return state.completedDates.includes(todayKey())
}
