import { useMemo, useState } from 'react'
import { Md, Plot, Readout, Segmented, SimPanel, Slider, Toggle, md, num } from '@/kit'
import { DivergenceMap, type V2 } from './DivergenceMap'
import { Verdict, pn, sumTeX, tn } from './shared'

/*
 * Cylindrical (r, θ, z) continuity checker. Each preset gives v_r, v_θ, v_z and the three exact terms
 *   T1 = (1/r) ∂(r v_r)/∂r,  T2 = (1/r) ∂v_θ/∂θ,  T3 = ∂v_z/∂z.
 * The map shows the plane z = 0 in Cartesian x–y; the colour is T1 + T2 + T3.
 */
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
interface CylPreset {
  id: string
  name: string
  params: Param[]
  vr: (p: P, r: number, th: number) => number
  vt: (p: P, r: number, th: number) => number
  /** exact terms at (r, θ) */
  terms: (p: P, r: number, th: number) => [number, number, number]
  fieldTeX: (p: P) => string
  termTeX: (p: P) => [string, string, string]
  passes: (p: P) => boolean
  core?: (p: P) => number
  disc?: (p: P) => number
  note: string
  zFlow?: boolean
}

const zero = (v: number) => Math.abs(v) < 1e-9
const TWO_PI = 2 * Math.PI

