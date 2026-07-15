import { CheckCircle2, ChevronRight, Code2, RotateCcw, Send, XCircle } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import Prism from 'prismjs'
import 'prismjs/components/prism-clike'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-java'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import Select from '../components/ui/Select.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { difficulties, getDsaProgress, getNextProblem, getProblemsByDifficulty, recordDsaAttempt, reviewDsaSubmission } from '../services/dsaService.js'

const starterCode = {
  JavaScript: `function solve(input) {
  // Write your solution here.
  // Add time and space complexity before submitting.
  return null
}`,
  Python: `def solve(input):
    # Write your solution here.
    # Add time and space complexity before submitting.
    return None`,
  Java: `class Solution {
  public Object solve(Object input) {
    // Write your solution here.
    // Add time and space complexity before submitting.
    return null;
  }
}`
}

const badgeColor = {
  Easy: 'emerald',
  Medium: 'amber',
  Hard: 'rose'
}

const prismLanguage = {
  JavaScript: 'javascript',
  Python: 'python',
  Java: 'java'
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export default function DSAPracticePage() {
  const { pushToast } = useToast()
  const { user } = useAuth()
  const [difficulty, setDifficulty] = useState('Easy')
  const problems = useMemo(() => getProblemsByDifficulty(difficulty), [difficulty])
  const [problemId, setProblemId] = useState(problems[0].id)
  const [language, setLanguage] = useState('JavaScript')
  const [code, setCode] = useState(starterCode.JavaScript)
  const [result, setResult] = useState(null)
  const [progress, setProgress] = useState({ solved: [], attempts: {} })
  const [editorScrollTop, setEditorScrollTop] = useState(0)

  useEffect(() => {
    let ignore = false
    if (!user?.id) {
      setProgress({ solved: [], attempts: {} })
      return undefined
    }
    getDsaProgress(user.id).then((next) => {
      if (!ignore) setProgress(next)
    }).catch(() => {
      if (!ignore) setProgress({ solved: [], attempts: {} })
    })
    return () => {
      ignore = true
    }
  }, [user?.id])

  const problem = problems.find((item) => item.id === problemId) || problems[0]
  const solved = progress.solved.includes(problem.id)
  const solvedCount = problems.filter((item) => progress.solved.includes(item.id)).length
  const lineNumbers = code.split('\n').map((_, index) => index + 1)
  const highlightedCode = useMemo(() => {
    const languageKey = prismLanguage[language]
    const grammar = Prism.languages[languageKey]
    return grammar ? Prism.highlight(code, grammar, languageKey) : escapeHtml(code)
  }, [code, language])

  const changeDifficulty = (value) => {
    const nextProblems = getProblemsByDifficulty(value)
    setDifficulty(value)
    setProblemId(nextProblems[0].id)
    setResult(null)
  }

  const changeLanguage = (value) => {
    setLanguage(value)
    setCode(starterCode[value])
    setResult(null)
    setEditorScrollTop(0)
  }

  const submitSolution = async () => {
    const review = reviewDsaSubmission(problem, code, language)
    setResult(review)
    const nextProgress = await recordDsaAttempt(user?.id, problem.id, review)
    setProgress(nextProgress)
    pushToast(review.accepted ? 'Accepted. Nice, next problem unlocked.' : 'Reviewed. Improve and submit again.', review.accepted ? 'success' : 'info')
  }

  const nextQuestion = () => {
    const next = getNextProblem(difficulty, problem.id)
    setProblemId(next.id)
    setCode(starterCode[language])
    setResult(null)
    setEditorScrollTop(0)
  }

  const resetCode = () => {
    setCode(starterCode[language])
    setResult(null)
    setEditorScrollTop(0)
  }

  return (
    <div className="grid gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">DSA Coach</h1>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">Practice Easy, Medium, and Hard coding questions with LeetCode-style review.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge color={badgeColor[difficulty]}>{solvedCount}/{problems.length} solved</Badge>
          {solved ? <Badge color="emerald">Accepted</Badge> : <Badge color="zinc">Unsolved</Badge>}
        </div>
      </header>

      <section className="grid min-h-0 gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
        <Card className="min-h-0 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-hidden">
          <Select label="Difficulty" value={difficulty} onChange={(event) => changeDifficulty(event.target.value)}>
            {difficulties.map((level) => <option key={level}>{level}</option>)}
          </Select>
          <div className="mt-5 flex items-center justify-between gap-3">
            <p className="text-sm font-extrabold text-zinc-950 dark:text-white">Problem List</p>
            <Badge color="zinc">{problems.length}</Badge>
          </div>
          <div className="dsa-problem-scroll mt-3 grid max-h-[24rem] gap-2 overflow-y-auto pr-1 lg:max-h-[calc(100vh-16rem)]">
            {problems.map((item) => {
              const active = item.id === problem.id
              const itemSolved = progress.solved.includes(item.id)
              return (
                <button
                  key={item.id}
                  onClick={() => { setProblemId(item.id); setResult(null) }}
                  className={`focus-ring flex items-center justify-between gap-3 rounded-lg border p-3 text-left transition ${active ? 'border-primary bg-violet-50 dark:bg-violet-500/15' : 'border-zinc-200 bg-white hover:border-primary/50 dark:border-white/10 dark:bg-white/[0.03]'}`}
                >
                  <span>
                    <span className="block text-sm font-extrabold text-zinc-950 dark:text-white">{item.title}</span>
                    <span className="mt-1 block text-xs font-semibold text-zinc-500">{item.topic}</span>
                  </span>
                  {itemSolved ? <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" /> : <Code2 className="h-5 w-5 shrink-0 text-zinc-400" />}
                </button>
              )
            })}
          </div>
        </Card>

        <div className="grid min-w-0 gap-4">
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge color={badgeColor[problem.difficulty]}>{problem.difficulty}</Badge>
                  <Badge color="zinc">{problem.topic}</Badge>
                </div>
                <h2 className="mt-3 text-2xl font-extrabold text-zinc-950 dark:text-white">{problem.title}</h2>
              </div>
              {solved ? <CheckCircle2 className="h-7 w-7 text-emerald-500" /> : null}
            </div>
            <p className="mt-4 text-sm leading-7 text-zinc-600 dark:text-zinc-300">{problem.prompt}</p>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {problem.examples.map((example) => (
                <div key={example.input} className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                  <p className="text-xs font-bold uppercase text-zinc-500">Example</p>
                  <p className="mt-2 text-sm font-semibold text-zinc-800 dark:text-zinc-100">Input: {example.input}</p>
                  <p className="mt-1 text-sm font-semibold text-zinc-800 dark:text-zinc-100">Output: {example.output}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {problem.constraints.map((constraint) => <Badge key={constraint} color="zinc">{constraint}</Badge>)}
            </div>
          </Card>

          <Card className="overflow-hidden p-0">
            <div className="border-b border-[#2d3342] bg-[#1e1e2e] px-4 py-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                    <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
                    <span className="h-3 w-3 rounded-full bg-[#28c840]" />
                  </div>
                  <div className="flex items-center gap-2 rounded-md bg-[#25263a] px-3 py-1.5 text-xs font-bold text-[#cdd6f4]">
                    <Code2 className="h-3.5 w-3.5 text-[#89b4fa]" />
                    solution.{language === 'Python' ? 'py' : language === 'Java' ? 'java' : 'js'}
                  </div>
                </div>
                <div className="flex flex-wrap items-end gap-2">
                  <Select label="Language" value={language} onChange={(event) => changeLanguage(event.target.value)} className="h-9 border-[#3b4261] bg-[#181825] text-[#cdd6f4] sm:w-44">
                    {Object.keys(starterCode).map((item) => <option key={item}>{item}</option>)}
                  </Select>
                  <Button size="sm" variant="outline" icon={RotateCcw} onClick={resetCode} className="border-[#3b4261] bg-[#25263a] text-[#cdd6f4] hover:border-[#89b4fa] hover:text-[#89b4fa]">Reset</Button>
                  <Button size="sm" icon={Send} onClick={submitSolution}>Submit</Button>
                </div>
              </div>
            </div>
            <div className="grid h-[32rem] grid-cols-[3.5rem_1fr] overflow-hidden bg-[#11111b]">
              <div className="select-none overflow-hidden border-r border-[#2d3342] bg-[#181825] px-3 py-4 text-right font-mono text-sm leading-6 text-[#6c7086]">
                <div style={{ transform: `translateY(-${editorScrollTop}px)` }}>
                  {lineNumbers.map((line) => <div key={line}>{line}</div>)}
                </div>
              </div>
              <div className="relative min-w-0">
                <div className="pointer-events-none absolute right-4 top-3 rounded-md border border-[#31364a] bg-[#181825]/90 px-2 py-1 text-xs font-bold text-[#a6e3a1]">O( )</div>
                <pre
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 overflow-hidden whitespace-pre-wrap break-words px-4 py-4 font-mono text-sm leading-6 text-[#cdd6f4]"
                  style={{ transform: `translateY(-${editorScrollTop}px)` }}
                >
                  <code dangerouslySetInnerHTML={{ __html: highlightedCode }} />
                </pre>
                <textarea
                  className="dsa-problem-scroll relative h-full w-full resize-none overflow-auto whitespace-pre-wrap break-words border-0 bg-transparent px-4 py-4 font-mono text-sm leading-6 text-transparent caret-[#f5c2e7] outline-none selection:bg-[#45475a] placeholder:text-[#6c7086]"
                  spellCheck="false"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  onScroll={(event) => setEditorScrollTop(event.currentTarget.scrollTop)}
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#2d3342] bg-[#181825] px-4 py-2 text-xs font-semibold text-[#a6adc8]">
              <span>{code.length} chars</span>
              <span className="text-[#89dceb]">Review checks: approach, return, complexity, implementation depth</span>
            </div>
          </Card>

          {result ? (
            <Card>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                  {result.accepted ? <CheckCircle2 className="mt-1 h-6 w-6 text-emerald-500" /> : <XCircle className="mt-1 h-6 w-6 text-rose-500" />}
                  <div>
                    <h2 className="text-xl font-extrabold text-zinc-950 dark:text-white">{result.verdict}</h2>
                    <p className="mt-1 text-sm text-zinc-500">{result.passedCases}/{result.totalCases} practice checks passed. Score: {result.score}/100.</p>
                  </div>
                </div>
                <Button variant={result.accepted ? 'primary' : 'outline'} icon={ChevronRight} onClick={nextQuestion} disabled={!result.accepted}>Next Question</Button>
              </div>
              <p className="mt-5 rounded-lg bg-zinc-50 p-4 text-sm leading-6 text-zinc-700 dark:bg-white/[0.04] dark:text-zinc-200">{result.review}</p>
              {result.improvements.length ? (
                <div className="mt-4 grid gap-2">
                  {result.improvements.map((item) => <p key={item} className="rounded-lg border border-zinc-200 p-3 text-sm font-medium text-zinc-600 dark:border-white/10 dark:text-zinc-300">{item}</p>)}
                </div>
              ) : null}
            </Card>
          ) : null}
        </div>
      </section>
    </div>
  )
}
