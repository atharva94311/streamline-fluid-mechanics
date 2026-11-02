/**
 * Concept "polar-scope": classic plane flows written as ψ(r, θ). At a probe point the sim evaluates
 * v_r = (1/r)∂ψ/∂θ and v_θ = −∂ψ/∂r (Lecture 10, slide 2) analytically, and checks them against the
 * Cartesian route (u = ∂ψ/∂y, v = −∂ψ/∂x, then v_r = u cosθ + v sinθ, v_θ = −u sinθ + v cosθ).
 */
import { useMemo, useState } from 'react'
import { FlowField, Readout, Segmented, SimPanel, Slider, md, num, type FlowMarker } from '@/kit'
import { Arrow } from './svg'
import { wrapPi, type VelFn } from './fields'

type Key = 'uniform' | 'corner' | 'source' | 'vortex' | 'spiral' | 'lec10'
type P2 = (r: number, t: number) => number

interface PolarPreset {
  label: string
  param: string
  unit: string
  min: number
  max: number
  def: number
  step: number
  tex: string
  vrTeX: string
  vtTeX: string
  psi: (k: number) => P2
  vr: (k: number) => P2
  vt: (k: number) => P2
  /** ψ jumps by a finite amount once round the origin (branch cut on the negative x-axis). */
  multi?: boolean
  levels?: (k: number) => number[]
  cut?: (k: number) => number
  markers?: FlowMarker[]
}

const TAU = 2 * Math.PI
const PRESETS: Record<Key, PolarPreset> = {
  uniform: {
    label: 'uniform',
    param: md`speed $U$`,
    unit: 'm/s',
    min: 0.5,
    max: 2,
    def: 1,
    step: 0.05,
    tex: md`\psi = U r\sin\theta`,
    vrTeX: md`U\cos\theta`,
    vtTeX: md`-U\sin\theta`,
    psi: (k) => (r, t) => k * r * Math.sin(t),
    vr: (k) => (_r, t) => k * Math.cos(t),
    vt: (k) => (_r, t) => -k * Math.sin(t),
  },
  corner: {
    label: 'corner',
    param: md`strength $A$`,
    unit: 's⁻¹',
    min: 0.2,
    max: 1.2,
    def: 0.5,
    step: 0.05,
    tex: md`\psi = A r^2\sin 2\theta`,
    vrTeX: md`2Ar\cos 2\theta`,
    vtTeX: md`-2Ar\sin 2\theta`,
    psi: (k) => (r, t) => k * r * r * Math.sin(2 * t),
    vr: (k) => (r, t) => 2 * k * r * Math.cos(2 * t),
    vt: (k) => (r, t) => -2 * k * r * Math.sin(2 * t),
    markers: [{ x: 0, y: 0, kind: 'stagnation' }],
  },
  source: {
    label: 'source',
    param: md`strength $m$`,
    unit: 'm²/s',
    min: 1,
    max: 10,
    def: 5,
    step: 0.5,
    tex: md`\psi = \frac{m}{2\pi}\,\theta`,
    vrTeX: md`\frac{m}{2\pi r}`,
    vtTeX: md`0`,
    psi: (k) => (_r, t) => (k / TAU) * t,
    vr: (k) => (r) => k / (TAU * r),
    vt: () => () => 0,
    multi: true,
    levels: (k) => Array.from({ length: 16 }, (_, i) => -k / 2 + (k * (i + 0.5)) / 16),
    cut: (k) => k / 2,
    markers: [{ x: 0, y: 0, kind: 'source' }],
  },
  vortex: {
    label: 'vortex',
    param: md`circulation $\Gamma$`,
    unit: 'm²/s',
    min: 1,
    max: 10,
    def: 5,
    step: 0.5,
    tex: md`\psi = -\frac{\Gamma}{2\pi}\ln r`,
    vrTeX: md`0`,
    vtTeX: md`\frac{\Gamma}{2\pi r}`,
    psi: (k) => (r) => (-k / TAU) * Math.log(r),
    vr: () => () => 0,
    vt: (k) => (r) => k / (TAU * r),
    markers: [{ x: 0, y: 0, kind: 'vortex' }],
  },
  spiral: {
    label: 'source + vortex',
    param: md`$m$ (with $\Gamma = 1.5m$)`,
    unit: 'm²/s',
    min: 1,
    max: 8,
    def: 4,
    step: 0.5,
    tex: md`\psi = \frac{m}{2\pi}\theta - \frac{\Gamma}{2\pi}\ln r`,
    vrTeX: md`\frac{m}{2\pi r}`,
    vtTeX: md`\frac{\Gamma}{2\pi r}`,
    psi: (k) => (r, t) => (k / TAU) * t - ((1.5 * k) / TAU) * Math.log(r),
    vr: (k) => (r) => k / (TAU * r),
    vt: (k) => (r) => (1.5 * k) / (TAU * r),
    multi: true,
    cut: (k) => k / 2,
    markers: [{ x: 0, y: 0, kind: 'source' }],
  },
  lec10: {
    label: 'Lec 10 field',
    param: md`scale $k$ ($k = 1$: $u = 2y,\ v = 4x$)`,
    unit: '',
    min: 0.5,
    max: 1.5,
    def: 1,
    step: 0.05,
    tex: md`\psi = k\,r^2(\sin^2\theta - 2\cos^2\theta)`,
    vrTeX: md`3kr\sin 2\theta`,
    vtTeX: md`2kr(2\cos^2\theta - \sin^2\theta)`,
    psi: (k) => (r, t) => k * r * r * (Math.sin(t) ** 2 - 2 * Math.cos(t) ** 2),
    vr: (k) => (r, t) => 3 * k * r * Math.sin(2 * t),
    vt: (k) => (r, t) => 2 * k * r * (2 * Math.cos(t) ** 2 - Math.sin(t) ** 2),
    markers: [{ x: 0, y: 0, kind: 'stagnation' }],
  },
}

