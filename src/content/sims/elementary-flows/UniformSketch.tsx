import { Arrow, Label, arcPath, rad } from './svg'

const SUB = ['₁', '₂', '₃', '₄']

/**
 * Recreation of the Lecture 12 slide 8 (α = 0) and slide 9 (α ≠ 0) figures: a uniform stream U,
 * four straight streamlines ψ = ψ₁…ψ₄ and two dashed equipotentials φ = φ₁, φ₂ drawn at right angles.
 */
export function UniformSketch({ alphaDeg = 0, title }: { alphaDeg?: number; title?: string }) {
  const a = rad(alphaDeg)
  const ca = Math.cos(a)
  const sa = Math.sin(a)
  const tilted = Math.abs(alphaDeg) > 0.5
  // pattern centre and layout in flow-aligned coordinates (s along the stream, n across it, px)
  const C = tilted ? { x: 194, y: 108 } : { x: 182, y: 116 }
  const arrowS: [number, number] = tilted ? [-112, -64] : [-122, -72]
  const lineS: [number, number] = tilted ? [-42, 90] : [-46, 92]
  const eqS = tilted ? [-20, 46] : [-24, 44]
  const eqN = tilted ? 58 : 60
  const psiLabS = tilted ? 95 : 97
  const phiLabN = tilted ? 70 : 74
  const P = (s: number, n: number) => ({ x: C.x + s * ca - n * sa, y: C.y - (s * sa + n * ca) })
  const ns = [39, 13, -13, -39]
  const O = { x: 28, y: 222 }
  const tail = P(arrowS[0], -39)

  return (
    <svg viewBox="0 0 344 240" className="h-auto w-full" role="img" aria-label={title ?? 'Uniform flow: streamlines and equipotential lines'}>
      {/* axes (origin at the lower left, as on the slides) */}
      <Arrow x1={O.x} y1={O.y} x2={330} y2={O.y} color="var(--ink-3)" width={1.3} head={7} />
      <Arrow x1={O.x} y1={O.y} x2={O.x} y2={14} color="var(--ink-3)" width={1.3} head={7} />
      <Label x={324} y={236} italic color="var(--ink-3)">x</Label>
      <Label x={12} y={22} italic color="var(--ink-3)">y</Label>

      {/* equipotentials φ = φ₁, φ₂ (dashed) */}
      {eqS.map((s, i) => {
        const p0 = P(s, -eqN)
        const p1 = P(s, eqN)
        const lab = P(s, -phiLabN)
        return (
          <g key={`e${i}`}>
            <line x1={p0.x} y1={p0.y} x2={p1.x} y2={p1.y} stroke="var(--equipotential)" strokeWidth={1.5} strokeDasharray="6 4" />
            <Label x={lab.x} y={lab.y + 4} anchor="middle" italic size={13}>{`φ = φ${SUB[i]}`}</Label>
          </g>
        )
      })}

      {/* streamlines ψ = ψ₁ … ψ₄ */}
      {ns.map((n, i) => {
        const p0 = P(lineS[0], n)
        const p1 = P(lineS[1], n)
        const lab = P(psiLabS, n)
        return (
          <g key={`s${i}`}>
            <line x1={p0.x} y1={p0.y} x2={p1.x} y2={p1.y} stroke="var(--streamline)" strokeWidth={2} strokeLinecap="round" />
            <Label x={lab.x} y={lab.y + 4} italic size={13}>{`ψ = ψ${SUB[i]}`}</Label>
          </g>
        )
      })}

      {/* the oncoming stream U */}
      {ns.map((n, i) => {
        const p0 = P(arrowS[0], n)
        const p1 = P(arrowS[1], n)
        return <Arrow key={`a${i}`} x1={p0.x} y1={p0.y} x2={p1.x} y2={p1.y} width={2.4} head={9} />
      })}
      {(() => {
        const p = P((arrowS[0] + arrowS[1]) / 2, 39 + 14)
        return (
          <Label x={p.x} y={p.y + 4} anchor="middle" italic weight={600} color="var(--ink)">
            U
          </Label>
        )
      })()}

      {/* angle α between the stream and the horizontal (slide 9) */}
      {tilted ? (
        <g>
          <line x1={tail.x} y1={tail.y} x2={tail.x + 46} y2={tail.y} stroke="var(--ink-3)" strokeWidth={1.2} />
          <path d={arcPath(tail.x, tail.y, 26, 0, a)} fill="none" stroke="var(--ink-2)" strokeWidth={1.3} />
          <Label x={tail.x + 35 * Math.cos(a / 2)} y={tail.y - 35 * Math.sin(a / 2) + 4} anchor="middle" italic color="var(--ink)">
            α
          </Label>
        </g>
      ) : null}
    </svg>
  )
}

/**
 * Flow-aligned coordinates for the inclined stream: s along the flow and n across it (to its left), so that
 * φ = U s and ψ = U n. Supplementary explanation of where the slide-9 formulas come from.
 */
