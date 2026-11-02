import { useSyncExternalStore } from 'react'

/** Hash router: works from a dev server and from dist/index.html opened via file://. */
export type Route =
  | { name: 'home' }
  | { name: 'topic'; id: string; concept?: string }
  | { name: 'syllabus' }
  | { name: 'formulas' }
  | { name: 'practice' }
  | { name: 'revision'; tab?: string }
  | { name: 'notfound'; path: string }

function parse(hash: string): Route {
  const path = hash.replace(/^#/, '').replace(/^\/+/, '')
  const [a, b, c] = path.split('/').map((s) => decodeURIComponent(s))
  if (!a) return { name: 'home' }
  if (a === 'topic' && b) return { name: 'topic', id: b, concept: c || undefined }
  if (a === 'syllabus') return { name: 'syllabus' }
  if (a === 'formulas') return { name: 'formulas' }
  if (a === 'practice') return { name: 'practice' }
  if (a === 'revision') return { name: 'revision', tab: b || undefined }
  return { name: 'notfound', path }
}

const subscribe = (cb: () => void) => {
  window.addEventListener('hashchange', cb)
  return () => window.removeEventListener('hashchange', cb)
}
const getHash = () => window.location.hash

export function useRoute(): Route {
  const hash = useSyncExternalStore(subscribe, getHash, () => '')
  return parse(hash)
}

export function navigate(to: string) {
  const target = to.startsWith('#') ? to : `#${to.startsWith('/') ? to : `/${to}`}`
  if (window.location.hash === target) window.dispatchEvent(new HashChangeEvent('hashchange'))
  else window.location.hash = target
}

export const topicHref = (id: string, concept?: string) => `#/topic/${id}${concept ? `/${concept}` : ''}`
