import type { ProblemSet, TopicModule, UnitDef } from '@/lib/types'
import { UNITS } from './units'
import { attachSets, toTopicModule, type RawTopicModule } from './normalize'

// Every file in ./topics is a topic module and every file in ./problemsets exports `sets`
// (auto-discovered — no manual registration needed).
const files = import.meta.glob<RawTopicModule>('./topics/*.tsx', { eager: true })
const setFiles = import.meta.glob<{ sets?: ProblemSet[] }>('./problemsets/*.tsx', { eager: true })

const byId: Record<string, TopicModule> = {}
for (const [path, m] of Object.entries(files)) {
  if (!m?.meta) {
    console.warn(`[registry] ${path} has no exported meta — skipped`)
    continue
  }
  byId[m.meta.id] = toTopicModule(m)
}

export const ORPHAN_SETS: ProblemSet[] = attachSets(
  byId,
  Object.values(setFiles).flatMap((mod) => mod.sets ?? []),
)

/** Topics in learning-path order (only those that exist). */
export const TOPIC_ORDER: string[] = UNITS.flatMap((u) => u.topics).filter((id) => byId[id])
export const TOPICS: TopicModule[] = TOPIC_ORDER.map((id) => byId[id])
export const TOPIC_BY_ID = byId

export function unitOf(topicId: string): UnitDef | undefined {
  return UNITS.find((u) => u.topics.includes(topicId))
}

export function neighbours(topicId: string): { prev?: TopicModule; next?: TopicModule } {
  const i = TOPIC_ORDER.indexOf(topicId)
  return { prev: i > 0 ? byId[TOPIC_ORDER[i - 1]] : undefined, next: i >= 0 && i < TOPIC_ORDER.length - 1 ? byId[TOPIC_ORDER[i + 1]] : undefined }
}
