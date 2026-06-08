import { Download, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import Card from '../components/ui/Card.jsx'
import Input from '../components/ui/Input.jsx'
import Select from '../components/ui/Select.jsx'
import Button from '../components/ui/Button.jsx'
import Badge from '../components/ui/Badge.jsx'
import Modal from '../components/ui/Modal.jsx'
import { history as fallbackHistory } from '../data/mockData.js'
import { useToast } from '../context/ToastContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { listInterviews } from '../services/interviewService.js'
import { downloadTextFile } from '../utils/download.js'

export default function HistoryPage() {
  const [query, setQuery] = useState('')
  const [role, setRole] = useState('All roles')
  const [sort, setSort] = useState('Newest first')
  const [selected, setSelected] = useState(null)
  const { user, isConfigured } = useAuth()
  const [records, setRecords] = useState(isConfigured ? [] : fallbackHistory)
  const { pushToast } = useToast()

  useEffect(() => {
    listInterviews(user?.id).then(setRecords).catch(() => setRecords(isConfigured ? [] : fallbackHistory))
  }, [isConfigured, user?.id])

  const filtered = useMemo(() => {
    return records
      .filter((item) => role === 'All roles' || item.role.includes(role))
      .filter((item) => item.role.toLowerCase().includes(query.toLowerCase()) || item.status.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => {
        if (sort === 'Highest score') return b.score - a.score
        if (sort === 'Oldest first') return new Date(a.date) - new Date(b.date)
        return new Date(b.date) - new Date(a.date)
      })
  }, [records, query, role, sort])

  const downloadReport = (item) => {
    const report = `PrepPilot Interview Report\n\nRole: ${item.role}\nDate: ${item.date}\nScore: ${item.score}\nDuration: ${item.duration}\nStatus: ${item.status}`
    downloadTextFile(`${item.role.replaceAll(' ', '-')}-report.txt`, report)
    pushToast('Report downloaded.')
  }

  return (
    <div className="grid gap-6">
      <header><h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">Interview History</h1><p className="mt-2 text-zinc-500 dark:text-zinc-400">Search past sessions, filter by role/date, and download detailed reports.</p></header>
      <Card><div className="grid gap-4 lg:grid-cols-[1fr_220px_220px]"><Input icon={Search} placeholder="Search interviews" value={query} onChange={(event) => setQuery(event.target.value)} /><Select value={role} onChange={(event) => setRole(event.target.value)}><option>All roles</option><option>Frontend Engineer</option><option>Product Manager</option><option>Data Analyst</option><option>Backend Engineer</option></Select><Select value={sort} onChange={(event) => setSort(event.target.value)}><option>Newest first</option><option>Highest score</option><option>Oldest first</option></Select></div></Card>
      <Card className="overflow-hidden p-0"><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-wider text-zinc-500 dark:border-white/10 dark:bg-white/5"><tr><th className="px-5 py-4">Role</th><th className="px-5 py-4">Date</th><th className="px-5 py-4">Score</th><th className="px-5 py-4">Duration</th><th className="px-5 py-4">Status</th><th className="px-5 py-4 text-right">Report</th></tr></thead><tbody className="divide-y divide-zinc-200 dark:divide-white/10">{filtered.map((item) => <tr key={`${item.role}-${item.date}`} className="hover:bg-zinc-50 dark:hover:bg-white/5"><td className="px-5 py-4"><button onClick={() => setSelected(item)} className="font-bold text-zinc-950 underline-offset-4 hover:text-primary hover:underline dark:text-white">{item.role}</button></td><td className="px-5 py-4 text-zinc-500">{item.date}</td><td className="px-5 py-4 font-extrabold text-primary">{item.score}</td><td className="px-5 py-4 text-zinc-500">{item.duration}</td><td className="px-5 py-4"><Badge color={item.status === 'Completed' ? 'emerald' : 'amber'}>{item.status}</Badge></td><td className="px-5 py-4 text-right"><Button size="sm" variant="outline" icon={Download} onClick={() => downloadReport(item)}>Download</Button></td></tr>)}</tbody></table>{filtered.length === 0 ? <p className="p-5 text-sm font-medium text-zinc-500 dark:text-zinc-400">No interviews found for this user yet.</p> : null}</div></Card>
      <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title="Interview report">
        {selected ? <div className="grid gap-3 text-sm text-zinc-600 dark:text-zinc-300"><p><strong className="text-zinc-950 dark:text-white">Role:</strong> {selected.role}</p><p><strong className="text-zinc-950 dark:text-white">Score:</strong> {selected.score}</p><p><strong className="text-zinc-950 dark:text-white">Status:</strong> {selected.status}</p><Button icon={Download} onClick={() => downloadReport(selected)}>Download report</Button></div> : null}
      </Modal>
    </div>
  )
}
