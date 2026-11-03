/**
 * Exponent tuner for the Lecture 13 pipe example: Π = q · D^a V^b ρ^c with q = Δp_ℓ or μ.
 * Stacked "exponent bars" show each factor's contribution to the net exponent of every basic dimension;
 * the combination is dimensionless when all three net bars are zero.
 */
import { useState } from 'react'
import { Readout, Segmented, SimPanel, Slider, Toggle } from '@/kit'
import { DIM_LETTERS, DIM_TEX, V, dimsOf, exponentEqTeX, type DimVar, type Sys } from './dimlib'
import { TeX, TeXLabel } from './svg'

const FACTOR_COLORS = ['var(--plot-4)', 'var(--plot-1)', 'var(--plot-2)', 'var(--plot-3)']

/** Stacked exponent bars for a product Π vars[j]^exps[j]. */
export function ExponentBars({ vars, exps, sys, height = 230 }: { vars: DimVar[]; exps: number[]; sys: Sys; height?: number }) {
  const W = 520
  const H = height
  const top = 18
  const bottom = H - 44
  const zeroY = (top + bottom) / 2
  const span = 8 // exponents shown from −8 to +8
  const sc = (bottom - top) / (2 * span)
  const colW = 90
  const gap = (W - 60 - 3 * colW) / 2
  const nets = [0, 1, 2].map((i) => vars.reduce((s, v, j) => s + exps[j] * dimsOf(v, sys)[i], 0))
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="exponent contributions per basic dimension">
      {[-8, -4, 0, 4, 8].map((t) => (
        <g key={t}>
          <line x1={50} x2={W - 6} y1={zeroY - t * sc} y2={zeroY - t * sc} stroke="var(--line)" strokeWidth={t === 0 ? 1.5 : 0.7} strokeDasharray={t === 0 ? undefined : '3 4'} />
          <text x={44} y={zeroY - t * sc + 4} textAnchor="end" className="fill-ink-3 text-[10px]">
            {t > 0 ? `+${t}` : t}
          </text>
        </g>
      ))}
      <text x={12} y={zeroY} transform={`rotate(-90 12 ${zeroY})`} textAnchor="middle" className="fill-ink-3 text-[10px]">
        exponent
      </text>
      {[0, 1, 2].map((i) => {
        const cx0 = 60 + i * (colW + gap)
        let up = 0
        let dn = 0
        const segs = vars.map((v, j) => {
          const c = exps[j] * dimsOf(v, sys)[i]
          if (c === 0) return null
          const clampC = Math.max(-span, Math.min(span, c))
          let y: number
          let hgt: number
          if (c > 0) {
            y = zeroY - (up + clampC) * sc
            hgt = clampC * sc
            up += clampC
          } else {
            y = zeroY + dn * sc
            hgt = -clampC * sc
            dn += -clampC
          }
          return (
            <rect key={j} x={cx0} y={y} width={colW * 0.55} height={Math.max(hgt, 0)} fill={FACTOR_COLORS[j % 4]} fillOpacity={0.75} stroke="var(--surface)" strokeWidth={1} />
          )
        })
        const net = nets[i]
        const ok = Math.abs(net) < 1e-9
        const ny = zeroY - Math.max(-span, Math.min(span, net)) * sc
        return (
          <g key={i}>
            {segs}
            <line x1={cx0 + colW * 0.6} x2={cx0 + colW * 0.95} y1={ny} y2={ny} stroke={ok ? 'var(--plot-3)' : 'var(--plot-4)'} strokeWidth={3} />
            <text x={cx0 + colW * 0.78} y={ny - 5} textAnchor="middle" className="fill-ink text-[10px] font-semibold">
              net {net > 0 ? `+${net}` : net}
            </text>
            <TeXLabel x={cx0 + colW * 0.4} y={H - 30} tex={`${DIM_TEX[sys][i]}\\ ${ok ? '\\checkmark' : '\\times'}`} anchor="middle" w={80} />
          </g>
        )
      })}
      {vars.map((v, j) => (
        <g key={j}>
          <rect x={60 + j * 110} y={H - 14} width={10} height={10} fill={FACTOR_COLORS[j % 4]} fillOpacity={0.75} />
          <TeXLabel x={74 + j * 110} y={H - 9} tex={`${v.tex}^{${exps[j]}}`} w={90} h={16} />
        </g>
      ))}
    </svg>
  )
}

