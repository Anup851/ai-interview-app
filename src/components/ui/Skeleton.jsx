export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-lg bg-zinc-200/80 dark:bg-white/10 ${className}`} />
}

export function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="rounded-lg border border-dashed border-zinc-300 p-8 text-center dark:border-white/15">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-100 dark:bg-white/10">
        <Icon className="h-5 w-5 text-zinc-500" />
      </div>
      <h3 className="mt-4 text-base font-bold text-zinc-950 dark:text-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
    </div>
  )
}
