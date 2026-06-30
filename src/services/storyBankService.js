import { isSupabaseConfigured, supabase } from '../lib/supabase.js'

const fallbackStories = [
  {
    id: 'demo-1',
    role: 'Frontend Engineer',
    date: 'Jun 2, 2026',
    question: 'Tell me about a complex technical problem.',
    transcript: 'I improved a React dashboard by profiling render bottlenecks, splitting expensive components, and measuring a 35% speed improvement.',
    answer_seconds: 92
  }
]

export async function listAnswerStories(userId) {
  if (!isSupabaseConfigured) return fallbackStories
  if (!userId) return []

  const { data, error } = await supabase
    .from('interview_answers')
    .select('id, question, transcript, answer_seconds, position, created_at, mock_interviews(role, overall_score, created_at)')
    .order('created_at', { ascending: false })
    .limit(40)
  if (error) throw error

  return (data || [])
    .filter((item) => item.transcript)
    .map((item) => ({
      id: item.id,
      role: item.mock_interviews?.role || 'Mock interview',
      score: item.mock_interviews?.overall_score || 0,
      date: new Date(item.created_at).toLocaleDateString(),
      question: item.question,
      transcript: item.transcript,
      answer_seconds: item.answer_seconds
    }))
}
