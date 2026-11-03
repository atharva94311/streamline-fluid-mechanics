import { useMemo, useRef, useState } from 'react'
import {
  Md, md, PlayPause, Plot, Readout, Segmented, SimPanel, Slider, useAnimationFrame, useInView, usePrefersReducedMotion,
} from '@/kit'
import { EX94, EX95, homogeneousKE, KE, nuT } from './models'
import { Arrow, Label } from './svg'

type Fluid = 'water' | 'gas'
const FLUIDS: Record<Fluid, { nu: number; rho: number; name: string }> = {
  water: { nu: EX94.nu, rho: EX94.rho, name: 'water (Ex. 9.4)' },
  gas: { nu: EX95.nu, rho: EX95.rho, name: 'gas (Ex. 9.5)' },
}

const sci = (v: number, d = 2) => {
  if (!Number.isFinite(v)) return '—'
  if (v === 0) return '0'
  const e = Math.floor(Math.log10(Math.abs(v)))
  if (e >= -2 && e <= 3) return (+v.toPrecision(d + 1)).toString()
  const m = v / 10 ** e
  return `${m.toFixed(d)}×10${String(e).replace('-', '⁻').replace(/\d/g, (c) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[+c])}`
}

/** Log ruler of kinematic viscosity: molecular ν vs eddy ν_T, with the book's two maxima marked. */
function ViscosityRuler({ nu, nuTv }: { nu: number; nuTv: number }) {
  const lo = -7
  const hi = 1
  const x0 = 30
  const x1 = 590
  const X = (v: number) => x0 + ((Math.log10(Math.min(Math.max(v, 10 ** lo), 10 ** hi)) - lo) / (hi - lo)) * (x1 - x0)
  const ticks = Array.from({ length: hi - lo + 1 }, (_, i) => lo + i)
  return (
    <svg viewBox="0 0 620 126" className="h-auto w-full" role="img" aria-label="Log scale of kinematic viscosities">
      <line x1={x0} x2={x1} y1={64} y2={64} stroke="var(--ink-3)" strokeWidth={1.4} />
      {ticks.map((e) => (
        <g key={e}>
          <line x1={X(10 ** e)} x2={X(10 ** e)} y1={59} y2={69} stroke="var(--ink-3)" />
          <text x={X(10 ** e)} y={84} fontSize={12} textAnchor="middle" className="fill-ink-3">
            {`10${String(e).replace('-', '⁻').replace(/\d/g, (c) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[+c])}`}
          </text>
        </g>
      ))}
      <text x={x0} y={121} fontSize={12} textAnchor="start" className="fill-ink-2">kinematic viscosity (m²/s, log scale)</text>
      {/* book maxima */}
      <circle cx={X(5.9e-3 * 0.3048 * 0.3048)} cy={64} r={4} fill="var(--plot-3)" />
      <Label x={X(5.9e-3 * 0.3048 * 0.3048)} y={102} size={11} cls="fill-[var(--plot-3)]">Ex 9.4 max</Label>
      <circle cx={X(EX95.nuTmax)} cy={64} r={4} fill="var(--plot-6)" />
      <Label x={X(EX95.nuTmax)} y={102} size={11} cls="fill-[var(--plot-6)]" anchor="end">Ex 9.5 max</Label>
      {/* current values */}
      <Arrow x1={X(nu)} y1={20} x2={X(nu)} y2={58} color="var(--plot-4)" width={2} />
      <Label x={X(nu)} y={15} size={12} weight={700} cls="fill-[var(--plot-4)]">ν</Label>
      <Arrow x1={X(nuTv)} y1={20} x2={X(nuTv)} y2={58} color="var(--plot-1)" width={2.4} />
      <Label x={X(nuTv)} y={15} size={12} weight={700} cls="fill-[var(--plot-1)]">νT</Label>
      <line x1={X(nu)} x2={X(nuTv)} y1={40} y2={40} stroke="var(--plot-1)" strokeDasharray="4 3" />
    </svg>
  )
}

