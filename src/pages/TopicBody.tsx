import { BookOpen, Calculator, Clock, ListChecks, Sigma, Target } from 'lucide-react'
import { UNITS } from '@/content/units'
import { useProgress } from '@/lib/store'
import { topicProgress } from '@/lib/progressCalc'
import { UNIT_THEME } from '@/lib/theme'
import type { TopicModule } from '@/lib/types'
import { TopicContext } from '@/kit/context'
import { Md, M } from '@/kit/Md'
import { QuizBlock } from '@/kit/Quiz'
import { PracticeCard } from '@/kit/PracticeCard'
import { Takeaways } from '@/kit/Concept'
import { SourceChips } from '@/kit/SourceChip'
import { cx } from '@/kit/cx'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Bar } from '@/components/ProgressRing'

// NOTE: must not import the registry — the test-suite renders single topics through this component.
/** The topic body (hero + content + quiz + summary). Exported separately for the test-suite. */
export function TopicBody({ m }: { m: TopicModule }) {
  const p = useProgress()
  const unit = UNITS.find((u) => u.topics.includes(m.meta.id))
  const th = UNIT_THEME[m.meta.unit]
  const tp = topicProgress(m, p)
  const Content = m.Content
  return (
    <TopicContext.Provider value={m}>
      <header className={cx('relative overflow-hidden rounded-3xl bg-gradient-to-br p-6 text-white shadow-xl sm:p-8', th.grad)}>
        <div className="hero-grid pointer-events-none absolute inset-0 opacity-60" aria-hidden />
        <div className="relative">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-white/80">
            Unit {unit?.id} · {unit?.title}
          </div>
          <h1 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl">{m.meta.title}</h1>
          <p className="mt-2 max-w-3xl text-base text-white/90 sm:text-lg">{m.meta.subtitle}</p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1"><Clock className="h-3.5 w-3.5" /> ~{m.meta.minutes} min</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1"><BookOpen className="h-3.5 w-3.5" /> {m.meta.concepts.length} concepts</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1"><Calculator className="h-3.5 w-3.5" /> {m.examples.length} solved examples</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1"><Target className="h-3.5 w-3.5" /> {m.practice.length} practice problems</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1"><Sigma className="h-3.5 w-3.5" /> {m.formulas.length} formulas</span>
          </div>
          <div className="mt-5 rounded-2xl bg-white/95 p-3 text-ink shadow-sm dark:bg-surface/95">
            <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-ink-3">Sources for this topic — click to open the PDF page</div>
            <SourceChips src={m.meta.sources} />
          </div>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1">
              <Bar value={tp.pct} className="bg-white" />
            </div>
            <span className="text-sm font-bold">{Math.round(tp.pct * 100)}% complete</span>
          </div>
        </div>
      </header>

      {m.meta.sourceNote ? (
        <div className="mt-5 rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-ink-2">
          <Md className="md-tight">{m.meta.sourceNote}</Md>
        </div>
      ) : null}

      <ErrorBoundary label={`${m.meta.id} content`}>
        <div className="topic-content mt-4 divide-y divide-line">
          <Content />
        </div>
      </ErrorBoundary>

      {m.problemSets.filter((set) => set.problems.length).map((set) => (
        <section key={set.id} id={`ps-${set.id}`} className="scroll-mt-24 border-t border-line py-8">
          <div className="mb-1 text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-300">End-of-chapter problems</div>
          <h3 className="font-display text-xl font-bold text-ink">{set.title}</h3>
          <div className="mt-2">
            <SourceChips src={set.src} size="xs" />
          </div>
          {set.intro ? <Md className="mt-3 text-sm text-ink-2">{set.intro}</Md> : null}
          <div className="mt-4 space-y-4">
            {set.problems.map((p, i) => (
              <PracticeCard key={p.id} p={p} n={i + 1} topicId={m.meta.id} />
            ))}
          </div>
        </section>
      ))}

      {m.quiz.length ? (
        <section id="topic-quiz" className="scroll-mt-24 border-t border-line py-8">
          <QuizBlock questions={m.quiz} topicId={m.meta.id} title="Topic quiz — multiple choice" />
        </section>
      ) : null}

      {m.takeaways.length ? (
        <section id="topic-summary" className="scroll-mt-24 border-t border-line py-8">
          <h3 className="mb-4 flex items-center gap-2 font-display text-xl font-bold">
            <ListChecks className="h-5 w-5 text-rose-500" /> Topic summary — what to remember
          </h3>
          <Takeaways items={m.takeaways} />
        </section>
      ) : null}

      {m.formulas.length ? (
        <section id="topic-formulas" className="scroll-mt-24 border-t border-line py-8">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <h3 className="flex items-center gap-2 font-display text-xl font-bold">
              <Sigma className="h-5 w-5 text-indigo-500" /> Formula recap
            </h3>
            <a href="#/formulas" className="text-sm text-indigo-600 underline dark:text-indigo-300">
              Open full formula sheet
            </a>
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            {m.formulas.map((f) => (
              <div key={f.id} className="rounded-xl border border-line bg-surface px-3 py-2">
                <div className="text-xs font-semibold text-ink-3">{f.name}</div>
                <div className="overflow-x-auto py-1">
                  <M tex={f.tex} />
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </TopicContext.Provider>
  )
}
