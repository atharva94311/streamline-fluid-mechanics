import { useEffect, useState, type ReactNode, type RefObject } from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'
import { cx } from '@/kit'

/** Axis colours used consistently across the continuity sims (theme-aware CSS variables). */
export const AX = {
  x: 'var(--plot-1)',
  y: 'var(--plot-5)',
  z: 'var(--plot-3)',
  pos: 'var(--plot-4)',
  neg: 'var(--plot-1)',
  ok: 'var(--plot-5)',
} as const

/**
 * True only while the element is actually on screen. Unlike the kit's `useInView` it returns **false** where
 * IntersectionObserver is unavailable (e.g. the jsdom test environment), so animations never start there.
 */
export function useOnScreen<T extends Element>(ref: RefObject<T | null>, rootMargin = '120px'): boolean {
  const [on, setOn] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { rootMargin })
    io.observe(el)
    return () => io.disconnect()
  }, [ref, rootMargin])
  return on
}

/** Format a number for use inside TeX: trims trailing zeros, never uses exponent notation for normal ranges. */
export function tn(x: number, digits = 3): string {
  if (!Number.isFinite(x)) return '\\infty'
  if (Math.abs(x) < 1e-12) return '0'
  const s = String(parseFloat(x.toFixed(digits)))
  return s
}

/** Plain-text number with a proper minus sign. */
export function pn(x: number, digits = 3): string {
  return tn(x, digits).replace('-', '−')
}

/**
 * TeX for a sum of terms [coefficient, monomial]. Zero terms are dropped, unit coefficients are hidden,
 * signs are merged ("+ -" never appears). Returns '0' for an all-zero sum.
 */
export function sumTeX(terms: [number, string][], digits = 3): string {
  let out = ''
  for (const [c, mono] of terms) {
    if (Math.abs(c) < 1e-12) continue
    const neg = c < 0
    const mag = Math.abs(c)
    const coef = mono && Math.abs(mag - 1) < 1e-12 ? '' : tn(mag, digits)
    const body = `${coef}${mono}`
    if (!out) out = neg ? `-${body}` : body
    else out += neg ? ` - ${body}` : ` + ${body}`
  }
  return out || '0'
}

/** Pass / fail badge for continuity checks. */
export function Verdict({ ok, children, className }: { ok: boolean; children: ReactNode; className?: string }) {
  return (
    <div
      role="status"
      className={cx(
        'flex items-start gap-2 rounded-xl border px-3 py-2 text-sm font-semibold',
        ok
          ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200'
          : 'border-red-300 bg-red-50 text-red-800 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200',
        className,
      )}
    >
      {ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />}
      <span className="min-w-0">{children}</span>
    </div>
  )
}

/** SVG arrow-head marker definitions, one per colour. Use `url(#${id}-${key})`. */
export function ArrowMarkers({ id, colors, size = 6 }: { id: string; colors: Record<string, string>; size?: number }) {
  return (
    <>
      {Object.entries(colors).map(([k, c]) => (
        <marker
          key={k}
          id={`${id}-${k}`}
          viewBox="0 0 10 10"
          refX="8.5"
          refY="5"
          markerWidth={size}
          markerHeight={size}
          orient="auto-start-reverse"
          markerUnits="strokeWidth"
        >
          <path d="M0 0L10 5L0 10z" fill={c} />
        </marker>
      ))}
    </>
  )
}

/** Shoelace area of a closed polygon given as [x, y] pairs. */
export function polygonArea(pts: [number, number][]): number {
  let s = 0
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i]
    const [x2, y2] = pts[(i + 1) % pts.length]
    s += x1 * y2 - x2 * y1
  }
  return Math.abs(s) / 2
}

/** Triangle wave in [0, 1] with period 1 (0 → 1 → 0). */
export const tri = (p: number) => {
  const f = p - Math.floor(p)
  return f < 0.5 ? 2 * f : 2 - 2 * f
}
