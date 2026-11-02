import { useMemo, useRef, useState } from 'react'
import { Plot, Readout, Segmented, SimPanel, Slider, md, num, useUid, type ReadoutItem } from '@/kit'
import { ArrowDefs, Chevron, f2, type Pt } from './svg'

/*
 * Circulation calculator: Γ = ∮ V·ds evaluated numerically (midpoint rule, counter-clockwise) around a circle or the
 * annular sector ABCD of Lecture 12, slide 15, in a free vortex (v_θ = K/r) or a forced vortex (v_θ = K₁ r).
 */

type Field = 'free' | 'forced'
type LoopKind = 'circle' | 'sector'
interface Sample {
  x: number
  y: number
  tx: number
  ty: number
  ds: number
  leg: number
}

const VB = 360 // viewBox size (px)
const SC = 85 // px per metre
const C0 = VB / 2
const LIM = 2.05 // half-width of the drawn domain (m)
const DEG = Math.PI / 180
const X = (x: number) => C0 + SC * x
const Y = (y: number) => C0 - SC * y

function velocity(field: Field, k: number) {
  return field === 'free'
    ? (x: number, y: number): Pt => {
        const r2 = x * x + y * y
        return [(-k * y) / r2, (k * x) / r2]
      }
    : (x: number, y: number): Pt => [-k * y, k * x]
}

function circleLoop(xc: number, yc: number, R: number, n = 720): Sample[] {
  const out: Sample[] = []
  for (let i = 0; i < n; i++) {
    const t = ((i + 0.5) * 2 * Math.PI) / n
    out.push({ x: xc + R * Math.cos(t), y: yc + R * Math.sin(t), tx: -Math.sin(t), ty: Math.cos(t), ds: (2 * Math.PI * R) / n, leg: 0 })
  }
  return out
}

/** A (r1, θ0) → B (r2, θ0) → C (r2, θ0+Δθ) → D (r1, θ0+Δθ) → A: counter-clockwise round the sector. */
function sectorLoop(r1: number, r2: number, th0: number, dth: number): Sample[] {
  const out: Sample[] = []
  const nr = 160
  const na = 320
  const th1 = th0 + dth
  for (let i = 0; i < nr; i++) {
    const r = r1 + ((i + 0.5) * (r2 - r1)) / nr
    out.push({ x: r * Math.cos(th0), y: r * Math.sin(th0), tx: Math.cos(th0), ty: Math.sin(th0), ds: (r2 - r1) / nr, leg: 0 })
  }
  for (let i = 0; i < na; i++) {
    const th = th0 + ((i + 0.5) * dth) / na
    out.push({ x: r2 * Math.cos(th), y: r2 * Math.sin(th), tx: -Math.sin(th), ty: Math.cos(th), ds: (r2 * dth) / na, leg: 1 })
  }
  for (let i = 0; i < nr; i++) {
    const r = r2 - ((i + 0.5) * (r2 - r1)) / nr
    out.push({ x: r * Math.cos(th1), y: r * Math.sin(th1), tx: -Math.cos(th1), ty: -Math.sin(th1), ds: (r2 - r1) / nr, leg: 2 })
  }
  for (let i = 0; i < na; i++) {
    const th = th1 - ((i + 0.5) * dth) / na
    out.push({ x: r1 * Math.cos(th), y: r1 * Math.sin(th), tx: Math.sin(th), ty: -Math.cos(th), ds: (r1 * dth) / na, leg: 3 })
  }
  return out
}

