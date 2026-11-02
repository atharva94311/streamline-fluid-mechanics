import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, CheckCircle2, Circle } from 'lucide-react'
import { TOPIC_BY_ID, neighbours } from '@/content/registry'
import { progress, useProgress } from '@/lib/store'
import { topicProgress } from '@/lib/progressCalc'
import { UNIT_THEME } from '@/lib/theme'
import { topicHref } from '@/lib/router'
import { cx } from '@/kit/cx'
import { ProgressRing } from '@/components/ProgressRing'
import { TopicBody } from './TopicBody'

export function TopicPage({ id, concept }: { id: string; concept?: string }) {
  const m = TOPIC_BY_ID[id]
  const p = useProgress()
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    if (m) progress.visit(id, `#/topic/${id}`)
  }, [id, m])

  useEffect(() => {
    if (!concept) return
    const t = setTimeout(() => {
      const el = document.getElementById(`c-${concept}`) ?? document.getElementById(concept)
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 80)
    return () => clearTimeout(t)
  }, [id, concept])

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-concept]'))
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (vis[0]) setActive((vis[0].target as HTMLElement).dataset.concept ?? null)
      },
      { rootMargin: '-80px 0px -60% 0px' },
    )
    els.forEach((e) => io.observe(e))
    return () => io.disconnect()
  }, [id])

  if (!m)
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <h1 className="font-display text-2xl font-bold">Topic “{id}” not found</h1>
        <a href="#/syllabus" className="mt-3 inline-block text-indigo-600 underline">See the syllabus</a>
      </div>
    )

  const th = UNIT_THEME[m.meta.unit]
  const tp = topicProgress(m, p)
  const { prev, next } = neighbours(id)

  return (
    <div className="mx-auto grid max-w-[1440px] gap-8 px-4 py-6 sm:px-6 lg:px-8 xl:grid-cols-[minmax(0,1fr)_270px]">
      <article className="min-w-0">
        <TopicBody m={m} />
        <nav className="mt-6 grid gap-3 border-t border-line pt-6 sm:grid-cols-2">
          {prev ? (
            <a href={topicHref(prev.meta.id)} className="group rounded-2xl border border-line bg-surface p-4 no-underline transition hover:border-ink-3">
              <div className="flex items-center gap-1 text-xs font-semibold text-ink-3"><ArrowLeft className="h-3.5 w-3.5" /> Previous</div>
              <div className="mt-1 font-display font-bold text-ink">{prev.meta.title}</div>
            </a>
          ) : <span />}
          {next ? (
            <a href={topicHref(next.meta.id)} className="group rounded-2xl border border-line bg-surface p-4 text-right no-underline transition hover:border-ink-3">
              <div className="flex items-center justify-end gap-1 text-xs font-semibold text-ink-3">Next <ArrowRight className="h-3.5 w-3.5" /></div>
              <div className="mt-1 font-display font-bold text-ink">{next.meta.title}</div>
            </a>
          ) : null}
        </nav>
      </article>

      <aside className="no-print hidden xl:block">
        <div className="sticky top-24 space-y-4">
          <div className="rounded-2xl border border-line bg-surface p-4">
            <div className="flex items-center gap-3">
              <ProgressRing value={tp.pct} size={52} stroke={5} color={th.hex} label />
              <div className="text-xs text-ink-3">
                <div>Concepts {tp.concepts[0]}/{tp.concepts[1]}</div>
                <div>Examples {tp.examples[0]}/{tp.examples[1]}</div>
                <div>Practice {tp.practice[0]}/{tp.practice[1]}</div>
                <div>Quiz {tp.quiz[0]}/{tp.quiz[1]}</div>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-line bg-surface p-3">
            <div className="px-2 pb-2 text-[11px] font-bold uppercase tracking-wider text-ink-3">On this page</div>
            <ul className="space-y-0.5">
              {m.meta.concepts.map((c, i) => {
                const done = !!p.concepts[progress.key(m.meta.id, c.id)]
                return (
                  <li key={c.id}>
                    <a
                      href={topicHref(m.meta.id, c.id)}
                      className={cx(
                        'flex items-start gap-2 rounded-lg px-2 py-1.5 text-[13px] leading-snug no-underline transition',
                        active === c.id ? cx(th.soft, 'font-semibold text-ink') : 'text-ink-2 hover:bg-surface-2',
                      )}
                    >
                      {done ? <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" /> : <Circle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-3" />}
                      <span>{i + 1}. {c.title}</span>
                    </a>
                  </li>
                )
              })}
              {m.quiz.length ? (
                <li><a href="#topic-quiz" onClick={(e) => { e.preventDefault(); document.getElementById('topic-quiz')?.scrollIntoView({ behavior: 'smooth' }) }} className="block rounded-lg px-2 py-1.5 text-[13px] text-ink-2 no-underline hover:bg-surface-2">Topic quiz</a></li>
              ) : null}
              {m.takeaways.length ? (
                <li><a href="#topic-summary" onClick={(e) => { e.preventDefault(); document.getElementById('topic-summary')?.scrollIntoView({ behavior: 'smooth' }) }} className="block rounded-lg px-2 py-1.5 text-[13px] text-ink-2 no-underline hover:bg-surface-2">Summary</a></li>
              ) : null}
            </ul>
          </div>
        </div>
      </aside>
    </div>
  )
}
