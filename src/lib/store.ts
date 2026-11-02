import { useSyncExternalStore } from 'react'

/**
 * Persistent progress store (localStorage). Keys are `${topicId}:${itemId}`.
 * Every read/write is wrapped so the app still works when storage is blocked.
 */
export interface ProgressState {
  v: 1
  concepts: Record<string, number>
  examples: Record<string, number>
  practice: Record<string, { ok: boolean; ts: number }>
  quiz: Record<string, { ok: boolean; choice: number; ts: number }>
  cards: Record<string, { box: number; due: number; seen: number }>
  stars: Record<string, number>
  visited: Record<string, number>
  last?: string
}

const KEY = 'streamline-progress-v1'

const empty = (): ProgressState => ({
  v: 1, concepts: {}, examples: {}, practice: {}, quiz: {}, cards: {}, stars: {}, visited: {},
})

function load(): ProgressState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return empty()
    const parsed = JSON.parse(raw)
    return { ...empty(), ...parsed, v: 1 }
  } catch {
    return empty()
  }
}

let state: ProgressState = load()
const listeners = new Set<() => void>()
let saveTimer: ReturnType<typeof setTimeout> | null = null

function persist() {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      /* storage unavailable — progress lives for this session only */
    }
  }, 150)
}

function set(updater: (s: ProgressState) => ProgressState) {
  state = updater(state)
  persist()
  listeners.forEach((l) => l())
}

export function getProgress(): ProgressState {
  return state
}

export function subscribe(l: () => void) {
  listeners.add(l)
  return () => listeners.delete(l)
}

export function useProgress(): ProgressState {
  return useSyncExternalStore(subscribe, getProgress, getProgress)
}

const k = (topic: string, id: string) => `${topic}:${id}`

export const progress = {
  key: k,
  setConcept(topic: string, id: string, done: boolean) {
    set((s) => {
      const concepts = { ...s.concepts }
      if (done) concepts[k(topic, id)] = Date.now()
      else delete concepts[k(topic, id)]
      return { ...s, concepts }
    })
  },
  markExample(topic: string, id: string) {
    if (state.examples[k(topic, id)]) return
    set((s) => ({ ...s, examples: { ...s.examples, [k(topic, id)]: Date.now() } }))
  },
  recordPractice(topic: string, id: string, ok: boolean) {
    set((s) => ({ ...s, practice: { ...s.practice, [k(topic, id)]: { ok, ts: Date.now() } } }))
  },
  recordQuiz(topic: string, id: string, choice: number, ok: boolean) {
    set((s) => ({ ...s, quiz: { ...s.quiz, [k(topic, id)]: { ok, choice, ts: Date.now() } } }))
  },
  clearQuiz(topic: string, ids: string[]) {
    set((s) => {
      const quiz = { ...s.quiz }
      ids.forEach((id) => delete quiz[k(topic, id)])
      return { ...s, quiz }
    })
  },
  /** Leitner boxes 0..4; 'again' resets to box 0, 'good' +1, 'easy' +2. */
  gradeCard(topic: string, id: string, grade: 'again' | 'good' | 'easy') {
    const DAY = 86400000
    const intervals = [0, 1, 3, 7, 16]
    set((s) => {
      const cur = s.cards[k(topic, id)] ?? { box: 0, due: 0, seen: 0 }
      const box = grade === 'again' ? 0 : Math.min(4, cur.box + (grade === 'easy' ? 2 : 1))
      const due = grade === 'again' ? Date.now() + 60_000 : Date.now() + intervals[box] * DAY
      return { ...s, cards: { ...s.cards, [k(topic, id)]: { box, due, seen: cur.seen + 1 } } }
    })
  },
  toggleStar(topic: string, id: string) {
    set((s) => {
      const stars = { ...s.stars }
      if (stars[k(topic, id)]) delete stars[k(topic, id)]
      else stars[k(topic, id)] = Date.now()
      return { ...s, stars }
    })
  },
  visit(topic: string, route: string) {
    set((s) => ({ ...s, visited: { ...s.visited, [topic]: Date.now() }, last: route }))
  },
  reset() {
    set(() => empty())
  },
  exportJSON(): string {
    return JSON.stringify(state, null, 2)
  },
  importJSON(json: string): boolean {
    try {
      const parsed = JSON.parse(json)
      if (typeof parsed !== 'object' || !parsed) return false
      set(() => ({ ...empty(), ...parsed, v: 1 }))
      return true
    } catch {
      return false
    }
  },
}
