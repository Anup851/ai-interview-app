import { history as demoHistory } from '../data/mockData.js'
import { isSupabaseConfigured, supabase } from '../lib/supabase.js'
import { createActivity } from './activityService.js'
import { assertUsageAllowed, trackUsage } from './usageService.js'

export async function listInterviews(userId) {
  if (!isSupabaseConfigured) return demoHistory
  if (!userId) return []
  const { data, error } = await supabase
    .from('mock_interviews')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data.map((item) => ({
    id: item.id,
    role: item.role,
    date: new Date(item.created_at).toLocaleDateString(),
    score: item.overall_score || 0,
    duration: `${Math.max(1, Math.round(item.duration_seconds / 60))} min`,
    status: item.status === 'needs_review' ? 'Needs review' : item.status === 'completed' ? 'Completed' : 'In progress'
  }))
}

export async function completeInterview({ userId, role, durationSeconds, transcript, questions, audioBlob }) {
  const transcriptText = Array.isArray(transcript) ? transcript.join('\n') : transcript
  let feedback = null

  if (!isSupabaseConfigured) {
    feedback = {
      overall_score: 88,
      communication_score: 86,
      technical_score: 91,
      confidence_score: 82,
      feedback_cards: [
        { title: 'Answer structure', text: 'Strong setup and tradeoff discussion.' },
        { title: 'Technical depth', text: 'Good practical examples with measurable outcomes.' }
      ],
      improvement_suggestions: ['Lead with the result.', 'Add one metric to each behavioral answer.']
    }
    return { score: feedback.overall_score, feedback }
  }

  if (!userId) return { score: null, feedback }
  await assertUsageAllowed(userId, 'mock_interview')

  let audioPath = null
  if (audioBlob?.size) {
    audioPath = `${userId}/${Date.now()}-${role.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-interview.webm`
    const upload = await supabase.storage.from('interview-audio').upload(audioPath, audioBlob, {
      contentType: audioBlob.type || 'audio/webm',
      upsert: false
    })
    if (upload.error) throw upload.error
  }

  try {
    const { data, error } = await supabase.functions.invoke('score-interview', {
      body: { role, transcript: transcriptText }
    })
    if (!error && data && !data.error) {
      feedback = {
        overall_score: Number(data.overall_score) || 0,
        communication_score: Number(data.communication_score) || 0,
        technical_score: Number(data.technical_score) || 0,
        confidence_score: Number(data.confidence_score) || 0,
        feedback_cards: Array.isArray(data.feedback_cards) ? data.feedback_cards : [],
        improvement_suggestions: Array.isArray(data.improvement_suggestions) ? data.improvement_suggestions : []
      }
    }
  } catch {
    feedback = null
  }

  const { data: interview, error } = await supabase
    .from('mock_interviews')
    .insert({
      user_id: userId,
      role,
      status: feedback ? 'completed' : 'needs_review',
      started_at: new Date(Date.now() - durationSeconds * 1000).toISOString(),
      completed_at: new Date().toISOString(),
      duration_seconds: durationSeconds,
      audio_path: audioPath,
      overall_score: feedback?.overall_score ?? null
    })
    .select('*')
    .single()
  if (error) throw error

  const answers = questions.map((question, index) => ({
    interview_id: interview.id,
    question,
    transcript: transcript[index] || transcript.join('\n'),
    answer_seconds: Math.round(durationSeconds / Math.max(1, questions.length)),
    position: index + 1
  }))
  await supabase.from('interview_answers').insert(answers)
  if (feedback) {
    await supabase.from('ai_feedback').insert({
      user_id: userId,
      interview_id: interview.id,
      ...feedback
    })
    await trackUsage(userId, 'feedback_report', { interview_id: interview.id })
  }
  await trackUsage(userId, 'mock_interview', { interview_id: interview.id, status: interview.status })
  await createActivity(userId, 'mock', `Completed mock interview for ${role}`, { interview_id: interview.id })
  return { score: feedback?.overall_score ?? null, interview, feedback }
}

export async function getLatestFeedback(userId) {
  if (!isSupabaseConfigured) {
    return {
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
  }
  if (!userId) return null

  const { data, error } = await supabase
    .from('ai_feedback')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data
}
