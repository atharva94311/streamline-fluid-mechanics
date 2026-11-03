import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  PlayPause, Plot, Readout, Segmented, SimPanel, Slider, md, num, useAnimationFrame, useInView, usePrefersReducedMotion, useUid,
} from '@/kit'
import { Arrow, COL } from './svg'

type Pt2 = [number, number]

export type EulerMode = 'nozzle' | 'diffuser' | 'rotation'
export const G = 9.81

/**
 * Centreline of a converging (nozzle) or diverging (diffuser) duct: steady, inviscid, horizontal (g_x = 0).
 *   nozzle   u = U (1 + x/L)       diffuser   u = U / (1 + x/L)
 * Euler (x-component on the centreline, v = w = 0 there):  −∂p/∂x = ρ u ∂u/∂x.
 */
export function ductFlow(mode: 'nozzle' | 'diffuser', U: number, L: number, rho: number) {
  const u = (x: number) => (mode === 'nozzle' ? U * (1 + x / L) : U / (1 + x / L))
  const ax = (x: number) => (mode === 'nozzle' ? ((U * U) / L) * (1 + x / L) : -(U * U) / (L * (1 + x / L) ** 3))
  const dpdx = (x: number) => -rho * ax(x)
  /** p(x) − p(0), from integrating ∂p/∂x analytically. */
  const dp = (x: number) =>
    mode === 'nozzle' ? -rho * ((U * U) / L) * (x + (x * x) / (2 * L)) : ((rho * U * U) / 2) * (1 - (1 + x / L) ** -2)
  /** Particle position after travelling for time τ from x = 0. */
  const xAfter = (tau: number) => (mode === 'nozzle' ? L * (Math.exp((U * tau) / L) - 1) : L * (Math.sqrt(1 + (2 * U * tau) / L) - 1))
  const transit = mode === 'nozzle' ? (L / U) * Math.LN2 : (1.5 * L) / U
  return { u, ax, dpdx, dp, xAfter, transit }
}

/** Rigid-body rotation about a vertical axis: a_r = −Ω²r, ∂p/∂r = ρΩ²r, free surface rises by Ω²R²/2g. */
export function rotationFlow(Omega: number, R: number, rho: number) {
  return {
    ar: (r: number) => -Omega * Omega * r,
    dpdr: (r: number) => rho * Omega * Omega * r,
    dp: (r: number) => 0.5 * rho * Omega * Omega * r * r,
    rise: (Omega * Omega * R * R) / (2 * G),
  }
}

export const omegaMax = (R: number) => 0.98 * Math.sqrt((4.8 * G) / R)

const pad = (lo: number, hi: number): [number, number] => {
  const a = Math.min(0, lo)
  const b = Math.max(0, hi)
  const span = b - a || 1
  return [a - 0.08 * span, b + 0.08 * span]
}

/* ------------------------------------------------------------------ duct schematic */

const X0 = 50
const X1 = 550
const YC = 150
const ROWS = [-0.62, 0, 0.62]
const PER_ROW = 7

