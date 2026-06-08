import { cn } from '../../utils/cn.js'

export default function Select({ label, children, className, ...props }) {
  return (
    <label className="block">
      {label ? <span className="mb-2 block text-sm font-semibold text-zinc-800 dark:text-zinc-100">{label}</span> : null}
      <select className={cn('focus-ring h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-900 shadow-sm dark:border-white/10 dark:bg-zinc-900 dark:text-white', className)} {...props}>
        {children}
      </select>
    </label>
  )
}
