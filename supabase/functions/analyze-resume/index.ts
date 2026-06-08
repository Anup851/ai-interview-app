import { corsHeaders, jsonResponse } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405)

  try {
    const { resumeText = '', targetRole = 'Software Engineer' } = await req.json()
    const apiKey = Deno.env.get('OPENAI_API_KEY')

    if (!apiKey) return jsonResponse({ error: 'OPENAI_API_KEY is not configured' }, 503)
    if (!resumeText) return jsonResponse({ error: 'Resume text is required' }, 400)

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
              'You are an ATS and technical recruiting evaluator.',
              'Return only valid JSON with keys: ats_score, strengths, weaknesses, suggestions, keyword_matches, raw_summary.',
              'ats_score must be 0-100 and based on keyword match, target-role relevance, measurable impact, structure/readability, seniority fit, and missing skill risk.',
              'strengths, weaknesses, and suggestions must be concise arrays of strings.',
              'keyword_matches must be an object with matched, missing, and role_keywords arrays.'
            ].join(' ')
          },
          { role: 'user', content: `Target role: ${targetRole}\n\nResume text:\n${resumeText.slice(0, 18000)}` }
        ],
        response_format: { type: 'json_object' }
      })
    })

    const data = await response.json()
    if (!response.ok) return jsonResponse({ error: data.error?.message || 'OpenAI resume analysis failed' }, response.status)
    return jsonResponse(JSON.parse(data.choices?.[0]?.message?.content || '{}'))
  } catch (error) {
    return jsonResponse({ error: error.message || 'Resume analysis failed' }, 500)
  }
})
