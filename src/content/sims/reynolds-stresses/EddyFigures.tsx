import { Arrow, SvgTeX } from './shared'

/** Recreation of Wilkes Fig. 9.4 "Motion of an eddy upward across the plane X–X" (p. 487). */
export function EddyPlaneFigure() {
  return (
    <svg viewBox="0 0 460 300" className="mx-auto h-auto w-full max-w-[560px]" role="img" aria-label="An eddy below plane X–X with x-velocity v̄x + v′x jumps upward with velocity v′y into the region of greater y">
      {/* axes */}
      <Arrow x1={40} y1={240} x2={40} y2={122} color="var(--ink-2)" width={1.8} />
      <Arrow x1={40} y1={240} x2={134} y2={240} color="var(--ink-2)" width={1.8} />
      <text x={28} y={132} className="fill-ink text-[13px] italic">y</text>
      <text x={124} y={258} className="fill-ink text-[13px] italic">x</text>

      {/* plane X–X seen in perspective */}
      <polygon points="150,150 420,150 370,200 100,200" fill="var(--body-fill)" opacity={0.45} stroke="var(--ink-3)" strokeWidth={1.2} />
      <line x1={78} x2={444} y1={175} y2={175} stroke="var(--ink-2)" strokeDasharray="6 5" strokeWidth={1.3} />
      <text x={66} y={179} className="fill-ink text-[13px] italic">X</text>
      <text x={447} y={179} className="fill-ink text-[13px] italic">X</text>
      <ellipse cx={260} cy={175} rx={40} ry={9} fill="var(--surface)" stroke="var(--ink-2)" strokeWidth={1.3} />
      <text x={305} y={196} className="fill-ink-3 text-[10px] italic">unit area</text>

      {/* eddy below the plane */}
      <line x1={260} y1={241} x2={260} y2={184} stroke="var(--ink-2)" strokeWidth={1.6} />
      <circle cx={260} cy={258} r={17} fill="var(--ink-3)" opacity={0.85} stroke="var(--ink-2)" />
      <text x={236} y={276} textAnchor="end" className="fill-ink text-[12px]">Eddy</text>
      <Arrow x1={279} y1={258} x2={392} y2={258} color="var(--ink)" width={1.6} />
      <SvgTeX x={336} y={243} tex={String.raw`\overline{v}_x+v_x'`} w={110} h={22} size={13} />
      <text x={338} y={293} textAnchor="middle" className="fill-ink-3 text-[10px] italic">x-momentum ρ(v̄ₓ + v′ₓ) per unit volume</text>

      {/* path upward across X–X */}
      <Arrow x1={260} y1={166} x2={260} y2={78} color="var(--ink)" width={1.6} />
      <SvgTeX x={270} y={118} tex="v_y'" w={40} h={22} align="left" size={13} />
      <text x={270} y={137} className="fill-ink-3 text-[10px] italic">volume flux per unit area</text>
      <circle cx={260} cy={58} r={17} fill="var(--surface-2)" stroke="var(--ink-3)" strokeWidth={1.3} />
      <text x={284} y={46} className="fill-ink text-[12px]">Region of greater y</text>

      {/* sign-convention box */}
      <rect x={322} y={70} width={110} height={56} rx={3} fill="var(--surface)" stroke="var(--ink-2)" strokeWidth={1.2} />
      <text x={377} y={87} textAnchor="middle" className="fill-ink text-[12px]">Shear stress</text>
      <SvgTeX x={377} y={102} tex={String.raw`\tau^{\,t}_{yx}`} w={60} h={20} size={13} />
      <Arrow x1={340} y1={117} x2={414} y2={117} color="var(--ink)" width={1.6} />
    </svg>
  )
}

/** Sign convention for τ_yx (supplementary sketch): positive τ_yx on the upper face ⇔ x-momentum flowing toward −y. */
export function SignConventionFigure() {
  const levels = [0, 1, 2, 3, 4]
  return (
    <svg viewBox="0 0 470 240" className="mx-auto h-auto w-full max-w-[600px]" role="img" aria-label="Sign convention: positive shear stress on the upper face of an element corresponds to downward transfer of x-momentum">
      {/* mean profile */}
      <line x1={16} x2={16} y1={30} y2={200} stroke="var(--ink-2)" strokeWidth={1.4} />
      {levels.map((k) => {
        const y = 190 - k * 38
        const len = 30 + k * 16
        return <Arrow key={k} x1={16} y1={y} x2={16 + len} y2={y} color="var(--plot-1)" width={1.8} />
      })}
      <SvgTeX x={14} y={16} tex={String.raw`\overline{v}_x(y)`} w={80} h={20} align="left" size={12} />
      <SvgTeX x={14} y={222} tex={String.raw`d\overline{v}_x/dy>0`} w={110} h={20} align="left" size={11} />

      {/* fluid element */}
      <rect x={160} y={78} width={100} height={84} fill="var(--surface-2)" stroke="var(--ink-2)" strokeWidth={1.4} />
      <text x={210} y={124} textAnchor="middle" className="fill-ink-3 text-[11px]">fluid element</text>
      <Arrow x1={170} y1={68} x2={252} y2={68} color="var(--plot-4)" width={2.4} head={9} />
      <SvgTeX x={211} y={50} tex={String.raw`+\tau_{yx}\ \text{on the upper face}`} w={190} h={20} size={11.5} />
      <Arrow x1={252} y1={172} x2={170} y2={172} color="var(--plot-4)" width={2.4} head={9} />
      <SvgTeX x={211} y={190} tex={String.raw`-\tau_{yx}\ \text{on the lower face}`} w={190} h={20} size={11.5} />

      {/* momentum flux */}
      <Arrow x1={330} y1={64} x2={330} y2={176} color="var(--plot-6)" width={3} head={11} />
      <text x={344} y={96} className="fill-ink text-[11.5px] font-semibold">x-momentum</text>
      <text x={344} y={111} className="fill-ink text-[11.5px] font-semibold">flows toward −y</text>
      <text x={344} y={132} className="fill-ink-2 text-[10.5px]">(fast fluid above drags</text>
      <text x={344} y={146} className="fill-ink-2 text-[10.5px]">slow fluid below forward)</text>
      <SvgTeX x={344} y={170} tex={String.raw`\Rightarrow\ \tau_{yx}>0`} w={110} h={20} align="left" size={12} />
    </svg>
  )
}
