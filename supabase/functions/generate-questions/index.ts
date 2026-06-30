import { corsHeaders, jsonResponse } from '../_shared/cors.ts'

function parseQuestions(text: string) {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '')
  try {
    const parsed = JSON.parse(cleaned || '{"questions":[]}')
    return Array.isArray(parsed) ? parsed : parsed.questions || []
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}|\[[\s\S]*\]/)
    if (!match) throw new Error('AI response did not include questions JSON')
    const parsed = JSON.parse(match[0])
    return Array.isArray(parsed) ? parsed : parsed.questions || []
  }
}

function normalizeQuestions(value: unknown) {
  const questions = Array.isArray(value) ? value : []
  return questions
    .map((item) => typeof item === 'string' ? item : (item && typeof item === 'object' && 'question' in item ? String(item.question) : ''))
    .map((item) => item.replace(/^\s*[-*\d.)]+\s*/, '').trim())
    .filter(Boolean)
    .slice(0, 6)
}

function fallbackQuestions(role: string, level = 'Mid-level', style = 'Balanced', skills: string[] = [], company = '', difficulty = 'Standard', note = 'AI generation is temporarily unavailable.') {
  const skillText = skills.length ? skills.join(', ') : 'the core skills for this role'
  const primarySkill = skills[0] || 'your strongest technical area'
  const secondarySkill = skills[1] || 'collaboration'
  const seniority = String(level || 'Mid-level').toLowerCase()
  const styleLabel = String(style || 'Balanced').toLowerCase()

  return {
    questions: [
      `For a ${seniority} ${role}${company ? ` at ${company}` : ''}, walk me through a project where ${skillText} mattered most. What did you own and what changed because of your work?`,
      `Describe the most difficult ${primarySkill} problem you solved. What alternatives did you consider and why did you choose your final approach?`,
      `Tell me about a time ${secondarySkill} helped you unblock a team, improve quality, or deliver a better product outcome.`,
      `How would you approach a ${difficulty.toLowerCase()} ${styleLabel} interview scenario where the requirements are ambiguous and the timeline is tight?`,
      `Design your first 30 days in this ${role} role. What would you learn, ship, measure, and communicate?`,
      `What signals would show that you are performing above expectations as a ${seniority} ${role}?`
    ],
    fallback_reason: note
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405)

  try {
    // Log request for debugging
    console.log('Generate-questions function called')
    
    const { role, level, style, skills = [], company = '', difficulty = 'Standard' } = await req.json()
    if (!role) return jsonResponse({ error: 'Missing role' }, 400)

    const prompt = `Generate 6 practical interview questions for a ${level} ${role}. Company context: ${company || 'general'}. Difficulty: ${difficulty}. Style: ${style}. Skills: ${skills.join(', ')}. Include a mix of technical depth, behavioral evidence, tradeoffs, and role-specific scenarios.`
    const apiKey = Deno.env.get('SARVAM_API_KEY')

    if (!apiKey) return jsonResponse(fallbackQuestions(role, level, style, skills, company, difficulty, 'SARVAM_API_KEY is not configured.'))

    const apiUrl = 'https://api.sarvam.ai/v1/chat/completions'
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'Llama-3-70B-Instruct',
        messages: [
          { role: 'system', content: 'You are an expert interview coach. Generate exactly 6 interview questions as a JSON array. Return ONLY valid JSON: {"questions": ["Q1", "Q2", ...]}' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7
      })
    })

    const responseText = await response.text()
    let data = {}
    try {
      data = JSON.parse(responseText)
    } catch (e) {
      console.error('Failed to parse JSON:', responseText)
    }
    console.error('Sarvam Request Debug:', {
      status: response.status,
      statusText: response.statusText,
      url: apiUrl,
      hasApiKey: !!apiKey,
      responseBody: responseText
    })
    if (!response.ok) {
      const errorMsg = data.error?.message || data.message || data.detail || responseText || `HTTP ${response.status}`
      return jsonResponse(fallbackQuestions(role, level, style, skills, company, difficulty, `AI provider returned ${response.status}: ${errorMsg}`))
    }
    const content = data.choices?.[0]?.message?.content || data.choices?.[0]?.text || data.message?.content || data.content || data.output_text || ''
    console.log('Sarvam AI Response:', { content })
    try {
      const questions = normalizeQuestions(parseQuestions(content))
      if (!questions.length) throw new Error('AI response did not include any questions')
      return jsonResponse({ questions })
    } catch (error) {
      return jsonResponse(fallbackQuestions(role, level, style, skills, company, difficulty, error.message || 'AI response could not be parsed.'))
    }
  } catch (error) {
    return jsonResponse({ error: error.message || 'Question generation failed' }, 500)
  }
})
