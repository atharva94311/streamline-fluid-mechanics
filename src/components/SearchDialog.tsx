import { useEffect, useMemo, useRef, useState } from 'react'
import { BookOpen, Calculator, FileStack, Layers, Search, Sigma, Target } from 'lucide-react'
import { search, type SearchItem } from '@/lib/searchIndex'
import { navigate } from '@/lib/router'
import { UNIT_THEME } from '@/lib/theme'
import { cx } from '@/kit/cx'

const ICON = { topic: BookOpen, concept: Layers, formula: Sigma, example: Calculator, practice: Target, flashcard: FileStack }
const KIND_LABEL = { topic: 'Topic', concept: 'Concept', formula: 'Formula', example: 'Solved example', practice: 'Practice', flashcard: 'Flashcard' }

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const results = useMemo(() => search(q), [q])

  useEffect(() => {
    if (open) {
      setQ('')
      setSel(0)
      setTimeout(() => inputRef.current?.focus(), 10)
    }
  }, [open])

  if (!open) return null
  const go = (it: SearchItem) => {
    onClose()
    navigate(it.href)
  }

  return (
    <div className="no-print fixed inset-0 z-50 flex items-start justify-center bg-slate-900/50 p-4 pt-[10vh] backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search className="h-5 w-5 text-ink-3" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => {
              setQ(e.target.value)
              setSel(0)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') onClose()
              if (e.key === 'ArrowDown') {
                e.preventDefault()
                setSel((s) => Math.min(results.length - 1, s + 1))
              }
              if (e.key === 'ArrowUp') {
                e.preventDefault()
                setSel((s) => Math.max(0, s - 1))
              }
              if (e.key === 'Enter' && results[sel]) go(results[sel])
            }}
            placeholder="Search topics, concepts, formulas, examples…  (e.g. vorticity, Blasius, Reynolds stress)"
            className="h-14 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-ink-3"
          />
          <kbd className="rounded-md border border-line px-1.5 py-0.5 text-[11px] text-ink-3">Esc</kbd>
        </div>
        <ul className="scrollbar-thin max-h-[60vh] overflow-y-auto p-2">
          {q && !results.length ? <li className="px-3 py-6 text-center text-sm text-ink-3">No matches for “{q}”.</li> : null}
          {!q ? (
            <li className="px-3 py-6 text-center text-sm text-ink-3">Type to search across all {`topics`}, formulas, solved examples and practice problems.</li>
          ) : null}
          {results.map((it, i) => {
            const Icon = ICON[it.kind]
            return (
              <li key={`${it.kind}-${it.href}-${i}`}>
                <button
                  type="button"
                  onMouseEnter={() => setSel(i)}
                  onClick={() => go(it)}
                  className={cx('flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left', i === sel ? 'bg-surface-2' : '')}
                >
                  <span className={cx('mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg', UNIT_THEME[it.unit].soft)}>
                    <Icon className={cx('h-4 w-4', UNIT_THEME[it.unit].text)} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-ink">{it.title}</span>
                    <span className="block truncate text-xs text-ink-3">
                      {KIND_LABEL[it.kind]} · {it.sub}
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
