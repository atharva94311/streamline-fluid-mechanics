/**
 * Concept "common-groups": dimensionless-number dashboard. Fluid preset + V, L, Δp, f sliders →
 * live Re, Fr, Eu, cavitation number, We, Ma, Cauchy and St with interpretation badges, plus a diverging
 * log-scale bar chart of the force ratios "inertia ÷ other force" (Fox p. 255–257, Lec 13 slide 21).
 */
import { useState } from 'react'
import { Md, Segmented, SimPanel, Slider, md } from '@/kit'
import { FLUIDS, MAIN_FONT, P_ATM, groups, sci, type FluidKey } from './data'

type Tone = 'good' | 'warn' | 'bad' | 'info'

const TONE_CLS: Record<Tone, string> = {
  good: 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200',
  warn: 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200',
  bad: 'border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200',
  info: 'border-sky-300 bg-sky-50 text-sky-800 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-200',
}

interface Row {
  name: string
  value: number | null
  badge: string
  tone: Tone
}

/** Diverging log bar: centre = 1 (forces balance); right = inertia dominates. */
function RatioBars({ bars }: { bars: { label: string; sub: string; value: number | null; color: string }[] }) {
  const W = 460
  const left = 118
  const right = W - 12
  const mid = (left + right) / 2
  const DEC = 10 // ± decades shown
  const sx = (v: number) => {
    const e = Math.max(-DEC, Math.min(DEC, Math.log10(v)))
    return mid + (e / DEC) * (right - mid)
  }
  const rowH = 34
  const H = 30 + bars.length * rowH + 30
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Force ratios to inertia on a logarithmic scale">
      <text x={left} y={14} fontFamily={MAIN_FONT} fontSize={11} fill="var(--ink-3)">◀ other force dominates</text>
      <text x={right} y={14} textAnchor="end" fontFamily={MAIN_FONT} fontSize={11} fill="var(--ink-3)">inertia dominates ▶</text>
      {[-10, -5, 0, 5, 10].map((e) => (
        <g key={e}>
          <line x1={sx(10 ** e)} y1={22} x2={sx(10 ** e)} y2={H - 26} stroke="var(--line)" strokeDasharray={e === 0 ? undefined : '3 3'} strokeWidth={e === 0 ? 1.6 : 1} />
          <text x={sx(10 ** e)} y={H - 10} textAnchor="middle" fontFamily={MAIN_FONT} fontSize={11} fill="var(--ink-3)">
            {e === 0 ? '1' : `10${e < 0 ? '⁻' : ''}${e === 5 || e === -5 ? '⁵' : '¹⁰'}`}
          </text>
        </g>
      ))}
      {bars.map((b, i) => {
        const y = 30 + i * rowH
        const has = b.value != null && Number.isFinite(b.value) && b.value > 0
        const x = has ? sx(b.value as number) : mid
        return (
          <g key={b.label}>
            <text x={4} y={y + 13} fontFamily={MAIN_FONT} fontSize={12.5} fill="var(--ink)">{b.label}</text>
            <text x={4} y={y + 26} fontFamily={MAIN_FONT} fontSize={10} fill="var(--ink-3)">{b.sub}</text>
            {has ? (
              <>
                <rect x={Math.min(x, mid)} y={y + 4} width={Math.max(1.5, Math.abs(x - mid))} height={18} rx={3} fill={b.color} opacity={0.85} />
                <text
                  x={x > mid ? Math.min(x + 4, right - 2) : Math.max(x - 4, left + 2)}
                  y={y + 17}
                  textAnchor={x > mid ? (x + 60 > right ? 'end' : 'start') : x - 60 < left ? 'start' : 'end'}
                  fontFamily={MAIN_FONT}
                  fontSize={11}
                  fill="var(--ink)"
                >
                  {sci(b.value as number)}
                </text>
              </>
            ) : (
              <text x={mid + 6} y={y + 17} fontFamily={MAIN_FONT} fontSize={11} fill="var(--ink-3)">n/a for this fluid</text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

export function GroupDashboard() {
  const [fk, setFk] = useState<FluidKey>('water')
  const [V, setV] = useState(1.5)
  const [L, setL] = useState(0.05)
  const [dp, setDp] = useState(1000)
  const [freq, setFreq] = useState(5)
  const f = FLUIDS[fk]
  const g = groups(f, V, L, dp, freq)

  const rows: Row[] = [
    {
      name: md`Reynolds $\Rey = \rho VL/\mu$`,
      value: g.Re,
      badge:
        g.Re < 1
          ? 'viscous forces dominate (creeping flow)'
          : g.Re < 2300
            ? 'viscous and inertia both matter; a pipe with L = D would be laminar'
            : 'inertia dominates; a pipe with L = D would be turbulent',
      tone: g.Re < 2300 ? 'good' : 'warn',
    },
    {
      name: md`Froude $\Fr = V/\sqrt{gL}$`,
      value: g.Fr,
      badge: g.Fr < 1 ? 'open channel (L = depth): subcritical' : 'open channel (L = depth): supercritical',
      tone: g.Fr < 1 ? 'info' : 'warn',
    },
    {
      name: md`Euler $\Eu = \Delta p/(\tfrac12\rho V^2)$`,
      value: g.Eu,
      badge: g.Eu > 1 ? 'Δp exceeds the dynamic pressure' : 'Δp smaller than the dynamic pressure',
      tone: 'info',
    },
    {
      name: md`cavitation $(p-p_v)/(\tfrac12\rho V^2)$`,
      value: g.Cav,
      badge:
        g.Cav == null
          ? 'gas: no vapour pressure, no cavitation'
          : g.Cav < 1
            ? 'small: cavitation likely wherever the local Cp ≤ −Ca'
            : 'larger value: cavitation less likely',
      tone: g.Cav == null ? 'info' : g.Cav < 1 ? 'bad' : 'good',
    },
    {
      name: md`Weber $\We = \rho V^2L/\sigma$`,
      value: g.We,
      badge: g.We == null ? 'gas alone has no free surface' : g.We < 1 ? 'surface tension dominates' : 'inertia beats surface tension',
      tone: g.We == null ? 'info' : g.We < 1 ? 'good' : 'warn',
    },
    {
      name: md`Mach $\Ma = V/c$`,
      value: g.Ma,
      badge: g.Ma < 0.3 ? 'below 0.3: essentially incompressible' : g.Ma < 1 ? 'compressible, subsonic' : 'supersonic',
      tone: g.Ma < 0.3 ? 'good' : g.Ma < 1 ? 'warn' : 'bad',
    },
    {
      name: md`Strouhal $\St = \omega L/V$`,
      value: g.St,
      badge: 'unsteady: local vs convective inertia',
      tone: 'info',
    },
  ]

  const bars = [
    { label: 'Re', sub: 'inertia / viscous', value: g.Re, color: 'var(--plot-2)' },
    { label: 'Fr²', sub: 'inertia / gravity', value: g.Fr * g.Fr, color: 'var(--plot-4)' },
    { label: 'We', sub: 'inertia / surf. tension', value: g.We, color: 'var(--plot-5)' },
    { label: 'Ma² (= Cauchy)', sub: 'inertia / compressibility', value: g.Cauchy, color: 'var(--plot-6)' },
    { label: 'ρV²/Δp', sub: 'inertia / pressure', value: 2 / g.Eu, color: 'var(--plot-3)' },
  ]

  return (
    <SimPanel
      title="Dimensionless-number dashboard"
      subtitle="all seven groups for one flow, at a glance"
      wide
      controls={
        <>
          <Segmented
            label="Fluid (typical values)"
            value={fk}
            onChange={setFk}
            options={(Object.keys(FLUIDS) as FluidKey[]).map((k) => ({ value: k, label: FLUIDS[k].label }))}
          />
          <Slider label="speed $V$" value={V} min={1e-3} max={1e3} log onChange={setV} unit="m/s" />
          <Slider label="length $L$" value={L} min={1e-5} max={1e3} log onChange={setL} unit="m" />
          <Slider label="pressure difference $\Delta p$" value={dp} min={1} max={1e7} log onChange={setDp} unit="Pa" />
          <Slider label="frequency $\omega$" value={freq} min={0.01} max={1e4} log onChange={setFreq} unit="1/s" />
          <p className="text-xs text-ink-3">
            {f.long}: ρ = {sci(f.rho)} kg/m³, μ = {sci(f.mu)} Pa·s, c = {sci(f.c)} m/s
            {f.sigma != null ? `, σ = ${sci(f.sigma)} N/m` : ''}. Cavitation number uses p = {sci(P_ATM)} Pa.
          </p>
        </>
      }
      footer={
        <Md>{md`**Try this:** pick water, $L = 5$ cm and raise $V$ from 0.01 to 100 m/s. Re and We climb steeply (∝ $V$ and $V^2$), the cavitation number collapses below 1, yet Ma stays far below 0.3 — liquids almost never need compressibility. Then switch to air at 150 m/s and watch Ma cross 0.3.`}</Md>
      }
    >
      <div className="space-y-4">
        <RatioBars bars={bars} />
        <div className="grid gap-2 sm:grid-cols-2">
          {rows.map((r) => (
            <div key={r.name} className="rounded-xl border border-line bg-surface px-3 py-2">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-xs text-ink-3"><Md inline>{r.name}</Md></span>
                <span className="font-mono text-base font-semibold text-ink">{r.value == null ? '—' : sci(r.value)}</span>
              </div>
              <div className={`mt-1 inline-block rounded-md border px-2 py-0.5 text-xs ${TONE_CLS[r.tone]}`}>{r.badge}</div>
            </div>
          ))}
        </div>
        <p className="text-xs text-ink-3">
          Thresholds: Fr = 1 (Fox p. 256) and Ma ≈ 0.3 (Fox p. 245) are from the book; the pipe value Re ≈ 2300 and the
          We ≈ 1 / Ca ≈ 1 badges are rough supplementary guides. Use L = pipe diameter for Re of a pipe, L = depth for Fr of a channel.
        </p>
      </div>
    </SimPanel>
  )
}
