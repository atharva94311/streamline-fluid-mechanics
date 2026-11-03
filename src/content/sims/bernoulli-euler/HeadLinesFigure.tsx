/**
 * Static figure: energy grade line (EGL) and hydraulic grade line (HGL) along a horizontal venturi
 * with piezometers (rise to the HGL) and Pitot tubes (rise to the EGL). Schematic heights.
 * Fox p. 221: the HGL is always lower than the EGL by V²/2g; V changes only where the diameter changes.
 */
import { useElementSize } from '@/kit'
import { Arrow, Label } from './shared'

const R1 = 26
const R2 = 12
const YC = 236
const YEGL = 52
const YDATUM = 312
const sm = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t))
const R = (x: number) =>
  x < 200 ? R1 : x < 270 ? R1 + (R2 - R1) * sm((x - 200) / 70) : x < 370 ? R2 : x < 470 ? R2 + (R1 - R2) * sm((x - 370) / 100) : R1
/** velocity head in px (schematic ∝ 1/R²) */
const HV = (x: number) => 26 * (R1 / R(x)) ** 2
const yHGL = (x: number) => YEGL + HV(x)

const xs = Array.from({ length: 117 }, (_, i) => 30 + i * 5)

function Piezometer({ x, color = 'var(--streamline)', topY = 34 }: { x: number; color?: string; topY?: number }) {
  const top = YC - R(x)
  const lvl = yHGL(x)
  return (
    <g>
      <rect x={x - 4} y={lvl} width={8} height={top - lvl} fill={color} opacity={0.35} />
      <line x1={x - 5} x2={x - 5} y1={top} y2={topY} stroke="var(--ink-2)" strokeWidth={1.4} />
      <line x1={x + 5} x2={x + 5} y1={top} y2={topY} stroke="var(--ink-2)" strokeWidth={1.4} />
      <line x1={x - 7} x2={x + 7} y1={lvl} y2={lvl} stroke={color} strokeWidth={2} />
    </g>
  )
}

function Pitot({ x }: { x: number }) {
  // L-shaped tube: opening faces upstream on the centreline at (x − 22, YC)
  const top = YC - R(x)
  return (
    <g>
      <rect x={x - 4} y={YEGL} width={8} height={YC - YEGL} fill="var(--plot-4)" opacity={0.28} />
      <path d={`M${x - 24},${YC - 4} L${x - 5},${YC - 4} L${x - 5},34`} fill="none" stroke="var(--ink-2)" strokeWidth={1.4} />
      <path d={`M${x - 24},${YC + 4} L${x + 5},${YC + 4} L${x + 5},34`} fill="none" stroke="var(--ink-2)" strokeWidth={1.4} />
      <line x1={x - 7} x2={x + 7} y1={YEGL} y2={YEGL} stroke="var(--plot-4)" strokeWidth={2} />
      <line x1={x - 5} x2={x + 5} y1={top} y2={top} stroke="var(--ink-3)" strokeWidth={0.8} strokeDasharray="2 2" />
    </g>
  )
}

/** Vertical dimension line with arrowheads and a label to one side. */
function Dim({ x, y1, y2, label, side = 'left', color = 'var(--ink-2)', fs = 1 }: { x: number; y1: number; y2: number; label: string; side?: 'left' | 'right'; color?: string; fs?: number }) {
  const mid = (y1 + y2) / 2
  return (
    <g>
      <Arrow x1={x} y1={mid} x2={x} y2={y1} color={color} width={1.2} head={6} />
      <Arrow x1={x} y1={mid} x2={x} y2={y2} color={color} width={1.2} head={6} />
      <Label x={side === 'left' ? x - 6 : x + 6} y={mid + 4} anchor={side === 'left' ? 'end' : 'start'} size={12 * fs} weight={600} color={color} italic>
        {label}
      </Label>
    </g>
  )
}

