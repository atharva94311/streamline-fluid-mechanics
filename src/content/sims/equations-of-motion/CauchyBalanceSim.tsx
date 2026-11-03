import { useMemo, useState } from 'react'
import { FlowField, Readout, Segmented, SimPanel, Slider, Toggle, md, num } from '@/kit'
import { Arrow, COL } from './svg'

export type CauchyFlow = 'stag' | 'rot' | 'accel' | 'rest'
type V2 = [number, number]

export const RHO_WATER = 1000
export const G = 9.81

/**
 * Local and convective acceleration of the four preset flows at (x, y).
 *  stag : u = a x,  v = −a y        (steady; convective only)
 *  rot  : u = −Ω y, v = Ω x         (steady rigid-body rotation; centripetal)
 *  accel: u = U0 + b t, v = 0       (uniform stream speeding up; local only)
 *  rest : V = 0
 */
export function presetAcceleration(flow: CauchyFlow, k: number, x: number, y: number): { local: V2; conv: V2; vel: V2 } {
  switch (flow) {
    case 'stag':
      return { local: [0, 0], conv: [k * k * x, k * k * y], vel: [k * x, -k * y] }
    case 'rot':
      return { local: [0, 0], conv: [-k * k * x, -k * k * y], vel: [-k * y, k * x] }
    case 'accel':
      // vel is only a snapshot direction for the tracer animation: the speed U(t) itself changes in time
      return { local: [k, 0], conv: [0, 0], vel: [1, 0] }
    default:
      return { local: [0, 0], conv: [0, 0], vel: [0, 0] }
  }
}

/** Net surface force per unit volume that the stresses must supply: f_s = ρa − ρg (Cauchy). */
export function requiredSurfaceForce(a: V2, rho: number, gy: number): V2 {
  return [rho * a[0], rho * a[1] - rho * gy]
}

const PARAM: Record<Exclude<CauchyFlow, 'rest'>, { label: string; min: number; max: number; step: number; unit: string; init: number }> = {
  stag: { label: 'strain rate $a$', min: 0.2, max: 3, step: 0.05, unit: '1/s', init: 2 },
  rot: { label: md`angular speed $\Omega$`, min: 0.2, max: 3, step: 0.05, unit: 'rad/s', init: 1.5 },
  accel: { label: 'rate of speed-up $b$', min: -4, max: 4, step: 0.1, unit: 'm/s²', init: 3 },
}

const pair = (v: V2, d = 3) => `(${num.fmt(v[0], d)}, ${num.fmt(v[1], d)})`