export function ExponentTuner() {
  const [which, setWhich] = useState<'dpl' | 'mu'>('dpl')
  const [sys, setSys] = useState<Sys>('FLT')
  const [a, setA] = useState(0)
  const [b, setB] = useState(0)
  const [c, setC] = useState(0)
  const [showEq, setShowEq] = useState(true)
  const q = which === 'dpl' ? V.dpl : V.mu
  const vars = [q, V.D, V.V, V.rho]
  const exps = [1, a, b, c]
  const nets = [0, 1, 2].map((i) => vars.reduce((s, v, j) => s + exps[j] * dimsOf(v, sys)[i], 0))
  const solved = nets.every((n) => n === 0)
  const eqs = [0, 1, 2]
    .map((i) => ({ i, tex: exponentEqTeX(dimsOf(q, sys)[i], [V.D, V.V, V.rho].map((v) => dimsOf(v, sys)[i])) }))
    .filter((x) => x.tex)
  return (
    <SimPanel
      title="Exponent tuner — pipe example"
      subtitle="make the product dimensionless by hand"
      controls={
        <>
          <Segmented
            label="Non-repeating variable"
            value={which}
            onChange={(v) => {
              setWhich(v)
              setA(0)
              setB(0)
              setC(0)
            }}
            options={[
              { value: 'dpl', label: '$\\Delta p_\\ell$ (→ Π₁)' },
              { value: 'mu', label: '$\\mu$ (→ Π₂)' },
            ]}
          />
          <Segmented label="System" value={sys} onChange={setSys} options={[{ value: 'FLT', label: 'F L T' }, { value: 'MLT', label: 'M L T' }]} />
          <Slider label="exponent $a$ of $D$" value={a} min={-3} max={3} step={1} onChange={(v) => setA(Math.round(v))} digits={1} />
          <Slider label="exponent $b$ of $V$" value={b} min={-3} max={3} step={1} onChange={(v) => setB(Math.round(v))} digits={1} />
          <Slider label="exponent $c$ of $\rho$" value={c} min={-3} max={3} step={1} onChange={(v) => setC(Math.round(v))} digits={1} />
          <Toggle label="show exponent equations" checked={showEq} onChange={setShowEq} />
        </>
      }
      readout={
        <Readout
          cols={3}
          items={[
            ...[0, 1, 2].map((i) => ({ label: `net ${DIM_LETTERS[sys][i]}`, value: nets[i], tone: (nets[i] === 0 ? 'good' : 'bad') as 'good' | 'bad' })),
          ]}
        />
      }
      footer={
        <span>
          <b>Try this:</b> solve the F (or M) equation first — of D, V, ρ only ρ carries force/mass, so c = −1 is forced. Then fix T with b, and
          finally L with a. Switch to M L T once solved: the same exponents still give zero (the check of slide 16).
        </span>
      }
    >
      <div className="space-y-2">
        <TeX display tex={`\\Pi = {${q.tex}}\\,D^{${a}}\\,V^{${b}}\\,\\rho^{${c}}`} />
        <ExponentBars vars={vars} exps={exps} sys={sys} />
        {showEq ? (
          <div className="grid gap-1 text-sm sm:grid-cols-3">
            {eqs.map(({ i, tex }) => {
              const lhs = nets[i]
              return (
                <div key={i} className={lhs === 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-ink-2'}>
                  <TeX tex={`${tex}\\ (${DIM_TEX[sys][i]})`} />
                </div>
              )
            })}
          </div>
        ) : null}
        <p
          className={
            solved
              ? 'rounded-lg bg-emerald-50 px-3 py-1.5 text-sm text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200'
              : 'rounded-lg bg-surface-2 px-3 py-1.5 text-sm text-ink-3'
          }
        >
          {solved ? (
            <>
              Dimensionless!{' '}
              <TeX tex={which === 'dpl' ? '\\Pi_1 = \\dfrac{\\Delta p_\\ell D}{\\rho V^2}' : '\\Pi_2 = \\dfrac{\\mu}{D V \\rho}'} /> — exactly the
              lecture result (a, b, c) = ({a}, {b}, {c}).
            </>
          ) : (
            'Not yet dimensionless: every net bar must sit on the zero line.'
          )}
        </p>
      </div>
    </SimPanel>
  )
}
