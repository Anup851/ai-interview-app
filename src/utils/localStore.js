export const AUTH_SESSION_KEY = 'preppilot:auth-session'
export const AUTH_PROFILE_KEY = 'preppilot:auth-profile'

export function readLocalValue(key, fallback) {
  try {
    const value = window.localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

export function writeLocalValue(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value))
}

export function clearLocalValue(key) {
  window.localStorage.removeItem(key)
}

export function readDemoSession() {
  const user = readLocalValue(AUTH_SESSION_KEY, null)
  const profile = readLocalValue(AUTH_PROFILE_KEY, null)
  return { user, profile }
}

export function writeDemoSession(user, profile) {
  writeLocalValue(AUTH_SESSION_KEY, user)
  writeLocalValue(AUTH_PROFILE_KEY, profile)
}

export function clearDemoSession() {
  clearLocalValue(AUTH_SESSION_KEY)
  clearLocalValue(AUTH_PROFILE_KEY)
}
