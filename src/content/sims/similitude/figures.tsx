/** Static diagrams for the similitude topic (all theme-aware SVG, responsive via viewBox). */
import { Md, md } from '@/kit'
import { Arrow, Sub, Tx } from './svg'
import { FIG75, FIG75_DESIGN_X, bezierPath } from './data'

/* ------------------------------------------------------------------------------------------------ helpers */

/** Teardrop body outline in unit coordinates (x 0..1, y −0.3..0.3). */
const BODY = 'M0,0 C0,-0.26 0.35,-0.3 0.6,-0.2 C0.8,-0.12 1,-0.03 1,0 C1,0.03 0.8,0.12 0.6,0.2 C0.35,0.3 0,0.26 0,0 Z'

function Body({ x, y, s, fill = 'var(--body-fill)' }: { x: number; y: number; s: number; fill?: string }) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <path d={BODY} fill={fill} stroke="var(--ink-2)" strokeWidth={1.4} vectorEffect="non-scaling-stroke" />
    </g>
  )
}

/** Schematic streamline around the unit body: offset d (unit lengths, signed). */
function streamPts(d: number, x0: number, y0: number, s: number): string {
  const pts: string[] = []
  for (let i = 0; i <= 40; i++) {
    const u = -0.45 + (1.9 * i) / 40
    const bump = 0.27 * Math.exp(-(((u - 0.42) / 0.42) ** 2)) * (0.3 / (Math.abs(d) + 0.12))
    const yy = d + Math.sign(d) * bump * 0.55
    pts.push(`${(x0 + u * s).toFixed(1)},${(y0 + yy * s).toFixed(1)}`)
  }
  return pts.join(' ')
}

/* ------------------------------------------------------------------------------------------------ similarity ladder */

function LadderCard({ title, tone, children, text }: { title: string; tone: string; children: React.ReactNode; text: string }) {
  return (
    <div className={`rounded-xl border p-3 ${tone}`}>
      <div className="mb-1 font-display text-sm font-bold text-ink">{title}</div>
      <svg viewBox="0 0 240 150" className="h-auto w-full" role="img" aria-label={title}>
        {children}
      </svg>
      <Md className="md-tight mt-1 text-xs text-ink-2">{text}</Md>
    </div>
  )
}

