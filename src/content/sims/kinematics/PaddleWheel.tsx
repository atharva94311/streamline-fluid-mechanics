import { useMemo, useRef, useState, type PointerEvent } from 'react'
import { Md, Readout, Segmented, SimPanel, Slider, md, useAnimationFrame, useInView, usePrefersReducedMotion } from '@/kit'
import { Arrow, fin, type P2 } from './shared'

/**
 * "Paddle-wheel" vorticity probe. A tiny rigid paddle wheel carried by the flow spins at the local fluid
 * rotation rate ω_z = ½(∂v/∂x − ∂u/∂y). Two material lines (initially along x and y) are carried with it; at release
 * they turn at ∂v/∂x (counter-clockwise +) and ∂u/∂y (clockwise +), whose average is ω_z. Later they shear apart
 * (they no longer stay perpendicular) while the paddle keeps turning at ω_z.
 */

type Key = 'couette' | 'forced' | 'free' | 'stag'
type G4 = [number, number, number, number] // ∂u/∂x, ∂u/∂y, ∂v/∂x, ∂v/∂y

interface Flow {
  key: Key
  label: string
  tex: string
  param: { label: string; min: number; max: number; step: number; unit: string; init: number }
  start: P2
  vel: (x: number, y: number, p: number) => P2
  grad: (x: number, y: number, p: number) => G4
}

const X0 = -2
const X1 = 2
const Y0 = -1.4
const Y1 = 1.4
const VW = 480
const VH = 336
const SC = VW / (X1 - X0)
const sx = (x: number) => (x - X0) * SC
const sy = (y: number) => VH - (y - Y0) * SC

const FLOWS: Flow[] = [
  {
    key: 'couette',
    label: 'Couette shear',
    tex: md`$u = k\,(y - y_{\mathrm{wall}}),\; v = 0$ — straight streamlines, $\zeta_z = -k$`,
    param: { label: md`shear rate $k$`, min: 0.2, max: 1.2, step: 0.05, unit: 's⁻¹', init: 0.6 },
    start: [-1.6, 0.1],
    vel: (_x, y, k) => [k * (y - Y0), 0],
    grad: (_x, _y, k) => [0, k, 0, 0],
  },
  {
    key: 'forced',
    label: 'Forced vortex',
    tex: md`$u = -\Omega y,\; v = \Omega x$ — rigid-body rotation, $\zeta_z = 2\Omega$`,
    param: { label: md`angular speed $\Omega$`, min: 0.2, max: 1.2, step: 0.05, unit: 'rad/s', init: 0.6 },
    start: [0.9, 0],
    vel: (x, y, W) => [-W * y, W * x],
    grad: (_x, _y, W) => [0, -W, W, 0],
  },
  {
    key: 'free',
    label: 'Free vortex',
    tex: md`$v_\theta = K/r$, i.e. $u = -Ky/r^2,\; v = Kx/r^2$ — $\zeta_z = 0$ for $r > 0$`,
    param: { label: md`strength $K$`, min: 0.2, max: 1, step: 0.05, unit: 'm²/s', init: 0.5 },
    start: [0.9, 0],
    vel: (x, y, K) => {
      const r2 = x * x + y * y
      return [(-K * y) / r2, (K * x) / r2]
    },
    grad: (x, y, K) => {
      const r2 = x * x + y * y
      const r4 = r2 * r2
      return [(2 * K * x * y) / r4, (-K * (x * x - y * y)) / r4, (K * (y * y - x * x)) / r4, (-2 * K * x * y) / r4]
    },
  },
  {
    key: 'stag',
    label: 'Stagnation flow',
    tex: md`$u = Ax,\; v = -Ay$ — strongly deforming, yet $\zeta_z = 0$`,
    param: { label: md`strain rate $A$`, min: 0.2, max: 1.2, step: 0.05, unit: 's⁻¹', init: 0.5 },
    start: [0.1, 1.25],
    vel: (x, y, A) => [A * x, -A * y],
    grad: (_x, _y, A) => [A, 0, 0, -A],
  },
]

interface Probe {
  x: number
  y: number
  th: number // paddle angle (rad, CCW +)
  e1: P2 // material line initially along x
  e2: P2 // material line initially along y
  turned: number // paddle rotation since release (rad)
  orbit: number // polar-angle change of the probe position (rad)
}