const PRESETS: CylPreset[] = [
  {
    id: 'source',
    name: 'Source / sink',
    params: [{ key: 'm', label: md`strength $m$`, min: -6, max: 6, step: 0.5, def: 4, unit: 'm²/s' }],
    vr: (p, r) => p.m / (TWO_PI * r),
    vt: () => 0,
    terms: () => [0, 0, 0],
    fieldTeX: (p) => md`v_r = \frac{${tn(p.m)}}{2\pi r},\quad v_\theta = 0,\quad v_z = 0`,
    termTeX: () => ['0', '0', '0'],
    passes: () => true,
    core: () => 0.22,
    note: md`$r v_r = m/2\pi$ is constant, so $\partial(r v_r)/\partial r = 0$ for every $r \neq 0$: the flow through every circle is the same $m$ (watch $Q(r)$ stay flat). The mass is injected at the singular line $r = 0$ itself — the line source of Lec 12.`,
  },
  {
    id: 'vortex',
    name: 'Free vortex',
    params: [{ key: 'K', label: md`$K$ in $v_\theta = K/r$`, min: -2, max: 2, step: 0.25, def: 1, unit: 'm²/s' }],
    vr: () => 0,
    vt: (p, r) => p.K / r,
    terms: () => [0, 0, 0],
    fieldTeX: (p) => md`v_r = 0,\quad v_\theta = \frac{${tn(p.K)}}{r},\quad v_z = 0`,
    termTeX: () => ['0', '0', '0'],
    passes: () => true,
    core: () => 0.22,
    note: md`$v_\theta$ does not depend on $\theta$, so $\frac{1}{r}\partial v_\theta/\partial\theta = 0$, and there is no radial or axial flow. Any purely circulating flow $v_\theta = f(r)$ satisfies continuity — the free vortex, and also rigid rotation.`,
  },
  {
    id: 'spiral',
    name: 'Spiral',
    params: [
      { key: 'm', label: md`source $m$`, min: -6, max: 6, step: 0.5, def: -4, unit: 'm²/s' },
      { key: 'K', label: md`vortex $K$`, min: -2, max: 2, step: 0.25, def: 1, unit: 'm²/s' },
    ],
    vr: (p, r) => p.m / (TWO_PI * r),
    vt: (p, r) => p.K / r,
    terms: () => [0, 0, 0],
    fieldTeX: (p) => md`v_r = \frac{${tn(p.m)}}{2\pi r},\quad v_\theta = \frac{${tn(p.K)}}{r},\quad v_z = 0`,
    termTeX: () => ['0', '0', '0'],
    passes: () => true,
    core: () => 0.22,
    note: md`A sink plus a vortex (bathtub drain). Each part satisfies continuity on its own, and because the equation is **linear in the velocity**, so does their sum.`,
  },
  {
    id: 'cylinder',
    name: 'Past a cylinder',
    params: [
      { key: 'U', label: md`$U$`, min: 0.5, max: 2, step: 0.1, def: 1, unit: 'm/s' },
      { key: 'a', label: md`radius $a$`, min: 0.3, max: 1, step: 0.05, def: 0.6, unit: 'm' },
    ],
    vr: (p, r, th) => p.U * (1 - (p.a * p.a) / (r * r)) * Math.cos(th),
    vt: (p, r, th) => -p.U * (1 + (p.a * p.a) / (r * r)) * Math.sin(th),
    terms: (p, r, th) => {
      const t1 = (p.U * (1 + (p.a * p.a) / (r * r)) * Math.cos(th)) / r
      return [t1, -t1, 0]
    },
    fieldTeX: (p) => md`v_r = ${tn(p.U)}\Big(1-\frac{${tn(p.a * p.a, 4)}}{r^2}\Big)\cos\theta,\quad v_\theta = -${tn(p.U)}\Big(1+\frac{${tn(p.a * p.a, 4)}}{r^2}\Big)\sin\theta`,
    termTeX: (p) => [md`\tfrac{${tn(p.U)}}{r}\big(1+\tfrac{${tn(p.a * p.a, 4)}}{r^2}\big)\cos\theta`, md`-\tfrac{${tn(p.U)}}{r}\big(1+\tfrac{${tn(p.a * p.a, 4)}}{r^2}\big)\cos\theta`, '0'],
    passes: () => true,
    disc: (p) => p.a,
    note: md`Here neither term vanishes on its own: the radial term and the $\theta$ term are equal and opposite at every point, so their sum is zero. $v_r = 0$ on $r = a$ — no flow through the cylinder wall.`,
  },
  {
    id: 'rigid',
    name: 'Rigid rotation',
    params: [{ key: 'W', label: md`$\Omega$ in $v_\theta = \Omega r$`, min: -1.5, max: 1.5, step: 0.1, def: 0.8, unit: 'rad/s' }],
    vr: () => 0,
    vt: (p, r) => p.W * r,
    terms: () => [0, 0, 0],
    fieldTeX: (p) => md`v_r = 0,\quad v_\theta = ${sumTeX([[p.W, 'r']])},\quad v_z = 0`,
    termTeX: () => ['0', '0', '0'],
    passes: () => true,
    note: md`Fluid turning like a solid body (a stirred cup at steady state). Elements move on circles and never change volume.`,
  },
  {
    id: 'uniform',
    name: 'Uniform v_r',
    params: [{ key: 'V', label: md`$V_0$ in $v_r = V_0$`, min: -1.5, max: 1.5, step: 0.1, def: 0.6, unit: 'm/s' }],
    vr: (p) => p.V,
    vt: () => 0,
    terms: (p, r) => [p.V / r, 0, 0],
    fieldTeX: (p) => md`v_r = ${tn(p.V)},\quad v_\theta = 0,\quad v_z = 0`,
    termTeX: (p) => [md`\frac{${tn(p.V)}}{r}`, '0', '0'],
    passes: (p) => zero(p.V),
    core: () => 0.12,
    note: md`The trap: $v_r$ does not change with $r$, but $\frac{1}{r}\frac{\partial (r v_r)}{\partial r} = \frac{V_0}{r} \neq 0$. Circles get longer as $r$ grows, so the same speed carries more volume across larger circles — $Q(r) = 2\pi r V_0$ rises. Not a possible incompressible plane flow.`,
  },
  {
    id: 'axisym',
    name: 'Axisymmetric (3-D)',
    params: [{ key: 'c', label: md`$c$ in $v_r = c\,r$`, min: -1.5, max: 1.5, step: 0.1, def: 0.5, unit: '1/s' }],
    vr: (p, r) => p.c * r,
    vt: () => 0,
    terms: (p) => [2 * p.c, 0, -2 * p.c],
    fieldTeX: (p) => md`v_r = ${sumTeX([[p.c, 'r']])},\quad v_\theta = 0,\quad v_z = ${sumTeX([[-2 * p.c, 'z']])}`,
    termTeX: (p) => [tn(2 * p.c), '0', tn(-2 * p.c)],
    passes: () => true,
    zFlow: true,
    note: md`Fluid spreading radially in the plane while arriving along the axis (a jet hitting a wall, $c > 0$). In the plane alone $\frac{1}{r}\frac{\partial(r v_r)}{\partial r} = 2c \neq 0$ and $Q(r)$ grows — the $\partial v_z/\partial z = -2c$ term balances it: each square widens in the plane but thins along $z$, so its volume (and green colour) is kept. Switch $v_z$ off to see continuity fail and the squares swell.`,
  },
]

