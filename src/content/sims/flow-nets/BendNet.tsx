/**
 * Lecture 12, slide 7 recreated from a real solution: the flow net of a 2-D 90° bend
 * (Δψ = Δφ = q/4, four stream tubes as on the slide), with the spacing/speed annotations d, d₁, d₂, V, V₁, V₂,
 * plus a plot of the speed across the bend.
 */
import { useMemo } from 'react'
import { FlowField, Plot, md } from '@/kit'
import { getBend } from './bend'
import { getNetPreset, levelsFor } from './fields'
import { Arrow, Sub, Tx, Up } from './svg'
import type { OverlayCtx } from './ui'

const TUBE = 0.25 // Δψ = Δφ (m²/s) for q = 1 m²/s → four stream tubes

/** Tube widths and tube-average speeds at the 45° section of the bend (numerical solution). */
export function bendNumbers() {
  const B = getBend()
  const d2 = B.levelN(45, TUBE)
  const d1 = B.w - B.levelN(45, B.Q - TUBE)
  const d = B.w / 4
  const prof = B.radial(45, 48)
  return {
    d, d1, d2,
    V: B.Vin,
    V1: TUBE / d1,
    V2: TUBE / d2,
    Vinner: prof[0].V,
    Vouter: prof[prof.length - 1].V,
  }
}

function Annotations({ ctx }: { ctx: OverlayCtx }) {
  const B = getBend()
  const { sx, sy } = ctx
  const nb = bendNumbers()
  const S = (p: [number, number]) => [sx(p[0]), sy(p[1])] as const
  // inlet: velocity arrows and the dimension d next to each wall
  const inletArrow = (y: number) => {
    const [x1, y1] = S([-1.25, y])
    const [x2] = S([-0.97, y])
    return <Arrow x1={x1} y1={y1} x2={x2} y2={y1} color="var(--ink)" width={2.6} head={9} />
  }
  const dim = (pA: [number, number], pB: [number, number]) => {
    const [x1, y1] = S(pA)
    const [x2, y2] = S(pB)
    return <Arrow x1={x1} y1={y1} x2={x2} y2={y2} color="var(--plot-4)" width={1.4} head={6} both />
  }
  // 45° section of the bend
  const inA = B.radialPoint(45, 0)
  const inB = B.radialPoint(45, nb.d2)
  const outA = B.radialPoint(45, B.w - nb.d1)
  const outB = B.radialPoint(45, B.w)
  // tangential speed arrows at 25° (clockwise tangent e_s = (cos θ', −sin θ'))
  const t = (25 * Math.PI) / 180
  const es: [number, number] = [Math.cos(t), -Math.sin(t)]
  const k = 0.22 // m of arrow per (m/s)
  const vArrow = (n: number, V: number) => {
    const p = B.radialPoint(25, n)
    const [x1, y1] = S(p)
    const [x2, y2] = S([p[0] + k * V * es[0], p[1] + k * V * es[1]])
    return <Arrow x1={x1} y1={y1} x2={x2} y2={y2} color="var(--ink)" width={2.6} head={9} />
  }
  const lbl2 = S(B.radialPoint(45, -0.2))
  const lbl1 = S(B.radialPoint(45, B.w + 0.08))
  const v2tip = S(B.radialPoint(25, nb.d2 / 2))
  const v1tip = S(B.radialPoint(25, B.w - nb.d1 / 2))
  const [ix, iyTop] = S([-1.42, B.b - TUBE / 2])
  const [, iyBot] = S([-1.42, B.a + TUBE / 2])
  return (
    <g pointerEvents="none">
      {inletArrow(B.b - TUBE / 2)}
      {inletArrow(B.a + TUBE / 2)}
      <Tx x={sx(-0.93)} y={iyTop + 5} size={13} weight={700} halo>V</Tx>
      <Tx x={sx(-0.93)} y={iyBot + 5} size={13} weight={700} halo>V</Tx>
      {dim([-1.42, B.b], [-1.42, B.b - TUBE])}
      {dim([-1.42, B.a], [-1.42, B.a + TUBE])}
      <Tx x={ix + 5} y={iyTop + 5} size={12} halo>d</Tx>
      <Tx x={ix + 5} y={iyBot + 5} size={12} halo>d</Tx>
      {dim(inA, inB)}
      {dim(outA, outB)}
      {vArrow(nb.d2 / 2, nb.V2)}
      {vArrow(B.w - nb.d1 / 2, nb.V1)}
      <Tx x={v2tip[0] - 4} y={v2tip[1] - 8} size={12.5} weight={700} anchor="end" halo>
        V<Sub>2</Sub>
      </Tx>
      <Tx x={v1tip[0] + 2} y={v1tip[1] - 9} size={12.5} weight={700} halo>
        V<Sub>1</Sub>
      </Tx>
      <Tx x={lbl2[0]} y={lbl2[1] - 4} size={12} anchor="middle" halo>
        d<Sub>2</Sub>
        <Up> {'<'} </Up>d
      </Tx>
      <Tx x={lbl2[0]} y={lbl2[1] + 11} size={12} anchor="middle" halo>
        V<Sub>2</Sub>
        <Up> {'>'} </Up>V
      </Tx>
      <Tx x={lbl1[0] + 2} y={lbl1[1] - 4} size={12} halo>
        d<Sub>1</Sub>
        <Up> {'>'} </Up>d
      </Tx>
      <Tx x={lbl1[0] + 2} y={lbl1[1] + 11} size={12} halo>
        V<Sub>1</Sub>
        <Up> {'<'} </Up>V
      </Tx>
    </g>
  )
}

