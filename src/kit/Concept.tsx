import type { ReactNode } from 'react'
import {
  BookOpen, Calculator, CheckCircle2, Circle, Eye, Lightbulb, ListChecks, Sigma, SlidersHorizontal, Target, Workflow,
} from 'lucide-react'
import type { SrcLike } from '@/lib/types'
import { progress, useProgress } from '@/lib/store'
import { UNIT_THEME } from '@/lib/theme'
import { useTopic } from './context'
import { Md } from './Md'
import { SourceChips, SupplementBadge } from './SourceChip'
import { cx } from './cx'

export type StepKind =
  | 'intro' | 'intuition' | 'visual' | 'equations' | 'derivation' | 'example' | 'interactive' | 'practice' | 'takeaways'

export const STEP_META: Record<StepKind, { label: string; icon: typeof BookOpen; accent: string; pill: string; n: number }> = {
  intro: { n: 1, label: 'Concept', icon: BookOpen, accent: 'border-sky-400/70', pill: 'bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300' },
  intuition: { n: 2, label: 'Physical intuition', icon: Lightbulb, accent: 'border-amber-400/80', pill: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300' },
  visual: { n: 3, label: 'Visual explanation', icon: Eye, accent: 'border-violet-400/70', pill: 'bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300' },
  equations: { n: 4, label: 'Equations & assumptions', icon: Sigma, accent: 'border-indigo-400/70', pill: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-300' },
  derivation: { n: 4, label: 'Derivation', icon: Workflow, accent: 'border-slate-400/70', pill: 'bg-slate-200 text-slate-800 dark:bg-slate-500/20 dark:text-slate-200' },
  example: { n: 5, label: 'Solved example', icon: Calculator, accent: 'border-emerald-400/70', pill: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300' },
  interactive: { n: 6, label: 'Interactive demo', icon: SlidersHorizontal, accent: 'border-teal-400/70', pill: 'bg-teal-100 text-teal-800 dark:bg-teal-500/15 dark:text-teal-300' },
  practice: { n: 7, label: 'Practice', icon: Target, accent: 'border-orange-400/70', pill: 'bg-orange-100 text-orange-800 dark:bg-orange-500/15 dark:text-orange-300' },
  takeaways: { n: 8, label: 'Key takeaways', icon: ListChecks, accent: 'border-rose-400/70', pill: 'bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300' },
}

/**
 * One concept of a topic. Title, number and sources come from `meta.concepts` (looked up by id).
 * Children are a sequence of <Step kind=...> blocks following the 8-step teaching flow.
 */
export function Concept({ id, children }: { id: string; children: ReactNode }) {
  const topic = useTopic()
  const idx = topic ? topic.meta.concepts.findIndex((c) => c.id === id) : -1
  if (!topic || idx < 0) throw new Error(`[content] <Concept id="${id}"> is not listed in meta.concepts`)
  const meta = topic.meta.concepts[idx]
  const theme = UNIT_THEME[topic.meta.unit]
  const p = useProgress()
  const done = !!p.concepts[progress.key(topic.meta.id, id)]

  return (
    <section id={`c-${id}`} data-concept={id} className="concept scroll-mt-24 py-8 first:pt-2">
      <header className="mb-6 flex flex-wrap items-start gap-4">
        <div
          className={cx(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br font-display text-lg font-bold text-white shadow-lg shadow-black/10',
            theme.grad,
          )}
        >
          {idx + 1}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold uppercase tracking-wider text-ink-3">
            Concept {idx + 1} of {topic.meta.concepts.length}
          </div>
          <h2 className="font-display text-2xl font-bold leading-tight text-ink sm:text-[1.7rem]">{meta.title}</h2>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <SourceChips src={meta.src} />
            {!meta.src ? <SupplementBadge /> : null}
          </div>
        </div>
        {done ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4" /> Understood
          </span>
        ) : null}
      </header>

      <div className="concept-body">{children}</div>

      <footer className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface-2/60 px-4 py-3">
        <span className="text-sm text-ink-2">
          {done ? 'Marked as understood — it counts toward your progress.' : 'Worked through the steps above? Mark this concept to track your progress.'}
        </span>
        <button
          type="button"
          onClick={() => progress.setConcept(topic.meta.id, id, !done)}
          className={cx(
            'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition',
            done
              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
              : 'border border-line bg-surface text-ink hover:border-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300',
          )}
        >
          {done ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
          {done ? 'Understood' : 'Mark as understood'}
        </button>
      </footer>
    </section>
  )
}

/**
 * One stage of the teaching flow inside a <Concept>.
 * `src` → shows clickable PDF chips; no `src` → marked "Supplementary" (for intro/intuition/visual/equations/derivation).
 */
export function Step({ kind, title, src, children, className }: { kind: StepKind; title?: string; src?: SrcLike; children: ReactNode; className?: string }) {
  const m = STEP_META[kind]
  const Icon = m.icon
  const ownBadge = kind === 'example' || kind === 'practice' || kind === 'takeaways'
  return (
    <div className={cx('step relative my-7 border-l-2 pl-4 sm:pl-6', m.accent, className)} data-step={kind}>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className={cx('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold', m.pill)}>
          <Icon className="h-3.5 w-3.5" aria-hidden />
          {title ?? m.label}
        </span>
        {!ownBadge ? (
          src ? (
            <SourceChips src={src} size="xs" />
          ) : (
            <SupplementBadge size="xs" label={kind === 'interactive' ? 'Interactive model' : 'Supplementary explanation'} />
          )
        ) : null}
      </div>
      <div className="step-body space-y-4">{children}</div>
    </div>
  )
}

/** Bulleted key takeaways (markdown strings). */
export function Takeaways({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-2">
      {items.map((t, i) => (
        <li key={i} className="flex gap-3 rounded-xl border border-line bg-surface px-3.5 py-2.5">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" aria-hidden />
          <Md className="md-tight">{t}</Md>
        </li>
      ))}
    </ul>
  )
}
