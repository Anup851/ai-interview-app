import { corsHeaders, jsonResponse } from '../_shared/cors.ts'

function parseJsonObject(text: string) {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '')
  try {
    return JSON.parse(cleaned)
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('AI response did not include JSON')
    return JSON.parse(match[0])
  }
}

function uniqueWords(text: string) {
  return Array.from(new Set(text.toLowerCase().match(/[a-z][a-z+#.-]{2,}/g) || []))
}

function clampScore(value: unknown, fallback = 0) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return fallback
  return Math.max(0, Math.min(100, Math.round(numeric)))
}

function normalizeStringArray(value: unknown) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean).slice(0, 12)
  if (typeof value === 'string') return value.split(/\n|;/).map((item) => item.replace(/^[-*\d.)\s]+/, '').trim()).filter(Boolean).slice(0, 12)
  return []
}

function normalizeAnalysis(value: Record<string, unknown>, resumeText: string, targetRole: string, targetDescription: string) {
  const fallback = fallbackAnalysis(resumeText, targetRole, targetDescription, 'AI response was normalized for app safety.')
  const keywordMatches = typeof value.keyword_matches === 'object' && value.keyword_matches !== null
    ? value.keyword_matches as Record<string, unknown>
    : {}

  return {
    ats_score: clampScore(value.ats_score, fallback.ats_score),
    strengths: normalizeStringArray(value.strengths).length ? normalizeStringArray(value.strengths) : fallback.strengths,
    weaknesses: normalizeStringArray(value.weaknesses).length ? normalizeStringArray(value.weaknesses) : fallback.weaknesses,
    suggestions: normalizeStringArray(value.suggestions).length ? normalizeStringArray(value.suggestions) : fallback.suggestions,
    keyword_matches: {
      matched: normalizeStringArray(keywordMatches.matched),
      missing: normalizeStringArray(keywordMatches.missing)
    },
    raw_summary: String(value.raw_summary || fallback.raw_summary).slice(0, 1200)
  }
}

function fallbackAnalysis(resumeText: string, targetRole: string, targetDescription = '', note = 'AI analysis is temporarily unavailable.') {
  const words = uniqueWords(resumeText)
  const roleWords = uniqueWords(`${targetRole} ${targetDescription}`)
  const commonKeywords = [
    'react',
    'javascript',
    'typescript',
    'node',
    'python',
    'sql',
    'api',
    'aws',
    'docker',
    'testing',
    'leadership',
    'analytics',
    'performance',
    'accessibility'
  ]
  const jdKeywords = roleWords.filter((word) => word.length > 3).slice(0, 24)
  const matched = Array.from(new Set([...commonKeywords.filter((word) => words.includes(word)), ...jdKeywords.filter((word) => words.includes(word))]))
  const missing = jdKeywords.filter((word) => !words.includes(word)).slice(0, 8)
  const hasMetrics = /\d+%|\$?\d+[kmb]?|\b\d+\s*(users|customers|requests|seconds|minutes|hours|days)\b/i.test(resumeText)
  const hasSections = ['experience', 'skills', 'education', 'projects'].filter((section) => words.includes(section))
  const atsScore = Math.max(45, Math.min(88, 55 + matched.length * 3 + hasSections.length * 4 + (hasMetrics ? 9 : 0)))

  return {
    ats_score: atsScore,
    strengths: [
      hasSections.length ? 'Resume has recognizable sections for ATS parsing.' : 'Resume text was readable and could be parsed.',
      matched.length ? `Relevant keywords found: ${matched.slice(0, 5).join(', ')}.` : 'Resume was uploaded and text extraction completed.'
    ],
    weaknesses: [
      missing.length ? `Job-match keywords to add: ${missing.join(', ')}.` : 'Add more role-specific keywords from the job description.',
      hasMetrics ? 'Some measurable impact is present; make sure each recent role has quantified outcomes.' : 'Add measurable outcomes such as percentages, scale, revenue, latency, or user impact.'
    ],
    suggestions: [
      'Tailor the top summary and skills section to the exact job description.',
      'Start bullets with action verbs and include impact metrics where possible.',
      note
    ],
    keyword_matches: { matched, missing },
    raw_summary: targetDescription
      ? 'Fallback ATS analysis compared the resume against the supplied job description.'
      : 'Fallback ATS analysis generated because the live AI provider did not return a usable response.'
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405)

  try {
    // Log request for debugging
    console.log('Analyze-resume function called')
    
    const { resumeText = '', targetRole = 'Software Engineer', targetDescription = '' } = await req.json()
    const apiKey = Deno.env.get('SARVAM_API_KEY')

    if (!resumeText) return jsonResponse({ error: 'Resume text is required' }, 400)
    if (!apiKey) return jsonResponse(fallbackAnalysis(resumeText, targetRole, targetDescription, 'SARVAM_API_KEY is not configured.'))

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
          {
            role: 'system',
            content: 'You are an ATS and recruiting expert. Return ONLY valid JSON: {"ats_score": 0-100, "strengths": [], "weaknesses": [], "suggestions": [], "keyword_matches": {"matched": [], "missing": []}, "raw_summary": ""}'
          },
          { role: 'user', content: `Target role: ${targetRole}\n\nJob description:\n${targetDescription.slice(0, 6000) || 'No job description provided.'}\n\nResume text:\n${resumeText.slice(0, 18000)}` }
        ],
        temperature: 0.3
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
      return jsonResponse(fallbackAnalysis(resumeText, targetRole, targetDescription, `AI provider returned ${response.status}: ${errorMsg}`))
    }
    const content = data.choices?.[0]?.message?.content || data.choices?.[0]?.text || data.message?.content || data.content || data.output_text || ''
    console.log('Sarvam AI Response:', { content })
    try {
      return jsonResponse(normalizeAnalysis(parseJsonObject(content), resumeText, targetRole, targetDescription))
    } catch (error) {
      return jsonResponse(fallbackAnalysis(resumeText, targetRole, targetDescription, error.message || 'AI response could not be parsed.'))
    }
  } catch (error) {
    return jsonResponse({ error: error.message || 'Resume analysis failed' }, 500)
  }
})
