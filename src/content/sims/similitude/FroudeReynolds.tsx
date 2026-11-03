/**
 * Froude–Reynolds conflict calculator for free-surface (ship) models (Fox p.260):
 * Fr matching fixes V_m/V_p = (L_m/L_p)^½; Re matching then needs ν_m/ν_p = (L_m/L_p)^{3/2}.
 */
import { useState } from 'react'
import { Md, Readout, Segmented, SimPanel, Slider, md, num } from '@/kit'
import { NU_LADDER } from './data'
import { Sub, Tx, sci } from './svg'

type Crit = 'Fr' | 'Re' | 'both'
const NU_P = 1.0e-6 // water (supplementary round value)
const G = 9.81

export function FroudeReynolds() {
  const [Lp, setLp] = useState(120)
  const [Vp, setVp] = useState(10)
  const [n, setN] = useState(80)
  const [crit, setCrit] = useState<Crit>('Fr')

  const lam = 1 / n
  const Lm = Lp * lam
  const VmFr = Vp * Math.sqrt(lam)
  const VmRe = Vp / lam
  const Vm = crit === 'Re' ? VmRe : VmFr
  const FrP = Vp / Math.sqrt(G * Lp)
  const FrRatio = Vm / Math.sqrt(G * Lm) / FrP
  const ReRatio = (Vm * Lm) / (Vp * Lp) // same fluid
  const nuReq = NU_P * lam ** 1.5
  const mercury = NU_LADDER.find((f) => f.name === 'mercury')!.nu

  // ν ladder geometry (log10 from −10 to −2)
  const nx = (nu: number) => 20 + ((Math.log10(num.clamp(nu, 1e-10, 1e-2)) + 10) / 8) * 460
  // speed bars (log10 from −1 to 4)
  const vx = (v: number) => 110 + ((Math.log10(num.clamp(v, 0.1, 1e4)) + 1) / 5) * 370

  const speedRows: { label: string; v: number; color: string; on: boolean }[] = [
    { label: 'prototype', v: Vp, color: 'var(--plot-7)', on: true },
    { label: 'model, Fr match', v: VmFr, color: 'var(--plot-2)', on: crit !== 'Re' },
    { label: 'model, Re match', v: VmRe, color: 'var(--plot-4)', on: crit !== 'Fr' },
  ]

  return (
    <SimPanel
      title="Froude vs Reynolds: can one model satisfy both?"
      subtitle="free-surface ship model in water"
      src={{ doc: 'fox', pages: '260' }}
      wide
      controls={
        <>
          <Segmented
            label="Match"
            options={[
              { value: 'Fr', label: 'Fr only' },
              { value: 'Re', label: 'Re only' },
              { value: 'both', label: 'Fr and Re' },
            ]}
            value={crit}
            onChange={setCrit}
          />
          <Slider label="Prototype length $L_p$" value={Lp} min={10} max={300} step={1} onChange={setLp} unit="m" digits={3} />
          <Slider label="Prototype speed $V_p$" value={Vp} min={1} max={20} step={0.1} onChange={setVp} unit="m/s" />
          <Slider label="Scale $L_p/L_m$ (model is 1 : n)" value={n} min={5} max={500} log onChange={setN} format={(v) => `1 : ${Math.round(v)}`} />
        </>
      }
      readout={
        <Readout
          items={[
            { label: '$L_m$', value: Lm, unit: 'm' },
            { label: '$Fr_p$', value: FrP, digits: 3 },
            { label: 'test speed $V_m$', value: Vm, unit: 'm/s', tone: crit === 'Re' && Vm > 50 ? 'bad' : 'accent' },
            { label: '$Fr_m/Fr_p$', value: FrRatio, digits: 3, tone: Math.abs(FrRatio - 1) < 0.01 ? 'good' : 'bad' },
            { label: '$Re_m/Re_p$ (water)', value: sci(ReRatio), tone: Math.abs(ReRatio - 1) < 0.01 ? 'good' : 'bad' },
            { label: md`needed $\nu_m$ for both`, value: sci(nuReq), unit: 'm²/s', tone: nuReq < mercury ? 'bad' : 'good' },
          ]}
        />
      }
      footer={
        <Md>{md`**Try this:** with "Fr and Re" selected, slide the scale from 1 : 5 to 1 : 500. The required model-fluid viscosity $\nu_m = \nu_p (L_m/L_p)^{3/2}$ falls far below mercury (the only liquid with $\nu$ below water's) for any realistic ship scale — at 1 : 100 it is $10^{-3}\nu_p$. Then pick "Re only" and see the absurd towing speed instead.`}</Md>
      }
    >
      <svg viewBox="0 0 500 300" className="h-auto w-full" role="img" aria-label="Speed bars and kinematic-viscosity ladder">
        <Tx x={8} y={18} size={13} weight={700}>
          Speeds (log scale, m/s)
        </Tx>
        {[0.1, 1, 10, 100, 1000, 10000].map((v) => (
          <g key={v}>
            <line x1={vx(v)} y1={26} x2={vx(v)} y2={124} stroke="var(--grid)" />
            <Tx x={vx(v)} y={138} size={10} anchor="middle" cls="fill-ink-3">
              {String(v)}
            </Tx>
          </g>
        ))}
        {speedRows.map((r, i) => (
          <g key={r.label} opacity={r.on ? 1 : 0.25}>
            <Tx x={8} y={48 + i * 30} size={12} cls="fill-ink-2">
              {r.label}
            </Tx>
            <rect x={vx(0.1)} y={36 + i * 30} width={Math.max(2, vx(r.v) - vx(0.1))} height={16} rx={4} fill={r.color} fillOpacity={0.75} />
            <Tx x={vx(r.v) + 4} y={49 + i * 30} size={11} cls="fill-ink" halo>
              {r.v.toPrecision(3)}
            </Tx>
          </g>
        ))}
        <Tx x={8} y={170} size={13} weight={700}>
          Kinematic viscosity ν (log scale, m²/s)
        </Tx>
        <line x1={20} y1={220} x2={480} y2={220} stroke="var(--axis)" />
        {[-10, -8, -6, -4, -2].map((e) => (
          <g key={e}>
            <line x1={nx(10 ** e)} y1={215} x2={nx(10 ** e)} y2={225} stroke="var(--axis)" />
            <Tx x={nx(10 ** e)} y={240} size={10} anchor="middle" cls="fill-ink-3">
              {`10${{ '-10': '⁻¹⁰', '-8': '⁻⁸', '-6': '⁻⁶', '-4': '⁻⁴', '-2': '⁻²' }[String(e)]}`}
            </Tx>
          </g>
        ))}
        <rect x={nx(mercury)} y={206} width={nx(1e-2) - nx(mercury)} height={28} fill="var(--plot-5)" fillOpacity={0.12} />
        <Tx x={nx(1e-4)} y={262} size={10} anchor="middle" cls="fill-emerald-700 dark:fill-emerald-300">
          real fluids live here
        </Tx>
        {NU_LADDER.map((f, i) => (
          <g key={f.name}>
            <circle cx={nx(f.nu)} cy={220} r={4} fill="var(--plot-5)" />
            <Tx x={nx(f.nu)} y={i % 2 ? 204 : 196} size={10} anchor="middle" cls="fill-ink-2">
              {f.name}
            </Tx>
          </g>
        ))}
        <g opacity={crit === 'both' ? 1 : 0.35}>
          <line x1={nx(nuReq)} y1={200} x2={nx(nuReq)} y2={240} stroke="var(--plot-4)" strokeWidth={2.5} />
          <Tx x={nx(nuReq)} y={282} size={12} anchor="middle" weight={700} cls="fill-rose-600 dark:fill-rose-400" halo>
            needed ν
            <Sub>m</Sub> = {sci(nuReq)}
          </Tx>
        </g>
      </svg>
    </SimPanel>
  )
}
