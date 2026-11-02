import { useState } from 'react'
import { BadgeCheck, CheckCircle2, HelpCircle, ListOrdered, RotateCcw, Target, XCircle } from 'lucide-react'
import type { PracticeDef } from '@/lib/types'
import { progress, useProgress } from '@/lib/store'
import { closeTo, parseNumber } from '@/lib/math'
import { lookup, useRevealAll, useTopic } from './context'
import { M, Md } from './Md'
import { Origin } from './SourceChip'
import { DifficultyDots } from './ExampleCard'
import { cx } from './cx'

/** Practice problem with hint, numeric self-check, short answer and full worked solution. */
export function PracticeCard({ p, id, topicId, n }: { p?: PracticeDef; id?: string; topicId?: string; n?: number }) {
  const topic = useTopic()
  const def = p ?? lookup(topic?.practice, id ?? '', 'Practice')
  const tId = topicId ?? topic?.meta.id ?? 'global'
  const revealAll = useRevealAll()
  const store = useProgress()
  const rec = store.practice[progress.key(tId, def.id)]
  const [hint, setHint] = useState(revealAll)
  const [ans, setAns] = useState(revealAll)
  const [sol, setSol] = useState(revealAll)
  const [inputs, setInputs] = useState<string[]>(() => (def.check ?? []).map(() => ''))
  const [results, setResults] = useState<(boolean | null)[]>(() => (def.check ?? []).map(() => null))

  const runCheck = () => {
    const r = (def.check ?? []).map((c, i) => closeTo(parseNumber(inputs[i]), c.value, c.tol ?? 0.02))
    setResults(r)
    if (r.length && r.every(Boolean)) progress.recordPractice(tId, def.id, true)
  }

  return (
    <article className="practice-card rounded-2xl border border-orange-200 bg-surface shadow-sm dark:border-orange-500/25" id={`pr-${def.id}`}>
      <header className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-orange-100 px-4 py-2.5 dark:border-orange-500/20">
        <Target className="h-4.5 w-4.5 text-orange-500" aria-hidden />
        <span className="text-sm font-bold text-ink">Practice{n != null ? ` ${n}` : ''}</span>
        <DifficultyDots d={def.difficulty} />
        {rec ? (
          <span
            className={cx(
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold',
              rec.ok ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
            )}
          >
            {rec.ok ? <BadgeCheck className="h-3.5 w-3.5" /> : <RotateCcw className="h-3.5 w-3.5" />}
            {rec.ok ? 'Solved' : 'Review again'}
          </span>
        ) : null}
        <span className="ml-auto">
          <Origin src={def.src} size="xs" supplementLabel="Supplementary problem" />
        </span>
      </header>
      <div className="space-y-3 p-4">
        <Md>{def.q}</Md>

        {def.check?.length ? (
          <div className="rounded-xl bg-surface-2 p-3">
            <div className="mb-2 text-xs font-bold uppercase tracking-wider text-ink-3">Check your numbers</div>
            <div className="flex flex-wrap items-end gap-3">
              {def.check.map((c, i) => (
                <label key={i} className="flex flex-col gap-1 text-sm">
                  <span className="text-ink-2">{c.label ? <Md inline>{c.label}</Md> : `Answer ${i + 1}`}</span>
                  <span className="flex items-center gap-1.5">
                    <input
                      inputMode="decimal"
                      value={inputs[i]}
                      onChange={(e) => setInputs((xs) => xs.map((x, j) => (j === i ? e.target.value : x)))}
                      onKeyDown={(e) => e.key === 'Enter' && runCheck()}
                      placeholder="e.g. 1.2e-3"
                      className="w-36 rounded-lg border border-line bg-surface px-2.5 py-1.5 font-mono text-sm text-ink outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/30"
                    />
                    {c.units ? <M tex={c.units} className="text-xs text-ink-3" /> : null}
                    {results[i] === true ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : null}
                    {results[i] === false ? <XCircle className="h-5 w-5 text-red-500" /> : null}
                  </span>
                </label>
              ))}
              <button type="button" onClick={runCheck} className="btn-primary bg-orange-500 hover:bg-orange-600">
                Check
              </button>
            </div>
            {results.some((r) => r === false) ? (
              <p className="mt-2 text-xs text-ink-3">Not within {Math.round((def.check[0].tol ?? 0.02) * 100)} % yet — recheck units and intermediate values, or open the hint.</p>
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {def.hint ? (
            <button type="button" onClick={() => setHint((h) => !h)} className="btn-ghost">
              <HelpCircle className="h-4 w-4" /> {hint ? 'Hide hint' : 'Hint'}
            </button>
          ) : null}
          <button type="button" onClick={() => setAns((a) => !a)} className="btn-ghost">
            <CheckCircle2 className="h-4 w-4" /> {ans ? 'Hide answer' : 'Show answer'}
          </button>
          <button type="button" onClick={() => setSol((s) => !s)} className="btn-ghost">
            <ListOrdered className="h-4 w-4" /> {sol ? 'Hide solution' : 'Full solution'}
          </button>
        </div>

        {hint && def.hint ? (
          <div className="rounded-xl bg-sky-50 px-3 py-2 text-sm dark:bg-sky-500/10">
            <span className="font-semibold text-sky-700 dark:text-sky-300">Hint: </span>
            <Md inline>{def.hint}</Md>
          </div>
        ) : null}
        {ans ? (
          <div className="rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 dark:border-emerald-500/30 dark:bg-emerald-500/10">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">Answer</span>
            <Md className="md-tight">{def.answer}</Md>
          </div>
        ) : null}
        {sol ? (
          <div className="rounded-xl border border-line bg-surface-2 px-4 py-3">
            <div className="mb-1 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink-3">
              Worked solution
              {def.src ? (
                <span className="font-medium normal-case tracking-normal text-fuchsia-700 dark:text-fuchsia-300">
                  · problem from the PDF, solution written for this platform
                </span>
              ) : null}
            </div>
            <Md className="md-tight">{def.solution}</Md>
            {!revealAll ? (
              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3">
                <span className="text-sm text-ink-3">How did it go?</span>
                <button type="button" onClick={() => progress.recordPractice(tId, def.id, true)} className="btn-ghost text-emerald-700 dark:text-emerald-300">
                  <BadgeCheck className="h-4 w-4" /> I solved it
                </button>
                <button type="button" onClick={() => progress.recordPractice(tId, def.id, false)} className="btn-ghost text-amber-700 dark:text-amber-300">
                  <RotateCcw className="h-4 w-4" /> Needs review
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  )
}

/** All practice problems of the current topic for one concept (or an explicit id list). */
export function PracticeList({ concept, ids }: { concept?: string; ids?: string[] }) {
  const topic = useTopic()
  const items = ids
    ? ids.map((i) => lookup(topic?.practice, i, 'Practice'))
    : (topic?.practice ?? []).filter((p) => p.concept === concept)
  if (!items.length) throw new Error(`[content] <PracticeList concept="${concept}"> found no practice problems`)
  return (
    <div className="space-y-4">
      {items.map((p, i) => (
        <PracticeCard key={p.id} p={p} n={i + 1} />
      ))}
    </div>
  )
}
