/**
 * Interactive: is the Bernoulli constant the same on different streamlines?
 * Forced vortex (V = Ωr, rotational) vs free vortex (V = K/r, irrotational), water, horizontal plane.
 * The "true" pressure comes from the radial component of Euler's equation, dp/dr = ρV²/r (circular streamlines);
 * the "Bernoulli across streamlines" prediction assumes one constant: p₂ − p₁ = ½ρ(V₁² − V₂²).
 */
import { useRef, useState } from 'react'
import {
  Md, PlayPause, Plot, Readout, Segmented, SimPanel, Slider, md, num, useAnimationFrame, useElementSize, useInView, usePrefersReducedMotion,
} from '@/kit'
import { Label, RHO_WATER, rampCss } from './shared'

type Mode = 'forced' | 'free'
const R_REF = 0.5
const R_CORE = 0.15
const RINGS = [0.3, 0.5, 0.7, 0.9]
const PER = 6

export function vortexModel(mode: Mode, Vref: number) {
  const Om = Vref / R_REF
  const K = Vref * R_REF
  const V = (r: number) => (mode === 'forced' ? Om * r : K / r)
  /** True p(r) − p(rA) from dp/dr = ρV²/r. */
  const dpTrue = (rA: number, r: number) =>
    mode === 'forced' ? 0.5 * RHO_WATER * Om * Om * (r * r - rA * rA) : 0.5 * RHO_WATER * K * K * (1 / (rA * rA) - 1 / (r * r))
  /** Bernoulli with one constant for all streamlines (valid only if irrotational). */
  const dpBern = (rA: number, r: number) => 0.5 * RHO_WATER * (V(rA) ** 2 - V(r) ** 2)
  const vort = mode === 'forced' ? 2 * Om : 0
  return { Om, K, V, dpTrue, dpBern, vort }
}

