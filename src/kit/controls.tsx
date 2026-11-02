import type { ReactNode } from 'react'
import { Pause, Play, RotateCcw } from 'lucide-react'
import { fmt } from '@/lib/math'
import type { SrcLike } from '@/lib/types'
import { Md } from './Md'
import { SourceChips } from './SourceChip'
import { cx } from './cx'

/** Labelled range slider. `label` may contain $TeX$. Set `log` for a logarithmic slider (min > 0). */
export function Slider({
  label, value, min, max, step, onChange, unit, digits = 3, log = false, format,
}: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (v: number) => void
  unit?: string
  digits?: number
  log?: boolean
  format?: (v: number) => string
}) {
  const toPos = (v: number) => (log ? Math.log10(v) : v)
  const fromPos = (p: number) => (log ? 10 ** p : p)
  const pMin = toPos(min)
  const pMax = toPos(max)
  const pStep = log ? (pMax - pMin) / 400 : step ?? (max - min) / 200
  return (
    <label className="slider block">
      <span className="mb-1 flex items-baseline justify-between gap-2 text-sm">
        <span className="text-ink-2">
          <Md inline>{label}</Md>
        </span>
        <span className="font-mono text-[13px] font-semibold text-ink">
          {format ? format(value) : fmt(value, digits)}
          {unit ? <span className="ml-1 font-sans text-xs font-normal text-ink-3">{unit}</span> : null}
        </span>
      </span>
      <input
        type="range"
        min={pMin}
        max={pMax}
        step={pStep}
        value={toPos(value)}
        onChange={(e) => onChange(fromPos(+e.target.value))}
        className="range w-full"
      />
    </label>
  )
}

export function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 text-sm text-ink-2">
      <span>
        <Md inline>{label}</Md>
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cx('relative h-5 w-9 shrink-0 rounded-full transition', checked ? 'bg-teal-500' : 'bg-line')}
      >
        <span className={cx('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all', checked ? 'left-[18px]' : 'left-0.5')} />
      </button>
    </label>
  )
}

export function Segmented<T extends string | number>({
  options, value, onChange, label,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
  label?: string
}) {
  return (
    <div className="segmented">
      {label ? (
        <div className="mb-1 text-sm text-ink-2">
          <Md inline>{label}</Md>
        </div>
      ) : null}
      <div className="flex flex-wrap gap-1 rounded-xl bg-surface-2 p-1">
        {options.map((o) => (
          <button
            key={String(o.value)}
            type="button"
            onClick={() => onChange(o.value)}
            className={cx(
              'flex-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition',
              o.value === value ? 'bg-teal-600 text-white shadow-sm' : 'text-ink-3 hover:bg-surface hover:text-ink',
            )}
          >
            <Md inline>{o.label}</Md>
          </button>
        ))}
      </div>
    </div>
  )
}

export interface ReadoutItem {
  label: string
  value: number | string
  unit?: string
  digits?: number
  tone?: 'default' | 'good' | 'bad' | 'accent'
}

/** Grid of computed values (stat tiles). Labels may contain $TeX$. */
export function Readout({ items, cols = 2 }: { items: ReadoutItem[]; cols?: 1 | 2 | 3 | 4 }) {
  return (
    <div className={cx('grid gap-2', cols === 1 ? 'grid-cols-1' : cols === 2 ? 'grid-cols-2' : cols === 3 ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-4')}>
      {items.map((it, i) => (
        <div
          key={i}
          className={cx(
            'rounded-xl border px-3 py-2',
            it.tone === 'good' && 'border-emerald-300 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10',
            it.tone === 'bad' && 'border-red-300 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10',
            it.tone === 'accent' && 'border-teal-300 bg-teal-50 dark:border-teal-500/30 dark:bg-teal-500/10',
            (!it.tone || it.tone === 'default') && 'border-line bg-surface',
          )}
        >
          <div className="text-[11px] font-medium uppercase tracking-wide text-ink-3">
            <Md inline>{it.label}</Md>
          </div>
          <div className="font-mono text-base font-semibold text-ink">
            {typeof it.value === 'number' ? fmt(it.value, it.digits ?? 3) : it.value}
            {it.unit ? <span className="ml-1 font-sans text-xs font-normal text-ink-3">{it.unit}</span> : null}
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Layout for an interactive demo: visualization on the left, controls + readouts on the right.
 * Put sliders/toggles in `controls`; numbers in `readout`.
 */
export function SimPanel({
  title, subtitle, children, controls, readout, footer, src, wide = false,
}: {
  title?: string
  subtitle?: string
  children: ReactNode
  controls?: ReactNode
  readout?: ReactNode
  footer?: ReactNode
  src?: SrcLike
  wide?: boolean
}) {
  return (
    <div className="sim-panel overflow-hidden rounded-2xl border border-teal-200 bg-surface shadow-sm dark:border-teal-500/25">
      {title ? (
        <div className="flex flex-wrap items-center gap-2 border-b border-teal-100 bg-gradient-to-r from-teal-50 to-cyan-50 px-4 py-2.5 dark:border-teal-500/20 dark:from-teal-500/10 dark:to-cyan-500/5">
          <span className="font-display font-bold text-ink">{title}</span>
          {subtitle ? <span className="text-sm text-ink-3"><Md inline>{subtitle}</Md></span> : null}
          {src ? <SourceChips src={src} size="xs" className="ml-auto" /> : null}
        </div>
      ) : null}
      <div className={cx('grid gap-4 p-4', controls || readout ? (wide ? 'lg:grid-cols-[1fr_300px]' : 'md:grid-cols-[1fr_280px]') : '')}>
        <div className="min-w-0">{children}</div>
        {controls || readout ? (
          <div className="space-y-4">
            {controls ? <div className="space-y-3">{controls}</div> : null}
            {readout}
          </div>
        ) : null}
      </div>
      {footer ? <div className="border-t border-line px-4 py-3 text-sm text-ink-2">{footer}</div> : null}
    </div>
  )
}

/** Frame for a static or animated diagram with caption. */
export function Figure({ children, caption, src }: { children: ReactNode; caption?: string; src?: SrcLike }) {
  return (
    <figure className="figure overflow-hidden rounded-2xl border border-violet-200 bg-surface dark:border-violet-500/25">
      <div className="p-3 sm:p-4">{children}</div>
      {caption || src ? (
        <figcaption className="flex flex-wrap items-center gap-2 border-t border-line bg-surface-2/60 px-4 py-2 text-sm text-ink-2">
          {caption ? <Md inline>{caption}</Md> : null}
          {src ? (
            <span className="ml-auto inline-flex items-center gap-1 text-xs text-ink-3">
              Recreated from <SourceChips src={src} size="xs" />
            </span>
          ) : null}
        </figcaption>
      ) : null}
    </figure>
  )
}

export function PlayPause({ playing, onToggle, onReset }: { playing: boolean; onToggle: () => void; onReset?: () => void }) {
  return (
    <div className="flex gap-2">
      <button type="button" onClick={onToggle} className="btn-primary bg-teal-600 hover:bg-teal-700">
        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        {playing ? 'Pause' : 'Play'}
      </button>
      {onReset ? (
        <button type="button" onClick={onReset} className="btn-ghost">
          <RotateCcw className="h-4 w-4" /> Reset
        </button>
      ) : null}
    </div>
  )
}
