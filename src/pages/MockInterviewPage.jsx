import { Mic, Pause, SkipForward } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import { questions } from '../data/mockData.js'
import { useToast } from '../context/ToastContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { completeInterview } from '../services/interviewService.js'
import { listLatestQuestions } from '../services/questionService.js'

export default function MockInterviewPage() {
  const [recording, setRecording] = useState(false)
  const [current, setCurrent] = useState(0)
  const [seconds, setSeconds] = useState(12 * 60 + 48)
  const { pushToast } = useToast()
  const { user, profile, isConfigured } = useAuth()
  const [currentQuestions, setCurrentQuestions] = useState(isConfigured ? [] : questions)
  const [transcript, setTranscript] = useState([])
  const [answerDraft, setAnswerDraft] = useState('')
  const [audioBlob, setAudioBlob] = useState(null)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const streamRef = useRef(null)
  const hasQuestions = currentQuestions.length > 0
  const progress = hasQuestions ? ((current + 1) / currentQuestions.length) * 100 : 0
  const time = useMemo(() => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`, [seconds])

  useEffect(() => {
    if (!isConfigured) return
    listLatestQuestions(user?.id).then((items) => {
      setCurrentQuestions(items)
      setCurrent(0)
    }).catch(() => setCurrentQuestions([]))
  }, [isConfigured, user?.id])

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  useEffect(() => {
    if (!recording) return undefined
    const timer = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000)
    return () => {
      window.clearInterval(timer)
    }
  }, [recording])

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
      await startAudio()
    } catch (error) {
      pushToast(error.message || 'Microphone permission was denied.', 'info')
      return
    }
    setRecording(true)
    pushToast('Recording started.')
  }

  const nextQuestion = async () => {
    if (!hasQuestions) {
      pushToast('Generate questions before starting a mock interview.', 'info')
      return
    }

    const nextTranscript = answerDraft.trim() ? [...transcript, answerDraft.trim()] : transcript
    setTranscript(nextTranscript)
    setAnswerDraft('')

    if (current === currentQuestions.length - 1) {
      const finalAudioBlob = await stopAudio()
      setRecording(false)
      try {
        const result = await completeInterview({
          userId: user?.id,
          role: profile?.target_role || 'Senior Frontend Engineer',
          durationSeconds: 12 * 60 + 48 - seconds,
          transcript: nextTranscript,
          questions: currentQuestions,
          audioBlob: finalAudioBlob || audioBlob
        })
        pushToast(result.score == null ? 'Mock interview saved. Feedback is pending review.' : `Mock interview completed. Feedback score: ${result.score}.`)
      } catch (error) {
        pushToast(error.message || 'Could not save interview.', 'info')
      }
      return
    }
    setCurrent((value) => value + 1)
    pushToast('Next question loaded.')
  }

  return (
    <div className="grid gap-6">
      <header><h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">Mock Interview</h1><p className="mt-2 text-zinc-500 dark:text-zinc-400">Practice with timed prompts, voice capture controls, and transcript review.</p></header>
      <section className="grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-4"><Badge>Question {hasQuestions ? current + 1 : 0} of {currentQuestions.length}</Badge><div className="rounded-lg bg-zinc-100 px-4 py-2 text-2xl font-extrabold tabular-nums text-zinc-950 dark:bg-white/10 dark:text-white">{time}</div></div>
          <div className="mt-8 rounded-lg bg-gradient-to-br from-zinc-950 to-indigo-950 p-6 text-white"><p className="text-sm font-bold text-violet-200">Current question</p><h2 className="mt-3 text-2xl font-extrabold leading-tight">{hasQuestions ? currentQuestions[current] : 'No questions generated yet.'}</h2></div>
          <div className="mt-6 h-3 rounded-full bg-zinc-100 dark:bg-white/10"><div className="h-3 rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-300" style={{ width: `${progress}%` }} /></div>
          <textarea className="mt-6 min-h-32 w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-900 outline-none transition focus:border-primary focus:ring-4 focus:ring-violet-500/10 dark:border-white/10 dark:bg-zinc-950 dark:text-white" placeholder="Type or paste your answer transcript here" value={answerDraft} onChange={(event) => setAnswerDraft(event.target.value)} />
          <div className="mt-6 flex flex-col gap-3 sm:flex-row"><Button icon={recording ? Pause : Mic} variant={recording ? 'danger' : 'primary'} onClick={toggleRecording} disabled={!hasQuestions}>{recording ? 'Pause timer' : 'Start timer'}</Button><Button variant="outline" icon={SkipForward} onClick={nextQuestion} disabled={!hasQuestions}>{current === currentQuestions.length - 1 ? 'Finish Interview' : 'Next Question'}</Button></div>
        </Card>
        <Card><h2 className="text-lg font-extrabold text-zinc-950 dark:text-white">Transcript</h2><div className="mt-5 grid max-h-[420px] gap-3 overflow-y-auto text-sm leading-7 text-zinc-600 dark:text-zinc-300">{transcript.length ? transcript.map((line, index) => <p key={`${line}-${index}`}>{line}</p>) : <p className="rounded-lg border border-dashed border-zinc-200 p-3 text-sm font-medium text-zinc-500 dark:border-white/10 dark:text-zinc-400">No transcript saved yet.</p>}</div></Card>
      </section>
    </div>
  )
}
