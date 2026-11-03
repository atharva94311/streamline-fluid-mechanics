/**
 * Static figures for the "dimensionless-groups" topic.
 * - ForceCubeFigure: the order-of-magnitude force estimates of Fox p. 255 drawn on a fluid element of size L.
 * - RegimeLines: number lines for Re (pipe), Fr (open channel) and Ma with the regime thresholds.
 */
import { Md, md } from '@/kit'
import { Arrow } from './Arrow'
import { MAIN_FONT, MATH_FONT } from './data'

/* ------------------------------------------------------------------------------------ force cube */

const C = {
  inertia: 'var(--plot-1)',
  viscous: 'var(--plot-2)',
  pressure: 'var(--plot-3)',
  gravity: 'var(--plot-4)',
  surface: 'var(--plot-5)',
  compress: 'var(--plot-6)',
}

export function ForceCubeFigure() {
  // oblique cube: front face square, depth offset (dx, dy)
  const x0 = 110
  const y0 = 105
  const s = 120
  const dx = 50
  const dy = -38
  const front = `${x0},${y0} ${x0 + s},${y0} ${x0 + s},${y0 + s} ${x0},${y0 + s}`
  const top = `${x0},${y0} ${x0 + dx},${y0 + dy} ${x0 + s + dx},${y0 + dy} ${x0 + s},${y0}`
  const side = `${x0 + s},${y0} ${x0 + s + dx},${y0 + dy} ${x0 + s + dx},${y0 + s + dy} ${x0 + s},${y0 + s}`
  const cx = x0 + s / 2
  const cy = y0 + s / 2
  return (
    <div className="grid items-center gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <svg viewBox="0 0 380 315" className="h-auto w-full" role="img" aria-label="Fluid element of size L with the six force types acting on it">
        <polygon points={top} fill="var(--surface-2)" stroke="var(--ink-3)" strokeWidth={1.2} />
        <polygon points={side} fill="var(--surface-2)" stroke="var(--ink-3)" strokeWidth={1.2} opacity={0.85} />
        <polygon points={front} fill="var(--body-fill)" fillOpacity={0.35} stroke="var(--ink-2)" strokeWidth={1.5} />
        {/* size labels */}
        <line x1={x0} y1={y0 + s + 14} x2={x0 + s} y2={y0 + s + 14} stroke="var(--ink-3)" />
        <line x1={x0} y1={y0 + s + 9} x2={x0} y2={y0 + s + 19} stroke="var(--ink-3)" />
        <line x1={x0 + s} y1={y0 + s + 9} x2={x0 + s} y2={y0 + s + 19} stroke="var(--ink-3)" />
        <text x={cx} y={y0 + s + 32} textAnchor="middle" fontFamily={MATH_FONT} fontSize={16} fill="var(--ink-2)">L</text>
        <text x={cx} y={cy + 5} textAnchor="middle" fontFamily={MAIN_FONT} fontSize={12} fill="var(--ink-3)">m ~ ρL³</text>

        {/* inertia: acceleration arrow */}
        <Arrow x1={x0 + s + dx + 6} y1={cy - 5} x2={x0 + s + dx + 78} y2={cy - 5} color={C.inertia} width={3.2} head={12} />
        <text x={x0 + s + dx + 10} y={cy - 14} fontFamily={MAIN_FONT} fontSize={12} fill={C.inertia}>inertia ma</text>
        <text x={x0 + s + dx + 10} y={cy + 13} fontFamily={MAIN_FONT} fontSize={12} fill={C.inertia}>~ ρV²L²</text>

        {/* viscous shear on top face */}
        <Arrow x1={x0 + 22} y1={y0 + dy / 2} x2={x0 + s + 10} y2={y0 + dy / 2} color={C.viscous} width={2.4} />
        <text x={x0 + 4} y={y0 + dy - 8} fontFamily={MAIN_FONT} fontSize={12} fill={C.viscous}>viscous τA ~ μVL</text>

        {/* pressure on left face */}
        <Arrow x1={x0 - 62} y1={cy - 18} x2={x0 - 4} y2={cy - 18} color={C.pressure} width={2.4} />
        <Arrow x1={x0 - 62} y1={cy + 18} x2={x0 - 4} y2={cy + 18} color={C.pressure} width={2.4} />
        <text x={6} y={cy - 30} fontFamily={MAIN_FONT} fontSize={12} fill={C.pressure}>pressure</text>
        <text x={6} y={cy + 42} fontFamily={MAIN_FONT} fontSize={12} fill={C.pressure}>~ ΔpL²</text>

        {/* gravity */}
        <Arrow x1={cx + 30} y1={cy + 10} x2={cx + 30} y2={y0 + s + 58} color={C.gravity} width={2.4} />
        <text x={cx + 38} y={y0 + s + 52} fontFamily={MAIN_FONT} fontSize={12} fill={C.gravity}>gravity mg ~ ρgL³</text>

        {/* surface tension along top-front edge (free surface) */}
        <path
          d={`M ${x0} ${y0} q 10 -6 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0`}
          fill="none"
          stroke={C.surface}
          strokeWidth={2.6}
        />
        <text x={x0 - 104} y={y0 - 4} fontFamily={MAIN_FONT} fontSize={12} fill={C.surface}>surface tension</text>
        <text x={x0 - 104} y={y0 + 11} fontFamily={MAIN_FONT} fontSize={12} fill={C.surface}>σ × length ~ σL</text>

        {/* compressibility: squeeze arrows on bottom */}
        <Arrow x1={x0 + 20} y1={y0 + s + 70} x2={x0 + 20} y2={y0 + s + 4} color={C.compress} width={2} head={8} dash="4 3" />
        <text x={x0 - 104} y={y0 + s + 60} fontFamily={MAIN_FONT} fontSize={12} fill={C.compress}>compressibility</text>
        <text x={x0 - 104} y={y0 + s + 76} fontFamily={MAIN_FONT} fontSize={12} fill={C.compress}>~ EᵥL²</text>
      </svg>
      <div className="space-y-2 text-sm">
        <Md>{md`Divide every estimate by the **inertia force** $\rho V^2L^2$:

| force | estimate | ratio to inertia |
|---|---|---|
| viscous | $\mu VL$ | $\mu/(\rho VL) = 1/\Rey$ |
| pressure | $\Delta p\,L^2$ | $\Delta p/(\rho V^2) \propto \Eu$ |
| gravity | $\rho g L^3$ | $gL/V^2 = 1/\Fr^2$ |
| surface tension | $\sigma L$ | $\sigma/(\rho V^2 L) = 1/\We$ |
| compressibility | $E_v L^2$ | $E_v/(\rho V^2) = 1/\Ma^2$ |

Every ratio is a pure number: $L$, $V$ and $\rho$ all cancel in dimension.`}</Md>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------------------------ regime lines */

interface Band {
  from: number
  to: number
  label: string
  color: string
}
interface Mark {
  at: number
  label: string
}

function NumberLine({
  title, domain, log = false, bands, marks, ticks, note,
}: {
  title: string
  domain: [number, number]
  log?: boolean
  bands: Band[]
  marks: Mark[]
  ticks: { v: number; t: string }[]
  note: string
}) {
  const W = 440
  const x0 = 14
  const x1 = W - 14
  const sx = (v: number) => {
    const [a, b] = domain
    const f = log ? (Math.log10(v) - Math.log10(a)) / (Math.log10(b) - Math.log10(a)) : (v - a) / (b - a)
    return x0 + Math.max(0, Math.min(1, f)) * (x1 - x0)
  }
  const yBar = 50
  return (
    <div>
      <div className="mb-1 flex flex-wrap items-baseline gap-x-3 text-sm">
        <span className="font-semibold text-ink"><Md inline>{title}</Md></span>
        <span className="text-xs text-ink-3"><Md inline>{note}</Md></span>
      </div>
      <svg viewBox={`0 0 ${W} 112`} className="h-auto w-full" role="img" aria-label={title}>
        {bands.map((b, i) => (
          <g key={i}>
            <rect x={sx(b.from)} y={yBar - 14} width={Math.max(0, sx(b.to) - sx(b.from))} height={28} fill={b.color} opacity={0.28} />
            <text x={(sx(b.from) + sx(b.to)) / 2} y={yBar + 4} textAnchor="middle" fontFamily={MAIN_FONT} fontSize={11.5} fill="var(--ink)">
              {b.label}
            </text>
          </g>
        ))}
        <line x1={x0} y1={yBar + 14} x2={x1} y2={yBar + 14} stroke="var(--ink-3)" />
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={sx(t.v)} y1={yBar + 14} x2={sx(t.v)} y2={yBar + 19} stroke="var(--ink-3)" />
            <text x={sx(t.v)} y={yBar + 31} textAnchor="middle" fontFamily={MAIN_FONT} fontSize={10.5} fill="var(--ink-3)">
              {t.t}
            </text>
          </g>
        ))}
        {marks.map((m, i) => {
          const x = sx(m.at)
          const up = i % 2 === 0
          const anchor = x < 80 ? 'start' : x > W - 80 ? 'end' : 'middle'
          return (
            <g key={i}>
              <line x1={x} y1={up ? 22 : yBar + 14} x2={x} y2={up ? yBar - 14 : yBar + 40} stroke="var(--ink)" strokeWidth={1.4} />
              <circle cx={x} cy={up ? yBar - 14 : yBar + 14} r={3.5} fill="var(--ink)" />
              <text x={x} y={up ? 16 : yBar + 54} textAnchor={anchor} fontFamily={MAIN_FONT} fontSize={10.5} fill="var(--ink-2)">
                {m.label}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export function RegimeLines() {
  return (
    <div className="space-y-3">
      <NumberLine
        title="Reynolds number of a pipe flow, $\Rey = \rho \bar V D/\mu$"
        note="threshold ≈ 2300 is the standard pipe value (supplementary)"
        domain={[1, 1e7]}
        log
        bands={[
          { from: 1, to: 2300, label: 'laminar', color: 'var(--plot-2)' },
          { from: 2300, to: 4000, label: '', color: 'var(--plot-5)' },
          { from: 4000, to: 1e7, label: 'turbulent', color: 'var(--plot-4)' },
        ]}
        ticks={[1, 10, 100, 1e3, 1e4, 1e5, 1e6, 1e7].map((v) => ({ v, t: v < 1e4 ? String(v) : `10${['', '', '', '', '⁴', '⁵', '⁶', '⁷'][Math.log10(v)]}` }))}
        marks={[
          { at: 11.1, label: 'oil, 2 cm tube, 0.5 m/s' },
          { at: 74850, label: 'water, 5 cm pipe, 1.5 m/s' },
        ]}
      />
      <NumberLine
        title="Froude number of an open channel, $\Fr = V/\sqrt{gy}$ ($y$ = depth)"
        note="Fox p. 256: Fr < 1 subcritical, Fr > 1 supercritical"
        domain={[0, 2.5]}
        bands={[
          { from: 0, to: 1, label: 'subcritical', color: 'var(--plot-2)' },
          { from: 1, to: 2.5, label: 'supercritical', color: 'var(--plot-3)' },
        ]}
        ticks={[0, 0.5, 1, 1.5, 2, 2.5].map((v) => ({ v, t: String(v) }))}
        marks={[
          { at: 0.271, label: 'river: 1.2 m/s, 2 m deep' },
          { at: 1.355, label: 'chute: 3 m/s, 0.5 m deep' },
        ]}
      />
      <NumberLine
        title="Mach number, $\Ma = V/c$"
        note="Fox p. 245: essentially incompressible below ≈ 0.3"
        domain={[0, 2.5]}
        bands={[
          { from: 0, to: 0.3, label: 'incomp.', color: 'var(--plot-2)' },
          { from: 0.3, to: 1, label: 'compressible', color: 'var(--plot-5)' },
          { from: 1, to: 2.5, label: 'supersonic', color: 'var(--plot-4)' },
        ]}
        ticks={[0, 0.3, 1, 1.5, 2, 2.5].map((v) => ({ v, t: String(v) }))}
        marks={[
          { at: 0.0874, label: 'car, 30 m/s' },
          { at: 0.835, label: 'airliner, 250 m/s at −50 °C' },
        ]}
      />
    </div>
  )
}
