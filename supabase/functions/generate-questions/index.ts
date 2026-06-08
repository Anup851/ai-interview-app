import { corsHeaders, jsonResponse } from '../_shared/cors.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

async function requireUser(req: Request) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
  const client = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: req.headers.get('Authorization') || '' } }
  })
  const { data, error } = await client.auth.getUser()
  if (error || !data.user) return null
  return data.user
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405)

  try {
    const user = await requireUser(req)
    if (!user) return jsonResponse({ error: 'Not authenticated' }, 401)

    const { role, level, style, skills = [] } = await req.json()
    if (!role) return jsonResponse({ error: 'Missing role' }, 400)

    const prompt = `Generate 6 practical interview questions for a ${level} ${role}. Style: ${style}. Skills: ${skills.join(', ')}. Include a mix of technical depth, behavioral evidence, tradeoffs, and role-specific scenarios.`
    const apiKey = Deno.env.get('OPENAI_API_KEY')

    if (!apiKey) return jsonResponse({ error: 'OPENAI_API_KEY is not configured' }, 503)

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [
          { role: 'system', content: 'Return only valid JSON with a questions string array. Questions should be specific, realistic, and useful for mock interview practice.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      })
    })

    const data = await response.json()
    if (!response.ok) return jsonResponse({ error: data.error?.message || 'OpenAI question generation failed' }, response.status)
    const parsed = JSON.parse(data.choices?.[0]?.message?.content || '{"questions":[]}')
    return jsonResponse({ questions: parsed.questions || [] })
  } catch (error) {
    return jsonResponse({ error: error.message || 'Question generation failed' }, 500)
  }
})
