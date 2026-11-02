import type { DocId, Src, SrcLike } from './types'

export interface DocInfo {
  id: DocId
  short: string
  title: string
  kind: 'slides' | 'book'
  /** Path relative to index.html (public/sources is copied next to it). */
  file: string
  /** Original file name the student has. */
  original: string
  pdfPages: number
  /** For books: [firstPrinted, lastPrinted, pdfPageOfFirstPrinted]. */
  printed?: [number, number, number][]
  detail: string
}

export const DOCS: Record<DocId, DocInfo> = {
  lec9: {
    id: 'lec9', short: 'Lec 9', kind: 'slides', pdfPages: 15,
    title: 'Lecture 9 — Fluid element kinematics, continuity, stream function',
    file: 'sources/FM_Lec9.pdf', original: 'FM_Lec9.pdf',
    detail: 'CH21207 Fluid Mechanics, Arnab Atta, 07 Oct 2026',
  },
  lec10: {
    id: 'lec10', short: 'Lec 10', kind: 'slides', pdfPages: 12,
    title: 'Lecture 10 — Equations of motion, Euler, velocity potential, Laplace',
    file: 'sources/FM_Lec10.pdf', original: 'FM_Lec10.pdf',
    detail: 'CH21207 Fluid Mechanics, Arnab Atta, 08 Oct 2026',
  },
  lec11: {
    id: 'lec11', short: 'Lec 11', kind: 'slides', pdfPages: 2,
    title: 'Lecture 11 — Worked problems: stream function & velocity potential',
    file: 'sources/FM_Lec11.pdf', original: 'FM_Lec11.pdf',
    detail: 'CH21207 Fluid Mechanics, Arnab Atta, 09 Oct 2026',
  },
  lec12: {
    id: 'lec12', short: 'Lec 12', kind: 'slides', pdfPages: 19,
    title: 'Lecture 12 — Basic plane potential flows & superposition',
    file: 'sources/FM_Lec12.pdf', original: 'FM_Lec12.pdf',
    detail: 'CH21207 Fluid Mechanics, Arnab Atta, 14 Oct 2026',
  },
  lec13: {
    id: 'lec13', short: 'Lec 13', kind: 'slides', pdfPages: 21,
    title: 'Lecture 13 — Dimensional analysis & Buckingham Pi theorem',
    file: 'sources/FM_Lec13.pdf', original: 'FM_Lec13.pdf',
    detail: 'CH21207 Fluid Mechanics, Arnab Atta, 15 Oct 2026',
  },
  fox: {
    id: 'fox', short: 'Fox & McDonald', kind: 'book', pdfPages: 41,
    title: "Fox & McDonald's Introduction to Fluid Mechanics — excerpt",
    file: 'sources/Fox_McDonald_excerpt.pdf', original: 'Fox and McDonalds (1).pdf',
    printed: [[221, 224, 1], [245, 277, 5], [293, 296, 38]],
    detail: '§6.6 Irrotational flow (pp. 221–224) · Ch. 7 Dimensional analysis & similitude (pp. 245–274) · Ch. 8 Internal flow (pp. 275–277, 293–296)',
  },
  wilkes: {
    id: 'wilkes', short: 'Wilkes', kind: 'book', pdfPages: 62,
    title: 'Wilkes, Fluid Mechanics for Chemical Engineers — Ch. 9 Turbulent Flow',
    file: 'sources/Wilkes_Ch9_Turbulent_Flow.pdf', original: "Wilke's Fluid Mechanics for Chemical Engineers-499-560.pdf",
    printed: [[480, 541, 1]],
    detail: 'Chapter 9 Turbulent Flow, pp. 480–541 (incl. problems)',
  },
}

export const DOC_ORDER: DocId[] = ['lec9', 'lec10', 'lec11', 'lec12', 'lec13', 'fox', 'wilkes']

/**
 * The course PDFs are copyrighted, so the public (GitHub Pages) build is made with VITE_NO_PDFS=1 and ships without
 * them: source chips then show the page reference instead of opening the file. Local builds keep the clickable links.
 */
export const PDFS_AVAILABLE = import.meta.env.VITE_NO_PDFS !== '1'

/** Parse '5', '5–9', '5-9', '251, 253–255' into a sorted list of page numbers. */
export function parsePages(s: string): number[] {
  const out = new Set<number>()
  for (const part of s.split(/[,;]/)) {
    const m = part.trim().match(/^(\d+)\s*(?:[-–—]\s*(\d+))?$/)
    if (!m) continue
    const a = +m[1]
    const b = m[2] ? +m[2] : a
    for (let p = Math.min(a, b); p <= Math.max(a, b); p++) out.add(p)
  }
  return [...out].sort((x, y) => x - y)
}

/** Map a page label (slide number or printed book page) to the PDF page index (1-based). */
export function pdfPageOf(doc: DocId, page: number): number | null {
  const d = DOCS[doc]
  if (d.kind === 'slides') return page >= 1 && page <= d.pdfPages ? page : null
  for (const [a, b, first] of d.printed ?? []) {
    if (page >= a && page <= b) return first + (page - a)
  }
  return null
}

export function srcList(src?: SrcLike): Src[] {
  if (!src) return []
  return Array.isArray(src) ? src : [src]
}

export function pagesLabel(src: Src): string {
  const d = DOCS[src.doc]
  const many = /[-–—,]/.test(src.pages)
  const pages = src.pages.replace(/-/g, '–')
  if (d.kind === 'slides') return `${d.short} · slide${many ? 's' : ''} ${pages}`
  return `${d.short} p${many ? 'p' : ''}. ${pages}`
}

export function srcHref(src: Src): string {
  const first = parsePages(src.pages)[0]
  const pdf = first ? pdfPageOf(src.doc, first) : null
  return `${DOCS[src.doc].file}${pdf ? `#page=${pdf}` : ''}`
}

export function srcTooltip(src: Src): string {
  const d = DOCS[src.doc]
  const pages = parsePages(src.pages)
  const pdf = pages.map((p) => pdfPageOf(src.doc, p)).filter((x): x is number => x != null)
  const pdfTxt = d.kind === 'book' && pdf.length ? ` (PDF page ${pdf[0]}${pdf.length > 1 ? `–${pdf[pdf.length - 1]}` : ''})` : ''
  const action = PDFS_AVAILABLE ? 'Click to open the PDF at this page.' : `Open your copy of "${d.original}" at this page.`
  return `${d.title}${src.note ? ` — ${src.note}` : ''}${pdfTxt}. ${action}`
}

/** Pages that carry no study content (title / textbook-list slides) — excluded from coverage. */
export const NON_CONTENT_PAGES: Partial<Record<DocId, number[]>> = {
  lec9: [1, 15],
  lec10: [1, 12],
  lec11: [1],
  lec12: [1],
  lec13: [1],
}
