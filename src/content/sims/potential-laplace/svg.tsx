/** Small theme-aware SVG drawing helpers for the velocity-potential / Laplace figures and sims. */
import type { ReactNode } from 'react'

/** KaTeX fonts are loaded globally, so SVG labels can match the typeset maths. */
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

/** Subscript inside a <Tx>: φ<Sub>P</Sub>. */
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

/** Small rigid paddle wheel (four blades) drawn at screen point (cx, cy), turned by `angle` radians (math sense, CCW +). */
export function PaddleWheel({ cx, cy, r = 16, angle, color = 'var(--plot-6)' }: { cx: number; cy: number; r?: number; angle: number; color?: string }) {
  const deg = (-angle * 180) / Math.PI // screen y points down → CCW in maths = negative SVG rotation
  return (
    <g transform={`translate(${cx},${cy}) rotate(${deg.toFixed(2)})`}>
      <circle r={r + 3} fill="var(--surface)" fillOpacity={0.55} stroke={color} strokeWidth={1.2} strokeDasharray="2 3" />
      {[0, 1, 2, 3].map((k) => (
        <g key={k} transform={`rotate(${k * 90})`}>
          <line x1={0} y1={0} x2={r} y2={0} stroke={color} strokeWidth={2.4} strokeLinecap="round" />
          <rect x={r - 6} y={-3.5} width={6} height={7} rx={1.5} fill={color} />
        </g>
      ))}
      <circle r={3} fill={color} />
    </g>
  )
}
