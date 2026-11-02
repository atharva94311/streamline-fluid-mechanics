import { Fragment, useState, type ReactNode } from 'react'
import { ArrowDown, ArrowRight, ChevronsDown, RotateCcw, StepForward } from 'lucide-react'
import { useRevealAll } from './context'
import { Md } from './Md'
import { cx } from './cx'

type Tone = 'indigo' | 'cyan' | 'amber' | 'rose' | 'emerald' | 'slate' | 'violet'
const TONE: Record<Tone, string> = {
  indigo: 'border-indigo-300 bg-indigo-50 dark:border-indigo-500/40 dark:bg-indigo-500/10',
  cyan: 'border-cyan-300 bg-cyan-50 dark:border-cyan-500/40 dark:bg-cyan-500/10',
  amber: 'border-amber-300 bg-amber-50 dark:border-amber-500/40 dark:bg-amber-500/10',
  rose: 'border-rose-300 bg-rose-50 dark:border-rose-500/40 dark:bg-rose-500/10',
  emerald: 'border-emerald-300 bg-emerald-50 dark:border-emerald-500/40 dark:bg-emerald-500/10',
  slate: 'border-slate-300 bg-slate-50 dark:border-slate-500/40 dark:bg-slate-500/10',
  violet: 'border-violet-300 bg-violet-50 dark:border-violet-500/40 dark:bg-violet-500/10',
}
const NUM: Record<Tone, string> = {
  indigo: 'bg-indigo-600', cyan: 'bg-cyan-600', amber: 'bg-amber-500', rose: 'bg-rose-600', emerald: 'bg-emerald-600', slate: 'bg-slate-600', violet: 'bg-violet-600',
}

export interface FlowNode {
  title: string
  md?: string
  tone?: Tone
}

