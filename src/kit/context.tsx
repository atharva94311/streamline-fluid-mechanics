import { createContext, useContext } from 'react'
import type { TopicModule } from '@/lib/types'

export const TopicContext = createContext<TopicModule | null>(null)

/** The topic module currently being rendered (null outside a topic page). */
export function useTopic(): TopicModule | null {
  return useContext(TopicContext)
}

/** Lookup helper that throws a readable error when an id is missing (caught by the test-suite). */
export function lookup<T extends { id: string }>(list: T[] | undefined, id: string, what: string): T {
  const hit = list?.find((x) => x.id === id)
  if (!hit) throw new Error(`[content] ${what} "${id}" not found in this topic`)
  return hit
}

/** When true (test-suite / print), collapsible content renders fully expanded. */
export const RevealAllContext = createContext(false)
export const useRevealAll = () => useContext(RevealAllContext)
