import { useState } from 'react'
import { CheckCircle2, ChevronDown, Star } from 'lucide-react'
import type { FormulaDef } from '@/lib/types'
import { progress, useProgress } from '@/lib/store'
import { lookup, useRevealAll, useTopic } from './context'
import { M, MathBlock, Md } from './Md'
import { Origin } from './SourceChip'
import { cx } from './cx'

/**
 * Equation card: big equation, "where" table for every symbol, validity conditions and usage.
 * Use <FormulaCard id="..."/> inside a topic (looks up `formulas`) or pass `f` directly.
 */
export function FormulaCard({ f, id, topicId, compact = false }: { f?: FormulaDef; id?: string; topicId?: string; compact?: boolean }) {
  const topic = useTopic()
  const def = f ?? lookup(topic?.formulas, id ?? '', 'Formula')
  const tId = topicId ?? topic?.meta.id ?? 'global'
  const revealAll = useRevealAll()
  const p = useProgress()
  const starred = !!p.stars[progress.key(tId, def.id)]
  const [open, setOpen] = useState(!compact)
  const hasDetails = !!(def.vars?.length || def.conditions?.length || def.use)
  const showDetails = revealAll || open

  return (
    <div data-formula={def.id} className="formula-card overflow-hidden rounded-2xl border border-indigo-200/80 bg-surface shadow-sm dark:border-indigo-500/25">
      <div className="flex flex-wrap items-center gap-2 border-b border-indigo-100 bg-indigo-50/70 px-4 py-2.5 dark:border-indigo-500/20 dark:bg-indigo-500/10">
        <span className="font-semibold text-ink">{def.name}</span>
        {def.key ? (
          <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">Key</span>
        ) : null}
        <span className="ml-auto flex items-center gap-2">
          <Origin src={def.src} size="xs" supplementLabel="Supplementary" />
          <button
            type="button"
            onClick={() => progress.toggleStar(tId, def.id)}
            title={starred ? 'Remove from my formula list' : 'Star for revision'}
            aria-label={starred ? 'Unstar formula' : 'Star formula'}
            className="rounded-lg p-1 text-ink-3 transition hover:bg-surface hover:text-amber-500"
          >
            <Star className={cx('h-4 w-4', starred && 'fill-amber-400 text-amber-500')} />
          </button>
        </span>
      </div>
      <div className="px-4 py-3">
        <MathBlock tex={def.tex} tag={def.tag} className="formula-eq" />
      </div>
      {hasDetails ? (
        <div className="border-t border-line">
          {compact ? (
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              className="flex w-full items-center gap-2 px-4 py-2 text-left text-xs font-semibold text-ink-3 hover:text-ink"
            >
              <ChevronDown className={cx('h-4 w-4 transition', showDetails && 'rotate-180')} />
              {showDetails ? 'Hide details' : 'Variables & conditions'}
            </button>
          ) : null}
          {showDetails ? (
            <div className="grid gap-4 px-4 pb-4 pt-3 md:grid-cols-[1.4fr_1fr]">
              {def.vars?.length ? (
                <div>
                  <div className="mb-1.5 text-xs font-bold uppercase tracking-wider text-ink-3">Where</div>
                  <table className="vars-table w-full text-sm">
                    <tbody>
                      {def.vars.map((v, i) => (
                        <tr key={i} className="border-b border-line/70 last:border-0">
                          <td className="w-[1%] whitespace-nowrap py-1.5 pr-3 align-top">
                            <M tex={v.sym} />
                          </td>
                          <td className="py-1.5 pr-2 align-top text-ink-2">
                            <Md inline>{v.desc}</Md>
                          </td>
                          <td className="whitespace-nowrap py-1.5 text-right align-top text-xs text-ink-3">
                            {v.units ? <M tex={v.units} /> : null}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
              <div className="space-y-3">
                {def.conditions?.length ? (
                  <div>
                    <div className="mb-1.5 text-xs font-bold uppercase tracking-wider text-ink-3">Valid when</div>
                    <ul className="space-y-1">
                      {def.conditions.map((c, i) => (
                        <li key={i} className="flex gap-2 text-sm text-ink-2">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" aria-hidden />
                          <Md inline>{c}</Md>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {def.use ? (
                  <div>
                    <div className="mb-1.5 text-xs font-bold uppercase tracking-wider text-ink-3">How to use it</div>
                    <Md className="text-sm text-ink-2 md-tight">{def.use}</Md>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
