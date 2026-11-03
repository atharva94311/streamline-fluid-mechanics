/**
 * Concept "streamlines": two independent constructions of the streamline through P —
 *  (1) the contour ψ = ψ(P) drawn by the contouring routine, and
 *  (2) a step-by-step RK4 integration of dy/dx = v/u starting at P —
 * land on top of each other. V at P is shown split into u and v (as in Lecture 9, slide 13).
 */
import { useMemo, useState, type MouseEvent } from 'react'
import { FlowField, Readout, Segmented, SimPanel, Slider, Toggle, md, num, type FlowMarker } from '@/kit'
import { traceStreamline, type Bounds, type ScalarFn, type V2, type VelFn } from './fields'

type Key = 'wavy' | 'corner' | 'body' | 'rotation'

interface Preset {
  label: string
  param: string
  unit: string
  min: number
  max: number
  def: number
  step: number
  bounds: Bounds
  tex: string
  psi: (k: number) => ScalarFn
  vel: (k: number) => VelFn
  body?: (k: number) => (x: number, y: number) => boolean
  markers?: (k: number) => FlowMarker[]
  P0: V2
}

const TWO_PI = 2 * Math.PI
const halfBody = (a: number) => (x: number, y: number) => Math.abs(y) < a * (Math.PI - Math.atan2(Math.abs(y), x))

const PRESETS: Record<Key, Preset> = {
  wavy: {
    label: 'wavy (house)',
    param: md`wave amplitude $V_0$`,
    unit: 'm/s',
    min: 0,
    max: 0.8,
    def: 0.4,
    step: 0.05,
    bounds: [-4, 4, -2, 2],
    tex: md`\psi = Uy + \tfrac{V_0}{k}\cos kx\ \ (U = 1\ \mathrm{m/s},\ k = \pi/2\ \mathrm{m^{-1}})`,
    psi: (k) => (x, y) => y + (k / (Math.PI / 2)) * Math.cos((Math.PI / 2) * x),
    vel: (k) => (x) => [1, k * Math.sin((Math.PI / 2) * x)],
    P0: [-3, 0.5],
  },
  corner: {
    label: 'corner',
    param: md`strength $A$`,
    unit: 's⁻¹',
    min: 0.3,
    max: 2,
    def: 1,
    step: 0.05,
    bounds: [-2, 2, -1.5, 1.5],
    tex: md`\psi = A\,xy`,
    psi: (k) => (x, y) => k * x * y,
    vel: (k) => (x, y) => [k * x, -k * y],
    markers: () => [{ x: 0, y: 0, kind: 'stagnation' }],
    P0: [0.4, 1.2],
  },
  body: {
    label: 'blunt body',
    param: md`nose distance $a = m/2\pi U$`,
    unit: 'm',
    min: 0.2,
    max: 0.7,
    def: 0.45,
    step: 0.05,
    bounds: [-3, 3, -2, 2],
    tex: md`\psi = Uy + \tfrac{m}{2\pi}\,\theta\ \ (U = 1\ \mathrm{m/s})`,
    // ψ is left undefined inside the body (it is multivalued there) so no contour is drawn through it
    psi: (a) => {
      const inside = halfBody(a)
      return (x, y) => {
        if (inside(x, y)) return NaN
        const t = Math.atan2(y, x)
        return y + a * (t < 0 ? t + TWO_PI : t)
      }
    },
    vel: (a) => (x, y) => {
      const r2 = x * x + y * y
      return [1 + (a * x) / r2, (a * y) / r2]
    },
    body: halfBody,
    markers: (a) => [{ x: -a, y: 0, kind: 'stagnation' }],
    P0: [-2.5, 0.35],
  },
  rotation: {
    label: 'rigid rotation',
    param: md`angular speed $\Omega$`,
    unit: 'rad/s',
    min: 0.3,
    max: 2,
    def: 1,
    step: 0.05,
    bounds: [-2, 2, -1.5, 1.5],
    tex: md`\psi = -\tfrac{\Omega}{2}(x^2 + y^2)`,
    psi: (k) => (x, y) => -0.5 * k * (x * x + y * y),
    vel: (k) => (x, y) => [-k * y, k * x],
    P0: [1, 0],
  },
}

