import { useMemo, useRef, useState } from 'react'
import { PlayPause, Plot, Readout, SimPanel, Slider, md, useAnimationFrame, useInView, usePrefersReducedMotion } from '@/kit'
import { PresetRow, arcPath, deg, fin, flowMap, type P2 } from './shared'

/**
 * Rotation-vs-shear explorer (Lecture 9 slides 6–9). Corner O of a square element is held fixed and the
 * cross-gradients ∂v/∂x and ∂u/∂y act on it (exact flow map). A regime map shows where the point
 * (∂v/∂x, ∂u/∂y) sits relative to the two special lines of slide 8.
 */

const L0 = -1.45
const L1 = 1.45
const VS = 360
const SC = VS / (L1 - L0)
const sx = (x: number) => (x - L0) * SC
const sy = (y: number) => VS - (y - L0) * SC
const O: P2 = [-0.5, -0.5]
const A0: P2 = [0.5, -0.5]
const B0: P2 = [-0.5, 0.5]
const C0: P2 = [0.5, 0.5]
const T_END = 0.6

type Key = 'simple' | 'pure' | 'rigid' | 'vx'
const PRESETS: { key: Key; label: string; c: number; b: number }[] = [
  { key: 'simple', label: 'Simple shear (∂u/∂y only)', c: 0, b: 1 },
  { key: 'pure', label: 'Pure angular deformation', c: 0.6, b: 0.6 },
  { key: 'rigid', label: 'Rigid rotation', c: 0.8, b: -0.8 },
  { key: 'vx', label: '∂v/∂x only', c: 1, b: 0 },
]

