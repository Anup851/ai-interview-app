import { Lightbulb, MessageSquareText, TrendingUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import Card from '../components/ui/Card.jsx'
import ProgressRing from '../components/ui/ProgressRing.jsx'
import Badge from '../components/ui/Badge.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { getLatestFeedback } from '../services/interviewService.js'

const fallbackFeedback = {
  overall_score: 88,
  communication_score: 86,
  technical_score: 91,
  confidence_score: 82,
  feedback_cards: [
    { title: 'Answer structure', text: 'Most answers used context, action, and result. Lead with the result for senior audiences.' },
    { title: 'Technical clarity', text: 'You explained tradeoffs clearly and tied decisions to user impact and system constraints.' },
    { title: 'Improvements', text: 'Prepare two concise failure stories and add stronger closing summaries to design answers.' }
  ],
  improvement_suggestions: [
    'Use a 20-second headline before detailed examples.',
    'Add metrics to behavioral stories when possible.',
    'Pause after each answer and invite a follow-up question.'
  ]
}

export default function FeedbackPage() {
  const { user, isConfigured } = useAuth()
  const [feedback, setFeedback] = useState(isConfigured ? null : fallbackFeedback)

  useEffect(() => {
    getLatestFeedback(user?.id).then((data) => {
      setFeedback(data || (isConfigured ? null : fallbackFeedback))
    }).catch(() => setFeedback(isConfigured ? null : fallbackFeedback))
  }, [isConfigured, user?.id])

  const visibleFeedback = feedback || {
    overall_score: 0,
    communication_score: 0,
    technical_score: 0,
    confidence_score: 0,
    feedback_cards: [],
    improvement_suggestions: []
  }

  const scores = [
    { label: 'Communication', value: visibleFeedback.communication_score || 0 },
    { label: 'Technical', value: visibleFeedback.technical_score || 0 },
    { label: 'Confidence', value: visibleFeedback.confidence_score || 0 }
  ]
  const cards = visibleFeedback.feedback_cards?.length ? visibleFeedback.feedback_cards : []
  const suggestions = visibleFeedback.improvement_suggestions?.length ? visibleFeedback.improvement_suggestions : []

  return (
    <div className="grid gap-6">
      <header><h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">AI Feedback</h1><p className="mt-2 text-zinc-500 dark:text-zinc-400">Detailed scoring from your latest mock interview.</p></header>
      <section className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
        <Card className="grid place-items-center text-center"><ProgressRing value={visibleFeedback.overall_score || 0} label="Overall" /><h2 className="mt-5 text-xl font-extrabold">{feedback ? 'Latest interview score' : 'No feedback yet'}</h2><p className="mt-2 text-sm text-zinc-500">{feedback ? 'Scores from your latest saved mock interview.' : 'Complete a mock interview to generate feedback for this account.'}</p></Card>
        <div className="grid gap-4 sm:grid-cols-3">{scores.map((score) => <Card key={score.label}><p className="text-sm font-medium text-zinc-500">{score.label} Score</p><p className="mt-2 text-3xl font-extrabold text-zinc-950 dark:text-white">{score.value}</p><div className="mt-4 h-2 rounded-full bg-zinc-100 dark:bg-white/10"><div className="h-2 rounded-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${score.value}%` }} /></div></Card>)}</div>
      </section>
      <section className="grid gap-4 lg:grid-cols-3">{cards.length ? cards.map((card, index) => <FeedbackCard key={card.title} icon={[MessageSquareText, TrendingUp, Lightbulb][index] || Lightbulb} title={card.title} text={card.text} />) : <Card className="lg:col-span-3"><p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">No feedback cards for this user yet.</p></Card>}</section>
      <Card><h2 className="text-lg font-extrabold">Improvement suggestions</h2><div className="mt-4 grid gap-3">{suggestions.length ? suggestions.map((item) => <p key={item} className="rounded-lg bg-zinc-50 p-3 text-sm font-semibold text-zinc-700 dark:bg-white/5 dark:text-zinc-200">{item}</p>) : <p className="rounded-lg border border-dashed border-zinc-200 p-3 text-sm font-medium text-zinc-500 dark:border-white/10 dark:text-zinc-400">No suggestions yet.</p>}</div></Card>
    </div>
  )
}

function FeedbackCard({ icon: Icon, title, text }) {
  return <Card><Icon className="h-5 w-5 text-primary" /><h2 className="mt-4 text-lg font-extrabold text-zinc-950 dark:text-white">{title}</h2><p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{text}</p></Card>
}
