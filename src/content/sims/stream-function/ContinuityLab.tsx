/**
 * Concept "definition": a material element is carried by the velocity generated from ψ.
 * With the course sign (v = −∂ψ/∂x) its area never changes and tracers follow the ψ lines;
 * with the wrong sign (v = +∂ψ/∂x) the divergence becomes 2 ∂²ψ/∂x∂y and tracers cut across the ψ lines.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  FlowField, PlayPause, Readout, Segmented, SimPanel, Slider, Toggle, md, type FlowMarker,
  useAnimationFrame, useInView, usePrefersReducedMotion,
} from '@/kit'
import { advect, centroid, divergence, polygonArea, squareLoop, type V2, type VelFn } from './fields'

type Key = 'corner' | 'example' | 'rotation'
type F = (x: number, y: number) => number

interface Preset {
  label: string
  param: string
  unit: string
  min: number
  max: number
  def: number
  tex: string
  psi: (k: number) => F
  /** ∂ψ/∂x */
  px: (k: number) => F
  /** ∂ψ/∂y */
  py: (k: number) => F
}

const PRESETS: Record<Key, Preset> = {
  corner: {
    label: md`corner $Axy$`,
    param: md`strength $A$`,
    unit: 's⁻¹',
    min: 0.3,
    max: 2,
    def: 1,
    tex: md`\psi = A\,xy`,
    psi: (k) => (x, y) => k * x * y,
    px: (k) => (_x, y) => k * y,
    py: (k) => (x) => k * x,
  },
  example: {
    label: md`Example 1 field`,
    param: md`scale $k$ ($k = 1$: worked example)`,
    unit: '',
    min: 0.1,
    max: 1,
    def: 0.3,
    tex: md`\psi = k\,(2x^2y + y^2)`,
    psi: (k) => (x, y) => k * (2 * x * x * y + y * y),
    px: (k) => (x, y) => 4 * k * x * y,
    py: (k) => (x, y) => k * (2 * x * x + 2 * y),
  },
  rotation: {
    label: md`rigid rotation`,
    param: md`angular speed $\Omega$`,
    unit: 'rad/s',
    min: 0.3,
    max: 2,
    def: 1,
    tex: md`\psi = -\tfrac{\Omega}{2}(x^2 + y^2)`,
    psi: (k) => (x, y) => -0.5 * k * (x * x + y * y),
    px: (k) => (x) => -k * x,
    py: (k) => (_x, y) => -k * y,
  },
}

const X: [number, number] = [-2, 2]
const Y: [number, number] = [-1.5, 1.5]
const HALF = 0.16
const A0 = (2 * HALF) ** 2