function DuctSchematic({ mode, U, L, rho, playing }: { mode: 'nozzle' | 'diffuser'; U: number; L: number; rho: number; playing: boolean }) {
  const flow = useMemo(() => ductFlow(mode, U, L, rho), [mode, U, L, rho])
  const gid = useUid('pgrad')
  const wrap = useRef<HTMLDivElement>(null)
  const inView = useInView(wrap)
  const reduced = usePrefersReducedMotion()
  const dots = useRef<(SVGCircleElement | null)[]>([])
  const hIn = mode === 'nozzle' ? 52 : 26
  const hpx = (x: number) => (mode === 'nozzle' ? hIn / (1 + x / L) : hIn * (1 + x / L))
  const X = (x: number) => X0 + ((X1 - X0) * x) / L

  // initial positions: equally spaced in travel time, so the stream has a uniform particle flux
  const init = useMemo(
    () =>
      ROWS.flatMap((eta, r) =>
        Array.from({ length: PER_ROW }, (_, j) => ({ eta, x: flow.xAfter(((j + (r % 2) * 0.5) / PER_ROW) * flow.transit) })),
      ),
    [flow],
  )
  const state = useRef(init.map((p) => ({ ...p })))
  useEffect(() => {
    state.current = init.map((p) => ({ ...p }))
  }, [init])

  useAnimationFrame(
    (dt) => {
      const f = flow.transit / 3.5 // show one transit in ≈ 3.5 s, true speed ratios preserved
      state.current.forEach((p, i) => {
        p.x += flow.u(p.x) * dt * f
        if (p.x > L) p.x = flow.xAfter(Math.min(flow.transit, (p.x - L) / flow.u(L)))
        const el = dots.current[i]
        if (el) {
          el.setAttribute('cx', X(p.x).toFixed(1))
          el.setAttribute('cy', (YC + p.eta * hpx(p.x)).toFixed(1))
        }
      })
    },
    playing && inView && !reduced,
  )

  const xs = num.linspace(0, L, 41)
  const upper = xs.map((x) => `${X(x).toFixed(1)},${(YC - hpx(x)).toFixed(1)}`)
  const lower = xs.map((x) => `${X(x).toFixed(1)},${(YC + hpx(x)).toFixed(1)}`)
  const ps = xs.map((x) => flow.dp(x))
  const pmin = Math.min(...ps)
  const pmax = Math.max(...ps)
  const norm = (p: number) => (pmax - pmin > 0 ? (p - pmin) / (pmax - pmin) : 0.5)
  const stations = [0, 0.25, 0.5, 0.75, 1].map((s) => s * L)

  return (
    <div ref={wrap}>
      <svg viewBox="0 0 600 240" className="block h-auto w-full" role="img" aria-label={`${mode} with pressure gauges`}>
        <defs>
          <linearGradient id={gid} x1="0" x2="1" y1="0" y2="0">
            {xs.filter((_, i) => i % 5 === 0).map((x) => (
              <stop key={x} offset={x / L} stopColor={COL.net} stopOpacity={0.08 + 0.5 * norm(flow.dp(x))} />
            ))}
          </linearGradient>
        </defs>
        <polygon points={[...upper, ...lower.slice().reverse()].join(' ')} fill="var(--plot-2)" opacity={0.14} />
        <polygon points={[...upper, ...lower.slice().reverse()].join(' ')} fill={`url(#${gid})`} />
        <polyline points={upper.join(' ')} fill="none" stroke="var(--ink-2)" strokeWidth={2.2} />
        <polyline points={lower.join(' ')} fill="none" stroke="var(--ink-2)" strokeWidth={2.2} />
        <line x1={X0} x2={X1} y1={YC} y2={YC} stroke="var(--ink-3)" strokeDasharray="8 4 2 4" strokeWidth={1} />
        {/* pressure gauges: liquid-column height ∝ p − p_min */}
        {stations.map((x, i) => {
          const top = YC - hpx(x)
          const col = 10 + 66 * norm(flow.dp(x))
          return (
            <g key={i}>
              <rect x={X(x) - 5} y={top - 84} width={10} height={84} fill="var(--surface)" stroke="var(--ink-3)" strokeWidth={1} />
              <rect x={X(x) - 4} y={top - col} width={8} height={col} fill={COL.normal} opacity={0.75} />
            </g>
          )
        })}
        {init.map((p, i) => (
          <circle
            key={`${mode}-${i}`}
            ref={(el) => {
              dots.current[i] = el
            }}
            cx={X(p.x)}
            cy={YC + p.eta * hpx(p.x)}
            r={3.4}
            fill="var(--streamline)"
          />
        ))}
        <text x={X0} y={YC + hpx(0) + 18} fontSize={12} fill="var(--ink-2)" textAnchor="middle">inlet x = 0</text>
        <text x={X1} y={YC + hpx(L) + 18} fontSize={12} fill="var(--ink-2)" textAnchor="middle">exit x = L</text>
        <text x={300} y={236} fontSize={11} fill="var(--ink-3)" textAnchor="middle">
          gauges: taller liquid column = higher local pressure · shading: darker rose = higher pressure
        </text>
      </svg>
    </div>
  )
}

/* ------------------------------------------------------------------ rotating tank */

const NDOT = 8

