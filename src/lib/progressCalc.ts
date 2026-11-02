import type { TopicModule } from './types'
import type { ProgressState } from './store'

export interface TopicProgress {
  pct: number
  concepts: [number, number]
  examples: [number, number]
  practice: [number, number]
  quiz: [number, number]
}

/** Weighted progress: concepts 45 %, solved examples 20 %, practice 15 %, quiz (correct) 20 %. */
export function topicProgress(m: TopicModule, p: ProgressState): TopicProgress {
  const id = m.meta.id
  const c = m.meta.concepts.filter((x) => p.concepts[`${id}:${x.id}`]).length
  const ex = m.examples.filter((x) => p.examples[`${id}:${x.id}`]).length
  const pr = m.practice.filter((x) => p.practice[`${id}:${x.id}`]).length
  const qz = m.quiz.filter((x) => p.quiz[`${id}:${x.id}`]?.ok).length
  const parts: [number, number | null][] = [
    [0.45, m.meta.concepts.length ? c / m.meta.concepts.length : null],
    [0.2, m.examples.length ? ex / m.examples.length : null],
    [0.15, m.practice.length ? pr / m.practice.length : null],
    [0.2, m.quiz.length ? qz / m.quiz.length : null],
  ]
  const used = parts.filter((x): x is [number, number] => x[1] != null)
  const w = used.reduce((s, x) => s + x[0], 0)
  const pct = w ? used.reduce((s, x) => s + x[0] * x[1], 0) / w : 0
  return {
    pct,
    concepts: [c, m.meta.concepts.length],
    examples: [ex, m.examples.length],
    practice: [pr, m.practice.length],
    quiz: [qz, m.quiz.length],
  }
}

export function aggregate(mods: TopicModule[], p: ProgressState) {
  const tp = mods.map((m) => topicProgress(m, p))
  const sum = (k: 'concepts' | 'examples' | 'practice' | 'quiz', i: 0 | 1) => tp.reduce((s, t) => s + t[k][i], 0)
  const pct = tp.length ? tp.reduce((s, t) => s + t.pct, 0) / tp.length : 0
  return {
    pct,
    concepts: [sum('concepts', 0), sum('concepts', 1)] as [number, number],
    examples: [sum('examples', 0), sum('examples', 1)] as [number, number],
    practice: [sum('practice', 0), sum('practice', 1)] as [number, number],
    quiz: [sum('quiz', 0), sum('quiz', 1)] as [number, number],
  }
}
