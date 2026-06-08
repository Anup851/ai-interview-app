import { strengths, suggestions, weaknesses } from '../data/mockData.js'
import { isSupabaseConfigured, supabase } from '../lib/supabase.js'
import { createActivity } from './activityService.js'
import { assertUsageAllowed, trackUsage } from './usageService.js'
import { extractPdfText } from '../utils/pdfText.js'

function normalizeAnalysis(data) {
  return {
    ats_score: Math.max(0, Math.min(100, Number(data?.ats_score) || 0)),
    strengths: Array.isArray(data?.strengths) ? data.strengths : [],
    weaknesses: Array.isArray(data?.weaknesses) ? data.weaknesses : [],
    suggestions: Array.isArray(data?.suggestions) ? data.suggestions : [],
    keyword_matches: data?.keyword_matches && typeof data.keyword_matches === 'object' ? data.keyword_matches : {},
    raw_summary: data?.raw_summary || data?.summary || ''
  }
}

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
  await assertUsageAllowed(userId, 'resume_analysis')

  const extractedText = await extractPdfText(file)
  if (!extractedText || extractedText.length < 80) {
    throw new Error('Could not read enough text from this PDF. Try a text-based resume PDF instead of a scanned image.')
  }

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
      extracted_text: extractedText,
      is_active: true
    })
    .select('*')
    .single()
  if (resumeError) throw resumeError

  let analysis = null
  let status = 'completed'

  const { data: profile } = await supabase
    .from('profiles')
    .select('target_role')
    .eq('id', userId)
    .maybeSingle()

  const { data: aiData, error: aiError } = await supabase.functions.invoke('analyze-resume', {
    body: {
      resumeText: extractedText,
      targetRole: profile?.target_role || 'Software Engineer'
    }
  })

  if (aiError || aiData?.error) {
    status = 'failed'
    analysis = {
      ats_score: 0,
      strengths: [],
      weaknesses: [],
      suggestions: [aiData?.error || aiError?.message || 'Resume analysis could not be completed.'],
      keyword_matches: {},
      raw_summary: 'Resume uploaded, but AI analysis failed.'
    }
  } else {
    analysis = normalizeAnalysis(aiData)
  }

  const { data: savedAnalysis, error: analysisError } = await supabase
    .from('resume_analyses')
    .insert({ user_id: userId, resume_id: resume.id, status, ...analysis })
    .select('*')
    .single()
  if (analysisError) throw analysisError

  await trackUsage(userId, 'resume_analysis', { resume_id: resume.id, status })
  await createActivity(
    userId,
    'resume',
    status === 'completed' ? `Resume analyzed with ATS score ${savedAnalysis.ats_score}` : `Uploaded ${resume.file_name}`,
    { resume_id: resume.id, analysis_id: savedAnalysis.id, status }
  )
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
