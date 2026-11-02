import type { ComponentType } from 'react'
import type { ExampleDef, Flashcard, FormulaDef, PracticeDef, ProblemSet, QuizQ, TopicMeta, TopicModule } from '@/lib/types'

export interface RawTopicModule {
  meta: TopicMeta
  formulas?: FormulaDef[]
  examples?: ExampleDef[]
  practice?: PracticeDef[]
  quiz?: QuizQ[]
  flashcards?: Flashcard[]
  takeaways?: string[]
  default: ComponentType
}

export function toTopicModule(m: RawTopicModule): TopicModule {
  return {
    meta: m.meta,
    formulas: m.formulas ?? [],
    examples: m.examples ?? [],
    practice: [...(m.practice ?? [])],
    quiz: [...(m.quiz ?? [])],
    flashcards: m.flashcards ?? [],
    takeaways: m.takeaways ?? [],
    problemSets: [],
    Content: m.default,
  }
}

/** Append problem sets to their topics; returns the sets whose topic does not exist. */
export function attachSets(byId: Record<string, TopicModule>, sets: ProblemSet[]): ProblemSet[] {
  const orphans: ProblemSet[] = []
  for (const set of sets) {
    const t = byId[set.topic]
    if (!t) {
      orphans.push(set)
      continue
    }
    t.problemSets.push(set)
    t.practice.push(...set.problems)
    t.quiz.push(...(set.quiz ?? []))
  }
  for (const t of Object.values(byId)) t.problemSets.sort((a, b) => a.id.localeCompare(b.id))
  return orphans
}
