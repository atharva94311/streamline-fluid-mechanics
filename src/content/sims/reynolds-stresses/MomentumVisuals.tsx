import { Md, md, cx } from '@/kit'

type Fate = 'mean' | 'zero' | 'reynolds'

const FATE: Record<Fate, { cls: string; tag: string; tagCls: string }> = {
  mean: {
    cls: 'border-emerald-300 bg-emerald-50 dark:border-emerald-500/40 dark:bg-emerald-500/10',
    tag: 'survives → mean-flow convection',
    tagCls: 'text-emerald-700 dark:text-emerald-300',
  },
  zero: {
    cls: 'border-line bg-surface-2/70 opacity-80',
    tag: 'averages to zero',
    tagCls: 'text-ink-3',
  },
  reynolds: {
    cls: 'border-amber-400 bg-amber-50 dark:border-amber-500/50 dark:bg-amber-500/10',
    tag: 'survives → Reynolds stress',
    tagCls: 'text-amber-700 dark:text-amber-300',
  },
}

function Cell({ prod, avg, why, fate }: { prod: string; avg: string; why: string; fate: Fate }) {
  const f = FATE[fate]
  return (
    <div className={cx('rounded-xl border p-2.5 text-center', f.cls)}>
      <Md inline className="text-[0.95rem]">{prod}</Md>
      <div className="my-1 text-[11px] text-ink-3">time-average ↓</div>
      <Md inline className={cx('text-[0.95rem]', fate === 'zero' && 'line-through decoration-ink-3/60')}>{avg}</Md>
      <div className="mt-1 text-[11px] text-ink-3"><Md inline>{why}</Md></div>
      <div className={cx('mt-1 text-[11px] font-bold uppercase tracking-wide', f.tagCls)}>{f.tag}</div>
    </div>
  )
}

/** The four terms of (v̄x + v'x)(v̄y + v'y) and what time-averaging does to each (Wilkes p. 485). */
export function ProductGrid() {
  return (
    <div className="space-y-3">
      <div className="text-center">
        <Md inline>{md`$v_xv_y=(\avg{v}_x+v_x')(\avg{v}_y+v_y')$ — multiply out and average each piece:`}</Md>
      </div>
      <div className="grid grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)] gap-1.5 sm:gap-2.5">
        <div />
        <div className="text-center text-sm font-semibold text-ink-2"><Md inline>{md`$\times\ \avg{v}_y$`}</Md></div>
        <div className="text-center text-sm font-semibold text-ink-2"><Md inline>{md`$\times\ v_y'$`}</Md></div>

        <div className="flex items-center pr-1 text-sm font-semibold text-ink-2"><Md inline>{md`$\avg{v}_x$`}</Md></div>
        <Cell prod={md`$\avg{v}_x\,\avg{v}_y$`} avg={md`$\avg{v}_x\,\avg{v}_y$`} why={md`mean × mean: unchanged (9.3)`} fate="mean" />
        <Cell prod={md`$\avg{v}_x\,v_y'$`} avg={md`$\avg{v}_x\,\avg{v_y'}=0$`} why={md`constant × fluctuation (9.2)`} fate="zero" />

        <div className="flex items-center pr-1 text-sm font-semibold text-ink-2"><Md inline>{md`$v_x'$`}</Md></div>
        <Cell prod={md`$v_x'\,\avg{v}_y$`} avg={md`$\avg{v_x'}\,\avg{v}_y=0$`} why={md`fluctuation × constant (9.2)`} fate="zero" />
        <Cell prod={md`$v_x'\,v_y'$`} avg={md`$\avg{v_x'v_y'}\neq 0$`} why={md`two fluctuations: nonzero if correlated`} fate="reynolds" />
      </div>
      <div className="text-center">
        <Md inline>{md`$\Rightarrow\quad \avg{v_xv_y}=\avg{v}_x\,\avg{v}_y+\avg{v_x'v_y'}$`}</Md>
      </div>
    </div>
  )
}

const AX = ['x', 'y', 'z'] as const

/** 3 × 3 Reynolds-stress tensor −ρ ⟨v'_i v'_j⟩ with the x-direction components of Eq. (9.13) highlighted. */
export function ReynoldsStressTensor() {
  return (
    <div className="space-y-3">
      <div className="mx-auto grid max-w-md grid-cols-[auto_repeat(3,minmax(0,1fr))] gap-1.5 text-center">
        <div className="text-[10px] leading-tight text-ink-3">
          face normal ↓
          <br />
          direction →
        </div>
        {AX.map((j) => (
          <div key={`h${j}`} className={cx('rounded-md py-1 text-sm font-semibold', j === 'x' ? 'text-amber-700 dark:text-amber-300' : 'text-ink-2')}>
            {j}
          </div>
        ))}
        {AX.map((i) => (
          <div key={`r${i}`} className="contents">
            <div className="flex items-center justify-center px-1 text-sm font-semibold text-ink-2">{i}</div>
            {AX.map((j) => {
              const diag = i === j
              const xCol = j === 'x'
              return (
                <div
                  key={`${i}${j}`}
                  className={cx(
                    'rounded-lg border px-1 py-2 text-[0.8rem] sm:text-sm',
                    xCol ? 'border-amber-400 bg-amber-50 dark:border-amber-500/50 dark:bg-amber-500/10' : 'border-line bg-surface',
                    diag && 'ring-1 ring-indigo-400/60',
                  )}
                >
                  <Md inline>{`$-\\rho\\,\\overline{v_${i}'v_${j}'}$`}</Md>
                </div>
              )
            })}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-ink-2">
        <span className="inline-flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded border border-amber-400 bg-amber-50 dark:bg-amber-500/20" /> appear in the x-balance (9.13)</span>
        <span className="inline-flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded ring-1 ring-indigo-400/70" /> normal stresses (diagonal)</span>
        <span>off-diagonal = turbulent shear stresses; symmetric, so 6 independent components</span>
      </div>
    </div>
  )
}
