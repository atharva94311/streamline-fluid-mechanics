import type { ReactNode } from 'react'

/** Small SVG helpers shared by the elementary-flow diagrams (theme colours via CSS variables only). */

const DEG = Math.PI / 180
export const rad = (deg: number) => deg * DEG

/** Straight arrow with a filled triangular head. */
export function Arrow({
  x1, y1, x2, y2, color = 'var(--ink)', width = 1.6, head = 7, dash, opacity,
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
  if (!(L > 1e-6)) return null
  const ux = dx / L
  const uy = dy / L
  const h = Math.min(head, L * 0.6)
  const bx = x2 - ux * h
  const by = y2 - uy * h
  const px = -uy * h * 0.45
  const py = ux * h * 0.45
  return (
    <g opacity={opacity}>
      <line x1={x1} y1={y1} x2={bx} y2={by} stroke={color} strokeWidth={width} strokeDasharray={dash} strokeLinecap="round" />
      <path d={`M${x2.toFixed(2)} ${y2.toFixed(2)}L${(bx + px).toFixed(2)} ${(by + py).toFixed(2)}L${(bx - px).toFixed(2)} ${(by - py).toFixed(2)}Z`} fill={color} />
    </g>
  )
}

/** SVG text with a surface-coloured halo so it stays legible over lines. */
export function Label({
  x, y, children, anchor = 'start', size = 12, color = 'var(--ink-2)', weight, italic = false, halo = true,
}: {
  x: number
  y: number
  children: ReactNode
  anchor?: 'start' | 'middle' | 'end'
  size?: number
  color?: string
  weight?: number
  italic?: boolean
  halo?: boolean
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      fontSize={size}
      fill={color}
      fontWeight={weight}
      fontStyle={italic ? 'italic' : undefined}
      paintOrder={halo ? 'stroke' : undefined}
      stroke={halo ? 'var(--surface)' : undefined}
      strokeWidth={halo ? 3 : undefined}
      strokeLinejoin="round"
    >
      {children}
    </text>
  )
}

/**
 * SVG arc path (screen coordinates, y down) for a WORLD angle range a0 → a1 (radians, counter-clockwise positive),
 * centred at (cx, cy) with radius r.
 */
export function arcPath(cx: number, cy: number, r: number, a0: number, a1: number): string {
  const x0 = cx + r * Math.cos(a0)
  const y0 = cy - r * Math.sin(a0)
  const x1 = cx + r * Math.cos(a1)
  const y1 = cy - r * Math.sin(a1)
  const large = Math.abs(a1 - a0) > Math.PI ? 1 : 0
  const sweep = a1 > a0 ? 0 : 1
  return `M${x0.toFixed(2)} ${y0.toFixed(2)}A${r} ${r} 0 ${large} ${sweep} ${x1.toFixed(2)} ${y1.toFixed(2)}`
}
