import { ArrowRight, Brain, ClipboardList, FileText, PlayCircle, Sigma } from 'lucide-react'
import { PLANNED_TITLES, UNITS } from '@/content/units'
import { TOPICS, TOPIC_BY_ID } from '@/content/registry'
import { useProgress } from '@/lib/store'
import { aggregate, topicProgress } from '@/lib/progressCalc'
import { UNIT_THEME } from '@/lib/theme'
import { DOCS, DOC_ORDER, PDFS_AVAILABLE } from '@/lib/sources'
import { STEP_META, type StepKind } from '@/kit/Concept'
import { cx } from '@/kit/cx'
import { Bar, ProgressRing } from '@/components/ProgressRing'

const FLOW: StepKind[] = ['intro', 'intuition', 'visual', 'equations', 'example', 'interactive', 'practice', 'takeaways']
const PLANNED = UNITS.reduce((s, u) => s + u.topics.length, 0)

export function Home() {
  const p = useProgress()
  const all = aggregate(TOPICS, p)
  const cardsDue = TOPICS.reduce(
    (s, m) => s + m.flashcards.filter((c) => (p.cards[`${m.meta.id}:${c.id}`]?.due ?? 0) <= Date.now()).length,
    0,
  )
  const quizAnswered = Object.values(p.quiz)
  const accuracy = quizAnswered.length ? quizAnswered.filter((q) => q.ok).length / quizAnswered.length : 0
  const lastTopic = p.last && TOPIC_BY_ID[p.last.replace('#/topic/', '')] ? TOPIC_BY_ID[p.last.replace('#/topic/', '')] : TOPICS[0]

  return (
    <div className="mx-auto max-w-[1300px] space-y-10 px-4 py-6 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-sky-600 to-teal-500 p-6 text-white shadow-2xl sm:p-10">
        <div className="hero-grid pointer-events-none absolute inset-0 opacity-70" aria-hidden />
        <svg className="pointer-events-none absolute -right-10 bottom-0 h-full w-2/3 opacity-25" viewBox="0 0 400 200" preserveAspectRatio="none" aria-hidden>
          {Array.from({ length: 9 }).map((_, i) => (
            <path key={i} className="flow-dash" d={`M0 ${20 + i * 20} C 120 ${i * 20 - 10}, 220 ${50 + i * 20}, 400 ${15 + i * 20}`} stroke="white" strokeWidth="2" fill="none" />
          ))}
        </svg>
        <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="min-w-0">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">CH21207 · Fluid Mechanics · Exam preparation</div>
            <h1 className="mt-3 font-display text-3xl font-bold leading-tight sm:text-5xl">Understand the flow, not just the formulas.</h1>
            <p className="mt-4 max-w-2xl text-base text-white/90 sm:text-lg">
              {TOPICS.length === PLANNED ? `${PLANNED} topics` : `${TOPICS.length} of ${PLANNED} topics ready`} across 4 units, built from your lecture slides and
              textbook excerpts — every concept taught with intuition, visuals, equations, step-by-step examples, live simulations and practice.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {lastTopic ? (
                <a href={`#/topic/${lastTopic.meta.id}`} className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 font-semibold text-indigo-700 no-underline shadow-lg transition hover:bg-indigo-50">
                  <PlayCircle className="h-5 w-5" /> {p.last ? 'Continue' : 'Start'}: {lastTopic.meta.title}
                </a>
              ) : null}
              <a href="#/revision" className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-5 py-2.5 font-semibold text-white no-underline ring-1 ring-white/40 transition hover:bg-white/25">
                <Brain className="h-5 w-5" /> Revision mode
              </a>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-5 rounded-2xl bg-white/10 p-5 ring-1 ring-white/25 backdrop-blur">
            <ProgressRing value={all.pct} size={110} stroke={10} color="white" track="rgba(255,255,255,0.25)" />
            <div className="space-y-1 text-sm">
              <div className="font-display text-3xl font-bold">{Math.round(all.pct * 100)}%</div>
              <div className="text-white/85">overall progress</div>
              <div className="text-white/75">{all.concepts[0]}/{all.concepts[1]} concepts understood</div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {[
          { label: 'Concepts understood', v: `${all.concepts[0]}/${all.concepts[1]}`, c: 'text-indigo-600 dark:text-indigo-300' },
          { label: 'Solved examples studied', v: `${all.examples[0]}/${all.examples[1]}`, c: 'text-emerald-600 dark:text-emerald-300' },
          { label: 'Practice attempted', v: `${all.practice[0]}/${all.practice[1]}`, c: 'text-orange-600 dark:text-orange-300' },
          { label: 'Quiz accuracy', v: quizAnswered.length ? `${Math.round(accuracy * 100)}%` : '—', c: 'text-violet-600 dark:text-violet-300' },
          { label: 'Flashcards due', v: String(cardsDue), c: 'text-rose-600 dark:text-rose-300' },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-line bg-surface p-4">
            <div className={cx('font-display text-2xl font-bold', s.c)}>{s.v}</div>
            <div className="mt-1 text-xs font-medium text-ink-3">{s.label}</div>
          </div>
        ))}
      </section>

      <section>
        <h2 className="mb-4 font-display text-2xl font-bold">Learning path</h2>
        <div className="grid gap-5 lg:grid-cols-2">
          {UNITS.map((u) => {
            const mods = u.topics.map((t) => TOPIC_BY_ID[t]).filter(Boolean)
            const agg = aggregate(mods, p)
            const th = UNIT_THEME[u.id]
            return (
              <div key={u.id} className="overflow-hidden rounded-3xl border border-line bg-surface shadow-sm">
                <div className={cx('bg-gradient-to-r p-5 text-white', th.grad)}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-widest text-white/80">Unit {u.id}</div>
                      <div className="mt-1 font-display text-xl font-bold">{u.title}</div>
                    </div>
                    <ProgressRing value={agg.pct} size={46} stroke={5} color="white" track="rgba(255,255,255,0.3)" label />
                  </div>
                  <p className="mt-2 text-sm text-white/90">{u.blurb}</p>
                </div>
                <ul className="divide-y divide-line">
                  {u.topics.map((tid, i) => {
                    const m = TOPIC_BY_ID[tid]
                    if (!m)
                      return (
                        <li key={tid} className="flex items-center gap-3 px-5 py-3 text-ink-3">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-line text-xs font-bold">{i + 1}</span>
                          <span className="min-w-0 flex-1 text-sm">{PLANNED_TITLES[tid] ?? tid}</span>
                          <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">In preparation</span>
                        </li>
                      )
                    const tp = topicProgress(m, p)
                    return (
                      <li key={m.meta.id}>
                        <a href={`#/topic/${m.meta.id}`} className="group flex items-center gap-3 px-5 py-3 no-underline transition hover:bg-surface-2">
                          <span className={cx('flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold', th.soft, th.text)}>{i + 1}</span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-semibold text-ink">{m.meta.title}</span>
                            <span className="mt-1 block max-w-xs"><Bar value={tp.pct} className={th.bg} /></span>
                          </span>
                          <span className="text-xs text-ink-3">{m.meta.minutes} min</span>
                          <ArrowRight className="h-4 w-4 text-ink-3 transition group-hover:translate-x-0.5" />
                        </a>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <div className="rounded-3xl border border-line bg-surface p-5">
          <h2 className="font-display text-xl font-bold">How every concept is taught</h2>
          <p className="mt-1 text-sm text-ink-3">Each concept walks through the same eight stages, each with its own colour so you always know where you are.</p>
          <ol className="mt-4 grid gap-2 sm:grid-cols-2">
            {FLOW.map((k, i) => {
              const s = STEP_META[k]
              const Icon = s.icon
              return (
                <li key={k} className="flex items-center gap-3 rounded-xl border border-line px-3 py-2">
                  <span className={cx('flex h-8 w-8 items-center justify-center rounded-lg', s.pill)}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-medium text-ink">
                    {i + 1}. {s.label}
                  </span>
                </li>
              )
            })}
          </ol>
          <div className="mt-4 grid gap-2 text-xs text-ink-2 sm:grid-cols-2">
            <div className="rounded-xl bg-emerald-50 px-3 py-2 dark:bg-emerald-500/10">
              <span className="font-semibold text-emerald-700 dark:text-emerald-300">Green chips</span> = taken from your PDFs; click to open the exact page.
            </div>
            <div className="rounded-xl bg-fuchsia-50 px-3 py-2 dark:bg-fuchsia-500/10">
              <span className="font-semibold text-fuchsia-700 dark:text-fuchsia-300">✦ Supplementary</span> = explanation, example or model added by this platform.
            </div>
          </div>
        </div>
        <div className="rounded-3xl border border-line bg-surface p-5">
          <h2 className="font-display text-xl font-bold">Source library</h2>
          <ul className="mt-3 space-y-2">
            {DOC_ORDER.map((d) => {
              const body = (
                <>
                  <FileText className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <span>
                    <span className="block text-sm font-semibold text-ink">{DOCS[d].title}</span>
                    <span className="block text-xs text-ink-3">{PDFS_AVAILABLE ? DOCS[d].detail : `${DOCS[d].detail} · your file: ${DOCS[d].original}`}</span>
                  </span>
                </>
              )
              return (
                <li key={d}>
                  {PDFS_AVAILABLE ? (
                    <a href={DOCS[d].file} target="_blank" rel="noreferrer" className="flex items-start gap-3 rounded-xl px-2 py-1.5 no-underline transition hover:bg-surface-2">
                      {body}
                    </a>
                  ) : (
                    <div className="flex items-start gap-3 rounded-xl px-2 py-1.5">{body}</div>
                  )}
                </li>
              )
            })}
          </ul>
          {!PDFS_AVAILABLE ? (
            <p className="mt-3 rounded-xl bg-surface-2 px-3 py-2 text-xs text-ink-3">
              This online copy does not include the course PDFs. Every source chip still shows the exact slide or page; run the platform locally with your
              PDFs in <code>public/sources/</code> to make the chips open them.
            </p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2">
            <a href="#/syllabus" className="btn-ghost no-underline">Coverage map</a>
            <a href="#/formulas" className="btn-ghost no-underline"><Sigma className="h-4 w-4" /> Formula sheet</a>
            <a href="#/practice" className="btn-ghost no-underline"><ClipboardList className="h-4 w-4" /> Practice bank</a>
          </div>
        </div>
      </section>
    </div>
  )
}
