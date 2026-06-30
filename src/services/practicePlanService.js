import { isSupabaseConfigured, supabase } from '../lib/supabase.js'

const fallbackPlan = {
  readinessScore: 86,
  focus: 'Tighten technical stories and keep resume keywords aligned to target roles.',
  tasks: [
    { day: 'Day 1', title: 'Resume targeting', detail: 'Paste one job description and run a resume match.' },
    { day: 'Day 2', title: 'Question set', detail: 'Generate company-specific questions for your top role.' },
    { day: 'Day 3', title: 'Technical story', detail: 'Practice one project answer with metrics and tradeoffs.' },
    { day: 'Day 4', title: 'Behavioral story', detail: 'Prepare a conflict, failure, and leadership story.' },
    { day: 'Day 5', title: 'Mock interview', detail: 'Complete a timed mock and save the feedback report.' },
    { day: 'Day 6', title: 'Weak area drill', detail: 'Repeat the lowest-scoring feedback category.' },
    { day: 'Day 7', title: 'Final polish', detail: 'Download reports and rehearse concise opening answers.' }
  ]
}

function buildPlan({ atsScore = 0, interviewScore = 0, feedback = null }) {
  const signals = [atsScore, interviewScore].filter((score) => Number.isFinite(score) && score > 0)
  if (!signals.length) {
    return {
      readinessScore: 0,
      focus: 'Upload a resume or complete a mock interview to create an accurate practice plan.',
      tasks: [
        { day: 'Step 1', title: 'Scan a target resume', detail: 'Upload a PDF resume and paste a real job description for match scoring.' },
        { day: 'Step 2', title: 'Generate role questions', detail: 'Create a focused question set for the role, company, and difficulty level.' },
        { day: 'Step 3', title: 'Complete one mock', detail: 'Answer a timed mock interview so PrepPilot can identify weak areas.' }
      ]
    }
  }

  const readinessScore = Math.round(signals.reduce((sum, score) => sum + Math.max(score, 0), 0) / signals.length)
  const weakScores = feedback ? [
    { label: 'communication', value: feedback.communication_score || 0 },
    { label: 'technical depth', value: feedback.technical_score || 0 },
    { label: 'confidence', value: feedback.confidence_score || 0 }
  ].sort((a, b) => a.value - b.value) : []
  const weakest = weakScores[0]?.label || 'interview structure'

  return {
    readinessScore,
    focus: readinessScore >= 80
      ? `You are close. Focus on ${weakest} and company-specific practice.`
      : `Build consistency first: improve resume targeting and ${weakest}.`,
    tasks: [
      { day: 'Day 1', title: 'Target one job', detail: 'Paste the job description into Resume Analysis and note missing keywords.' },
      { day: 'Day 2', title: 'Rewrite proof points', detail: 'Update 3 resume bullets with metrics, scope, and business impact.' },
      { day: 'Day 3', title: 'Generate focused questions', detail: 'Create a company and difficulty-specific question set.' },
      { day: 'Day 4', title: 'Drill weak area', detail: `Practice answers that strengthen ${weakest}.` },
      { day: 'Day 5', title: 'Timed mock', detail: 'Complete a full mock interview and submit it for scoring.' },
      { day: 'Day 6', title: 'Story bank', detail: 'Save your best technical, leadership, and failure stories from history.' },
      { day: 'Day 7', title: 'Final report review', detail: 'Download your resume and interview reports before applying.' }
    ]
  }
}

export async function getPracticePlan(userId) {
  if (!isSupabaseConfigured) return fallbackPlan
  if (!userId) return { readinessScore: 0, focus: 'Add activity to unlock a plan.', tasks: [] }

  const [resumeResult, interviewResult, feedbackResult] = await Promise.all([
    supabase
      .from('resume_analyses')
      .select('ats_score, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('mock_interviews')
      .select('overall_score, created_at')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('ai_feedback')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
  ])

  if (resumeResult.error) throw resumeResult.error
  if (interviewResult.error) throw interviewResult.error
  if (feedbackResult.error) throw feedbackResult.error

  return buildPlan({
    atsScore: resumeResult.data?.ats_score || 0,
    interviewScore: interviewResult.data?.overall_score || 0,
    feedback: feedbackResult.data
  })
}
