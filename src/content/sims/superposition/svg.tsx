import type { ReactNode, RefObject } from 'react'
import { useElementSize } from '@/kit'

/** Equal-aspect data→pixel frame that follows the container width (labels stay at a fixed pixel size). */
export interface Frame {
  ref: RefObject<HTMLDivElement | null>
  W: number
  H: number
  plotW: number
  offX: number
  /** pixels per data unit */
  k: number
  sx: (v: number) => number
  sy: (v: number) => number
}

export function useFrame(x: [number, number], y: [number, number], maxHeight = 420, minWidth = 240): Frame {
  const [ref, size] = useElementSize<HTMLDivElement>()
  const W = Math.max(minWidth, size.width || 640)
  const aspect = (y[1] - y[0]) / (x[1] - x[0])
  const H = Math.min(maxHeight, W * aspect)
  const plotW = H / aspect
  const offX = (W - plotW) / 2
  const k = plotW / (x[1] - x[0])
  return { ref, W, H, plotW, offX, k, sx: (v) => offX + (v - x[0]) * k, sy: (v) => H - (v - y[0]) * k }
}

/** Straight arrow (pixel coordinates) with a filled triangular head — no <marker> ids needed. */
export function ArrowLine({
  x1, y1, x2, y2, color, width = 1.8, head = 8, dash, opacity,
}: {
  x1: number
  y1: number
  x2: number
  y2: number
  color: string
  width?: number
  head?: number
  dash?: string
  opacity?: number
}) {
  const dx = x2 - x1
  const dy = y2 - y1
  const L = Math.hypot(dx, dy)
  if (!(L > 0.5) || !Number.isFinite(L)) return null
  const ux = dx / L
  const uy = dy / L
  const h = Math.min(head, L * 0.6)
  const bx = x2 - ux * h
  const by = y2 - uy * h
  const px = -uy * h * 0.42
  const py = ux * h * 0.42
  return (
    <g opacity={opacity}>
      <line x1={x1} y1={y1} x2={bx} y2={by} stroke={color} strokeWidth={width} strokeDasharray={dash} strokeLinecap="round" />
      <path d={`M${x2.toFixed(1)} ${y2.toFixed(1)}L${(bx + px).toFixed(1)} ${(by + py).toFixed(1)}L${(bx - px).toFixed(1)} ${(by - py).toFixed(1)}Z`} fill={color} />
    </g>
  )
}

/** Arrowhead only, centred on (x, y) and pointing along (ux, uy) in pixel space. */
export function Head({ x, y, ux, uy, size = 7, color }: { x: number; y: number; ux: number; uy: number; size?: number; color: string }) {
  const L = Math.hypot(ux, uy) || 1
  const a = ux / L
  const c = uy / L
  const tipX = x + a * size * 0.6
  const tipY = y + c * size * 0.6
  const bx = x - a * size * 0.4
  const by = y - c * size * 0.4
  const px = -c * size * 0.45
  const py = a * size * 0.45
  return <path d={`M${tipX.toFixed(1)} ${tipY.toFixed(1)}L${(bx + px).toFixed(1)} ${(by + py).toFixed(1)}L${(bx - px).toFixed(1)} ${(by - py).toFixed(1)}Z`} fill={color} />
}

/** Dimension line with arrowheads at both ends (pixel coordinates). */
export function DimLine({ x1, y1, x2, y2, color = 'var(--ink-2)' }: { x1: number; y1: number; x2: number; y2: number; color?: string }) {
  return (
    <g>
      <ArrowLine x1={(x1 + x2) / 2} y1={(y1 + y2) / 2} x2={x1} y2={y1} color={color} width={1.2} head={7} />
      <ArrowLine x1={(x1 + x2) / 2} y1={(y1 + y2) / 2} x2={x2} y2={y2} color={color} width={1.2} head={7} />
    </g>
  )
}

/** Text with a surface-coloured halo so it stays legible over streamlines in both themes. */
export function Label({
  x, y, children, anchor = 'start', size = 12, weight = 600, className = 'fill-ink', italic = false,
}: {
  x: number
  y: number
  children: ReactNode
  anchor?: 'start' | 'middle' | 'end'
  size?: number
  weight?: number
  className?: string
  italic?: boolean
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      className={className}
      style={{ fontSize: size, fontWeight: weight, fontStyle: italic ? 'italic' : undefined }}
      paintOrder="stroke"
      stroke="var(--surface)"
      strokeWidth={3.5}
      strokeLinejoin="round"
    >
      {children}
    </text>
  )
}
