import { CalendarCheck, Download, FileText, Mic, Wand2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import ProgressRing from '../components/ui/ProgressRing.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { getPracticePlan } from '../services/practicePlanService.js'
import { downloadTextFile } from '../utils/download.js'

export default function PracticePlanPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { pushToast } = useToast()
  const [plan, setPlan] = useState({ readinessScore: 0, focus: '', tasks: [] })

  useEffect(() => {
    getPracticePlan(user?.id).then(setPlan).catch(() => setPlan({ readinessScore: 0, focus: 'Could not load plan.', tasks: [] }))
  }, [user?.id])

  const downloadPlan = () => {
    const report = ['PrepPilot 7-Day Practice Plan', '', `Readiness: ${plan.readinessScore}`, `Focus: ${plan.focus}`, '', ...plan.tasks.map((task) => `${task.day}: ${task.title}\n${task.detail}\n`)].join('\n')
    downloadTextFile('preppilot-practice-plan.txt', report)
    pushToast('Practice plan downloaded.')
  }

  return (
    <div className="grid gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div><h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">Practice Plan</h1><p className="mt-2 text-zinc-500 dark:text-zinc-400">A focused 7-day plan based on your resume and interview performance.</p></div>
        <Button variant="outline" icon={Download} onClick={downloadPlan}>Download Plan</Button>
      </header>
      <section className="grid gap-6 xl:grid-cols-[.7fr_1.3fr]">
        <Card className="grid place-items-center text-center"><ProgressRing value={plan.readinessScore} label="Ready" /><h2 className="mt-5 text-xl font-extrabold text-zinc-950 dark:text-white">Readiness score</h2><p className="mt-2 text-sm text-zinc-500">{plan.focus}</p></Card>
        <Card><h2 className="text-lg font-extrabold text-zinc-950 dark:text-white">Next actions</h2><div className="mt-5 grid gap-3 sm:grid-cols-3"><Button icon={FileText} variant="outline" onClick={() => navigate('/app/resume')}>Resume Match</Button><Button icon={Wand2} variant="outline" onClick={() => navigate('/app/generator')}>Generate Set</Button><Button icon={Mic} variant="outline" onClick={() => navigate('/app/mock')}>Start Mock</Button></div></Card>
      </section>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {plan.tasks.map((task) => <Card key={task.day}><div className="flex items-center justify-between gap-3"><Badge>{task.day}</Badge><CalendarCheck className="h-5 w-5 text-primary" /></div><h2 className="mt-4 text-lg font-extrabold text-zinc-950 dark:text-white">{task.title}</h2><p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{task.detail}</p></Card>)}
      </section>
    </div>
  )
}
