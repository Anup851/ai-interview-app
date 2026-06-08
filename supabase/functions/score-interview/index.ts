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

    const { transcript = '', role = 'Software Engineer' } = await req.json()
    const apiKey = Deno.env.get('OPENAI_API_KEY')

    if (!apiKey) return jsonResponse({ error: 'OPENAI_API_KEY is not configured' }, 503)
    if (!transcript) return jsonResponse({ error: 'Interview transcript is required' }, 400)

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [
          {
            role: 'system',
            content: [
              'You are a senior interview coach and hiring-bar evaluator.',
              'Return only valid JSON with keys: overall_score, communication_score, technical_score, confidence_score, feedback_cards, improvement_suggestions.',
              'Scores must be 0-100.',
              'feedback_cards must be an array of objects with title and text.',
              'Evaluate structure, clarity, technical depth, tradeoffs, examples, confidence, and role fit.'
            ].join(' ')
          },
          { role: 'user', content: `Role: ${role}\n\nTranscript:\n${transcript.slice(0, 18000)}` }
        ],
        response_format: { type: 'json_object' }
      })
    })

    const data = await response.json()
    if (!response.ok) return jsonResponse({ error: data.error?.message || 'OpenAI interview scoring failed' }, response.status)
    return jsonResponse(JSON.parse(data.choices?.[0]?.message?.content || '{}'))
  } catch (error) {
    return jsonResponse({ error: error.message || 'Interview scoring failed' }, 500)
  }
})
