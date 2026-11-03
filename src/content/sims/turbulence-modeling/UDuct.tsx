import { useMemo, useRef, useState } from 'react'
import {
  Md, md, num, PlayPause, Readout, Segmented, SimPanel, Slider, useAnimationFrame, useInView, usePrefersReducedMotion,
  useUid,
} from '@/kit'
import { EX95, UDUCT_POLY, UDUCT_RECTS } from './models'
import { Arrow, Dim, Head, Label, Tag, heat } from './svg'

/* Frame: x ∈ [0, 4] m, y ∈ [0, 1] m. */
const PX = 145
const OX = 36
const OY = 22
const X = (x: number) => OX + x * PX
const Y = (y: number) => OY + (1 - y) * PX
const POLY = UDUCT_POLY.map(([x, y]) => `${X(x)},${Y(y)}`).join(' ')

function DuctShape({ clipId }: { clipId?: string }) {
  return (
    <g>
      {clipId ? (
        <defs>
          <clipPath id={clipId}>
            <polygon points={POLY} />
          </clipPath>
        </defs>
      ) : null}
      {UDUCT_RECTS.map((r) => (
        <rect key={r.id} x={X(r.x)} y={Y(r.y + r.h)} width={r.w * PX} height={r.h * PX} fill="var(--body-fill)" stroke="var(--ink-3)" strokeWidth={0.8} />
      ))}
      <polygon points={POLY} fill="none" stroke="var(--ink-2)" strokeWidth={1.6} />
    </g>
  )
}

/** Recreation of Fig. E9.5.1 from the rectangles of Steps 3–5 (r1 = 4 m × 1 m minus r2–r5). */
export function UDuctGeometryFigure() {
  return (
    <svg viewBox="0 0 640 228" className="h-auto w-full" role="img" aria-label="Geometry of the obstructed U-duct of Example 9.5">
      <polygon points={POLY} fill="color-mix(in srgb, var(--streamline) 10%, var(--surface-2))" />
      <DuctShape />
      {UDUCT_RECTS.map((r) => (
        <Label key={r.id} x={X(r.x + r.w / 2)} y={Y(r.y + r.h / 2) + 4} size={12} cls="fill-ink-2" halo={false}>
          {r.id}
        </Label>
      ))}
      <Arrow x1={X(0) - 30} y1={Y(0.95)} x2={X(0) + 26} y2={Y(0.95)} color="var(--plot-1)" width={2.2} />
      <Label x={X(0) + 30} y={Y(0.95) + 4} anchor="start" size={13} weight={700} cls="fill-[var(--plot-1)]">V₁ = 30 m/s</Label>
      <Arrow x1={X(0) - 30} y1={Y(0.65)} x2={X(0) + 26} y2={Y(0.65)} color="var(--plot-2)" width={2.2} />
      <Label x={X(0) + 30} y={Y(0.65) + 4} anchor="start" size={13} weight={700} cls="fill-[var(--plot-2)]">V₂ = 10 m/s</Label>
      <Arrow x1={X(0) + 22} y1={Y(0.2)} x2={X(0) - 32} y2={Y(0.2)} color="var(--plot-4)" width={2.2} />
      <Label x={X(0) + 26} y={Y(0.2) + 4} anchor="start" size={13} weight={700} cls="fill-[var(--plot-4)]">outlet, p = 0</Label>
      <Dim x1={X(3.75)} y1={Y(1)} x2={X(3.75)} y2={Y(0.6)} label="0.4 m" />
      <Dim x1={X(3.25)} y1={Y(0.4)} x2={X(3.25)} y2={Y(0)} label="0.4 m" />
      <Dim x1={X(2.75)} y1={Y(0.4)} x2={X(2.75)} y2={Y(0.2)} label="0.2" size={11} />
      <Dim x1={X(1.75)} y1={Y(0.2)} x2={X(1.75)} y2={Y(0)} label="0.2" size={11} />
      <Label x={X(0.75)} y={Y(0.82)} size={11} cls="fill-ink-3" anchor="start">each inlet 0.1 m wide</Label>
      {[0, 1, 2, 3, 4].map((x) => (
        <g key={x}>
          <line x1={X(x)} x2={X(x)} y1={Y(0) + 2} y2={Y(0) + 8} stroke="var(--ink-3)" />
          <Label x={X(x)} y={Y(0) + 21} size={11} cls="fill-ink-3" halo={false}>{`${x} m`}</Label>
        </g>
      ))}
      <Label x={X(4)} y={Y(0) + 38} anchor="end" size={11} cls="fill-ink-3" halo={false}>x (m) — duct extends indefinitely normal to the page</Label>
    </svg>
  )
}

