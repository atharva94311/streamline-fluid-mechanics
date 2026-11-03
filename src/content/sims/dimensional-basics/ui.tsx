/**
 * Layout helpers for the dimensional-basics sims.
 *  - SimBody: visualization full width, then controls and readouts side by side (stacked on phones). The topic column
 *    is narrow on desktop, so charts get the whole width instead of sharing it with the control column.
 *  - Tiles: stat tiles like the kit Readout, but WITHOUT upper-casing the labels — upper-casing turns ρ, μ into Ρ, Μ
 *    and Re into RE, which changes the meaning of the math.
 */
import type { ReactNode } from 'react'
import { Md, cx, num } from '@/kit'

export function SimBody({ viz, controls, readout }: { viz: ReactNode; controls?: ReactNode; readout?: ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="min-w-0">{viz}</div>
      {controls || readout ? (
        <div className="grid gap-4 md:grid-cols-2">
          {controls ? <div className="min-w-0 space-y-3">{controls}</div> : null}
          {readout ? <div className="min-w-0">{readout}</div> : null}
        </div>
      ) : null}
    </div>
  )
}

export interface Tile {
  /** Markdown; may contain $TeX$. Rendered as written (no upper-casing). */
  label: string
  value: number | string
  unit?: string
  digits?: number
  tone?: 'default' | 'good' | 'bad' | 'accent'
}

export function Tiles({ items }: { items: Tile[] }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {items.map((it, i) => (
        <div
          key={i}
          className={cx(
            'min-w-0 rounded-xl border px-3 py-2',
            it.tone === 'good' && 'border-emerald-300 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10',
            it.tone === 'bad' && 'border-red-300 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10',
            it.tone === 'accent' && 'border-teal-300 bg-teal-50 dark:border-teal-500/30 dark:bg-teal-500/10',
            (!it.tone || it.tone === 'default') && 'border-line bg-surface',
          )}
        >
          <div className="text-[12px] font-medium text-ink-3">
            <Md inline>{it.label}</Md>
          </div>
          <div className="break-words font-mono text-base font-semibold text-ink">
            {typeof it.value === 'number' ? num.fmt(it.value, it.digits ?? 3) : it.value}
            {it.unit ? <span className="ml-1 font-sans text-xs font-normal text-ink-3">{it.unit}</span> : null}
          </div>
        </div>
      ))}
    </div>
  )
}
