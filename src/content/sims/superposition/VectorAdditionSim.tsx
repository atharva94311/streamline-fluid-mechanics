import { useMemo, useState, type PointerEvent as RPointerEvent } from 'react'
import { FlowField, M, md, Segmented, SimPanel, Slider, Toggle, num, type FlowMarker } from '@/kit'
import { bodyOutline, bOf, phiUS, psiUS, theta02, toPath, TWO_PI, velUS, type Box, type Pt } from './halfbody'
import { ArrowLine, Label } from './svg'
import { Tiles } from './Tiles'

type Mode = 'uniform' | 'source' | 'sum'
const X: [number, number] = [-3, 5]
const Y: [number, number] = [-2.5, 2.5]
const BOX: Box = [X[0], X[1], Y[0], Y[1]]
/** Arrow length (m) = speed (m/s) × TAU (s). */
const TAU = 0.3
const MAX_LEN = 2.2

const fmt = (v: number) => (Number.isFinite(v) ? num.fmt(v, 3) : '—')

/**
 * Superposition "at a point": the velocity of uniform flow + source is the vector sum of the two
 * contributions, and ψ is the scalar sum. Tap/click the field to move the probe P.
 */
export function VectorAdditionSim() {
  const [mode, setMode] = useState<Mode>('sum')
  const [U, setU] = useState(4)
  const [m, setM] = useState(8)
  const [P, setP] = useState<Pt>([1, 1])
  const [phiOn, setPhiOn] = useState(false)
  const k = m / TWO_PI
  const b = bOf(U, m)

  const field = useMemo(() => {
    const dU = 0.25 * U
    let psi: (x: number, y: number) => number
    let phi: (x: number, y: number) => number
    let vel: (x: number, y: number) => Pt
    let levels: number[] = []
    let outline: Pt[] = []
    if (mode === 'uniform') {
      psi = (_x, y) => U * y
      phi = (x) => U * x
      vel = () => [U, 0]
      for (let j = -11; j <= 11; j++) levels.push(j * dU)
    } else if (mode === 'source') {
      psi = (x, y) => k * theta02(x, y)
      phi = (x, y) => {
        const r2 = x * x + y * y
        return r2 > 1e-12 ? 0.5 * k * Math.log(r2) : NaN
      }
      vel = (x, y) => {
        const r2 = x * x + y * y
        return r2 < 1e-12 ? [NaN, NaN] : [(k * x) / r2, (k * y) / r2]
      }
      levels = Array.from({ length: 15 }, (_, j) => ((j + 1) * m) / 16)
    } else {
      psi = psiUS(U, m)
      phi = phiUS(U, m)
      vel = velUS(U, m)
      const K = Math.min(50, Math.ceil(Math.max(m / 2, 2.6 * U) / dU) + 1)
      for (let j = -K; j <= K; j++) if (j !== 0) levels.push(m / 2 + j * dU)
      // The dividing streamline ψ = m/2 is drawn exactly in the overlay (upstream axis + body outline) rather than as a
      // contour: when m < 4Δψ the 2π jump of θ on the +x axis is too small for FlowField's branch-cut filter, and a
      // ψ = m/2 contour would wrongly appear along the +x axis inside the body.
      outline = bodyOutline(b, X[1] + 2, BOX, 0.02)
    }
    const markers: FlowMarker[] = []
    if (mode !== 'uniform') markers.push({ x: 0, y: 0, kind: 'source' })
    if (mode === 'sum') markers.push({ x: -b, y: 0, kind: 'stagnation', label: 'S' })
    return { psi, phi, vel, levels, outline, markers }
  }, [mode, U, m, k, b])

  // contributions at P
  const [px, py] = P
  const r2 = px * px + py * py
  const r = Math.sqrt(r2)
  const th = theta02(px, py)
  const okR = r2 > 1e-6
  const VU: Pt = [U, 0]
  const VS: Pt = okR ? [(k * px) / r2, (k * py) / r2] : [NaN, NaN]
  const V: Pt = [VU[0] + VS[0], VU[1] + VS[1]]
  const psiU = U * py
  const psiS = k * th
  const speed = Math.hypot(V[0], V[1])

  const overlay = ({ sx, sy }: { sx: (v: number) => number; sy: (v: number) => number }) => {
    const x0p = sx(X[0])
    const x1p = sx(X[1])
    const yTop = sy(Y[1])
    const yBot = sy(Y[0])
    const toData = (e: RPointerEvent<SVGRectElement>): Pt | null => {
      const svg = e.currentTarget.ownerSVGElement
      if (!svg) return null
      const rect = svg.getBoundingClientRect()
      const x = X[0] + ((e.clientX - rect.left - x0p) / (x1p - x0p)) * (X[1] - X[0])
      const y = Y[1] - ((e.clientY - rect.top - yTop) / (yBot - yTop)) * (Y[1] - Y[0])
      return [num.clamp(+x.toFixed(2), X[0], X[1]), num.clamp(+y.toFixed(2), Y[0], Y[1])]
    }
    const tip = (base: Pt, vec: Pt): Pt => {
      const L = Math.hypot(vec[0], vec[1]) * TAU
      const s = L > MAX_LEN ? MAX_LEN / L : 1
      return [base[0] + vec[0] * TAU * s, base[1] + vec[1] * TAU * s]
    }
    const arrow = (from: Pt, to: Pt, color: string, width: number, dash?: string) =>
      Number.isFinite(to[0]) && Number.isFinite(to[1]) ? (
        <ArrowLine x1={sx(from[0])} y1={sy(from[1])} x2={sx(to[0])} y2={sy(to[1])} color={color} width={width} head={9} dash={dash} />
      ) : null
    const tU = tip(P, VU)
    const tS = okR ? tip(P, VS) : P
    const tSum = okR ? tip(P, V) : tU
    const tip2: Pt = [tU[0] + (tS[0] - P[0]), tU[1] + (tS[1] - P[1])]
    const lab = (p: Pt, sub: string, cls: string) => (
      <Label x={sx(p[0]) + 6} y={sy(p[1]) - 6} size={13} className={cls} italic>
        V
        {sub ? (
          <tspan dy={4} style={{ fontSize: 10 }}>
            {sub}
          </tspan>
        ) : null}
      </Label>
    )
    return (
      <g>
        <rect
          x={x0p}
          y={yTop}
          width={x1p - x0p}
          height={yBot - yTop}
          fill="transparent"
          style={{ cursor: 'crosshair' }}
          onPointerDown={(e) => {
            const p = toData(e)
            if (p) setP(p)
          }}
          onPointerMove={(e) => {
            if (e.pointerType === 'mouse' && e.buttons === 1) {
              const p = toData(e)
              if (p) setP(p)
            }
          }}
        />
        <g pointerEvents="none">
          {mode === 'sum' ? (
            <g>
              <line x1={x0p} y1={sy(0)} x2={sx(-b)} y2={sy(0)} stroke="var(--plot-4)" strokeWidth={2.4} strokeLinecap="round" />
              <path d={toPath(field.outline, sx, sy)} fill="none" stroke="var(--plot-4)" strokeWidth={2.4} strokeLinejoin="round" />
              <Label x={x0p + 6} y={sy(0) - 8} size={11} className="fill-rose-700 dark:fill-rose-300">
                dividing streamline ψ = m/2
              </Label>
            </g>
          ) : null}
          {mode === 'source' ? <line x1={sx(0)} y1={sy(0)} x2={x1p} y2={sy(0)} stroke="var(--streamline)" strokeWidth={1.35} /> : null}
          {mode === 'sum' && okR ? (
            <g>
              <line x1={sx(tU[0])} y1={sy(tU[1])} x2={sx(tip2[0])} y2={sy(tip2[1])} stroke="var(--ink-3)" strokeDasharray="4 3" strokeWidth={1.1} />
              <line x1={sx(tS[0])} y1={sy(tS[1])} x2={sx(tip2[0])} y2={sy(tip2[1])} stroke="var(--ink-3)" strokeDasharray="4 3" strokeWidth={1.1} />
            </g>
          ) : null}
          {mode !== 'source' ? arrow(P, tU, 'var(--plot-1)', mode === 'sum' ? 2 : 2.6) : null}
          {mode !== 'uniform' && okR ? arrow(P, tS, 'var(--plot-3)', mode === 'sum' ? 2 : 2.6) : null}
          {mode === 'sum' && okR ? arrow(P, tSum, 'var(--plot-4)', 3) : null}
          <circle cx={sx(px)} cy={sy(py)} r={4.5} fill="var(--ink)" stroke="var(--surface)" strokeWidth={1.5} />
          {mode !== 'source' ? lab(tU, 'U', 'fill-indigo-700 dark:fill-indigo-300') : null}
          {mode !== 'uniform' && okR ? lab(tS, 's', 'fill-amber-700 dark:fill-amber-300') : null}
          {mode === 'sum' && okR ? lab(tSum, '', 'fill-rose-700 dark:fill-rose-300') : null}
          <Label x={sx(px) - 8} y={sy(py) + 16} anchor="end" size={12}>
            P
          </Label>
        </g>
      </g>
    )
  }

  const row = (label: string, a: number, s: number, unit: string) => (
    <tr className="border-t border-line">
      <td className="py-1 pr-2 text-left">
        <M tex={label} /> <span className="text-[10px] text-ink-3">{unit}</span>
      </td>
      <td className="px-1 text-right font-mono">{fmt(a)}</td>
      <td className="px-1 text-right font-mono">{fmt(s)}</td>
      <td className="pl-1 text-right font-mono font-semibold text-rose-700 dark:text-rose-300">{fmt(a + s)}</td>
    </tr>
  )

  return (
    <SimPanel
      title="Superposition at a point"
      subtitle="velocities add as vectors, ψ adds as a number"
      controls={
        <>
          <Segmented
            label="Show the flow field of"
            value={mode}
            onChange={setMode}
            options={[
              { value: 'uniform', label: 'Uniform' },
              { value: 'source', label: 'Source' },
              { value: 'sum', label: 'Sum' },
            ]}
          />
          <Slider label="free-stream speed $U$" value={U} min={0.5} max={6} step={0.1} onChange={setU} unit="m/s" digits={2} />
          <Slider label="source strength $m$" value={m} min={0.5} max={12} step={0.1} onChange={setM} unit="m²/s" digits={3} />
          <Slider label="probe $x_P$" value={px} min={X[0]} max={X[1]} step={0.05} onChange={(v) => setP([v, py])} unit="m" digits={3} />
          <Slider label="probe $y_P$" value={py} min={Y[0]} max={Y[1]} step={0.05} onChange={(v) => setP([px, v])} unit="m" digits={3} />
          <Toggle label="equipotentials $\phi$ = const (flow net)" checked={phiOn} onChange={setPhiOn} />
        </>
      }
      readout={
        <div className="space-y-2">
          <div className="overflow-x-auto rounded-xl border border-line bg-surface px-2.5 py-1.5">
            <table className="w-full text-[12px] text-ink-2">
              <thead>
                <tr className="text-[10px] uppercase tracking-wide text-ink-3">
                  <th className="py-1 text-left font-semibold">at P</th>
                  <th className="px-1 text-right font-semibold text-indigo-700 dark:text-indigo-300">uniform</th>
                  <th className="px-1 text-right font-semibold text-amber-700 dark:text-amber-300">source</th>
                  <th className="pl-1 text-right font-semibold text-rose-700 dark:text-rose-300">sum</th>
                </tr>
              </thead>
              <tbody>
                {row('u', VU[0], VS[0], 'm/s')}
                {row('v', VU[1], VS[1], 'm/s')}
                {row(md`\psi`, psiU, psiS, 'm²/s')}
              </tbody>
            </table>
          </div>
          <Tiles
            cols={2}
            items={[
              { label: md`$\lvert\vb{V}\rvert$ (sum)`, value: okR ? speed : '—', unit: 'm/s', tone: 'accent' },
              { label: md`$r,\ \theta$`, value: okR ? `${num.fmt(r, 3)} m, ${num.fmt((th * 180) / Math.PI, 3)}°` : '—' },
              { label: md`$b = m/2\pi U$`, value: b, unit: 'm' },
              { label: md`$\lvert\vb{V}_U\rvert + \lvert\vb{V}_s\rvert$`, value: okR ? U + Math.hypot(VS[0], VS[1]) : '—', unit: 'm/s' },
            ]}
          />
        </div>
      }
      footer={
        <span>
          <b>Try this:</b> with the defaults (U = 4 m/s, m = 8 m²/s, P = (1, 1) m) the table reproduces the solved example. Now drag P onto
          the axis at x = −b (read b above): the amber source arrow becomes equal and opposite to the blue uniform arrow and the red sum
          vanishes — that is the stagnation point. Notice that |V| is never |V_U| + |V_s| unless the two arrows are parallel.
        </span>
      }
    >
      <FlowField
        x={X}
        y={Y}
        psi={field.psi}
        phi={phiOn ? field.phi : undefined}
        equipotentials={phiOn}
        vel={field.vel}
        psiLevels={field.levels}
        markers={field.markers}
        particles={70}
        Uref={U}
        overlay={overlay}
      />
      <p className="mt-1 text-center text-[11px] text-ink-3">Axes x, y in m (source at the origin). Tap or click anywhere in the field to move the probe P.</p>
    </SimPanel>
  )
}
