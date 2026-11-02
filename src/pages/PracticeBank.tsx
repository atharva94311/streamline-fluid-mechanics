import { useMemo, useState } from 'react'
import { UNITS } from '@/content/units'
import { TOPICS } from '@/content/registry'
import { useProgress } from '@/lib/store'
import type { ExampleDef, PracticeDef, TopicModule, UnitId } from '@/lib/types'
import { ExampleCard } from '@/kit/ExampleCard'
import { PracticeCard } from '@/kit/PracticeCard'
import { Segmented } from '@/kit/controls'
import { TopicContext } from '@/kit/context'
import { cx } from '@/kit/cx'

type Item = { kind: 'example'; m: TopicModule; e: ExampleDef } | { kind: 'practice'; m: TopicModule; p: PracticeDef }
const PAGE = 12

export function PracticeBank() {
  const store = useProgress()
  const [unit, setUnit] = useState<UnitId | 'all'>('all')
  const [kind, setKind] = useState<'all' | 'example' | 'practice'>('all')
  const [origin, setOrigin] = useState<'all' | 'pdf' | 'supp'>('all')
  const [status, setStatus] = useState<'all' | 'todo' | 'review' | 'done'>('all')
  const [topic, setTopic] = useState<string>('all')
  const [page, setPage] = useState(0)

  const items = useMemo(() => {
    const out: Item[] = []
    for (const m of TOPICS) {
      if (unit !== 'all' && m.meta.unit !== unit) continue
      if (topic !== 'all' && m.meta.id !== topic) continue
      if (kind !== 'practice') m.examples.forEach((e) => out.push({ kind: 'example', m, e }))
      if (kind !== 'example') m.practice.forEach((p) => out.push({ kind: 'practice', m, p }))
    }
    return out.filter((it) => {
      const src = it.kind === 'example' ? it.e.src : it.p.src
      if (origin === 'pdf' && !src) return false
      if (origin === 'supp' && src) return false
      const key = `${it.m.meta.id}:${it.kind === 'example' ? it.e.id : it.p.id}`
      const done = it.kind === 'example' ? !!store.examples[key] : !!store.practice[key]?.ok
      const review = it.kind === 'practice' && store.practice[key] && !store.practice[key].ok
      if (status === 'todo' && (done || review)) return false
      if (status === 'review' && !review) return false
      if (status === 'done' && !done) return false
      return true
    })
  }, [unit, kind, origin, status, topic, store])

  const pages = Math.max(1, Math.ceil(items.length / PAGE))
  const cur = Math.min(page, pages - 1)
  const shown = items.slice(cur * PAGE, cur * PAGE + PAGE)
  const topicsInUnit = TOPICS.filter((m) => unit === 'all' || m.meta.unit === unit)

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-bold">Practice bank</h1>
        <p className="mt-1 text-ink-2">
          All {TOPICS.reduce((s, m) => s + m.examples.length, 0)} solved examples and {TOPICS.reduce((s, m) => s + m.practice.length, 0)} practice problems in
          one place. Filter by unit, source and status.
        </p>
      </header>

      <div className="mb-6 grid gap-3 rounded-2xl border border-line bg-surface p-4 md:grid-cols-2">
        <Segmented
          label="Unit"
          value={unit}
          onChange={(v) => { setUnit(v); setTopic('all'); setPage(0) }}
          options={[{ value: 'all', label: 'All' }, ...UNITS.map((u) => ({ value: u.id, label: u.id }))]}
        />
        <Segmented
          label="Type"
          value={kind}
          onChange={(v) => { setKind(v); setPage(0) }}
          options={[{ value: 'all', label: 'All' }, { value: 'example', label: 'Solved examples' }, { value: 'practice', label: 'Practice' }]}
        />
        <Segmented
          label="Source"
          value={origin}
          onChange={(v) => { setOrigin(v); setPage(0) }}
          options={[{ value: 'all', label: 'All' }, { value: 'pdf', label: 'From PDFs' }, { value: 'supp', label: 'Supplementary' }]}
        />
        <Segmented
          label="Status"
          value={status}
          onChange={(v) => { setStatus(v); setPage(0) }}
          options={[{ value: 'all', label: 'All' }, { value: 'todo', label: 'To do' }, { value: 'review', label: 'Review' }, { value: 'done', label: 'Done' }]}
        />
        <label className="md:col-span-2">
          <span className="mb-1 block text-sm text-ink-2">Topic</span>
          <select
            value={topic}
            onChange={(e) => { setTopic(e.target.value); setPage(0) }}
            className="w-full rounded-xl border border-line bg-surface-2 px-3 py-2 text-sm text-ink"
          >
            <option value="all">All topics</option>
            {topicsInUnit.map((m) => (
              <option key={m.meta.id} value={m.meta.id}>
                {m.meta.unit} · {m.meta.title}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mb-3 text-sm text-ink-3">{items.length} items</div>
      <div className="space-y-6">
        {shown.map((it) => (
          <div key={`${it.m.meta.id}-${it.kind}-${it.kind === 'example' ? it.e.id : it.p.id}`}>
            <a href={`#/topic/${it.m.meta.id}`} className="mb-1.5 inline-block text-xs font-semibold text-ink-3 no-underline hover:underline">
              {it.m.meta.unit} · {it.m.meta.title}
            </a>
            <TopicContext.Provider value={it.m}>
              {it.kind === 'example' ? <ExampleCard e={it.e} topicId={it.m.meta.id} /> : <PracticeCard p={it.p} topicId={it.m.meta.id} />}
            </TopicContext.Provider>
          </div>
        ))}
      </div>
      {pages > 1 ? (
        <div className="mt-8 flex flex-wrap items-center justify-center gap-1.5">
          {Array.from({ length: pages }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => { setPage(i); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              className={cx('h-9 min-w-9 rounded-lg px-2 text-sm font-semibold', i === cur ? 'bg-indigo-600 text-white' : 'border border-line bg-surface text-ink-2')}
            >
              {i + 1}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