export function VortexCompare() {
  const [mode, setMode] = useState<Mode>('forced')
  const [Vref, setVref] = useState(2)
  const [r1, setR1] = useState(0.3)
  const [r2, setR2] = useState(0.8)
  const [playing, setPlaying] = useState(true)
  const [wrapRef, size] = useElementSize<HTMLDivElement>()
  const boxRef = useRef<HTMLDivElement>(null)
  const inView = useInView(boxRef)
  const reduced = usePrefersReducedMotion()

  const m = vortexModel(mode, Vref)
  const S = Math.max(240, Math.min(340, size.width || 340))
  const c = S / 2
  const k = (S / 2 - 10) / 1 // px per metre (domain radius 1 m)

  // animation: angular positions of the crosses
  const phases = useRef<number[]>(RINGS.flatMap((_, i) => Array.from({ length: PER }, (_, j) => (2 * Math.PI * j) / PER + i * 0.4)))
  const crossEls = useRef<(SVGGElement | null)[]>([])
  const tf = (i: number) => {
    const r = RINGS[Math.floor(i / PER)]
    const ph = phases.current[i]
    const x = c + r * k * Math.cos(ph)
    const y = c - r * k * Math.sin(ph)
    const deg = mode === 'forced' ? (-ph * 180) / Math.PI : 0
    return `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${deg.toFixed(1)})`
  }
  useAnimationFrame(
    (dt) => {
      const scale = 0.9 / (Vref / R_REF) // angular speed at r = 0.5 m shown as 0.9 rad/s
      phases.current.forEach((_, i) => {
        const r = RINGS[Math.floor(i / PER)]
        phases.current[i] = (phases.current[i] + (m.V(r) / r) * dt * scale) % (2 * Math.PI)
        crossEls.current[i]?.setAttribute('transform', tf(i))
      })
    },
    playing && inView && !reduced,
  )

  // pressure shading (relative to the outer edge)
  const rIn = mode === 'free' ? R_CORE : 0
  const rs = num.linspace(1, rIn + 0.0125, 40)
  const pr = rs.map((r) => m.dpTrue(1, r))
  const pmin = Math.min(...pr)
  const pmax = Math.max(...pr)
  const tOf = (p: number) => (pmax - pmin > 1e-9 ? (p - pmin) / (pmax - pmin) : 0.5)

  const V1 = m.V(r1)
  const V2 = m.V(r2)
  const dTrue = m.dpTrue(r1, r2)
  const dBern = m.dpBern(r1, r2)
  const err = dTrue - dBern
  const errZero = Math.abs(err) < 1e-6 * Math.max(1, Math.abs(dTrue))

  // plot ranges
  const xr: [number, number] = [R_CORE, 1]
  const samples = num.linspace(xr[0], xr[1], 60)
  const ys = samples.flatMap((r) => [m.dpTrue(r1, r) / 1000, m.dpBern(r1, r) / 1000, (m.dpTrue(r1, r) - m.dpBern(r1, r)) / 1000])
  const yLo = Math.min(0, ...ys)
  const yHi = Math.max(0, ...ys)
  const pad = 0.08 * (yHi - yLo || 1)

  return (
    <SimPanel
      title="One Bernoulli constant — or one per streamline?"
      subtitle="forced vs free vortex, water, horizontal plane"
      controls={
        <>
          <Segmented<Mode>
            label="Flow"
            value={mode}
            onChange={setMode}
            options={[
              { value: 'forced', label: 'Forced vortex (rotational)' },
              { value: 'free', label: 'Free vortex (irrotational)' },
            ]}
          />
          <Slider label={md`speed at $r = 0.5$ m`} value={Vref} min={0.5} max={4} step={0.05} onChange={setVref} unit="m/s" digits={3} />
          <Slider label={md`radius of point 1, $r_1$`} value={r1} min={0.2} max={0.95} step={0.01} onChange={setR1} unit="m" digits={2} />
          <Slider label={md`radius of point 2, $r_2$`} value={r2} min={0.2} max={0.95} step={0.01} onChange={setR2} unit="m" digits={2} />
          <PlayPause playing={playing} onToggle={() => setPlaying((p) => !p)} />
        </>
      }
      readout={
        <Readout
          items={[
            { label: 'Speed at point 1', value: V1, unit: 'm/s' },
            { label: 'Speed at point 2', value: V2, unit: 'm/s' },
            { label: 'True p₂ − p₁ (Euler)', value: dTrue / 1000, unit: 'kPa', tone: 'accent' },
            { label: 'Bernoulli across streamlines', value: dBern / 1000, unit: 'kPa' },
            { label: 'Error = ρ(B₂ − B₁)', value: errZero ? 0 : err / 1000, unit: 'kPa', tone: errZero ? 'good' : 'bad' },
            { label: 'Vorticity ∇×V', value: m.vort, unit: '1/s', tone: m.vort === 0 ? 'good' : 'default' },
          ]}
        />
      }
      footer={
        <Md>{md`**Try this:** in the forced vortex, put point 2 outside point 1 — the true pressure **rises** outward (the pressure gradient supplies the centripetal force) while "Bernoulli across streamlines" predicts a **fall**: same magnitude, wrong sign, because $B$ grows as $\Omega^2 r^2$. Switch to the free vortex: the dashed and solid curves merge and the error is zero for any pair of points. Watch the crosses: they spin with the forced vortex but show no net rotation in the free vortex (a real element would shear, its two arms turning equally in opposite senses; the cross marks its average orientation).`}</Md>
      }
    >
      <div ref={wrapRef} className="w-full space-y-3">
        <div ref={boxRef} className="mx-auto" style={{ width: S }}>
          <svg width={S} height={S} className="block" role="img" aria-label={`${mode} vortex seen from above with two points on different streamlines`}>
            {rs.map((r, i) => (
              <circle key={i} cx={c} cy={c} r={r * k} fill={rampCss(tOf(pr[i]), 0.55)} />
            ))}
            {mode === 'free' ? (
              <g>
                <circle cx={c} cy={c} r={R_CORE * k} fill="var(--body-fill)" />
                <Label x={c} y={c + 4} anchor="middle" size={9.5} color="var(--ink-2)" halo={false}>core</Label>
              </g>
            ) : (
              <circle cx={c} cy={c} r={2.5} fill="var(--ink-2)" />
            )}
            {[0.2, 0.35, 0.5, 0.65, 0.8, 0.95].map((r) => (
              <circle key={r} cx={c} cy={c} r={r * k} fill="none" stroke="var(--streamline)" strokeWidth={1} opacity={0.7} />
            ))}
            {phases.current.map((_, i) => (
              <g
                key={i}
                ref={(el) => {
                  crossEls.current[i] = el
                }}
                transform={tf(i)}
              >
                <line x1={-7} x2={7} y1={0} y2={0} stroke="var(--ink)" strokeWidth={1.8} strokeLinecap="round" />
                <line x1={0} x2={0} y1={-7} y2={7} stroke="var(--plot-4)" strokeWidth={1.8} strokeLinecap="round" />
                <circle cx={0} cy={-7} r={1.9} fill="var(--plot-4)" />
              </g>
            ))}
            <line x1={c + r1 * k} x2={c + r2 * k} y1={c} y2={c} stroke="var(--ink)" strokeWidth={1.4} strokeDasharray="4 3" />
            {[
              [r1, '1'],
              [r2, '2'],
            ].map(([r, t]) => (
              <g key={t}>
                <circle cx={c + +r * k} cy={c} r={6} fill="var(--surface)" stroke="var(--ink)" strokeWidth={2} />
                <Label x={c + +r * k} y={c - 10} anchor="middle" size={12} weight={700}>{t}</Label>
              </g>
            ))}
            <Label x={6} y={S - 8} size={10} color="var(--ink-3)">shading: pressure (blue low → red high) · domain r ≤ 1 m</Label>
          </svg>
        </div>
        <Plot
          height={230}
          x={{ label: 'radius $r$ (m)', domain: xr }}
          y={{ label: 'pressure difference (kPa)', domain: [yLo - pad, yHi + pad] }}
          series={[
            { label: md`true $p - p_1$ (radial Euler)`, fn: (r) => m.dpTrue(r1, r) / 1000, color: 'var(--plot-1)', width: 2.4 },
            { label: md`one constant: $\tfrac12\rho(V_1^2 - V^2)$`, fn: (r) => m.dpBern(r1, r) / 1000, color: 'var(--plot-3)', dash: '7 5', width: 2.2 },
            { label: md`error $\rho(B - B_1)$`, fn: (r) => (m.dpTrue(r1, r) - m.dpBern(r1, r)) / 1000, color: 'var(--plot-4)', dash: '2 3', width: 1.8 },
          ]}
          vlines={[
            { x: r1, label: '1' },
            { x: r2, label: '2' },
          ]}
          hlines={[{ y: 0 }]}
        />
      </div>
    </SimPanel>
  )
}