type Layer = 'stream' | 'arrows' | 'speed' | 'nuT' | 'eps' | 'p'
interface Zone {
  x: number
  y: number
  rx: number
  ry: number
  v: number
  tag?: string
}
interface LayerDef {
  bg: (x: number, y: number) => number
  zones: Zone[]
  base: string
  caption: string
}

const LAYERS: Record<'speed' | 'nuT' | 'eps' | 'p', LayerDef> = {
  speed: {
    base: 'var(--plot-1)',
    bg: () => 1.5,
    zones: [
      { x: 0.4, y: 0.95, rx: 0.6, ry: 0.06, v: 4, tag: 'Very high (A)' },
      { x: 1.6, y: 0.93, rx: 0.8, ry: 0.08, v: 3.3 },
      { x: 3.1, y: 0.88, rx: 0.35, ry: 0.1, v: 2, tag: 'Medium' },
      { x: 1.85, y: 0.69, rx: 0.45, ry: 0.08, v: 0, tag: 'Very low' },
      { x: 3.8, y: 0.75, rx: 0.15, ry: 0.15, v: 1, tag: 'Low' },
      { x: 3.8, y: 0.28, rx: 0.15, ry: 0.15, v: 1, tag: 'Low' },
      { x: 2.75, y: 0.3, rx: 0.35, ry: 0.09, v: 4, tag: 'Very high (B)' },
      { x: 3.3, y: 0.13, rx: 0.15, ry: 0.1, v: 2, tag: 'Medium' },
      { x: 0.95, y: 0.31, rx: 0.4, ry: 0.07, v: 0, tag: 'Very low' },
      { x: 1.6, y: 0.08, rx: 0.42, ry: 0.08, v: 4, tag: 'Very high (C)' },
      { x: 0.4, y: 0.12, rx: 0.35, ry: 0.12, v: 2, tag: 'Medium' },
    ],
    caption: 'Velocity magnitude (cf. Fig. E9.5.5): very high where the upper jet enters (A) and in the two 0.2 m constrictions (B over r5, C under r4); very low in the recirculation zones.',
  },
  nuT: {
    base: 'var(--plot-2)',
    bg: () => 1.2,
    zones: [
      { x: 0.9, y: 0.76, rx: 0.35, ry: 0.15, v: 0, tag: 'Very low' },
      { x: 1.8, y: 0.8, rx: 0.35, ry: 0.15, v: 2, tag: 'Medium' },
      { x: 3.15, y: 0.8, rx: 0.42, ry: 0.17, v: 4, tag: 'Very high' },
      { x: 3.78, y: 0.5, rx: 0.25, ry: 0.4, v: 3.4 },
      { x: 0.42, y: 0.2, rx: 0.42, ry: 0.15, v: 4, tag: 'Very high' },
      { x: 2.4, y: 0.22, rx: 0.3, ry: 0.1, v: 2, tag: 'Medium' },
    ],
    caption: 'Turbulent kinematic viscosity ν_T (cf. Fig. E9.5.6): highest well downstream of the inlet and of the two constrictions; maximum ≈ 0.170 m²/s ≈ 9,290 × ν.',
  },
  eps: {
    base: 'var(--plot-4)',
    bg: () => 1.4,
    zones: [
      { x: 0.25, y: 0.65, rx: 0.3, ry: 0.05, v: 0, tag: 'A: very low' },
      { x: 1.0, y: 0.68, rx: 0.4, ry: 0.08, v: 0, tag: 'Very low' },
      { x: 3.6, y: 0.8, rx: 0.3, ry: 0.15, v: 2.2, tag: 'Medium' },
      { x: 3.6, y: 0.2, rx: 0.3, ry: 0.15, v: 2.2, tag: 'Medium' },
      { x: 0.4, y: 0.2, rx: 0.35, ry: 0.15, v: 2.2, tag: 'Medium' },
      { x: 1.8, y: 0.17, rx: 0.32, ry: 0.035, v: 4, tag: 'C: high' },
      { x: 2.78, y: 0.22, rx: 0.3, ry: 0.035, v: 4, tag: 'B: high' },
    ],
    caption: 'ln ε (cf. Fig. E9.5.7): very low in the slow lower entrance jet (A); rises steeply where the flow meets the sharp corners of r5 (B) and r4 (C) and trails downstream. A linear plot would show only these two spots.',
  },
  p: {
    base: 'var(--plot-6)',
    bg: (x, y) => (y > 0.6 ? 3 - 0.25 * (x / 3.5) : x > 3.5 ? 2.7 : 1.1 + 1.3 * (x / 3.5)),
    zones: [
      { x: 1.0, y: 0.85, rx: 0.8, ry: 0.15, v: 3.2, tag: 'High' },
      { x: 3.97, y: 0.97, rx: 0.12, ry: 0.12, v: 4, tag: 'A' },
      { x: 3.97, y: 0.03, rx: 0.12, ry: 0.12, v: 4, tag: 'A: very high' },
      { x: 2.65, y: 0.32, rx: 0.22, ry: 0.07, v: 0.9, tag: 'B: low' },
      { x: 1.85, y: 0.1, rx: 0.22, ry: 0.08, v: 0, tag: 'C: very low' },
      { x: 0.38, y: 0.2, rx: 0.25, ry: 0.12, v: 0.9, tag: 'Low' },
    ],
    caption: 'Pressure (cf. Fig. E9.5.8): high at the inlet, low at the exit; very high where the stream stagnates on the outer corners A of the bend; Bernoulli lows in the constrictions B and C; partial recovery near the exit.',
  },
}

