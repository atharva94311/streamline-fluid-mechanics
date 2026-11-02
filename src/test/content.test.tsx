import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import katex from 'katex'
import { UNITS } from '@/content/units'
import { attachSets, toTopicModule, type RawTopicModule } from '@/content/normalize'
import { RevealAllContext, TopicContext } from '@/kit/context'
import { TopicBody } from '@/pages/TopicBody'
import { FormulaCard } from '@/kit/FormulaCard'
import { Md, MACROS } from '@/kit/Md'
import { DOCS, parsePages, pdfPageOf, srcList } from '@/lib/sources'
import type { ProblemSet, SrcLike, TopicModule } from '@/lib/types'

afterEach(cleanup)

/**
 * Topic modules are loaded lazily one by one, so a broken file only fails its own tests.
 * Run a single topic with:  TOPIC=<topic-id> npx vitest run
 */
const ONLY = process.env.TOPIC
const topicLoaders = import.meta.glob<RawTopicModule>('../content/topics/*.tsx')
const setLoaders = import.meta.glob<{ sets?: ProblemSet[] }>('../content/problemsets/*.tsx')
const idFromPath = (p: string) => p.split('/').pop()!.replace(/\.tsx$/, '')

async function loadSets(): Promise<{ sets: ProblemSet[]; errors: string[] }> {
  const sets: ProblemSet[] = []
  const errors: string[] = []
  for (const [p, load] of Object.entries(setLoaders)) {
    try {
      const mod = await load()
      sets.push(...(mod.sets ?? []))
    } catch (e) {
      errors.push(`${p}: ${(e as Error).message}`)
    }
  }
  return { sets, errors }
}

function katexErrors(root: HTMLElement): string[] {
  return Array.from(root.querySelectorAll('.katex-error')).map((e) => `${e.getAttribute('title') ?? ''} :: ${e.textContent?.slice(0, 120)}`)
}

function checkSrc(src: SrcLike | undefined, where: string, problems: string[]) {
  for (const s of srcList(src)) {
    if (!DOCS[s.doc]) {
      problems.push(`${where}: unknown doc "${s.doc}"`)
      continue
    }
    const pages = parsePages(s.pages)
    if (!pages.length) problems.push(`${where}: unparseable pages "${s.pages}"`)
    for (const p of pages) if (pdfPageOf(s.doc, p) == null) problems.push(`${where}: ${s.doc} page ${p} is outside the PDF (books use PRINTED page numbers)`)
  }
}

function texOk(tex: string, where: string, problems: string[], display = false) {
  try {
    katex.renderToString(tex, { throwOnError: true, macros: { ...MACROS }, displayMode: display, strict: 'ignore' })
  } catch (e) {
    problems.push(`${where} TeX error: ${(e as Error).message}`)
  }
}

function dataProblems(m: TopicModule): string[] {
  const problems: string[] = []
  const id = m.meta.id
  const conceptIds = new Set(m.meta.concepts.map((c) => c.id))
  const dupes = (name: string, ids: string[]) => {
    const seen = new Set<string>()
    for (const x of ids) {
      if (seen.has(x)) problems.push(`duplicate ${name} id "${x}"`)
      seen.add(x)
    }
  }
  dupes('concept', m.meta.concepts.map((c) => c.id))
  dupes('formula', m.formulas.map((f) => f.id))
  dupes('example', m.examples.map((e) => e.id))
  dupes('practice', m.practice.map((p) => p.id))
  dupes('quiz', m.quiz.map((q) => q.id))
  dupes('flashcard', m.flashcards.map((f) => f.id))
  if (!m.meta.concepts.length) problems.push('no concepts')
  if (!UNITS.some((u) => u.id === m.meta.unit && u.topics.includes(id))) problems.push(`topic "${id}" is not listed under unit ${m.meta.unit} in units.ts`)
  m.meta.sources.forEach((s) => checkSrc(s, `${id} meta.sources`, problems))
  m.meta.concepts.forEach((c) => checkSrc(c.src, `${id} concept ${c.id}`, problems))
  for (const f of m.formulas) {
    checkSrc(f.src, `formula ${f.id}`, problems)
    texOk(f.tex, `formula ${f.id}`, problems, true)
    for (const v of f.vars ?? []) {
      texOk(v.sym, `formula ${f.id} var sym "${v.sym}"`, problems)
      if (v.units) texOk(v.units, `formula ${f.id} var units "${v.units}"`, problems)
    }
  }
  for (const e of m.examples) {
    checkSrc(e.src, `example ${e.id}`, problems)
    if (!conceptIds.has(e.concept)) problems.push(`example ${e.id} → unknown concept "${e.concept}"`)
    if (!e.steps.length) problems.push(`example ${e.id} has no steps`)
  }
  for (const p of m.practice) {
    checkSrc(p.src, `practice ${p.id}`, problems)
    if (!conceptIds.has(p.concept)) problems.push(`practice ${p.id} → unknown concept "${p.concept}"`)
    for (const c of p.check ?? []) if (!Number.isFinite(c.value)) problems.push(`practice ${p.id} has a non-finite check value`)
  }
  for (const q of m.quiz) {
    checkSrc(q.src, `quiz ${q.id}`, problems)
    if (q.options.length < 2) problems.push(`quiz ${q.id} has < 2 options`)
    if (!(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.options.length)) problems.push(`quiz ${q.id} answer index out of range`)
    if (q.concept && !conceptIds.has(q.concept)) problems.push(`quiz ${q.id} → unknown concept "${q.concept}"`)
    if (q.options.some((o) => /\b(all|none) of the above\b|\bboth [A-D]\b/i.test(o))) problems.push(`quiz ${q.id} uses positional option text (options are shuffled)`)
  }
  m.flashcards.forEach((f) => checkSrc(f.src, `flashcard ${f.id}`, problems))
  m.problemSets.forEach((s) => checkSrc(s.src, `problem set ${s.id}`, problems))
  return problems
}

