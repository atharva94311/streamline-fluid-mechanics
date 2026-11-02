import type { UnitId } from './types'
import { TOPICS, unitOf } from '@/content/registry'
import { topicHref } from './router'

export interface SearchItem {
  kind: 'topic' | 'concept' | 'formula' | 'example' | 'practice' | 'flashcard'
  title: string
  sub: string
  text: string
  href: string
  unit: UnitId
}

/** Rough plain text from markdown + TeX for matching. */
export function plain(s: string): string {
  return s
    .replace(/\\(?:frac|dfrac|tfrac)\{([^}]*)\}\{([^}]*)\}/g, '$1 / $2')
    .replace(/\\(left|right|mathrm|mathbf|boldsymbol|text|operatorname|displaystyle|quad|qquad)\b/g, ' ')
    .replace(/\\([a-zA-Z]+)/g, ' $1 ')
    .replace(/[$*_^{}\\|#>`~]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

let cache: SearchItem[] | null = null

export function searchIndex(): SearchItem[] {
  if (cache) return cache
  const out: SearchItem[] = []
  for (const m of TOPICS) {
    const unit = unitOf(m.meta.id)?.id ?? 'A'
    const t = m.meta.title
    out.push({ kind: 'topic', title: t, sub: m.meta.subtitle, text: `${t} ${m.meta.subtitle}`, href: topicHref(m.meta.id), unit })
    for (const c of m.meta.concepts)
      out.push({ kind: 'concept', title: c.title, sub: t, text: `${c.title} ${c.summary ?? ''}`, href: topicHref(m.meta.id, c.id), unit })
    for (const f of m.formulas)
      out.push({
        kind: 'formula',
        title: f.name,
        sub: t,
        text: `${f.name} ${plain(f.tex)} ${(f.vars ?? []).map((v) => plain(v.desc)).join(' ')}`,
        href: topicHref(m.meta.id),
        unit,
      })
    for (const e of m.examples)
      out.push({ kind: 'example', title: e.title, sub: t, text: `${e.title} ${plain(e.given)} ${plain(e.find)}`, href: topicHref(m.meta.id, `ex-${e.id}`), unit })
    for (const p of m.practice)
      out.push({ kind: 'practice', title: plain(p.q).slice(0, 90), sub: t, text: plain(p.q), href: topicHref(m.meta.id, `pr-${p.id}`), unit })
    for (const f of m.flashcards)
      out.push({ kind: 'flashcard', title: plain(f.front).slice(0, 90), sub: t, text: `${plain(f.front)} ${plain(f.back)}`, href: '#/revision/flashcards', unit })
  }
  cache = out
  return out
}

export function search(q: string, limit = 40): SearchItem[] {
  const tokens = q.toLowerCase().split(/\s+/).filter(Boolean)
  if (!tokens.length) return []
  const scored: [number, SearchItem][] = []
  for (const it of searchIndex()) {
    const title = it.title.toLowerCase()
    const text = `${title} ${it.text.toLowerCase()}`
    if (!tokens.every((tk) => text.includes(tk))) continue
    let score = 0
    for (const tk of tokens) {
      if (title.startsWith(tk)) score += 6
      else if (title.includes(tk)) score += 3
      else score += 1
    }
    score += { topic: 5, concept: 4, formula: 3, example: 2, practice: 1, flashcard: 0 }[it.kind]
    scored.push([score, it])
  }
  return scored.sort((a, b) => b[0] - a[0]).slice(0, limit).map((x) => x[1])
}
