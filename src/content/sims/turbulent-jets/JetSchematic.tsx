import { mlProfile, ZETA_EDGE } from './jetSolutions'
import { Arrow, BoxLabel, Lbl } from './svg'

/**
 * Re-drawing of Wilkes Fig. 9.15 (plane jet) and Fig. 9.17 (axisymmetric jet): slot/orifice, diverging turbulent zone
 * (broadening exaggerated), bell-shaped mean-velocity profile on a downstream station, half-width b and entrained fluid.
 */
export function JetSchematic({ kind = 'plane' }: { kind?: 'plane' | 'round' }) {
  const round = kind === 'round'
  const W = 680
  const H = 320
  const cy = 160
  const x0 = 100 // slot exit = origin
  const slope = 0.2 // exaggerated spreading, as in the book's sketch
  const edge = (x: number) => (x - x0) * slope
  const X = 470 // station of the drawn profile
  const e = edge(X)
  const A = 120 // arrow length on the centre-line, px
  const arrowsY = Array.from({ length: 11 }, (_, k) => (k - 5) * (e / 5.6))
  const prof = (dy: number) => A * mlProfile((ZETA_EDGE * Math.abs(dy)) / e).fp
  const curve: string[] = []
  for (let i = 0; i <= 80; i++) {
    const dy = -e + (2 * e * i) / 80
    curve.push(`${i ? 'L' : 'M'}${(X + prof(dy)).toFixed(1)},${(cy + dy).toFixed(1)}`)
  }
  const entrX = [150, 225, 300, 375, 600]
  const xs = round ? 'z' : 'x'
  const ys = round ? 'r' : 'y'
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full select-none" role="img" aria-label={round ? 'Axisymmetric turbulent jet sketch' : 'Plane turbulent jet sketch'}>
      {/* surrounding fluid */}
      <rect x={60} y={8} width={W - 68} height={H - 16} rx={6} fill="var(--surface-2)" stroke="var(--line)" />
      {/* turbulent zone */}
      <polygon points={`${x0},${cy} ${W - 8},${cy - edge(W - 8)} ${W - 8},${cy + edge(W - 8)}`} fill="var(--plot-1)" fillOpacity={0.12} />
      <line x1={x0} y1={cy} x2={W - 8} y2={cy - edge(W - 8)} stroke="var(--ink-2)" strokeWidth={1.4} strokeDasharray="7 5" />
      <line x1={x0} y1={cy} x2={W - 8} y2={cy + edge(W - 8)} stroke="var(--ink-2)" strokeWidth={1.4} strokeDasharray="7 5" />
      {/* slot / orifice walls */}
      <line x1={12} y1={cy - 13} x2={x0} y2={cy - 13} stroke="var(--ink)" strokeWidth={5} strokeLinecap="round" />
      <line x1={12} y1={cy + 13} x2={x0} y2={cy + 13} stroke="var(--ink)" strokeWidth={5} strokeLinecap="round" />
      <Arrow x1={22} y1={cy} x2={84} y2={cy} color="var(--plot-1)" width={2.4} head={9} />
      <Lbl x={30} y={cy - 26} t="Jet" size={14} weight={600} fill="var(--ink)" />
      <text x={30} y={cy + 38} fontSize={10.5} fill="var(--ink-3)">
        {round ? 'orifice' : 'slot'}
      </text>
      {/* axes */}
      <Arrow x1={x0 + 26} y1={cy} x2={W - 18} y2={cy} color="var(--ink-2)" width={1.3} />
      <Lbl x={W - 22} y={cy + 20} t={xs} size={15} italic fill="var(--ink)" />
      <Arrow x1={x0} y1={cy - 13} x2={x0} y2={60} color="var(--ink-2)" width={1.3} />
      <BoxLabel x={x0} y={52} text={ys} size={13} />
      {/* station line: solid outside, dashed inside the turbulent zone */}
      <line x1={X} y1={14} x2={X} y2={cy - e} stroke="var(--ink-2)" strokeWidth={1.2} />
      <line x1={X} y1={cy + e} x2={X} y2={H - 14} stroke="var(--ink-2)" strokeWidth={1.2} />
      <line x1={X} y1={cy - e} x2={X} y2={cy + e} stroke="var(--ink-2)" strokeWidth={1.2} strokeDasharray="4 4" />
      {round ? <ellipse cx={X} cy={cy} rx={14} ry={e} fill="none" stroke="var(--ink-3)" strokeWidth={1} strokeDasharray="3 4" /> : null}
      {/* bell-shaped mean-velocity profile */}
      <path d={curve.join(' ')} fill="none" stroke="var(--plot-1)" strokeWidth={2} />
      {arrowsY.map((dy, i) => (
        <Arrow key={i} x1={X} y1={cy + dy} x2={X + Math.max(prof(dy), 1)} y2={cy + dy} color="var(--plot-1)" width={1.4} head={6} />
      ))}
      <BoxLabel x={X + A + 34} y={cy - 40} text={round ? 'v̄z' : 'v̄x'} size={13} />
      {/* half-width b */}
      <Arrow x1={X - 20} y1={cy} x2={X - 20} y2={cy - e} both color="var(--plot-3)" width={1.5} head={6} />
      <BoxLabel x={X - 40} y={cy - e / 2 + 5} text="b" size={13} />
      {/* entrained fluid */}
      {entrX.map((ex, i) => {
        const ee = edge(ex)
        return (
          <g key={i}>
            <Arrow x1={ex} y1={cy - ee - 40} x2={ex} y2={cy - ee - 8} color="var(--plot-4)" width={1.6} />
            <Arrow x1={ex} y1={cy + ee + 40} x2={ex} y2={cy + ee + 8} color="var(--plot-4)" width={1.6} />
          </g>
        )
      })}
      <BoxLabel x={250} y={34} text="Fluid entrained by the jet" size={12} />
      <BoxLabel x={360} y={cy + 30} text="Turbulent zone" size={12} />
      <text x={W - 14} y={H - 16} fontSize={10.5} textAnchor="end" fill="var(--ink-3)">
        broadening exaggerated
      </text>
    </svg>
  )
}
