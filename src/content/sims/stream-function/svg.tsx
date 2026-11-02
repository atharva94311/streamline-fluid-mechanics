/** Small theme-aware SVG drawing helpers for the stream-function figures and sims. */
import type { ReactNode } from 'react'

/** KaTeX fonts are loaded globally, so SVG labels can match the typeset maths. */
export const MATH_FONT = 'KaTeX_Math, "Times New Roman", serif'
export const MAIN_FONT = 'KaTeX_Main, "Times New Roman", serif'

/** Straight arrow with a filled head drawn as a polygon (colour follows any CSS variable). */
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

/** Arrowhead only, centred on (x, y) and pointing along (dx, dy). */
export function Head({ x, y, dx, dy, color = 'var(--streamline)', size = 8 }: { x: number; y: number; dx: number; dy: number; color?: string; size?: number }) {
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

/** SVG text label; `math` uses the italic KaTeX maths face. `halo` adds a background-coloured outline. */
export function Tx({
  x, y, children, size = 14, anchor = 'start', math = true, cls = 'fill-ink', weight, halo = false,
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

/**
 * Subscript inside a <Tx>: ψ<Sub>2</Sub>. The first tspan's `em` is its own (0.72×) size, so it drops by
 * 0.35 × 0.72 = 0.252 parent-em; the hair-space tspan (parent size) climbs back by exactly that amount.
 */
export function Sub({ children }: { children: ReactNode }) {
  return (
    <>
      <tspan dy="0.35em" fontSize="0.72em">
        {children}
      </tspan>
      <tspan dy="-0.252em">{' '}</tspan>
    </>
  )
}
