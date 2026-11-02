import { useMemo, useState } from 'react'
import { md, Plot, Segmented, SimPanel, Slider, num, useUid } from '@/kit'
import { bodyPoint, bodyR, mirror, sampleCurve, surfaceSpeed2, thetaAtX, THETA_VMAX, THETA_V_EQ_U, toPath, VMAX_RATIO, type Box, type Pt } from './halfbody'
import { ArrowLine, Label, useFrame } from './svg'
import { Tiles } from './Tiles'

const DEG = 180 / Math.PI

/** Surface distributions V/U and C_p versus x/b (upper surface; the lower one is identical). */
export function SurfaceCpPlot() {
  const pts = useMemo(() => {
    const tFar = thetaAtX(1, 12.5)
    const vu: [number, number][] = []
    const cp: [number, number][] = []
    const N = 420
    for (let i = 0; i <= N; i++) {
      const t = Math.PI - ((Math.PI - tFar) * i) / N
      const [x] = bodyPoint(1, t)
      const v2 = surfaceSpeed2(t)
      vu.push([x, Math.sqrt(Math.max(0, v2))])
      cp.push([x, 1 - v2])
    }
    return { vu, cp }
  }, [])
  const xMax = bodyPoint(1, THETA_VMAX)[0]
  return (
    <Plot
      x={{ label: '$x/b$ along the body surface (nose at $-1$, source at $0$)', domain: [-1.5, 12] }}
      y={{ label: '$V/U$ and $C_p$', domain: [-0.8, 1.35] }}
      series={[
        { label: '$V/U$ on the surface', points: pts.vu, color: 'var(--plot-1)', width: 2.4 },
        { label: '$C_p = 1 - V^2/U^2$', points: pts.cp, color: 'var(--plot-4)', width: 2.4 },
      ]}
      hlines={[{ y: 0, color: 'var(--axis)' }, { y: 1, color: 'var(--grid)', dash: '2 4' }]}
      vlines={[
        { x: -0.5, label: 'V = U', color: 'var(--plot-5)' },
        { x: xMax, label: 'Vmax', color: 'var(--plot-3)' },
      ]}
      marks={[
        { x: -1, y: 1, label: 'Cp = 1 (nose)', color: 'var(--plot-4)' },
        { x: xMax, y: VMAX_RATIO, label: '1.26U', color: 'var(--plot-1)' },
        { x: xMax, y: 1 - VMAX_RATIO ** 2, label: '−0.587', color: 'var(--plot-4)' },
      ]}
      height={300}
    />
  )
}

/** Speed and C_p along the stagnation streamline (negative x-axis): V/U = 1 − b/r. */
export function AxisCpPlot() {
  return (
    <Plot
      x={{ label: md`$x/b$ on the upstream axis ($\theta = \pi$)`, domain: [-12, -1] }}
      y={{ label: '$V/U$ and $C_p$', domain: [0, 1.05] }}
      series={[
        { label: '$V/U = 1 - b/r$', fn: (x) => 1 + 1 / x, color: 'var(--plot-1)', width: 2.4 },
        { label: '$C_p = 1 - (1 - b/r)^2$', fn: (x) => 1 - (1 + 1 / x) ** 2, color: 'var(--plot-4)', width: 2.4 },
      ]}
      marks={[
        { x: -2, y: 0.5, label: 'V = U/2', color: 'var(--plot-1)' },
        { x: -2, y: 0.75, label: 'Cp = 0.75', color: 'var(--plot-4)' },
        { x: -10, y: 0.9, label: 'V = 0.9U', color: 'var(--plot-1)' },
      ]}
      height={260}
    />
  )
}

/* ---------- pressure arrows on the body ---------- */

const PX: [number, number] = [-3.4, 9.4]
const PY: [number, number] = [-4.3, 4.3]
const PBOX: Box = [PX[0], PX[1], PY[0], PY[1]]