/** Three levels of similarity, each drawn for a prototype (large) and a model (scale ≈ 0.45). */
export function SimilarityLadder() {
  const P = { x: 18, y: 78, s: 120 }
  const Mo = { x: 160, y: 78, s: 54 }
  const lam = Mo.s / P.s
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <LadderCard
          title="1 · Geometric"
          tone="border-indigo-300 bg-indigo-50/60 dark:border-indigo-500/40 dark:bg-indigo-500/10"
          text={md`Same shape; **every** length scales by one factor $L_m/L_p$ (including surface roughness).`}
        >
          <Body {...P} />
          <Body {...Mo} />
          {/* dimension lines */}
          <line x1={P.x} y1={122} x2={P.x + P.s} y2={122} stroke="var(--plot-1)" strokeWidth={1.4} />
          <line x1={P.x} y1={117} x2={P.x} y2={127} stroke="var(--plot-1)" />
          <line x1={P.x + P.s} y1={117} x2={P.x + P.s} y2={127} stroke="var(--plot-1)" />
          <Tx x={P.x + P.s / 2} y={140} anchor="middle" math size={15}>
            L<Sub>p</Sub>
          </Tx>
          <line x1={Mo.x} y1={122} x2={Mo.x + Mo.s} y2={122} stroke="var(--plot-1)" strokeWidth={1.4} />
          <line x1={Mo.x} y1={117} x2={Mo.x} y2={127} stroke="var(--plot-1)" />
          <line x1={Mo.x + Mo.s} y1={117} x2={Mo.x + Mo.s} y2={127} stroke="var(--plot-1)" />
          <Tx x={Mo.x + Mo.s / 2} y={140} anchor="middle" math size={15}>
            L<Sub>m</Sub>
          </Tx>
          <Tx x={8} y={18} size={12} cls="fill-ink-3">
            prototype
          </Tx>
          <Tx x={160} y={18} size={12} cls="fill-ink-3">
            model
          </Tx>
        </LadderCard>
        <LadderCard
          title="2 · Kinematic"
          tone="border-cyan-300 bg-cyan-50/60 dark:border-cyan-500/40 dark:bg-cyan-500/10"
          text={md`Velocities at corresponding points are **parallel** with one constant ratio, so the streamline patterns are scaled copies. Needs the same flow regime.`}
        >
          {[-0.62, -0.38, 0.38, 0.62].map((d) => (
            <g key={d}>
              <polyline points={streamPts(d, P.x, P.y, P.s)} fill="none" stroke="var(--streamline)" strokeWidth={1.2} opacity={0.75} />
              <polyline points={streamPts(d, Mo.x, Mo.y, Mo.s)} fill="none" stroke="var(--streamline)" strokeWidth={1} opacity={0.75} />
            </g>
          ))}
          <Body {...P} />
          <Body {...Mo} />
          {/* corresponding-point velocity vectors (same direction, ratio V_m/V_p) */}
          <Arrow x1={P.x + 0.42 * P.s} y1={P.y - 0.53 * P.s} x2={P.x + 0.42 * P.s + 34} y2={P.y - 0.53 * P.s} color="var(--plot-4)" width={2} />
          <Arrow x1={Mo.x + 0.42 * Mo.s} y1={Mo.y - 0.53 * Mo.s} x2={Mo.x + 0.42 * Mo.s + 34 * 1.35 * lam} y2={Mo.y - 0.53 * Mo.s} color="var(--plot-4)" width={2} />
          <Tx x={P.x + 0.42 * P.s + 18} y={P.y - 0.53 * P.s - 6} anchor="middle" math size={13} cls="fill-ink" halo>
            V<Sub>p</Sub>
          </Tx>
          <Tx x={Mo.x + 0.42 * Mo.s + 12} y={Mo.y - 0.53 * Mo.s - 6} anchor="middle" math size={13} cls="fill-ink" halo>
            V<Sub>m</Sub>
          </Tx>
        </LadderCard>
        <LadderCard
          title="3 · Dynamic"
          tone="border-amber-300 bg-amber-50/60 dark:border-amber-500/40 dark:bg-amber-500/10"
          text={md`Each **type** of force (pressure, viscous, gravity, …) is parallel and in the **same ratio** at all corresponding points ⇔ all independent $\Pi$ groups equal.`}
        >
          <Body {...P} />
          <Body {...Mo} />
          {/* pressure at nose, shear on top, weight */}
          {[
            { b: P, k: 1 },
            { b: Mo, k: 0.55 },
          ].map(({ b, k }, i) => (
            <g key={i}>
              <Arrow x1={b.x - 30 * k} y1={b.y} x2={b.x - 2} y2={b.y} color="var(--plot-3)" width={2} head={7} />
              <Arrow x1={b.x + 0.55 * b.s} y1={b.y - 0.215 * b.s} x2={b.x + 0.55 * b.s + 26 * k} y2={b.y - 0.19 * b.s} color="var(--plot-5)" width={2} head={7} />
              <Arrow x1={b.x + 0.45 * b.s} y1={b.y + 0.05 * b.s} x2={b.x + 0.45 * b.s} y2={b.y + 0.05 * b.s + 28 * k} color="var(--plot-6)" width={2} head={7} />
            </g>
          ))}
          <Tx x={6} y={134} size={11} cls="fill-ink-3">
            <tspan className="fill-amber-600 dark:fill-amber-400">pressure</tspan> · <tspan className="fill-emerald-600 dark:fill-emerald-400">viscous</tspan> ·{' '}
            <tspan className="fill-violet-600 dark:fill-violet-400">gravity</tspan>: all ×{(0.55).toFixed(2)}
          </Tx>
        </LadderCard>
      </div>
      <svg viewBox="0 0 520 90" className="mx-auto h-auto w-full max-w-xl" role="img" aria-label="Nested sets: dynamic within kinematic within geometric">
        <rect x={4} y={4} width={512} height={82} rx={14} fill="var(--plot-1)" fillOpacity={0.08} stroke="var(--plot-1)" />
        <rect x={150} y={14} width={356} height={62} rx={12} fill="var(--plot-2)" fillOpacity={0.1} stroke="var(--plot-2)" />
        <rect x={300} y={24} width={196} height={42} rx={10} fill="var(--plot-3)" fillOpacity={0.14} stroke="var(--plot-3)" />
        <Tx x={16} y={42} size={14} weight={700}>
          Geometric
        </Tx>
        <Tx x={16} y={60} size={11} cls="fill-ink-3">
          same shape
        </Tx>
        <Tx x={162} y={42} size={14} weight={700}>
          Kinematic
        </Tx>
        <Tx x={162} y={60} size={11} cls="fill-ink-3">
          same streamlines
        </Tx>
        <Tx x={398} y={44} size={14} weight={700} anchor="middle">
          Dynamic
        </Tx>
        <Tx x={398} y={60} size={11} cls="fill-ink-3" anchor="middle">
          same force ratios
        </Tx>
      </svg>
    </div>
  )
}

