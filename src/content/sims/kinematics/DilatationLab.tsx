import { useState } from 'react'
import { Plot, Readout, SimPanel, Slider, md } from '@/kit'
import { Chip, PresetRow } from './shared'

/**
 * Volumetric-dilatation lab (Lecture 9 slide 5): a cubic element δx = δy = δz = 1 cm in a field with uniform
 * normal gradients ∂u/∂x, ∂v/∂y, ∂w/∂z. The drawing shows the exact deformed box; the coloured strips are the
 * slide's first-order volume changes, e.g. (∂u/∂x δx)(δy δz)δt; the uncoloured corner pieces are O(δt²).
 */

type Key = 'x' | 'incomp' | 'expand' | 'compress'
const PRESETS: { key: Key; label: string; v: [number, number, number] }[] = [
  { key: 'x', label: 'Stretch in x only (slide 5)', v: [1.2, 0, 0] },
  { key: 'incomp', label: 'Stretch x, squeeze y', v: [1.2, -1.2, 0] },
  { key: 'expand', label: 'Uniform expansion', v: [0.6, 0.6, 0.6] },
  { key: 'compress', label: 'Uniform compression', v: [-0.6, -0.6, -0.6] },
]

const S = 82 // px per cm (front face)
const DZ: [number, number] = [0.5 * S * Math.SQRT1_2, -0.5 * S * Math.SQRT1_2] // oblique depth direction per cm
const OX = 64
const OY = 262

/** Oblique projection of (x, y, z) in cm. */
const P = (x: number, y: number, z: number): [number, number] => [OX + S * x + DZ[0] * z, OY - S * y + DZ[1] * z]
const pts = (...ps: [number, number][]) => ps.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')

function Box({ X, Y, Z, fill, dashed }: { X: number; Y: number; Z: number; fill?: string; dashed?: boolean }) {
  const f = [P(0, 0, 0), P(X, 0, 0), P(X, Y, 0), P(0, Y, 0)]
  const top = [P(0, Y, 0), P(X, Y, 0), P(X, Y, Z), P(0, Y, Z)]
  const side = [P(X, 0, 0), P(X, 0, Z), P(X, Y, Z), P(X, Y, 0)]
  const st = dashed ? { stroke: 'var(--ink-3)', strokeDasharray: '4 3', strokeWidth: 1.2, fill: 'none' } : { stroke: 'var(--plot-2)', strokeWidth: 1.5 }
  return (
    <g>
      <polygon points={pts(...side)} {...st} fill={dashed ? 'none' : fill} fillOpacity={0.22} />
      <polygon points={pts(...top)} {...st} fill={dashed ? 'none' : fill} fillOpacity={0.14} />
      <polygon points={pts(...f)} {...st} fill={dashed ? 'none' : fill} fillOpacity={0.08} />
    </g>
  )
}

