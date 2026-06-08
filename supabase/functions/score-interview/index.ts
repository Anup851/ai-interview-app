import { corsHeaders, jsonResponse } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405)

  try {
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
          { role: 'system', content: 'Score interview transcript. Return JSON with overall_score, communication_score, technical_score, confidence_score, feedback_cards, improvement_suggestions.' },
          { role: 'user', content: `Role: ${role}\nTranscript:\n${transcript}` }
        ],
        response_format: { type: 'json_object' }
      })
    })

    const data = await response.json()
    return jsonResponse(JSON.parse(data.choices?.[0]?.message?.content || '{}'))
  } catch (error) {
    return jsonResponse({ error: error.message || 'Interview scoring failed' }, 500)
  }
})
