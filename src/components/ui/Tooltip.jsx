export default function Tooltip({ label, children }) {
  return (
    <span className="group relative inline-flex">
      {children}
      <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-zinc-950 px-2 py-1 text-xs font-semibold text-white opacity-0 shadow-lg transition group-hover:opacity-100 dark:bg-white dark:text-zinc-950">
        {label}
      </span>
    </span>
  )
}