export function ShearRotationMap() {
  const [c, setC] = useState(0)
  const [b, setB] = useState(1)
  const [preset, setPreset] = useState<Key | null>('simple')
  const [playing, setPlaying] = useState(true)
  const [t, setT] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref)
  const reduced = usePrefersReducedMotion()
  useAnimationFrame((dt) => setT((x) => (x + dt * 0.4 > T_END + 0.4 ? 0 : x + dt * 0.4)), playing && inView && !reduced)
  const tt = reduced && playing ? T_END : Math.min(t, T_END)

  const map = useMemo(() => flowMap({ a: 0, b, c, d: 0 }, [0, 0], tt, O), [b, c, tt])
  const Am = map(A0)
  const Bm = map(B0)
  const Cm = map(C0)
  const ea: P2 = [Am[0] - O[0], Am[1] - O[1]]
  const eb: P2 = [Bm[0] - O[0], Bm[1] - O[1]]
  const al = Math.atan2(ea[1], ea[0]) // CCW turn of OA
  const be = Math.atan2(eb[0], eb[1]) // CW turn of OB
  const angle = 90 - deg(al) - deg(be)
  const bis = Math.PI / 4 + (al - be) / 2
  const omegaZ = 0.5 * (c - b)
  const gdot = c + b

  const pick = (k: Key) => {
    const p = PRESETS.find((q) => q.key === k)!
    setC(p.c)
    setB(p.b)
    setPreset(k)
    setT(0)
    setPlaying(true)
  }
  const poly = (ps: P2[]) => ps.map((p) => `${fin(sx(p[0])).toFixed(1)},${fin(sy(p[1])).toFixed(1)}`).join(' ')
  const o: P2 = [sx(O[0]), sy(O[1])]
  const ray = (ang: number, r: number): P2 => [o[0] + r * Math.cos(ang), o[1] - r * Math.sin(ang)]

  return (
    <SimPanel
      wide
      title="Rotation or angular deformation?"
      subtitle="corner O held fixed; only the cross-gradients act"
      controls={
        <>
          <PresetRow presets={PRESETS} onPick={pick} active={preset} />
          <Slider label={md`$\partial v/\partial x$ (turns OA, ccw +)`} value={c} min={-1} max={1} step={0.05} unit="s⁻¹" digits={2} onChange={(v) => { setC(+v.toFixed(2)); setPreset(null) }} />
          <Slider label={md`$\partial u/\partial y$ (turns OB, cw +)`} value={b} min={-1} max={1} step={0.05} unit="s⁻¹" digits={2} onChange={(v) => { setB(+v.toFixed(2)); setPreset(null) }} />
          <Slider label={md`time $t$`} value={tt} min={0} max={T_END} step={0.01} unit="s" digits={2} onChange={(v) => { setPlaying(false); setT(v) }} />
          <PlayPause playing={playing && !reduced} onToggle={() => setPlaying((p) => !p)} onReset={() => setT(0)} />
        </>
      }
      readout={
        <Readout
          items={[
            { label: md`$\omega_z = \tfrac12(\partial v/\partial x - \partial u/\partial y)$`, value: omegaZ, unit: 'rad/s', tone: Math.abs(omegaZ) < 1e-9 ? 'good' : 'default' },
            { label: md`$\dot\gamma = \partial v/\partial x + \partial u/\partial y$`, value: gdot, unit: 's⁻¹', tone: Math.abs(gdot) < 1e-9 ? 'good' : 'default' },
            { label: 'angle AOB (exact)', value: `${angle.toFixed(1)}°` },
            { label: md`first order $90^\circ - \dot\gamma t$`, value: `${(90 - deg(gdot * tt)).toFixed(1)}°` },
            { label: 'bisector turned (exact)', value: `${deg(bis - Math.PI / 4).toFixed(1)}°` },
            { label: md`first order $\omega_z t$`, value: `${deg(omegaZ * tt).toFixed(1)}°` },
          ]}
        />
      }
      footer={
        <span>
          <b>Try this:</b> use the sliders to put the red point on the green line ∂u/∂y = −∂v/∂x — the corner angle stays at 90°
          and the element turns as a rigid block. Put it on the violet line ∂u/∂y = ∂v/∂x — the bisector stops turning
          (ω<sub>z</sub> = 0) while the corner keeps closing. Simple shear sits between the two lines: it both rotates and deforms.
        </span>
      }
    >
      <div ref={ref} className="grid gap-3 lg:grid-cols-2">
        <svg viewBox={`0 0 ${VS} ${VS}`} className="mx-auto block h-auto w-full max-w-[420px] rounded-xl border border-line" role="img" aria-label="element with corner O fixed">
          <rect x={0} y={0} width={VS} height={VS} fill="var(--field-bg)" />
          <polygon points={poly([O, A0, C0, B0])} fill="none" stroke="var(--ink-3)" strokeWidth={1.2} strokeDasharray="5 4" />
          <polygon points={poly([O, Am, Cm, Bm])} fill="var(--plot-2)" fillOpacity={0.13} stroke="var(--plot-2)" strokeWidth={1.4} />
          <line x1={o[0]} y1={o[1]} x2={ray(Math.PI / 4, 170)[0]} y2={ray(Math.PI / 4, 170)[1]} stroke="var(--ink-3)" strokeWidth={1.1} strokeDasharray="2 3" />
          <line x1={o[0]} y1={o[1]} x2={ray(bis, 170)[0]} y2={ray(bis, 170)[1]} stroke="var(--plot-6)" strokeWidth={2} />
          <line x1={o[0]} y1={o[1]} x2={sx(Am[0])} y2={sy(Am[1])} stroke="var(--plot-1)" strokeWidth={3.2} strokeLinecap="round" />
          <line x1={o[0]} y1={o[1]} x2={sx(Bm[0])} y2={sy(Bm[1])} stroke="var(--plot-4)" strokeWidth={3.2} strokeLinecap="round" />
          <path d={arcPath(o[0], o[1], 24, al, Math.PI / 2 - be)} fill="none" stroke="var(--ink-2)" strokeWidth={1.2} />
          <circle cx={o[0]} cy={o[1]} r={3.5} fill="var(--ink)" />
          <g fontSize={14} fontWeight={700} fontStyle="italic" className="fill-ink" paintOrder="stroke" stroke="var(--field-bg)" strokeWidth={3}>
            <text x={o[0] - 16} y={o[1] + 16}>O</text>
            <text x={sx(Am[0]) + 6} y={sy(Am[1]) + 14}>A</text>
            <text x={sx(Bm[0]) - 16} y={sy(Bm[1]) - 4}>B</text>
          </g>
          <text x={o[0] + 28} y={o[1] - 8} fontSize={12} className="fill-ink-2">
            {angle.toFixed(1)}°
          </text>
          <text x={8} y={18} fontSize={12} className="fill-ink-3">
            t = {tt.toFixed(2)} s · violet: bisector
          </text>
        </svg>
        <div className="min-w-0">
          <Plot
            height={300}
            x={{ label: md`$\partial v/\partial x$ (s$^{-1}$)`, domain: [-1.1, 1.1] }}
            y={{ label: md`$\partial u/\partial y$ (s$^{-1}$)`, domain: [-1.1, 1.1] }}
            series={[
              { label: md`undeformed block $\partial u/\partial y = -\partial v/\partial x$`, fn: (x) => -x, color: 'var(--plot-5)', width: 2.6 },
              { label: md`no rotation $\partial u/\partial y = \partial v/\partial x$`, fn: (x) => x, color: 'var(--plot-6)', width: 2.6, dash: '6 4' },
            ]}
            marks={[{ x: c, y: b, label: 'now', color: 'var(--plot-4)' }]}
            hlines={[{ y: 0, color: 'var(--ink-3)', dash: '2 3' }]}
            vlines={[{ x: 0, color: 'var(--ink-3)', dash: '2 3' }]}
          />
        </div>
      </div>
    </SimPanel>
  )
}
