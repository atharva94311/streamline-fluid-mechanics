/**
 * Interactive: the right-hand side of the steady Euler equation, [V × (∇ × V)] · ds, for four plane flows.
 * The Lamb vector V × (∇ × V) is always perpendicular to V, so its projection on a line element ds vanishes
 * when ds lies along the streamline — and for every ds when the flow is irrotational.
 * Plane flows in a horizontal plane (gravity normal to the page), so g∇z · ds = 0 for in-plane ds.
 */
import { useMemo, useRef, useState } from 'react'
import { Md, Readout, Segmented, SimPanel, Slider, md, num, useElementSize } from '@/kit'
import { Arrow, Label, isoPath, levelsBetween, sampleGrid } from './shared'

type FlowKey = 'forced' | 'free' | 'shear' | 'corner'

interface FlowDef {
  label: string
  formula: string
  sym: string
  unit: string
  vel: (x: number, y: number, s: number) => [number, number]
  /** z-component of the vorticity ∇ × V (s⁻¹). */
  vort: (x: number, y: number, s: number) => number
  psi: (x: number, y: number, s: number) => number
}

const R_CORE = 0.3
const D = 2

const FLOWS: Record<FlowKey, FlowDef> = {
  forced: {
    label: 'Forced vortex',
    formula: md`$u = -\Omega y,\ v = \Omega x$ (rigid-body rotation) — **rotational**, $\nabla\times\vb V = 2\Omega\,\hat{\mathbf k}$`,
    sym: md`angular speed $\Omega$`,
    unit: 'rad/s',
    vel: (x, y, s) => [-s * y, s * x],
    vort: (_x, _y, s) => 2 * s,
    psi: (x, y, s) => -0.5 * s * (x * x + y * y),
  },
  free: {
    label: 'Free vortex',
    formula: md`$v_\theta = K/r$ — **irrotational** for $r > 0$ (the core $r < 0.3$ m is excluded)`,
    sym: 'strength $K$',
    unit: 'm²/s',
    vel: (x, y, s) => {
      const r2 = Math.max(x * x + y * y, 1e-9)
      return [(-s * y) / r2, (s * x) / r2]
    },
    vort: () => 0,
    psi: (x, y, s) => -s * Math.log(Math.max(Math.hypot(x, y), 1e-6)),
  },
  shear: {
    label: 'Shear flow',
    formula: md`$u = k y,\ v = 0$ (uniform shear) — **rotational**, $\nabla\times\vb V = -k\,\hat{\mathbf k}$`,
    sym: 'shear rate $k$',
    unit: '1/s',
    vel: (_x, y, s) => [s * y, 0],
    vort: (_x, _y, s) => -s,
    psi: (_x, y, s) => 0.5 * s * y * y,
  },
  corner: {
    label: 'Corner flow',
    formula: md`$u = A y,\ v = A x$ (from $\phi = Axy$) — **irrotational**`,
    sym: 'strength $A$',
    unit: '1/s',
    vel: (x, y, s) => [s * y, s * x],
    vort: () => 0,
    psi: (x, y, s) => 0.5 * s * (y * y - x * x),
  },
}

const NG = 81

