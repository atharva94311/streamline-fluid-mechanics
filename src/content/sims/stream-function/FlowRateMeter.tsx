/**
 * Concept "flow-rate": the volume flux per unit depth across ANY curve from point 1 to point 2,
 * ∫(u dy − v dx), equals ψ₂ − ψ₁ (Lecture 9, slide 14). The sim integrates the flux numerically
 * (Simpson's rule) along a bendable path and compares it with the difference of ψ.
 */
import { useMemo, useState } from 'react'
import { FlowField, Readout, Segmented, SimPanel, Slider, md, num, type FlowMarker } from '@/kit'
import { Arrow } from './svg'
import { fluxAlong, type ScalarFn, type V2, type VelFn } from './fields'

type Key = 'uniform' | 'corner' | 'shear' | 'rotation'

interface Preset {
  label: string
  param: string
  unit: string
  def: number
  tex: string
  psi: (k: number) => ScalarFn
  vel: (k: number) => VelFn
}

const PRESETS: Record<Key, Preset> = {
  uniform: {
    label: 'uniform',
    param: md`speed $U$`,
    unit: 'm/s',
    def: 1,
    tex: md`\psi = Uy`,
    psi: (k) => (_x, y) => k * y,
    vel: (k) => () => [k, 0],
  },
  corner: {
    label: 'corner',
    param: md`strength $A$`,
    unit: 's⁻¹',
    def: 1,
    tex: md`\psi = A\,xy`,
    psi: (k) => (x, y) => k * x * y,
    vel: (k) => (x, y) => [k * x, -k * y],
  },
  shear: {
    label: 'simple shear',
    param: md`shear rate $\kappa$`,
    unit: 's⁻¹',
    def: 1,
    tex: md`\psi = \tfrac{\kappa}{2}y^2`,
    psi: (k) => (_x, y) => 0.5 * k * y * y,
    vel: (k) => (_x, y) => [k * y, 0],
  },
  rotation: {
    label: 'rigid rotation',
    param: md`angular speed $\Omega$`,
    unit: 'rad/s',
    def: 1,
    tex: md`\psi = -\tfrac{\Omega}{2}(x^2 + y^2)`,
    psi: (k) => (x, y) => -0.5 * k * (x * x + y * y),
    vel: (k) => (x, y) => [-k * y, k * x],
  },
}

const X: [number, number] = [-2, 2]
const Y: [number, number] = [-1.5, 1.5]

