import { isSupabaseConfigured, supabase } from '../lib/supabase.js'
import { createActivity } from './activityService.js'
import { assertUsageAllowed, trackUsage } from './usageService.js'

const normalizeExperience = {
  'Entry-level': 'entry',
  'Mid-level': 'mid',
  Senior: 'senior',
  Lead: 'lead'
}

const normalizeStyle = {
  Balanced: 'balanced',
  'Technical deep dive': 'technical',
  Behavioral: 'behavioral',
  'System design': 'system_design'
}

export async function generateQuestions({ userId, role, level, style, skills, company = '', difficulty = 'Standard' }) {
  if (!role.trim()) throw new Error('Add a job role before generating questions.')

  let generated = [
    `For a ${level.toLowerCase()} ${role}${company ? ` at ${company}` : ''}, explain how you would approach a ${style.toLowerCase()} interview question involving ${skills.join(', ') || 'core role skills'}.`,
    `What is the most complex ${skills[0] || 'technical'} problem you solved, and what tradeoffs did you consider?`,
    `Tell me about a time you used ${skills[1] || 'collaboration'} to improve business or product outcomes.`,
    `Design a practical roadmap for your first 30 days as a ${role}.`,
    `What signals would prove you are ready for the next level in this ${role} role?`
  ]

  if (!isSupabaseConfigured) return generated
  if (!userId) throw new Error('You must be signed in to generate questions.')
  await assertUsageAllowed(userId, 'question_generation')

  const { data, error } = await supabase.functions.invoke('generate-questions', {
    body: { role, level, style, skills, company, difficulty }
  })
  if (error || data?.error) throw new Error(data?.error || error?.message || 'Question generation failed.')
  if (!data?.questions?.length) throw new Error('No questions were generated.')
  generated = data.questions

  const { data: set, error: setError } = await supabase
    .from('question_sets')
    .insert({
      user_id: userId,
      job_role: role,
      experience: normalizeExperience[level] || 'senior',
      style: normalizeStyle[style] || 'balanced',
      skills
    })
    .select('*')
    .single()
  if (setError) throw setError

  const rows = generated.map((question, index) => ({
    question_set_id: set.id,
    position: index + 1,
    question,
    category: normalizeStyle[style] || 'general',
    expected_signals: skills
  }))
  const { error: questionError } = await supabase.from('generated_questions').insert(rows)
  if (questionError) throw questionError
  await trackUsage(userId, 'question_generation', { question_set_id: set.id, role, company, difficulty })
  await createActivity(userId, 'generator', `Generated ${generated.length} ${role} questions${company ? ` for ${company}` : ''}`, { question_set_id: set.id, company, difficulty })
  return generated
}

export async function getLatestQuestionSet(userId) {
  if (!isSupabaseConfigured || !userId) return null

  const { data: sets, error: setError } = await supabase
    .from('question_sets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
  if (setError) throw setError
  if (!sets?.length) return null

  const { data, error } = await supabase
    .from('generated_questions')
    .select('question, position')
    .eq('question_set_id', sets[0].id)
    .order('position', { ascending: true })
  if (error) throw error

  return { ...sets[0], questions: data.map((item) => item.question) }
}

export async function listLatestQuestions(userId) {
  const set = await getLatestQuestionSet(userId)
  return set?.questions || []
}
