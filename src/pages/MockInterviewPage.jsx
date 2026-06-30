import { CheckCircle2, Mic, Pause, RotateCcw, SkipForward } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import ProgressRing from '../components/ui/ProgressRing.jsx'
import { questions } from '../data/mockData.js'
import { useToast } from '../context/ToastContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { completeInterview } from '../services/interviewService.js'
import { getLatestQuestionSet } from '../services/questionService.js'

export default function MockInterviewPage() {
  const [recording, setRecording] = useState(false)
  const [current, setCurrent] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const { pushToast } = useToast()
  const { user, profile, isConfigured } = useAuth()
  const [currentQuestions, setCurrentQuestions] = useState(isConfigured ? [] : questions)
  const [questionSet, setQuestionSet] = useState(null)
  const [transcript, setTranscript] = useState([])
  const [answerDraft, setAnswerDraft] = useState('')
  const [answerDurations, setAnswerDurations] = useState([])
  const [audioBlob, setAudioBlob] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [completedResult, setCompletedResult] = useState(null)
  const [timerActive, setTimerActive] = useState(false)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const streamRef = useRef(null)
  const startedAtRef = useRef(null)
  const questionStartedAtRef = useRef(null)
  const hasQuestions = currentQuestions.length > 0
  const progress = hasQuestions ? ((current + 1) / currentQuestions.length) * 100 : 0
  const time = useMemo(() => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`, [seconds])

  const beginInterview = () => {
    if (!startedAtRef.current) startedAtRef.current = Date.now()
    if (!questionStartedAtRef.current) questionStartedAtRef.current = Date.now()
    setTimerActive(true)
  }

  useEffect(() => {
    if (!isConfigured) return
    getLatestQuestionSet(user?.id).then((set) => {
      setQuestionSet(set)
      setCurrentQuestions(set?.questions || [])
      setCurrent(0)
      setCompletedResult(null)
    }).catch(() => {
      setQuestionSet(null)
      setCurrentQuestions([])
    })
  }, [isConfigured, user?.id])

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  useEffect(() => {
    if (!timerActive) return undefined
    beginInterview()
    const timer = window.setInterval(() => setSeconds(Math.floor((Date.now() - startedAtRef.current) / 1000)), 1000)
    return () => {
      window.clearInterval(timer)
    }
  }, [timerActive])

  const stopAudio = async () => {
    const recorder = mediaRecorderRef.current
    let nextBlob = audioBlob

    if (recorder?.state === 'recording') {
      nextBlob = await new Promise((resolve) => {
        recorder.onstop = () => {
          const blob = audioChunksRef.current.length
            ? new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' })
            : null
          setAudioBlob(blob)
          resolve(blob)
        }
        recorder.stop()
      })
    }

    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    return nextBlob
  }

  const startAudio = async () => {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      pushToast('Audio recording is not supported in this browser. You can still type answers.', 'info')
      return
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    streamRef.current = stream
    audioChunksRef.current = []
    const recorder = new MediaRecorder(stream)
    mediaRecorderRef.current = recorder
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) audioChunksRef.current.push(event.data)
    }
    recorder.start()
  }

  const toggleRecording = async () => {
    if (recording) {
      await stopAudio()
      setRecording(false)
      pushToast('Recording paused.')
      return
    }

    try {
      beginInterview()
      await startAudio()
    } catch (error) {
      pushToast(error.message || 'Microphone permission was denied.', 'info')
      return
    }
    setRecording(true)
    pushToast('Recording started.')
  }

  const resetInterview = () => {
    setRecording(false)
    setCurrent(0)
    setSeconds(0)
    setTranscript([])
    setAnswerDraft('')
    setAnswerDurations([])
    setAudioBlob(null)
    setTimerActive(false)
    setCompletedResult(null)
    startedAtRef.current = null
    questionStartedAtRef.current = null
    stopAudio()
  }

  const nextQuestion = async () => {
    if (!hasQuestions) {
      pushToast('Generate questions before starting a mock interview.', 'info')
      return
    }

    const answerText = answerDraft.trim()
    beginInterview()
    const nextTranscript = [...transcript, answerText]
    const now = Date.now()
    const answerSeconds = questionStartedAtRef.current ? Math.max(1, Math.round((now - questionStartedAtRef.current) / 1000)) : 0
    const nextDurations = [...answerDurations, answerSeconds]
    setTranscript(nextTranscript)
    setAnswerDurations(nextDurations)
    setAnswerDraft('')

    if (current === currentQuestions.length - 1) {
      const finalAudioBlob = await stopAudio()
      setRecording(false)
      setTimerActive(false)
      setSubmitting(true)
      try {
        const result = await completeInterview({
          userId: user?.id,
          role: profile?.target_role || 'Senior Frontend Engineer',
          durationSeconds: seconds || nextDurations.reduce((sum, value) => sum + value, 0),
          transcript: nextTranscript,
          questions: currentQuestions,
          audioBlob: finalAudioBlob || audioBlob,
          answerDurations: nextDurations,
          questionSetId: questionSet?.id || null
        })
        setCompletedResult({ ...result, transcript: nextTranscript, answerDurations: nextDurations })
        pushToast(result.score == null ? 'Mock interview saved. Feedback is pending review.' : `Mock interview completed. Feedback score: ${result.score}.`)
      } catch (error) {
        pushToast(error.message || 'Could not save interview.', 'info')
      } finally {
        setSubmitting(false)
      }
      return
    }
    questionStartedAtRef.current = Date.now()
    setCurrent((value) => value + 1)
    pushToast('Next question loaded.')
  }

  const feedback = completedResult?.feedback
  const scoreCards = feedback ? [
    { label: 'Communication', value: feedback.communication_score || 0 },
    { label: 'Technical', value: feedback.technical_score || 0 },
    { label: 'Confidence', value: feedback.confidence_score || 0 }
  ] : []

  if (completedResult) {
    return (
      <div className="grid gap-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div><h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">Mock Interview Result</h1><p className="mt-2 text-zinc-500 dark:text-zinc-400">Your interview was scored, saved, and added to your history.</p></div>
          <Button variant="outline" icon={RotateCcw} onClick={resetInterview}>Start Over</Button>
        </header>
        <section className="grid gap-6 xl:grid-cols-[.75fr_1.25fr]">
          <Card className="grid place-items-center text-center"><ProgressRing value={completedResult.score || 0} label="Overall" /><h2 className="mt-5 text-xl font-extrabold text-zinc-950 dark:text-white">{completedResult.score == null ? 'Saved for review' : 'Interview completed'}</h2><p className="mt-2 text-sm text-zinc-500">{Math.max(1, Math.round((completedResult.interview?.duration_seconds || seconds) / 60))} min recorded across {currentQuestions.length} questions.</p></Card>
          <Card><div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-emerald-500" /><h2 className="text-lg font-extrabold text-zinc-950 dark:text-white">Score breakdown</h2></div><div className="mt-5 grid gap-4 sm:grid-cols-3">{scoreCards.map((item) => <div key={item.label} className="rounded-lg bg-zinc-50 p-4 dark:bg-white/5"><p className="text-sm font-bold text-zinc-500">{item.label}</p><p className="mt-2 text-3xl font-extrabold text-zinc-950 dark:text-white">{item.value}</p><div className="mt-3 h-2 rounded-full bg-zinc-100 dark:bg-white/10"><div className="h-2 rounded-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${item.value}%` }} /></div></div>)}</div></Card>
        </section>
        <section className="grid gap-6 lg:grid-cols-2">
          <Card><h2 className="text-lg font-extrabold text-zinc-950 dark:text-white">Feedback</h2><div className="mt-5 grid gap-3">{feedback?.feedback_cards?.length ? feedback.feedback_cards.map((card) => <div key={card.title} className="rounded-lg bg-zinc-50 p-4 dark:bg-white/5"><p className="font-bold text-zinc-950 dark:text-white">{card.title}</p><p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{card.text}</p></div>) : <p className="rounded-lg border border-dashed border-zinc-200 p-3 text-sm font-medium text-zinc-500 dark:border-white/10 dark:text-zinc-400">Feedback is pending review.</p>}</div></Card>
          <Card><h2 className="text-lg font-extrabold text-zinc-950 dark:text-white">Suggestions</h2><div className="mt-5 grid gap-3">{feedback?.improvement_suggestions?.length ? feedback.improvement_suggestions.map((item) => <p key={item} className="rounded-lg bg-zinc-50 p-3 text-sm font-medium text-zinc-700 dark:bg-white/5 dark:text-zinc-200">{item}</p>) : <p className="rounded-lg border border-dashed border-zinc-200 p-3 text-sm font-medium text-zinc-500 dark:border-white/10 dark:text-zinc-400">No suggestions saved yet.</p>}</div></Card>
        </section>
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      <header><h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">Mock Interview</h1><p className="mt-2 text-zinc-500 dark:text-zinc-400">{questionSet?.job_role ? `Practice with your latest ${questionSet.job_role} question set.` : 'Practice with timed prompts, voice capture controls, and transcript review.'}</p></header>
      <section className="grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-4"><Badge>Question {hasQuestions ? current + 1 : 0} of {currentQuestions.length}</Badge><div className="rounded-lg bg-zinc-100 px-4 py-2 text-2xl font-extrabold tabular-nums text-zinc-950 dark:bg-white/10 dark:text-white">{time}</div></div>
          <div className="mt-8 rounded-lg bg-gradient-to-br from-zinc-950 to-indigo-950 p-6 text-white"><p className="text-sm font-bold text-violet-200">Current question</p><h2 className="mt-3 text-2xl font-extrabold leading-tight">{hasQuestions ? currentQuestions[current] : 'No questions generated yet.'}</h2></div>
          <div className="mt-6 h-3 rounded-full bg-zinc-100 dark:bg-white/10"><div className="h-3 rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-300" style={{ width: `${progress}%` }} /></div>
          <textarea className="mt-6 min-h-32 w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-900 outline-none transition focus:border-primary focus:ring-4 focus:ring-violet-500/10 dark:border-white/10 dark:bg-zinc-950 dark:text-white" placeholder="Type or paste your answer transcript here" value={answerDraft} onFocus={beginInterview} onChange={(event) => { beginInterview(); setAnswerDraft(event.target.value) }} />
          <div className="mt-6 flex flex-col gap-3 sm:flex-row"><Button icon={recording ? Pause : Mic} variant={recording ? 'danger' : 'primary'} onClick={toggleRecording} disabled={!hasQuestions || submitting}>{recording ? 'Pause timer' : 'Start timer'}</Button><Button variant="outline" icon={SkipForward} onClick={nextQuestion} disabled={!hasQuestions || submitting} loading={submitting}>{current === currentQuestions.length - 1 ? 'Submit Interview' : 'Next Question'}</Button></div>
        </Card>
        <Card><h2 className="text-lg font-extrabold text-zinc-950 dark:text-white">Transcript</h2><div className="mt-5 grid max-h-[420px] gap-3 overflow-y-auto text-sm leading-7 text-zinc-600 dark:text-zinc-300">{transcript.length ? transcript.map((line, index) => <div key={`${line}-${index}`} className="rounded-lg bg-zinc-50 p-3 dark:bg-white/5"><p className="text-xs font-bold uppercase text-zinc-500">Question {index + 1} - {answerDurations[index] || 0}s</p><p className="mt-2">{line || 'No answer entered.'}</p></div>) : <p className="rounded-lg border border-dashed border-zinc-200 p-3 text-sm font-medium text-zinc-500 dark:border-white/10 dark:text-zinc-400">No transcript saved yet.</p>}</div></Card>
      </section>
    </div>
  )
}
