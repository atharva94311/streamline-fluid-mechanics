import { useMemo, useRef, useState, type PointerEvent } from 'react'
import { Md, PlayPause, Plot, Readout, Segmented, SimPanel, Slider, md } from '@/kit'
import { Arrow, fin, useLoop, type P2 } from './shared'

/**
 * Material-derivative probe: follow one fluid particle through a chosen 2-D field and split its acceleration
 *   a = ∂V/∂t (local) + (V·∇)V (convective)
 * along the particle path. All derivatives are analytic (no numerical differentiation).
 */

type Key = 'stag' | 'rot' | 'nozzle' | 'pulse'
type G4 = [number, number, number, number] // ∂u/∂x, ∂u/∂y, ∂v/∂x, ∂v/∂y

interface FieldDef {
  key: Key
  label: string
  steady: boolean
  tex: string
  param: { label: string; min: number; max: number; step: number; unit: string; init: number }
  x: [number, number]
  y: [number, number]
  start: P2
  tMax: (p: number) => number
  vel: (x: number, y: number, t: number, p: number) => P2
  local: (x: number, y: number, t: number, p: number) => P2
  grad: (x: number, y: number, t: number, p: number) => G4
}

const U0N = 0.3 // nozzle: initial speed scale (m/s)
const LN = 1 // nozzle: length scale (m)
const U0P = 0.6 // pulsating: mean speed (m/s)
const PP = 2 // pulsating: period (s)

const FIELDS: FieldDef[] = [
  {
    key: 'stag',
    label: 'Stagnation flow',
    steady: true,
    tex: md`$u = Ax,\;\; v = -Ay$ — steady`,
    param: { label: md`strain rate $A$`, min: 0.3, max: 1.5, step: 0.05, unit: 's⁻¹', init: 0.8 },
    x: [-2, 2],
    y: [0, 2.5],
    start: [0.12, 2.35],
    tMax: () => 6,
    vel: (x, y, _t, A) => [A * x, -A * y],
    local: () => [0, 0],
    grad: (_x, _y, _t, A) => [A, 0, 0, -A],
  },
  {
    key: 'rot',
    label: 'Rigid rotation',
    steady: true,
    tex: md`$u = -\Omega y,\;\; v = \Omega x$ — steady`,
    param: { label: md`angular speed $\Omega$`, min: 0.3, max: 1.5, step: 0.05, unit: 'rad/s', init: 0.8 },
    x: [-2, 2],
    y: [-1.25, 1.25],
    start: [1, 0],
    tMax: (W) => Math.min(9, (2 * Math.PI) / W),
    vel: (x, y, _t, W) => [-W * y, W * x],
    local: () => [0, 0],
    grad: (_x, _y, _t, W) => [0, -W, W, 0],
  },
  {
    key: 'nozzle',
    label: 'Speeding-up converging flow',
    steady: false,
    tex: md`$u = (U_0+\beta t)(1 + x/L),\;\; v = -(U_0+\beta t)\,y/L$ with $U_0 = 0.3$ m/s, $L = 1$ m — unsteady`,
    param: { label: md`ramp rate $\beta$`, min: 0, max: 0.6, step: 0.02, unit: 'm/s²', init: 0.3 },
    x: [-1, 3],
    y: [-1.25, 1.25],
    start: [-0.7, 1.0],
    tMax: () => 5,
    vel: (x, y, t, b) => {
      const S = U0N + b * t
      return [S * (1 + x / LN), (-S * y) / LN]
    },
    local: (x, y, _t, b) => [b * (1 + x / LN), (-b * y) / LN],
    grad: (_x, _y, t, b) => {
      const S = U0N + b * t
      return [S / LN, 0, 0, -S / LN]
    },
  },
  {
    key: 'pulse',
    label: 'Pulsating uniform flow',
    steady: false,
    tex: md`$u = U_0\,[1 + \varepsilon\sin(2\pi t/P)],\;\; v = 0$ with $U_0 = 0.6$ m/s, $P = 2$ s — unsteady`,
    param: { label: md`pulsation amplitude $\varepsilon$`, min: 0, max: 0.9, step: 0.05, unit: '', init: 0.6 },
    x: [0, 4],
    y: [-1.25, 1.25],
    start: [0.2, 0],
    tMax: () => 6,
    vel: (_x, _y, t, e) => [U0P * (1 + e * Math.sin((2 * Math.PI * t) / PP)), 0],
    local: (_x, _y, t, e) => [U0P * e * ((2 * Math.PI) / PP) * Math.cos((2 * Math.PI * t) / PP), 0],
    grad: () => [0, 0, 0, 0],
  },
]

