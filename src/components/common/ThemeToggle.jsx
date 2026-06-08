import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext.jsx'
import Tooltip from '../ui/Tooltip.jsx'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const Icon = theme === 'dark' ? Sun : Moon

  return (
    <Tooltip label={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
      <button onClick={toggleTheme} className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-700 transition hover:text-primary dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-200" aria-label="Toggle theme">
        <Icon className="h-4 w-4" />
      </button>
    </Tooltip>
  )
}