export function DilatationLab() {
  const [g, setG] = useState<[number, number, number]>([1.2, 0, 0])
  const [dt, setDt] = useState(0.2)
  const [preset, setPreset] = useState<Key | null>('x')
  const [a, d, e] = g
  const div = a + d + e
  // exact edge lengths after dt for a linear field with only normal gradients
  const X = Math.exp(a * dt)
  const Y = Math.exp(d * dt)
  const Z = Math.exp(e * dt)
  const dVx = a * dt // cm³ (δ∀ = 1 cm³)
  const dVy = d * dt
  const dVz = e * dt
  const lin = div * dt
  const exact = X * Y * Z - 1
  const set = (i: 0 | 1 | 2) => (v: number) => {
    setG((old) => {
      const n = [...old] as [number, number, number]
      n[i] = +v.toFixed(2)
      return n
    })
    setPreset(null)
  }
  const grow = 'var(--plot-4)'
  const shrink = 'var(--plot-2)'
  // first-order strips on the front face (x and y) and on the top face (z)
  const yLo = Math.max(-1, Math.min(0.9, Math.exp(div * 0.4) * 0.95, 1 + div * 0.4) - 0.05)
  const yHi = Math.max(1.1, Math.exp(div * 0.4) * 1.05)
  const xs = [Math.min(1, X), Math.max(1, X)]
  const ys = [Math.min(1, Y), Math.max(1, Y)]
  const zs = [Math.min(1, Z), Math.max(1, Z)]

  return (
    <SimPanel
      title="Volumetric dilatation lab"
      subtitle={md`cubic element $\delta x = \delta y = \delta z = 1$ cm, so $\delta\forall = 1\ \mathrm{cm^3}$`}
      controls={
        <>
          <PresetRow
            presets={PRESETS}
            active={preset}
            onPick={(k) => {
              setG(PRESETS.find((p) => p.key === k)!.v)
              setPreset(k)
            }}
          />
          <Slider label={md`$\partial u/\partial x$`} value={a} min={-1.5} max={1.5} step={0.1} unit="s⁻¹" digits={2} onChange={set(0)} />
          <Slider label={md`$\partial v/\partial y$`} value={d} min={-1.5} max={1.5} step={0.1} unit="s⁻¹" digits={2} onChange={set(1)} />
          <Slider label={md`$\partial w/\partial z$`} value={e} min={-1.5} max={1.5} step={0.1} unit="s⁻¹" digits={2} onChange={set(2)} />
          <Slider label={md`time interval $\delta t$`} value={dt} min={0} max={0.4} step={0.01} unit="s" digits={2} onChange={setDt} />
        </>
      }
      readout={
        <Readout
          items={[
            { label: md`$\nabla\cdot\mathbf V$`, value: div, unit: 's⁻¹', tone: Math.abs(div) < 1e-9 ? 'good' : 'accent', digits: 3 },
            { label: md`from $\partial u/\partial x$`, value: dVx, unit: 'cm³', digits: 3 },
            { label: md`from $\partial v/\partial y$`, value: dVy, unit: 'cm³', digits: 3 },
            { label: md`from $\partial w/\partial z$`, value: dVz, unit: 'cm³', digits: 3 },
            { label: 'Δ(δ∀) first order', value: lin, unit: 'cm³', digits: 3 },
            { label: 'Δ(δ∀) exact', value: exact, unit: 'cm³', digits: 3 },
          ]}
        />
      }
      footer={
        <span>
          <b>Try this:</b> set δt small (0.02 s) and compare the first-order and exact volume changes — they agree, which is why
          the slide can take δt → 0. At δt = 0.4 s they differ: the uncoloured corner pieces are second-order. Then choose{' '}
          <i>Stretch x, squeeze y</i>: the shape changes but ∇·V = 0 keeps the volume.
        </span>
      }
    >
      <div className="space-y-3">
        <svg viewBox="0 0 360 290" className="mx-auto block h-auto w-full max-w-[520px]" role="img" aria-label="element before and after deformation">
          <Box X={X} Y={Y} Z={Z} fill="var(--plot-2)" />
          {/* first-order strips */}
          {Math.abs(X - 1) > 1e-6 ? (
            <polygon points={pts(P(xs[0], 0, 0), P(xs[1], 0, 0), P(xs[1], 1, 0), P(xs[0], 1, 0))} fill={X > 1 ? grow : shrink} fillOpacity={0.38} stroke={X > 1 ? grow : shrink} strokeWidth={1} />
          ) : null}
          {Math.abs(Y - 1) > 1e-6 ? (
            <polygon points={pts(P(0, ys[0], 0), P(1, ys[0], 0), P(1, ys[1], 0), P(0, ys[1], 0))} fill={Y > 1 ? grow : shrink} fillOpacity={0.38} stroke={Y > 1 ? grow : shrink} strokeWidth={1} />
          ) : null}
          {Math.abs(Z - 1) > 1e-6 ? (
            <polygon points={pts(P(0, Y, zs[0]), P(1, Y, zs[0]), P(1, Y, zs[1]), P(0, Y, zs[1]))} fill={Z > 1 ? grow : shrink} fillOpacity={0.38} stroke={Z > 1 ? grow : shrink} strokeWidth={1} />
          ) : null}
          <Box X={1} Y={1} Z={1} dashed />
          <g fontSize={12} className="fill-ink-2">
            <text x={P(0.5, 0, 0)[0]} y={OY + 16} textAnchor="middle">
              δ<tspan fontStyle="italic">x</tspan>
            </text>
            <text x={OX - 8} y={P(0, 0.5, 0)[1]} textAnchor="end">
              δ<tspan fontStyle="italic">y</tspan>
            </text>
            <text x={P(0, 1, 0.5)[0] - 10} y={P(0, 1, 0.5)[1] - 4} textAnchor="end">
              δ<tspan fontStyle="italic">z</tspan>
            </text>
          </g>
          <text x={8} y={16} fontSize={11.5} className="fill-ink-3">
            dashed: element at t · solid: at t + δt
          </text>
        </svg>
        <div className="flex flex-wrap items-center gap-1.5">
          <Chip on={Math.abs(div) < 1e-9} tone="amber">
            volume-preserving (∇·V = 0)
          </Chip>
          <span className="text-[11.5px] text-ink-3">
            <span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm align-middle" style={{ background: grow, opacity: 0.6 }} /> volume added ·{' '}
            <span className="mx-1 inline-block h-2.5 w-2.5 rounded-sm align-middle" style={{ background: shrink, opacity: 0.6 }} /> volume removed
          </span>
        </div>
        <Plot
          height={200}
          x={{ label: md`elapsed time $\delta t$ (s)`, domain: [0, 0.4] }}
          y={{ label: md`volume ratio $\delta\forall/\delta\forall_0$`, domain: [yLo, yHi] }}
          series={[
            { label: md`exact $e^{(\nabla\cdot\mathbf V)\,t}$`, fn: (t) => Math.exp(div * t), color: 'var(--plot-1)' },
            { label: md`first order $1 + (\nabla\cdot\mathbf V)\,t$`, fn: (t) => 1 + div * t, color: 'var(--plot-3)', dash: '6 4' },
          ]}
          marks={[{ x: dt, y: Math.exp(div * dt), color: 'var(--plot-1)' }]}
          hlines={[{ y: 1, color: 'var(--ink-3)' }]}
        />
      </div>
    </SimPanel>
  )
}
