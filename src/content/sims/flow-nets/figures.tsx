/**
 * SVG recreations of the Lecture 12 figures used in the flow-net topic:
 *  - slide 3: Cartesian and polar decomposition of the velocity vector
 *  - slide 4: uniform flow u = U, v = w = 0 on 3-D axes
 *  - slide 5: two perpendicular lines with slope triangles, (a/b)(−b/a) = −1 (with an angle slider)
 *  - slide 6: flow rate between neighbouring streamlines (A, B, C construction) and the sign convention
 * All colours are theme variables, all sizes come from a viewBox so the figures scale down to phone width.
 */
import { useState } from 'react'
import { Slider } from '@/kit'
import { Arrow, RightAngle, Sub, Tx, Up, polyPath } from './svg'

const STREAM = 'var(--streamline)'
const EQUI = 'var(--equipotential)'

/* ------------------------------------------------------------------------------- slide 3 */

/** Lecture 12, slide 3: V split into (u, v) and into (v_r, v_θ). Labels give the φ and the ψ route. */
export function VelocityComponentsFigure() {
  // polar panel geometry (screen coordinates; y down)
  const O = { x: 24, y: 204 }
  const th = (30 * Math.PI) / 180
  const R = 175
  const P = { x: O.x + R * Math.cos(th), y: O.y - R * Math.sin(th) }
  const er: [number, number] = [Math.cos(th), -Math.sin(th)]
  const et: [number, number] = [-Math.sin(th), -Math.cos(th)]
  const T1 = { x: P.x + 84 * et[0], y: P.y + 84 * et[1] }
  const T2 = { x: T1.x + 36 * er[0], y: T1.y + 36 * er[1] }
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <svg viewBox="0 0 300 224" className="h-auto w-full" role="img" aria-label="Cartesian components u and v of the velocity V">
        <line x1={36} y1={16} x2={36} y2={200} stroke="var(--ink-3)" strokeWidth={1.4} />
        <line x1={36} y1={200} x2={290} y2={200} stroke="var(--ink-3)" strokeWidth={1.4} />
        <Tx x={28} y={24} anchor="end">y</Tx>
        <Tx x={288} y={216} anchor="end">x</Tx>
        <Arrow x1={78} y1={136} x2={208} y2={136} color="var(--plot-1)" width={2.4} />
        <Arrow x1={208} y1={136} x2={208} y2={70} color="var(--plot-1)" width={2.4} />
        <Arrow x1={78} y1={136} x2={208} y2={70} color="var(--ink)" width={2.6} />
        <RightAngle x={208} y={136} d1={[-1, 0]} d2={[0, -1]} />
        <Tx x={132} y={92} size={16} weight={700}>V</Tx>
        <Tx x={143} y={157} anchor="middle" size={13.5}>
          u <Up>= ∂</Up>φ<Up>/∂</Up>x
        </Tx>
        <Tx x={143} y={175} anchor="middle" size={12.5} cls="fill-ink-3">
          <Up>= ∂</Up>ψ<Up>/∂</Up>y
        </Tx>
        <Tx x={216} y={98} size={13.5}>
          v <Up>= ∂</Up>φ<Up>/∂</Up>y
        </Tx>
        <Tx x={216} y={116} size={12.5} cls="fill-ink-3">
          <Up>= −∂</Up>ψ<Up>/∂</Up>x
        </Tx>
        <Tx x={160} y={218} anchor="middle" size={11} math={false} cls="fill-ink-3">
          Cartesian components
        </Tx>
      </svg>
      <svg viewBox="0 0 300 224" className="h-auto w-full" role="img" aria-label="Polar components v_r and v_theta of the velocity V">
        <line x1={O.x} y1={12} x2={O.x} y2={O.y} stroke="var(--ink-3)" strokeWidth={1.4} />
        <line x1={O.x} y1={O.y} x2={292} y2={O.y} stroke="var(--ink-3)" strokeWidth={1.4} />
        <line x1={O.x} y1={O.y} x2={P.x} y2={P.y} stroke="var(--ink-2)" strokeWidth={1.3} strokeDasharray="7 4 2 4" />
        <path
          d={`M${O.x + 46} ${O.y}A46 46 0 0 0 ${O.x + 46 * Math.cos(th)} ${O.y - 46 * Math.sin(th)}`}
          fill="none"
          stroke="var(--ink-2)"
          strokeWidth={1.2}
        />
        <Tx x={O.x + 58} y={O.y - 9}>θ</Tx>
        <Tx x={(O.x + P.x) / 2 + 4} y={(O.y + P.y) / 2 + 16}>r</Tx>
        <Arrow x1={P.x} y1={P.y} x2={T1.x} y2={T1.y} color="var(--plot-6)" width={2.4} />
        <Arrow x1={T1.x} y1={T1.y} x2={T2.x} y2={T2.y} color="var(--plot-6)" width={2.4} />
        <Arrow x1={P.x} y1={P.y} x2={T2.x} y2={T2.y} color="var(--ink)" width={2.6} />
        <RightAngle x={P.x} y={P.y} d1={[-er[0], -er[1]]} d2={et} />
        <Tx x={P.x + 8} y={(P.y + T2.y) / 2 + 4} size={16} weight={700}>V</Tx>
        <Tx x={126} y={100} anchor="end" size={13.5}>
          v<Sub>θ</Sub>
          <Up> = (1/</Up>r<Up>) ∂</Up>φ<Up>/∂</Up>θ
        </Tx>
        <Tx x={126} y={118} anchor="end" size={12.5} cls="fill-ink-3">
          <Up>= −∂</Up>ψ<Up>/∂</Up>r
        </Tx>
        <Tx x={T1.x - 10} y={T1.y - 14} anchor="end" size={13.5}>
          v<Sub>r</Sub>
          <Up> = ∂</Up>φ<Up>/∂</Up>r
        </Tx>
        <Tx x={T1.x - 10} y={T1.y + 3} anchor="end" size={12.5} cls="fill-ink-3">
          <Up>= (1/</Up>r<Up>) ∂</Up>ψ<Up>/∂</Up>θ
        </Tx>
        <Tx x={210} y={218} anchor="middle" size={11} math={false} cls="fill-ink-3">
          polar components
        </Tx>
      </svg>
    </div>
  )
}

