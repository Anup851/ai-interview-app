import Card from './Card.jsx'

export default function MetricCard({ icon: Icon, label, value, trend, color = 'text-violet-500' }) {
  return (
    <Card className="transition duration-200 hover:-translate-y-1 hover:shadow-glow">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">{value}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-zinc-100 dark:bg-white/10">
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
      </div>
      <p className="mt-4 text-sm font-medium text-emerald-600 dark:text-emerald-300">{trend}</p>
    </Card>
  )
}
