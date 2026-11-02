import { ArrowLine, DimLine, Label } from './svg'

/**
 * Schematic recreation of the Lec 12 slide 16 figure: a uniform stream U approaching a line source at the
 * origin, the stagnation point a distance b upstream, and a field point at (r, θ). Not to scale.
 */
export function SlideSixteenSketch() {
  const O = { x: 262, y: 135 }
  const S = { x: 200, y: 135 }
  const th = (24 * Math.PI) / 180
  const P = { x: O.x + 150 * Math.cos(th), y: O.y - 150 * Math.sin(th) }
  const arc = { x: O.x + 46 * Math.cos(th), y: O.y - 46 * Math.sin(th) }
  const rays = Array.from({ length: 8 }, (_, i) => (i * Math.PI) / 4)
  return (
    <svg viewBox="0 0 480 262" className="mx-auto block h-auto w-full max-w-[640px]" role="img" aria-label="Uniform flow approaching a line source; stagnation point a distance b upstream of the source">
      {/* uniform stream */}
      <Label x={22} y={24} italic size={16}>U</Label>
      {Array.from({ length: 7 }, (_, i) => (
        <ArrowLine key={i} x1={14} y1={40 + i * 31} x2={58} y2={40 + i * 31} color="var(--ink-2)" width={2} head={9} />
      ))}
      {/* axes */}
      <line x1={78} y1={O.y} x2={462} y2={O.y} stroke="var(--ink-2)" strokeWidth={1.4} />
      <line x1={O.x} y1={O.y} x2={O.x} y2={16} stroke="var(--ink-2)" strokeWidth={1.4} />
      <Label x={466} y={152} italic size={16}>x</Label>
      <Label x={244} y={26} italic size={16}>y</Label>
      {/* source: open circle with radiating arrows */}
      {rays.map((a, i) => (
        <ArrowLine
          key={i}
          x1={O.x + 8 * Math.cos(a)}
          y1={O.y - 8 * Math.sin(a)}
          x2={O.x + 30 * Math.cos(a)}
          y2={O.y - 30 * Math.sin(a)}
          color="var(--plot-4)"
          width={2.2}
          head={8}
        />
      ))}
      <circle cx={O.x} cy={O.y} r={6} fill="var(--surface)" stroke="var(--ink)" strokeWidth={1.8} />
      <Label x={280} y={172} size={14} weight={500} className="fill-ink-2">Source</Label>
      {/* stagnation point */}
      <line x1={172} y1={104} x2={197} y2={131} stroke="var(--ink-2)" strokeWidth={1.1} />
      <circle cx={S.x} cy={S.y} r={5} fill="var(--plot-3)" stroke="var(--ink)" strokeWidth={1.2} />
      <Label x={150} y={82} anchor="middle" size={14} weight={500} className="fill-ink-2">Stagnation</Label>
      <Label x={150} y={99} anchor="middle" size={14} weight={500} className="fill-ink-2">point</Label>
      {/* dimension b */}
      <line x1={S.x} y1={S.y + 8} x2={S.x} y2={196} stroke="var(--ink-3)" strokeWidth={1} />
      <line x1={O.x} y1={O.y + 9} x2={O.x} y2={196} stroke="var(--ink-3)" strokeWidth={1} />
      <DimLine x1={S.x + 1} y1={188} x2={O.x - 1} y2={188} />
      <Label x={(S.x + O.x) / 2} y={212} anchor="middle" italic size={16}>b</Label>
      {/* field point (r, θ) */}
      <ArrowLine x1={O.x} y1={O.y} x2={P.x - 4} y2={P.y + 2} color="var(--ink-2)" width={1.3} dash="5 4" head={8} />
      <circle cx={P.x} cy={P.y} r={4.5} fill="var(--ink)" />
      <Label x={P.x + 10} y={P.y - 6} size={14} weight={600}>P(r, θ)</Label>
      <Label x={O.x + 74} y={O.y - 48} italic size={16}>r</Label>
      <path d={`M${O.x + 46} ${O.y} A46 46 0 0 0 ${arc.x.toFixed(1)} ${arc.y.toFixed(1)}`} fill="none" stroke="var(--ink-2)" strokeWidth={1.3} />
      <Label x={O.x + 54} y={O.y - 6} italic size={15}>θ</Label>
    </svg>
  )
}
