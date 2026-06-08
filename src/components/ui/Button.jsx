import { Loader2 } from 'lucide-react'
import { cn } from '../../utils/cn.js'

const variants = {
  primary: 'bg-primary text-white shadow-glow hover:bg-violet-700',
  secondary: 'bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200',
  outline: 'border border-zinc-200 bg-white text-zinc-800 hover:border-primary/50 hover:text-primary dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-100',
  ghost: 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-white/10',
  danger: 'bg-rose-600 text-white hover:bg-rose-700'
}

export default function Button({ children, variant = 'primary', size = 'md', className, loading, icon: Icon, ...props }) {
  const sizes = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-11 px-5 text-sm',
    lg: 'h-12 px-6 text-base'
  }

  return (
    <button
      className={cn('focus-ring inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-60', variants[variant], sizes[size], className)}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : Icon ? <Icon className="h-4 w-4" /> : null}
      {children}
    </button>
  )
}
