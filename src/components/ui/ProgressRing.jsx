export default function ProgressRing({ value, size = 132, label = 'Score' }) {
  const stroke = 11
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference

  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-zinc-100 dark:text-white/10" />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="url(#scoreGradient)" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} />
        <defs>
          <linearGradient id="scoreGradient" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#4F46E5" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute text-center">
        <p className="text-3xl font-extrabold text-zinc-950 dark:text-white">{value}</p>
        <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{label}</p>
      </div>
    </div>
  )
}
