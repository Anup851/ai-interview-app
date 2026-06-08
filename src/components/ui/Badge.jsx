import { cn } from '../../utils/cn.js'

export default function Badge({ children, color = 'violet', className }) {
  const colors = {
    violet: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-200',
    emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200',
    rose: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-200',
    zinc: 'bg-zinc-100 text-zinc-700 dark:bg-white/10 dark:text-zinc-200'
  }
  return <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold', colors[color], className)}>{children}</span>
}