function RotationSchematic({ Omega, R, playing }: { Omega: number; R: number; playing: boolean }) {
  const wrap = useRef<HTMLDivElement>(null)
  const inView = useInView(wrap)
  const reduced = usePrefersReducedMotion()
  const dots = useRef<(SVGCircleElement | null)[]>([])
  const phase = useRef(0)

  const H0 = 1.2 * R
  const rise = (Omega * Omega * R * R) / (2 * G)
  const z0 = H0 - rise / 2
  const k = 190 / (2.6 * R) // px per metre (same scale both ways)
  const W = R * k
  const CX = 300
  const YB = 206
  const zs = (r: number) => z0 + (Omega * Omega * r * r) / (2 * G)
  const Hc = H0 + (omegaMax(R) ** 2 * R * R) / (4 * G) + 0.2 * R
  const yOf = (z: number) => YB - z * k

  const rs = num.linspace(-R, R, 61)
  const surface = rs.map((r) => `${(CX + r * k).toFixed(1)},${yOf(zs(r)).toFixed(1)}`)
  const liquid = [`${CX - W},${YB}`, `${CX + W},${YB}`, ...surface.slice().reverse()].join(' ')
  const isobars = [0.25, 0.5, 0.75].map((f) => {
    const depth = f * z0
    return rs.map((r) => `${(CX + r * k).toFixed(1)},${yOf(Math.max(0, zs(r) - depth)).toFixed(1)}`).join(' ')
  })
  const dotsInit = Array.from({ length: NDOT }, (_, i) => ({
    r: R * (0.25 + 0.65 * ((i * 37) % 10) / 10),
    depth: z0 * (0.2 + 0.6 * ((i * 53) % 10) / 10),
    ph: (2 * Math.PI * i) / NDOT,
  }))

  const rx = 0.55 * W
  const yc = yOf(Hc) - 4
  const arcPts = num.linspace(Math.PI, 0.3, 24).map((t) => `${(CX + rx * Math.cos(t)).toFixed(1)},${(yc + 7 * Math.sin(t)).toFixed(1)}`)
  const arcEnd: [Pt2, Pt2] = [
    [CX + rx * Math.cos(0.42), yc + 7 * Math.sin(0.42)],
    [CX + rx * Math.cos(0.3), yc + 7 * Math.sin(0.3)],
  ]

  useAnimationFrame(
    (dt) => {
      phase.current += dt * 0.25 * Omega
      dotsInit.forEach((d, i) => {
        const el = dots.current[i]
        if (!el) return
        const a = d.ph + phase.current
        el.setAttribute('cx', (CX + d.r * Math.cos(a) * k).toFixed(1))
        el.setAttribute('opacity', (0.35 + 0.65 * (0.5 - 0.5 * Math.sin(a))).toFixed(2))
      })
    },
    playing && inView && !reduced,
  )

  return (
    <div ref={wrap}>
      <svg viewBox="0 0 600 240" className="block h-auto w-full" role="img" aria-label="Rotating container with paraboloid free surface">
        <polygon points={liquid} fill="var(--plot-2)" opacity={0.22} />
        {isobars.map((pts, i) => (
          <polyline key={i} points={pts} fill="none" stroke={COL.net} strokeWidth={1.3} strokeDasharray="5 4" opacity={0.85} />
        ))}
        <polyline points={surface.join(' ')} fill="none" stroke="var(--streamline)" strokeWidth={2.4} />
        <line x1={CX - W} x2={CX + W} y1={yOf(H0)} y2={yOf(H0)} stroke="var(--ink-3)" strokeDasharray="2 4" />
        <polyline
          points={`${CX - W},${yOf(Hc)} ${CX - W},${YB} ${CX + W},${YB} ${CX + W},${yOf(Hc)}`}
          fill="none"
          stroke="var(--ink-2)"
          strokeWidth={2.6}
        />
        <line x1={CX} x2={CX} y1={yOf(Hc) - 6} y2={YB + 6} stroke="var(--ink-3)" strokeDasharray="10 4 2 4" />
        {dotsInit.map((d, i) => (
          <circle
            key={i}
            ref={(el) => {
              dots.current[i] = el
            }}
            cx={CX + d.r * Math.cos(d.ph) * k}
            cy={yOf(zs(d.r) - d.depth)}
            r={3}
            fill="var(--streamline)"
          />
        ))}
        {/* rotation sense: the front of the fluid moves to the right (Ω > 0, counter-clockwise seen from above) */}
        <polyline points={arcPts.join(' ')} fill="none" stroke={COL.body} strokeWidth={2} />
        <Arrow x1={arcEnd[0][0]} y1={arcEnd[0][1]} x2={arcEnd[1][0]} y2={arcEnd[1][1]} color={COL.body} width={2} head={9} />
        <text x={CX + 0.55 * W + 12} y={yOf(Hc) + 2} fontSize={13} fontStyle="italic" fill={COL.body}>
          Ω
        </text>
        {/* rise bracket */}
        <line x1={CX + W + 14} x2={CX + W + 14} y1={yOf(zs(0))} y2={yOf(zs(R))} stroke="var(--ink-2)" strokeWidth={1.2} />
        <line x1={CX} x2={CX + W + 18} y1={yOf(zs(0))} y2={yOf(zs(0))} stroke="var(--ink-3)" strokeDasharray="2 3" />
        <text x={CX + W + 20} y={(yOf(zs(0)) + yOf(zs(R))) / 2 + 4} fontSize={12} fill="var(--ink)">
          Δz = {num.fmt(rise * 100, 3)} cm
        </text>
        <text x={300} y={232} fontSize={11} fill="var(--ink-3)" textAnchor="middle">
          solid blue: free surface (an isobar, p = pₐ) · dashed rose: isobars · dotted: level at rest
        </text>
      </svg>
    </div>
  )
}

