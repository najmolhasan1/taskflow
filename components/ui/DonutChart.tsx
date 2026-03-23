'use client'
interface Props { pct: number }

export default function DonutChart({ pct }: Props) {
  const r = 38
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - pct / 100)
  const color = pct === 100 ? '#10b981' : pct > 50 ? '#4361ee' : '#f59e0b'

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-28 h-28">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r={r} fill="none" stroke="#eef0f7" strokeWidth="9" />
          <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="9"
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round" transform="rotate(-90 50 50)"
            style={{ transition: 'stroke-dashoffset .6s cubic-bezier(.4,0,.2,1), stroke .3s' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display font-bold text-2xl leading-none" style={{ color }}>{pct}%</span>
          <span className="text-[10px] font-mono text-ink-3 mt-0.5">সম্পন্ন</span>
        </div>
      </div>
    </div>
  )
}