/** Vortices of Fig. E9.5.3 (sense: +1 counter-clockwise, −1 clockwise). */
const VORTICES = [
  { id: 'A', x: 2.35, y: 0.09, rx: 0.13, ry: 0.07, sense: 1 },
  { id: 'B', x: 1.1, y: 0.3, rx: 0.38, ry: 0.075, sense: -1 },
  { id: 'C', x: 0.72, y: 0.765, rx: 0.16, ry: 0.055, sense: -1 },
  { id: 'C', x: 1.9, y: 0.675, rx: 0.85, ry: 0.045, sense: -1 },
]

/* Gates for the tracer lanes: λ ∈ (0, 1) = fraction of the flow; λ < split comes from the slow lower inlet. */
type Gate = (lam: number, split: number) => [number, number]
const inletY = (lam: number, split: number) =>
  lam < split ? 0.605 + (lam / split) * 0.09 : 0.905 + ((lam - split) / (1 - split)) * 0.09
const GATES: { g: Gate; w?: number }[] = [
  { g: (l, s) => [0, inletY(l, s)] },
  { g: (l, s) => [0.5, inletY(l, s)] },
  { g: (l, s) => [0.95, l < s ? 0.61 + (l / s) * 0.07 : 0.86 + ((l - s) / (1 - s)) * 0.12] },
  { g: (l) => [1.15, 0.75 + l * 0.23], w: 0.23 },
  { g: (l) => [2.8, 0.75 + l * 0.23], w: 0.25 },
  { g: (l) => [3.4, 0.63 + l * 0.35], w: 0.35 },
  { g: (l) => [3.52 + l * 0.46, 0.5], w: 0.46 },
  { g: (l) => [3.4, 0.38 - l * 0.36], w: 0.36 },
  { g: (l) => [3.0, 0.38 - l * 0.16], w: 0.16 },
  { g: (l) => [2.2, 0.38 - l * 0.16], w: 0.16 },
  { g: (l) => [1.98, 0.18 - l * 0.16], w: 0.16 },
  { g: (l) => [1.5, 0.18 - l * 0.16], w: 0.16 },
  { g: (l) => [1.2, 0.17 - l * 0.15], w: 0.15 },
  { g: (l) => [0.6, 0.24 - l * 0.22], w: 0.22 },
  { g: (l) => [0, 0.38 - l * 0.36], w: 0.36 },
]