describe('registry', () => {
  it.skipIf(!!ONLY)('every topic listed in units.ts has a file', () => {
    const files = new Set(Object.keys(topicLoaders).map(idFromPath))
    const missing = UNITS.flatMap((u) => u.topics).filter((t) => !files.has(t))
    expect(missing, `missing topic files: ${missing.join(', ')}`).toEqual([])
  })
  it.skipIf(!!ONLY)('every problem-set file loads and points at an existing topic', async () => {
    const { sets, errors } = await loadSets()
    expect(errors, errors.join('\n')).toEqual([])
    const files = new Set(Object.keys(topicLoaders).map(idFromPath))
    const orphans = sets.filter((s) => !files.has(s.topic)).map((s) => `${s.id} → ${s.topic}`)
    expect(orphans).toEqual([])
  })
})

for (const [path, load] of Object.entries(topicLoaders)) {
  const fileId = idFromPath(path)
  if (ONLY && fileId !== ONLY) continue
  describe(`topic: ${fileId}`, () => {
    let m: TopicModule
    beforeAll(async () => {
      const raw = await load()
      m = toTopicModule(raw)
      const { sets } = await loadSets()
      attachSets({ [m.meta.id]: m }, sets.filter((s) => s.topic === m.meta.id))
    })

    it('file name matches meta.id', () => {
      expect(m.meta.id).toBe(fileId)
    })

    it('data is consistent (ids, concepts, sources, TeX)', () => {
      const problems = dataProblems(m)
      expect(problems, problems.join('\n')).toEqual([])
    })

    it('renders fully expanded with no TeX errors, React warnings or missing items', () => {
      const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const { container } = render(
        <RevealAllContext.Provider value={true}>
          <TopicBody m={m} />
        </RevealAllContext.Provider>,
      )
      const errs = errSpy.mock.calls.map((c) => c.map((x) => (x instanceof Error ? x.message : String(x))).join(' ').slice(0, 400))
      errSpy.mockRestore()
      warnSpy.mockRestore()
      expect(errs, `console errors:\n${errs.join('\n')}`).toEqual([])
      const kerr = katexErrors(container)
      expect(kerr, `KaTeX errors:\n${kerr.join('\n')}`).toEqual([])
      const missing: string[] = []
      const ids = new Set(Array.from(container.querySelectorAll('[id]')).map((e) => e.id))
      const fids = new Set(Array.from(container.querySelectorAll('[data-formula]')).map((e) => e.getAttribute('data-formula')))
      for (const c of m.meta.concepts) if (!ids.has(`c-${c.id}`)) missing.push(`concept ${c.id} has no <Concept>`)
      for (const e of m.examples) if (!ids.has(`ex-${e.id}`)) missing.push(`example ${e.id} is never shown in the content`)
      for (const p of m.practice) if (!ids.has(`pr-${p.id}`)) missing.push(`practice ${p.id} is never shown in the content`)
      for (const f of m.formulas) if (!fids.has(f.id)) missing.push(`formula ${f.id} has no <FormulaCard> in the content`)
      expect(missing, missing.join('\n')).toEqual([])
    })

    it('flashcards and formula details render without TeX errors', () => {
      const { container } = render(
        <RevealAllContext.Provider value={true}>
          <TopicContext.Provider value={m}>
            {m.flashcards.map((f) => (
              <div key={f.id}>
                <Md>{f.front}</Md>
                <Md>{f.back}</Md>
              </div>
            ))}
            {m.formulas.map((f) => (
              <FormulaCard key={f.id} f={f} />
            ))}
          </TopicContext.Provider>
        </RevealAllContext.Provider>,
      )
      const kerr = katexErrors(container)
      expect(kerr, `KaTeX errors:\n${kerr.join('\n')}`).toEqual([])
    })
  })
}
