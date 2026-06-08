import { Wand2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import Input from '../components/ui/Input.jsx'
import Select from '../components/ui/Select.jsx'
import Badge from '../components/ui/Badge.jsx'
import { questions } from '../data/mockData.js'
import { useToast } from '../context/ToastContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { generateQuestions as generateQuestionSet, listLatestQuestions } from '../services/questionService.js'

const skills = ['React', 'Node.js', 'System Design', 'Leadership', 'SQL', 'AI Products']

export default function InterviewGeneratorPage() {
  const [selected, setSelected] = useState(['React', 'System Design'])
  const [role, setRole] = useState('Senior Frontend Engineer')
  const [level, setLevel] = useState('Senior')
  const [style, setStyle] = useState('Balanced')
  const { user, isConfigured } = useAuth()
  const [generated, setGenerated] = useState(isConfigured ? [] : questions)
  const [loading, setLoading] = useState(false)
  const { pushToast } = useToast()

  useEffect(() => {
    if (!isConfigured) return
    listLatestQuestions(user?.id).then(setGenerated).catch(() => setGenerated([]))
  }, [isConfigured, user?.id])

  const generateQuestions = async () => {
    setLoading(true)
    try {
      const nextQuestions = await generateQuestionSet({ userId: user?.id, role, level, style, skills: selected })
      setGenerated(nextQuestions)
      pushToast(`Generated ${nextQuestions.length} role-specific interview questions.`)
    } catch (error) {
      pushToast(error.message || 'Question generation failed.', 'info')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-6">
      <header><h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">AI Interview Generator</h1><p className="mt-2 text-zinc-500 dark:text-zinc-400">Create targeted questions from role, seniority, and skill signals.</p></header>
      <Card>
        <div className="grid gap-4 lg:grid-cols-3"><Input label="Job role" placeholder="Senior Frontend Engineer" value={role} onChange={(event) => setRole(event.target.value)} /><Select label="Experience level" value={level} onChange={(event) => setLevel(event.target.value)}><option>Mid-level</option><option>Senior</option><option>Lead</option><option>Entry-level</option></Select><Select label="Question style" value={style} onChange={(event) => setStyle(event.target.value)}><option>Balanced</option><option>Technical deep dive</option><option>Behavioral</option><option>System design</option></Select></div>
        <div className="mt-5"><p className="mb-3 text-sm font-bold text-zinc-800 dark:text-zinc-100">Skills</p><div className="flex flex-wrap gap-2">{skills.map((skill) => <button key={skill} onClick={() => setSelected((items) => items.includes(skill) ? items.filter((item) => item !== skill) : [...items, skill])} className={`focus-ring rounded-full px-3 py-2 text-sm font-bold transition ${selected.includes(skill) ? 'bg-primary text-white' : 'bg-zinc-100 text-zinc-700 dark:bg-white/10 dark:text-zinc-200'}`}>{skill}</button>)}</div></div>
        <Button className="mt-6" icon={Wand2} onClick={generateQuestions} loading={loading}>Generate Questions</Button>
      </Card>
      <section className="grid gap-4">
        {generated.length ? generated.map((question, index) => <Card key={`${question}-${index}`} className="flex items-start gap-4"><Badge>{String(index + 1).padStart(2, '0')}</Badge><p className="text-sm font-semibold leading-6 text-zinc-800 dark:text-zinc-100">{question}</p></Card>) : <Card><p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">No generated questions yet for this user.</p></Card>}
      </section>
    </div>
  )
}