/** Vertical numbered flowchart (procedures such as the Buckingham-Pi steps). */
export function FlowSteps({ steps, tone = 'indigo' }: { steps: FlowNode[]; tone?: Tone }) {
  return (
    <ol className="flow-steps relative space-y-0">
      {steps.map((s, i) => {
        const t = s.tone ?? tone
        return (
          <li key={i} className="relative flex gap-4 pb-5 last:pb-0">
            {i < steps.length - 1 ? <span className="absolute left-[15px] top-8 h-[calc(100%-1.75rem)] w-0.5 bg-line" aria-hidden /> : null}
            <span className={cx('relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow', NUM[t])}>
              {i + 1}
            </span>
            <div className={cx('min-w-0 flex-1 rounded-xl border px-4 py-2.5', TONE[t])}>
              <div className="font-semibold text-ink">{s.title}</div>
              {s.md ? <Md className="md-tight mt-1 text-sm text-ink-2">{s.md}</Md> : null}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

/**
 * Rows of boxes connected top-to-bottom by arrows (decision/logic charts).
 * Nodes inside a row sit side by side; `arrowLabels[i]` labels the arrow below row i.
 */
export function FlowChart({ rows, arrowLabels }: { rows: FlowNode[][]; arrowLabels?: (string | undefined)[] }) {
  return (
    <div className="flow-chart flex flex-col items-stretch gap-0">
      {rows.map((row, r) => (
        <Fragment key={r}>
          <div className={cx('grid gap-3', row.length === 1 ? 'grid-cols-1 sm:mx-auto sm:w-4/5' : row.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3')}>
            {row.map((n, i) => (
              <div key={i} className={cx('rounded-xl border px-4 py-2.5 text-center', TONE[n.tone ?? 'slate'])}>
                <div className="font-semibold text-ink">{n.title}</div>
                {n.md ? <Md className="md-tight mt-1 text-sm text-ink-2">{n.md}</Md> : null}
              </div>
            ))}
          </div>
          {r < rows.length - 1 ? (
            <div className="flex flex-col items-center py-1 text-ink-3">
              <ArrowDown className="h-5 w-5" />
              {arrowLabels?.[r] ? <span className="text-xs font-medium"><Md inline>{arrowLabels[r]!}</Md></span> : null}
            </div>
          ) : null}
        </Fragment>
      ))}
    </div>
  )
}

/** Horizontal chain of boxes with arrows (wraps on small screens). */
export function FlowRow({ nodes }: { nodes: FlowNode[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {nodes.map((n, i) => (
        <Fragment key={i}>
          <div className={cx('rounded-xl border px-3 py-2', TONE[n.tone ?? 'slate'])}>
            <div className="text-sm font-semibold text-ink">{n.title}</div>
            {n.md ? <Md className="md-tight text-xs text-ink-2">{n.md}</Md> : null}
          </div>
          {i < nodes.length - 1 ? <ArrowRight className="h-4 w-4 text-ink-3" aria-hidden /> : null}
        </Fragment>
      ))}
    </div>
  )
}

export interface DerivationStep {
  md: string
  /** Short justification shown beside the step ("divide by δx δy δz", "irrotational ⇒ …"). */
  why?: string
}

/** Derivation revealed one line at a time. */
export function Derivation({ steps, title }: { steps: DerivationStep[]; title?: string }) {
  const revealAll = useRevealAll()
  const [shown, setShown] = useState(revealAll ? steps.length : 1)
  return (
    <div className="derivation rounded-2xl border border-slate-300/70 bg-surface p-4 dark:border-slate-500/30">
      {title ? <div className="mb-3 font-semibold text-ink">{title}</div> : null}
      <ol className="space-y-2.5">
        {steps.slice(0, shown).map((s, i) => (
          <li key={i} className="grid gap-x-4 gap-y-1 md:grid-cols-[1fr_minmax(0,14rem)]">
            <div className="flex min-w-0 gap-2">
              <span className="mt-1 font-mono text-[11px] text-ink-3">{i + 1}.</span>
              <Md className="md-tight min-w-0 flex-1">{s.md}</Md>
            </div>
            {s.why ? (
              <div className="self-center border-l-2 border-amber-300 pl-2 text-xs italic text-ink-3 dark:border-amber-500/50">
                <Md inline>{s.why}</Md>
              </div>
            ) : (
              <div />
            )}
          </li>
        ))}
      </ol>
      {!revealAll ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {shown < steps.length ? (
            <>
              <button type="button" onClick={() => setShown((s) => s + 1)} className="btn-ghost">
                <StepForward className="h-4 w-4" /> Next line ({shown}/{steps.length})
              </button>
              <button type="button" onClick={() => setShown(steps.length)} className="btn-ghost">
                <ChevronsDown className="h-4 w-4" /> Show all
              </button>
            </>
          ) : steps.length > 1 ? (
            <button type="button" onClick={() => setShown(1)} className="btn-ghost">
              <RotateCcw className="h-4 w-4" /> Collapse
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

/** Simple tab set. */
export function Tabs({ tabs, initial = 0 }: { tabs: { label: string; content: ReactNode }[]; initial?: number }) {
  const revealAll = useRevealAll()
  const [active, setActive] = useState(initial)
  if (revealAll)
    return (
      <div className="space-y-4">
        {tabs.map((t, i) => (
          <div key={i}>{t.content}</div>
        ))}
      </div>
    )
  return (
    <div className="tabs">
      <div role="tablist" className="mb-3 flex flex-wrap gap-1 rounded-xl bg-surface-2 p-1">
        {tabs.map((t, i) => (
          <button
            key={i}
            role="tab"
            type="button"
            aria-selected={active === i}
            onClick={() => setActive(i)}
            className={cx(
              'rounded-lg px-3 py-1.5 text-sm font-medium transition',
              active === i ? 'bg-surface text-ink shadow-sm' : 'text-ink-3 hover:text-ink',
            )}
          >
            <Md inline>{t.label}</Md>
          </button>
        ))}
      </div>
      <div role="tabpanel">{tabs[active]?.content}</div>
    </div>
  )
}

/** Side-by-side comparison cards (e.g. stream function vs velocity potential). */
export function Compare({ items }: { items: { title: string; md: string; tone?: Tone }[] }) {
  return (
    <div className={cx('grid gap-3', items.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3')}>
      {items.map((it, i) => (
        <div key={i} className={cx('rounded-2xl border p-4', TONE[it.tone ?? (['indigo', 'cyan', 'amber'] as Tone[])[i % 3]])}>
          <div className="mb-1 font-display font-bold text-ink">{it.title}</div>
          <Md className="md-tight text-sm text-ink-2">{it.md}</Md>
        </div>
      ))}
    </div>
  )
}
