/**
 * Pi-count explorer (pi theorem): pick variables from a library → dimensional matrix, r = rank, k − r,
 * plus the Step-1 warnings of Lecture 13 slide 7 (a dimension in only one variable; dependent variables in the list).
 */
import { useMemo, useState } from 'react'
import { Readout, Segmented, SimPanel, cx } from '@/kit'
import { DIM_TEX, V, analyse, type DimVar, type Sys } from './dimlib'
import { MatrixTable } from './MatrixTable'
import { Chip, TeX } from './svg'

const LIB: DimVar[] = [V.dpl, V.dp, V.F, V.V, V.D, V.l, V.e, V.A, V.rho, V.mu, V.nu, V.g, V.gamma, V.sigma, V.Ev, V.c, V.omega, V.Q, V.m, V.t]

const SETS: { id: string; label: string; ids: string[] }[] = [
  { id: 'pipe', label: 'Pipe (Lec 13)', ids: ['dpl', 'D', 'rho', 'mu', 'V'] },
  { id: 'sphere', label: 'Sphere (Fox 7.1)', ids: ['F', 'V', 'D', 'rho', 'mu'] },
  { id: 'cap', label: 'Capillary-like', ids: ['l', 'D', 'gamma', 'sigma'] },
  { id: 'bad', label: 'Flawed list', ids: ['dp', 'D', 'A', 'V', 'rho', 'g', 'gamma', 'm'] },
]

/** Pairs/triples that are not independent (slide 7: area or diameter; γ = ρg) plus ν = μ/ρ. */
const DEPENDENT_GROUPS: { ids: string[]; msg: string }[] = [
  { ids: ['A', 'D'], msg: 'Area and diameter together: use one or the other, not both (slide 7).' },
  { ids: ['gamma', 'rho', 'g'], msg: 'γ = ρg — list at most two of γ, ρ, g (slide 7).' },
  { ids: ['nu', 'mu', 'rho'], msg: 'ν = μ/ρ — list at most two of ν, μ, ρ.' },
]

