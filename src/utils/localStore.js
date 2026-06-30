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
