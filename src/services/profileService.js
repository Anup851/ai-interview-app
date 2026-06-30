import { isSupabaseConfigured, supabase } from '../lib/supabase.js'
import { createActivity } from './activityService.js'

function isPdf(file) {
  return file?.type === 'application/pdf' || file?.name?.toLowerCase().endsWith('.pdf')
}

export async function uploadProfileResume({ userId, file }) {
  if (!file) return null
  if (!isPdf(file)) throw new Error('Please upload a PDF resume.')
  if (!isSupabaseConfigured || !userId) return { file_name: file.name }

  const filePath = `${userId}/${Date.now()}-${file.name}`
  const upload = await supabase.storage.from('resumes').upload(filePath, file)
  if (upload.error) throw upload.error
  await supabase.from('resumes').update({ is_active: false }).eq('user_id', userId)
  const { data, error } = await supabase.from('resumes').insert({
    user_id: userId,
    file_name: file.name,
    file_path: filePath,
    file_size: file.size,
    mime_type: file.type,
    is_active: true
  }).select('*').single()
  if (error) throw error
  await createActivity(userId, 'profile', 'Uploaded a new active resume', { resume_id: data.id })
  return data
}
