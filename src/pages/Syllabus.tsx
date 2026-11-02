import { CheckCircle2, Circle } from 'lucide-react'
import { PLANNED_TITLES, UNITS } from '@/content/units'
import { TOPICS, TOPIC_BY_ID } from '@/content/registry'
import { useProgress } from '@/lib/store'
import { UNIT_THEME } from '@/lib/theme'
import { DOCS, DOC_ORDER, NON_CONTENT_PAGES, PDFS_AVAILABLE } from '@/lib/sources'
import { coverageMap, docCoverage, pageLabel } from '@/lib/coverage'
import { topicHref } from '@/lib/router'
import { SourceChips, SupplementBadge } from '@/kit/SourceChip'
import { cx } from '@/kit/cx'

export function Syllabus() {
  const p = useProgress()
  const cov = coverageMap(TOPICS)

  return (
    <div className="mx-auto max-w-[1200px] space-y-10 px-4 py-6 sm:px-6 lg:px-8">
      <header>
        <h1 className="font-display text-3xl font-bold">Syllabus & coverage checklist</h1>
        <p className="mt-2 max-w-3xl text-ink-2">
          Every unit, topic and concept with the exact source pages it is built from. Tick concepts off from inside each topic. Below, the coverage map shows
          which page of each PDF is used where.
        </p>
      </header>

      {UNITS.map((u) => {
        const th = UNIT_THEME[u.id]
        return (
          <section key={u.id} className="overflow-hidden rounded-3xl border border-line bg-surface">
            <div className={cx('bg-gradient-to-r px-5 py-4 text-white', th.grad)}>
              <div className="text-xs font-bold uppercase tracking-widest text-white/80">Unit {u.id}</div>
              <div className="font-display text-xl font-bold">{u.title}</div>
            </div>
            <div className="divide-y divide-line">
              {u.topics.map((tid, ti) => {
                const m = TOPIC_BY_ID[tid]
                if (!m)
                  return (
                    <div key={tid} className="flex flex-wrap items-center gap-3 px-5 py-4 text-ink-3">
                      <span className="font-display text-lg font-bold">
                        {u.id}{ti + 1}. {PLANNED_TITLES[tid] ?? tid}
                      </span>
                      <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">In preparation</span>
                    </div>
                  )
                return (
                  <div key={tid} className="px-5 py-4">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <a href={topicHref(tid)} className="font-display text-lg font-bold text-ink no-underline hover:underline">
                        {u.id}{ti + 1}. {m.meta.title}
                      </a>
                      <span className="text-sm text-ink-3">{m.meta.subtitle}</span>
                    </div>
                    <div className="mt-2"><SourceChips src={m.meta.sources} size="xs" /></div>
                    <ul className="mt-3 grid gap-1.5">
                      {m.meta.concepts.map((c, ci) => {
                        const done = !!p.concepts[`${tid}:${c.id}`]
                        return (
                          <li key={c.id} className="flex flex-wrap items-center gap-2 text-sm">
                            {done ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Circle className="h-4 w-4 text-ink-3" />}
                            <a href={topicHref(tid, c.id)} className="text-ink-2 no-underline hover:text-ink hover:underline">
                              {ci + 1}. {c.title}
                            </a>
                            {c.src ? <SourceChips src={c.src} size="xs" /> : <SupplementBadge size="xs" />}
                          </li>
                        )
                      })}
                    </ul>
                    <div className="mt-2 text-xs text-ink-3">
                      {m.examples.length} solved examples · {m.practice.length} practice problems · {m.quiz.length} quiz questions · {m.formulas.length} formulas ·{' '}
                      {m.flashcards.length} flashcards
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )
      })}

      <section>
        <h2 className="font-display text-2xl font-bold">Source coverage map</h2>
        <p className="mt-1 text-sm text-ink-3">
          Each square is one PDF page. Coloured = used by at least one topic (hover for which). Hatched = title / textbook-list slide with no study content.
          {PDFS_AVAILABLE ? 'Click a square to open that page.' : 'Page numbers refer to your own copies of the PDFs.'}
        </p>
        <div className="mt-4 grid gap-4">
          {DOC_ORDER.map((d) => {
            const info = DOCS[d]
            const c = docCoverage(d, cov[d])
            const skip = new Set(NON_CONTENT_PAGES[d] ?? [])
            return (
              <div key={d} className="rounded-2xl border border-line bg-surface p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <div className="font-semibold text-ink">{info.title}</div>
                    <div className="text-xs text-ink-3">{info.original} · {info.detail}</div>
                  </div>
                  <div className={cx('text-sm font-bold', c.covered === c.total ? 'text-emerald-600 dark:text-emerald-300' : 'text-amber-600')}>
                    {c.covered}/{c.total} content pages covered
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {Array.from({ length: info.pdfPages }, (_, i) => i + 1).map((pg) => {
                    const topics = [...(cov[d].get(pg) ?? [])]
                    const isSkip = skip.has(pg)
                    const title = `${pageLabel(d, pg)} (PDF ${pg})${isSkip ? ' — title/reference slide' : topics.length ? ` — ${topics.map((t) => TOPIC_BY_ID[t]?.meta.title ?? t).join(', ')}` : ' — not referenced'}`
                    const unit = topics[0] ? TOPIC_BY_ID[topics[0]]?.meta.unit : undefined
                    return (
                      <a
                        key={pg}
                        href={PDFS_AVAILABLE ? `${info.file}#page=${pg}` : undefined}
                        target="_blank"
                        rel="noreferrer"
                        title={title}
                        className={cx(
                          'flex h-8 min-w-8 items-center justify-center rounded-md px-1 text-[10px] font-semibold no-underline',
                          isSkip && 'bg-[repeating-linear-gradient(45deg,var(--line),var(--line)_3px,transparent_3px,transparent_6px)] text-ink-3',
                          !isSkip && topics.length > 0 && unit && cx(UNIT_THEME[unit].bg, 'text-white'),
                          !isSkip && !topics.length && 'border border-dashed border-amber-400 text-amber-600',
                        )}
                      >
                        {info.kind === 'slides' ? pg : pageLabel(d, pg).replace('p. ', '')}
                      </a>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
