import { cn } from '../../utils/cn.js'

export default function Input({ label, error, icon: Icon, className, ...props }) {
  return (
    <label className="block">
      {label ? <span className="mb-2 block text-sm font-semibold text-zinc-800 dark:text-zinc-100">{label}</span> : null}
      <span className="relative block">
        {Icon ? <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" /> : null}
        <input
          className={cn('focus-ring h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-950 shadow-sm transition placeholder:text-zinc-400 dark:border-white/10 dark:bg-white/[0.04] dark:text-white', Icon && 'pl-9', error && 'border-rose-400 focus-visible:outline-rose-500', className)}
          {...props}
        />
      </span>
      {error ? <span className="mt-1.5 block text-xs font-medium text-rose-600 dark:text-rose-400">{error}</span> : null}
    </label>
  )
}