const VW = 480
const VH = 300
const H_STEP = 0.02

interface Sample {
  t: number
  x: number
  y: number
  V: P2
  aL: P2
  aC: P2
}

function trajectory(f: FieldDef, p: number, start: P2): Sample[] {
  const out: Sample[] = []
  let [x, y] = start
  let t = 0
  const tMax = f.tMax(p)
  const sample = () => {
    const V = f.vel(x, y, t, p)
    const aL = f.local(x, y, t, p)
    const [ux, uy, vx, vy] = f.grad(x, y, t, p)
    const aC: P2 = [V[0] * ux + V[1] * uy, V[0] * vx + V[1] * vy]
    out.push({ t, x, y, V, aL, aC })
  }
  sample()
  while (t < tMax - 1e-9) {
    const h = H_STEP
    const k1 = f.vel(x, y, t, p)
    const k2 = f.vel(x + (h / 2) * k1[0], y + (h / 2) * k1[1], t + h / 2, p)
    const k3 = f.vel(x + (h / 2) * k2[0], y + (h / 2) * k2[1], t + h / 2, p)
    const k4 = f.vel(x + h * k3[0], y + h * k3[1], t + h, p)
    x += (h / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0])
    y += (h / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1])
    t += h
    if (!(x >= f.x[0] && x <= f.x[1] && y >= f.y[0] && y <= f.y[1])) break
    sample()
  }
  return out
}

const mag = (v: P2) => Math.hypot(v[0], v[1])
const f2 = (v: number) => (Math.abs(v) < 0.005 ? '0.00' : v.toFixed(2)).replace('-', '−')
const vec = (v: P2) => `(${f2(v[0])}, ${f2(v[1])})`

