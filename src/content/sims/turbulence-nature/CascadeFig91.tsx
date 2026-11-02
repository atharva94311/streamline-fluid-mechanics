import { Fragment } from 'react'
import { ArrowDown } from 'lucide-react'
import { cx } from '@/kit'

/** Wilkes Fig. 9.1 "Simplified overall picture of the cascade process" (p. 481), recreated as a 4 × 3 flowchart. */
const HEAD = ['Size of eddy', 'Eddy energy', 'Energy source', 'Fate of eddy']
const ROWS = [
  ['Large', 'High', 'From pressure energy of flow', 'Decomposes into medium eddies'],
  ['Medium', 'Medium', 'From large eddy', 'Decomposes into small eddies'],
  ['Small', 'Low', 'From medium eddy', 'Is annihilated by viscous action'],
]
const TONES = [
  'border-indigo-300 bg-indigo-50 dark:border-indigo-500/40 dark:bg-indigo-500/10',
  'border-violet-300 bg-violet-50 dark:border-violet-500/40 dark:bg-violet-500/10',
  'border-rose-300 bg-rose-50 dark:border-rose-500/40 dark:bg-rose-500/10',
]

export function CascadeFig91() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="grid grid-cols-4 gap-x-1.5 gap-y-0 sm:gap-x-3">
        {HEAD.map((h) => (
          <div key={h} className="pb-2 text-center text-[11px] font-bold leading-tight text-ink sm:text-sm">
            {h}
          </div>
        ))}
        {ROWS.map((row, r) => (
          <Fragment key={r}>
            {row.map((cell, c) => (
              <div
                key={`${r}-${c}`}
                className={cx(
                  'flex min-h-[3.25rem] items-center justify-center rounded-lg border px-1 py-1.5 text-center text-[10.5px] leading-snug text-ink sm:px-2 sm:text-[13px]',
                  TONES[r],
                  c === 3 && r === 2 && 'font-semibold',
                )}
              >
                {cell}
              </div>
            ))}
            {r < ROWS.length - 1
              ? HEAD.map((h) => (
                  <div key={`a-${r}-${h}`} className="flex justify-center py-0.5 text-ink-3">
                    <ArrowDown className="h-4 w-4" aria-hidden />
                  </div>
                ))
              : null}
          </Fragment>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-center gap-2 text-[12px] text-ink-3">
        <span className="inline-block h-2 w-8 rounded-full bg-gradient-to-r from-indigo-400 via-violet-400 to-rose-400" aria-hidden />
        mechanical energy handed down the chain → finally converted to heat by viscosity
      </div>
    </div>
  )
}