/* ------------------------------------------------------------------------------------------------ Example 7.4 sketch */

export function SonarSketch() {
  return (
    <svg viewBox="0 0 520 200" className="h-auto w-full" role="img" aria-label="Example 7.4: prototype sphere in seawater and model sphere in air">
      <rect x={4} y={4} width={250} height={192} rx={12} fill="var(--plot-2)" fillOpacity={0.07} stroke="var(--line)" />
      <rect x={266} y={4} width={250} height={192} rx={12} fill="var(--plot-7)" fillOpacity={0.06} stroke="var(--line)" />
      <Tx x={16} y={26} size={14} weight={700}>
        Prototype — water at 4.5 °C
      </Tx>
      <Tx x={278} y={26} size={14} weight={700}>
        Model — air (STP)
      </Tx>
      {/* prototype sphere */}
      <circle cx={140} cy={112} r={52} fill="var(--body-fill)" stroke="var(--ink-2)" strokeWidth={1.5} />
      <line x1={88} y1={176} x2={192} y2={176} stroke="var(--ink-3)" />
      <Tx x={140} y={192} anchor="middle" size={13} math>
        D<Sub>p</Sub> = 0.3 m
      </Tx>
      <Arrow x1={20} y1={112} x2={80} y2={112} color="var(--streamline)" width={2.5} />
      <Tx x={20} y={102} size={13} math>
        V<Sub>p</Sub> = 2.57 m/s
      </Tx>
      <Arrow x1={140} y1={112} x2={236} y2={112} color="var(--plot-4)" width={2.5} />
      <Tx x={214} y={102} size={14} math weight={700} halo>
        F<Sub>p</Sub>
      </Tx>
      {/* model sphere: 152/300 of prototype */}
      <circle cx={400} cy={112} r={52 * (152 / 300)} fill="var(--body-fill)" stroke="var(--ink-2)" strokeWidth={1.5} />
      <line x1={400 - 26.3} y1={176} x2={400 + 26.3} y2={176} stroke="var(--ink-3)" />
      <Tx x={400} y={192} anchor="middle" size={13} math>
        D<Sub>m</Sub> = 152 mm
      </Tx>
      <Arrow x1={290} y1={112} x2={366} y2={112} color="var(--streamline)" width={2.5} />
      <Tx x={292} y={102} size={13} math>
        V<Sub>m</Sub> = ?
      </Tx>
      <Arrow x1={400} y1={112} x2={500} y2={112} color="var(--plot-4)" width={2.5} />
      <Tx x={444} y={102} size={13} math halo>
        F<Sub>m</Sub> = 2.7 N
      </Tx>
    </svg>
  )
}

/* ------------------------------------------------------------------------------------------------ distorted river model */