/** Arrows normal to the body, length ∝ |C_p|: pointing in where p > p₀, pointing out (suction) where p < p₀. */
export function PressureArrows() {
  const f = useFrame(PX, PY, 380)
  const clip = useUid('pa')
  const geo = useMemo(() => {
    const tFar = thetaAtX(1, PX[1] + 1)
    const upper = sampleCurve((t) => bodyPoint(1, t), tFar, Math.PI, PBOX, 0.02)
    // arc-length stations from the nose
    const N = 3000
    const tEnd = thetaAtX(1, 8.6)
    let s = 0
    let prev = bodyPoint(1, Math.PI)
    const stations: { t: number; s: number }[] = [{ t: Math.PI, s: 0 }]
    for (let i = 1; i <= N; i++) {
      const t = Math.PI - ((Math.PI - tEnd) * i) / N
      const p = bodyPoint(1, t)
      s += Math.hypot(p[0] - prev[0], p[1] - prev[1])
      stations.push({ t, s })
      prev = p
    }
    const total = s
    const nArrows = 15
    const arrows: { p: Pt; n: Pt; cp: number }[] = []
    let idx = 0
    for (let a = 0; a < nArrows; a++) {
      const target = (total * a) / (nArrows - 1)
      while (idx < stations.length - 1 && stations[idx].s < target) idx++
      const t = stations[idx].t
      const d = 1e-4
      const p1 = bodyPoint(1, Math.min(Math.PI + d, t + d))
      const p2 = bodyPoint(1, t - d)
      const tx = p2[0] - p1[0]
      const ty = p2[1] - p1[1]
      const L = Math.hypot(tx, ty) || 1
      arrows.push({ p: bodyPoint(1, t), n: [-ty / L, tx / L], cp: 1 - surfaceSpeed2(t) })
    }
    return { outline: [...upper, ...mirror(upper).reverse().slice(1)], arrows }
  }, [])
  const { sx, sy, W, H } = f
  const scale = 1.25
  const draw = (p: Pt, n: Pt, cp: number, key: string) => {
    if (Math.abs(cp) < 0.03) return null
    const L = scale * Math.abs(cp)
    const out: Pt = [p[0] + n[0] * L, p[1] + n[1] * L]
    const pos = cp > 0
    const col = pos ? 'var(--plot-4)' : 'var(--plot-2)'
    return pos ? (
      <ArrowLine key={key} x1={sx(out[0])} y1={sy(out[1])} x2={sx(p[0])} y2={sy(p[1])} color={col} width={2} head={8} />
    ) : (
      <ArrowLine key={key} x1={sx(p[0])} y1={sy(p[1])} x2={sx(out[0])} y2={sy(out[1])} color={col} width={2} head={8} />
    )
  }
  const pEq = bodyPoint(1, THETA_V_EQ_U)
  const pMax = bodyPoint(1, THETA_VMAX)
  return (
    <div ref={f.ref} className="w-full">
      <svg width={W} height={H} className="mx-auto block" role="img" aria-label="Pressure distribution on the half-body: compression at the nose, suction on the shoulders">
        <defs>
          <clipPath id={clip}>
            <rect x={sx(PX[0])} y={0} width={sx(PX[1]) - sx(PX[0])} height={H} />
          </clipPath>
        </defs>
        <rect x={sx(PX[0])} y={0} width={sx(PX[1]) - sx(PX[0])} height={H} fill="var(--field-bg)" stroke="var(--line)" rx={8} />
        <g clipPath={`url(#${clip})`}>
          <path d={toPath(geo.outline, sx, sy, true)} fill="var(--body-fill)" stroke="var(--ink-3)" strokeWidth={1.6} />
          <line x1={sx(PX[0])} x2={sx(-1)} y1={sy(0)} y2={sy(0)} stroke="var(--streamline)" strokeWidth={1.2} strokeDasharray="5 4" />
          {geo.arrows.map((a, i) => draw(a.p, a.n, a.cp, `u${i}`))}
          {geo.arrows.slice(1).map((a, i) => draw([a.p[0], -a.p[1]], [a.n[0], -a.n[1]], a.cp, `l${i}`))}
          <circle cx={sx(pEq[0])} cy={sy(pEq[1])} r={3.5} fill="var(--plot-5)" stroke="var(--surface)" strokeWidth={1.2} />
          <circle cx={sx(pMax[0])} cy={sy(pMax[1])} r={3.5} fill="var(--plot-3)" stroke="var(--surface)" strokeWidth={1.2} />
        </g>
        <circle cx={sx(0)} cy={sy(0)} r={3.5} fill="var(--surface)" stroke="var(--ink)" strokeWidth={1.3} />
        <Label x={sx(-1) - 4} y={sy(0) + 16} anchor="end" size={11}>
          S: Cp = +1
        </Label>
        <Label x={sx(pEq[0]) - 8} y={sy(pEq[1]) - 8} anchor="end" size={11} className="fill-emerald-700 dark:fill-emerald-300">
          V = U, Cp = 0 (x = −b/2)
        </Label>
        <Label x={sx(pMax[0]) + 8} y={sy(pMax[1]) - 34} size={11} className="fill-amber-700 dark:fill-amber-300">
          V ≈ 1.26U, Cp ≈ −0.59
        </Label>
      </svg>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-[11px] text-ink-3">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-5 rounded" style={{ background: 'var(--plot-4)' }} /> p &gt; p₀: pushes on the body
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-5 rounded" style={{ background: 'var(--plot-2)' }} /> p &lt; p₀: suction
        </span>
        <span>arrow length ∝ |Cp| · lengths in units of b</span>
      </div>
    </div>
  )
}

