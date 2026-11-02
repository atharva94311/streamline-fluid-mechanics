import type { ReactNode } from 'react'
import { AlertTriangle, BookMarked, Info, Lightbulb, Star, Target } from 'lucide-react'
import { cx } from './cx'

const KINDS = {
  tip: { icon: Lightbulb, label: 'Tip', cls: 'border-amber-300 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10', ic: 'text-amber-600 dark:text-amber-300' },
  exam: { icon: Target, label: 'Exam focus', cls: 'border-violet-300 bg-violet-50 dark:border-violet-500/30 dark:bg-violet-500/10', ic: 'text-violet-600 dark:text-violet-300' },
  warning: { icon: AlertTriangle, label: 'Common mistake', cls: 'border-red-300 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10', ic: 'text-red-600 dark:text-red-300' },
  note: { icon: Info, label: 'Note', cls: 'border-sky-300 bg-sky-50 dark:border-sky-500/30 dark:bg-sky-500/10', ic: 'text-sky-600 dark:text-sky-300' },
  key: { icon: Star, label: 'Key idea', cls: 'border-indigo-300 bg-indigo-50 dark:border-indigo-500/30 dark:bg-indigo-500/10', ic: 'text-indigo-600 dark:text-indigo-300' },
  def: { icon: BookMarked, label: 'Definition', cls: 'border-emerald-300 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10', ic: 'text-emerald-600 dark:text-emerald-300' },
} as const

export type CalloutKind = keyof typeof KINDS

export function Callout({ kind = 'note', title, children }: { kind?: CalloutKind; title?: string; children: ReactNode }) {
  const k = KINDS[kind]
  const Icon = k.icon
  return (
    <div className={cx('callout flex gap-3 rounded-xl border px-4 py-3', k.cls)}>
      <Icon className={cx('mt-0.5 h-5 w-5 shrink-0', k.ic)} aria-hidden />
      <div className="min-w-0 flex-1">
        <div className={cx('mb-1 text-xs font-bold uppercase tracking-wider', k.ic)}>{title ?? k.label}</div>
        <div className="text-[0.95rem] text-ink">{children}</div>
      </div>
    </div>
  )
}