export function PiCounter() {
  const [ids, setIds] = useState<string[]>(SETS[0].ids)
  const [sys, setSys] = useState<Sys>('FLT')
  const vars = useMemo(() => ids.map((id) => LIB.find((v) => v.id === id)!).filter(Boolean), [ids])
  const an = useMemo(() => (vars.length ? analyse(vars, sys) : null), [vars, sys])
  const k = vars.length
  const r = an?.r ?? 0
  const nPi = k - r

  const toggle = (id: string) => setIds((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))

  const lonely = an ? an.present.filter((i) => an.A[i].filter((x) => x !== 0).length === 1) : []
  const depWarn = DEPENDENT_GROUPS.filter((g) => g.ids.every((x) => ids.includes(x)))

  // bar geometry
  const W = 520
  const unit = Math.min(56, (W - 40) / Math.max(k, 1))
  const x0 = 20

  return (
    <SimPanel
      title="Pi-count explorer"
      subtitle="how many Π terms does a variable list need?"
      wide
      controls={
        <>
          <Segmented label="Load a list" value={''} onChange={(id: string) => setIds(SETS.find((s) => s.id === id)?.ids ?? [])} options={SETS.map((s) => ({ value: s.id, label: s.label }))} />
          <Segmented
            label="Basic dimensions"
            value={sys}
            onChange={setSys}
            options={[
              { value: 'MLT', label: 'M L T' },
              { value: 'FLT', label: 'F L T' },
            ]}
          />
          <div>
            <div className="mb-1 text-sm text-ink-2">Variable library (first chosen = dependent)</div>
            <div className="flex flex-wrap gap-1.5">
              {LIB.map((v) => (
                <Chip key={v.id} active={ids.includes(v.id)} tone={ids[0] === v.id ? 'rose' : 'teal'} onClick={() => toggle(v.id)} title={v.name}>
                  <TeX tex={v.tex} />
                </Chip>
              ))}
            </div>
          </div>
        </>
      }
      readout={
        <Readout
          items={[
            { label: '$k$ (variables)', value: k },
            { label: 'dimensions present', value: an?.present.length ?? 0 },
            { label: '$r$ = rank', value: r, tone: an && r < an.present.length ? 'accent' : 'default' },
            { label: '$k-r$ (Π terms)', value: nPi, tone: nPi > 0 ? 'good' : 'bad' },
          ]}
        />
      }
      footer={
        <span>
          <b>Try this:</b> load the pipe list, then add the length <i>l</i> — k rises to 6 but r stays 3, so one more Π (l/D) appears. Load
          “Capillary-like” and switch between M L T and F L T: three dimensions appear in M L T, yet r = 2 in both systems.
        </span>
      }
    >
      <div className="space-y-3">
        <svg viewBox={`0 0 ${W} 110`} className="h-auto w-full" role="img" aria-label="k variables split into r reference dimensions and k minus r pi terms">
          <text x={x0} y={16} className="fill-ink-2 text-[12px]">
            k = {k} variables
          </text>
          {vars.map((v, j) => {
            const isRep = j >= k - r
            return (
              <g key={v.id}>
                <rect
                  x={x0 + j * unit}
                  y={26}
                  width={unit - 4}
                  height={30}
                  rx={6}
                  fill={j === 0 ? 'var(--plot-4)' : 'var(--plot-1)'}
                  fillOpacity={0.25}
                  stroke={j === 0 ? 'var(--plot-4)' : 'var(--plot-1)'}
                />
                <foreignObject x={x0 + j * unit} y={26} width={unit - 4} height={30}>
                  <div className="flex h-full items-center justify-center text-[12px] text-ink">
                    <TeX tex={v.tex} />
                  </div>
                </foreignObject>
                <rect
                  x={x0 + j * unit}
                  y={66}
                  width={unit - 4}
                  height={22}
                  rx={5}
                  fill={isRep ? 'var(--surface-2)' : 'var(--plot-3)'}
                  fillOpacity={isRep ? 1 : 0.35}
                  stroke={isRep ? 'var(--line)' : 'var(--plot-3)'}
                  strokeDasharray={isRep ? '4 3' : undefined}
                />
                <text x={x0 + j * unit + (unit - 4) / 2} y={81} textAnchor="middle" className="fill-ink text-[11px]">
                  {isRep ? 'ref.' : `Π${j + 1}`}
                </text>
              </g>
            )
          })}
          <text x={x0} y={104} className="fill-ink-3 text-[11px]">
            {`${Math.max(nPi, 0)} Π term${nPi === 1 ? '' : 's'} survive; ${r} slot${r === 1 ? '' : 's'} are "used up" by the ${r} reference dimension${r === 1 ? '' : 's'}`}
          </text>
        </svg>
        {an && k ? <MatrixTable vars={vars} rowLabels={DIM_TEX[sys]} A={an.A} rows={[0, 1, 2]} dep={0} /> : <p className="text-sm text-ink-3">Pick some variables.</p>}
        <div className="space-y-1 text-sm">
          {an && lonely.length ? (
            <p className="rounded-lg bg-rose-50 px-3 py-1.5 text-rose-800 dark:bg-rose-500/10 dark:text-rose-200">
              Dimension <TeX tex={lonely.map((i) => DIM_TEX[sys][i]).join(',')} /> appears in only one variable: that variable cannot enter any Π — it is
              irrelevant, or a variable containing that dimension is missing (slide 7).
            </p>
          ) : null}
          {depWarn.map((w) => (
            <p key={w.msg} className="rounded-lg bg-amber-50 px-3 py-1.5 text-amber-900 dark:bg-amber-500/10 dark:text-amber-100">
              {w.msg}
            </p>
          ))}
          {an && r < an.present.length ? (
            <p className={cx('rounded-lg bg-teal-50 px-3 py-1.5 text-teal-900 dark:bg-teal-500/10 dark:text-teal-100')}>
              Rank {r} &lt; {an.present.length} dimensions present: some dimensions only occur in a fixed combination, so r is the
              <b> minimum</b> number of reference dimensions, not simply the count of letters.
            </p>
          ) : null}
        </div>
      </div>
    </SimPanel>
  )
}
