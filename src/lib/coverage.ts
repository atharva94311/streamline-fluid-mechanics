import type { DocId, Src, TopicModule } from './types'
import { DOCS, NON_CONTENT_PAGES, parsePages, pdfPageOf, srcList } from './sources'

/** Every source reference used anywhere in a topic module. */
export function topicRefs(m: TopicModule): Src[] {
  const out: Src[] = [...m.meta.sources]
  m.meta.concepts.forEach((c) => out.push(...srcList(c.src)))
  m.formulas.forEach((f) => out.push(...srcList(f.src)))
  m.examples.forEach((e) => out.push(...srcList(e.src)))
  m.practice.forEach((p) => out.push(...srcList(p.src)))
  m.quiz.forEach((q) => out.push(...srcList(q.src)))
  m.flashcards.forEach((f) => out.push(...srcList(f.src)))
  return out
}

/** PDF page → list of topic ids that cite it. */
export function coverageMap(mods: TopicModule[]): Record<DocId, Map<number, Set<string>>> {
  const map = Object.fromEntries(Object.keys(DOCS).map((d) => [d, new Map<number, Set<string>>()])) as Record<DocId, Map<number, Set<string>>>
  for (const m of mods)
    for (const s of topicRefs(m))
      for (const pg of parsePages(s.pages)) {
        const pdf = pdfPageOf(s.doc, pg)
        if (pdf == null) continue
        const set = map[s.doc].get(pdf) ?? new Set<string>()
        set.add(m.meta.id)
        map[s.doc].set(pdf, set)
      }
  return map
}

export function docCoverage(doc: DocId, cov: Map<number, Set<string>>) {
  const skip = new Set(NON_CONTENT_PAGES[doc] ?? [])
  const pages = Array.from({ length: DOCS[doc].pdfPages }, (_, i) => i + 1).filter((p) => !skip.has(p))
  const covered = pages.filter((p) => cov.has(p))
  return { total: pages.length, covered: covered.length, missing: pages.filter((p) => !cov.has(p)) }
}

/** Printed page label for a PDF page (books) or slide number. */
export function pageLabel(doc: DocId, pdf: number): string {
  const d = DOCS[doc]
  if (d.kind === 'slides') return `slide ${pdf}`
  for (const [a, b, first] of d.printed ?? []) {
    const printed = a + (pdf - first)
    if (printed >= a && printed <= b) return `p. ${printed}`
  }
  return `PDF p. ${pdf}`
}
