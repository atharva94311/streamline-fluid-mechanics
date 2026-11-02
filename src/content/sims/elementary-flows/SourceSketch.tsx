import { Arrow, Label, arcPath, rad } from './svg'

/**
 * Recreation of the Lecture 12 slide 10 figure: a line source at the origin with radial arrows, the radial
 * velocity v_r, a dashed circle "φ = constant" (equipotential) and a dashed ray "ψ = constant" (streamline).
 * `sink` draws the same pattern with the flow reversed (m < 0) — that panel is a supplementary companion.
 */
export function SourceSketch({ sink = false }: { sink?: boolean }) {
  const O = { x: 160, y: 156 }
  const P = (r: number, deg: number) => ({ x: O.x + r * Math.cos(rad(deg)), y: O.y - r * Math.sin(rad(deg)) })
  const R = 116
  const vrDeg = 32
  const rDeg = 20
  const red = 'var(--plot-4)'
  const vrA = sink ? P(66, vrDeg) : P(12, vrDeg)
  const vrB = sink ? P(16, vrDeg) : P(66, vrDeg)
  const vrLab = P(76, vrDeg + 6)
  const phiPt = P(R, 52)
  const psiEnd = P(150, 138)
  const rEnd = P(R, rDeg)
  const rLab = P(106, rDeg + 5)
  const thLab = P(101, rDeg / 2)
  return (
    <svg viewBox="0 0 320 300" className="h-auto w-full" role="img" aria-label={sink ? 'Line sink: radial inflow' : 'Line source: radial outflow'}>
      {/* axes through the source */}
      <line x1={16} y1={O.y} x2={304} y2={O.y} stroke="var(--ink-3)" strokeWidth={1} />
      <line x1={O.x} y1={290} x2={O.x} y2={14} stroke="var(--ink-3)" strokeWidth={1} />
      <Label x={300} y={174} italic color="var(--ink-3)">x</Label>
      <Label x={167} y={22} italic color="var(--ink-3)">y</Label>

      {/* equipotential: circle r = const */}
      <circle cx={O.x} cy={O.y} r={R} fill="none" stroke="var(--equipotential)" strokeWidth={1.6} strokeDasharray="7 5" />
      <line x1={phiPt.x} y1={phiPt.y} x2={244} y2={38} stroke="var(--ink-3)" strokeWidth={0.9} />
      <Label x={232} y={32} italic size={13} color="var(--ink)">φ = constant</Label>

      {/* streamline: ray θ = const */}
      <line x1={O.x} y1={O.y} x2={psiEnd.x} y2={psiEnd.y} stroke="var(--streamline)" strokeWidth={1.6} strokeDasharray="7 5" />
      <Label x={8} y={46} italic size={13} color="var(--ink)">ψ = constant</Label>

      {/* radial flow arrows */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((d) => {
        const a = sink ? P(72, d) : P(9, d)
        const b = sink ? P(17, d) : P(72, d)
        return <Arrow key={d} x1={a.x} y1={a.y} x2={b.x} y2={b.y} color={red} width={2} head={8} />
      })}

      {/* r and θ */}
      <line x1={O.x} y1={O.y} x2={rEnd.x} y2={rEnd.y} stroke="var(--ink-2)" strokeWidth={1} />
      <Label x={rLab.x} y={rLab.y} italic color="var(--ink)">r</Label>
      <path d={arcPath(O.x, O.y, 94, 0, rad(rDeg))} fill="none" stroke="var(--ink-2)" strokeWidth={1.1} />
      <Label x={thLab.x + 3} y={thLab.y + 5} italic color="var(--ink)">θ</Label>

      {/* radial velocity */}
      <Arrow x1={vrA.x} y1={vrA.y} x2={vrB.x} y2={vrB.y} color="var(--ink)" width={3.4} head={11} />
      <text x={vrLab.x} y={vrLab.y} fontSize={13} fontStyle="italic" fill="var(--ink)" paintOrder="stroke" stroke="var(--surface)" strokeWidth={3}>
        v<tspan dy={3} fontSize={9.5}>r</tspan>
      </text>

      {/* the line source / sink itself (perpendicular to the page) */}
      <circle cx={O.x} cy={O.y} r={5} fill="var(--surface)" stroke={red} strokeWidth={2} />

      <Label x={10} y={290} size={12} weight={600} color={red}>
        {sink ? 'sink: m < 0, flow inward' : 'source: m > 0, flow outward'}
      </Label>
    </svg>
  )
}