export function StreamlineTracer() {
  const [key, setKey] = useState<Key>('wavy')
  const Pr = PRESETS[key]
  const [k, setK] = useState(Pr.def)
  const [p, setP] = useState<V2>(Pr.P0)
  const [showTrace, setShowTrace] = useState(true)
  const [bx0, bx1, by0, by1] = Pr.bounds
  const span = bx1 - bx0

  const psi = useMemo(() => Pr.psi(k), [Pr, k])
  const vel = useMemo(() => Pr.vel(k), [Pr, k])
  const body = useMemo(() => Pr.body?.(k), [Pr, k])
  const markers = useMemo<FlowMarker[]>(() => [...(Pr.markers?.(k) ?? []), { x: p[0], y: p[1], label: 'P', kind: 'point' }], [Pr, k, p])

  const inside = body ? body(p[0], p[1]) : false
  const psiP = psi(p[0], p[1])
  const [u, v] = vel(p[0], p[1])
  const speed = Math.hypot(u, v)

  const trace = useMemo(
    () => (inside ? [] : traceStreamline(vel, p[0], p[1], { bounds: Pr.bounds, step: span / 60, maxSteps: 700, body })),
    [inside, vel, p, Pr.bounds, span, body],
  )
  const dev = useMemo(() => {
    let m = 0
    for (const q of trace) {
      const d = Math.abs(psi(q[0], q[1]) - psiP)
      if (Number.isFinite(d)) m = Math.max(m, d)
    }
    return m
  }, [trace, psi, psiP])
  const highlight = useMemo(
    () => (Number.isFinite(psiP) ? [{ level: psiP, color: 'var(--plot-4)', width: 3, label: 'contour ψ = ψ(P)' }] : []),
    [psiP],
  )

  // half-body surface y = a(π − θ): it is the dividing streamline ψ = πaU through the stagnation point (U = 1 here)
  const outline = useMemo<V2[]>(() => {
    if (key !== 'body') return []
    const up: V2[] = []
    for (let i = 0; i <= 160; i++) {
      const th = 0.02 + ((Math.PI - 1e-4 - 0.02) * i) / 160
      const y = k * (Math.PI - th)
      const x = y / Math.tan(th)
      if (x <= bx1 + 0.5) up.push([x, y])
    }
    // upper branch runs downstream → nose; continue through the nose along the mirrored lower branch
    return [...up, ...up.slice().reverse().map(([x, y]) => [x, -y] as V2)]
  }, [key, k, bx1])

  const clampX = (x: number) => num.clamp(x, bx0 + 0.05 * span, bx1 - 0.05 * span)
  const clampY = (y: number) => num.clamp(y, by0 + 0.05 * span, by1 - 0.05 * span)
  const slope = Math.abs(u) < 1e-9 ? '∞ (vertical)' : num.fmt(v / u, 3)

  return (
    <SimPanel
      title="Streamline tracer — contour of ψ vs. integrating dy/dx = v/u"
      subtitle={md`$${Pr.tex}$ · axes in m · click in the field to move $P$`}
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
              setP(PRESETS[nk].P0)
            }}
          />
          <Slider label={Pr.param} value={k} min={Pr.min} max={Pr.max} step={Pr.step} onChange={setK} unit={Pr.unit} digits={2} />
          <Slider label="$x_P$" value={p[0]} min={bx0 + 0.05 * span} max={bx1 - 0.05 * span} step={0.02} onChange={(x) => setP([x, p[1]])} unit="m" digits={3} />
          <Slider label="$y_P$" value={p[1]} min={by0 + 0.05 * span} max={by1 - 0.05 * span} step={0.02} onChange={(y) => setP([p[0], y])} unit="m" digits={3} />
          <Toggle label="show the integrated streamline (amber dots)" checked={showTrace} onChange={setShowTrace} />
        </>
      }
      readout={
        inside ? (
          <div className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-ink-2 dark:border-amber-500/30 dark:bg-amber-500/10">
            P is inside the body — click in the flow outside it.
          </div>
        ) : (
          <Readout
            items={[
              { label: md`$\psi(P)$`, value: psiP, unit: 'm²/s' },
              { label: md`$|\mathbf{V}|$ at $P$`, value: speed, unit: 'm/s' },
              { label: '$u$', value: u, unit: 'm/s' },
              { label: '$v$', value: v, unit: 'm/s' },
              { label: '$dy/dx = v/u$', value: slope, tone: 'accent' },
              { label: md`max $|\psi - \psi(P)|$ on dots`, value: trace.length > 1 ? num.fmt(dev, 2) : '—', unit: 'm²/s', tone: 'good' },
            ]}
          />
        )
      }
      footer={
        <span>
          <b>Try this:</b> click anywhere in the field. The red curve is just the contour ψ = ψ(P); the amber dots come from
          integrating dy/dx = v/u step by step from P. They sit on top of each other and ψ stays constant along the dots to
          round-off — lines of constant ψ <i>are</i> streamlines. On the blunt body, set y<sub>P</sub> = 0.02 m (just above the
          stagnation line): the streamline runs up to the nose and then hugs the body, because the body surface is itself the
          dividing streamline ψ = πaU that meets the stagnation line at the nose. At y<sub>P</sub> = 0 the tracing stops at the
          stagnation point, where V = 0 and dy/dx = v/u is undefined.
        </span>
      }
    >
      <FlowField
        x={[bx0, bx1]}
        y={[by0, by1]}
        psi={psi}
        vel={vel}
        body={body}
        highlight={highlight}
        markers={markers}
        particles={45}
        maxHeight={400}
        overlay={({ sx, sy }) => {
          const W = sx(bx1) - sx(bx0)
          const L = 0.12 * W
          const px = sx(p[0])
          const py = sy(p[1])
          const dx = speed > 1e-9 ? (L * u) / speed : 0
          const dy = speed > 1e-9 ? (-L * v) / speed : 0
          const onClick = (e: MouseEvent<SVGRectElement>) => {
            const svg = e.currentTarget.ownerSVGElement
            if (!svg) return
            const r = svg.getBoundingClientRect()
            const X = bx0 + ((e.clientX - r.left - sx(bx0)) / (sx(bx1) - sx(bx0))) * (bx1 - bx0)
            const Y = by0 + ((e.clientY - r.top - sy(by0)) / (sy(by1) - sy(by0))) * (by1 - by0)
            setP([clampX(X), clampY(Y)])
          }
          return (
            <g>
              {outline.length > 1 ? (
                <g pointerEvents="none">
                  <path
                    d={outline.map(([ox, oy], i) => `${i ? 'L' : 'M'}${sx(ox).toFixed(1)} ${sy(oy).toFixed(1)}`).join('')}
                    fill="none"
                    stroke="var(--ink-2)"
                    strokeWidth={2}
                  />
                  <text x={sx(1.5)} y={sy(0) - 4} textAnchor="middle" className="fill-ink-2 text-[11px]">
                    surface = dividing streamline
                  </text>
                  <text x={sx(1.5)} y={sy(0) + 11} textAnchor="middle" className="fill-ink-2 text-[11px]">
                    ψ = πaU = {(Math.PI * k).toFixed(2)} m²/s
                  </text>
                </g>
              ) : null}
              {showTrace && trace.length > 1
                ? trace.map((q, i) => (i % 2 === 0 ? <circle key={i} cx={sx(q[0])} cy={sy(q[1])} r={2.3} fill="var(--plot-3)" /> : null))
                : null}
              {!inside && speed > 1e-9 ? (
                <g pointerEvents="none">
                  <line x1={px - 1.6 * dx} y1={py - 1.6 * dy} x2={px + 1.6 * dx} y2={py + 1.6 * dy} stroke="var(--ink-3)" strokeDasharray="5 4" strokeWidth={1.2} />
                  <line x1={px + dx} y1={py} x2={px + dx} y2={py + dy} stroke="var(--ink-3)" strokeDasharray="3 3" />
                  <line x1={px} y1={py + dy} x2={px + dx} y2={py + dy} stroke="var(--ink-3)" strokeDasharray="3 3" />
                  <line x1={px} y1={py} x2={px + dx} y2={py} stroke="var(--plot-1)" strokeWidth={2.4} />
                  <line x1={px} y1={py} x2={px} y2={py + dy} stroke="var(--plot-4)" strokeWidth={2.4} />
                  <line x1={px} y1={py} x2={px + dx} y2={py + dy} stroke="var(--ink)" strokeWidth={3} />
                  <circle cx={px + dx} cy={py + dy} r={3.5} fill="var(--ink)" />
                  <text x={px + dx + 6} y={py + dy - 4} className="fill-ink text-[12px] font-bold" paintOrder="stroke" stroke="var(--surface)" strokeWidth={3}>
                    V
                  </text>
                  <text x={px + dx / 2} y={py + (dy > 0 ? -6 : 14)} textAnchor="middle" className="fill-ink-2 text-[12px] italic" paintOrder="stroke" stroke="var(--surface)" strokeWidth={3}>
                    u
                  </text>
                  <text x={px + (dx > 0 ? -8 : 8)} y={py + dy / 2 + 4} textAnchor={dx > 0 ? 'end' : 'start'} className="fill-ink-2 text-[12px] italic" paintOrder="stroke" stroke="var(--surface)" strokeWidth={3}>
                    v
                  </text>
                </g>
              ) : null}
              <rect x={sx(bx0)} y={sy(by1)} width={W} height={sy(by0) - sy(by1)} fill="transparent" onClick={onClick} style={{ cursor: 'crosshair' }} />
            </g>
          )
        }}
      />
    </SimPanel>
  )
}