export function DistortedRiverFigure() {
  // three cross-sections: prototype (exaggerated), undistorted 1:1000, distorted 1:1000 H / 1:100 V
  const row = (y: number, depthPx: number, label: string, sub: string, rough = false, warn = false) => {
    const w = 300
    const x0 = 160
    const d = `M${x0},${y} Q${x0 + w * 0.12},${y + depthPx} ${x0 + w * 0.5},${y + depthPx} Q${x0 + w * 0.88},${y + depthPx} ${x0 + w},${y}`
    return (
      <g>
        <path d={`${d} Z`} fill="var(--streamline)" fillOpacity={0.18} />
        <path d={d} fill="none" stroke="var(--ink-2)" strokeWidth={1.6} />
        <line x1={x0} y1={y} x2={x0 + w} y2={y} stroke="var(--streamline)" strokeWidth={1.4} />
        {rough
          ? Array.from({ length: 11 }, (_, i) => {
              const t = 0.18 + (i * 0.64) / 10
              const xx = x0 + w * t
              return <rect key={i} x={xx - 2} y={y + depthPx - 7} width={4} height={6} fill="var(--plot-3)" />
            })
          : null}
        <Tx x={8} y={y + 6} size={13} weight={700}>
          {label}
        </Tx>
        <Tx x={8} y={y + 22} size={11} cls={warn ? 'fill-rose-600 dark:fill-rose-400' : 'fill-ink-3'}>
          {sub}
        </Tx>
      </g>
    )
  }
  return (
    <svg viewBox="0 0 470 250" className="h-auto w-full" role="img" aria-label="River cross-sections: prototype, undistorted model and distorted model">
      {row(20, 50, 'Prototype', 'width 500 m, depth 10 m')}
      {row(110, 5, 'Same scale 1:1000', 'depth 10 mm → viscosity &', false, true)}
      <Tx x={8} y={147} size={11} cls="fill-rose-600 dark:fill-rose-400">
        surface tension dominate
      </Tx>
      {row(180, 50, 'Distorted model', 'H 1:1000, V 1:100 → 0.5 m wide,')}
      <Tx x={8} y={218} size={11} cls="fill-ink-3">
        100 mm deep + roughness
      </Tx>
      <Tx x={466} y={245} size={10} anchor="end" cls="fill-ink-3">
        prototype drawn with vertical exaggeration; numbers illustrative
      </Tx>
    </svg>
  )
}

/* ------------------------------------------------------------------------------------------------ Fig. 7.5 */

export function PumpCurvesFigure() {
  const L = 60
  const T = 18
  const W = 330
  const H = 230
  const X = (x: number) => +(L + (x / 100) * W).toFixed(1)
  const Y = (y: number) => +(T + (1 - y / 100) * H).toFixed(1)
  return (
    <svg viewBox="0 0 420 300" className="mx-auto h-auto w-full max-w-lg" role="img" aria-label="Typical characteristic curves of a centrifugal pump at constant speed">
      <rect x={L} y={T} width={W} height={H} fill="none" stroke="var(--axis)" />
      <path d={bezierPath(FIG75.head, X, Y)} fill="none" stroke="var(--plot-1)" strokeWidth={2.6} />
      <path d={bezierPath(FIG75.efficiency, X, Y)} fill="none" stroke="var(--plot-5)" strokeWidth={2.6} />
      <path d={bezierPath(FIG75.power, X, Y)} fill="none" stroke="var(--plot-3)" strokeWidth={2.6} />
      <line x1={X(FIG75_DESIGN_X)} y1={T} x2={X(FIG75_DESIGN_X)} y2={T + H} stroke="var(--ink-3)" strokeDasharray="4 4" />
      <circle cx={X(FIG75_DESIGN_X)} cy={Y(82.3)} r={4.5} fill="var(--plot-5)" />
      <Tx x={X(FIG75_DESIGN_X) + 6} y={T + H - 8} size={11} cls="fill-ink-3">
        design point (max η)
      </Tx>
      <Tx x={X(6)} y={Y(84)} size={13} weight={700} cls="fill-indigo-600 dark:fill-indigo-300">
        Head
      </Tx>
      <Tx x={X(64)} y={Y(88)} size={13} weight={700} cls="fill-emerald-600 dark:fill-emerald-300">
        Efficiency
      </Tx>
      <Tx x={X(40)} y={Y(18)} size={13} weight={700} cls="fill-amber-600 dark:fill-amber-300">
        Power
      </Tx>
      <Arrow x1={L + 90} y1={T + H + 26} x2={L + 240} y2={T + H + 26} color="var(--axis)" width={1.4} head={7} />
      <Tx x={L + W / 2} y={T + H + 46} size={13} anchor="middle">
        Volume flow rate, Q
      </Tx>
      <g transform={`translate(${L - 18},${T + H / 2}) rotate(-90)`}>
        <Tx x={0} y={0} size={12} anchor="middle">
          Head · Power input · Efficiency
        </Tx>
      </g>
      <Arrow x1={L - 36} y1={T + H - 20} x2={L - 36} y2={T + 20} color="var(--axis)" width={1.4} head={7} />
    </svg>
  )
}

/* ------------------------------------------------------------------------------------------------ wind tunnel */