/** Animated eddy: radius ~ log of the length scale k^{3/2}/ε, turnover period ~ log of k/ε. */
function EddyGlyph({ ell, tau }: { ell: number; tau: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref)
  const reduced = usePrefersReducedMotion()
  const [playing, setPlaying] = useState(true)
  const [ang, setAng] = useState(0)
  // map ℓ ∈ [1e-5, 10] m → radius 8…62 px; τ ∈ [1e-4, 1e4] s → period 0.6…9 s (both logarithmic)
  const R = 8 + (54 * (Math.log10(Math.min(Math.max(ell, 1e-5), 10)) + 5)) / 6
  const period = 0.6 * 15 ** ((Math.log10(Math.min(Math.max(tau, 1e-4), 1e4)) + 4) / 8)
  useAnimationFrame((dt) => setAng((a) => (a + (2 * Math.PI * Math.min(dt, 0.05)) / period) % (2 * Math.PI)), inView && playing && !reduced)
  const spokes = [0, 1, 2, 3, 4, 5]
  return (
    <div ref={ref} className="flex items-center gap-3">
      <svg viewBox="0 0 140 140" className="h-[130px] w-[130px] shrink-0" role="img" aria-label="Eddy whose size and spin follow the turbulence scales">
        <circle cx={70} cy={70} r={R} fill="color-mix(in srgb, var(--plot-1) 12%, transparent)" stroke="var(--plot-1)" strokeWidth={1.6} />
        {spokes.map((i) => {
          const a = ang + (i * Math.PI) / 3
          const x = 70 + R * 0.78 * Math.cos(a)
          const y = 70 + R * 0.78 * Math.sin(a)
          return <circle key={i} cx={x} cy={y} r={2.6} fill="var(--streamline)" />
        })}
        <path
          d={`M ${70 + R * Math.cos(ang)} ${70 + R * Math.sin(ang)} A ${R} ${R} 0 0 1 ${70 + R * Math.cos(ang + 1.2)} ${70 + R * Math.sin(ang + 1.2)}`}
          fill="none"
          stroke="var(--plot-1)"
          strokeWidth={3}
        />
      </svg>
      <div className="space-y-1 text-sm text-ink-2">
        <div>
          size <Md inline>{md`$\ell \sim k^{3/2}/\varepsilon$`}</Md> = <b className="font-mono text-ink">{sci(ell)} m</b>
        </div>
        <div>
          turnover <Md inline>{md`$k/\varepsilon$`}</Md> = <b className="font-mono text-ink">{sci(tau)} s</b>
        </div>
        <div className="text-xs text-ink-3">(drawn on log scales: bigger = larger eddy, slower spin = longer turnover)</div>
        <PlayPause playing={playing} onToggle={() => setPlaying((p) => !p)} />
      </div>
    </div>
  )
}

/** k–ε calculator: ν_T = C_μ k²/ε (9.91) and the turbulence scales built from k and ε. */
export function KEpsCalculator() {
  const [k, setK] = useState(0.05)
  const [eps, setEps] = useState(0.5)
  const [fluid, setFluid] = useState<Fluid>('water')
  const F = FLUIDS[fluid]
  const nT = nuT(k, eps)
  const ell = k ** 1.5 / eps
  const tau = k / eps
  return (
    <SimPanel
      title="k–ε calculator"
      subtitle="Eq. (9.91) with C_μ = 0.09 (9.94)"
      wide
      controls={
        <>
          <Slider label="turbulent kinetic energy $k$" value={k} min={1e-4} max={10} log onChange={setK} unit="m²/s²" format={(v) => sci(v)} />
          <Slider label="dissipation rate $\varepsilon$" value={eps} min={1e-4} max={1e3} log onChange={setEps} unit="m²/s³" format={(v) => sci(v)} />
          <Segmented
            label="fluid"
            value={fluid}
            onChange={setFluid}
            options={[
              { value: 'water', label: 'water' },
              { value: 'gas', label: 'gas, Ex 9.5' },
            ]}
          />
          <div className="flex flex-wrap gap-2 text-xs">
            <button type="button" className="btn-ghost" onClick={() => { setFluid('water'); setK(0.1); setEps((0.09 * 0.01) / (5.9e-3 * 0.3048 * 0.3048)) }}>
              preset: ν_T ≈ Ex 9.4 max
            </button>
            <button type="button" className="btn-ghost" onClick={() => { setFluid('gas'); setK(10); setEps((0.09 * 100) / EX95.nuTmax) }}>
              preset: ν_T ≈ Ex 9.5 max
            </button>
          </div>
        </>
      }
      readout={
        <Readout
          items={[
            { label: '$\\nu_T = C_\\mu k^2/\\varepsilon$', value: sci(nT), unit: 'm²/s', tone: 'accent' },
            { label: '$\\nu_T/\\nu$', value: sci(nT / F.nu, 3), tone: nT / F.nu > 1 ? 'good' : 'bad' },
            { label: '$\\mu_T=\\rho\\nu_T$', value: sci(F.rho * nT), unit: 'Pa·s' },
            { label: 'velocity scale $\\sqrt{k}$', value: sci(Math.sqrt(k)), unit: 'm/s' },
            { label: 'length $k^{3/2}/\\varepsilon$', value: sci(ell), unit: 'm' },
            { label: 'time $k/\\varepsilon$', value: sci(tau), unit: 's' },
          ]}
        />
      }
      footer={
        <Md inline>{md`Try this: double $k$ at fixed $\varepsilon$ — $\nu_T$ grows 4× (it goes as $k^2$). Double $\varepsilon$ instead — $\nu_T$ halves. Then press the two presets: both book examples have $\nu_T\gg\nu$, so molecular viscosity is irrelevant away from walls. Fluid ${F.name}: $\nu$ = ${sci(F.nu)} m²/s.`}</Md>
      }
    >
      <div className="space-y-3">
        <ViscosityRuler nu={F.nu} nuTv={nT} />
        <EddyGlyph ell={ell} tau={tau} />
      </div>
    </SimPanel>
  )
}

type Mode = 'decay' | 'shear'