export function ContinuityLab() {
  const [key, setKey] = useState<Key>('corner')
  const P = PRESETS[key]
  const [k, setK] = useState(P.def)
  const [x0, setX0] = useState(0.5)
  const [y0, setY0] = useState(0.6)
  const [wrong, setWrong] = useState(false)
  const [playing, setPlaying] = useState(true)
  const [el, setEl] = useState<{ pts: V2[]; t: number }>(() => ({ pts: squareLoop(0.5, 0.6, HALF), t: 0 }))

  const psi = useMemo(() => P.psi(k), [P, k])
  const vel = useMemo<VelFn>(() => {
    const fx = P.px(k)
    const fy = P.py(k)
    return wrong ? (x, y) => [fy(x, y), fx(x, y)] : (x, y) => [fy(x, y), -fx(x, y)]
  }, [P, k, wrong])

  // restart the element whenever the field or its starting point changes
  useEffect(() => {
    setEl({ pts: squareLoop(x0, y0, HALF), t: 0 })
  }, [x0, y0, vel])

  const box = useRef<HTMLDivElement>(null)
  const inView = useInView(box)
  const reduced = usePrefersReducedMotion()
  useAnimationFrame((dt) => {
    setEl((s) => {
      const c = centroid(s.pts)
      const sp = Math.hypot(...vel(c[0], c[1]))
      const rate = 0.55 / Math.max(0.35, Number.isFinite(sp) ? sp : 1) // flow-seconds per wall-second
      const h = dt * rate
      const pts = advect(vel, advect(vel, s.pts, h / 2), h / 2)
      const out = pts.some(
        ([px, py]) => !(Number.isFinite(px) && Number.isFinite(py)) || px < X[0] - 0.4 || px > X[1] + 0.4 || py < Y[0] - 0.4 || py > Y[1] + 0.4,
      )
      if (out || s.t + h > 6) return { pts: squareLoop(x0, y0, HALF), t: 0 }
      return { pts, t: s.t + h }
    })
  }, playing && inView && !reduced)

  const [u0, v0] = vel(x0, y0)
  const divRaw = divergence(vel, x0, y0)
  const div = Math.abs(divRaw) < 1e-6 ? 0 : divRaw
  const ratio = polygonArea(el.pts) / A0
  const fx = P.px(k)(x0, y0)
  const fy = P.py(k)(x0, y0)
  const tl = Math.hypot(fx, fy)
  const vl = Math.hypot(u0, v0)
  // angle between V and the local ψ contour (tangent t = (ψy, −ψx))
  const ang = tl > 1e-9 && vl > 1e-9 ? (Math.acos(Math.min(1, Math.abs(u0 * fy - v0 * fx) / (tl * vl))) * 180) / Math.PI : 0
  const markers = useMemo<FlowMarker[]>(() => [{ x: x0, y: y0, label: 'P', kind: 'point' }], [x0, y0])
  const col = wrong ? 'var(--plot-4)' : 'var(--plot-5)'

  return (
    <SimPanel
      title="Continuity lab — what the minus sign buys you"
      subtitle={md`$${P.tex}$ with $u = \psi_y$, $v = ${wrong ? '+' : '-'}\psi_x$`}
      wide
      controls={
        <>
          <Segmented
            label="Stream function"
            options={(Object.keys(PRESETS) as Key[]).map((kk) => ({ value: kk, label: PRESETS[kk].label }))}
            value={key}
            onChange={(v) => {
              setKey(v)
              setK(PRESETS[v].def)
            }}
          />
          <Slider label={P.param} value={k} min={P.min} max={P.max} step={0.05} onChange={setK} unit={P.unit} digits={2} />
          <Slider label="element centre $x_P$" value={x0} min={-1.6} max={1.6} step={0.05} onChange={setX0} unit="m" digits={2} />
          <Slider label="element centre $y_P$" value={y0} min={-1.2} max={1.2} step={0.05} onChange={setY0} unit="m" digits={2} />
          <Toggle label={md`wrong sign: $v = +\partial\psi/\partial x$`} checked={wrong} onChange={setWrong} />
          <PlayPause playing={playing} onToggle={() => setPlaying((p) => !p)} onReset={() => setEl({ pts: squareLoop(x0, y0, HALF), t: 0 })} />
        </>
      }
      readout={
        <Readout
          items={[
            { label: '$u$ at $P$', value: u0, unit: 'm/s' },
            { label: '$v$ at $P$', value: v0, unit: 'm/s' },
            { label: md`$\nabla\cdot\mathbf{V}$ at $P$`, value: div, unit: 's⁻¹', tone: div === 0 ? 'good' : 'bad' },
            { label: md`element area $A/A_0$`, value: ratio.toFixed(3), tone: Math.abs(ratio - 1) < 0.01 ? 'good' : 'bad' },
            { label: md`angle between $\mathbf{V}$ and the $\psi$-line`, value: `${ang.toFixed(1)}°`, tone: ang < 0.5 ? 'good' : 'bad' },
            { label: 'flow time $t$', value: el.t.toFixed(2), unit: 's' },
          ]}
        />
      }
      footer={
        <span>
          <b>Try this:</b> watch the green element in the corner flow — it is squashed and stretched, yet <i>A/A₀</i> stays at 1.000. Now
          switch on the wrong sign: the element turns red and balloons (here ∇·V = 2∂²ψ/∂x∂y = 2A), and the tracers cut straight
          across the ψ lines. Try rigid rotation with the wrong sign too: the area survives (∂²ψ/∂x∂y = 0) but the flow no longer
          follows the circles.
        </span>
      }
    >
      <div ref={box}>
        <FlowField
          x={X}
          y={Y}
          psi={psi}
          vel={vel}
          particles={70}
          markers={markers}
          maxHeight={380}
          overlay={({ sx, sy }) => (
            <g>
              <rect
                x={sx(x0 - HALF)}
                y={sy(y0 + HALF)}
                width={sx(x0 + HALF) - sx(x0 - HALF)}
                height={sy(y0 - HALF) - sy(y0 + HALF)}
                fill="none"
                stroke="var(--ink-3)"
                strokeDasharray="4 3"
              />
              <polygon
                points={el.pts.map(([px, py]) => `${sx(px).toFixed(1)},${sy(py).toFixed(1)}`).join(' ')}
                fill={col}
                fillOpacity={0.28}
                stroke={col}
                strokeWidth={2}
              />
            </g>
          )}
        />
      </div>
    </SimPanel>
  )
}