/* ------------------------------------------------------------------------------- slide 4 */

/** Lecture 12, slide 4: a uniform stream u = U, v = 0, w = 0 drawn next to 3-D axes. */
export function UniformFlowFigure() {
  const rows = [30, 54, 78, 102, 126]
  return (
    <svg viewBox="0 0 340 214" className="mx-auto h-auto w-full max-w-md" role="img" aria-label="Uniform flow u = U, v = 0, w = 0">
      <line x1={70} y1={172} x2={70} y2={64} stroke="var(--ink-3)" strokeWidth={1.4} />
      <line x1={70} y1={172} x2={178} y2={172} stroke="var(--ink-3)" strokeWidth={1.4} />
      <line x1={70} y1={172} x2={30} y2={206} stroke="var(--ink-3)" strokeWidth={1.4} />
      <Tx x={76} y={70}>y</Tx>
      <Tx x={182} y={186}>x</Tx>
      <Tx x={20} y={210}>z</Tx>
      {rows.map((y) => (
        <Arrow key={y} x1={146} y1={y} x2={236} y2={y} color={STREAM} width={2} head={10} />
      ))}
      <Tx x={246} y={35} size={13.5}>
        u <Up>=</Up> U <Up>(constant)</Up>
      </Tx>
      <Tx x={246} y={83} size={13.5}>
        v <Up>= 0</Up>
      </Tx>
      <Tx x={246} y={131} size={13.5}>
        w <Up>= 0</Up>
      </Tx>
    </svg>
  )
}

/* ------------------------------------------------------------------------------- slide 5 */

/**
 * Lecture 12, slide 5: two lines crossing at right angles. The steep line (a streamline) has slope a/b,
 * the other (an equipotential) has slope −b/a; the product of the slopes is −1 whatever the angle.
 */
