/** Small theme-aware SVG helpers for the similitude figures and sims. */
import type { ReactNode } from 'react'

export const MATH_FONT = 'KaTeX_Math, "Times New Roman", serif'
export const MAIN_FONT = 'KaTeX_Main, "Times New Roman", serif'

/** Straight arrow with a filled head (colour follows any CSS variable). */
export function Arrow({
  x1, y1, x2, y2, color = 'var(--ink)', width = 2, head = 9, dash, opacity,
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

/** SVG text label; `math` uses the italic KaTeX maths face. `halo` adds a surface-coloured outline. */
export function Tx({
  x, y, children, size = 14, anchor = 'start', math = false, cls = 'fill-ink', weight, halo = false,
}: {
  x: number
  y: number
  children: ReactNode
  size?: number
  anchor?: 'start' | 'middle' | 'end'
  math?: boolean
  cls?: string
  weight?: number
  halo?: boolean
}) {
  return (
    <text
      x={x}
      y={y}
      fontSize={size}
      textAnchor={anchor}
      fontFamily={math ? MATH_FONT : MAIN_FONT}
      fontStyle={math ? 'italic' : 'normal'}
      fontWeight={weight}
      className={cls}
      paintOrder={halo ? 'stroke' : undefined}
      stroke={halo ? 'var(--surface)' : undefined}
      strokeWidth={halo ? 3.5 : undefined}
      strokeLinejoin={halo ? 'round' : undefined}
    >
      {children}
    </text>
  )
}

/** Subscript inside a <Tx>. */
export function Sub({ children }: { children: ReactNode }) {
  return (
    <>
      <tspan dy="0.35em" fontSize="0.72em">
        {children}
      </tspan>
      <tspan dy="-0.252em">{' '}</tspan>
    </>
  )
}

/** Compact number formatting for SVG labels (3 significant figures, scientific when large/small). */
export function sci(v: number, sig = 3): string {
  if (!Number.isFinite(v)) return '—'
  if (v === 0) return '0'
  const a = Math.abs(v)
  if (a >= 1e4 || a < 1e-3) {
    const e = Math.floor(Math.log10(a))
    const m = v / 10 ** e
    return `${m.toFixed(sig - 1)}×10${superscriptSigned(e)}`
  }
  return Number(v.toPrecision(sig)).toString()
}

const SUP: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }
function superscriptSigned(n: number) {
  return String(n)
    .split('')
    .map((c) => SUP[c] ?? c)
    .join('')
}
