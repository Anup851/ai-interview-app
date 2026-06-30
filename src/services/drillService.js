import { getLatestFeedback } from './interviewService.js'

const fallbackDrills = [
  { title: '20-second headline', prompt: 'Answer a recent project question in one sentence, then expand with context, action, and result.' },
  { title: 'Metric upgrade', prompt: 'Take one answer and add scale, latency, quality, revenue, or user impact.' },
  { title: 'Tradeoff close', prompt: 'End a technical answer by naming the tradeoff you accepted and why.' }
]

export async function getWeakAreaDrills(userId) {
  const feedback = await getLatestFeedback(userId)
  if (!feedback) return fallbackDrills

  const scores = [
    { label: 'communication', value: feedback.communication_score || 0 },
    { label: 'technical depth', value: feedback.technical_score || 0 },
    { label: 'confidence', value: feedback.confidence_score || 0 }
  ].sort((a, b) => a.value - b.value)
  const weakest = scores[0]?.label || 'communication'
  const suggestions = feedback.improvement_suggestions || []

  return [
    { title: `Improve ${weakest}`, prompt: suggestions[0] || 'Rewrite one answer with a clearer beginning, stronger evidence, and a tighter close.' },
    { title: 'Follow-up pressure', prompt: 'Write two likely follow-up questions an interviewer would ask, then answer both briefly.' },
    { title: 'Evidence pass', prompt: 'Add one metric and one technical decision to your weakest recent answer.' },
    { title: 'Final answer polish', prompt: suggestions[1] || 'Reduce a long answer to a 45-second version without losing the result.' }
  ]
}