/** The flow net of slide 7, computed: streamlines and equipotentials at equal increments Δψ = Δφ = q/4. */
export function BendNetFigure() {
  const P = getNetPreset('bend')
  const psiLevels = useMemo(() => levelsFor(P.psiRange, TUBE, true), [P])
  const phiLevels = useMemo(() => levelsFor(P.phiRange, TUBE), [P])
  return (
    <FlowField
      x={P.x}
      y={P.y}
      psi={P.psi}
      phi={P.phi}
      vel={P.vel}
      body={P.body}
      psiLevels={psiLevels}
      phiLevels={phiLevels}
      equipotentials
      particles={110}
      Uref={1}
      maxHeight={480}
      overlay={(ctx) => <Annotations ctx={ctx} />}
    />
  )
}

/** Speed across the 45° section of the bend: numerical solution vs the free-vortex (V ∝ 1/r) estimate. */
export function BendSpeedPlot() {
  const B = getBend()
  const pts = useMemo(() => B.radial(45, 60).map((p) => [p.n / B.w, p.V / B.Vin] as [number, number]), [B])
  const nb = bendNumbers()
  const lnr = Math.log(B.b / B.a)
  return (
    <Plot
      x={{ label: md`distance from the inner wall, $n/w$`, domain: [0, 1] }}
      y={{ label: md`speed ratio $V/V_\text{in}$`, domain: [0, 2.4] }}
      height={260}
      series={[
        { label: 'computed potential flow (45° section)', points: pts, color: 'var(--plot-1)', width: 2.6 },
        { label: md`free-vortex estimate $V = q/(r\ln(b/a))$`, fn: (n) => B.Q / ((B.a + n * B.w) * lnr) / B.Vin, color: 'var(--plot-4)', dash: '6 4' },
        { label: md`inlet: uniform $V$`, fn: () => 1, color: 'var(--plot-7)', dash: '2 4' },
      ]}
      vlines={[
        { x: nb.d2 / B.w, label: md`$\psi = q/4$`, color: 'var(--streamline)', dash: '3 3' },
        { x: 1 - nb.d1 / B.w, label: md`$\psi = 3q/4$`, color: 'var(--streamline)', dash: '3 3' },
      ]}
      marks={[
        { x: 0, y: nb.Vinner, label: 'inner wall', color: 'var(--plot-4)' },
        { x: 1, y: nb.Vouter, label: 'outer wall', color: 'var(--plot-2)' },
      ]}
    />
  )
}
