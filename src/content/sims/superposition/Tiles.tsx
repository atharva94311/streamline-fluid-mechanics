import { cx, Md, num } from '@/kit'

export interface Tile {
  label: string
  value: number | string
  unit?: string
  digits?: number
  tone?: 'default' | 'good' | 'bad' | 'accent'
}

/**
 * Readout tiles like the kit's <Readout>, but labels keep their case — upper-casing would turn
 * TeX symbols into different ones (b → B, θ → Θ, π → Π).
 */
export function Tiles({ items, cols = 2 }: { items: Tile[]; cols?: 1 | 2 }) {
  return (
    <div className={cx('grid gap-2', cols === 1 ? 'grid-cols-1' : 'grid-cols-2')}>
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
          <div className="text-[11.5px] font-medium leading-snug text-ink-3">
            <Md inline>{it.label}</Md>
          </div>
          <div className="break-words font-mono text-[15px] font-semibold text-ink">
            {typeof it.value === 'number' ? (Number.isFinite(it.value) ? num.fmt(it.value, it.digits ?? 3) : '—') : it.value}
            {it.unit ? <span className="ml-1 font-sans text-xs font-normal text-ink-3">{it.unit}</span> : null}
          </div>
        </div>
      ))}
    </div>
  )
}
