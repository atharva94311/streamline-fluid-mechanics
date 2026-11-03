/** Theme-aware straight arrow with a polygon head (colour follows any CSS variable). */
export function Arrow({
  x1, y1, x2, y2, color = 'var(--ink)', width = 2, head = 9, dash,
}: {
  x1: number
  y1: number
  x2: number
  y2: number
  color?: string
  width?: number
  head?: number
  dash?: string
}) {
  const dx = x2 - x1
  const dy = y2 - y1
  const L = Math.hypot(dx, dy)
  if (!(L > 1e-6) || !Number.isFinite(L)) return null
  const ux = dx / L
  const uy = dy / L
  const hl = Math.min(head, L * 0.6)
  const bx = x2 - ux * hl
  const by = y2 - uy * hl
  const px = -uy * hl * 0.42
  const py = ux * hl * 0.42
  return (
    <g>
      <line x1={x1} y1={y1} x2={bx} y2={by} stroke={color} strokeWidth={width} strokeDasharray={dash} strokeLinecap="round" />
      <polygon points={`${x2},${y2} ${bx + px},${by + py} ${bx - px},${by - py}`} fill={color} />
    </g>
  )
}
