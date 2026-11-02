import { useMemo } from 'react'
import { cx, renderTeX } from '@/kit'

/** Fluids offered in the Reynolds-stress sims (densities at about 20 °C). */
export const FLUIDS = {
  water: { label: 'water', rho: 998, mu: 1.0e-3 },
  air: { label: 'air', rho: 1.2, mu: 1.8e-5 },
} as const
export type FluidKey = keyof typeof FLUIDS

/**
 * TeX label placed inside an SVG through a foreignObject.
 * (x, y) is the anchor; `align` says which side of the box sits on x.
 */
export function SvgTeX({
  x, y, tex, w = 140, h = 26, align = 'center', size = 13, className,
}: {
  x: number
  y: number
  tex: string
  w?: number
  h?: number
  align?: 'left' | 'center' | 'right'
  size?: number
  className?: string
}) {
  const html = useMemo(() => renderTeX(tex), [tex])
  const left = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x
  return (
    <foreignObject x={left} y={y - h / 2} width={w} height={h} style={{ overflow: 'visible' }}>
      <div
        className={cx(
          'flex h-full items-center whitespace-nowrap leading-none text-ink',
          align === 'center' ? 'justify-center' : align === 'right' ? 'justify-end' : 'justify-start',
          className,
        )}
        style={{ fontSize: size }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </foreignObject>
  )
}

/** Straight arrow with a filled head (no <marker> ids needed, so it is safe to repeat). */
export function Arrow({
  x1, y1, x2, y2, color = 'var(--ink-2)', width = 1.6, head = 7, dash, opacity = 1,
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
  if (!Number.isFinite(L) || L < 0.5) return null
  const hd = Math.min(head, L * 0.6)
  const ux = dx / L
  const uy = dy / L
  const hx = x2 - ux * hd
  const hy = y2 - uy * hd
  const px = -uy * hd * 0.5
  const py = ux * hd * 0.5
  return (
    <g opacity={opacity}>
      <line x1={x1} y1={y1} x2={hx} y2={hy} stroke={color} strokeWidth={width} strokeDasharray={dash} strokeLinecap="round" />
      <polygon points={`${x2},${y2} ${hx + px},${hy + py} ${hx - px},${hy - py}`} fill={color} />
    </g>
  )
}

/** Fixed-decimal formatting with a proper minus sign (and no "−0.000"). */
export function fixed(v: number, d = 3): string {
  if (!Number.isFinite(v)) return '—'
  const s = v.toFixed(d)
  return /^-0\.?0*$/.test(s) ? s.slice(1) : s.replace('-', '−')
}
