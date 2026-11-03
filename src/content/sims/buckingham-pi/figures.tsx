/** Static figures for the buckingham-pi topic. */
import { Arrow, DimArrow, TeXLabel } from './svg'

const LEDGER = [
  { label: 'Pipe Δpℓ (Lec 13)', k: 5, r: 3 },
  { label: 'Paint can (Lec 13)', k: 6, r: 2 },
  { label: 'Sphere drag (Fox 7.1)', k: 5, r: 3 },
  { label: 'Rough pipe (Fox 7.2)', k: 7, r: 3 },
  { label: 'Capillary (Fox 7.3)', k: 4, r: 2 },
]

/** k variables = r "used-up" slots + (k − r) Π terms, for the five worked examples of this topic. */
export function PiLedgerFigure() {
  const cell = 34
  const x0 = 170
  const rowH = 42
  const H = 40 + LEDGER.length * rowH + 30
  return (
    <svg viewBox={`0 0 520 ${H}`} className="h-auto w-full" role="img" aria-label="Bar chart: number of variables k split into r reference dimensions and k minus r pi terms for five examples">
      <text x={x0} y={20} className="fill-ink-2 text-[12px]">
        each square = one variable
      </text>
      {LEDGER.map((e, i) => {
        const y = 34 + i * rowH
        return (
          <g key={e.label}>
            <text x={x0 - 10} y={y + cell / 2 + 4} textAnchor="end" className="fill-ink text-[12px]">
              {e.label}
            </text>
            {Array.from({ length: e.k }, (_, j) => {
              const isRef = j < e.r
              return (
                <rect
                  key={j}
                  x={x0 + j * cell}
                  y={y}
                  width={cell - 4}
                  height={cell - 6}
                  rx={5}
                  fill={isRef ? 'var(--surface-2)' : 'var(--plot-3)'}
                  fillOpacity={isRef ? 1 : 0.45}
                  stroke={isRef ? 'var(--ink-3)' : 'var(--plot-3)'}
                  strokeDasharray={isRef ? '3 3' : undefined}
                />
              )
            })}
            <text x={x0 + e.k * cell + 6} y={y + cell / 2 + 2} className="fill-ink text-[12px] font-semibold">
              {`${e.k} − ${e.r} = ${e.k - e.r} Π`}
            </text>
          </g>
        )
      })}
      <g transform={`translate(${x0}, ${H - 18})`}>
        <rect width={14} height={12} rx={3} fill="var(--surface-2)" stroke="var(--ink-3)" strokeDasharray="3 3" />
        <text x={20} y={10} className="fill-ink-2 text-[11px]">
          absorbed by r reference dimensions
        </text>
        <rect x={210} width={14} height={12} rx={3} fill="var(--plot-3)" fillOpacity={0.45} stroke="var(--plot-3)" />
        <text x={230} y={10} className="fill-ink-2 text-[11px]">
          independent Π terms
        </text>
      </g>
    </svg>
  )
}

