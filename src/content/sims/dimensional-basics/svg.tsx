/** Small SVG helpers for the dimensional-basics figures (own copy — no cross-topic imports). */
import { useMemo } from 'react'
import { cx, renderTeX } from '@/kit'

/** KaTeX label inside an SVG via foreignObject. (x, y) is the anchor; y is the vertical centre. */
export function TeXLabel({
  x, y, tex, w = 160, h = 24, anchor = 'start', className,
}: {
  x: number
  y: number
  tex: string
  w?: number
  h?: number
  anchor?: 'start' | 'middle' | 'end'
  className?: string
}) {
  const html = useMemo(() => renderTeX(tex), [tex])
  const fx = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x
  return (
    <foreignObject x={fx} y={y - h / 2} width={w} height={h} style={{ overflow: 'visible', pointerEvents: 'none' }}>
      <div
        className={cx(
          'flex h-full items-center whitespace-nowrap text-[12px] text-ink',
          anchor === 'middle' ? 'justify-center' : anchor === 'end' ? 'justify-end' : 'justify-start',
          className,
        )}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </foreignObject>
  )
}

/** Straight arrow with a filled head drawn as a polygon (so any CSS colour works without marker defs). */
export function Arrow({
  x1, y1, x2, y2, color = 'var(--ink-2)', width = 1.6, head = 6, dash,
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
  const len = Math.hypot(dx, dy)
  if (len < 1e-6) return null
  const ux = dx / len
  const uy = dy / len
  const h = Math.min(head, len * 0.6)
  const bx = x2 - ux * h
  const by = y2 - uy * h
  const px = -uy * h * 0.55
  const py = ux * h * 0.55
  return (
    <g>
      <line x1={x1} y1={y1} x2={bx} y2={by} stroke={color} strokeWidth={width} strokeDasharray={dash} strokeLinecap="round" />
      <polygon points={`${x2},${y2} ${bx + px},${by + py} ${bx - px},${by - py}`} fill={color} />
    </g>
  )
}

/** Unicode superscript for integer exponents (−3 → ⁻³). */
export function sup(n: number): string {
  const map: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }
  return String(n)
    .split('')
    .map((c) => map[c] ?? c)
    .join('')
}

/** "10ⁿ" label for decade ticks. */
export const decade = (v: number) => {
  const e = Math.round(Math.log10(v))
  if (e === 0) return '1'
  if (e === 1) return '10'
  return `10${sup(e)}`
}
