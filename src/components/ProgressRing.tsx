export function ProgressRing({
  value, size = 28, stroke = 3.5, color = 'currentColor', track = 'var(--line)', label,
}: {
  value: number
  size?: number
  stroke?: number
  color?: string
  track?: string
  label?: boolean
}) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const v = Math.max(0, Math.min(1, value))
  return (
    <span className="relative inline-flex shrink-0 items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${c * v} ${c}`}
          style={{ transition: 'stroke-dasharray 0.4s ease' }}
        />
      </svg>
      {label ? (
        <span className="absolute font-display font-bold text-ink" style={{ fontSize: size * 0.24 }}>
          {Math.round(v * 100)}%
        </span>
      ) : null}
    </span>
  )
}

export function Bar({ value, className = 'bg-indigo-500' }: { value: number; className?: string }) {
  return (
    <span className="block h-1.5 w-full overflow-hidden rounded-full bg-line">
      <span className={`block h-full rounded-full transition-all duration-500 ${className}`} style={{ width: `${Math.round(Math.max(0, Math.min(1, value)) * 100)}%` }} />
    </span>
  )
}