export function AccelerationProbe() {
  const [key, setKey] = useState<Key>('stag')
  const f = FIELDS.find((q) => q.key === key)!
  const [param, setParam] = useState(f.param.init)
  const [start, setStart] = useState<P2>(f.start)
  const [playing, setPlaying] = useState(true)
  const ref = useRef<HTMLDivElement>(null)

  const traj = useMemo(() => trajectory(f, param, start), [f, param, start])
  const tEnd = traj[traj.length - 1].t
  const { t, setT } = useLoop(ref, Math.max(tEnd, 0.1), { hold: 1, playing })
  const i = Math.min(traj.length - 1, Math.max(0, Math.round(t / H_STEP)))
  const cur = traj[i]
  const aTot: P2 = [cur.aL[0] + cur.aC[0], cur.aL[1] + cur.aC[1]]

  const scale = Math.min(VW / (f.x[1] - f.x[0]), VH / (f.y[1] - f.y[0]))
  const sx = (x: number) => (x - f.x[0]) * scale
  const sy = (y: number) => VH - (y - f.y[0]) * scale

  const aMax = useMemo(() => Math.max(1e-9, ...traj.map((s) => Math.max(mag(s.aL), mag(s.aC), Math.hypot(s.aL[0] + s.aC[0], s.aL[1] + s.aC[1])))), [traj])
  const aScale = 0.75 / aMax // metres of arrow per m/s²

  // quiver at the current time, with ONE length scale for the whole run (so an unsteady field visibly grows/shrinks)
  const grid = useMemo(() => {
    const pts: P2[] = []
    for (let j = 0; j < 7; j++)
      for (let k = 0; k < 11; k++) pts.push([f.x[0] + ((k + 0.5) * (f.x[1] - f.x[0])) / 11, f.y[0] + ((j + 0.5) * (f.y[1] - f.y[0])) / 7])
    return pts
  }, [f])
  const kq = useMemo(() => {
    let vmax = 0
    for (let n = 0; n <= 12; n++) {
      const tn = (tEnd * n) / 12
      for (const [x, y] of grid) {
        const [u, v] = f.vel(x, y, tn, param)
        vmax = Math.max(vmax, Math.hypot(u, v))
      }
    }
    return 0.32 / Math.max(vmax, 0.2)
  }, [f, param, tEnd, grid])
  const quiver = useMemo(
    () => ({
      kq,
      pts: grid.map(([x, y]) => {
        const [u, v] = f.vel(x, y, cur.t, param)
        return { x, y, u: u * kq, v: v * kq }
      }),
    }),
    [f, param, cur.t, grid, kq],
  )

  const pathPts = traj.map((s) => `${fin(sx(s.x)).toFixed(1)},${fin(sy(s.y)).toFixed(1)}`)
  const past = pathPts.slice(0, i + 1).join(' ')
  const all = pathPts.join(' ')

  const choose = (k: Key) => {
    const nf = FIELDS.find((q) => q.key === k)!
    setKey(k)
    setParam(nf.param.init)
    setStart(nf.start)
    setT(0)
    setPlaying(true)
  }
  const onPick = (e: PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    if (!r.width) return
    const px = ((e.clientX - r.left) / r.width) * VW
    const py = ((e.clientY - r.top) / r.height) * VH
    const x = f.x[0] + px / scale
    const y = f.y[0] + (VH - py) / scale
    if (x > f.x[0] && x < f.x[1] && y > f.y[0] && y < f.y[1]) {
      setStart([+x.toFixed(2), +y.toFixed(2)])
      setT(0)
      setPlaying(true)
    }
  }

  const P: P2 = [sx(cur.x), sy(cur.y)]
  const L1: P2 = [P[0] + cur.aL[0] * aScale * scale, P[1] - cur.aL[1] * aScale * scale]
  const L2: P2 = [L1[0] + cur.aC[0] * aScale * scale, L1[1] - cur.aC[1] * aScale * scale]
  const Vtip: P2 = [P[0] + cur.V[0] * quiver.kq * 1.6 * scale, P[1] - cur.V[1] * quiver.kq * 1.6 * scale]

  const ymax = aMax * 1.12

  return (
    <SimPanel
      wide
      title="Material-derivative probe"
      subtitle={md`follow one particle: $\mathbf a = \pd{\mathbf V}{t} + (\mathbf V\cdot\nabla)\mathbf V$`}
      controls={
        <>
          <Segmented
            label="Velocity field"
            options={FIELDS.map((q) => ({ value: q.key, label: q.label }))}
            value={key}
            onChange={choose}
          />
          <Slider label={f.param.label} value={param} min={f.param.min} max={f.param.max} step={f.param.step} unit={f.param.unit} digits={2} onChange={(v) => { setParam(v); setT(0) }} />
          <div className="grid grid-cols-2 gap-x-3">
            <Slider label={md`start $x_0$`} value={start[0]} min={f.x[0] + 0.05} max={f.x[1] - 0.05} step={0.05} unit="m" digits={2} onChange={(v) => { setStart([v, start[1]]); setT(0) }} />
            <Slider label={md`start $y_0$`} value={start[1]} min={f.y[0] + 0.05} max={f.y[1] - 0.05} step={0.05} unit="m" digits={2} onChange={(v) => { setStart([start[0], v]); setT(0) }} />
          </div>
          <PlayPause playing={playing} onToggle={() => setPlaying((p) => !p)} onReset={() => setT(0)} />
        </>
      }
      readout={
        <Readout
          items={[
            { label: md`time $t$`, value: `${cur.t.toFixed(2)} s` },
            { label: md`speed $|\mathbf V|$`, value: mag(cur.V), unit: 'm/s' },
            { label: md`local $\partial\mathbf V/\partial t$`, value: vec(cur.aL), unit: 'm/s²', tone: mag(cur.aL) < 1e-9 ? 'default' : 'accent' },
            { label: md`convective $(\mathbf V\cdot\nabla)\mathbf V$`, value: vec(cur.aC), unit: 'm/s²', tone: mag(cur.aC) < 1e-9 ? 'default' : 'accent' },
            { label: md`total $\mathbf a$`, value: vec(aTot), unit: 'm/s²' },
            { label: md`$|\mathbf a|$`, value: mag(aTot), unit: 'm/s²', tone: 'good' },
          ]}
        />
      }
      footer={
        <span>
          <b>Try this:</b> in the steady stagnation flow the local term (amber) is zero all the way, yet the particle accelerates
          strongly — all of it is convective. Switch to the pulsating uniform flow: now the convective term vanishes and only the
          local term is left. The speeding-up converging flow needs both. Click the picture to release the particle elsewhere.
        </span>
      }
    >
      <div ref={ref} className="space-y-3">
        <div className="text-sm text-ink-2">
          <Md inline>{f.tex}</Md>
        </div>
        <svg
          viewBox={`0 0 ${VW} ${VH}`}
          className="block h-auto w-full cursor-crosshair touch-manipulation rounded-xl border border-line"
          role="img"
          aria-label="particle path with acceleration vectors"
          onPointerDown={onPick}
        >
          <rect x={0} y={0} width={VW} height={VH} fill="var(--field-bg)" />
          {quiver.pts.map((q, k) => (
            <Arrow
              key={k}
              x1={sx(q.x - q.u / 2)}
              y1={sy(q.y - q.v / 2)}
              x2={sx(q.x + q.u / 2)}
              y2={sy(q.y + q.v / 2)}
              color="var(--quiver)"
              width={1.1}
              head={5}
              opacity={0.45}
            />
          ))}
          <polyline points={all} fill="none" stroke="var(--ink-3)" strokeWidth={1.2} strokeDasharray="3 4" />
          <polyline points={past} fill="none" stroke="var(--streamline)" strokeWidth={2.2} />
          <circle cx={sx(start[0])} cy={sy(start[1])} r={3.5} fill="none" stroke="var(--ink-2)" strokeWidth={1.5} />
          <Arrow x1={P[0]} y1={P[1]} x2={Vtip[0]} y2={Vtip[1]} color="var(--ink-2)" width={2} head={8} />
          <Arrow x1={P[0]} y1={P[1]} x2={L1[0]} y2={L1[1]} color="var(--plot-3)" width={2.6} head={8} />
          <Arrow x1={L1[0]} y1={L1[1]} x2={L2[0]} y2={L2[1]} color="var(--plot-2)" width={2.6} head={8} />
          <Arrow x1={P[0]} y1={P[1]} x2={L2[0]} y2={L2[1]} color="var(--plot-4)" width={2.2} head={9} dash="5 3" />
          <circle cx={P[0]} cy={P[1]} r={5.5} fill="var(--ink)" stroke="var(--surface)" strokeWidth={2} />
          <text x={8} y={16} fontSize={11.5} className="fill-ink-3">
            x: {f.x[0]} … {f.x[1]} m · y: {f.y[0]} … {f.y[1]} m
          </text>
        </svg>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11.5px] text-ink-3">
          <span className="inline-flex items-center gap-1.5"><span className="inline-block h-1 w-5 rounded" style={{ background: 'var(--ink-2)' }} /> velocity V</span>
          <span className="inline-flex items-center gap-1.5"><span className="inline-block h-1 w-5 rounded" style={{ background: 'var(--plot-3)' }} /> local ∂V/∂t</span>
          <span className="inline-flex items-center gap-1.5"><span className="inline-block h-1 w-5 rounded" style={{ background: 'var(--plot-2)' }} /> convective (V·∇)V (drawn tip-to-tail)</span>
          <span className="inline-flex items-center gap-1.5"><span className="inline-block h-1 w-5 rounded" style={{ background: 'var(--plot-4)' }} /> total a</span>
        </div>
        <Plot
          height={210}
          x={{ label: 'time following the particle, $t$ (s)', domain: [0, Math.max(tEnd, 0.1)] }}
          y={{ label: 'acceleration (m/s²)', domain: [0, ymax] }}
          series={[
            { label: md`$|\partial\mathbf V/\partial t|$ local`, points: traj.map((s) => [s.t, mag(s.aL)] as [number, number]), color: 'var(--plot-3)' },
            { label: md`$|(\mathbf V\cdot\nabla)\mathbf V|$ convective`, points: traj.map((s) => [s.t, mag(s.aC)] as [number, number]), color: 'var(--plot-2)' },
            { label: md`$|\mathbf a|$ total`, points: traj.map((s) => [s.t, Math.hypot(s.aL[0] + s.aC[0], s.aL[1] + s.aC[1])] as [number, number]), color: 'var(--plot-4)', dash: '6 4' },
          ]}
          vlines={[{ x: cur.t, color: 'var(--ink-3)' }]}
        />
      </div>
    </SimPanel>
  )
}