const fresh = (p: P2): Probe => ({ x: p[0], y: p[1], th: 0, e1: [1, 0], e2: [0, 1], turned: 0, orbit: 0 })
const norm = (v: P2): P2 => {
  const l = Math.hypot(v[0], v[1]) || 1
  return [v[0] / l, v[1] / l]
}

function streamlines(key: Key): string[] {
  const out: string[] = []
  if (key === 'couette') {
    for (let y = -1.2; y <= 1.21; y += 0.4) out.push(`M${sx(X0)} ${sy(y)}H${sx(X1)}`)
  } else if (key === 'forced' || key === 'free') {
    for (const r of [0.3, 0.6, 0.9, 1.2, 1.5, 1.8]) out.push(`M${sx(r)} ${sy(0)}A${r * SC} ${r * SC} 0 1 0 ${sx(-r)} ${sy(0)}A${r * SC} ${r * SC} 0 1 0 ${sx(r)} ${sy(0)}`)
  } else {
    for (const c of [0.06, 0.2, 0.45, 0.8, 1.3]) {
      for (const sgnX of [1, -1])
        for (const sgnY of [1, -1]) {
          const pts: string[] = []
          for (let i = 0; i <= 60; i++) {
            const x = 0.02 + (i / 60) * 2
            const y = c / x
            if (y > 1.45) continue
            pts.push(`${sx(sgnX * x).toFixed(1)},${sy(sgnY * y).toFixed(1)}`)
          }
          if (pts.length > 1) out.push(`M${pts.join('L')}`)
        }
    }
    out.push(`M${sx(X0)} ${sy(0)}H${sx(X1)}`, `M${sx(0)} ${sy(Y0)}V${sy(Y1)}`)
  }
  return out
}