/** Long, smooth, horizontal circular pipe with the variables of the Lecture 13 pipe example. */
export function PipeFigure() {
  const top = 70
  const bot = 150
  const prof = (y: number) => {
    const eta = (y - (top + bot) / 2) / ((bot - top) / 2)
    return 46 * (1 - eta ** 8) // turbulent-looking flat profile (schematic)
  }
  const ys = Array.from({ length: 9 }, (_, i) => top + 6 + (i * (bot - top - 12)) / 8)
  return (
    <svg viewBox="0 0 560 230" className="h-auto w-full" role="img" aria-label="Pipe of diameter D carrying fluid of density rho and viscosity mu at mean velocity V; pressure taps a length ell apart">
      <rect x={30} y={top} width={500} height={bot - top} fill="var(--plot-6)" fillOpacity={0.12} />
      <line x1={30} x2={530} y1={top} y2={top} stroke="var(--ink-2)" strokeWidth={3} />
      <line x1={30} x2={530} y1={bot} y2={bot} stroke="var(--ink-2)" strokeWidth={3} />
      {ys.map((y) => (
        <Arrow key={y} x1={70} y1={y} x2={70 + prof(y)} y2={y} color="var(--plot-1)" width={1.4} head={5} />
      ))}
      <line x1={70} x2={70} y1={top} y2={bot} stroke="var(--plot-1)" strokeWidth={1} />
      <TeXLabel x={124} y={(top + bot) / 2} tex="V" w={20} />
      <TeXLabel x={250} y={(top + bot) / 2} tex="\rho,\ \mu" w={60} anchor="middle" />
      <DimArrow x1={500} y1={top + 2} x2={500} y2={bot - 2} color="var(--ink-2)" />
      <TeXLabel x={508} y={(top + bot) / 2} tex="D" w={20} />
      {/* pressure taps */}
      {[200, 400].map((x, i) => (
        <g key={x}>
          <line x1={x} x2={x} y1={top} y2={top - 30} stroke="var(--ink-2)" strokeWidth={2} />
          <circle cx={x} cy={top - 40} r={10} fill="var(--surface)" stroke="var(--ink-2)" strokeWidth={1.5} />
          <TeXLabel x={x} y={top - 40} tex={i === 0 ? 'p_1' : 'p_2'} w={30} anchor="middle" />
        </g>
      ))}
      <DimArrow x1={200} y1={bot + 22} x2={400} y2={bot + 22} color="var(--ink-2)" />
      <TeXLabel x={300} y={bot + 36} tex="\ell" w={20} anchor="middle" />
      <TeXLabel
        x={280}
        y={bot + 62}
        tex="\Delta p_\ell = \dfrac{p_1 - p_2}{\ell}\ \ (\text{pressure drop per unit length})"
        w={420}
        h={34}
        anchor="middle"
      />
    </svg>
  )
}

/** Fox Example 7.3 sketch: liquid rises Δh in a tube of diameter D (concave meniscus). */
export function CapillaryFigure() {
  const surf = 150
  const tubeL = 200
  const tubeR = 240
  const men = 70
  return (
    <svg viewBox="0 0 440 270" className="mx-auto h-auto w-full max-w-[460px]" role="img" aria-label="Capillary tube of diameter D dipped in liquid; liquid rises a height delta h to the bottom of a concave meniscus">
      <rect x={40} y={surf} width={360} height={80} fill="var(--plot-6)" fillOpacity={0.22} />
      <line x1={40} x2={400} y1={surf} y2={surf} stroke="var(--plot-6)" strokeWidth={1.5} />
      <polygon points={`345,${surf - 2} 355,${surf - 2} 350,${surf - 10}`} transform={`rotate(180 350 ${surf - 6})`} fill="var(--ink-2)" />
      {/* liquid column inside the tube */}
      <path d={`M ${tubeL} ${surf} L ${tubeL} ${men - 6} Q ${(tubeL + tubeR) / 2} ${men + 14} ${tubeR} ${men - 6} L ${tubeR} ${surf} Z`} fill="var(--plot-6)" fillOpacity={0.35} />
      <rect x={tubeL - 5} y={30} width={5} height={170} fill="var(--ink-3)" />
      <rect x={tubeR} y={30} width={5} height={170} fill="var(--ink-3)" />
      {/* reference line at bottom of meniscus */}
      <line x1={tubeR + 8} x2={330} y1={men + 4} y2={men + 4} stroke="var(--ink-3)" strokeDasharray="4 3" />
      <line x1={tubeR + 8} x2={330} y1={surf} y2={surf} stroke="var(--ink-3)" strokeDasharray="4 3" />
      <DimArrow x1={315} y1={men + 4} x2={315} y2={surf} color="var(--ink-2)" />
      <TeXLabel x={322} y={(men + surf) / 2} tex="\Delta h" w={40} />
      <DimArrow x1={tubeL} y1={188} x2={tubeR} y2={188} color="var(--ink-2)" />
      <TeXLabel x={(tubeL + tubeR) / 2} y={212} tex="D" w={20} anchor="middle" />
      <text x={120} y={44} className="fill-ink-2 text-[12px]">
        Tube
      </text>
      <Arrow x1={150} y1={48} x2={tubeL - 6} y2={70} color="var(--ink-3)" head={5} />
      <text x={220} y={258} textAnchor="middle" className="fill-ink-2 text-[11px]">
        Liquid (specific weight = γ, surface tension = σ)
      </text>
    </svg>
  )
}
