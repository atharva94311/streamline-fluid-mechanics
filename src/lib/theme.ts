import type { UnitId } from './types'

/** Full Tailwind class strings per unit (kept literal so Tailwind can see them). */
export const UNIT_THEME: Record<
  UnitId,
  { name: string; text: string; bg: string; soft: string; border: string; ring: string; grad: string; dot: string; hex: string }
> = {
  A: {
    name: 'indigo',
    text: 'text-indigo-600 dark:text-indigo-300',
    bg: 'bg-indigo-600',
    soft: 'bg-indigo-50 dark:bg-indigo-500/10',
    border: 'border-indigo-200 dark:border-indigo-500/30',
    ring: 'ring-indigo-500/30',
    grad: 'from-indigo-600 via-violet-600 to-fuchsia-600',
    dot: 'bg-indigo-500',
    hex: '#6366f1',
  },
  B: {
    name: 'cyan',
    text: 'text-cyan-700 dark:text-cyan-300',
    bg: 'bg-cyan-600',
    soft: 'bg-cyan-50 dark:bg-cyan-500/10',
    border: 'border-cyan-200 dark:border-cyan-500/30',
    ring: 'ring-cyan-500/30',
    grad: 'from-sky-600 via-cyan-600 to-teal-500',
    dot: 'bg-cyan-500',
    hex: '#06b6d4',
  },
  C: {
    name: 'amber',
    text: 'text-amber-700 dark:text-amber-300',
    bg: 'bg-amber-500',
    soft: 'bg-amber-50 dark:bg-amber-500/10',
    border: 'border-amber-200 dark:border-amber-500/30',
    ring: 'ring-amber-500/30',
    grad: 'from-amber-500 via-orange-500 to-rose-500',
    dot: 'bg-amber-500',
    hex: '#f59e0b',
  },
  D: {
    name: 'rose',
    text: 'text-rose-600 dark:text-rose-300',
    bg: 'bg-rose-600',
    soft: 'bg-rose-50 dark:bg-rose-500/10',
    border: 'border-rose-200 dark:border-rose-500/30',
    ring: 'ring-rose-500/30',
    grad: 'from-rose-600 via-pink-600 to-purple-600',
    dot: 'bg-rose-500',
    hex: '#f43f5e',
  },
}