/* ------------------------------------------------------------------ the simulation panel */

export function EulerGradientSim() {
  const [mode, setMode] = useState<EulerMode>('nozzle')
  const [fluid, setFluid] = useState<'water' | 'air'>('water')
  const [U, setU] = useState(2)
  const [L, setL] = useState(0.5)
  const [R, setR] = useState(0.1)
  const [Omega, setOmega] = useState(10)
  const [playing, setPlaying] = useState(true)
  const rho = mode === 'rotation' || fluid === 'water' ? 1000 : 1.2
  const oMax = omegaMax(R)

  const duct = mode !== 'rotation' ? ductFlow(mode, U, L, rho) : null
  const rot = mode === 'rotation' ? rotationFlow(Omega, R, rho) : null

  const footer: Record<EulerMode, string> = {
    nozzle:
      'Try this: double U — the pressure drop quadruples (Δp = 1.5ρU² for this nozzle) and always equals the Bernoulli check. Now change L: the gradients change, but the total drop does not, because it depends only on the inlet and exit speeds.',
    diffuser:
      'Try this: the fluid decelerates, so −∂p/∂x is negative — the pressure force opposes the motion (an adverse gradient) and the pressure rises downstream by (3/8)ρU². Switch to air: the same velocities need about 830 times smaller pressure differences.',
    rotation:
      'Try this: raise Ω — the free surface (itself an isobar) curves up like Ω²r²/2g and the dashed isobars below it keep exactly the same shape. Euler applies exactly here even though water is viscous: in rigid-body rotation nothing shears.',
  }

  let plots: ReactNode
  let readout: ReactNode
  if (duct) {
    const f1 = (x: number) => -duct.dpdx(x)
    const vals1 = [f1(0), f1(L)]
    const vals2 = [duct.dp(0), duct.dp(L)]
    const bern = 0.5 * rho * (duct.u(0) ** 2 - duct.u(L) ** 2) // p(L) − p(0) from Bernoulli
    plots = (
      <div className="grid gap-3 lg:grid-cols-2">
        <Plot
          height={220}
          x={{ label: 'distance along the duct, $x$ (m)', domain: [0, L] }}
          y={{ label: md`$-\partial p/\partial x = \rho a_x$ (N/m³)`, domain: pad(Math.min(...vals1), Math.max(...vals1)) }}
          hlines={[{ y: 0, color: 'var(--axis)', dash: '2 3' }]}
          series={[{ label: 'pressure force per unit volume', fn: f1, color: COL.net }]}
        />
        <Plot
          height={220}
          x={{ label: 'distance along the duct, $x$ (m)', domain: [0, L] }}
          y={{ label: md`$p - p_{\text{inlet}}$ (Pa)`, domain: pad(Math.min(...vals2), Math.max(...vals2)) }}
          hlines={[{ y: 0, color: 'var(--axis)', dash: '2 3' }]}
          series={[{ label: 'pressure along the centreline', fn: duct.dp, color: COL.normal }]}
          marks={[{ x: L, y: duct.dp(L), label: `${num.fmt(duct.dp(L), 3)} Pa`, color: COL.normal }]}
        />
      </div>
    )
    readout = (
      <Readout
        items={[
          { label: 'inlet speed', value: duct.u(0), unit: 'm/s' },
          { label: 'exit speed', value: duct.u(L), unit: 'm/s' },
          { label: 'accel. at inlet', value: duct.ax(0), unit: 'm/s²' },
          { label: 'accel. at exit', value: duct.ax(L), unit: 'm/s²' },
          { label: 'pressure gradient, inlet', value: duct.dpdx(0), unit: 'Pa/m' },
          { label: 'pressure gradient, exit', value: duct.dpdx(L), unit: 'Pa/m' },
          { label: 'p change inlet → exit', value: duct.dp(L), unit: 'Pa', tone: 'accent' },
          { label: 'Bernoulli check', value: bern, unit: 'Pa', tone: 'good' },
        ]}
      />
    )
  } else {
    const r0 = rot!
    plots = (
      <div className="grid gap-3 lg:grid-cols-2">
        <Plot
          height={220}
          x={{ label: 'radius, $r$ (m)', domain: [0, R] }}
          y={{ label: md`$-\partial p/\partial r = \rho a_r$ (N/m³)`, domain: pad(-r0.dpdr(R), 0) }}
          series={[{ label: 'pressure force per unit volume (points to the axis)', fn: (r) => -r0.dpdr(r), color: COL.net }]}
        />
        <Plot
          height={220}
          x={{ label: 'radius, $r$ (m)', domain: [0, R] }}
          y={{ label: md`$p - p_{\text{axis}}$ at equal height (Pa)`, domain: pad(0, r0.dp(R)) }}
          series={[{ label: 'pressure at fixed height', fn: r0.dp, color: COL.normal }]}
          marks={[{ x: R, y: r0.dp(R), label: `${num.fmt(r0.dp(R), 3)} Pa`, color: COL.normal }]}
        />
      </div>
    )
    readout = (
      <Readout
        items={[
          { label: 'rotation speed', value: (Omega * 60) / (2 * Math.PI), unit: 'rpm' },
          { label: 'centripetal accel. at wall', value: Omega * Omega * R, unit: 'm/s²' },
          { label: 'pressure gradient at wall', value: r0.dpdr(R), unit: 'Pa/m' },
          { label: 'wall − axis pressure', value: r0.dp(R), unit: 'Pa', tone: 'accent' },
          { label: 'free-surface rise', value: r0.rise * 100, unit: 'cm', tone: 'good' },
        ]}
      />
    )
  }

  return (
    <SimPanel
      title="Euler pressure-gradient calculator"
      subtitle={mode === 'rotation' ? 'water in rigid-body rotation' : `steady, inviscid, horizontal · ${fluid} (ρ = ${rho} kg/m³)`}
      wide
      controls={
        <>
          <Segmented
            label="Flow"
            value={mode}
            onChange={setMode}
            options={[
              { value: 'nozzle', label: 'nozzle' },
              { value: 'diffuser', label: 'diffuser' },
              { value: 'rotation', label: 'rigid rotation' },
            ]}
          />
          {mode !== 'rotation' ? (
            <>
              <Segmented
                label="Fluid"
                value={fluid}
                onChange={setFluid}
                options={[
                  { value: 'water', label: 'water' },
                  { value: 'air', label: 'air' },
                ]}
              />
              <Slider label="inlet speed $U$" value={U} min={0.5} max={5} step={0.1} onChange={setU} unit="m/s" />
              <Slider label="length $L$" value={L} min={0.2} max={2} step={0.05} onChange={setL} unit="m" />
              <div className="rounded-xl bg-surface-2 px-3 py-2 text-xs text-ink-2">
                {mode === 'nozzle' ? <span>u(x) = U (1 + x/L): the speed doubles by the exit.</span> : <span>u(x) = U / (1 + x/L): the speed halves by the exit.</span>}
              </div>
            </>
          ) : (
            <>
              <Slider
                label="container radius $R$"
                value={R}
                min={0.05}
                max={0.3}
                step={0.01}
                onChange={(r) => {
                  setR(r)
                  setOmega((o) => Math.min(o, omegaMax(r)))
                }}
                unit="m"
              />
              <Slider label="angular speed $\Omega$" value={Math.min(Omega, oMax)} min={1} max={oMax} step={0.1} onChange={setOmega} unit="rad/s" />
            </>
          )}
          <PlayPause playing={playing} onToggle={() => setPlaying((p) => !p)} />
        </>
      }
      readout={readout}
      footer={<span>{footer[mode]}</span>}
    >
      {mode === 'rotation' ? (
        <RotationSchematic Omega={Math.min(Omega, oMax)} R={R} playing={playing} />
      ) : (
        <DuctSchematic mode={mode} U={U} L={L} rho={rho} playing={playing} />
      )}
      <div className="mt-3">{plots}</div>
    </SimPanel>
  )
}