export function CauchyBalanceSim() {
  const [flow, setFlow] = useState<CauchyFlow>('stag')
  const [ks, setKs] = useState({ stag: PARAM.stag.init, rot: PARAM.rot.init, accel: PARAM.accel.init })
  const [px, setPx] = useState(1)
  const [py, setPy] = useState(0.5)
  const [vertical, setVertical] = useState(true)

  const k = flow === 'rest' ? 0 : ks[flow]
  const gy = vertical ? -G : 0
  const acc = presetAcceleration(flow, k, px, py)
  const a: V2 = [acc.local[0] + acc.conv[0], acc.local[1] + acc.conv[1]]
  const rhoA: V2 = [RHO_WATER * a[0], RHO_WATER * a[1]]
  const rhoG: V2 = [0, RHO_WATER * gy]
  const fs = requiredSurfaceForce(a, RHO_WATER, gy)

  const psi = useMemo<((x: number, y: number) => number) | undefined>(() => {
    if (flow === 'stag') return (x, y) => k * x * y
    if (flow === 'rot') return (x, y) => (-k * (x * x + y * y)) / 2
    if (flow === 'accel') return (_x, y) => y
    return undefined
  }, [flow, k])

  const mag = (v: V2) => Math.hypot(v[0], v[1])
  const big = Math.max(mag(rhoA), mag(rhoG), mag(fs), 1e-9)
  const s = 1.1 / big // data units (m) per N/m³ so the largest arrow is 1.1 m long on the 4 m wide map

  const footer: Record<CauchyFlow, string> = {
    stag:
      'Try this: use the sliders to move the point to the origin (the stagnation point) — the acceleration vanishes and, with gravity on, the stresses only have to hold up the weight (indigo = −amber, the hydrostatic balance). Then move along the x-axis and watch ρa grow linearly with distance.',
    rot:
      'Try this: move the point outward — the centripetal acceleration ρa always points at the axis and grows with radius, so the surface force must push the fluid inward harder and harder: pressure must rise with radius.',
    accel:
      'Try this: this flow is unsteady but uniform — the acceleration is the same everywhere (local part only). Move the point anywhere: the force polygon does not change. Flip the sign of b to decelerate the stream.',
    rest:
      'Try this: with the fluid at rest the right-hand side is zero, so the stress derivatives must exactly cancel gravity at every point — Cauchy reduces to hydrostatics. Switch gravity off and nothing at all is needed.',
  }

  return (
    <SimPanel
      title="Cauchy balance at a point"
      subtitle="water, ρ = 1000 kg/m³"
      wide
      controls={
        <>
          <Segmented
            label="Flow"
            value={flow}
            onChange={setFlow}
            options={[
              { value: 'stag', label: 'stagnation' },
              { value: 'rot', label: 'rigid rotation' },
              { value: 'accel', label: 'speeding-up stream' },
              { value: 'rest', label: 'at rest' },
            ]}
          />
          {flow !== 'rest' ? (
            <Slider
              label={PARAM[flow].label}
              value={ks[flow]}
              min={PARAM[flow].min}
              max={PARAM[flow].max}
              step={PARAM[flow].step}
              unit={PARAM[flow].unit}
              onChange={(x) => setKs((o) => ({ ...o, [flow]: x }))}
            />
          ) : null}
          <Slider label="point $x$" value={px} min={-1.8} max={1.8} step={0.05} onChange={setPx} unit="m" />
          <Slider label="point $y$" value={py} min={-1.8} max={1.8} step={0.05} onChange={setPy} unit="m" />
          <Toggle label="vertical plane: gravity along $-y$" checked={vertical} onChange={setVertical} />
          <div className="rounded-xl bg-surface-2 px-3 py-2 text-xs text-ink-2">
            {flow === 'accel' ? 'Velocity here: (U(t), 0) — the same at every point, changing in time' : `Velocity here: ${pair(acc.vel)} m/s`}
            <br />
            local part ∂V/∂t: {pair(acc.local)} m/s²
            <br />
            convective part (V·∇)V: {pair(acc.conv)} m/s²
          </div>
        </>
      }
      readout={
        <Readout
          items={[
            { label: 'acceleration (x)', value: a[0], unit: 'm/s²' },
            { label: 'acceleration (y)', value: a[1], unit: 'm/s²' },
            { label: 'surface force / vol (x)', value: fs[0], unit: 'N/m³', tone: 'accent' },
            { label: 'surface force / vol (y)', value: fs[1], unit: 'N/m³', tone: 'accent' },
          ]}
        />
      }
      footer={<span>{footer[flow]}</span>}
    >
      <FlowField
        x={[-2, 2]}
        y={[-2, 2]}
        psi={psi}
        psiLevels={16}
        particles={flow === 'rest' ? 0 : 70}
        speed={0.9}
        maxHeight={420}
        markers={[{ x: px, y: py, kind: 'point' }]}
        overlay={({ sx, sy }) => {
          const P: V2 = [px, py]
          const tipG: V2 = [P[0] + s * rhoG[0], P[1] + s * rhoG[1]]
          const tipA: V2 = [P[0] + s * rhoA[0], P[1] + s * rhoA[1]]
          const lab = (v: V2, text: string, color: string, dx = 8, dy = -6) => (
            <text
              x={sx(v[0]) + dx}
              y={sy(v[1]) + dy}
              fontSize={12}
              fontWeight={700}
              fill={color}
              paintOrder="stroke"
              stroke="var(--surface)"
              strokeWidth={3.5}
            >
              {text}
            </text>
          )
          return (
            <g>
              <Arrow x1={sx(P[0])} y1={sy(P[1])} x2={sx(tipG[0])} y2={sy(tipG[1])} color={COL.body} width={3} head={11} />
              <Arrow x1={sx(tipG[0])} y1={sy(tipG[1])} x2={sx(tipA[0])} y2={sy(tipA[1])} color={COL.normal} width={3} head={11} />
              <Arrow x1={sx(P[0])} y1={sy(P[1])} x2={sx(tipA[0])} y2={sy(tipA[1])} color={COL.net} width={3} head={11} />
              {mag(rhoG) * s > 0.08 ? lab([(P[0] + tipG[0]) / 2, (P[1] + tipG[1]) / 2], 'ρg', COL.body) : null}
              {mag(fs) * s > 0.08 ? lab([(tipG[0] + tipA[0]) / 2, (tipG[1] + tipA[1]) / 2], 'f_s', COL.normal) : null}
              {mag(rhoA) * s > 0.08 ? lab([(P[0] + tipA[0]) / 2, (P[1] + tipA[1]) / 2], 'ρa', COL.net, -26, -6) : null}
            </g>
          )
        }}
      />
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-2">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-1 w-5 rounded" style={{ background: COL.net }} /> ρa = ρ DV/Dt (mass × acceleration per volume)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-1 w-5 rounded" style={{ background: COL.body }} /> ρg (body force per volume)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-1 w-5 rounded" style={{ background: COL.normal }} /> f_s = sum of stress derivatives (surface force per volume)
        </span>
      </div>
      <p className="mt-1 text-xs text-ink-3">
        The three arrows close a triangle: ρg + f_s = ρa — the Cauchy equation as a vector picture. |ρa| = {num.fmt(mag(rhoA), 3)} N/m³, |ρg| ={' '}
        {num.fmt(mag(rhoG), 3)} N/m³, |f_s| = {num.fmt(mag(fs), 3)} N/m³.
      </p>
    </SimPanel>
  )
}

