import { BriefcaseBusiness, CalendarDays, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import Card from '../components/ui/Card.jsx'
import Input from '../components/ui/Input.jsx'
import Select from '../components/ui/Select.jsx'
import Button from '../components/ui/Button.jsx'
import Badge from '../components/ui/Badge.jsx'
import { createJob, deleteJob, listJobs, updateJob } from '../services/jobTrackerService.js'

const stages = ['Wishlist', 'Applied', 'Screen', 'Interview', 'Offer', 'Rejected']

export default function JobTrackerPage() {
  const [jobs, setJobs] = useState(listJobs)
  const [form, setForm] = useState({ company: '', role: '', stage: 'Applied', date: '', notes: '' })
  const grouped = useMemo(() => stages.map((stage) => ({ stage, jobs: jobs.filter((job) => job.stage === stage) })), [jobs])

  const addJob = () => {
    if (!form.company.trim() || !form.role.trim()) return
    setJobs(createJob(form))
    setForm({ company: '', role: '', stage: 'Applied', date: '', notes: '' })
  }

  return (
    <div className="grid gap-6">
      <header><h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">Job Tracker</h1><p className="mt-2 text-zinc-500 dark:text-zinc-400">Track applications and connect prep work to real interview targets.</p></header>
      <Card>
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr_160px_180px]"><Input label="Company" value={form.company} onChange={(event) => setForm({ ...form, company: event.target.value })} /><Input label="Role" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} /><Select label="Stage" value={form.stage} onChange={(event) => setForm({ ...form, stage: event.target.value })}>{stages.map((stage) => <option key={stage}>{stage}</option>)}</Select><Input label="Next date" type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} /></div>
        <textarea className="mt-4 min-h-24 w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-900 outline-none transition focus:border-primary focus:ring-4 focus:ring-violet-500/10 dark:border-white/10 dark:bg-zinc-950 dark:text-white" placeholder="Prep notes, recruiter info, job link, or follow-up reminders" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
        <Button className="mt-4" icon={BriefcaseBusiness} onClick={addJob}>Add Application</Button>
      </Card>
      <section className="grid gap-4 xl:grid-cols-3">
        {grouped.map((group) => <Card key={group.stage}><div className="flex items-center justify-between"><h2 className="text-lg font-extrabold text-zinc-950 dark:text-white">{group.stage}</h2><Badge color="zinc">{group.jobs.length}</Badge></div><div className="mt-4 grid gap-3">{group.jobs.length ? group.jobs.map((job) => <div key={job.id} className="rounded-lg border border-zinc-200 p-3 dark:border-white/10"><div className="flex items-start justify-between gap-3"><div><p className="font-bold text-zinc-950 dark:text-white">{job.company}</p><p className="text-sm text-zinc-500">{job.role}</p></div><button className="text-zinc-400 hover:text-rose-500" onClick={() => setJobs(deleteJob(job.id))} aria-label="Delete job"><Trash2 className="h-4 w-4" /></button></div>{job.date ? <p className="mt-3 flex items-center gap-2 text-xs font-bold text-zinc-500"><CalendarDays className="h-4 w-4" />{job.date}</p> : null}<p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{job.notes || 'No notes yet.'}</p><Select className="mt-3" value={job.stage} onChange={(event) => setJobs(updateJob(job.id, { stage: event.target.value }))}>{stages.map((stage) => <option key={stage}>{stage}</option>)}</Select></div>) : <p className="rounded-lg border border-dashed border-zinc-200 p-3 text-sm font-medium text-zinc-500 dark:border-white/10 dark:text-zinc-400">No applications here.</p>}</div></Card>)}
      </section>
    </div>
  )
}
