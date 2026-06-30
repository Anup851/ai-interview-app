import { Copy, Download, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import Card from '../components/ui/Card.jsx'
import Input from '../components/ui/Input.jsx'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { listAnswerStories } from '../services/storyBankService.js'
import { downloadTextFile } from '../utils/download.js'

export default function StoryBankPage() {
  const { user } = useAuth()
  const { pushToast } = useToast()
  const [query, setQuery] = useState('')
  const [stories, setStories] = useState([])

  useEffect(() => {
    listAnswerStories(user?.id).then(setStories).catch(() => setStories([]))
  }, [user?.id])

  const filtered = useMemo(() => {
    const term = query.toLowerCase()
    return stories.filter((story) => `${story.role} ${story.question} ${story.transcript}`.toLowerCase().includes(term))
  }, [stories, query])

  const copyStory = async (story) => {
    await navigator.clipboard.writeText(`${story.question}\n\n${story.transcript}`)
    pushToast('Story copied.')
  }

  const downloadStories = () => {
    const report = filtered.flatMap((story) => [`${story.role} - ${story.date}`, story.question, story.transcript, '']).join('\n')
    downloadTextFile('preppilot-story-bank.txt', report)
    pushToast('Story bank downloaded.')
  }

  return (
    <div className="grid gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div><h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">Answer Story Bank</h1><p className="mt-2 text-zinc-500 dark:text-zinc-400">Reuse your strongest saved answers for technical, behavioral, and leadership prep.</p></div>
        <Button variant="outline" icon={Download} onClick={downloadStories}>Download Bank</Button>
      </header>
      <Card><Input icon={Search} placeholder="Search stories, roles, or keywords" value={query} onChange={(event) => setQuery(event.target.value)} /></Card>
      <section className="grid gap-4 lg:grid-cols-2">
        {filtered.length ? filtered.map((story) => <Card key={story.id}><div className="flex flex-wrap items-center justify-between gap-3"><Badge color="zinc">{story.role}</Badge><span className="text-xs font-bold text-zinc-500">{story.answer_seconds}s · Score {story.score}</span></div><h2 className="mt-4 text-base font-extrabold text-zinc-950 dark:text-white">{story.question}</h2><p className="mt-3 line-clamp-5 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{story.transcript}</p><Button className="mt-5" size="sm" variant="outline" icon={Copy} onClick={() => copyStory(story)}>Copy Story</Button></Card>) : <Card><p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Complete a mock interview to build your answer story bank.</p></Card>}
      </section>
    </div>
  )
}