export function SlopeTriangleFigure() {
  const [beta, setBeta] = useState(63.43)
  const b = (beta * Math.PI) / 180
  const C = { x: 168, y: 118 }
  const d1: [number, number] = [Math.cos(b), -Math.sin(b)] // screen direction of the streamline
  const d2: [number, number] = [-Math.sin(b), -Math.cos(b)] // screen direction of the equipotential (up-left)
  const at = (d: [number, number], s: number) => ({ x: C.x + d[0] * s, y: C.y + d[1] * s })
  const H0 = at(d1, 26)
  const H1 = at(d1, 92)
  const K1 = { x: H1.x, y: H0.y }
  const G0 = at(d2, 26)
  const G1 = at(d2, 92)
  const K2 = { x: G1.x, y: G0.y }
  const s1 = Math.tan(b)
  const s2 = -1 / Math.tan(b)
  return (
    <div>
      <svg viewBox="0 0 330 250" className="mx-auto h-auto w-full max-w-md" role="img" aria-label="Perpendicular lines with slope triangles">
        <line x1={28} y1={12} x2={28} y2={236} stroke="var(--ink-3)" strokeWidth={1.3} />
        <line x1={28} y1={236} x2={318} y2={236} stroke="var(--ink-3)" strokeWidth={1.3} />
        <Tx x={20} y={20} anchor="end">y</Tx>
        <Tx x={316} y={249} anchor="end">x</Tx>
        <line x1={C.x - d1[0] * 112} y1={C.y - d1[1] * 112} x2={C.x + d1[0] * 112} y2={C.y + d1[1] * 112} stroke={STREAM} strokeWidth={3} strokeLinecap="round" />
        <line x1={C.x - d2[0] * 112} y1={C.y - d2[1] * 112} x2={C.x + d2[0] * 112} y2={C.y + d2[1] * 112} stroke={EQUI} strokeWidth={3} strokeDasharray="9 5" strokeLinecap="round" />
        <path d={polyPath([[H0.x, H0.y], [K1.x, K1.y], [H1.x, H1.y]])} fill="none" stroke="var(--ink-2)" strokeWidth={1.2} />
        <path d={polyPath([[G0.x, G0.y], [K2.x, K2.y], [G1.x, G1.y]])} fill="none" stroke="var(--ink-2)" strokeWidth={1.2} />
        <RightAngle x={C.x} y={C.y} d1={d1} d2={d2} size={10} />
        <Tx x={(H0.x + K1.x) / 2} y={H0.y + 15} anchor="middle">b</Tx>
        <Tx x={K1.x + 6} y={(K1.y + H1.y) / 2 + 5}>a</Tx>
        <Tx x={(G0.x + K2.x) / 2} y={G0.y + 15} anchor="middle">a</Tx>
        <Tx x={K2.x - 6} y={(K2.y + G1.y) / 2 + 5} anchor="end">b</Tx>
      </svg>
      <div className="mx-auto mt-2 max-w-md space-y-2">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-ink-3">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-5 rounded" style={{ background: STREAM }} /> streamline (ψ = const), slope a/b
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block w-5 border-t-2 border-dashed" style={{ borderColor: EQUI }} /> equipotential (φ = const), slope −b/a
          </span>
        </div>
        <Slider label="angle of the streamline to the $x$ axis" value={beta} min={12} max={78} step={0.5} onChange={setBeta} unit="°" digits={3} />
        <div className="grid grid-cols-3 gap-2 text-center font-mono text-xs text-ink-2">
          <div className="rounded-lg border border-line bg-surface-2 px-2 py-1">a/b = {s1.toFixed(3)}</div>
          <div className="rounded-lg border border-line bg-surface-2 px-2 py-1">−b/a = {s2.toFixed(3)}</div>
          <div className="rounded-lg border border-line bg-surface-2 px-2 py-1">(a/b)(−b/a) = {(s1 * s2).toFixed(3)}</div>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------------------- slide 6 */

const sLow = (x: number) => 150 + 45 * Math.tanh((x - 250) / 140)
const sUp = (x: number) => 70 + 40 * Math.tanh((x - 270) / 140)
const curve = (f: (x: number) => number, x0: number, x1: number) => polyPath(Array.from({ length: 61 }, (_, k) => {
  const x = x0 + ((x1 - x0) * k) / 60
  return [x, f(x)] as [number, number]
}))

/** Lecture 12, slide 6: dq between ψ and ψ + dψ, crossing the arbitrary curve AC, and the direction rule. */
export function FlowRateFigure() {
  const A = { x: 170, y: sLow(170) }
  const C = { x: 300, y: sUp(300) }
  const B = { x: C.x, y: A.y }
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 470 250" className="mx-auto h-auto w-full max-w-2xl" role="img" aria-label="Flow rate between two neighbouring streamlines">
        <line x1={22} y1={180} x2={22} y2={236} stroke="var(--ink-3)" strokeWidth={1.3} />
        <line x1={22} y1={236} x2={84} y2={236} stroke="var(--ink-3)" strokeWidth={1.3} />
        <Tx x={14} y={188} anchor="end">y</Tx>
        <Tx x={86} y={248}>x</Tx>
        <path d={curve(sLow, 50, 455)} fill="none" stroke={STREAM} strokeWidth={3} strokeLinecap="round" />
        <path d={curve(sUp, 70, 460)} fill="none" stroke={STREAM} strokeWidth={3} strokeLinecap="round" />
        <Tx x={52} y={101} size={15}>ψ</Tx>
        <Tx x={66} y={24} size={15}>
          ψ <Up>+ d</Up>ψ
        </Tx>
        <Arrow x1={96} y1={74} x2={150} y2={92} color="var(--ink)" width={3.2} head={12} />
        <Tx x={112} y={66} size={14}>
          <Up>d</Up>q
        </Tx>
        <path
          d={`M${A.x} ${A.y}C${A.x + 25} ${A.y - 55} ${C.x - 60} ${C.y + 30} ${C.x} ${C.y}`}
          fill="none"
          stroke="var(--ink)"
          strokeWidth={2}
        />
        <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke="var(--ink-2)" strokeWidth={1.3} strokeDasharray="6 4" />
        <line x1={B.x} y1={B.y} x2={C.x} y2={C.y} stroke="var(--ink-2)" strokeWidth={1.3} strokeDasharray="6 4" />
        <Arrow x1={B.x} y1={(B.y + C.y) / 2} x2={B.x + 46} y2={(B.y + C.y) / 2} color="var(--plot-1)" width={1.8} />
        <Tx x={B.x + 50} y={(B.y + C.y) / 2 + 5} size={13.5}>
          u <Up>d</Up>y
        </Tx>
        <Arrow x1={(A.x + B.x) / 2} y1={A.y} x2={(A.x + B.x) / 2} y2={A.y + 42} color="var(--plot-1)" width={1.8} />
        <Tx x={(A.x + B.x) / 2 + 6} y={A.y + 58} size={13.5}>
          <Up>−</Up>v <Up>d</Up>x
        </Tx>
        {[A, C].map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={4} fill="var(--ink)" />
        ))}
        <Tx x={A.x - 8} y={A.y + 18} anchor="end" math={false} weight={600}>A</Tx>
        <Tx x={B.x + 5} y={B.y + 17} math={false} weight={600}>B</Tx>
        <Tx x={C.x + 2} y={C.y - 9} math={false} weight={600}>C</Tx>
      </svg>
      <div className="grid gap-3 sm:grid-cols-3">
        <DirectionPanel caption="q = ψ₂ − ψ₁" upper="ψ₂" dir={1} />
        <DirectionPanel caption="ψ₂ > ψ₁: q flows to the right" upper="ψ₂ > ψ₁" dir={1} />
        <DirectionPanel caption="ψ₂ < ψ₁: q flows to the left" upper="ψ₂ < ψ₁" dir={-1} />
      </div>
    </div>
  )
}

