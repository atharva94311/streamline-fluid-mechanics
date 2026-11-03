/** Small theme-aware SVG helpers for the turbulence-modeling figures. */
import type { ReactNode } from 'react'

/** Straight arrow with a filled head (colour may be any CSS variable). */
export function Arrow({
  x1, y1, x2, y2, color = 'var(--ink-2)', width = 1.6, head = 8, dash, opacity,
}: {
  x1: number
  y1: number
  x2: number
  y2: number
  color?: string
  width?: number
  head?: number
  dash?: string
  opacity?: number
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
    <g opacity={opacity}>
      <line x1={x1} y1={y1} x2={bx} y2={by} stroke={color} strokeWidth={width} strokeDasharray={dash} strokeLinecap="round" />
      <polygon points={`${x2},${y2} ${bx + px},${by + py} ${bx - px},${by - py}`} fill={color} />
    </g>
  )
}

/** Double-headed dimension arrow with a centred label. */
export function Dim({
  x1, y1, x2, y2, label, offset = -6, color = 'var(--ink-2)', size = 13,
}: {
  x1: number
  y1: number
  x2: number
  y2: number
  label: ReactNode
  offset?: number
  color?: string
  size?: number
}) {
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2
  const vertical = Math.abs(x2 - x1) < Math.abs(y2 - y1)
  return (
    <g>
      <Arrow x1={mx} y1={my} x2={x1} y2={y1} color={color} width={1.2} head={7} />
      <Arrow x1={mx} y1={my} x2={x2} y2={y2} color={color} width={1.2} head={7} />
      <text
        x={vertical ? mx + 8 : mx}
        y={vertical ? my + 4 : my + offset}
        textAnchor={vertical ? 'start' : 'middle'}
        fontSize={size}
        className="fill-ink"
        fontStyle="italic"
        paintOrder="stroke"
        stroke="var(--surface)"
        strokeWidth={3}
      >
        {label}
      </text>
    </g>
  )
}

/** Small arrow head centred at (x, y) pointing along (dx, dy). */
export function Head({ x, y, dx, dy, color = 'var(--streamline)', size = 7 }: { x: number; y: number; dx: number; dy: number; color?: string; size?: number }) {
  const L = Math.hypot(dx, dy)
  if (!(L > 1e-9)) return null
  const ux = dx / L
  const uy = dy / L
  const tx = x + ux * size * 0.5
  const ty = y + uy * size * 0.5
  const bx = x - ux * size * 0.5
  const by = y - uy * size * 0.5
  const px = -uy * size * 0.45
  const py = ux * size * 0.45
  return <polygon points={`${tx},${ty} ${bx + px},${by + py} ${bx - px},${by - py}`} fill={color} />
}

/** Text label with an optional halo so it stays legible over coloured fields. */
export function Label({
  x, y, children, size = 12, anchor = 'middle', cls = 'fill-ink', weight, halo = true, italic = false,
}: {
  x: number
  y: number
  children: ReactNode
  size?: number
  anchor?: 'start' | 'middle' | 'end'
  cls?: string
  weight?: number
  halo?: boolean
  italic?: boolean
}) {
  return (
    <text
      x={x}
      y={y}
      fontSize={size}
      textAnchor={anchor}
      fontWeight={weight}
      fontStyle={italic ? 'italic' : undefined}
      className={cls}
      paintOrder={halo ? 'stroke' : undefined}
      stroke={halo ? 'var(--surface)' : undefined}
      strokeWidth={halo ? 3 : undefined}
      strokeLinejoin="round"
    >
      {children}
    </text>
  )
}

/** Boxed tag ("High", "Low" …) as used on the book's grey-scale CFD plots. */
export function Tag({ x, y, text, size = 11, tone = 'var(--ink)' }: { x: number; y: number; text: string; size?: number; tone?: string }) {
  const w = text.length * size * 0.56 + 10
  const h = size + 7
  return (
    <g>
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={4} fill="var(--surface)" stroke={tone} strokeWidth={1} opacity={0.94} />
      <text x={x} y={y + size * 0.36} fontSize={size} textAnchor="middle" fill={tone} fontWeight={600}>
        {text}
      </text>
    </g>
  )
}

/** Theme-aware intensity colour (0 → faint, 1 → saturated) built from a palette variable. */
export const heat = (g: number, base = 'var(--plot-5)') => {
  const p = Math.round(6 + 84 * Math.min(1, Math.max(0, g)))
  return `color-mix(in srgb, ${base} ${p}%, var(--surface-2))`
}