export function PaddleWheel() {
  const [key, setKey] = useState<Key>('free')
  const flow = FLOWS.find((f) => f.key === key)!
  const [param, setParam] = useState(flow.param.init)
  const [start, setStart] = useState<P2>(flow.start)
  const probe = useRef<Probe>(fresh(flow.start))
  const [, setTick] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref)
  const reduced = usePrefersReducedMotion()
  const [playing, setPlaying] = useState(true)

  const release = (p: P2) => {
    probe.current = fresh(p)
    setTick((t) => t + 1)
  }

  useAnimationFrame(
    (dt) => {
      const P = probe.current
      const n = 4
      const h = dt / n
      for (let k = 0; k < n; k++) {
        const v1 = flow.vel(P.x, P.y, param)
        const v2 = flow.vel(P.x + (h / 2) * v1[0], P.y + (h / 2) * v1[1], param)
        const v3 = flow.vel(P.x + (h / 2) * v2[0], P.y + (h / 2) * v2[1], param)
        const v4 = flow.vel(P.x + h * v3[0], P.y + h * v3[1], param)
        const nx = P.x + (h / 6) * (v1[0] + 2 * v2[0] + 2 * v3[0] + v4[0])
        const ny = P.y + (h / 6) * (v1[1] + 2 * v2[1] + 2 * v3[1] + v4[1])
        const [ux, uy, vx, vy] = flow.grad((P.x + nx) / 2, (P.y + ny) / 2, param)
        const wz = 0.5 * (vx - uy)
        P.th += wz * h
        P.turned += wz * h
        P.e1 = norm([P.e1[0] + h * (ux * P.e1[0] + uy * P.e1[1]), P.e1[1] + h * (vx * P.e1[0] + vy * P.e1[1])])
        P.e2 = norm([P.e2[0] + h * (ux * P.e2[0] + uy * P.e2[1]), P.e2[1] + h * (vx * P.e2[0] + vy * P.e2[1])])
        let dphi = Math.atan2(ny, nx) - Math.atan2(P.y, P.x)
        if (dphi > Math.PI) dphi -= 2 * Math.PI
        if (dphi < -Math.PI) dphi += 2 * Math.PI
        P.orbit += dphi
        P.x = nx
        P.y = ny
        if (key === 'couette' && P.x > X1) P.x -= X1 - X0
        const out = !(P.x >= X0 && P.x <= X1 && P.y >= Y0 && P.y <= Y1) || (key === 'free' && Math.hypot(P.x, P.y) < 0.12)
        if (out || !Number.isFinite(P.x) || !Number.isFinite(P.y)) {
          probe.current = fresh(start)
          break
        }
      }
      setTick((t) => (t + 1) % 1000000)
    },
    playing && inView && !reduced,
  )

  const lines = useMemo(() => streamlines(key), [key])
  const quiver = useMemo(() => {
    const out: { x: number; y: number; u: number; v: number }[] = []
    let vmax = 0
    for (let j = 0; j < 6; j++)
      for (let i = 0; i < 9; i++) {
        const x = X0 + ((i + 0.5) * (X1 - X0)) / 9
        const y = Y0 + ((j + 0.5) * (Y1 - Y0)) / 6
        if (key === 'free' && Math.hypot(x, y) < 0.3) continue
        const [u, v] = flow.vel(x, y, param)
        vmax = Math.max(vmax, Math.hypot(u, v))
        out.push({ x, y, u, v })
      }
    const k = 0.3 / Math.max(vmax, 0.1)
    return out.map((q) => {
      const s = Math.hypot(q.u, q.v) * k
      const f = s > 0.36 ? 0.36 / s : 1
      return { ...q, u: q.u * k * f, v: q.v * k * f }
    })
  }, [flow, key, param])

  const P = probe.current
  const [ux, uy, vx, vy] = flow.grad(P.x, P.y, param)
  const zeta = vx - uy
  const px = sx(P.x)
  const py = sy(P.y)
  const blade = 21
  const ml = 30

  const choose = (k: Key) => {
    const f = FLOWS.find((q) => q.key === k)!
    setKey(k)
    setParam(f.param.init)
    setStart(f.start)
    probe.current = fresh(f.start)
    setPlaying(true)
  }
  const onPick = (e: PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    if (!r.width) return
    const x = X0 + (((e.clientX - r.left) / r.width) * VW) / SC
    const y = Y0 + (VH - ((e.clientY - r.top) / r.height) * VH) / SC
    if (key === 'free' && Math.hypot(x, y) < 0.2) return
    const p: P2 = [+x.toFixed(2), +y.toFixed(2)]
    setStart(p)
    release(p)
    setPlaying(true)
  }

  const tint =
    key === 'couette' ? { fill: 'var(--plot-4)', text: 'ζ < 0 everywhere (clockwise)' } : key === 'forced' ? { fill: 'var(--plot-1)', text: 'ζ > 0 everywhere (counter-clockwise)' } : null
  const deg = (r: number) => `${((r * 180) / Math.PI).toFixed(0).replace('-', '−')}°`

  return (
    <SimPanel
      wide
      title="Paddle-wheel vorticity probe"
      subtitle="drop a tiny paddle wheel into four flows"
      controls={
        <>
          <Segmented label="Flow" options={FLOWS.map((f) => ({ value: f.key, label: f.label }))} value={key} onChange={choose} />
          <Slider label={flow.param.label} value={param} min={flow.param.min} max={flow.param.max} step={flow.param.step} unit={flow.param.unit} digits={2} onChange={setParam} />
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-primary bg-teal-600 hover:bg-teal-700" onClick={() => release(start)}>
              Release probe again
            </button>
            <button type="button" className="btn-ghost" onClick={() => setPlaying((p) => !p)}>
              {playing ? 'Pause' : 'Play'}
            </button>
          </div>
          <p className="text-xs text-ink-3">Click (or tap) inside the flow to release the probe at that point.</p>
        </>
      }
      readout={
        <Readout
          items={[
            { label: md`vorticity $\zeta_z$`, value: fin(zeta), unit: 's⁻¹', tone: Math.abs(zeta) < 1e-6 ? 'good' : 'accent' },
            { label: md`paddle spin $\omega_z$`, value: fin(0.5 * zeta), unit: 'rad/s' },
            { label: md`$\omega_{OA} = \partial v/\partial x$`, value: fin(vx), unit: 'rad/s' },
            { label: md`$\omega_{OB} = \partial u/\partial y$`, value: fin(uy), unit: 'rad/s' },
            { label: 'paddle turned', value: deg(P.turned) },
            { label: 'probe orbited', value: key === 'forced' || key === 'free' ? deg(P.orbit) : '—' },
          ]}
        />
      }
      footer={
        <span>
          <b>Try this:</b> in the <i>free vortex</i> the probe circles the centre but its amber blade keeps pointing the same way —
          the flow is irrotational. In the <i>forced vortex</i> the blade turns once per orbit. In <i>Couette shear</i> the
          streamlines are straight, yet the paddle spins clockwise at k/2. Just after each release the paddle turns at the average
          rate of the two coloured material lines; later the lines shear apart while the paddle keeps turning at ω<sub>z</sub>.
        </span>
      }
    >
      <div ref={ref} className="space-y-2">
        <div className="text-sm text-ink-2">
          <Md inline>{flow.tex}</Md>
        </div>
        <svg
          viewBox={`0 0 ${VW} ${VH}`}
          className="block h-auto w-full cursor-crosshair touch-manipulation rounded-xl border border-line"
          role="img"
          aria-label="paddle wheel carried by the flow"
          onPointerDown={onPick}
        >
          <rect x={0} y={0} width={VW} height={VH} fill="var(--field-bg)" />
          {tint ? <rect x={0} y={0} width={VW} height={VH} fill={tint.fill} fillOpacity={0.07} /> : null}
          {key === 'free' ? <circle cx={sx(0)} cy={sy(0)} r={0.12 * SC} fill="var(--plot-1)" fillOpacity={0.35} /> : null}
          {lines.map((d, i) => (
            <path key={i} d={d} fill="none" stroke="var(--streamline)" strokeOpacity={0.45} strokeWidth={1.2} />
          ))}
          {quiver.map((q, i) => (
            <Arrow key={i} x1={sx(q.x - q.u / 2)} y1={sy(q.y - q.v / 2)} x2={sx(q.x + q.u / 2)} y2={sy(q.y + q.v / 2)} color="var(--quiver)" width={1.1} head={5} opacity={0.5} />
          ))}
          {key === 'couette' ? (
            <g>
              <rect x={0} y={VH - 5} width={VW} height={5} fill="var(--body-fill)" />
              <rect x={0} y={0} width={VW} height={5} fill="var(--body-fill)" />
              <text x={VW - 8} y={18} textAnchor="end" fontSize={11} className="fill-ink-3">
                moving wall →
              </text>
              <text x={VW - 8} y={VH - 10} textAnchor="end" fontSize={11} className="fill-ink-3">
                fixed wall
              </text>
            </g>
          ) : null}
          {/* material lines (deforming) */}
          <line x1={px} y1={py} x2={px + ml * P.e1[0]} y2={py - ml * P.e1[1]} stroke="var(--plot-1)" strokeWidth={2.4} strokeLinecap="round" />
          <line x1={px} y1={py} x2={px + ml * P.e2[0]} y2={py - ml * P.e2[1]} stroke="var(--plot-4)" strokeWidth={2.4} strokeLinecap="round" />
          {/* rigid paddle wheel */}
          <circle cx={px} cy={py} r={blade + 3} fill="var(--surface)" fillOpacity={0.35} stroke="var(--ink-3)" strokeWidth={0.8} />
          {[0, 1, 2, 3].map((k) => {
            const a = P.th + (k * Math.PI) / 2
            return (
              <line
                key={k}
                x1={px}
                y1={py}
                x2={px + blade * Math.cos(a)}
                y2={py - blade * Math.sin(a)}
                stroke={k === 0 ? 'var(--plot-3)' : 'var(--ink)'}
                strokeWidth={k === 0 ? 3.4 : 2.2}
                strokeLinecap="round"
              />
            )
          })}
          <circle cx={px} cy={py} r={3.5} fill="var(--ink)" />
          <text x={8} y={18} fontSize={11} className="fill-ink-3">
            x: −2 … 2 m · y: −1.4 … 1.4 m
          </text>
          {tint ? (
            <text x={8} y={VH - 12} fontSize={11.5} className="fill-ink-2">
              {tint.text}
            </text>
          ) : (
            <text x={8} y={VH - 12} fontSize={11.5} className="fill-ink-2">
              {key === 'free' ? 'ζ = 0 everywhere except the core (shaded)' : 'ζ = 0 everywhere'}
            </text>
          )}
        </svg>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11.5px] text-ink-3">
          <span className="inline-flex items-center gap-1.5"><span className="inline-block h-1 w-5 rounded" style={{ background: 'var(--plot-3)' }} /> reference blade of the rigid paddle wheel</span>
          <span className="inline-flex items-center gap-1.5"><span className="inline-block h-1 w-5 rounded" style={{ background: 'var(--plot-1)' }} /> material line, initially along x (like OA)</span>
          <span className="inline-flex items-center gap-1.5"><span className="inline-block h-1 w-5 rounded" style={{ background: 'var(--plot-4)' }} /> material line, initially along y (like OB)</span>
        </div>
      </div>
    </SimPanel>
  )
}
