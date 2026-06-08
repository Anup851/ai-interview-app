import { performanceData } from '../data/mockData.js'
import { isSupabaseConfigured, supabase } from '../lib/supabase.js'

const monthLabel = new Intl.DateTimeFormat(undefined, { month: 'short' })
const emptyMetrics = {
  atsScore: 0,
  averageInterviewScore: 0,
  interviewsCompleted: 0,
  practiceQuestions: 0
}

function monthKey(dateValue) {
  const date = new Date(dateValue)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function buildTrend(resumeAnalyses, interviews) {
  const months = []
  const now = new Date()
  for (let index = 5; index >= 0; index -= 1) {
    months.push(new Date(now.getFullYear(), now.getMonth() - index, 1))
  }

  return months.map((month) => {
    const key = monthKey(month)
    const atsRows = resumeAnalyses.filter((item) => monthKey(item.created_at) === key)
    const interviewRows = interviews.filter((item) => monthKey(item.created_at) === key)
    const average = (rows, field) => rows.length ? Math.round(rows.reduce((sum, item) => sum + (item[field] || 0), 0) / rows.length) : null

    return {
      month: monthLabel.format(month),
      ats: average(atsRows, 'ats_score') ?? 0,
      interview: average(interviewRows, 'overall_score') ?? 0
    }
  })
}

export async function getDashboardStats(userId) {
  if (!isSupabaseConfigured) {
    return {
      metrics: {
        atsScore: 91,
        averageInterviewScore: 88,
        interviewsCompleted: 24,
        practiceQuestions: 146
      },
      trend: performanceData
    }
  }

  if (!userId) return { metrics: emptyMetrics, trend: buildTrend([], []) }

  const resumeQuery = supabase
    .from('resume_analyses')
    .select('ats_score, status, created_at')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })

  let [resumeResult, interviewResult, questionResult] = await Promise.all([
    resumeQuery,
    supabase
      .from('mock_interviews')
      .select('overall_score, status, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
    supabase
      .from('question_sets')
      .select('id, generated_questions(id)')
      .eq('user_id', userId)
  ])

  if (resumeResult.error?.code === '42703' || resumeResult.error?.message?.includes('status')) {
    resumeResult = await supabase
      .from('resume_analyses')
      .select('ats_score, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
  }

  if (resumeResult.error) throw resumeResult.error
  if (interviewResult.error) throw interviewResult.error
  if (questionResult.error) throw questionResult.error

  const resumeAnalyses = resumeResult.data || []
  const interviews = (interviewResult.data || []).filter((item) => item.status === 'completed')
  const questionCount = (questionResult.data || []).reduce((total, set) => total + (set.generated_questions?.length || 0), 0)
  const scoredInterviews = interviews.filter((item) => Number.isFinite(item.overall_score))
  const averageInterviewScore = scoredInterviews.length
    ? Math.round(scoredInterviews.reduce((sum, item) => sum + item.overall_score, 0) / scoredInterviews.length)
    : 0

  return {
    metrics: {
      atsScore: resumeAnalyses[0]?.ats_score || 0,
      averageInterviewScore,
      interviewsCompleted: interviews.length,
      practiceQuestions: questionCount
    },
    trend: buildTrend(resumeAnalyses, scoredInterviews)
  }
}
