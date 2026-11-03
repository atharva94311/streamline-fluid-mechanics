import { writeFileSync } from 'node:fs'
import { describe, it } from 'vitest'
import { UNITS } from '@/content/units'
import { attachSets, toTopicModule, type RawTopicModule } from '@/content/normalize'
import { DOCS, DOC_ORDER, NON_CONTENT_PAGES, pagesLabel, srcList } from '@/lib/sources'
import { coverageMap, docCoverage, pageLabel } from '@/lib/coverage'
import type { ProblemSet, TopicModule } from '@/lib/types'

/**
 * Writes SYLLABUS.md (topic-wise syllabus + per-PDF coverage checklist) from the content modules.
 *   GEN_SYLLABUS=1 npx vitest run src/test/syllabus.gen.test.ts
 */
const topicLoaders = import.meta.glob<RawTopicModule>('../content/topics/*.tsx')
const setLoaders = import.meta.glob<{ sets?: ProblemSet[] }>('../content/problemsets/*.tsx')

describe.skipIf(!process.env.GEN_SYLLABUS)('syllabus generator', () => {
  it('writes SYLLABUS.md', async () => {
    const byId: Record<string, TopicModule> = {}
    for (const load of Object.values(topicLoaders)) {
      const m = toTopicModule(await load())
      byId[m.meta.id] = m
    }
    const sets: ProblemSet[] = []
    for (const load of Object.values(setLoaders)) sets.push(...((await load()).sets ?? []))
    attachSets(byId, sets)
    const mods = UNITS.flatMap((u) => u.topics).map((id) => byId[id]).filter(Boolean)

    const L: string[] = ['# Syllabus & coverage checklist', '', 'Generated from the content modules (`GEN_SYLLABUS=1 npx vitest run src/test/syllabus.gen.test.ts`).', '']
    const totals = { concepts: 0, formulas: 0, examples: 0, practice: 0, quiz: 0, flashcards: 0 }
    for (const u of UNITS) {
      L.push(`## Unit ${u.id} — ${u.title}`, '', u.blurb, '')
      u.topics.forEach((tid, i) => {
        const m = byId[tid]
        if (!m) {
          L.push(`### ${u.id}${i + 1}. ${tid} — MISSING`, '')
          return
        }
        totals.concepts += m.meta.concepts.length
        totals.formulas += m.formulas.length
        totals.examples += m.examples.length
        totals.practice += m.practice.length
        totals.quiz += m.quiz.length
        totals.flashcards += m.flashcards.length
        L.push(`### ${u.id}${i + 1}. ${m.meta.title}`, '', `_${m.meta.subtitle}_`, '')
        L.push(`Sources: ${m.meta.sources.map(pagesLabel).join('; ')}`, '')
        m.meta.concepts.forEach((c, k) => {
          const src = srcList(c.src).map(pagesLabel).join('; ')
          L.push(`- [ ] ${k + 1}. ${c.title} — ${src || 'supplementary'}`)
        })
        L.push('', `${m.formulas.length} formulas · ${m.examples.length} solved examples · ${m.practice.length} practice problems · ${m.quiz.length} quiz questions · ${m.flashcards.length} flashcards`, '')
      })
    }
    L.push('## Totals', '', `${mods.length} topics · ${totals.concepts} concepts · ${totals.formulas} formulas · ${totals.examples} solved examples · ${totals.practice} practice problems · ${totals.quiz} quiz questions · ${totals.flashcards} flashcards`, '')

    const cov = coverageMap(mods)
    L.push('## Source coverage', '', 'Every content page of every PDF and the topics that use it.', '')
    for (const d of DOC_ORDER) {
      const info = DOCS[d]
      const c = docCoverage(d, cov[d])
      L.push(`### ${info.title} (${info.original})`, '', `${c.covered}/${c.total} content pages covered${c.missing.length ? ` — NOT referenced: ${c.missing.map((p) => pageLabel(d, p)).join(', ')}` : ''}.`, '')
      L.push('| Page | Topics |', '|---|---|')
      for (let p = 1; p <= info.pdfPages; p++) {
        if ((NON_CONTENT_PAGES[d] ?? []).includes(p)) {
          L.push(`| ${pageLabel(d, p)} | (title / reference slide) |`)
          continue
        }
        const ts = [...(cov[d].get(p) ?? [])].map((t) => byId[t]?.meta.title ?? t)
        L.push(`| ${pageLabel(d, p)} | ${ts.join(', ') || '**—**'} |`)
      }
      L.push('')
    }
    writeFileSync(`${process.cwd()}/SYLLABUS.md`, L.join('\n'))
  })
})
