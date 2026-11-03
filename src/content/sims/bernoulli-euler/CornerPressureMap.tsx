/**
 * Interactive: pressure field of the potential flow φ = Axy (Lecture 11, slide 2, problem 2 has A = 8 s⁻¹, water).
 * Steady, inviscid, incompressible and irrotational ⇒ one Bernoulli constant for the whole field:
 *   p − p₀ = −½ρA²(x² + y²) − ρg·y·[y vertical]       (p₀ = stagnation pressure at the origin)
 * Course convention V = +∇φ ⇒ u = Ay, v = Ax, ψ = (A/2)(y² − x²). Fox's V = −∇φ reverses the flow and the sign
 * of ψ but leaves |V| — and therefore the pressure map — unchanged.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Md, PlayPause, Readout, Segmented, SimPanel, Slider, Toggle, md, num, useAnimationFrame, useElementSize, useInView, usePrefersReducedMotion,
} from '@/kit'
import { G, Label, isoPath, rampCss, sampleGrid, ramp, ticksFor } from './shared'

const D = 2.5
const NP = 70
const NH = 120
const NG = 81
type Conv = 'course' | 'fox'
type Fluid = 'water' | 'air'
const RHO: Record<Fluid, number> = { water: 1000, air: 1.2 }
type Pt = [number, number]
const LEC11: [Pt, Pt] = [
  [0, 0.5],
  [0, 2],
]

export function cornerPressure(A: number, rho: number, vertical: boolean) {
  return (x: number, y: number) => -0.5 * rho * A * A * (x * x + y * y) - (vertical ? rho * G * y : 0)
}

export function CornerPressureMap() {
  const [A, setA] = useState(8)
  const [fluid, setFluid] = useState<Fluid>('water')
  const [vertical, setVertical] = useState(false)
  const [conv, setConv] = useState<Conv>('course')
  const [showPsi, setShowPsi] = useState(true)
  const [showPhi, setShowPhi] = useState(false)
  const [pts, setPts] = useState<[Pt, Pt]>(LEC11)
  const [playing, setPlaying] = useState(true)
  const [wrapRef, size] = useElementSize<HTMLDivElement>()
  const boxRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drag = useRef<number | null>(null)
  const inView = useInView(boxRef)
  const reduced = usePrefersReducedMotion()

  const rho = RHO[fluid]
  const sgn = conv === 'course' ? 1 : -1
  const S = Math.max(260, Math.min(480, size.width || 440))
  const pad = 6
  const span = S - 2 * pad
  const sx = (x: number) => pad + ((x + D) / (2 * D)) * span
  const sy = (y: number) => pad + ((D - y) / (2 * D)) * span
  const inv = (px: number, py: number): Pt => [((px - pad) / span) * 2 * D - D, D - ((py - pad) / span) * 2 * D]
  const g2px = (gx: number, gy: number): [number, number] => [sx(-D + (2 * D * gx) / (NG - 1)), sy(-D + (2 * D * gy) / (NG - 1))]

  const pf = useMemo(() => cornerPressure(A, rho, vertical), [A, rho, vertical])

  // pressure range over the box (for colours and isobars)
  const prange = useMemo(() => {
    let lo = Infinity
    let hi = -Infinity
    for (const x of num.linspace(-D, D, 41))
      for (const y of num.linspace(-D, D, 41)) {
        const p = pf(x, y)
        if (p < lo) lo = p
        if (p > hi) hi = p
      }
    return [lo, hi] as [number, number]
  }, [pf])
  const tOf = (p: number) => (prange[1] - prange[0] > 0 ? (p - prange[0]) / (prange[1] - prange[0]) : 0.5)

  // heat map (canvas; skipped where canvas is unavailable)
  useEffect(() => {
    const cv = canvasRef.current
    const ctx = cv?.getContext('2d')
    if (!cv || !ctx) return
    cv.width = NH
    cv.height = NH
    const img = ctx.createImageData(NH, NH)
    for (let j = 0; j < NH; j++) {
      const y = D - ((j + 0.5) / NH) * 2 * D
      for (let i = 0; i < NH; i++) {
        const x = -D + ((i + 0.5) / NH) * 2 * D
        const [r, g, b] = ramp(tOf(pf(x, y)))
        const o = 4 * (j * NH + i)
        img.data[o] = r
        img.data[o + 1] = g
        img.data[o + 2] = b
        img.data[o + 3] = 200
      }
    }
    ctx.putImageData(img, 0, 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pf, prange])

  // contour paths
  const paths = useMemo(() => {
    const pv = sampleGrid(pf, -D, D, -D, D, NG, NG)
    const isoLevels = ticksFor(prange[0], prange[1], 8).filter((L) => L > prange[0] && L < prange[1])
    const psiF = (x: number, y: number) => 0.5 * A * (y * y - x * x)
    const phiF = (x: number, y: number) => A * x * y
    const dPsi = (0.5 * A * D * D) / 7
    const psiLv = Array.from({ length: 13 }, (_, i) => (i - 6) * dPsi).filter((l) => l !== 0)
    const phiLv = Array.from({ length: 13 }, (_, i) => ((i - 6) * A * D * D) / 7)
    return {
      iso: isoPath(pv, NG, NG, isoLevels, g2px),
      psi: isoPath(sampleGrid(psiF, -D, D, -D, D, NG, NG), NG, NG, psiLv, g2px),
      phi: isoPath(sampleGrid(phiF, -D, D, -D, D, NG, NG), NG, NG, phiLv, g2px),
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pf, prange, A, S])

  // particles
  const parts = useRef<{ x: number; y: number; age: number; life: number }[]>([])
  if (!parts.current.length) {
    const rnd = num.seededRandom(11)
    parts.current = Array.from({ length: NP }, () => ({ x: -D + 2 * D * rnd(), y: -D + 2 * D * rnd(), age: 3 * rnd(), life: 3 + 3 * rnd() }))
  }
  const dotEls = useRef<(SVGCircleElement | null)[]>([])
  const rndRef = useRef(num.seededRandom(29))
  useAnimationFrame(
    (dt) => {
      const k = 0.045 * sgn
      const rnd = rndRef.current
      parts.current.forEach((p, i) => {
        // RK2 for dx/dt = k(Ay), dy/dt = k(Ax)
        const mx = p.x + 0.5 * dt * k * A * p.y
        const my = p.y + 0.5 * dt * k * A * p.x
        p.x += dt * k * A * my
        p.y += dt * k * A * mx
        p.age += dt
        if (Math.abs(p.x) > D || Math.abs(p.y) > D || p.age > p.life) {
          p.x = -D + 2 * D * rnd()
          p.y = -D + 2 * D * rnd()
          p.age = 0
          p.life = 3 + 3 * rnd()
        }
        const el = dotEls.current[i]
        if (el) {
          el.setAttribute('cx', sx(p.x).toFixed(1))
          el.setAttribute('cy', sy(p.y).toFixed(1))
          el.setAttribute('opacity', Math.min(1, p.age / 0.4, (p.life - p.age) / 0.4).toFixed(2))
        }
      })
    },
    playing && inView && !reduced,
  )

  // pointer handling
  const toData = (e: { clientX: number; clientY: number }): Pt | null => {
    const svg = svgRef.current
    if (!svg) return null
    const r = svg.getBoundingClientRect()
    const [x, y] = inv(e.clientX - r.left, e.clientY - r.top)
    return [num.clamp(x, -D * 0.98, D * 0.98), num.clamp(y, -D * 0.98, D * 0.98)]
  }
  const place = (idx: number, p: Pt) => setPts((old) => (idx === 0 ? [p, old[1]] : [old[0], p]))
  const onBgClick = (e: { clientX: number; clientY: number }) => {
    const p = toData(e)
    if (!p) return
    const d0 = Math.hypot(p[0] - pts[0][0], p[1] - pts[0][1])
    const d1 = Math.hypot(p[0] - pts[1][0], p[1] - pts[1][1])
    place(d0 <= d1 ? 0 : 1, [+p[0].toFixed(2), +p[1].toFixed(2)])
  }

  // readouts
  const speed = (p: Pt) => A * Math.hypot(p[0], p[1])
  const psiAt = (p: Pt) => sgn * 0.5 * A * (p[1] * p[1] - p[0] * p[0])
  const [P1, P2] = pts
  const V1 = speed(P1)
  const V2 = speed(P2)
  const dpTot = pf(P1[0], P1[1]) - pf(P2[0], P2[1])
  const dpGrav = vertical ? rho * G * (P2[1] - P1[1]) : 0
  const useKPa = fluid === 'water'
  const pv = (p: number) => (useKPa ? p / 1000 : p)
  const pu = useKPa ? 'kPa' : 'Pa'
  const sameLine = Math.abs(psiAt(P1) - psiAt(P2)) < 1e-6 * (1 + Math.abs(psiAt(P1)))

  const arrowsAt: Pt[] = []
  for (const x of [-2, -1, 0, 1, 2]) for (const y of [-2, -1, 0, 1, 2]) if (x !== 0 || y !== 0) arrowsAt.push([x, y])

  return (
    <SimPanel
      title="Pressure map of the corner flow φ = Axy"
      subtitle="one Bernoulli constant for the whole irrotational field"
      wide
      controls={
        <>
          <Slider label={md`strength $A$ (Lecture 11: $A = 8$)`} value={A} min={1} max={12} step={0.5} onChange={setA} unit="1/s" digits={3} />
          <Segmented<Fluid>
            label="Fluid"
            value={fluid}
            onChange={setFluid}
            options={[
              { value: 'water', label: 'water (1000 kg/m³)' },
              { value: 'air', label: 'air (1.2 kg/m³)' },
            ]}
          />
          <Segmented<Conv>
            label="Read φ with"
            value={conv}
            onChange={setConv}
            options={[
              { value: 'course', label: md`course: $\mathbf V = \nabla\phi$` },
              { value: 'fox', label: md`Fox: $\mathbf V = -\nabla\phi$` },
            ]}
          />
          <Toggle label={md`$y$ axis is vertical (add $\rho g\,\Delta y$)`} checked={vertical} onChange={setVertical} />
          <Toggle label="show streamlines (ψ)" checked={showPsi} onChange={setShowPsi} />
          <Toggle label="show equipotentials (φ)" checked={showPhi} onChange={setShowPhi} />
          <div className="flex flex-wrap items-center gap-2">
            <PlayPause playing={playing} onToggle={() => setPlaying((p) => !p)} />
            <button type="button" className="btn-ghost" onClick={() => setPts(LEC11)}>
              Lecture 11 points
            </button>
          </div>
        </>
      }
      readout={
        <Readout
          items={[
            { label: 'Point 1 (x, y)', value: `(${P1[0].toFixed(2)}, ${P1[1].toFixed(2)})`, unit: 'm' },
            { label: 'Point 2 (x, y)', value: `(${P2[0].toFixed(2)}, ${P2[1].toFixed(2)})`, unit: 'm' },
            { label: 'Speed at 1', value: V1, unit: 'm/s' },
            { label: 'Speed at 2', value: V2, unit: 'm/s' },
            { label: 'Stream function at 1', value: psiAt(P1), unit: 'm²/s' },
            { label: 'Stream function at 2', value: psiAt(P2), unit: 'm²/s' },
            { label: 'Δp = p₁ − p₂', value: pv(dpTot), unit: pu, tone: 'accent' },
            { label: 'of which ρg(y₂ − y₁)', value: pv(dpGrav), unit: pu },
          ]}
        />
      }
      footer={
        <Md>{md`**Try this:** with the Lecture 11 points, read $\Delta p = 120$ kPa — then switch "Read φ with" to Fox's sign: every particle reverses and $\psi$ changes sign, but the colour map and $\Delta p$ do not move, because only $V^2$ enters Bernoulli. Drag point 2 along its own streamline: $\Delta p$ changes only through the speed. Tick "y axis is vertical" to add the hydrostatic part $\rho g(y_2 - y_1) = 14.7$ kPa.`}</Md>
      }
    >
      <div ref={wrapRef} className="w-full">
        <div ref={boxRef} className="relative mx-auto" style={{ width: S, height: S }}>
          <canvas ref={canvasRef} className="absolute rounded-lg" style={{ left: pad, top: pad, width: span, height: span }} aria-hidden />
          <svg
            ref={svgRef}
            width={S}
            height={S}
            className="absolute inset-0 block cursor-crosshair select-none"
            role="img"
            aria-label="pressure colour map with streamlines and two draggable points"
            onClick={onBgClick}
            onPointerMove={(e) => {
              if (drag.current == null) return
              const p = toData(e)
              if (p) place(drag.current, [+p[0].toFixed(2), +p[1].toFixed(2)])
            }}
            onPointerUp={() => {
              drag.current = null
            }}
            onPointerCancel={() => {
              drag.current = null
            }}
          >
            <rect x={pad} y={pad} width={span} height={span} rx={8} fill="none" stroke="var(--line)" />
            <line x1={sx(0)} x2={sx(0)} y1={pad} y2={S - pad} stroke="var(--ink-3)" strokeWidth={0.6} strokeDasharray="3 4" />
            <line x1={pad} x2={S - pad} y1={sy(0)} y2={sy(0)} stroke="var(--ink-3)" strokeWidth={0.6} strokeDasharray="3 4" />
            <path d={paths.iso} fill="none" stroke="var(--ink)" strokeWidth={0.8} opacity={0.35} />
            {showPhi ? <path d={paths.phi} fill="none" stroke="var(--equipotential)" strokeWidth={1.2} strokeDasharray="4 3" /> : null}
            {showPsi ? (
              <g>
                <path d={paths.psi} fill="none" stroke="var(--streamline)" strokeWidth={1.4} />
                <line x1={sx(-D)} y1={sy(-D)} x2={sx(D)} y2={sy(D)} stroke="var(--streamline)" strokeWidth={2.2} />
                <line x1={sx(-D)} y1={sy(D)} x2={sx(D)} y2={sy(-D)} stroke="var(--streamline)" strokeWidth={2.2} />
              </g>
            ) : null}
            {arrowsAt.map(([x, y], i) => {
              const u = sgn * A * y
              const v = sgn * A * x
              const L = Math.hypot(u, v)
              const len = 0.07 * span
              const ex = sx(x) + (u / L) * len
              const ey = sy(y) - (v / L) * len
              const hx = ex - (u / L) * 6
              const hy = ey + (v / L) * 6
              const nx = (-v / L) * 3.2
              const ny = (-u / L) * 3.2
              return (
                <g key={i} opacity={0.75}>
                  <line x1={sx(x)} y1={sy(y)} x2={hx} y2={hy} stroke="var(--quiver)" strokeWidth={1.3} />
                  <path d={`M${ex},${ey}L${hx + nx},${hy + ny}L${hx - nx},${hy - ny}Z`} fill="var(--quiver)" />
                </g>
              )
            })}
            {parts.current.map((p, i) => (
              <circle
                key={i}
                ref={(el) => {
                  dotEls.current[i] = el
                }}
                cx={sx(p.x)}
                cy={sy(p.y)}
                r={2.2}
                fill="var(--ink)"
                opacity={0.8}
                pointerEvents="none"
              />
            ))}
            <g pointerEvents="none">
              <circle cx={sx(0)} cy={sy(0)} r={5.5} fill="var(--plot-3)" stroke="var(--surface)" strokeWidth={1.5} />
              <Label x={sx(0) + 8} y={sy(0) + 16} size={10.5} weight={600}>stagnation, p = p₀</Label>
            </g>
            <line x1={sx(P1[0])} y1={sy(P1[1])} x2={sx(P2[0])} y2={sy(P2[1])} stroke="var(--ink)" strokeWidth={1.2} strokeDasharray="5 4" pointerEvents="none" />
            {pts.map((p, i) => (
              <g key={i}>
                <circle cx={sx(p[0])} cy={sy(p[1])} r={7} fill="var(--surface)" stroke="var(--ink)" strokeWidth={2.2} pointerEvents="none" />
                <Label x={sx(p[0]) + 11} y={sy(p[1]) + 4} size={12} weight={800}>{String(i + 1)}</Label>
                <circle
                  cx={sx(p[0])}
                  cy={sy(p[1])}
                  r={17}
                  fill="transparent"
                  style={{ touchAction: 'none', cursor: 'grab' }}
                  onPointerDown={(e) => {
                    e.stopPropagation()
                    drag.current = i
                    svgRef.current?.setPointerCapture?.(e.pointerId)
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              </g>
            ))}
            <Label x={S - pad - 6} y={S - pad - 8} anchor="end" size={10} color="var(--ink)">x, y in m (box ±2.5 m)</Label>
          </svg>
        </div>
        <div className="mx-auto mt-2" style={{ maxWidth: S }}>
          <div
            className="h-3 w-full rounded"
            style={{ background: `linear-gradient(to right, ${num.linspace(0, 1, 8).map((t) => rampCss(t, 0.85)).join(', ')})` }}
          />
          <div className="mt-1 flex justify-between text-xs text-ink-3">
            <span>{`${num.fmt(pv(prange[0]), 3)} ${pu}`}</span>
            <span>p − p₀ (colour) · thin lines: isobars</span>
            <span>{`${num.fmt(pv(prange[1]), 3)} ${pu}`}</span>
          </div>
        </div>
        <div className="mt-3 text-sm text-ink-2">
          <Md>
            {sameLine
              ? md`The two points lie on the **same** streamline, so even the along-a-streamline form of Bernoulli would connect them.`
              : md`The two points lie on **different** streamlines ($\psi_1 = ${num.fmtTeX(psiAt(P1), 3)}$, $\psi_2 = ${num.fmtTeX(psiAt(P2), 3)}$ m²/s). Only because the flow is **irrotational** may one Bernoulli constant link them (Fox Eq. 6.26).`}
          </Md>
        </div>
      </div>
    </SimPanel>
  )
}