export function LambProjector() {
  const [key, setKey] = useState<FlowKey>('forced')
  const [s, setS] = useState(1.5)
  const [alpha, setAlpha] = useState(0)
  const [P, setP] = useState<[number, number]>([0.9, 0.6])
  const [wrapRef, size] = useElementSize<HTMLDivElement>()
  const svgRef = useRef<SVGSVGElement>(null)
  const dragging = useRef(false)

  const flow = FLOWS[key]
  const S = Math.max(260, Math.min(460, size.width || 420))
  const pad = 8
  const span = S - 2 * pad
  const sx = (x: number) => pad + ((x + D) / (2 * D)) * span
  const sy = (y: number) => pad + ((D - y) / (2 * D)) * span
  const inv = (px: number, py: number): [number, number] => [((px - pad) / span) * 2 * D - D, D - ((py - pad) / span) * 2 * D]

  // streamlines = contours of ψ (equal Δψ, so their spacing shows the speed)
  const streamD = useMemo(() => {
    const f = (x: number, y: number) => (key === 'free' && Math.hypot(x, y) < R_CORE * 0.9 ? NaN : flow.psi(x, y, s))
    const vals = sampleGrid(f, -D, D, -D, D, NG, NG)
    let lo = Infinity
    let hi = -Infinity
    for (const v of vals) {
      if (!Number.isFinite(v)) continue
      if (v < lo) lo = v
      if (v > hi) hi = v
    }
    const levels = levelsBetween(lo, hi, 15)
    const g2px = (gx: number, gy: number): [number, number] => [sx(-D + (2 * D * gx) / (NG - 1)), sy(-D + (2 * D * gy) / (NG - 1))]
    return isoPath(vals, NG, NG, levels, g2px)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, s, S])

  const clampP = (p: [number, number]): [number, number] => {
    let [x, y] = [num.clamp(p[0], -D * 0.95, D * 0.95), num.clamp(p[1], -D * 0.95, D * 0.95)]
    if (key === 'free') {
      const r = Math.hypot(x, y)
      if (r < R_CORE + 0.05) {
        const k = (R_CORE + 0.05) / Math.max(r, 1e-6)
        x = r > 1e-6 ? x * k : R_CORE + 0.05
        y = r > 1e-6 ? y * k : 0
      }
    }
    return [x, y]
  }
  const Pc = clampP(P)

  // local kinematics at P
  const [u, v] = flow.vel(Pc[0], Pc[1], s)
  const Vmag = Math.hypot(u, v)
  const w = flow.vort(Pc[0], Pc[1], s)
  const lamb: [number, number] = [v * w, -u * w] // V × (w k̂)
  const lambMag = Math.hypot(lamb[0], lamb[1])
  const still = Vmag < 1e-9
  const thV = still ? 0 : Math.atan2(v, u)
  const a = (alpha * Math.PI) / 180
  const sHat: [number, number] = [Math.cos(thV + a), Math.sin(thV + a)]
  const proj = lamb[0] * sHat[0] + lamb[1] * sHat[1]
  const projSmall = Math.abs(proj) < 1e-9 + 1e-6 * lambMag

  // arrow scales: speeds relative to the speed at 1 m from the origin (= s for all four flows)
  const kV = (0.2 * S) / s
  const kL = (0.2 * S) / (2 * s * s)
  const cap = (L: number) => Math.min(L, 0.42 * S)
  const Px = sx(Pc[0])
  const Py = sy(Pc[1])
  const vLen = cap(Vmag * kV)
  const lLen = cap(lambMag * kL)
  const dsLen = 0.17 * S
  const vEnd: [number, number] = still ? [Px, Py] : [Px + (u / Vmag) * vLen, Py - (v / Vmag) * vLen]
  const lEnd: [number, number] = lambMag > 1e-12 ? [Px + (lamb[0] / lambMag) * lLen, Py - (lamb[1] / lambMag) * lLen] : [Px, Py]
  const dsEnd: [number, number] = [Px + sHat[0] * dsLen, Py - sHat[1] * dsLen]

  // angle arc from V direction to ds direction
  const arcR = 24
  const arcPts = num.linspace(0, a, 24).map((t) => {
    const th = thV + t
    return `${(Px + arcR * Math.cos(th)).toFixed(1)},${(Py - arcR * Math.sin(th)).toFixed(1)}`
  })

  /** keep arrow-tip labels inside the panel */
  const tagAt = (x: number, y: number, dy = 0) => {
    const right = x > S - 96
    return {
      x: right ? Math.min(x - 6, S - pad - 4) : Math.max(x + 6, pad + 4),
      y: Math.max(pad + 14, Math.min(S - pad - 6, y + dy)),
      anchor: (right ? 'end' : 'start') as 'end' | 'start',
    }
  }

  const moveTo = (e: { clientX: number; clientY: number }) => {
    const svg = svgRef.current
    if (!svg) return
    const r = svg.getBoundingClientRect()
    setP(clampP(inv(e.clientX - r.left, e.clientY - r.top)))
  }

  const verdict = (() => {
    if (w === 0)
      return md`**Irrotational flow:** $\nabla\times\vb V = 0$, so the right-hand side is zero for **every** direction of $d\vb s$ — the Bernoulli constant is the same on all streamlines (concept 3).`
    if (still) return md`$\vb V = 0$ here, so the Lamb vector is zero too.`
    if (projSmall)
      return md`$d\vb s$ lies **along the streamline**: $\vb V\times(\nabla\times\vb V)$ is perpendicular to it, the right-hand side vanishes and $dp/\rho + \tfrac12 d(V^2) + g\,dz = 0$ holds.`
    return md`$d\vb s$ **crosses** the streamlines: the right-hand side is $${num.fmtTeX(proj, 3)}$ m/s². With $\rho$ constant this is the rate at which $B = p/\rho + V^2/2 + gz$ changes per metre in that direction — the constant differs from streamline to streamline.`
  })()

  return (
    <SimPanel
      title="Where does V × (∇ × V) point?"
      subtitle="steady Euler equation, projected on a line element ds"
      controls={
        <>
          <Segmented<FlowKey>
            label="Flow field"
            value={key}
            onChange={(k) => {
              setKey(k)
              setAlpha(0)
            }}
            options={[
              { value: 'forced', label: 'Forced vortex' },
              { value: 'free', label: 'Free vortex' },
              { value: 'shear', label: 'Shear' },
              { value: 'corner', label: 'Corner' },
            ]}
          />
          <Slider label={flow.sym} value={s} min={0.5} max={3} step={0.05} onChange={setS} unit={flow.unit} digits={3} />
          <Slider
            label={md`angle of $d\mathbf{s}$ from $\mathbf{V}$`}
            value={alpha}
            min={-180}
            max={180}
            step={1}
            onChange={setAlpha}
            unit="°"
            format={(x) => x.toFixed(0)}
          />
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-ghost" onClick={() => setAlpha(0)}>
              ds along streamline
            </button>
            <button type="button" className="btn-ghost" onClick={() => setAlpha(90)}>
              ds across (90°)
            </button>
          </div>
        </>
      }
      readout={
        <Readout
          items={[
            { label: 'Point P (x, y)', value: `(${Pc[0].toFixed(2)}, ${Pc[1].toFixed(2)})`, unit: 'm' },
            { label: 'Speed |V|', value: Vmag, unit: 'm/s' },
            { label: 'Vorticity ∇×V', value: w, unit: '1/s', tone: w === 0 ? 'good' : 'default' },
            { label: 'Lamb term |V×(∇×V)|', value: lambMag, unit: 'm/s²' },
            { label: 'RHS [V×(∇×V)]·ŝ', value: projSmall ? 0 : proj, unit: 'm/s²', tone: projSmall ? 'good' : 'bad' },
            { label: 'Angle ds ↔ V', value: `${alpha.toFixed(0)}°` },
          ]}
        />
      }
      footer={
        <Md>{md`**Try this:** keep the angle at $0^\circ$ and drag $P$ anywhere — the right-hand side stays exactly zero for all four flows. Now press "ds across (90°)": it becomes non-zero for the forced vortex and the shear flow (rotational), but stays zero for the free vortex and the corner flow (irrotational). Click or drag in the field to move $P$.`}</Md>
      }
    >
      <div ref={wrapRef} className="w-full">
        <div className="mx-auto" style={{ width: S }}>
          <svg
            ref={svgRef}
            width={S}
            height={S}
            className="block cursor-crosshair select-none"
            role="img"
            aria-label="flow field with velocity, Lamb vector and line element at point P"
            onClick={(e) => moveTo(e)}
          >
            <rect x={pad} y={pad} width={span} height={span} rx={8} fill="var(--field-bg)" stroke="var(--line)" />
            <line x1={sx(0)} x2={sx(0)} y1={pad} y2={S - pad} stroke="var(--grid)" strokeDasharray="3 4" />
            <line x1={pad} x2={S - pad} y1={sy(0)} y2={sy(0)} stroke="var(--grid)" strokeDasharray="3 4" />
            <path d={streamD} fill="none" stroke="var(--streamline)" strokeWidth={1.2} strokeLinecap="round" opacity={0.75} />
            {key === 'free' ? (
              <g>
                <circle cx={sx(0)} cy={sy(0)} r={(R_CORE / (2 * D)) * span} fill="var(--body-fill)" opacity={0.8} />
                <Label x={sx(0)} y={sy(0) + 4} anchor="middle" size={10} color="var(--ink-2)">core</Label>
              </g>
            ) : null}
            {/* line through P along ds */}
            <line
              x1={Px - sHat[0] * 0.6 * S}
              y1={Py + sHat[1] * 0.6 * S}
              x2={Px + sHat[0] * 0.6 * S}
              y2={Py - sHat[1] * 0.6 * S}
              stroke="var(--plot-3)"
              strokeDasharray="5 5"
              strokeWidth={1}
              opacity={0.6}
            />
            {Math.abs(alpha) > 2 && !still ? <polyline points={arcPts.join(' ')} fill="none" stroke="var(--plot-3)" strokeWidth={1.5} /> : null}
            {lambMag > 1e-9 ? <Arrow x1={Px} y1={Py} x2={lEnd[0]} y2={lEnd[1]} color="var(--plot-4)" width={2.6} /> : null}
            {!still ? <Arrow x1={Px} y1={Py} x2={vEnd[0]} y2={vEnd[1]} color="var(--plot-1)" width={2.6} /> : null}
            <Arrow x1={Px} y1={Py} x2={dsEnd[0]} y2={dsEnd[1]} color="var(--plot-3)" width={2.2} head={8} />
            <circle cx={Px} cy={Py} r={6} fill="var(--surface)" stroke="var(--ink)" strokeWidth={2} pointerEvents="none" />
            <circle
              cx={Px}
              cy={Py}
              r={16}
              fill="transparent"
              style={{ touchAction: 'none', cursor: 'grab' }}
              onPointerDown={(e) => {
                dragging.current = true
                e.currentTarget.setPointerCapture?.(e.pointerId)
              }}
              onPointerMove={(e) => {
                if (dragging.current) moveTo(e)
              }}
              onPointerUp={() => {
                dragging.current = false
              }}
              onPointerCancel={() => {
                dragging.current = false
              }}
            />
            <Label x={Px - 10} y={Py - 10} anchor="end" size={12} weight={700}>P</Label>
            {!still ? (
              <Label {...tagAt(vEnd[0], vEnd[1], -4)} size={12} weight={700} color="var(--plot-1)">V</Label>
            ) : null}
            {lambMag > 1e-9 ? (
              <Label {...tagAt(lEnd[0], lEnd[1], 12)} size={11} weight={700} color="var(--plot-4)">V×(∇×V)</Label>
            ) : null}
            <Label {...tagAt(dsEnd[0], dsEnd[1], 14)} size={12} weight={700} color="var(--plot-3)">ds</Label>
            <Label x={S - pad - 6} y={S - pad - 8} anchor="end" size={10} color="var(--ink-3)">x, y in m · box ±2 m</Label>
          </svg>
        </div>
        <div className="mx-auto mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-ink-2">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-5 rounded" style={{ background: 'var(--plot-1)' }} /> velocity V
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-5 rounded" style={{ background: 'var(--plot-4)' }} /> Lamb vector V × (∇ × V)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-5 rounded" style={{ background: 'var(--plot-3)' }} /> line element ds
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-5 rounded" style={{ background: 'var(--streamline)' }} /> streamlines (equal Δψ)
          </span>
        </div>
        <div className="mt-3 space-y-2 text-sm text-ink-2">
          <Md>{flow.formula}</Md>
          <Md>{verdict}</Md>
        </div>
      </div>
    </SimPanel>
  )
}