export function FlowRateMeter() {
  const [key, setKey] = useState<Key>('corner')
  const Pr = PRESETS[key]
  const [k, setK] = useState(Pr.def)
  const [x1, setX1] = useState(0.3)
  const [y1, setY1] = useState(0.3)
  const [x2, setX2] = useState(1.0)
  const [y2, setY2] = useState(1.2)
  const [bulge, setBulge] = useState(0)

  const psi = useMemo(() => Pr.psi(k), [Pr, k])
  const vel = useMemo(() => Pr.vel(k), [Pr, k])

  // quadratic Bézier from point 1 to point 2, bowed sideways by `bulge`
  const path = useMemo(() => {
    const dx = x2 - x1
    const dy = y2 - y1
    const L = Math.hypot(dx, dy) || 1e-9
    const C: V2 = [(x1 + x2) / 2 - (bulge * 0.75 * L * dy) / L, (y1 + y2) / 2 + (bulge * 0.75 * L * dx) / L]
    const P = (t: number): V2 => [
      (1 - t) * (1 - t) * x1 + 2 * t * (1 - t) * C[0] + t * t * x2,
      (1 - t) * (1 - t) * y1 + 2 * t * (1 - t) * C[1] + t * t * y2,
    ]
    const dP = (t: number): V2 => [2 * (1 - t) * (C[0] - x1) + 2 * t * (x2 - C[0]), 2 * (1 - t) * (C[1] - y1) + 2 * t * (y2 - C[1])]
    return { P, dP }
  }, [x1, y1, x2, y2, bulge])

  const psi1 = psi(x1, y1)
  const psi2 = psi(x2, y2)
  const q = psi2 - psi1
  const flux = useMemo(() => fluxAlong(vel, path.P, path.dP, 240), [vel, path])
  const err = Math.abs(flux - q)

  // local normal flux (positive = crossing from left to right of the walking direction 1 → 2)
  const ticks = useMemo(() => {
    const out: { p: V2; n: V2; f: number }[] = []
    for (let i = 0; i < 13; i++) {
      const t = (i + 0.5) / 13
      const p = path.P(t)
      const d = path.dP(t)
      const L = Math.hypot(d[0], d[1])
      if (!(L > 1e-12)) continue
      const n: V2 = [d[1] / L, -d[0] / L] // right-hand normal
      const [u, v] = vel(p[0], p[1])
      out.push({ p, n, f: u * n[0] + v * n[1] })
    }
    return out
  }, [path, vel])
  const fmax = Math.max(1e-9, ...ticks.map((t) => Math.abs(t.f)))

  const highlight = useMemo(
    () => [
      { level: psi1, color: 'var(--plot-1)', width: 2.6, label: 'streamline through 1' },
      { level: psi2, color: 'var(--plot-6)', width: 2.6, label: 'streamline through 2' },
    ],
    [psi1, psi2],
  )
  const markers = useMemo<FlowMarker[]>(
    () => [
      { x: x1, y: y1, label: '1', kind: 'point' },
      { x: x2, y: y2, label: '2', kind: 'point' },
    ],
    [x1, y1, x2, y2],
  )
  const dir = Math.abs(q) < 1e-9 ? 'no net flow crosses the path' : q > 0 ? 'net flow crosses from your left to your right' : 'net flow crosses from your right to your left'

  return (
    <SimPanel
      title="Flow-rate meter — ψ₂ − ψ₁ against the measured flux"
      subtitle={md`$${Pr.tex}$ · flux per unit depth across the bold path · axes in m`}
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
          <Slider label={Pr.param} value={k} min={0.3} max={2} step={0.05} onChange={setK} unit={Pr.unit} digits={2} />
          <div className="grid grid-cols-2 gap-x-3 gap-y-2">
            <Slider label="$x_1$" value={x1} min={-1.8} max={1.8} step={0.05} onChange={setX1} unit="m" digits={2} />
            <Slider label="$y_1$" value={y1} min={-1.3} max={1.3} step={0.05} onChange={setY1} unit="m" digits={2} />
            <Slider label="$x_2$" value={x2} min={-1.8} max={1.8} step={0.05} onChange={setX2} unit="m" digits={2} />
            <Slider label="$y_2$" value={y2} min={-1.3} max={1.3} step={0.05} onChange={setY2} unit="m" digits={2} />
          </div>
          <Slider label="bend the path" value={bulge} min={-1} max={1} step={0.05} onChange={setBulge} digits={2} />
        </>
      }
      readout={
        <div className="space-y-2">
          <Readout
            items={[
              { label: md`$\psi_1$`, value: psi1, unit: 'm²/s' },
              { label: md`$\psi_2$`, value: psi2, unit: 'm²/s' },
              { label: md`$q = \psi_2 - \psi_1$`, value: q, unit: 'm²/s', tone: 'accent' },
              { label: md`$\int (u\,dy - v\,dx)$`, value: flux, unit: 'm²/s', tone: 'accent' },
              { label: 'difference', value: err < 1e-9 ? '< 10⁻⁹' : num.fmt(err, 2), unit: 'm²/s', tone: 'good' },
              { label: 'per 1 m depth', value: Math.abs(q), unit: 'm³/s' },
            ]}
          />
          <div className="rounded-xl border border-line bg-surface-2 px-3 py-2 text-sm text-ink-2">
            Walking from 1 to 2: <b className="text-ink">{dir}</b>.
          </div>
        </div>
      }
      footer={
        <span>
          <b>Try this:</b> drag “bend the path” both ways — the local arrows change but the integral stays equal to ψ₂ − ψ₁ (only
          the end streamlines matter). In the corner flow, move point 2 from (1.0, 1.2) to (1.5, 0.8): it stays on the same purple
          streamline xy = 1.2, so q does not change. Swap the points: q changes sign. Compare the gap between the two highlighted
          streamlines where they cross the diagonal y = x and further out towards the x-axis: the same q squeezes through the
          narrower gap, so the flow there is faster.
        </span>
      }
    >
      <FlowField
        x={X}
        y={Y}
        psi={psi}
        vel={vel}
        highlight={highlight}
        markers={markers}
        particles={45}
        maxHeight={400}
        overlay={({ sx, sy }) => {
          const pts: string[] = []
          for (let i = 0; i <= 60; i++) {
            const [px, py] = path.P(i / 60)
            pts.push(`${sx(px).toFixed(1)},${sy(py).toFixed(1)}`)
          }
          const W = sx(X[1]) - sx(X[0])
          const ppm = W / (X[1] - X[0]) // pixels per metre
          return (
            <g>
              <polyline points={pts.join(' ')} fill="none" stroke="var(--ink)" strokeWidth={3} strokeLinecap="round" />
              {ticks.map((t, i) => {
                const len = (0.32 * t.f) / fmax
                if (Math.abs(len) < 0.02) return null
                const x0 = sx(t.p[0])
                const y0 = sy(t.p[1])
                return (
                  <Arrow
                    key={i}
                    x1={x0}
                    y1={y0}
                    x2={x0 + len * t.n[0] * ppm}
                    y2={y0 - len * t.n[1] * ppm}
                    color={t.f > 0 ? 'var(--plot-5)' : 'var(--plot-3)'}
                    width={2}
                    head={7}
                  />
                )
              })}
            </g>
          )
        }}
      />
      <p className="mt-2 text-xs text-ink-3">
        Small arrows: local flux across the path (green = crossing left → right, amber = right → left, for someone walking from 1 to 2).
      </p>
    </SimPanel>
  )
}
