/** Small theme-aware SVG drawing helpers for the flow-net figures and simulations. */
import type { ReactNode } from 'react'

/** KaTeX fonts are loaded globally, so SVG labels can match the typeset maths. */
export const MATH_FONT = 'KaTeX_Math, "Times New Roman", serif'
export const MAIN_FONT = 'KaTeX_Main, "Times New Roman", serif'

/** Straight arrow with a filled head (colour follows any CSS variable). Screen coordinates. */
export function Arrow({
  x1, y1, x2, y2, color = 'var(--ink)', width = 2, head = 9, dash, opacity, both = false,
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
  /** Draw a head at both ends (dimension line). */
  both?: boolean
}) {
  const dx = x2 - x1
  const dy = y2 - y1
  const L = Math.hypot(dx, dy)
  if (!(L > 1e-6) || !Number.isFinite(L)) return null
  const ux = dx / L
  const uy = dy / L
  const hl = Math.min(head, L * (both ? 0.4 : 0.6))
  const px = -uy * hl * 0.42
  const py = ux * hl * 0.42
  const bx = x2 - ux * hl
  const by = y2 - uy * hl
  const ax = x1 + ux * hl
  const ay = y1 + uy * hl
  return (
    <g opacity={opacity} pointerEvents="none">
      <line
        x1={both ? ax : x1}
        y1={both ? ay : y1}
        x2={bx}
        y2={by}
        stroke={color}
        strokeWidth={width}
        strokeDasharray={dash}
        strokeLinecap="round"
      />
      <polygon points={`${x2},${y2} ${bx + px},${by + py} ${bx - px},${by - py}`} fill={color} />
      {both ? <polygon points={`${x1},${y1} ${ax + px},${ay + py} ${ax - px},${ay - py}`} fill={color} /> : null}
    </g>
  )
}

/** SVG text label; `math` uses the italic KaTeX maths face. `halo` adds a background-coloured outline. */
export function Tx({
  x, y, children, size = 14, anchor = 'start', math = true, cls = 'fill-ink', weight, halo = false, fill,
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
  /** Explicit fill (e.g. a CSS variable); overrides the class colour. */
  fill?: string
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
      className={fill ? undefined : cls}
      fill={fill}
      paintOrder={halo ? 'stroke' : undefined}
      stroke={halo ? 'var(--surface)' : undefined}
      strokeWidth={halo ? 3.5 : undefined}
      strokeLinejoin={halo ? 'round' : undefined}
      pointerEvents="none"
    >
      {children}
    </text>
  )
}

/** Upright (non-italic) span inside a <Tx>, e.g. for digits, = signs and ∂. */
export function Up({ children }: { children: ReactNode }) {
  return (
    <tspan fontFamily={MAIN_FONT} fontStyle="normal">
      {children}
    </tspan>
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
      <tspan dy="-0.252em">{' '}</tspan>
    </>
  )
}

/** Right-angle marker at corner (x, y) between unit directions d1 and d2 (screen coordinates). */
export function RightAngle({
  x, y, d1, d2, size = 9, color = 'var(--ink-2)',
}: {
  x: number
  y: number
  d1: [number, number]
  d2: [number, number]
  size?: number
  color?: string
}) {
  const ax = x + d1[0] * size
  const ay = y + d1[1] * size
  const bx = x + d2[0] * size
  const by = y + d2[1] * size
  const cx = x + (d1[0] + d2[0]) * size
  const cy = y + (d1[1] + d2[1]) * size
  return <path d={`M${ax} ${ay}L${cx} ${cy}L${bx} ${by}`} fill="none" stroke={color} strokeWidth={1.2} pointerEvents="none" />
}

/** Polyline path string through a list of screen points. */
export function polyPath(pts: [number, number][]): string {
  return pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join('')
}
