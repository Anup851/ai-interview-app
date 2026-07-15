import { ArrowRight, BookOpenCheck, CalendarCheck, CheckCircle2, FileCheck2, Flame, Mic2, Trophy } from 'lucide-react'
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
import { completeToday, getStreak, isTodayComplete, setDailyGoal, streakCount } from '../services/streakService.js'

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
  const [streakState, setStreakState] = useState({ completedDates: [], goal: 'Finish one prep action today' })
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
    if (!user?.id) {
      setStreakState({ completedDates: [], goal: 'Finish one prep action today' })
      return
    }
    getStreak(user.id).then(setStreakState).catch(() => setStreakState({ completedDates: [], goal: 'Finish one prep action today' }))
  }, [isConfigured, user?.id])

  const hasActivity = items.length > 0
  const dailyDone = isTodayComplete(streakState)
  const currentStreak = streakCount(streakState)
  const hasLiveSignal = stats.metrics.atsScore > 0 || stats.metrics.averageInterviewScore > 0 || stats.metrics.interviewsCompleted > 0 || stats.metrics.practiceQuestions > 0
  const nextAction = !hasLiveSignal
    ? { title: 'Create your first prep signal', detail: 'Upload a resume or generate a question set so the workspace can give useful guidance.', to: '/app/resume' }
    : stats.metrics.atsScore > 0 && stats.metrics.atsScore < 70
      ? { title: 'Improve resume match', detail: 'Run a JD-based resume scan before your next application.', to: '/app/resume' }
      : stats.metrics.practiceQuestions < 6
        ? { title: 'Generate targeted questions', detail: 'Create a company-specific question set for your target role.', to: '/app/generator' }
        : stats.metrics.interviewsCompleted < 1
          ? { title: 'Complete your first mock', detail: 'Submit a timed mock interview and save feedback.', to: '/app/mock' }
          : { title: 'Follow your practice plan', detail: 'Use the 7-day plan to focus the next prep cycle.', to: '/app/plan' }
  const workspaceSummary = hasLiveSignal
    ? 'Your dashboard is using saved resume, question, and interview activity to recommend the next useful step.'
    : 'Start with a resume scan or role-specific question set. The dashboard becomes more specific as real activity is saved.'

  return (
    <div className="grid gap-6">
      <section className="rounded-lg bg-gradient-to-br from-primary to-secondary p-6 text-white shadow-glow">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div><Badge className="bg-white/15 text-white">{isConfigured ? 'Live workspace' : 'Demo mode'}</Badge><h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">Ready for your next interview loop, {profile?.full_name?.split(' ')[0] || 'there'}?</h1><p className="mt-3 max-w-2xl text-violet-100">{isConfigured ? workspaceSummary : 'Demo data shows how PrepPilot connects resume score, question practice, mock interviews, and feedback into one prep loop.'}</p></div>
          <Button variant="secondary" className="bg-white text-primary hover:bg-violet-50" onClick={() => navigate('/app/mock')}>Continue practice</Button>
        </div>
      </section>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={FileCheck2} label="ATS Score" value={stats.metrics.atsScore} trend={isConfigured ? 'Latest resume analysis' : '+12 points this month'} />
        <MetricCard icon={Trophy} label="Average Interview Score" value={stats.metrics.averageInterviewScore} trend={isConfigured ? 'Completed mock interviews' : '+8% from last week'} color="text-indigo-500" />
        <MetricCard icon={Mic2} label="Interviews Completed" value={stats.metrics.interviewsCompleted} trend={isConfigured ? 'Saved sessions' : '5 completed this week'} color="text-emerald-500" />
        <MetricCard icon={BookOpenCheck} label="Practice Questions" value={stats.metrics.practiceQuestions} trend={isConfigured ? 'Generated prompts' : '32 role-specific prompts'} color="text-amber-500" />
      </section>
      <section className="grid gap-4 lg:grid-cols-[1fr_auto]">
        <Card><div className="flex items-start gap-4"><div className="grid h-11 w-11 place-items-center rounded-lg bg-violet-50 text-primary dark:bg-violet-500/15"><CalendarCheck className="h-5 w-5" /></div><div><h2 className="text-lg font-extrabold text-zinc-950 dark:text-white">{nextAction.title}</h2><p className="mt-1 text-sm text-zinc-500">{nextAction.detail}</p></div></div></Card>
        <Button icon={ArrowRight} onClick={() => navigate(nextAction.to)}>Next Best Action</Button>
      </section>
      <section className="grid gap-4 lg:grid-cols-[1fr_.8fr]">
        <Card><div className="flex items-start gap-4"><div className="grid h-11 w-11 place-items-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-500/15"><Flame className="h-5 w-5" /></div><div className="flex-1"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-extrabold text-zinc-950 dark:text-white">Daily prep streak</h2><Badge color={dailyDone ? 'emerald' : 'amber'}>{currentStreak} day streak</Badge></div><input className="mt-3 h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-900 outline-none transition focus:border-primary focus:ring-4 focus:ring-violet-500/10 dark:border-white/10 dark:bg-zinc-950 dark:text-white" value={streakState.goal} onChange={async (event) => { const next = await setDailyGoal(user?.id, event.target.value); setStreakState(next) }} /><Button className="mt-3" variant={dailyDone ? 'secondary' : 'outline'} icon={CheckCircle2} onClick={async () => { const next = await completeToday(user?.id); setStreakState(next) }}>{dailyDone ? 'Completed Today' : 'Mark Today Done'}</Button></div></div></Card>
        <Card><h2 className="text-lg font-extrabold text-zinc-950 dark:text-white">Real usage loop</h2><p className="mt-2 text-sm leading-6 text-zinc-500">Track jobs, generate targeted questions, run mocks, save stories, and drill weak areas before each interview.</p><Button className="mt-4" variant="outline" onClick={() => navigate('/app/jobs')}>Open Job Tracker</Button></Card>
      </section>
      <section className="grid gap-6 xl:grid-cols-[1.6fr_.9fr]">
        <Card><div className="flex items-center justify-between gap-4"><div><h2 className="text-lg font-extrabold text-zinc-950 dark:text-white">Progress over time</h2><p className="text-sm text-zinc-500">ATS and interview performance trends</p></div><Badge color={isConfigured ? 'zinc' : 'emerald'}>{isConfigured ? 'Live data' : 'Improving'}</Badge></div><div className="mt-5"><TrendChart data={stats.trend} /></div></Card>
        <Card><h2 className="text-lg font-extrabold text-zinc-950 dark:text-white">Recent activity</h2><div className="mt-5 grid gap-4">{hasActivity ? items.map((item) => <div key={item.id} className="rounded-lg border border-zinc-200 p-4 dark:border-white/10"><div className="flex items-center justify-between gap-3"><Badge color="zinc">{item.type}</Badge><span className="text-xs font-semibold text-zinc-500">{item.time}</span></div><p className="mt-3 text-sm font-bold text-zinc-800 dark:text-zinc-100">{item.title}</p></div>) : <p className="rounded-lg border border-dashed border-zinc-200 p-4 text-sm font-medium text-zinc-500 dark:border-white/10 dark:text-zinc-400">No activity yet. Start a resume analysis or mock interview to create your first record.</p>}</div></Card>
      </section>
    </div>
  )
}