function DirectionPanel({ caption, upper, dir }: { caption: string; upper: string; dir: 1 | -1 }) {
  const up = (x: number) => 34 + 10 * Math.tanh((x - 110) / 50)
  const lo = (x: number) => 98 + 12 * Math.tanh((x - 105) / 50)
  return (
    <figure className="rounded-xl border border-line bg-surface-2/50 p-2">
      <svg viewBox="0 0 220 130" className="h-auto w-full" role="img" aria-label={caption}>
        <path d={curve(up, 18, 196)} fill="none" stroke={STREAM} strokeWidth={2.6} strokeLinecap="round" />
        <path d={curve(lo, 12, 190)} fill="none" stroke={STREAM} strokeWidth={2.6} strokeLinecap="round" />
        {dir === 1 ? (
          <Arrow x1={78} y1={64} x2={138} y2={70} color="var(--ink)" width={2.6} head={11} />
        ) : (
          <Arrow x1={138} y1={70} x2={78} y2={64} color="var(--ink)" width={2.6} head={11} />
        )}
        <Tx x={dir === 1 ? 146 : 60} y={74} anchor={dir === 1 ? 'start' : 'end'}>q</Tx>
        <Tx x={110} y={22} anchor="middle" size={13}>{upper}</Tx>
        <Tx x={110} y={126} anchor="middle" size={13}>ψ₁</Tx>
      </svg>
      <figcaption className="text-center text-xs text-ink-3">{caption}</figcaption>
    </figure>
  )
}
