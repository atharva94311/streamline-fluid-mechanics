import { useEffect, useState } from 'react'
import { Calculator, ChevronsDown, Eye, EyeOff, Flag, Lightbulb, RotateCcw, StepForward } from 'lucide-react'
import type { Difficulty, ExampleDef } from '@/lib/types'
import { progress } from '@/lib/store'
import { lookup, useRevealAll, useTopic } from './context'
import { Md } from './Md'
import { Origin } from './SourceChip'
import { cx } from './cx'

export function DifficultyDots({ d }: { d?: Difficulty }) {
  if (!d) return null
  const label = ['', 'Basic', 'Intermediate', 'Challenging'][d]
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-ink-3" title={`Difficulty: ${label}`}>
      {[1, 2, 3].map((i) => (
        <span key={i} className={cx('h-1.5 w-1.5 rounded-full', i <= d ? 'bg-orange-500' : 'bg-line')} />
      ))}
      <span className="ml-0.5">{label}</span>
    </span>
  )
}

/** Step-by-step solved example with progressive reveal. */
export function ExampleCard({ e, id, topicId }: { e?: ExampleDef; id?: string; topicId?: string }) {
  const topic = useTopic()
  const def = e ?? lookup(topic?.examples, id ?? '', 'Example')
  const tId = topicId ?? topic?.meta.id ?? 'global'
  const revealAll = useRevealAll()
  const total = def.steps.length
  const [shown, setShown] = useState(revealAll ? total : 0)
  const [answer, setAnswer] = useState(revealAll)
  const done = shown >= total

  useEffect(() => {
    if (done && answer && !revealAll) progress.markExample(tId, def.id)
  }, [done, answer, revealAll, tId, def.id])

  return (
    <article className="example-card overflow-hidden rounded-2xl border border-emerald-200 bg-surface shadow-sm dark:border-emerald-500/25" id={`ex-${def.id}`}>
      <header className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-3 dark:border-emerald-500/20 dark:from-emerald-500/10 dark:to-teal-500/5">
        <Calculator className="h-5 w-5 text-emerald-600 dark:text-emerald-300" aria-hidden />
        <h4 className="font-display text-base font-bold text-ink">{def.title}</h4>
        <DifficultyDots d={def.difficulty} />
        <span className="ml-auto flex flex-wrap items-center justify-end gap-1.5">
          <Origin src={def.src} size="xs" supplementLabel="Supplementary example" />
          {def.src && def.solutionBy === 'platform' ? (
            <span
              title="The PDF states this problem; the step-by-step solution was written for this platform."
              className="rounded-full border border-dashed border-fuchsia-300 px-2 py-0.5 text-[11px] font-medium text-fuchsia-700 dark:border-fuchsia-500/40 dark:text-fuchsia-300"
            >
              solution written here
            </span>
          ) : null}
        </span>
      </header>

      <div className="space-y-4 p-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-xl bg-surface-2 p-3">
            <div className="mb-1 text-xs font-bold uppercase tracking-wider text-ink-3">Given</div>
            <Md className="md-tight text-[0.95rem]">{def.given}</Md>
          </div>
          <div className="rounded-xl bg-surface-2 p-3">
            <div className="mb-1 text-xs font-bold uppercase tracking-wider text-ink-3">Find</div>
            <Md className="md-tight text-[0.95rem]">{def.find}</Md>
          </div>
        </div>
        {def.assumptions ? (
          <div className="rounded-xl border border-dashed border-line px-3 py-2">
            <span className="text-xs font-bold uppercase tracking-wider text-ink-3">Assumptions </span>
            <Md inline className="text-sm text-ink-2">{def.assumptions}</Md>
          </div>
        ) : null}

        <ol className="space-y-3">
          {def.steps.slice(0, shown).map((s, i) => (
            <li key={i} className="example-step flex gap-3">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1 rounded-xl border border-line bg-surface px-3.5 py-2.5">
                {s.title ? <div className="mb-1 font-semibold text-ink">{s.title}</div> : null}
                <Md className="md-tight">{s.md}</Md>
                {s.fig ? <div className="mt-3">{s.fig}</div> : null}
              </div>
            </li>
          ))}
        </ol>

        {answer || done ? (
          <div className="rounded-xl border-2 border-emerald-500/60 bg-emerald-50 px-4 py-3 dark:bg-emerald-500/10">
            <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
              <Flag className="h-4 w-4" /> Answer
            </div>
            <Md className="md-tight font-medium">{def.answer}</Md>
          </div>
        ) : null}
        {def.insight && done ? (
          <div className="flex gap-2 rounded-xl bg-amber-50 px-3 py-2 text-sm text-ink-2 dark:bg-amber-500/10">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
            <Md inline>{def.insight}</Md>
          </div>
        ) : null}

        {!revealAll ? (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {!done ? (
              <button type="button" onClick={() => setShown((s) => Math.min(total, s + 1))} className="btn-primary bg-emerald-600 hover:bg-emerald-700">
                <StepForward className="h-4 w-4" />
                {shown === 0 ? 'Start solution' : 'Next step'} <span className="opacity-75">({shown}/{total})</span>
              </button>
            ) : null}
            {!done ? (
              <button type="button" onClick={() => { setShown(total); setAnswer(true) }} className="btn-ghost">
                <ChevronsDown className="h-4 w-4" /> Show all steps
              </button>
            ) : null}
            {!done ? (
              <button type="button" onClick={() => setAnswer((a) => !a)} className="btn-ghost">
                {answer ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />} {answer ? 'Hide answer' : 'Peek at answer'}
              </button>
            ) : null}
            {shown > 0 ? (
              <button type="button" onClick={() => { setShown(0); setAnswer(false) }} className="btn-ghost ml-auto">
                <RotateCcw className="h-4 w-4" /> Try it yourself again
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  )
}