const X: [number, number] = [-2, 2]
const Y: [number, number] = [-2, 2]

export function PolarExplorer() {
  const [key, setKey] = useState<Key>('lec10')
  const Pr = PRESETS[key]
  const [k, setK] = useState(Pr.def)
  const [r, setR] = useState(1)
  const [deg, setDeg] = useState(45)
  const th = (deg * Math.PI) / 180

  const fns = useMemo(() => ({ psi: Pr.psi(k), vr: Pr.vr(k), vt: Pr.vt(k) }), [Pr, k])
  const psiXY = useMemo(() => (x: number, y: number) => fns.psi(Math.hypot(x, y), Math.atan2(y, x)), [fns])
  const vel = useMemo<VelFn>(
    () => (x, y) => {
      const rr = Math.hypot(x, y)
      const t = Math.atan2(y, x)
      const a = fns.vr(rr, t)
      const b = fns.vt(rr, t)
      return [a * Math.cos(t) - b * Math.sin(t), a * Math.sin(t) + b * Math.cos(t)]
    },
    [fns],
  )
  const levels = useMemo(() => Pr.levels?.(k), [Pr, k])
  const cut = Pr.cut?.(k)

  // probe values: analytic polar formulas …
  const vr = fns.vr(r, th)
  const vt = fns.vt(r, th)
  const V = Math.hypot(vr, vt)
  // … and the independent Cartesian route (local branch of θ around the probe, so a cut never interferes)
  const px = r * Math.cos(th)
  const py = r * Math.sin(th)
  const psiLocal = (x: number, y: number) => fns.psi(Math.hypot(x, y), th + wrapPi(Math.atan2(y, x) - th))
  const h = 1e-5
  const u = (psiLocal(px, py + h) - psiLocal(px, py - h)) / (2 * h)
  const v = -(psiLocal(px + h, py) - psiLocal(px - h, py)) / (2 * h)
  const vrC = u * Math.cos(th) + v * Math.sin(th)
  const vtC = -u * Math.sin(th) + v * Math.cos(th)
  // polar continuity residual (1/r)∂(r v_r)/∂r + (1/r)∂v_θ/∂θ by central differences
  const g = 1e-4
  const res = ((r + g) * fns.vr(r + g, th) - (r - g) * fns.vr(r - g, th)) / (2 * g) / r + (fns.vt(r, th + g) - fns.vt(r, th - g)) / (2 * g) / r
  const agree = Math.abs(vrC - vr) < 1e-4 * Math.max(1, V) && Math.abs(vtC - vt) < 1e-4 * Math.max(1, V)

  const markers = useMemo<FlowMarker[]>(() => [...(Pr.markers ?? []), { x: px, y: py, label: 'P', kind: 'point' }], [Pr, px, py])

  return (
    <SimPanel
      title="Polar explorer — v_r = (1/r)∂ψ/∂θ, v_θ = −∂ψ/∂r"
      subtitle={md`$${Pr.tex}$ ⇒ $v_r = ${Pr.vrTeX}$, $v_\theta = ${Pr.vtTeX}$`}
      wide
      controls={
        <>
          <Segmented
            label="Flow"
            options={(Object.keys(PRESETS) as Key[]).map((kk) => ({ value: kk, label: PRESETS[kk].label }))}
            value={key}
            onChange={(nk) => {
              setKey(nk)
              setK(PRESETS[nk].def)
            }}
          />
          <Slider label={Pr.param} value={k} min={Pr.min} max={Pr.max} step={Pr.step} onChange={setK} unit={Pr.unit} digits={2} />
          <Slider label="probe radius $r$" value={r} min={0.3} max={1.9} step={0.05} onChange={setR} unit="m" digits={2} />
          <Slider label={md`probe angle $\theta$`} value={deg} min={0} max={355} step={5} onChange={setDeg} unit="°" format={(d) => d.toFixed(0)} />
        </>
      }
      readout={
        <Readout
          items={[
            { label: md`$\psi(P)$`, value: fns.psi(r, wrapPi(th)), unit: 'm²/s' },
            { label: md`$|\mathbf{V}|$`, value: V, unit: 'm/s' },
            { label: md`$v_r = \frac{1}{r}\partial\psi/\partial\theta$`, value: vr, unit: 'm/s', tone: 'accent' },
            { label: md`$v_\theta = -\partial\psi/\partial r$`, value: vt, unit: 'm/s', tone: 'accent' },
            { label: md`$u\cos\theta + v\sin\theta$`, value: vrC, unit: 'm/s', tone: agree ? 'good' : 'bad' },
            { label: md`$-u\sin\theta + v\cos\theta$`, value: vtC, unit: 'm/s', tone: agree ? 'good' : 'bad' },
            { label: 'polar continuity residual', value: Math.abs(res) < 1e-6 ? '0 (≤ 10⁻⁶)' : num.fmt(res, 2), unit: 's⁻¹', tone: Math.abs(res) < 1e-6 ? 'good' : 'bad' },
            { label: 'ψ after one turn', value: Pr.multi ? `+ ${num.fmt(k, 3)}` : 'same', unit: Pr.multi ? 'm²/s' : '' },
          ]}
        />
      }
      footer={
        <span>
          <b>Try this:</b> with the Lec 10 field at r = 1 m, θ = 45° you should read v_r = 3 m/s and v_θ = 1 m/s — the same numbers the
          Cartesian route gives (green tiles). Switch to the source: v_θ = 0, and ψ climbs by m each time you go once round — the
          rays are streamlines and the flow between any two of them is their Δψ. For the vortex the circles get further apart
          outwards (equal Δψ, slower flow).
        </span>
      }
    >
      <FlowField
        x={X}
        y={Y}
        psi={psiXY}
        vel={vel}
        psiLevels={levels ?? 20}
        cut={cut}
        particles={60}
        markers={markers}
        maxHeight={420}
        overlay={({ sx, sy }) => {
          const ppm = (sx(X[1]) - sx(X[0])) / (X[1] - X[0])
          const s = V > 1e-9 ? 0.55 / V : 0 // metres of arrow per (m/s)
          const P0x = sx(px)
          const P0y = sy(py)
          const er = [Math.cos(th), Math.sin(th)]
          const et = [-Math.sin(th), Math.cos(th)]
          const vrx = P0x + s * vr * er[0] * ppm
          const vry = P0y - s * vr * er[1] * ppm
          const vtx = P0x + s * vt * et[0] * ppm
          const vty = P0y - s * vt * et[1] * ppm
          const Vx = P0x + s * (vr * er[0] + vt * et[0]) * ppm
          const Vy = P0y - s * (vr * er[1] + vt * et[1]) * ppm
          return (
            <g pointerEvents="none">
              <line x1={sx(0)} y1={sy(0)} x2={P0x} y2={P0y} stroke="var(--ink-3)" strokeDasharray="5 4" strokeWidth={1.3} />
              <Arrow x1={P0x} y1={P0y} x2={vrx} y2={vry} color="var(--plot-1)" width={2.6} />
              <Arrow x1={P0x} y1={P0y} x2={vtx} y2={vty} color="var(--plot-4)" width={2.6} />
              <Arrow x1={P0x} y1={P0y} x2={Vx} y2={Vy} color="var(--ink)" width={3} head={10} />
            </g>
          )
        }}
      />
      <p className="mt-2 text-xs text-ink-3">
        Blue arrow: v_r (along the radius) · red arrow: v_θ (perpendicular, towards increasing θ) · black: V. For the source and the
        spiral, ψ uses θ ∈ (−π, π], so its branch cut lies along the negative x-axis (hidden).
      </p>
    </SimPanel>
  )
}