/* ---------- interactive surface explorer ---------- */

const EX: [number, number] = [-2.6, 6.6]
const EY: [number, number] = [-0.7, 4.3]
const EBOX: Box = [EX[0], EX[1], EY[0], EY[1]]
const FLUIDS = { water: { rho: 998, pv: 2340, name: 'water' }, air: { rho: 1.2, pv: -Infinity, name: 'air' } } as const
type Fluid = keyof typeof FLUIDS

export function SurfaceExplorer() {
  const [deg, setDeg] = useState(63)
  const [U, setU] = useState(2)
  const [m, setM] = useState(3)
  const [fluid, setFluid] = useState<Fluid>('water')
  const [p0k, setP0k] = useState(101.3)
  const f = useFrame(EX, EY, 300)
  const clip = useUid('se')
  const curves = useMemo(() => {
    const tFar = thetaAtX(1, EX[1] + 1)
    const upper = sampleCurve((t) => bodyPoint(1, t), tFar, Math.PI, EBOX, 0.02)
    return { upper, fill: [...upper, [EX[1] + 1, 0] as Pt] }
  }, [])

  const t = (deg * Math.PI) / 180
  const b = m / (2 * Math.PI * U)
  const rB = bodyR(1, t) // r/b
  const r = rB * b
  const [xb, yb] = bodyPoint(1, t)
  const vr = U * Math.cos(t) + m / (2 * Math.PI * r)
  const vt = -U * Math.sin(t)
  const V = Math.hypot(vr, vt)
  const ratio = V / U
  const cp = 1 - ratio * ratio
  const { rho, pv } = FLUIDS[fluid]
  const dp = 0.5 * rho * U * U * cp
  const p = p0k * 1000 + dp
  const cavitating = p < pv

  const { sx, sy, W, H, k } = f
  // velocity arrows at P (scale: U ↦ 1.3 b)
  const S = 1.3
  const er: Pt = [Math.cos(t), Math.sin(t)]
  const et: Pt = [-Math.sin(t), Math.cos(t)]
  const P: Pt = [xb, yb]
  const tipR: Pt = [P[0] + S * (vr / U) * er[0], P[1] + S * (vr / U) * er[1]]
  const tipT: Pt = [P[0] + S * (vt / U) * et[0], P[1] + S * (vt / U) * et[1]]
  const tipV: Pt = [P[0] + S * ((vr * er[0] + vt * et[0]) / U), P[1] + S * ((vr * er[1] + vt * et[1]) / U)]
  const arcR = Math.min(0.75, 0.6 * rB)
  const arcEnd: Pt = [arcR * Math.cos(t), arcR * Math.sin(t)]

  return (
    <SimPanel
      title="Surface speed & pressure explorer"
      subtitle="slide 18 evaluated on the body r = b(π − θ)/sin θ"
      controls={
        <>
          <Slider label="position on the body $\theta$" value={deg} min={1} max={180} step={0.5} onChange={setDeg} unit="°" digits={3} />
          <Slider label="free-stream speed $U$" value={U} min={0.5} max={40} step={0.1} onChange={setU} unit="m/s" digits={3} />
          <Slider label="source strength $m$" value={m} min={0.2} max={20} step={0.1} onChange={setM} unit="m²/s" digits={3} />
          <Segmented
            label="fluid"
            value={fluid}
            onChange={setFluid}
            options={[
              { value: 'water', label: 'water ρ = 998' },
              { value: 'air', label: 'air ρ = 1.2' },
            ]}
          />
          <Slider label="free-stream pressure $p_0$ (absolute)" value={p0k} min={80} max={300} step={0.1} onChange={setP0k} unit="kPa" digits={4} />
        </>
      }
      readout={
        <Tiles
          cols={2}
          items={[
            { label: md`$r$ on body`, value: r, unit: 'm' },
            { label: md`$(x,\,y)$`, value: `(${num.fmt(xb * b, 3)}, ${num.fmt(yb * b, 3)})`, unit: 'm' },
            { label: md`$v_r = U\cos\theta + m/2\pi r$`, value: vr, unit: 'm/s' },
            { label: md`$v_\theta = -U\sin\theta$`, value: vt, unit: 'm/s' },
            { label: md`$V$`, value: V, unit: 'm/s', tone: 'accent' },
            { label: md`$V/U$`, value: ratio },
            { label: md`$C_p = 1 - V^2/U^2$`, value: cp, tone: cp >= 0 ? 'default' : 'accent' },
            { label: md`$p - p_0$`, value: dp, unit: 'Pa' },
            { label: md`$p$ (absolute)`, value: p / 1000, unit: 'kPa', digits: 4, tone: cavitating ? 'bad' : 'good' },
            { label: md`$b = m/2\pi U$`, value: b, unit: 'm' },
          ]}
        />
      }
      footer={
        <span>
          <b>Try this:</b> drag θ from 180° (the nose) down to 1°: V rises from 0, equals U at θ ≈ 113° (x = −b/2), peaks at about 1.26U
          near θ ≈ 63° and then relaxes back toward U. Change U, m or the fluid — the C_p curve never moves (it depends on θ only); only p −
          p₀ = ½ρU²C_p rescales. In water, push U up until p turns red: below the vapour pressure the liquid would cavitate and the model fails.
        </span>
      }
      wide
    >
      <div ref={f.ref} className="w-full">
        <svg width={W} height={H} className="mx-auto block" role="img" aria-label="Velocity components at a point on the half-body surface">
          <defs>
            <clipPath id={clip}>
              <rect x={sx(EX[0])} y={0} width={sx(EX[1]) - sx(EX[0])} height={H} />
            </clipPath>
          </defs>
          <rect x={sx(EX[0])} y={0} width={sx(EX[1]) - sx(EX[0])} height={H} fill="var(--field-bg)" stroke="var(--line)" rx={8} />
          <g clipPath={`url(#${clip})`}>
            <path d={toPath(curves.fill, sx, sy, true)} fill="var(--body-fill)" />
            <path d={toPath(curves.upper, sx, sy)} fill="none" stroke="var(--plot-4)" strokeWidth={2.2} />
            <line x1={sx(EX[0])} x2={sx(EX[1])} y1={sy(0)} y2={sy(0)} stroke="var(--ink-3)" strokeWidth={1} strokeDasharray="4 4" />
            <line x1={sx(0)} y1={sy(0)} x2={sx(P[0])} y2={sy(P[1])} stroke="var(--ink-2)" strokeWidth={1.1} strokeDasharray="5 4" />
            {deg < 179.5 ? (
              <path
                d={`M${sx(arcR).toFixed(1)} ${sy(0).toFixed(1)} A${(arcR * k).toFixed(1)} ${(arcR * k).toFixed(1)} 0 ${t > Math.PI ? 1 : 0} 0 ${sx(arcEnd[0]).toFixed(1)} ${sy(arcEnd[1]).toFixed(1)}`}
                fill="none"
                stroke="var(--ink-2)"
                strokeWidth={1.1}
              />
            ) : null}
            <ArrowLine x1={sx(P[0])} y1={sy(P[1])} x2={sx(tipR[0])} y2={sy(tipR[1])} color="var(--plot-5)" width={2} head={8} />
            <ArrowLine x1={sx(P[0])} y1={sy(P[1])} x2={sx(tipT[0])} y2={sy(tipT[1])} color="var(--plot-6)" width={2} head={8} />
            <ArrowLine x1={sx(P[0])} y1={sy(P[1])} x2={sx(tipV[0])} y2={sy(tipV[1])} color="var(--plot-1)" width={3} head={10} />
          </g>
          <circle cx={sx(-1)} cy={sy(0)} r={4} fill="var(--plot-3)" stroke="var(--ink)" strokeWidth={1} />
          <circle cx={sx(0)} cy={sy(0)} r={3.5} fill="var(--surface)" stroke="var(--ink)" strokeWidth={1.3} />
          <circle cx={sx(P[0])} cy={sy(P[1])} r={4.5} fill="var(--ink)" stroke="var(--surface)" strokeWidth={1.5} />
          <Label x={sx(tipR[0]) + 5} y={sy(tipR[1]) + 4} size={13} italic className="fill-emerald-700 dark:fill-emerald-300">
            v
            <tspan dy={4} style={{ fontSize: 10 }}>
              r
            </tspan>
          </Label>
          <Label x={sx(tipT[0]) - 4} y={sy(tipT[1]) - 6} anchor="end" size={13} italic className="fill-violet-700 dark:fill-violet-300">
            v
            <tspan dy={4} style={{ fontSize: 10 }}>
              θ
            </tspan>
          </Label>
          <Label x={sx(tipV[0]) + 5} y={sy(tipV[1]) - 6} size={13} italic className="fill-indigo-700 dark:fill-indigo-300">
            V
          </Label>
          <Label x={sx(arcR) + 4} y={sy(0) - 4} size={11} italic>
            θ
          </Label>
        </svg>
        <p className="mt-1 text-center text-[11px] text-ink-3">
          Sketch in units of b (upper half). The resultant V is always tangent to the surface — the body is a streamline.
        </p>
      </div>
      <div className="mt-3">
        <Plot
          x={{ label: md`$\theta$ on the body (degrees; nose $= 180^\circ$)`, domain: [180, 0] }}
          y={{ label: '$V/U$, $C_p$', domain: [-0.8, 1.35] }}
          series={[
            { label: '$V/U$', fn: (d) => Math.sqrt(Math.max(0, surfaceSpeed2(d / DEG))), color: 'var(--plot-1)', width: 2.2 },
            { label: '$C_p$', fn: (d) => 1 - surfaceSpeed2(d / DEG), color: 'var(--plot-4)', width: 2.2 },
          ]}
          hlines={[{ y: 0, color: 'var(--axis)' }]}
          vlines={[{ x: deg, color: 'var(--ink-2)', dash: '3 3' }]}
          marks={[
            { x: deg, y: ratio, color: 'var(--plot-1)' },
            { x: deg, y: cp, color: 'var(--plot-4)' },
          ]}
          height={220}
        />
      </div>
    </SimPanel>
  )
}
