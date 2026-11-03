import { useMemo, useState } from 'react'
import { Md, Readout, Segmented, SimPanel, Slider, md } from '@/kit'
import { DivergenceMap, type V2 } from './DivergenceMap'
import { Verdict, pn, sumTeX, tn } from './shared'

type P = Record<string, number>
interface Param {
  key: string
  label: string
  min: number
  max: number
  step: number
  def: number
  unit: string
}
interface Preset {
  id: string
  name: string
  params: Param[]
  vel: (p: P, x: number, y: number, t: number) => V2
  /** [∂u/∂x, ∂v/∂y, ∂w/∂z] at (x, y, t) */
  terms: (p: P, x: number, y: number, t: number) => [number, number, number]
  field: (p: P) => string
  termTeX: (p: P) => [string, string, string]
  divTeX: (p: P) => string
  passes: (p: P) => boolean
  unsteady?: boolean
  /** has an out-of-plane ∂w/∂z: the material squares then also track their depth (volume = area × depth) */
  threeD?: boolean
  note: string
}

const W = 1.5 // rad/s, unsteady preset
const zero = (v: number) => Math.abs(v) < 1e-9

const PRESETS: Preset[] = [
  {
    id: 'linear',
    name: 'Linear 2-D',
    params: [
      { key: 'a', label: md`$a$ (in $u$)`, min: -2, max: 2, step: 0.1, def: 1, unit: '1/s' },
      { key: 'b', label: md`$b$ (in $u$)`, min: -2, max: 2, step: 0.1, def: 0.5, unit: '1/s' },
      { key: 'c', label: md`$c$ (in $v$)`, min: -2, max: 2, step: 0.1, def: 0, unit: '1/s' },
      { key: 'd', label: md`$d$ (in $v$)`, min: -2, max: 2, step: 0.1, def: -1, unit: '1/s' },
    ],
    vel: (p, x, y) => [p.a * x + p.b * y, p.c * x + p.d * y],
    terms: (p) => [p.a, p.d, 0],
    field: (p) => md`u = ${sumTeX([[p.a, 'x'], [p.b, 'y']])},\qquad v = ${sumTeX([[p.c, 'x'], [p.d, 'y']])},\qquad w = 0`,
    termTeX: (p) => [tn(p.a), tn(p.d), '0'],
    divTeX: (p) => tn(p.a + p.d),
    passes: (p) => zero(p.a + p.d),
    note: md`$u = ax + by,\ v = cx + dy$. Only the diagonal coefficients $a = \partial u/\partial x$ and $d = \partial v/\partial y$ enter $\nabla\cdot\mathbf V$; the cross terms $b$ and $c$ shear and rotate the squares without changing their area.`,
  },
  {
    id: 'poly',
    name: 'Quadratic',
    params: [
      { key: 'A', label: md`$A$ (in $u$)`, min: -1.5, max: 1.5, step: 0.1, def: 0.5, unit: '1/(m·s)' },
      { key: 'B', label: md`$B$ (in $u$)`, min: -1.5, max: 1.5, step: 0.1, def: 0.4, unit: '1/(m·s)' },
      { key: 'C', label: md`$C$ (in $v$)`, min: -3, max: 3, step: 0.1, def: 1, unit: '1/(m·s)' },
    ],
    vel: (p, x, y) => [p.A * x * x + p.B * y * y, p.C * x * y],
    terms: (p, x) => [2 * p.A * x, p.C * x, 0],
    field: (p) => md`u = ${sumTeX([[p.A, 'x^2'], [p.B, 'y^2']])},\qquad v = ${sumTeX([[p.C, 'xy']])},\qquad w = 0`,
    termTeX: (p) => [sumTeX([[2 * p.A, 'x']]), sumTeX([[p.C, 'x']]), '0'],
    divTeX: (p) => sumTeX([[2 * p.A + p.C, 'x']]),
    passes: (p) => zero(2 * p.A + p.C),
    note: md`$u = Ax^2 + By^2,\ v = Cxy$ gives $\nabla\cdot\mathbf V = (2A + C)\,x$. It vanishes on the line $x = 0$ for any $A, C$ — but continuity must hold at **every** point, which requires $C = -2A$. ($B$ never matters: $\partial(By^2)/\partial x = 0$.)`,
  },
  {
    id: '3d',
    name: '3-D',
    params: [
      { key: 'a', label: md`$a$ in $u = ax$`, min: -2, max: 2, step: 0.1, def: 1, unit: '1/s' },
      { key: 'b', label: md`$b$ in $v = by$`, min: -2, max: 2, step: 0.1, def: 1, unit: '1/s' },
      { key: 'c', label: md`$c$ in $w = cz$`, min: -2, max: 2, step: 0.1, def: -2, unit: '1/s' },
    ],
    vel: (p, x, y) => [p.a * x, p.b * y],
    terms: (p) => [p.a, p.b, p.c],
    field: (p) => md`u = ${sumTeX([[p.a, 'x']])},\qquad v = ${sumTeX([[p.b, 'y']])},\qquad w = ${sumTeX([[p.c, 'z']])}`,
    termTeX: (p) => [tn(p.a), tn(p.b), tn(p.c)],
    divTeX: (p) => tn(p.a + p.b + p.c),
    passes: (p) => zero(p.a + p.b + p.c),
    note: md`The map shows the $x$–$y$ plane only. With the defaults the arrows spread out ($\partial u/\partial x + \partial v/\partial y = 2$ s$^{-1}$) as if fluid were being created — yet the flow is incompressible, because fluid arrives along $z$ ($\partial w/\partial z = -2$ s$^{-1}$). The squares widen in $x$–$y$ while they thin in $z$ at the same rate, so their **volume** — and their green colour — is unchanged. Always include all three terms; the map colour uses the full 3-D divergence. Make $a + b + c \neq 0$ and the squares change volume.`,
    threeD: true,
  },
  {
    id: 'unsteady',
    name: 'Unsteady',
    params: [
      { key: 'a', label: md`$a$ in $u$`, min: -2, max: 2, step: 0.1, def: 1, unit: '1/s' },
      { key: 'b', label: md`$b$ in $v$`, min: -2, max: 2, step: 0.1, def: 1, unit: '1/s' },
      { key: 'U', label: md`sloshing $U$`, min: -1.5, max: 1.5, step: 0.1, def: 0.6, unit: 'm/s' },
    ],
    vel: (p, x, y, t) => [p.a * x * Math.cos(W * t) + p.U * Math.sin(W * t), -p.b * y * Math.cos(W * t)],
    terms: (p, _x, _y, t) => [p.a * Math.cos(W * t), -p.b * Math.cos(W * t), 0],
    field: (p) => md`u = ${sumTeX([[p.a, md`x\cos(1.5t)`], [p.U, md`\sin(1.5t)`]])},\qquad v = ${sumTeX([[-p.b, md`y\cos(1.5t)`]])}`,
    termTeX: (p) => [sumTeX([[p.a, md`\cos(1.5t)`]]), sumTeX([[-p.b, md`\cos(1.5t)`]]), '0'],
    divTeX: (p) => sumTeX([[p.a - p.b, md`\cos(1.5t)`]]),
    passes: (p) => zero(p.a - p.b),
    unsteady: true,
    note: md`An **unsteady** field: it pulses and sloshes sideways with $\omega = 1.5$ rad/s. With $a = b$ the divergence is zero at every instant — $\nabla\cdot\mathbf V = 0$ holds for unsteady incompressible flow too. With $a \neq b$ it fails, even though $\nabla\cdot\mathbf V$ happens to pass through zero whenever $\cos(1.5t) = 0$: it must vanish at **all** times.`,
  },
  {
    id: 'gas',
    name: 'Gas',
    params: [
      { key: 'U', label: md`$U_0$`, min: 0, max: 2, step: 0.1, def: 1, unit: 'm/s' },
      { key: 'L', label: md`$L$`, min: 2, max: 8, step: 0.5, def: 4, unit: 'm' },
    ],
    vel: (p, x) => [p.U * (1 + x / p.L), 0],
    terms: (p) => [p.U / p.L, 0, 0],
    field: (p) => md`u = ${tn(p.U)}\left(1 + \frac{x}{${tn(p.L)}}\right),\qquad v = 0,\qquad w = 0`,
    termTeX: (p) => [tn(p.U / p.L, 4), '0', '0'],
    divTeX: (p) => tn(p.U / p.L, 4),
    passes: (p) => zero(p.U),
    note: md`An accelerating flow with no cross-flow: $\nabla\cdot\mathbf V = U_0/L > 0$, so it is **not** a possible incompressible flow. It *is* a perfectly good **steady compressible** flow if the density falls so that $\rho u$ stays constant, $\rho = \rho_0/(1 + x/L)$ — continuity constrains $\rho\mathbf V$, not $\mathbf V$ alone (see the solved example for concept 1).`,
  },
]

