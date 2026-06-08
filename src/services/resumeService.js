import { strengths, suggestions, weaknesses } from '../data/mockData.js'
import { isSupabaseConfigured, supabase } from '../lib/supabase.js'
import { createActivity } from './activityService.js'

export async function uploadResumeAndAnalyze({ userId, file }) {
  if (!file) throw new Error('Choose a PDF resume.')
  if (file.type !== 'application/pdf') throw new Error('Please upload a PDF resume.')

  const demoAnalysis = {
    ats_score: 91,
    strengths,
    weaknesses,
    suggestions,
    keyword_matches: { react: true, leadership: true, accessibility: true },
    raw_summary: 'Strong resume with measurable frontend impact and clear ownership.'
  }

  if (!isSupabaseConfigured) return { resume: { file_name: file.name }, analysis: demoAnalysis }
  if (!userId) throw new Error('You must be signed in to upload a resume.')

  const filePath = `${userId}/${Date.now()}-${file.name}`
  const upload = await supabase.storage.from('resumes').upload(filePath, file, { upsert: false })
  if (upload.error) throw upload.error

  await supabase.from('resumes').update({ is_active: false }).eq('user_id', userId)
  const { data: resume, error: resumeError } = await supabase
    .from('resumes')
    .insert({
      user_id: userId,
      file_name: file.name,
      file_path: filePath,
      file_size: file.size,
      mime_type: file.type,
      is_active: true
    })
    .select('*')
    .single()
  if (resumeError) throw resumeError

  const analysis = {
    ats_score: 0,
    strengths: [],
    weaknesses: [],
    suggestions: [],
    keyword_matches: {},
    raw_summary: 'Resume uploaded. Analysis will appear when resume text extraction is connected.'
  }
  const { data: savedAnalysis, error: analysisError } = await supabase
    .from('resume_analyses')
    .insert({ user_id: userId, resume_id: resume.id, ...analysis })
    .select('*')
    .single()
  if (analysisError) throw analysisError

  await createActivity(userId, 'resume', `Uploaded ${resume.file_name}`, { resume_id: resume.id })
  return { resume, analysis: savedAnalysis }
}

export async function getActiveResume(userId) {
  if (!isSupabaseConfigured || !userId) return null
  const { data, error } = await supabase
    .from('resumes')
    .select('*, resume_analyses(*)')
    .eq('user_id', userId)
    .eq('is_active', true)
    .maybeSingle()
  if (error) throw error
  return data
}