export function HeadLinesFigure() {
  // enlarge the lettering when the figure is drawn narrow (phones), so labels stay legible
  const [ref, size] = useElementSize<HTMLDivElement>()
  const fs = size.width > 0 && size.width < 520 ? 1.4 : 1
  const top = xs.map((x) => `${x},${(YC - R(x)).toFixed(1)}`).join(' ')
  const bot = xs.map((x) => `${x},${(YC + R(x)).toFixed(1)}`).join(' ')
  const fill = [...xs.map((x) => `${x},${(YC - R(x)).toFixed(1)}`), ...xs.slice().reverse().map((x) => `${x},${(YC + R(x)).toFixed(1)}`)].join(' ')
  const hgl = xs.map((x) => `${x},${yHGL(x).toFixed(1)}`).join(' ')
  return (
    <div ref={ref} className="w-full">
    <svg viewBox="0 0 640 330" className="block h-auto w-full" role="img" aria-label="energy and hydraulic grade lines along a venturi">
      {/* datum */}
      <line x1={20} x2={620} y1={YDATUM} y2={YDATUM} stroke="var(--ink-3)" strokeDasharray="8 5" />
      <Label x={80} y={YDATUM - 5} size={11 * fs} color="var(--ink-3)">datum (z = 0)</Label>
      {/* EGL & HGL */}
      <line x1={30} x2={612} y1={YEGL} y2={YEGL} stroke="var(--plot-4)" strokeWidth={2.2} strokeDasharray="10 5" />
      <Label x={612} y={YEGL - 8} anchor="end" size={12 * fs} weight={700} color="var(--plot-4)">EGL: p/γ + V²/2g + z = H</Label>
      <polyline points={hgl} fill="none" stroke="var(--plot-1)" strokeWidth={2.2} />
      <Label x={532} y={yHGL(520) - 8} anchor="end" size={12 * fs} weight={700} color="var(--plot-1)">HGL: p/γ + z</Label>
      {/* pipe */}
      <polygon points={fill} fill="var(--streamline)" opacity={0.12} />
      <polyline points={top} fill="none" stroke="var(--ink-2)" strokeWidth={2.4} />
      <polyline points={bot} fill="none" stroke="var(--ink-2)" strokeWidth={2.4} />
      <line x1={30} x2={612} y1={YC} y2={YC} stroke="var(--ink-3)" strokeDasharray="10 3 2 3" strokeWidth={0.9} />
      <Arrow x1={36} y1={YC + 12} x2={78} y2={YC + 12} color="var(--streamline)" width={2} head={8} />
      <Label x={84} y={YC + 16} size={10 * fs} color="var(--ink-3)">flow</Label>
      {/* instruments */}
      <Piezometer x={112} />
      <Pitot x={160} />
      <Piezometer x={306} />
      <Pitot x={350} />
      <Piezometer x={548} topY={64} />
      {/* section labels */}
      {[
        [136, '1'],
        [328, '2'],
        [548, '3'],
      ].map(([x, t]) => (
        <g key={t}>
          <circle cx={+x} cy={282} r={10} fill="var(--surface)" stroke="var(--ink-2)" strokeWidth={1.2} />
          <Label x={+x} y={286} anchor="middle" size={12} weight={700} halo={false}>{t}</Label>
        </g>
      ))}
      {/* dimensions at section 1 */}
      <Dim x={70} y1={YDATUM} y2={YC} label="z₁" fs={fs} />
      <Dim x={70} y1={YC} y2={yHGL(112)} label="p₁/γ" fs={fs} />
      <Dim x={70} y1={yHGL(112)} y2={YEGL} label="V₁²/2g" color="var(--plot-3)" fs={fs} />
      {/* dimensions at the throat */}
      <Dim x={392} y1={YC} y2={yHGL(330)} label="p₂/γ" side="right" fs={fs} />
      <Dim x={392} y1={yHGL(330)} y2={YEGL} label="V₂²/2g" side="right" color="var(--plot-3)" fs={fs} />
      <Label x={250} y={20} anchor="middle" size={11 * fs} color="var(--ink-3)">piezometers rise to the HGL · Pitot tubes rise to the EGL</Label>
      <Label x={470} y={326} anchor="middle" size={10 * fs} color="var(--ink-3)">schematic — heights not to scale</Label>
    </svg>
    </div>
  )
}
