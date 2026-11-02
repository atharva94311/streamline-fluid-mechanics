import { BookOpenCheck, Brain, ClipboardList, LayoutDashboard, Sigma, Waves, X } from 'lucide-react'
import { PLANNED_TITLES, UNITS } from '@/content/units'
import { TOPIC_BY_ID } from '@/content/registry'
import { useRoute } from '@/lib/router'
import { useProgress } from '@/lib/store'
import { aggregate, topicProgress } from '@/lib/progressCalc'
import { UNIT_THEME } from '@/lib/theme'
import { cx } from '@/kit/cx'
import { ProgressRing } from './ProgressRing'

const NAV = [
  { href: '#/', label: 'Dashboard', icon: LayoutDashboard, match: 'home' },
  { href: '#/syllabus', label: 'Syllabus & coverage', icon: BookOpenCheck, match: 'syllabus' },
  { href: '#/formulas', label: 'Formula sheet', icon: Sigma, match: 'formulas' },
  { href: '#/practice', label: 'Practice bank', icon: ClipboardList, match: 'practice' },
  { href: '#/revision', label: 'Revision mode', icon: Brain, match: 'revision' },
] as const

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const route = useRoute()
  const p = useProgress()
  const activeTopic = route.name === 'topic' ? route.id : null

  return (
    <>
      <div
        className={cx('fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm transition lg:hidden', open ? 'opacity-100' : 'pointer-events-none opacity-0')}
        onClick={onClose}
        aria-hidden
      />
      <aside
        className={cx(
          'no-print fixed inset-y-0 left-0 z-40 flex w-[19rem] flex-col border-r border-line bg-surface transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center gap-3 px-5 pb-3 pt-5">
          <a href="#/" onClick={onClose} className="flex items-center gap-3 no-underline">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 via-sky-500 to-teal-400 text-white shadow-lg shadow-indigo-500/25">
              <Waves className="h-5 w-5" />
            </span>
            <span>
              <span className="block font-display text-lg font-bold leading-tight text-ink">Streamline</span>
              <span className="block text-[11px] font-medium uppercase tracking-wider text-ink-3">CH21207 Fluid Mechanics</span>
            </span>
          </a>
          <button type="button" onClick={onClose} className="ml-auto rounded-lg p-1.5 text-ink-3 hover:bg-surface-2 lg:hidden" aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="scrollbar-thin flex-1 overflow-y-auto px-3 pb-6">
          <ul className="space-y-0.5">
            {NAV.map((n) => {
              const active = route.name === n.match
              const Icon = n.icon
              return (
                <li key={n.href}>
                  <a
                    href={n.href}
                    onClick={onClose}
                    className={cx(
                      'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium no-underline transition',
                      active ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-200' : 'text-ink-2 hover:bg-surface-2 hover:text-ink',
                    )}
                  >
                    <Icon className="h-4.5 w-4.5" />
                    {n.label}
                  </a>
                </li>
              )
            })}
          </ul>

          {UNITS.map((u) => {
            const mods = u.topics.map((t) => TOPIC_BY_ID[t]).filter(Boolean)
            const agg = aggregate(mods, p)
            const th = UNIT_THEME[u.id]
            return (
              <div key={u.id} className="mt-5">
                <div className="mb-1.5 flex items-center gap-2 px-3">
                  <span className={cx('flex h-5 w-5 items-center justify-center rounded-md text-[11px] font-bold text-white', th.bg)}>{u.id}</span>
                  <span className="flex-1 text-xs font-bold uppercase tracking-wider text-ink-3">{u.short}</span>
                  <span className="text-[11px] font-semibold text-ink-3">{Math.round(agg.pct * 100)}%</span>
                </div>
                <ul className="space-y-0.5">
                  {u.topics.map((tid) => {
                    const m = TOPIC_BY_ID[tid]
                    if (!m)
                      return (
                        <li key={tid}>
                          <span title="This topic is still being prepared" className="flex items-center gap-2.5 rounded-xl px-3 py-1.5 text-[13.5px] text-ink-3">
                            <span className="h-5 w-5 shrink-0 rounded-full border-2 border-dashed border-line" />
                            <span className="min-w-0 flex-1 leading-snug">{PLANNED_TITLES[tid] ?? tid}</span>
                            <span className="rounded bg-surface-2 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider">soon</span>
                          </span>
                        </li>
                      )
                    const tp = topicProgress(m, p)
                    const active = activeTopic === m.meta.id
                    return (
                      <li key={m.meta.id}>
                        <a
                          href={`#/topic/${m.meta.id}`}
                          onClick={onClose}
                          className={cx(
                            'group flex items-center gap-2.5 rounded-xl px-3 py-1.5 text-[13.5px] no-underline transition',
                            active ? cx(th.soft, 'font-semibold text-ink') : 'text-ink-2 hover:bg-surface-2 hover:text-ink',
                          )}
                        >
                          <ProgressRing value={tp.pct} size={20} stroke={3} color={th.hex} />
                          <span className="min-w-0 flex-1 leading-snug">{m.meta.title}</span>
                        </a>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
