import { BookOpenCheck, FileCheck2, Mic2, Trophy } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../components/ui/Card.jsx'
import MetricCard from '../components/ui/MetricCard.jsx'
import Button from '../components/ui/Button.jsx'
import TrendChart from '../components/charts/TrendChart.jsx'
import Badge from '../components/ui/Badge.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { listActivity } from '../services/activityService.js'
import { activity as fallbackActivity, performanceData } from '../data/mockData.js'
import { getDashboardStats } from '../services/dashboardService.js'

const emptyStats = {
  metrics: {
    atsScore: 0,
    averageInterviewScore: 0,
    interviewsCompleted: 0,
    practiceQuestions: 0
  },
  trend: []
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user, profile, isConfigured } = useAuth()
  const [items, setItems] = useState(isConfigured ? [] : fallbackActivity)
  const [stats, setStats] = useState(isConfigured ? emptyStats : {
    metrics: {
      atsScore: 91,
      averageInterviewScore: 88,
      interviewsCompleted: 24,
      practiceQuestions: 146
    },
    trend: performanceData
  })

  useEffect(() => {
    listActivity(user?.id).then(setItems).catch(() => setItems(isConfigured ? [] : fallbackActivity))
    getDashboardStats(user?.id).then(setStats).catch(() => {})
  }, [isConfigured, user?.id])

  const hasActivity = items.length > 0

  return (
    <div className="grid gap-6">
      <section className="rounded-lg bg-gradient-to-br from-primary to-secondary p-6 text-white shadow-glow">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div><Badge className="bg-white/15 text-white">{isConfigured ? 'Live workspace' : 'Demo mode'}</Badge><h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">Ready for your next interview loop, {profile?.full_name?.split(' ')[0] || 'there'}?</h1><p className="mt-3 max-w-2xl text-violet-100">{isConfigured ? 'Your dashboard will fill up as you upload resumes, generate questions, and complete interviews.' : 'Your resume score and mock performance are trending up. Keep today focused on technical clarity and concise behavioral stories.'}</p></div>
          <Button variant="secondary" className="bg-white text-primary hover:bg-violet-50" onClick={() => navigate('/app/mock')}>Continue practice</Button>
        </div>
      </section>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={FileCheck2} label="ATS Score" value={stats.metrics.atsScore} trend={isConfigured ? 'Latest resume analysis' : '+12 points this month'} />
        <MetricCard icon={Trophy} label="Average Interview Score" value={stats.metrics.averageInterviewScore} trend={isConfigured ? 'Completed mock interviews' : '+8% from last week'} color="text-indigo-500" />
        <MetricCard icon={Mic2} label="Interviews Completed" value={stats.metrics.interviewsCompleted} trend={isConfigured ? 'Saved sessions' : '5 completed this week'} color="text-emerald-500" />
        <MetricCard icon={BookOpenCheck} label="Practice Questions" value={stats.metrics.practiceQuestions} trend={isConfigured ? 'Generated prompts' : '32 role-specific prompts'} color="text-amber-500" />
      </section>
      <section className="grid gap-6 xl:grid-cols-[1.6fr_.9fr]">
        <Card><div className="flex items-center justify-between gap-4"><div><h2 className="text-lg font-extrabold text-zinc-950 dark:text-white">Progress over time</h2><p className="text-sm text-zinc-500">ATS and interview performance trends</p></div><Badge color={isConfigured ? 'zinc' : 'emerald'}>{isConfigured ? 'Live data' : 'Improving'}</Badge></div><div className="mt-5"><TrendChart data={stats.trend} /></div></Card>
        <Card><h2 className="text-lg font-extrabold text-zinc-950 dark:text-white">Recent activity</h2><div className="mt-5 grid gap-4">{hasActivity ? items.map((item) => <div key={`${item.title}-${item.time}`} className="rounded-lg border border-zinc-200 p-4 dark:border-white/10"><div className="flex items-center justify-between gap-3"><Badge color="zinc">{item.type}</Badge><span className="text-xs font-semibold text-zinc-500">{item.time}</span></div><p className="mt-3 text-sm font-bold text-zinc-800 dark:text-zinc-100">{item.title}</p></div>) : <p className="rounded-lg border border-dashed border-zinc-200 p-4 text-sm font-medium text-zinc-500 dark:border-white/10 dark:text-zinc-400">No activity yet. Start a resume analysis or mock interview to create your first record.</p>}</div></Card>
      </section>
    </div>
  )
}