/** Schematic mean-velocity field for the arrow plot (m/s), consistent with continuity per unit depth. */
function velAt(x: number, y: number, V1: number, V2: number): [number, number] {
  const Q = 0.1 * (V1 + V2)
  const Vb = Q / 0.4
  for (const v of VORTICES) {
    const dx = (x - v.x) / v.rx
    const dy = (y - v.y) / v.ry
    const rr = Math.hypot(dx, dy)
    if (rr < 1) {
      const m = 0.25 * Vb * rr
      // tangent of the ellipse, counter-clockwise for sense = +1
      const tx = (-dy * v.rx) / (rr || 1)
      const ty = (dx * v.ry) / (rr || 1)
      const L = Math.hypot(tx, ty) || 1
      return [(v.sense * m * tx) / L, (v.sense * m * ty) / L]
    }
  }
  if (x > 3.5) {
    const dx = x - 3.5
    const dy = y - 0.5
    const r = Math.hypot(dx, dy) || 1
    const m = 0.8 * Vb
    return [(m * dy) / r, (-m * dx) / r]
  }
  if (y >= 0.6) {
    if (x < 0.5) return [y > 0.85 ? V1 : V2, 0]
    const w = 0.05 + 0.1 * (x - 0.5)
    const jet = (V1 - 0.6 * Vb) * Math.exp(-(x - 0.5) / 2.2) * Math.exp(-(((y - 0.95) / w) ** 2))
    return [0.6 * Vb + jet, 0]
  }
  // lower channel, flowing in −x
  const narrow = (x >= 2.5 && x <= 3.0) || (x >= 1.5 && x <= 2.0)
  const m = Q / (narrow ? 0.2 : 0.4)
  let vy = 0
  if (x > 3.0 && x <= 3.5 && y < 0.3) vy = 0.5 * m
  if (x > 2.0 && x < 2.5) vy = -0.6 * m
  return [-m, vy]
}

interface Tracer {
  u: number
  lam: number
}