const DEFAULTS: Record<string, P> = Object.fromEntries(PRESETS.map((p) => [p.id, Object.fromEntries(p.params.map((q) => [q.key, q.def]))]))

export function DivergenceChecker() {
  const [id, setId] = useState('linear')
  const [vals, setVals] = useState<Record<string, P>>(DEFAULTS)
  const [probe, setProbe] = useState<V2>([0.8, 0.6])
  const [t, setT] = useState(0)
  const pr = PRESETS.find((p) => p.id === id)!
  const p = vals[id]
  const vel = useMemo(() => (x: number, y: number, tt: number) => pr.vel(p, x, y, tt), [pr, p])
  const div = useMemo(
    () => (x: number, y: number, tt: number) => {
      const [a, b, c] = pr.terms(p, x, y, tt)
      return a + b + c
    },
    [pr, p],
  )
  const dwdzFn = useMemo(() => (pr.threeD ? (x: number, y: number, tt: number) => pr.terms(p, x, y, tt)[2] : undefined), [pr, p])
  const tNow = pr.unsteady ? t : 0
  const [dudx, dvdy, dwdz] = pr.terms(p, probe[0], probe[1], tNow)
  const total = dudx + dvdy + dwdz
  const ok = pr.passes(p)
  const [T1, T2, T3] = pr.termTeX(p)
  const set = (k: string, v: number) => setVals((s) => ({ ...s, [id]: { ...s[id], [k]: v } }))

  return (
    <SimPanel
      title="Is this flow possible? — continuity checker"
      subtitle="incompressible test: ∇·V = 0 at every point and every instant"
      wide
      controls={
        <>
          <Segmented label="Velocity field" value={id} onChange={(v) => { setId(v); setT(0) }} options={PRESETS.map((q) => ({ value: q.id, label: q.name }))} />
          {pr.params.map((q) => (
            <Slider key={`${id}-${q.key}`} label={q.label} value={p[q.key]} min={q.min} max={q.max} step={q.step} onChange={(v) => set(q.key, +v.toFixed(3))} unit={q.unit} digits={3} />
          ))}
          <Verdict ok={ok}>
            {ok
              ? 'Satisfies incompressible continuity everywhere — a possible incompressible flow.'
              : id === 'gas'
                ? 'Violates ∇·V = 0 → impossible as an incompressible flow (possible only as a compressible one).'
                : 'Violates ∇·V = 0 → not a possible incompressible flow.'}
          </Verdict>
        </>
      }
      readout={
        <Readout
          cols={2}
          items={[
            { label: md`$\partial u/\partial x$`, value: dudx, unit: '1/s', digits: 3 },
            { label: md`$\partial v/\partial y$`, value: dvdy, unit: '1/s', digits: 3 },
            { label: md`$\partial w/\partial z$`, value: dwdz, unit: '1/s', digits: 3 },
            { label: md`$\nabla\cdot\mathbf V$ at probe`, value: Math.abs(total) < 1e-9 ? 0 : total, unit: '1/s', digits: 3, tone: Math.abs(total) < 1e-9 ? 'good' : 'bad' },
            { label: 'probe (x, y)', value: `(${pn(probe[0], 2)}, ${pn(probe[1], 2)})`, unit: 'm' },
            ...(pr.unsteady ? [{ label: 'time t', value: tNow, unit: 's', digits: 3 }] : []),
          ]}
        />
      }
      footer={
        <Md inline>
          {md`**Try this:** in *Linear 2-D* drag $d$ away from $-a$ — the map turns rose (expansion) or indigo (compression) and the green squares start to grow or shrink. Then change $b$ and $c$: the squares shear and turn, but stay green. In *Quadratic* the colour fades out only along the line $x = 0$ — zero on one line is not enough; set $C = -2A$ to make the whole map blank.`}
        </Md>
      }
    >
      <div className="space-y-3">
        <DivergenceMap x={[-2, 2]} y={[-1.5, 1.5]} vel={vel} div={div} dwdz={dwdzFn} unsteady={pr.unsteady} probe={probe} onProbe={setProbe} onTime={pr.unsteady ? setT : undefined} />
        <Md className="md-tight text-sm">
          {md`$$
\begin{aligned}
&${pr.field(p)}\\
&\nabla\cdot\mathbf V = \underbrace{(${T1})}_{\partial u/\partial x} + \underbrace{(${T2})}_{\partial v/\partial y} + \underbrace{(${T3})}_{\partial w/\partial z} = ${pr.divTeX(p)}
\end{aligned}
$$`}
        </Md>
        <Md className="md-tight text-sm text-ink-2">{pr.note}</Md>
      </div>
    </SimPanel>
  )
}