const DEFAULTS: Record<string, P> = Object.fromEntries(PRESETS.map((p) => [p.id, Object.fromEntries(p.params.map((q) => [q.key, q.def]))]))

export function CylindricalChecker() {
  const [id, setId] = useState('source')
  const [vals, setVals] = useState<Record<string, P>>(DEFAULTS)
  const [rp, setRp] = useState(1.2)
  const [thp, setThp] = useState(40)
  const [withVz, setWithVz] = useState(true)
  const pr = PRESETS.find((p) => p.id === id)!
  const p = vals[id]
  const set = (k: string, v: number) => setVals((s) => ({ ...s, [id]: { ...s[id], [k]: v } }))
  const core = pr.core?.(p) ?? 0
  const disc = pr.disc?.(p) ?? 0
  const rMin = Math.max(core, disc)
  const zOn = !pr.zFlow || withVz

  const termsAt = (r: number, th: number): [number, number, number] => {
    const t = pr.terms(p, r, th)
    return [t[0], t[1], zOn ? t[2] : 0]
  }
  const vel = useMemo(
    () =>
      (x: number, y: number): V2 => {
        const r = Math.hypot(x, y)
        const th = Math.atan2(y, x)
        const vr = pr.vr(p, r, th)
        const vt = pr.vt(p, r, th)
        return [vr * Math.cos(th) - vt * Math.sin(th), vr * Math.sin(th) + vt * Math.cos(th)]
      },
    [pr, p],
  )
  const div = useMemo(
    () => (x: number, y: number) => {
      const [a, b, c] = pr.terms(p, Math.hypot(x, y), Math.atan2(y, x))
      return a + b + (zOn ? c : 0)
    },
    [pr, p, zOn],
  )
  const mask = useMemo(() => (rMin > 0 ? (x: number, y: number) => Math.hypot(x, y) < rMin : undefined), [rMin])
  // ∂v_z/∂z for the squares' depth (only the axisymmetric preset has axial flow)
  const dwdz = useMemo(
    () => (pr.zFlow ? (x: number, y: number) => (zOn ? pr.terms(p, Math.hypot(x, y), Math.atan2(y, x))[2] : 0) : undefined),
    [pr, p, zOn],
  )

  const th = (thp * Math.PI) / 180
  const rProbe = Math.max(rp, rMin + 0.05)
  const [T1, T2, T3] = termsAt(rProbe, th)
  const total = T1 + T2 + T3
  const ok = pr.passes(p) && zOn
  const [S1, S2, S3] = pr.termTeX(p)
  const Q = (r: number) => num.simpson((t) => pr.vr(p, r, t) * r, 0, TWO_PI, 120)
  const qNow = Q(rProbe)

  return (
    <SimPanel
      title="Cylindrical continuity checker"
      subtitle="(1/r)∂(r v_r)/∂r + (1/r)∂v_θ/∂θ + ∂v_z/∂z = 0 ?"
      wide
      controls={
        <>
          <Segmented label="Flow" value={id} onChange={setId} options={PRESETS.map((q) => ({ value: q.id, label: q.name }))} />
          {pr.params.map((q) => (
            <Slider key={`${id}-${q.key}`} label={q.label} value={p[q.key]} min={q.min} max={q.max} step={q.step} onChange={(v) => set(q.key, +v.toFixed(3))} unit={q.unit} digits={3} />
          ))}
          {pr.zFlow ? <Toggle label="include the axial flow $v_z$" checked={withVz} onChange={setWithVz} /> : null}
          <Slider label="probe radius $r$" value={rProbe} min={0.3} max={1.9} step={0.05} onChange={setRp} unit="m" digits={3} />
          <Slider label={md`probe angle $\theta$`} value={thp} min={0} max={355} step={5} onChange={setThp} unit="°" digits={3} format={(v) => v.toFixed(0)} />
          <Verdict ok={ok}>{ok ? 'Satisfies incompressible continuity (r > 0).' : 'Violates continuity — not a possible incompressible flow.'}</Verdict>
        </>
      }
      readout={
        <Readout
          cols={2}
          items={[
            { label: md`$\frac{1}{r}\frac{\partial(r v_r)}{\partial r}$`, value: T1, unit: '1/s', digits: 3 },
            { label: md`$\frac{1}{r}\frac{\partial v_\theta}{\partial \theta}$`, value: T2, unit: '1/s', digits: 3 },
            { label: md`$\frac{\partial v_z}{\partial z}$`, value: T3, unit: '1/s', digits: 3 },
            { label: 'sum', value: Math.abs(total) < 1e-9 ? 0 : total, unit: '1/s', digits: 3, tone: Math.abs(total) < 1e-9 ? 'good' : 'bad' },
            { label: md`$Q(r)=\oint v_r\, r\,d\theta$`, value: Math.abs(qNow) < 1e-9 ? 0 : qNow, unit: 'm²/s', digits: 3 },
            { label: 'probe (r, θ)', value: `${pn(rProbe, 2)} m, ${thp}°`, unit: '' },
          ]}
        />
      }
      footer={
        <Md inline>
          {md`**Try this:** compare *Source* with *Uniform* $v_r$ — both are purely radial, but only $v_r \propto 1/r$ keeps $Q(r)$ flat and the map blank. In *Past a cylinder*, move the probe around: the radial and angular terms change sign together and always cancel. In *Axisymmetric*, toggle $v_z$ off.`}
        </Md>
      }
    >
      <div className="space-y-3">
        <DivergenceMap
          x={[-2, 2]}
          y={[-2, 2]}
          vel={vel}
          div={div}
          dwdz={dwdz}
          mask={mask}
          disc={rMin}
          probe={[rProbe * Math.cos(th), rProbe * Math.sin(th)]}
          onProbe={([x, y]) => {
            setRp(+Math.min(1.9, Math.max(0.3, Math.hypot(x, y))).toFixed(2))
            setThp(Math.round((((Math.atan2(y, x) * 180) / Math.PI + 360) % 360) / 5) * 5)
          }}
          overlay={({ sx, sy, k }) => <circle cx={sx(0)} cy={sy(0)} r={rProbe * k} fill="none" stroke="var(--ink-2)" strokeDasharray="5 4" strokeWidth={1.3} />}
          tracerHalf={0.11}
          maxHeight={400}
        />
        <Md className="md-tight text-sm">
          {md`$$
\begin{aligned}
&${pr.fieldTeX(p)}${pr.zFlow && !withVz ? md`\ \ (\text{switched off: } v_z = 0)` : ''}\\
&\underbrace{${S1}}_{\frac{1}{r}\partial(r v_r)/\partial r} + \underbrace{${S2}}_{\frac{1}{r}\partial v_\theta/\partial\theta} + \underbrace{${zOn ? S3 : '0'}}_{\partial v_z/\partial z} = ${ok ? '0' : pr.id === 'uniform' ? md`\frac{${tn(p.V)}}{r}` : tn(2 * p.c)}
\end{aligned}
$$`}
        </Md>
        <div className="rounded-xl border border-line bg-surface-2/50 p-2">
          <Plot
            height={190}
            x={{ label: 'radius $r$ (m)', domain: [Math.max(0.25, rMin + 0.02), 2] }}
            y={{ label: '$Q(r)$ (m²/s)', domain: (() => {
              const qs = [0.3, 0.8, 1.3, 2].map((r) => Q(Math.max(r, rMin + 0.02)))
              const lo = Math.min(0, ...qs)
              const hi = Math.max(0, ...qs)
              const pad = Math.max(0.5, 0.15 * (hi - lo))
              return [lo - pad, hi + pad] as [number, number]
            })() }}
            series={[{ label: 'flow out through the circle of radius r (per m depth)', fn: (r) => Q(r), samples: 60 }]}
            marks={[{ x: rProbe, y: qNow, label: 'probe' }]}
          />
          <p className="px-2 pb-1 text-[11px] text-ink-3">
            In a plane flow (no v_z) continuity means Q(r) is the same for every circle that encloses the same singularities.
          </p>
        </div>
        <Md className="md-tight text-sm text-ink-2">{pr.note}</Md>
      </div>
    </SimPanel>
  )
}
