import { FileText, UploadCloud } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import ProgressRing from '../components/ui/ProgressRing.jsx'
import Badge from '../components/ui/Badge.jsx'
import { strengths as demoStrengths, suggestions as demoSuggestions, weaknesses as demoWeaknesses } from '../data/mockData.js'
import { useToast } from '../context/ToastContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { getActiveResume, uploadResumeAndAnalyze } from '../services/resumeService.js'

export default function ResumeAnalysisPage() {
  const inputRef = useRef(null)
  const { pushToast } = useToast()
  const { user, isConfigured } = useAuth()
  const [fileName, setFileName] = useState(isConfigured ? '' : 'Dana_Smith_Resume.pdf')
  const [progress, setProgress] = useState(isConfigured ? 0 : 72)
  const [score, setScore] = useState(isConfigured ? 0 : 91)
  const [strengths, setStrengths] = useState(isConfigured ? [] : demoStrengths)
  const [weaknesses, setWeaknesses] = useState(isConfigured ? [] : demoWeaknesses)
  const [suggestions, setSuggestions] = useState(isConfigured ? [] : demoSuggestions)
  const [analyzing, setAnalyzing] = useState(false)
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    if (!isConfigured) return
    getActiveResume(user?.id)
      .then((resume) => {
        if (!resume) return
        const latestAnalysis = resume.resume_analyses?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]
        setFileName(resume.file_name)
        setProgress(100)
        setScore(latestAnalysis?.ats_score || 0)
        setStrengths(latestAnalysis?.strengths || [])
        setWeaknesses(latestAnalysis?.weaknesses || [])
        setSuggestions(latestAnalysis?.suggestions || [])
      })
      .catch(() => {})
  }, [isConfigured, user?.id])

  const startUpload = async (file) => {
    if (!file) return
    if (file.type !== 'application/pdf') {
      pushToast('Please upload a PDF resume.', 'info')
      return
    }
    setFileName(file.name)
    setProgress(0)
    setAnalyzing(true)
    const interval = window.setInterval(() => {
      setProgress((current) => {
        if (current >= 90) return 90
        return current + 10
      })
    }, 180)
    try {
      const result = await uploadResumeAndAnalyze({ userId: user?.id, file })
      setScore(result.analysis.ats_score)
      setStrengths(result.analysis.strengths)
      setWeaknesses(result.analysis.weaknesses)
      setSuggestions(result.analysis.suggestions)
      setProgress(100)
      pushToast('Resume analysis complete.')
    } catch (error) {
      pushToast(error.message || 'Resume analysis failed.', 'info')
    } finally {
      window.clearInterval(interval)
      setAnalyzing(false)
    }
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setDragging(false)
    startUpload(event.dataTransfer.files[0])
  }

  return (
    <div className="grid gap-6">
      <header><h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">Resume Analysis</h1><p className="mt-2 text-zinc-500 dark:text-zinc-400">Upload a PDF resume and get ATS scoring, keyword coverage, and rewrite guidance.</p></header>
      <section className="grid gap-6 xl:grid-cols-[1fr_.9fr]">
        <Card>
          <div
            className={`grid place-items-center rounded-lg border-2 border-dashed p-8 text-center transition ${dragging ? 'border-primary bg-violet-100 dark:bg-violet-500/20' : 'border-violet-200 bg-violet-50/70 dark:border-violet-400/25 dark:bg-violet-500/10'}`}
            onDragOver={(event) => { event.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            <UploadCloud className="h-10 w-10 text-primary" />
            <h2 className="mt-4 text-xl font-extrabold text-zinc-950 dark:text-white">Drop your PDF resume here</h2>
            <p className="mt-2 max-w-md text-sm text-zinc-600 dark:text-zinc-400">{fileName ? `Selected: ${fileName}` : 'PDF up to 8MB. Drag and drop or browse from your device.'}</p>
            <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={(event) => startUpload(event.target.files[0])} />
            <Button className="mt-5" onClick={() => inputRef.current?.click()} loading={analyzing}>Choose PDF</Button>
          </div>
          <div className="mt-6"><div className="flex items-center justify-between text-sm font-bold"><span>{analyzing ? 'Analyzing resume' : 'Upload progress'}</span><span>{progress}%</span></div><div className="mt-2 h-3 rounded-full bg-zinc-100 dark:bg-white/10"><div className="h-3 rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-300" style={{ width: `${progress}%` }} /></div></div>
        </Card>
        <Card className="grid place-items-center text-center"><ProgressRing value={score} label="ATS" /><h2 className="mt-5 text-xl font-extrabold text-zinc-950 dark:text-white">{score ? (score >= 90 ? 'Excellent match' : 'Strong match') : 'No score yet'}</h2><p className="mt-2 text-sm text-zinc-500">{score ? 'Score from your latest resume analysis.' : 'Upload a resume to create your first ATS score.'}</p></Card>
      </section>
      <section className="grid gap-6 lg:grid-cols-3">
        <InsightList title="Strengths" items={strengths} color="emerald" />
        <InsightList title="Weaknesses" items={weaknesses} color="rose" />
        <InsightList title="Suggestions" items={suggestions} color="amber" />
      </section>
      <Card><div className="flex items-center gap-3"><FileText className="h-5 w-5 text-primary" /><h2 className="text-lg font-extrabold">Resume preview</h2></div><div className="mt-5 rounded-lg border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-zinc-900"><p className="text-sm font-bold text-zinc-950 dark:text-white">{fileName || 'No resume uploaded yet'}</p><p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-300">{fileName ? 'Your latest uploaded resume is saved securely in your Supabase storage bucket.' : 'Upload a PDF to save it to your account and generate resume analysis data.'}</p></div></Card>
    </div>
  )
}

function InsightList({ title, items, color }) {
  return <Card><div className="flex items-center justify-between"><h2 className="text-lg font-extrabold text-zinc-950 dark:text-white">{title}</h2><Badge color={color}>{items.length}</Badge></div><div className="mt-5 grid gap-3">{items.length ? items.map((item) => <p key={item} className="rounded-lg bg-zinc-50 p-3 text-sm font-medium text-zinc-700 dark:bg-white/5 dark:text-zinc-200">{item}</p>) : <p className="rounded-lg border border-dashed border-zinc-200 p-3 text-sm font-medium text-zinc-500 dark:border-white/10 dark:text-zinc-400">No {title.toLowerCase()} yet.</p>}</div></Card>
}
