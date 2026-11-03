/** Small SVG + UI helpers for the buckingham-pi figures and sims (own copy — no cross-topic imports). */
import { useMemo, type CSSProperties, type ReactNode } from 'react'
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

/** Inline TeX (HTML, not SVG). */
export function TeX({ tex, display = false, className }: { tex: string; display?: boolean; className?: string }) {
  const html = useMemo(() => renderTeX(display ? `\\displaystyle ${tex}` : tex), [tex, display])
  return <span className={cx(display ? 'block overflow-x-auto py-1' : 'inline', className)} dangerouslySetInnerHTML={{ __html: html }} />
}

/** Straight arrow with a filled head drawn as a polygon. */
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
  const hd = Math.min(head, len * 0.6)
  const bx = x2 - ux * hd
  const by = y2 - uy * hd
  const px = -uy * hd * 0.55
  const py = ux * hd * 0.55
  return (
    <g>
      <line x1={x1} y1={y1} x2={bx} y2={by} stroke={color} strokeWidth={width} strokeDasharray={dash} strokeLinecap="round" />
      <polygon points={`${x2},${y2} ${bx + px},${by + py} ${bx - px},${by - py}`} fill={color} />
    </g>
  )
}

/** Double-headed dimension arrow. */
export function DimArrow(props: { x1: number; y1: number; x2: number; y2: number; color?: string; width?: number; head?: number }) {
  const mx = (props.x1 + props.x2) / 2
  const my = (props.y1 + props.y2) / 2
  return (
    <g>
      <Arrow {...props} x1={mx} y1={my} x2={props.x2} y2={props.y2} />
      <Arrow {...props} x1={mx} y1={my} x2={props.x1} y2={props.y1} />
    </g>
  )
}

/** Small pill-shaped toggle button used for variable chips. */
export function Chip({
  active, disabled, onClick, children, tone = 'teal', title,
}: {
  active: boolean
  disabled?: boolean
  onClick?: () => void
  children: ReactNode
  tone?: 'teal' | 'amber' | 'rose'
  title?: string
}) {
  const on =
    tone === 'amber'
      ? 'border-amber-400 bg-amber-100 text-amber-900 dark:border-amber-400/60 dark:bg-amber-500/20 dark:text-amber-100'
      : tone === 'rose'
        ? 'border-rose-400 bg-rose-100 text-rose-900 dark:border-rose-400/60 dark:bg-rose-500/20 dark:text-rose-100'
        : 'border-teal-500 bg-teal-100 text-teal-900 dark:border-teal-400/60 dark:bg-teal-500/20 dark:text-teal-100'
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={cx(
        'inline-flex min-h-[32px] items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold transition',
        active ? on : 'border-line bg-surface text-ink-2 hover:bg-surface-2',
        disabled && 'cursor-not-allowed opacity-50',
      )}
    >
      {children}
    </button>
  )
}

/** Tinted cell colour for a dimension exponent (theme-aware via color-mix). */
export function expCellStyle(e: number): CSSProperties {
  if (e === 0) return {}
  const c = e > 0 ? 'var(--plot-1)' : 'var(--plot-2)'
  const pct = Math.min(45, 12 + 9 * Math.abs(e))
  return { background: `color-mix(in srgb, ${c} ${pct}%, transparent)` }
}
