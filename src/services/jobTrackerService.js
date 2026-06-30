import { readLocalValue, writeLocalValue } from '../utils/localStore.js'

const KEY = 'preppilot:job-tracker'

const demoJobs = [
  { id: 'demo-1', company: 'Acme AI', role: 'Frontend Engineer', stage: 'Interview', date: '2026-07-03', notes: 'Prepare React performance story and system design tradeoffs.' },
  { id: 'demo-2', company: 'Northstar Fintech', role: 'Full Stack Engineer', stage: 'Applied', date: '2026-07-08', notes: 'Tailor resume to API, SQL, and reliability keywords.' }
]

export function listJobs() {
  return readLocalValue(KEY, demoJobs)
}

export function saveJobs(jobs) {
  writeLocalValue(KEY, jobs)
}

export function createJob(input) {
  const jobs = listJobs()
  const next = [{ id: crypto.randomUUID(), ...input }, ...jobs]
  saveJobs(next)
  return next
}

export function updateJob(id, patch) {
  const next = listJobs().map((job) => job.id === id ? { ...job, ...patch } : job)
  saveJobs(next)
  return next
}

export function deleteJob(id) {
  const next = listJobs().filter((job) => job.id !== id)
  saveJobs(next)
  return next
}
