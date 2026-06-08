import { Sparkles } from 'lucide-react'

export default function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-primary to-secondary text-white shadow-glow">
        <Sparkles className="h-4 w-4" />
      </div>
      <span className="text-lg font-extrabold tracking-tight text-zinc-950 dark:text-white">PrepPilot</span>
    </div>
  )
}
