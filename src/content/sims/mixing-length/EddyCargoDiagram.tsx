import { Arrow, SvgTex } from './svg'

const VB = 'v̄'
const TB = 'T̄'
const CB = 'c̄'

/**
 * "Similar analyses" for heat and mass (Wilkes p. 490) pictured: the eddy that rises from B–B carries the
 * mean momentum, enthalpy and concentration of its origin plane, so all three use the same v′y and λ.
 */
export function EddyCargoDiagram() {
  const yA = 52
  const yX = 128
  const yB = 204
  return (
    <svg viewBox="0 0 420 250" className="mx-auto block h-auto w-full max-w-[620px]" role="img" aria-label="One eddy carries momentum, heat and species across plane X–X">
      {/* planes */}
      <line x1={26} x2={410} y1={yA} y2={yA} stroke="var(--axis)" strokeDasharray="6 4" />
      <line x1={26} x2={410} y1={yX} y2={yX} stroke="var(--ink-2)" strokeWidth={2} />
      <line x1={26} x2={410} y1={yB} y2={yB} stroke="var(--axis)" strokeDasharray="6 4" />
      <SvgTex x={10} y={yA + 4} s="A" size={13} weight={700} className="fill-ink" />
      <SvgTex x={10} y={yX + 4} s="X" size={13} weight={700} className="fill-ink" />
      <SvgTex x={10} y={yB + 4} s="B" size={13} weight={700} className="fill-ink" />

      {/* eddy from B–B */}
      <circle cx={78} cy={yB} r={13} fill="var(--plot-2)" stroke="var(--surface)" strokeWidth={2} />
      <Arrow x1={78} y1={yB - 15} x2={78} y2={yX + 4} color="var(--plot-2)" width={2.2} head={9} />
      <SvgTex x={88} y={170} s="v′_y > 0" size={11} />
      <SvgTex x={88} y={184} s="λ > 0" size={11} />

      {/* eddy from A–A */}
      <circle cx={150} cy={yA} r={13} fill="var(--plot-3)" stroke="var(--surface)" strokeWidth={2} />
      <Arrow x1={150} y1={yA + 15} x2={150} y2={yX - 4} color="var(--plot-3)" width={2.2} head={9} />
      <SvgTex x={160} y={86} s="v′_y < 0" size={11} />
      <SvgTex x={160} y={100} s="λ < 0" size={11} />

      {/* what the rising eddy carries */}
      <rect x={196} y={140} width={216} height={88} rx={10} fill="var(--surface-2)" stroke="var(--line)" />
      <SvgTex x={206} y={158} s="the eddy from B–B carries:" size={11} weight={600} className="fill-ink" />
      <SvgTex x={206} y={177} s={`momentum  ρ(${VB}_x − λ d${VB}_x/dy)`} size={11} fill="var(--plot-1)" />
      <SvgTex x={206} y={196} s={`enthalpy  ρc_p(${TB} − λ ∂${TB}/∂y)`} size={11} fill="var(--plot-4)" />
      <SvgTex x={206} y={215} s={`species   ${CB} − λ ∂${CB}/∂y`} size={11} fill="var(--plot-5)" />
      <path d="M 196 170 Q 140 165 92 190" fill="none" stroke="var(--ink-3)" strokeDasharray="3 3" />

      <SvgTex x={300} y={80} s="same v′_y, same λ for all three" size={11.5} anchor="middle" className="fill-ink" weight={600} />
      <SvgTex x={300} y={97} s="⇒ one eddy viscosity ν_T" size={11.5} anchor="middle" className="fill-ink-2" />
      <SvgTex x={300} y={244} s="(first approximation: α_T = 𝒟_T = ν_T)" size={10.5} anchor="middle" className="fill-ink-3" />
    </svg>
  )
}