/** Interactive U-duct: Re check, continuity/Bernoulli scales and the labelled result maps of Figs. E9.5.3–E9.5.8. */
export function UDuctExplorer() {
  const [V1, setV1] = useState(EX95.V1)
  const [V2, setV2] = useState(EX95.V2)
  const [nu, setNu] = useState(EX95.nu)
  const [layer, setLayer] = useState<Layer>('stream')
  const [playing, setPlaying] = useState(true)
  const [, setTick] = useState(0)
  const clip = useUid('ud-clip')
  const wrap = useRef<HTMLDivElement>(null)
  const inView = useInView(wrap)
  const reduced = usePrefersReducedMotion()
  const Q = EX95.w * (V1 + V2)
  const Vbar = Q / EX95.W
  const Re = (Vbar * EX95.W) / nu
  const split = V2 / (V1 + V2)
  const Vgap = Q / EX95.gap

  const tracers = useRef<Tracer[] | null>(null)
  const vort = useRef<number[]>(VORTICES.map(() => 0))
  const rng = useRef(num.seededRandom(5))
  if (!tracers.current) {
    const r = num.seededRandom(3)
    tracers.current = Array.from({ length: 70 }, () => ({ u: r() * (GATES.length - 1), lam: 0.03 + 0.94 * r() }))
  }

  const speedAt = (i: number, lam: number) => {
    const G = GATES[i]
    if (G.w) return Q / G.w
    const inlet = lam < split ? V2 : V1
    return i < 2 ? inlet : 0.6 * inlet + 0.4 * Vbar
  }
  const gateIndex = (u: number) => (Number.isFinite(u) ? Math.max(0, Math.min(GATES.length - 2, Math.floor(u))) : 0)
  const pos = (t: Tracer): [number, number] => {
    if (!Number.isFinite(t.u) || t.u < 0) t.u = 0
    const i = gateIndex(t.u)
    const f = t.u - i
    const a = GATES[i].g(t.lam, split)
    const b = GATES[i + 1].g(t.lam, split)
    return [a[0] + f * (b[0] - a[0]), a[1] + f * (b[1] - a[1])]
  }

  useAnimationFrame(
    (dt) => {
      const h = Math.min(dt, 0.04)
      const VIS = 0.045
      for (const t of tracers.current!) {
        if (!Number.isFinite(t.u) || t.u < 0) t.u = 0
        const i = gateIndex(t.u)
        const a = GATES[i].g(t.lam, split)
        const b = GATES[i + 1].g(t.lam, split)
        const seg = Math.max(0.02, Math.hypot(b[0] - a[0], b[1] - a[1]))
        const f = t.u - i
        const v = (1 - f) * speedAt(i, t.lam) + f * speedAt(i + 1, t.lam)
        t.u += Number.isFinite(v) ? (Math.min(v, 60) * VIS * h) / seg : 0
        if (!Number.isFinite(t.u) || t.u >= GATES.length - 1) {
          t.u = 0
          t.lam = 0.03 + 0.94 * rng.current()
        }
      }
      VORTICES.forEach((v, k) => {
        vort.current[k] += (v.sense * 0.25 * Vbar * 0.6 * h) / (Math.PI * (v.rx + v.ry))
      })
      setTick((x) => (x + 1) % 1e6)
    },
    playing && inView && !reduced,
  )

  const cells = useMemo(() => {
    if (layer === 'stream' || layer === 'arrows') return null
    const L = LAYERS[layer]
    const out: { x: number; y: number; c: string }[] = []
    const nx = 80
    const ny = 20
    for (let i = 0; i < nx; i++) {
      for (let j = 0; j < ny; j++) {
        const x = ((i + 0.5) / nx) * 4
        const y = ((j + 0.5) / ny) * 1
        let v = L.bg(x, y)
        for (const z of L.zones) {
          const w = Math.exp(-2 * (((x - z.x) / z.rx) ** 2 + ((y - z.y) / z.ry) ** 2))
          v = v * (1 - w) + z.v * w
        }
        out.push({ x: X((i / nx) * 4), y: Y(((j + 1) / ny) * 1), c: heat(v / 4, L.base) })
      }
    }
    return out
  }, [layer])

  const arrows = useMemo(() => {
    if (layer !== 'arrows') return null
    const out: { x: number; y: number; vx: number; vy: number }[] = []
    const inside = (x: number, y: number) => {
      if (x <= 0 || x >= 4 || y <= 0 || y >= 1) return false
      for (const r of UDUCT_RECTS) if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return false
      return true
    }
    for (let x = 0.1; x < 4; x += 0.2) for (let y = 0.05; y < 1; y += 0.1) if (inside(x, y)) {
      const [vx, vy] = velAt(x, y, V1, V2)
      out.push({ x, y, vx, vy })
    }
    return out
  }, [layer, V1, V2])

  const L = layer === 'stream' || layer === 'arrows' ? null : LAYERS[layer]
  const vScale = 0.17 / Math.max(V1, Vgap, 1) // metres of arrow per m/s
  const vortexLoop = (v: (typeof VORTICES)[number], f: number) => (
    <ellipse cx={X(v.x)} cy={Y(v.y)} rx={v.rx * f * PX} ry={v.ry * f * PX} fill="none" stroke="var(--plot-6)" strokeWidth={1.1} />
  )

  return (
    <SimPanel
      title="Obstructed U-duct explorer"
      subtitle="Example 9.5: Re check, continuity scales and the labelled k–ε results"
      wide
      controls={
        <>
          <Slider label="upper-inlet speed $V_1$" value={V1} min={2} max={60} step={0.5} onChange={setV1} unit="m/s" digits={3} />
          <Slider label="lower-inlet speed $V_2$" value={V2} min={0} max={40} step={0.5} onChange={setV2} unit="m/s" digits={3} />
          <Slider label="kinematic viscosity $\nu$" value={nu} min={1e-6} max={1e-2} log onChange={setNu} unit="m²/s" format={(v) => v.toExponential(2)} />
          <Segmented
            label="result plot"
            value={layer}
            onChange={setLayer}
            options={[
              { value: 'stream', label: 'streamlines' },
              { value: 'arrows', label: 'arrows' },
              { value: 'speed', label: '|v|' },
              { value: 'nuT', label: 'ν_T' },
              { value: 'eps', label: 'ln ε' },
              { value: 'p', label: 'p' },
            ]}
          />
          <div className="flex flex-wrap items-center gap-2">
            <PlayPause playing={playing} onToggle={() => setPlaying((p) => !p)} />
            <button type="button" className="btn-ghost text-sm" onClick={() => { setV1(30); setV2(10); setNu(EX95.nu) }}>
              Example 9.5 values
            </button>
          </div>
        </>
      }
      readout={
        <Readout
          items={[
            { label: 'mixed mean $\\bar V$', value: Vbar, digits: 3, unit: 'm/s' },
            { label: '$\\mathrm{Re}=\\bar V W/\\nu$', value: Math.round(Re).toLocaleString('en-US'), tone: Re > 5000 ? 'good' : 'bad' },
            { label: 'verdict (Re > 5,000?)', value: Re > 5000 ? 'turbulent → k–ε' : 'not clearly turbulent' },
            { label: 'gap speed (0.2 m)', value: Vgap, digits: 3, unit: 'm/s' },
            { label: '$\\tfrac12\\rho V_1^2$ (stagnation)', value: 0.5 * EX95.rho * V1 * V1, digits: 3, unit: 'Pa' },
            { label: '$\\tfrac12\\rho V_\\text{gap}^2$', value: 0.5 * EX95.rho * Vgap * Vgap, digits: 3, unit: 'Pa' },
          ]}
        />
      }
      footer={
        <Md inline>{md`Try this: set $V_2 = 0$ or drop $V_1$ to a few m/s and raise $\nu$ until Re falls below 5,000 — the book's turbulence check fails. Back at the Example 9.5 values, flip through the result plots: tracer density is proportional to flow rate (the fast upper jet carries 75 % of it), and the dots race through the two 0.2 m gaps at twice the mean speed.`}</Md>
      }
    >
      <div ref={wrap}>
        <svg viewBox="0 0 640 200" className="h-auto w-full" role="img" aria-label="Schematic results for the obstructed U-duct">
          <DuctShape clipId={clip} />
          <polygon points={POLY} fill="var(--surface-2)" />
          <g clipPath={`url(#${clip})`}>
            {cells?.map((c, i) => <rect key={i} x={c.x} y={c.y} width={PX * 0.05 + 0.6} height={PX * 0.05 + 0.6} fill={c.c} />)}
          </g>
          {layer === 'stream' ? (
            <g>
              {VORTICES.map((v, k) => (
                <g key={k}>
                  {vortexLoop(v, 0.95)}
                  {vortexLoop(v, 0.55)}
                  {[0, 1, 2].map((j) => {
                    const th = vort.current[k] + (j * 2 * Math.PI) / 3
                    const px = v.x + 0.95 * v.rx * Math.cos(th)
                    const py = v.y + 0.95 * v.ry * Math.sin(th)
                    const tx = -v.rx * Math.sin(th) * v.sense
                    const ty = v.ry * Math.cos(th) * v.sense
                    return <Head key={j} x={X(px)} y={Y(py)} dx={tx} dy={-ty} color="var(--plot-6)" size={8} />
                  })}
                </g>
              ))}
              {tracers.current!.map((t, i) => {
                const [x, y] = pos(t)
                return <circle key={i} cx={X(x)} cy={Y(y)} r={2} fill={t.lam < split ? 'var(--plot-2)' : 'var(--streamline)'} />
              })}
            </g>
          ) : null}
          {arrows?.map((a, i) => {
            const len = Math.hypot(a.vx, a.vy) * vScale
            const ang = Math.atan2(a.vy, a.vx)
            const x2 = a.x + len * Math.cos(ang)
            const y2 = a.y + len * Math.sin(ang)
            return <Arrow key={i} x1={X(a.x)} y1={Y(a.y)} x2={X(x2)} y2={Y(y2)} color="var(--quiver)" width={1.2} head={5} />
          })}
          <DuctShape />
          {layer === 'stream' ? (
            <>
              <Tag x={X(0.72)} y={Y(0.87)} text="C (cw)" tone="var(--plot-6)" />
              <Tag x={X(2.45)} y={Y(0.8)} text="C (cw)" tone="var(--plot-6)" />
              <Tag x={X(2.75)} y={Y(0.1)} text="A (ccw)" tone="var(--plot-6)" />
              <Tag x={X(1.75)} y={Y(0.3)} text="B (cw)" tone="var(--plot-6)" />
            </>
          ) : null}
          {layer === 'arrows' ? (
            <>
              <Tag x={X(1.3)} y={Y(0.84)} text="A" />
              <Tag x={X(2.75)} y={Y(0.1)} text="B" />
              <Tag x={X(1.75)} y={Y(0.3)} text="C" />
            </>
          ) : null}
          {L ? L.zones.filter((z) => z.tag).map((z, i) => <Tag key={i} x={X(z.x)} y={Y(z.y)} text={z.tag!} size={10} />) : null}
          <Label x={X(0) + 4} y={Y(1) - 6} anchor="start" size={11} cls="fill-ink-3" halo={false}>inlets V₁ (top), V₂</Label>
          <Label x={X(0) + 4} y={Y(0) + 16} anchor="start" size={11} cls="fill-ink-3" halo={false}>outlet ←</Label>
        </svg>
        <p className="mt-1 text-sm text-ink-2">
          {layer === 'stream'
            ? 'Streamlines (cf. Fig. E9.5.3): the fast upper jet entrains the slow lower jet, creating two clockwise vortices C; in the bottom channel a slower vortex sits just downstream of each step — A (counter-clockwise, behind r5) and B (clockwise, behind r4). Lighter dots came from the slow inlet.'
            : layer === 'arrows'
              ? 'Arrow plot (cf. Fig. E9.5.4): the fast upper jet spreads and decelerates as turbulence transfers its momentum transversely; high speeds at A (incoming jet) and in the constrictions B and C.'
              : L?.caption}
        </p>
      </div>
    </SimPanel>
  )
}

