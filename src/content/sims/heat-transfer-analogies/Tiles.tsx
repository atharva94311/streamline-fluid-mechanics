import { Md, cx, num } from '@/kit'

export interface Tile {
  /** Markdown label; may contain $TeX$ (rendered without upper-casing, so symbols keep their case). */
  label: string
  value: number | string
  unit?: string
  digits?: number
  tone?: 'default' | 'good' | 'bad' | 'accent'
  /** Optional one-line note under the value. */
  note?: string
}

const TONE: Record<NonNullable<Tile['tone']>, string> = {
  default: 'border-line bg-surface',
  good: 'border-emerald-300 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10',
  bad: 'border-red-300 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10',
  accent: 'border-teal-300 bg-teal-50 dark:border-teal-500/30 dark:bg-teal-500/10',
}

/**
 * Stat tiles for live readouts. Same look as the kit's Readout, but labels are not upper-cased —
 * upper-casing would turn TeX symbols such as $\tau_w$ or $m$ into different symbols.
 */
export function Tiles({ items, cols = 2 }: { items: Tile[]; cols?: 1 | 2 | 3 }) {
  return (
    <div className={cx('grid gap-2', cols === 1 ? 'grid-cols-1' : cols === 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3')}>
      {items.map((it, i) => (
        <div key={i} className={cx('min-w-0 rounded-xl border px-3 py-2', TONE[it.tone ?? 'default'])}>
          <div className="text-[11.5px] font-medium leading-snug text-ink-3">
            <Md inline>{it.label}</Md>
          </div>
          <div className="font-mono text-[15px] font-semibold text-ink">
            {typeof it.value === 'number' ? num.fmt(it.value, it.digits ?? 3) : it.value}
            {it.unit ? <span className="ml-1 font-sans text-xs font-normal text-ink-3">{it.unit}</span> : null}
          </div>
          {it.note ? (
            <div className="text-[11px] leading-snug text-ink-3">
              <Md inline>{it.note}</Md>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  )
}