export const TUNNEL_NOTES: { n: number; title: string; text: string }[] = [
  { n: 1, title: 'Screens & honeycomb', text: 'reduce turbulence and swirl before the contraction' },
  { n: 2, title: 'Contraction', text: 'accelerates the flow and makes it more uniform' },
  { n: 3, title: 'Test-section flow quality', text: 'uniform, free of angularity, little swirl — must be documented' },
  { n: 4, title: 'Wall boundary layers', text: 'grow along the walls; remove by suction or energise by blowing' },
  { n: 5, title: 'Model, mounting & balance', text: 'accurate model; rigid, non-interfering mount; aligned, calibrated balance' },
  { n: 6, title: 'Axial pressure gradient', text: 'a falling pressure along the section produces an erroneous drag reading' },
]

function Badge({ x, y, n }: { x: number; y: number; n: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={10} fill="var(--plot-6)" />
      <Tx x={x} y={y + 4.5} size={12} anchor="middle" cls="fill-white" weight={700}>
        {n}
      </Tx>
    </g>
  )
}

export function TunnelSchematic() {
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 480 220" className="h-auto w-full" role="img" aria-label="Open-circuit wind tunnel with numbered flow-quality issues">
        {/* outline: settling chamber, contraction, test section, diffuser */}
        <path
          d="M10,30 L90,30 C130,30 140,70 170,70 L330,70 L470,50 L470,170 L330,150 L170,150 C140,150 130,190 90,190 L10,190 Z"
          fill="var(--surface-2)"
          stroke="var(--ink-2)"
          strokeWidth={1.6}
        />
        {/* screens */}
        {[30, 48, 66].map((x) => (
          <line key={x} x1={x} y1={34} x2={x} y2={186} stroke="var(--ink-3)" strokeDasharray="2 3" />
        ))}
        {/* flow arrows */}
        {[70, 110, 150].map((y) => (
          <Arrow key={y} x1={78} y1={y} x2={118} y2={y} color="var(--streamline)" width={1.6} head={6} />
        ))}
        {/* wall boundary layers in test section */}
        <path d="M170,70 L330,70 L330,82 Z" fill="var(--plot-4)" fillOpacity={0.35} />
        <path d="M170,150 L330,150 L330,138 Z" fill="var(--plot-4)" fillOpacity={0.35} />
        {/* suction slots */}
        {[250, 270, 290].map((x) => (
          <g key={x}>
            <line x1={x} y1={70} x2={x} y2={60} stroke="var(--plot-4)" strokeWidth={1.4} />
            <line x1={x} y1={150} x2={x} y2={160} stroke="var(--plot-4)" strokeWidth={1.4} />
          </g>
        ))}
        {/* model on strut + balance */}
        <ellipse cx={250} cy={108} rx={34} ry={11} fill="var(--body-fill)" stroke="var(--ink-2)" strokeWidth={1.4} />
        <line x1={250} y1={119} x2={250} y2={168} stroke="var(--ink-2)" strokeWidth={3} />
        <rect x={232} y={168} width={36} height={18} rx={3} fill="var(--plot-6)" fillOpacity={0.25} stroke="var(--plot-6)" />
        <Tx x={250} y={181} size={10} anchor="middle">
          balance
        </Tx>
        {/* uniform test-section velocity profile */}
        {[86, 98, 110, 122, 134].map((y) => (
          <Arrow key={y} x1={180} y1={y} x2={206} y2={y} color="var(--streamline)" width={1.4} head={5} />
        ))}
        {/* fan */}
        <ellipse cx={440} cy={110} rx={8} ry={42} fill="var(--plot-7)" fillOpacity={0.3} stroke="var(--ink-3)" />
        <Tx x={425} y={40} size={11} cls="fill-ink-3">
          fan
        </Tx>
        <Tx x={360} y={200} size={11} cls="fill-ink-3">
          diffuser
        </Tx>
        <Tx x={190} y={204} size={11} cls="fill-ink-3">
          test section
        </Tx>
        <Badge x={48} y={18} n={1} />
        <Badge x={140} y={50} n={2} />
        <Badge x={193} y={160} n={3} />
        <Badge x={300} y={46} n={4} />
        <Badge x={292} y={108} n={5} />
        <Badge x={340} y={100} n={6} />
        <Tx x={325} y={128} size={10} cls="fill-ink-3">
          p falls →
        </Tx>
      </svg>
      <ol className="grid gap-2 text-sm sm:grid-cols-2">
        {TUNNEL_NOTES.map((n) => (
          <li key={n.n} className="flex gap-2 rounded-lg border border-line bg-surface px-3 py-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white">{n.n}</span>
            <span>
              <span className="font-semibold text-ink">{n.title}</span> <span className="text-ink-2">— {n.text}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}