export function RotatedAxesSketch({ alphaDeg = 30 }: { alphaDeg?: number }) {
  const a = rad(alphaDeg)
  const ca = Math.cos(a)
  const sa = Math.sin(a)
  const O = { x: 118, y: 200 }
  const W = (s: number, n: number) => ({ x: O.x + s * ca - n * sa, y: O.y - (s * sa + n * ca) })
  const sEnd = W(205, 0)
  const nEnd = W(0, 160)
  const Pp = W(140, 70)
  const fs = W(140, 0)
  const fn = W(0, 70)
  // the same point in x–y: x = s cos α − n sin α, y = s sin α + n cos α
  const fx = { x: Pp.x, y: O.y }
  const fy = { x: O.x, y: Pp.y }
  const u0 = W(170, -30)
  const u1 = W(215, -30)
  const u2 = W(150, -62)
  const u3 = W(195, -62)
  return (
    <svg viewBox="0 0 344 240" className="h-auto w-full" role="img" aria-label="Flow-aligned coordinates s and n for a uniform stream at angle alpha">
      {/* x–y axes */}
      <Arrow x1={8} y1={O.y} x2={334} y2={O.y} color="var(--ink-3)" width={1.2} head={7} />
      <Arrow x1={O.x} y1={O.y + 10} x2={O.x} y2={10} color="var(--ink-3)" width={1.2} head={7} />
      <Label x={328} y={216} italic color="var(--ink-3)">x</Label>
      <Label x={124} y={18} italic color="var(--ink-3)">y</Label>

      {/* flow-aligned axes */}
      <Arrow x1={O.x} y1={O.y} x2={sEnd.x} y2={sEnd.y} color="var(--plot-1)" width={2} head={8} />
      <Arrow x1={O.x} y1={O.y} x2={nEnd.x} y2={nEnd.y} color="var(--plot-5)" width={2} head={8} />
      <Label x={sEnd.x - 2} y={sEnd.y + 22} anchor="end" italic weight={600} color="var(--plot-1)">s (along)</Label>
      <Label x={nEnd.x + 8} y={nEnd.y + 2} italic weight={600} color="var(--plot-5)">n (across)</Label>

      {/* the stream U */}
      <Arrow x1={u0.x} y1={u0.y} x2={u1.x} y2={u1.y} width={2.2} head={9} opacity={0.75} />
      <Arrow x1={u2.x} y1={u2.y} x2={u3.x} y2={u3.y} width={2.2} head={9} opacity={0.75} />
      <Label x={u1.x + 2} y={u1.y + 20} italic weight={600} color="var(--ink)">U</Label>

      {/* angle α */}
      <path d={arcPath(O.x, O.y, 40, 0, a)} fill="none" stroke="var(--ink-2)" strokeWidth={1.3} />
      <Label x={O.x + 50 * Math.cos(a / 2)} y={O.y - 50 * Math.sin(a / 2) + 4} anchor="middle" italic color="var(--ink)">α</Label>

      {/* point P and its projections */}
      <line x1={Pp.x} y1={Pp.y} x2={fs.x} y2={fs.y} stroke="var(--plot-1)" strokeWidth={1.2} strokeDasharray="4 3" />
      <line x1={Pp.x} y1={Pp.y} x2={fn.x} y2={fn.y} stroke="var(--plot-5)" strokeWidth={1.2} strokeDasharray="4 3" />
      <line x1={Pp.x} y1={Pp.y} x2={fx.x} y2={fx.y} stroke="var(--ink-3)" strokeWidth={0.9} strokeDasharray="2 3" />
      <line x1={Pp.x} y1={Pp.y} x2={fy.x} y2={fy.y} stroke="var(--ink-3)" strokeWidth={0.9} strokeDasharray="2 3" />
      <circle cx={Pp.x} cy={Pp.y} r={4} fill="var(--plot-4)" />
      <Label x={Pp.x + 7} y={Pp.y - 7} italic weight={600} color="var(--ink)">P(x, y)</Label>
      <circle cx={fs.x} cy={fs.y} r={2.5} fill="var(--plot-1)" />
      <circle cx={fn.x} cy={fn.y} r={2.5} fill="var(--plot-5)" />
      <Label x={fs.x + 6} y={fs.y + 14} italic color="var(--plot-1)">s</Label>
      <Label x={fn.x - 6} y={fn.y + 4} anchor="end" italic color="var(--plot-5)">n</Label>

      {/* the result */}
      <Label x={14} y={226} size={11.5} color="var(--ink-2)">s = x cos α + y sin α,  n = y cos α − x sin α</Label>
      <Label x={334} y={30} anchor="end" size={13} weight={600} color="var(--ink)">φ = U s</Label>
      <Label x={334} y={48} anchor="end" size={13} weight={600} color="var(--ink)">ψ = U n</Label>
    </svg>
  )
}
