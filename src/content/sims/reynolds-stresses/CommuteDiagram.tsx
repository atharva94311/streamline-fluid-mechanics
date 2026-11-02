import { ArrowDown, ArrowRight } from 'lucide-react'
import { Md, md } from '@/kit'

function Box({ children, tone = 'slate' }: { children: string; tone?: 'slate' | 'indigo' | 'emerald' | 'amber' }) {
  const cls = {
    slate: 'border-line bg-surface',
    indigo: 'border-indigo-300 bg-indigo-50 dark:border-indigo-500/40 dark:bg-indigo-500/10',
    emerald: 'border-emerald-300 bg-emerald-50 dark:border-emerald-500/40 dark:bg-emerald-500/10',
    amber: 'border-amber-300 bg-amber-50 dark:border-amber-500/40 dark:bg-amber-500/10',
  }[tone]
  return (
    <div className={`flex min-h-[3.4rem] items-center justify-center rounded-xl border px-2 py-2 text-center ${cls}`}>
      <Md inline className="text-[0.95rem]">{children}</Md>
    </div>
  )
}

function HArrow({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-1 text-ink-3">
      <span className="text-[11px] font-semibold"><Md inline>{label}</Md></span>
      <ArrowRight className="h-5 w-5" aria-hidden />
    </div>
  )
}

function VArrow({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center gap-1.5 py-1 text-ink-3">
      <ArrowDown className="h-5 w-5 shrink-0" aria-hidden />
      <span className="text-[11px] font-semibold">{label}</span>
    </div>
  )
}

/**
 * "Commuting square": differentiate-then-average gives the same result as average-then-differentiate,
 * because the time average and the space derivative act on different independent variables.
 */
export function CommuteDiagram() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-stretch gap-x-1 sm:gap-x-3">
        <Box tone="indigo">{md`$v_x(x,t)=\avg{v}_x+v_x'$`}</Box>
        <HArrow label={md`$\partial/\partial x$`} />
        <Box tone="indigo">{md`$\pd{v_x}{x}$`}</Box>

        <VArrow label="time-average" />
        <div />
        <VArrow label="time-average" />

        <Box tone="emerald">{md`$\avg{v}_x(x)$`}</Box>
        <HArrow label={md`$\partial/\partial x$`} />
        <Box tone="emerald">{md`$\pd{\avg{v}_x}{x}=\avg{\left(\pd{v_x}{x}\right)}$`}</Box>
      </div>
      <p className="text-center text-xs text-ink-3">
        Both routes from the top-left corner reach the same bottom-right result: averaging (over t) and differentiating (in x) commute.
      </p>
      <div className="grid gap-2 rounded-xl border border-dashed border-amber-400/70 p-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1.6fr)] sm:items-center">
        <Box tone="amber">{md`$v_x\,v_y$ (a product)`}</Box>
        <HArrow label="time-average" />
        <Box tone="amber">{md`$\avg{v_xv_y}=\avg{v}_x\avg{v}_y+\avg{v_x'v_y'}\ \neq\ \avg{v}_x\avg{v}_y$`}</Box>
        <p className="text-xs text-ink-2 sm:col-span-3">
          The exception: averaging does <strong>not</strong> commute with multiplication. Continuity contains no products, so it averages cleanly;
          the momentum equation does, and that is where the Reynolds stresses come from (next concept).
        </p>
      </div>
    </div>
  )
}
