import { useEffect, useRef, useState } from 'react'
import { ChevronRight, Download, Menu, Moon, RotateCcw, Search, Settings, Sun, Upload } from 'lucide-react'
import { useRoute } from '@/lib/router'
import { progress } from '@/lib/store'
import { TOPIC_BY_ID, unitOf } from '@/content/registry'
import { UNIT_THEME } from '@/lib/theme'
import { cx } from '@/kit/cx'

const PAGE_TITLE: Record<string, string> = {
  home: 'Dashboard',
  syllabus: 'Syllabus & coverage',
  formulas: 'Formula sheet',
  practice: 'Practice bank',
  revision: 'Revision mode',
  notfound: 'Not found',
}

export function useTheme(): [boolean, () => void] {
  const [dark, setDark] = useState(() => typeof document !== 'undefined' && document.documentElement.classList.contains('dark'))
  const toggle = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    try {
      localStorage.setItem('streamline-theme', next ? 'dark' : 'light')
    } catch {
      /* ignore */
    }
  }
  return [dark, toggle]
}

export function TopBar({ onMenu, onSearch }: { onMenu: () => void; onSearch: () => void }) {
  const route = useRoute()
  const [dark, toggleTheme] = useTheme()
  const [menu, setMenu] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menu) return
    const close = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenu(false)
    }
    window.addEventListener('mousedown', close)
    return () => window.removeEventListener('mousedown', close)
  }, [menu])

  const topic = route.name === 'topic' ? TOPIC_BY_ID[route.id] : undefined
  const unit = topic ? unitOf(topic.meta.id) : undefined

  const exportProgress = () => {
    const blob = new Blob([progress.exportJSON()], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'streamline-progress.json'
    a.click()
    URL.revokeObjectURL(a.href)
    setMenu(false)
  }

  return (
    <header className="no-print sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line bg-surface/85 px-4 backdrop-blur-md lg:px-8">
      <button type="button" onClick={onMenu} className="rounded-lg p-2 text-ink-2 hover:bg-surface-2 lg:hidden" aria-label="Open menu">
        <Menu className="h-5 w-5" />
      </button>
      <nav className="flex min-w-0 flex-1 items-center gap-1.5 text-sm">
        {topic && unit ? (
          <>
            <span className={cx('hidden shrink-0 rounded-md px-2 py-0.5 text-xs font-bold sm:inline', UNIT_THEME[unit.id].soft, UNIT_THEME[unit.id].text)}>
              Unit {unit.id} · {unit.short}
            </span>
            <ChevronRight className="hidden h-4 w-4 shrink-0 text-ink-3 sm:block" />
            <span className="truncate font-semibold text-ink">{topic.meta.title}</span>
          </>
        ) : (
          <span className="truncate font-semibold text-ink">{PAGE_TITLE[route.name] ?? ''}</span>
        )}
      </nav>
      <button
        type="button"
        onClick={onSearch}
        className="flex items-center gap-2 rounded-xl border border-line bg-surface-2 px-3 py-1.5 text-sm text-ink-3 transition hover:border-ink-3 hover:text-ink"
      >
        <Search className="h-4 w-4" />
        <span className="hidden md:inline">Search</span>
        <kbd className="hidden rounded border border-line bg-surface px-1 text-[10px] md:inline">⌘K</kbd>
      </button>
      <button type="button" onClick={toggleTheme} className="rounded-xl p-2 text-ink-2 hover:bg-surface-2" aria-label="Toggle dark mode" title="Toggle dark mode">
        {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>
      <div className="relative" ref={menuRef}>
        <button type="button" onClick={() => setMenu((m) => !m)} className="rounded-xl p-2 text-ink-2 hover:bg-surface-2" aria-label="Progress settings" title="Progress settings">
          <Settings className="h-5 w-5" />
        </button>
        {menu ? (
          <div className="absolute right-0 top-11 w-60 rounded-xl border border-line bg-surface p-1.5 shadow-xl">
            <div className="px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-ink-3">Progress (saved in this browser)</div>
            <button type="button" onClick={exportProgress} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-ink-2 hover:bg-surface-2">
              <Download className="h-4 w-4" /> Export progress file
            </button>
            <button type="button" onClick={() => fileRef.current?.click()} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-ink-2 hover:bg-surface-2">
              <Upload className="h-4 w-4" /> Import progress file
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Reset ALL progress (concepts, quiz answers, flashcards, stars)? This cannot be undone.')) progress.reset()
                setMenu(false)
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
            >
              <RotateCcw className="h-4 w-4" /> Reset all progress
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={async (e) => {
                const f = e.target.files?.[0]
                if (!f) return
                const ok = progress.importJSON(await f.text())
                window.alert(ok ? 'Progress imported.' : 'That file could not be read.')
                setMenu(false)
              }}
            />
          </div>
        ) : null}
      </div>
    </header>
  )
}
