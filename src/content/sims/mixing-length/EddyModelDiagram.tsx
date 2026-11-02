import { Arrow, SvgTex } from './svg'

const VB = 'v̄' // v with overbar

/** Profile of the time-averaged velocity: line length grows with y (dv̄x/dy > 0), concave like Fig. 9.5. */
const xp = (yy: number) => 300 + 110 * Math.pow(Math.max(0, (290 - yy) / 260), 0.6)

const yA = 70
const yX = 150
const yB = 230

/**
 * Recreation of Wilkes Fig. 9.5 — transport of x momentum across the plane X–X by eddies that travel a
 * distance λ from planes A–A (above) and B–B (below) and then mix with the surrounding fluid.
 */
export function EddyModelDiagram() {
  const curve: string[] = []
  for (let yy = 284; yy >= 26; yy -= 4) curve.push(`${xp(yy).toFixed(1)},${yy}`)
  const xA = xp(yA)
  const xX = xp(yX)
  const xB = xp(yB)
  const lower = 'var(--plot-2)'
  const upper = 'var(--plot-3)'
  const kick = 'var(--plot-4)'
  return (
    <svg viewBox="0 0 440 300" className="mx-auto block h-auto w-full max-w-[620px]" role="img" aria-label="Fig. 9.5: eddies from planes A–A and B–B carry x momentum across plane X–X">
      {/* axes */}
      <Arrow x1={36} y1={286} x2={36} y2={22} />
      <Arrow x1={36} y1={286} x2={150} y2={286} />
      <SvgTex x={26} y={28} s="y" size={13} className="fill-ink" />
      <SvgTex x={156} y={290} s="x" size={13} className="fill-ink" />

      {/* direction of mean flow */}
      <SvgTex x={196} y={17} s="Direction of mean flow" size={11} anchor="end" className="fill-ink-3" />
      <Arrow x1={202} y1={13} x2={292} y2={13} color="var(--ink-3)" width={1.3} />

      {/* velocity profile */}
      <polyline points={curve.join(' ')} fill="none" stroke="var(--plot-1)" strokeWidth={2.2} />
      <SvgTex x={322} y={293} s={`Profile of ${VB}_x`} size={11} className="fill-ink-2" />

      {/* planes A–A, X–X, B–B (line length = local mean velocity) */}
      <Arrow x1={36} y1={yA} x2={xA} y2={yA} />
      <Arrow x1={36} y1={yX} x2={xX} y2={yX} width={2} />
      <Arrow x1={36} y1={yB} x2={xB} y2={yB} />
      {[
        ['A', yA, xA],
        ['X', yX, xX],
        ['B', yB, xB],
      ].map(([l, yy, xr]) => (
        <g key={l as string}>
          <SvgTex x={16} y={(yy as number) + 4} s={l as string} size={13} weight={700} className="fill-ink" />
          <SvgTex x={(xr as number) + 7} y={(yy as number) + 4} s={l as string} size={13} weight={700} className="fill-ink" />
        </g>
      ))}
      <SvgTex x={252} y={62} s={`${VB}_x + (−λ) d${VB}_x/dy`} size={11} />
      <SvgTex x={300} y={144} s={`${VB}_x`} size={12} />
      <SvgTex x={190} y={250} s={`${VB}_x − λ d${VB}_x/dy`} size={11} />

      {/* lower eddy: from B–B upward */}
      <Arrow x1={66} y1={yX} x2={66} y2={yB} both head={6} width={1.3} />
      <SvgTex x={72} y={194} s="λ" size={13} className="fill-ink" />
      <Arrow x1={110} y1={yB - 13} x2={110} y2={yX + 13} color={lower} width={1.8} />
      <SvgTex x={117} y={198} s="v′_y" size={12} />
      <circle cx={110} cy={yX} r={11} fill="var(--surface-2)" stroke="var(--ink-3)" strokeWidth={1.2} />
      <circle cx={110} cy={yB} r={11} fill={lower} stroke="var(--ink-3)" strokeWidth={1.2} />
      <SvgTex x={110} y={260} s="Eddy" size={11} anchor="middle" />

      {/* net momentum flux */}
      <Arrow x1={160} y1={yB} x2={160} y2={yX + 2} color="var(--ink-2)" width={1.3} />
      <SvgTex x={166} y={186} s="Ṁ (momentum flux" size={11} />
      <SvgTex x={166} y={200} s="per unit area)" size={11} />

      {/* upper eddy: from A–A downward (λ and v′y both negative) */}
      <Arrow x1={200} y1={yA} x2={200} y2={yX} both head={6} width={1.3} />
      <SvgTex x={194} y={106} s="λ" size={13} anchor="end" className="fill-ink" />
      <SvgTex x={194} y={120} s="(negative)" size={10.5} anchor="end" className="fill-ink-3" />
      <Arrow x1={230} y1={yA + 13} x2={230} y2={yX - 13} color={upper} width={1.8} />
      <SvgTex x={238} y={112} s="v′_y (negative)" size={11} />
      <circle cx={230} cy={yX} r={11} fill="var(--surface-2)" stroke="var(--ink-3)" strokeWidth={1.2} />
      <circle cx={230} cy={yA} r={11} fill={upper} stroke="var(--ink-3)" strokeWidth={1.2} />
      <SvgTex x={230} y={50} s="Eddy" size={11} anchor="middle" />

      {/* negative kick v′x at X–X */}
      <Arrow x1={xX - 6} y1={yX - 9} x2={xX - 30} y2={yX - 9} color={kick} width={1.8} head={6} />
      <SvgTex x={xX - 28} y={yX - 15} s="v′_x" size={11} fill={kick} />

      {/* velocity deficiency */}
      <line x1={xB} y1={yB} x2={xB} y2={yX} stroke="var(--ink-3)" strokeDasharray="4 3" strokeWidth={1.2} />
      <Arrow x1={xB} y1={yX + 8} x2={xX} y2={yX + 8} both head={5} color={kick} width={1.4} />
      <path d={`M ${xX + 18} 176 Q ${xX + 6} 168 ${(xB + xX) / 2 + 4} ${yX + 11}`} fill="none" stroke="var(--ink-3)" strokeWidth={1} />
      <SvgTex x={405} y={186} s="Velocity" size={11} anchor="middle" />
      <SvgTex x={405} y={199} s="deficiency" size={11} anchor="middle" />
      <SvgTex x={405} y={215} s={`λ d${VB}_x/dy`} size={11} anchor="middle" fill={kick} />
    </svg>
  )
}
