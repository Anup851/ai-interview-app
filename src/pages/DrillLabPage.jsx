import { CheckCircle2, Dumbbell, RotateCcw } from 'lucide-react'
import { useEffect, useState } from 'react'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Badge from '../components/ui/Badge.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { getWeakAreaDrills } from '../services/drillService.js'

export default function DrillLabPage() {
  const { user } = useAuth()
  const [drills, setDrills] = useState([])
  const [done, setDone] = useState([])

  useEffect(() => {
    getWeakAreaDrills(user?.id).then(setDrills).catch(() => setDrills([]))
  }, [user?.id])

  const toggleDone = (title) => setDone((items) => items.includes(title) ? items.filter((item) => item !== title) : [...items, title])

  return (
    <div className="grid gap-6">
      <header><h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">Weak-Area Drill Lab</h1><p className="mt-2 text-zinc-500 dark:text-zinc-400">Turn feedback into short targeted reps you can actually finish.</p></header>
      <section className="grid gap-4 lg:grid-cols-2">
        {drills.map((drill, index) => {
          const completed = done.includes(drill.title)
          return <Card key={drill.title}><div className="flex items-center justify-between gap-3"><Badge>Rep {index + 1}</Badge>{completed ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <Dumbbell className="h-5 w-5 text-primary" />}</div><h2 className="mt-4 text-lg font-extrabold text-zinc-950 dark:text-white">{drill.title}</h2><p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{drill.prompt}</p><textarea className="mt-4 min-h-28 w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-900 outline-none transition focus:border-primary focus:ring-4 focus:ring-violet-500/10 dark:border-white/10 dark:bg-zinc-950 dark:text-white" placeholder="Draft your improved answer here" /><Button className="mt-4" variant={completed ? 'secondary' : 'outline'} icon={completed ? RotateCcw : CheckCircle2} onClick={() => toggleDone(drill.title)}>{completed ? 'Mark Unfinished' : 'Mark Done'}</Button></Card>
        })}
      </section>
    </div>
  )
}
