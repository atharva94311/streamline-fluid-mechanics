import { useMemo, useState } from 'react'
import { Printer, Search, Star } from 'lucide-react'
import { UNITS } from '@/content/units'
import { TOPIC_BY_ID } from '@/content/registry'
import { useProgress } from '@/lib/store'
import { UNIT_THEME } from '@/lib/theme'
import { plain } from '@/lib/searchIndex'
import { FormulaCard } from '@/kit/FormulaCard'
import { Toggle } from '@/kit/controls'
import { cx } from '@/kit/cx'

export function FormulaSheet() {
  const p = useProgress()
  const [q, setQ] = useState('')
  const [keyOnly, setKeyOnly] = useState(false)
  const [starOnly, setStarOnly] = useState(false)
  const [details, setDetails] = useState(false)
  const tokens = useMemo(() => q.toLowerCase().split(/\s+/).filter(Boolean), [q])

  let total = 0
  const units = UNITS.map((u) => {
    const topics = u.topics
      .map((tid) => TOPIC_BY_ID[tid])
      .filter(Boolean)
      .map((m) => {
        const fs = m.formulas.filter((f) => {
          if (keyOnly && !f.key) return false
          if (starOnly && !p.stars[`${m.meta.id}:${f.id}`]) return false
          if (!tokens.length) return true
          const text = `${f.name} ${plain(f.tex)} ${(f.vars ?? []).map((v) => plain(v.desc)).join(' ')} ${m.meta.title}`.toLowerCase()
          return tokens.every((t) => text.includes(t))
        })
        total += fs.length
        return { m, fs }
      })
      .filter((t) => t.fs.length)
    return { u, topics }
  }).filter((x) => x.topics.length)

  return (
    <div className="print-full mx-auto max-w-[1300px] px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Formula sheet</h1>
          <p className="mt-1 text-ink-2">Every equation from every topic, with symbol definitions and validity conditions. Star formulas to build your own list.</p>
        </div>
        <button type="button" onClick={() => window.print()} className="btn-ghost no-print">
          <Printer className="h-4 w-4" /> Print / save PDF
        </button>
      </header>

      <div className="no-print sticky top-16 z-10 mb-6 grid gap-3 rounded-2xl border border-line bg-surface/95 p-3 backdrop-blur md:grid-cols-[1fr_auto_auto_auto] md:items-center">
        <label className="flex items-center gap-2 rounded-xl border border-line bg-surface-2 px-3">
          <Search className="h-4 w-4 text-ink-3" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter: e.g. vorticity, friction, Reynolds…" className="h-10 flex-1 bg-transparent text-sm outline-none" />
        </label>
        <div className="w-40"><Toggle label="Key formulas only" checked={keyOnly} onChange={setKeyOnly} /></div>
        <div className="w-36"><Toggle label="★ Starred only" checked={starOnly} onChange={setStarOnly} /></div>
        <div className="w-36"><Toggle label="Show details" checked={details} onChange={setDetails} /></div>
      </div>

      {!total ? (
        <div className="rounded-2xl border border-dashed border-line p-10 text-center text-ink-3">
          {starOnly ? (
            <span className="inline-flex items-center gap-1">No starred formulas yet — tap <Star className="h-4 w-4" /> on any formula card.</span>
          ) : (
            'No formulas match this filter.'
          )}
        </div>
      ) : null}

      <div className="space-y-10">
        {units.map(({ u, topics }) => (
          <section key={u.id}>
            <h2 className={cx('mb-4 font-display text-2xl font-bold', UNIT_THEME[u.id].text)}>
              Unit {u.id} · {u.title}
            </h2>
            <div className="space-y-6">
              {topics.map(({ m, fs }) => (
                <div key={m.meta.id}>
                  <a href={`#/topic/${m.meta.id}`} className="mb-2 inline-block font-semibold text-ink no-underline hover:underline">
                    {m.meta.title}
                  </a>
                  <div className="grid gap-3 lg:grid-cols-2">
                    {fs.map((f) => (
                      <FormulaCard key={`${f.id}-${details}`} f={f} topicId={m.meta.id} compact={!details} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