/** 0-D (homogeneous) k–ε: decaying turbulence and homogeneous shear (supplementary reduction of 9.92–9.93). */
export function HomogeneousKELab() {
  const [mode, setMode] = useState<Mode>('decay')
  const [Ce2, setCe2] = useState<number>(KE.Ce2)
  const [S, setS] = useState(3)
  const tEnd = mode === 'decay' ? 100 : 30
  const data = useMemo(() => homogeneousKE(mode === 'decay' ? 0 : S, Ce2, tEnd, 360), [mode, S, Ce2, tEnd])
  const n = 1 / (Ce2 - 1)
  const yDom: [number, number] = mode === 'decay' ? [1e-5, 30] : [1e-4, 1e6]
  const inDom = (v: number) => v >= yDom[0] && v <= yDom[1]
  const kPts = data.filter((d) => d.t > 0 && inDom(d.k)).map((d) => [d.t, d.k] as [number, number])
  const ePts = data.filter((d) => d.t > 0 && inDom(d.e)).map((d) => [d.t, d.e] as [number, number])
  const nPts = data.filter((d) => d.t > 0 && inDom((d.k * d.k) / d.e)).map((d) => [d.t, (d.k * d.k) / d.e] as [number, number])
  const last = data[data.length - 1]
  const Pk = (KE.Cmu * S * S * last.k * last.k) / last.e
  const at10 = data.reduce((best, d) => (Math.abs(d.t - 10) < Math.abs(best.t - 10) ? d : best), data[0])
  return (
    <SimPanel
      title="Homogeneous k–ε lab"
      subtitle="(9.92)–(9.93) with convection and diffusion switched off"
      wide
      controls={
        <>
          <Segmented
            label="case"
            value={mode}
            onChange={setMode}
            options={[
              { value: 'decay', label: 'decaying (no shear)' },
              { value: 'shear', label: 'uniform shear' },
            ]}
          />
          <Slider label="$C_{\varepsilon 2}$" value={Ce2} min={1.3} max={2.3} step={0.01} onChange={setCe2} digits={3} />
          {mode === 'shear' ? <Slider label="shear $\hat S = S k_0/\varepsilon_0$" value={S} min={0.5} max={10} step={0.1} onChange={setS} digits={2} /> : null}
          <button type="button" className="btn-ghost text-sm" onClick={() => setCe2(KE.Ce2)}>reset C_ε2 = 1.92</button>
        </>
      }
      readout={
        mode === 'decay' ? (
          <Readout
            items={[
              { label: 'decay exponent $n=1/(C_{\\varepsilon2}-1)$', value: n, digits: 3, tone: 'accent' },
              { label: '$k/k_0$ at $\\hat t=10$', value: sci(at10.k) },
              { label: '$\\varepsilon/\\varepsilon_0$ at $\\hat t=10$', value: sci(at10.e) },
              { label: '$\\nu_T/\\nu_{T0}$ at $\\hat t=10$', value: sci((at10.k * at10.k) / at10.e) },
            ]}
          />
        ) : (
          <Readout
            items={[
              { label: '$P_k/\\varepsilon$ at end', value: Pk / last.e, digits: 3, tone: 'accent' },
              { label: 'theory $\\frac{C_{\\varepsilon2}-1}{C_{\\varepsilon1}-1}$', value: (Ce2 - 1) / (KE.Ce1 - 1), digits: 3, tone: 'good' },
              { label: '$k/k_0$ at end', value: sci(last.k) },
              { label: '$\\nu_T/\\nu_{T0}$ at end', value: sci((last.k * last.k) / last.e) },
            ]}
          />
        )
      }
      footer={
        mode === 'decay'
          ? 'Try this: watch the νT/νT0 curve — while k and ε collapse by orders of magnitude, k²/ε barely changes. Raise Cε2 and the decay becomes slower (n = 1/(Cε2 − 1) falls).'
          : 'Try this: with the standard constants, production wins and k, ε and νT grow without bound, yet the ratio P/ε locks onto (Cε2 − 1)/(Cε1 − 1) ≈ 2.09 whatever shear you pick — a built-in property of the constants (9.94). Now lower Cε2 below Cε1 = 1.44: the locked ratio drops below 1, dissipation beats production and the turbulence dies even under steady shear.'
      }
    >
      <Plot
        height={300}
        x={{ label: 'dimensionless time $\\hat t = t\\,\\varepsilon_0/k_0$ (log)', domain: [1e-2, tEnd], log: true }}
        y={{ label: 'value / initial value (log)', domain: yDom, log: true }}
        series={[
          { label: '$k/k_0$', points: kPts, color: 'var(--plot-1)', width: 2.4 },
          { label: '$\\varepsilon/\\varepsilon_0$', points: ePts, color: 'var(--plot-4)', width: 2.4 },
          { label: '$\\nu_T/\\nu_{T0}$', points: nPts, color: 'var(--plot-2)', width: 2.4 },
          ...(mode === 'decay'
            ? [{ label: 'exact $k/k_0$', fn: (t: number) => (1 + (Ce2 - 1) * t) ** -n, color: 'var(--ink-3)', dash: '3 4', width: 1.4 }]
            : []),
        ]}
      />
    </SimPanel>
  )
}