/** Boundary-layer mesh drawer: N prism layers growing geometrically from the wall (Fig. E9.5.2 settings). */
export function BoundaryLayerMeshLab() {
  const [N, setN] = useState(8)
  const [r, setR] = useState(1.1)
  const [h1, setH1] = useState(1)
  const total = Math.abs(r - 1) < 1e-9 ? N * h1 : (h1 * (r ** N - 1)) / (r - 1)
  const last = h1 * r ** (N - 1)
  const H = 200
  const scale = (H - 60) / Math.max(total * 1.6, 1e-9)
  const layers: number[] = []
  let acc = 0
  for (let i = 0; i < N; i++) {
    acc += h1 * r ** i
    layers.push(acc)
  }
  const wallY = H - 24
  return (
    <SimPanel
      title="Boundary-layer mesh"
      subtitle="layer i has thickness h₁ rⁱ⁻¹ (geometric growth)"
      controls={
        <>
          <Slider label="number of boundary layers $N$" value={N} min={1} max={16} step={1} onChange={(v) => setN(Math.round(v))} digits={2} />
          <Slider label="stretching factor $r$" value={r} min={1} max={1.5} step={0.01} onChange={setR} digits={3} />
          <Slider label="first-layer thickness $h_1$" value={h1} min={0.1} max={5} step={0.1} onChange={setH1} unit="mm" digits={2} />
        </>
      }
      readout={
        <Readout
          items={[
            { label: 'total thickness', value: total, digits: 4, unit: 'mm', tone: 'accent' },
            { label: 'total / $h_1$', value: total / h1, digits: 4 },
            { label: 'last layer $h_1 r^{N-1}$', value: last, digits: 3, unit: 'mm' },
            { label: 'last / first', value: last / h1, digits: 3 },
          ]}
        />
      }
      footer="Try this: set N = 8, r = 1.1 (the entries of Fig. E9.5.2): the stack is 11.44 first-layer thicknesses deep and the outermost layer is only about twice the first, so the cells blend smoothly into the triangular mesh above."
    >
      <svg viewBox={`0 0 600 ${H}`} className="h-auto w-full" role="img" aria-label="Stack of boundary-layer mesh cells above a wall">
        {/* triangles above the stack */}
        {Array.from({ length: 12 }, (_, i) => {
          const x0 = 30 + i * 45
          const yTop = wallY - total * scale
          return (
            <g key={i} stroke="var(--ink-3)" strokeWidth={0.7} fill="none">
              <polygon points={`${x0},${yTop} ${x0 + 45},${yTop} ${x0 + 22.5},${yTop - 38}`} />
              <line x1={x0 + 22.5} y1={yTop - 38} x2={x0 + 67.5} y2={yTop - 38} />
            </g>
          )
        })}
        {layers.map((y, i) => (
          <rect
            key={i}
            x={30}
            y={wallY - y * scale}
            width={540}
            height={h1 * r ** i * scale}
            fill={`color-mix(in srgb, var(--plot-1) ${Math.round(10 + (60 * (N - i)) / N)}%, var(--surface))`}
            stroke="var(--ink-2)"
            strokeWidth={0.6}
          />
        ))}
        {Array.from({ length: 13 }, (_, i) => (
          <line key={i} x1={30 + i * 45} x2={30 + i * 45} y1={wallY} y2={wallY - total * scale} stroke="var(--ink-2)" strokeWidth={0.6} />
        ))}
        <rect x={20} y={wallY} width={560} height={10} fill="var(--body-fill)" stroke="var(--ink-3)" />
        <Label x={300} y={wallY + 22} size={12} cls="fill-ink-2" halo={false}>wall</Label>
        <Dim x1={585} y1={wallY} x2={585} y2={wallY - total * scale} label="" />
        <Label x={590} y={wallY - total * scale - 6} anchor="end" size={12}>{`${total.toFixed(2)} mm`}</Label>
      </svg>
    </SimPanel>
  )
}