export function CirculationLab() {
  const uid = useUid('circ')
  const svgRef = useRef<SVGSVGElement>(null)
  const [field, setField] = useState<Field>('free')
  const [loop, setLoop] = useState<LoopKind>('circle')
  const [Kf, setKf] = useState(0.5)
  const [K1, setK1] = useState(1)
  const [xc, setXc] = useState(0.45)
  const [yc, setYc] = useState(0.2)
  const [R, setR] = useState(0.9)
  const [r1, setR1] = useState(0.6)
  const [r2raw, setR2] = useState(1.1)
  const [th0, setTh0] = useState(116)
  const [dth, setDth] = useState(32)
  const [drag, setDrag] = useState(false)
  const r2 = Math.max(r2raw, r1 + 0.1)
  const k = field === 'free' ? Kf : K1
  const V = useMemo(() => velocity(field, k), [field, k])

  const samples = useMemo(
    () => (loop === 'circle' ? circleLoop(xc, yc, R) : sectorLoop(r1, r2, th0 * DEG, dth * DEG)),
    [loop, xc, yc, R, r1, r2, th0, dth],
  )

  const calc = useMemo(() => {
    const legs = [0, 0, 0, 0]
    let s = 0
    const pts: [number, number][] = []
    let vmax = 0
    for (const p of samples) {
      const [u, v] = V(p.x, p.y)
      const vt = u * p.tx + v * p.ty
      legs[p.leg] += vt * p.ds
      s += p.ds / 2
      pts.push([s, vt])
      s += p.ds / 2
      vmax = Math.max(vmax, Math.abs(vt))
    }
    return { gamma: legs[0] + legs[1] + legs[2] + legs[3], legs, pts, vmax, L: s }
  }, [samples, V])

  const dist = loop === 'circle' ? Math.abs(Math.hypot(xc, yc) - R) : r1
  const encloses = loop === 'circle' ? Math.hypot(xc, yc) < R : false
  const singular = field === 'free' && dist < 0.04
  const area = loop === 'circle' ? Math.PI * R * R : 0.5 * (r2 * r2 - r1 * r1) * dth * DEG
  const theory = field === 'free' ? (encloses ? 2 * Math.PI * Kf : 0) : 2 * K1 * area

  // loop drawing, coloured by the sign of the tangential velocity
  const { posD, negD } = useMemo(() => {
    let pos = ''
    let neg = ''
    for (const p of samples) {
      const [u, v] = V(p.x, p.y)
      const vt = u * p.tx + v * p.ty
      const h = p.ds * 0.55
      const seg = `M${f2(X(p.x - p.tx * h))} ${f2(Y(p.y - p.ty * h))}L${f2(X(p.x + p.tx * h))} ${f2(Y(p.y + p.ty * h))}`
      if (vt >= 0) pos += seg
      else neg += seg
    }
    return { posD: pos, negD: neg }
  }, [samples, V])

  // direction chevrons (screen direction = (tx, −ty))
  const chevrons = useMemo(() => {
    const n = samples.length
    const idx = loop === 'circle' ? [0.125, 0.375, 0.625, 0.875].map((f) => Math.floor(f * n)) : [80, 160 + 160, 480 + 80, 640 + 160]
    return idx.map((i) => samples[Math.min(n - 1, i)])
  }, [samples, loop])

  // background quiver
  const quiver = useMemo(() => {
    const out: { x1: number; y1: number; x2: number; y2: number }[] = []
    const vref = field === 'free' ? k : k // speed at r = 1 m
    for (let i = 0; i < 11; i++)
      for (let j = 0; j < 11; j++) {
        const x = -1.8 + 0.36 * i
        const y = -1.8 + 0.36 * j
        const r = Math.hypot(x, y)
        if (r < 0.2) continue
        const [u, v] = V(x, y)
        const s = Math.hypot(u, v)
        if (!(s > 0)) continue
        const L = 0.15 * num.clamp(Math.sqrt(s / vref), 0.35, 1.5)
        out.push({ x1: X(x - (u / s) * L * 0.5), y1: Y(y - (v / s) * L * 0.5), x2: X(x + (u / s) * L * 0.5), y2: Y(y + (v / s) * L * 0.5) })
      }
    return out
  }, [V, field, k])

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!drag || !svgRef.current) return
    const rect = svgRef.current.getBoundingClientRect()
    const px = ((e.clientX - rect.left) / rect.width) * VB
    const py = ((e.clientY - rect.top) / rect.height) * VB
    setXc(num.clamp((px - C0) / SC, -1.5, 1.5))
    setYc(num.clamp((C0 - py) / SC, -1.5, 1.5))
  }

  const legNames = ['A → B', 'B → C', 'C → D', 'D → A']
  const corners: Pt[] =
    loop === 'sector'
      ? [
          [r1 * Math.cos(th0 * DEG), r1 * Math.sin(th0 * DEG)],
          [r2 * Math.cos(th0 * DEG), r2 * Math.sin(th0 * DEG)],
          [r2 * Math.cos((th0 + dth) * DEG), r2 * Math.sin((th0 + dth) * DEG)],
          [r1 * Math.cos((th0 + dth) * DEG), r1 * Math.sin((th0 + dth) * DEG)],
        ]
      : []

  const items: ReadoutItem[] = [
    { label: md`$\Gamma$ (numerical $\oint$)`, value: singular ? '—' : calc.gamma, unit: 'm²/s', digits: 4, tone: 'accent' },
    { label: md`$\Gamma$ (theory)`, value: theory, unit: 'm²/s', digits: 4 },
  ]
  if (loop === 'circle')
    items.push({ label: 'encloses r = 0?', value: encloses ? 'yes' : 'no', tone: encloses ? 'good' : 'default' })
  else legNames.forEach((n, i) => items.push({ label: n, value: Math.abs(calc.legs[i]) < 5e-6 ? 0 : calc.legs[i], unit: 'm²/s', digits: 3 }))
  if (field === 'forced') items.push({ label: 'area enclosed by C', value: area, unit: 'm²', digits: 4 })

  const yM = Math.max(0.5, Math.min(12, calc.vmax * 1.15))

  return (
    <SimPanel
      title="Circulation calculator"
      subtitle={md`$\Gamma = \oint_C \vb{V}\cdot d\vb{s}$, counter-clockwise`}
      wide
      controls={
        <>
          <Segmented<Field>
            label="velocity field"
            value={field}
            onChange={setField}
            options={[
              { value: 'free', label: md`free $K/r$` },
              { value: 'forced', label: md`forced $K_1 r$` },
            ]}
          />
          {field === 'free' ? (
            <Slider label={md`strength $K$`} value={Kf} min={0.1} max={1} step={0.05} onChange={setKf} unit="m²/s" digits={2} />
          ) : (
            <Slider label={md`$K_1$ (angular velocity)`} value={K1} min={0.2} max={2} step={0.05} onChange={setK1} unit="1/s" digits={2} />
          )}
          <Segmented<LoopKind>
            label="closed curve C"
            value={loop}
            onChange={setLoop}
            options={[
              { value: 'circle', label: 'circle (drag it)' },
              { value: 'sector', label: 'path ABCD' },
            ]}
          />
          {loop === 'circle' ? (
            <>
              <Slider label={md`centre $x_c$`} value={xc} min={-1.5} max={1.5} step={0.01} onChange={setXc} unit="m" digits={2} />
              <Slider label={md`centre $y_c$`} value={yc} min={-1.5} max={1.5} step={0.01} onChange={setYc} unit="m" digits={2} />
              <Slider label={md`radius $R$`} value={R} min={0.2} max={1.6} step={0.01} onChange={setR} unit="m" digits={2} />
            </>
          ) : (
            <>
              <Slider label={md`inner radius $r_A$`} value={r1} min={0.2} max={1.4} step={0.01} onChange={setR1} unit="m" digits={2} />
              <Slider label={md`outer radius $r_B$`} value={r2} min={0.3} max={1.9} step={0.01} onChange={setR2} unit="m" digits={2} />
              <Slider label={md`angle of AB, $\theta_0$`} value={th0} min={0} max={360} step={1} onChange={setTh0} unit="°" digits={3} />
              <Slider label={md`opening $\Delta\theta$`} value={dth} min={5} max={300} step={1} onChange={setDth} unit="°" digits={3} />
            </>
          )}
        </>
      }
      readout={<Readout items={items} />}
      footer="Try this: drag the circle until the vortex centre slips outside it — Γ jumps from 2πK to 0 although the loop still sits in swirling flow (the positive and negative stretches of the curve now cancel). Then switch to the forced vortex: Γ no longer cares where the loop is, only how much area it encloses (Γ = 2K₁ × area)."
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VB} ${VB}`}
        className="mx-auto block h-auto w-full max-w-[460px] select-none"
        role="img"
        aria-label="Velocity field with a closed curve for the circulation integral"
        onPointerMove={onPointerMove}
        onPointerUp={() => setDrag(false)}
        onPointerLeave={() => setDrag(false)}
      >
        <ArrowDefs id={uid} colors={{ q: 'var(--quiver)' }} size={5} />
        <rect x={C0 - SC * LIM} y={C0 - SC * LIM} width={2 * SC * LIM} height={2 * SC * LIM} rx={8} fill="var(--field-bg)" stroke="var(--line)" />
        {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((r) => (
          <circle key={r} cx={C0} cy={C0} r={SC * r} fill="none" stroke="var(--streamline)" strokeOpacity={0.28} strokeWidth={1} />
        ))}
        <line x1={C0 - SC * LIM} x2={C0 + SC * LIM} y1={C0} y2={C0} stroke="var(--grid)" strokeDasharray="3 4" />
        <line y1={C0 - SC * LIM} y2={C0 + SC * LIM} x1={C0} x2={C0} stroke="var(--grid)" strokeDasharray="3 4" />
        {quiver.map((a, i) => (
          <line key={i} x1={f2(a.x1)} y1={f2(a.y1)} x2={f2(a.x2)} y2={f2(a.y2)} stroke="var(--quiver)" strokeOpacity={0.7} strokeWidth={1.2} markerEnd={`url(#${uid}-q)`} />
        ))}
        {/* vortex centre */}
        <circle cx={C0} cy={C0} r={6} fill="var(--surface)" stroke="#7c3aed" strokeWidth={2} />
        <circle cx={C0} cy={C0} r={2} fill="#7c3aed" />
        {/* the closed curve */}
        <path d={posD} stroke="var(--plot-5)" strokeWidth={4.2} strokeLinecap="round" fill="none" />
        <path d={negD} stroke="var(--plot-4)" strokeWidth={4.2} strokeLinecap="round" fill="none" />
        {chevrons.map((p, i) => (
          <Chevron key={i} x={X(p.x)} y={Y(p.y)} dx={p.tx} dy={-p.ty} size={7} fill="var(--ink)" />
        ))}
        {loop === 'circle' ? (
          <circle
            cx={X(xc)}
            cy={Y(yc)}
            r={9}
            fill="var(--surface)"
            stroke="var(--ink-2)"
            strokeWidth={2}
            style={{ cursor: drag ? 'grabbing' : 'grab', touchAction: 'none' }}
            onPointerDown={(e) => {
              ;(e.currentTarget.ownerSVGElement ?? e.currentTarget).setPointerCapture?.(e.pointerId)
              setDrag(true)
            }}
          />
        ) : (
          corners.map((c, i) => (
            <text key={i} x={f2(X(c[0]) + 6)} y={f2(Y(c[1]) - 6)} className="text-[13px] font-bold italic" fill="var(--ink)" paintOrder="stroke" stroke="var(--surface)" strokeWidth={3}>
              {'ABCD'[i]}
            </text>
          ))
        )}
        {singular ? (
          <text x={C0} y={22} textAnchor="middle" className="text-[12px] font-semibold" fill="var(--plot-4)" paintOrder="stroke" stroke="var(--surface)" strokeWidth={3}>
            the curve passes through the singular point — Γ is undefined there
          </text>
        ) : null}
      </svg>
      <div className="mt-1 flex flex-wrap justify-center gap-x-4 gap-y-1 text-[11.5px] text-ink-3">
        <span className="inline-flex items-center gap-1.5"><span className="inline-block h-1 w-5 rounded" style={{ background: 'var(--plot-5)' }} /> V·ds &gt; 0 (with the flow)</span>
        <span className="inline-flex items-center gap-1.5"><span className="inline-block h-1 w-5 rounded" style={{ background: 'var(--plot-4)' }} /> V·ds &lt; 0 (against it)</span>
        <span>arrowheads: direction of integration</span>
      </div>
      <div className="mt-3">
        <Plot
          x={{ label: md`distance along the curve, $s$ (m)`, domain: [0, Math.max(0.1, calc.L)] }}
          y={{ label: md`$V_t = \vb{V}\cdot\hat{\vb{s}}$ (m/s)`, domain: [-yM, yM] }}
          series={[
            { points: calc.pts, kind: 'area', color: 'var(--plot-1)', opacity: 0.18, hideInLegend: true },
            { label: md`tangential velocity along $C$ — signed area $= \Gamma$`, points: calc.pts, color: 'var(--plot-1)', width: 2 },
          ]}
          hlines={[{ y: 0, color: 'var(--axis)', dash: '2 3' }]}
          height={190}
        />
      </div>
    </SimPanel>
  )
}
