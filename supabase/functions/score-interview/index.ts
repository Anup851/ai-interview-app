import { corsHeaders, jsonResponse } from '../_shared/cors.ts'

function parseJsonObject(text: string) {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '')
  try {
    return JSON.parse(cleaned || '{}')
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('AI response did not include scoring JSON')
    return JSON.parse(match[0])
  }
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

function normalizeFeedbackCards(value: unknown) {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => {
      if (typeof item === 'string') return { title: 'Feedback', text: item.trim() }
      if (!item || typeof item !== 'object') return null
      const card = item as Record<string, unknown>
      return {
        title: String(card.title || 'Feedback').trim(),
        text: String(card.text || card.body || card.feedback || '').trim()
      }
    })
    .filter((item) => item && item.text)
    .slice(0, 6)
}

function normalizeFeedback(value: Record<string, unknown>, transcript: string, role: string) {
  const fallback = fallbackFeedback(transcript, role, 'AI response was normalized for app safety.')
  const feedbackCards = normalizeFeedbackCards(value.feedback_cards)
  const suggestions = normalizeStringArray(value.improvement_suggestions)

  return {
    overall_score: clampScore(value.overall_score, fallback.overall_score),
    communication_score: clampScore(value.communication_score, fallback.communication_score),
    technical_score: clampScore(value.technical_score, fallback.technical_score),
    confidence_score: clampScore(value.confidence_score, fallback.confidence_score),
    feedback_cards: feedbackCards.length ? feedbackCards : fallback.feedback_cards,
    improvement_suggestions: suggestions.length ? suggestions : fallback.improvement_suggestions
  }
}

function fallbackFeedback(transcript: string, role: string, note = 'AI scoring is temporarily unavailable.') {
  const words = transcript.trim().split(/\s+/).filter(Boolean)
  const wordCount = words.length
  const hasMetrics = /\d+%|\$?\d+[kmb]?|\b\d+\s*(users|customers|requests|seconds|minutes|hours|days)\b/i.test(transcript)
  const hasStructure = /\b(context|situation|task|action|result|tradeoff|because|impact|learned)\b/i.test(transcript)
  const hasTechnicalSignals = /\b(api|system|design|database|react|javascript|typescript|python|sql|testing|performance|security|scalability)\b/i.test(transcript)
  const lengthScore = wordCount >= 240 ? 78 : wordCount >= 120 ? 68 : wordCount >= 60 ? 56 : 42
  const communicationScore = clampScore(lengthScore + (hasStructure ? 10 : 0))
  const technicalScore = clampScore(lengthScore + (hasTechnicalSignals ? 12 : 0) + (hasMetrics ? 4 : 0))
  const confidenceScore = clampScore(lengthScore + (wordCount >= 120 ? 8 : 0) + (hasMetrics ? 5 : 0))
  const overallScore = clampScore((communicationScore + technicalScore + confidenceScore) / 3)

  return {
    overall_score: overallScore,
    communication_score: communicationScore,
    technical_score: technicalScore,
    confidence_score: confidenceScore,
    feedback_cards: [
      {
        title: 'Answer coverage',
        text: wordCount >= 120
          ? `You gave enough detail for a ${role} interview evaluation.`
          : 'Answers were saved, but several responses need more detail to score strongly.'
      },
      {
        title: 'Structure',
        text: hasStructure
          ? 'Your transcript shows some structured reasoning and impact framing.'
          : 'Use a clear setup, action, result, and tradeoff pattern for each answer.'
      },
      {
        title: 'Evidence',
        text: hasMetrics
          ? 'You included measurable impact, which helps interviewers calibrate scope.'
          : 'Add numbers, scale, latency, revenue, quality, or user impact where possible.'
      }
    ],
    improvement_suggestions: [
      'Lead each answer with a concise headline before details.',
      'Tie technical choices to business, product, or user impact.',
      note
    ]
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405)

  try {
    // Log request for debugging
    console.log('Score-interview function called')
    
    const { transcript = '', role = 'Software Engineer' } = await req.json()
    const apiKey = Deno.env.get('SARVAM_API_KEY')

    if (!transcript) return jsonResponse({ error: 'Interview transcript is required' }, 400)
    if (!apiKey) return jsonResponse(fallbackFeedback(transcript, role, 'SARVAM_API_KEY is not configured.'))

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
            content: 'You are a senior interview coach. Return ONLY valid JSON: {"overall_score": 0-100, "communication_score": 0-100, "technical_score": 0-100, "confidence_score": 0-100, "feedback_cards": [{"title": "", "text": ""}], "improvement_suggestions": []}'
          },
          { role: 'user', content: `Role: ${role}\n\nTranscript:\n${transcript.slice(0, 18000)}` }
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
      return jsonResponse(fallbackFeedback(transcript, role, `AI provider returned ${response.status}: ${errorMsg}`))
    }
    const content = data.choices?.[0]?.message?.content || data.choices?.[0]?.text || data.message?.content || data.content || data.output_text || ''
    console.log('Sarvam AI Response:', { content })
    try {
      return jsonResponse(normalizeFeedback(parseJsonObject(content), transcript, role))
    } catch (error) {
      return jsonResponse(fallbackFeedback(transcript, role, error.message || 'AI response could not be parsed.'))
    }
  } catch (error) {
    return jsonResponse({ error: error.message || 'Interview scoring failed' }, 500)
  }
})
