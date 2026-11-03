/**
 * Static diagrams for the internal-flow topic (theme-aware SVG, responsive via viewBox).
 *  - ReynoldsExperimentFig : Reynolds' dye experiment, laminar vs turbulent (Fox p. 276, described in text)
 *  - ReRegimeLine          : where real flows sit on the Re axis (numbers from Fox pp. 275–276)
 *  - Fig81Entrance         : recreation of Fox Fig. 8.1 (entrance region of a pipe, p. 277)
 *  - CylinderFBD           : force balance on a fluid cylinder (supplementary picture of the §8.4 balance)
 *  - Fig88Plot             : recreation of Fox Fig. 8.8 (Laufer's Reynolds-stress data, p. 294)
 */
import { useMemo } from 'react'
import { Plot, md, num, useUid } from '@/kit'
import { FIG88_CIRCLES, FIG88_SQUARES, uOverVbar, deltaOverR, XI_MEET } from './model'

const T = 'fill-ink-2'
const T3 = 'fill-ink-3'

function ArrowDefs({ id, color }: { id: string; color: string }) {
  return (
    <marker id={id} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill={color} />
    </marker>
  )
}

/* ------------------------------------------------------------------ Reynolds' dye experiment */

export function ReynoldsExperimentFig() {
  const uid = useUid('rx')
  const dots = useMemo(() => {
    const rnd = num.seededRandom(7)
    const out: { x: number; y: number; r: number }[] = []
    for (let i = 0; i < 260; i++) {
      const x = 250 + rnd() * 215
      const spread = Math.min(1, (x - 250) / 70)
      const y = (rnd() * 2 - 1) * 26 * spread
      out.push({ x, y, r: 1 + rnd() * 1.3 })
    }
    return out
  }, [])
  const wavy = useMemo(() => {
    const pts: string[] = []
    for (let x = 95; x <= 260; x += 3) {
      const g = Math.max(0, (x - 170) / 90)
      const y = Math.sin(x / 7) * 9 * g * g + Math.sin(x / 3.1) * 4 * g * g * g
      pts.push(`${x},${y.toFixed(1)}`)
    }
    return pts.join(' ')
  }, [])
  const row = (y0: number, turbulent: boolean) => (
    <g transform={`translate(0 ${y0})`}>
      {/* reservoir */}
      <rect x={8} y={-46} width={70} height={84} rx={4} fill="var(--surface-2)" stroke="var(--ink-3)" />
      <rect x={9} y={-30} width={68} height={67} fill="var(--streamline)" opacity={0.18} />
      <text x={43} y={-34} textAnchor="middle" className={T3} fontSize={11}>
        reservoir
      </text>
      {/* tube */}
      <rect x={78} y={-30} width={392} height={60} fill="var(--streamline)" opacity={0.12} />
      <line x1={78} y1={-30} x2={470} y2={-30} stroke="var(--ink-3)" strokeWidth={2} />
      <line x1={78} y1={30} x2={470} y2={30} stroke="var(--ink-3)" strokeWidth={2} />
      {/* dye needle */}
      <path d="M60,-60 L60,-6 Q60,0 70,0 L92,0" fill="none" stroke="var(--ink-3)" strokeWidth={2.5} />
      <text x={66} y={-50} className={T3} fontSize={11}>
        dye
      </text>
      {turbulent ? (
        <>
          <polyline points={wavy} fill="none" stroke="var(--plot-4)" strokeWidth={2} />
          {dots.map((d, i) => (
            <circle key={i} cx={d.x} cy={d.y} r={d.r} fill="var(--plot-4)" opacity={0.65} />
          ))}
        </>
      ) : (
        <line x1={92} y1={0} x2={470} y2={0} stroke="var(--plot-4)" strokeWidth={2} />
      )}
      <line x1={420} y1={44} x2={460} y2={44} stroke="var(--ink-3)" markerEnd={`url(#${uid})`} />
      <text x={414} y={48} textAnchor="end" className={T3} fontSize={11}>
        flow
      </text>
    </g>
  )
  return (
    <svg viewBox="0 0 480 282" className="h-auto w-full" role="img" aria-label="Reynolds dye experiment: laminar and turbulent">
      <defs>
        <ArrowDefs id={uid} color="var(--ink-3)" />
      </defs>
      <text x={8} y={14} className="fill-ink" fontSize={13} fontWeight={600}>
        Low flow rate (low Re): laminar — one sharp dye filament
      </text>
      {row(90, false)}
      <text x={8} y={160} className="fill-ink" fontSize={13} fontWeight={600}>
        Higher flow rate: turbulent — the filament breaks up and fills the tube
      </text>
      {row(226, true)}
    </svg>
  )
}

/* ------------------------------------------------------------------ Re number line */

export function ReRegimeLine() {
  const x0 = 24
  const x1 = 456
  const lo = -1
  const hi = 6
  const sx = (Re: number) => x0 + ((Math.log10(Re) - lo) / (hi - lo)) * (x1 - x0)
  const marks: { Re: number; label: string; sub: string; up: boolean }[] = [
    { Re: 0.4, label: 'lab-on-a-chip', sub: 'Re ≈ 0.4', up: true },
    { Re: 2300, label: 'benchmark', sub: 'Re ≈ 2300', up: false },
    { Re: 1e5, label: 'disturbance-free lab pipe', sub: 'laminar to ≈ 100 000', up: true },
  ]
  return (
    <svg viewBox="0 0 480 140" className="h-auto w-full" role="img" aria-label="Reynolds number axis with regimes">
      <rect x={x0} y={58} width={sx(2300) - x0} height={22} fill="var(--plot-3)" opacity={0.22} />
      <rect x={sx(2300)} y={58} width={x1 - sx(2300)} height={22} fill="var(--plot-5)" opacity={0.22} />
      <text x={(x0 + sx(2300)) / 2} y={73} textAnchor="middle" className="fill-ink" fontSize={12} fontWeight={600}>
        laminar (normal conditions)
      </text>
      <text x={(sx(2300) + x1) / 2} y={73} textAnchor="middle" className="fill-ink" fontSize={12} fontWeight={600}>
        turbulent
      </text>
      <line x1={x0} y1={80} x2={x1} y2={80} stroke="var(--ink-3)" />
      {Array.from({ length: hi - lo + 1 }, (_, i) => lo + i).map((e) => (
        <g key={e}>
          <line x1={sx(10 ** e)} y1={80} x2={sx(10 ** e)} y2={85} stroke="var(--ink-3)" />
          <text x={sx(10 ** e)} y={97} textAnchor="middle" className={T3} fontSize={10.5}>
            {e === 0 ? '1' : e === 1 ? '10' : `10${num.superscript(e)}`}
          </text>
        </g>
      ))}
      <text x={x1} y={112} textAnchor="end" className={T3} fontSize={10.5}>
        Re = ρV̄D/μ (log scale)
      </text>
      {marks.map((m) => {
        const x = sx(m.Re)
        return (
          <g key={m.label}>
            <line x1={x} y1={m.up ? 30 : 58} x2={x} y2={m.up ? 58 : 128} stroke="var(--plot-1)" strokeWidth={1.6} strokeDasharray={m.up ? '0' : '4 3'} />
            <circle cx={x} cy={m.up ? 58 : 80} r={3.5} fill="var(--plot-1)" />
            <text x={x} y={m.up ? 14 : 136} textAnchor="middle" className={T} fontSize={11} fontWeight={600}>
              {m.label}
            </text>
            {m.up ? (
              <text x={x} y={27} textAnchor="middle" className={T3} fontSize={10.5}>
                {m.sub}
              </text>
            ) : (
              <text x={x + 6} y={124} className={T3} fontSize={10.5}>
                {m.sub}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

/* ------------------------------------------------------------------ Fig. 8.1 */

export function Fig81Entrance() {
  const uid = useUid('f81')
  const aU = `${uid}u`
  const aD = `${uid}d`
  const yc = 120
  const R = 60
  const xin = 62
  const xfd = 372 // station of the fully developed profile (= end of entrance length)
  const scale = 34 // px per V̄
  const xiOf = (x: number) => (x - xin) / (xfd - xin)
  const edge = (sign: 1 | -1) => {
    const pts: string[] = []
    for (let x = xin; x <= xfd; x += 4) {
      const d = deltaOverR(xiOf(x), false)
      pts.push(`${x},${(yc - sign * R * (1 - d)).toFixed(1)}`)
    }
    return pts.join(' ')
  }
  const profile = (xs: number, xi: number, n: number) => {
    const arrows: { y: number; L: number }[] = []
    for (let i = 0; i < n; i++) {
      const rho = -1 + (2 * (i + 0.5)) / n
      arrows.push({ y: yc + rho * R, L: uOverVbar(rho, xi, false) * scale })
    }
    const outline: string[] = []
    for (let k = 0; k <= 60; k++) {
      const rho = -1 + (2 * k) / 60
      outline.push(`${(xs + uOverVbar(rho, xi, false) * scale).toFixed(1)},${(yc + rho * R).toFixed(1)}`)
    }
    return { arrows, outline: outline.join(' ') }
  }
  const mid = profile(158, xiOf(158), 7)
  const fd = profile(xfd, 1, 7)
  const xMeet = xin + XI_MEET.laminar * (xfd - xin)
  return (
    <svg viewBox="0 0 480 250" className="h-auto w-full" role="img" aria-label="Fox Fig. 8.1: flow in the entrance region of a pipe">
      <defs>
        <ArrowDefs id={aU} color="var(--plot-1)" />
        <ArrowDefs id={aD} color="var(--ink-3)" />
      </defs>
      {/* walls with bell-mouth inlet */}
      <path d={`M14,${yc - R - 40} Q${xin - 6},${yc - R - 2} ${xin},${yc - R} L470,${yc - R} L470,${yc - R - 12} L${xin},${yc - R - 12} Q${xin - 20},${yc - R - 14} 14,${yc - R - 48} Z`} fill="var(--body-fill)" stroke="var(--ink-3)" />
      <path d={`M14,${yc + R + 40} Q${xin - 6},${yc + R + 2} ${xin},${yc + R} L470,${yc + R} L470,${yc + R + 12} L${xin},${yc + R + 12} Q${xin - 20},${yc + R + 14} 14,${yc + R + 48} Z`} fill="var(--body-fill)" stroke="var(--ink-3)" />
      {/* centreline */}
      <line x1={xin - 8} y1={yc} x2={468} y2={yc} stroke="var(--ink-3)" strokeDasharray="10 3 2 3" />
      {/* boundary-layer edges */}
      <polyline points={edge(1)} fill="none" stroke="var(--plot-3)" strokeWidth={1.6} strokeDasharray="5 4" />
      <polyline points={edge(-1)} fill="none" stroke="var(--plot-3)" strokeWidth={1.6} strokeDasharray="5 4" />
      <text x={136} y={yc + 22} textAnchor="middle" className={T3} fontSize={10.5}>
        inviscid core
      </text>
      <text x={232} y={yc - R + 13} className="fill-ink-3" fontSize={10}>
        boundary layer
      </text>
      {/* inlet uniform profile */}
      <line x1={xin + 2} y1={yc - R} x2={xin + 2} y2={yc + R} stroke="var(--plot-1)" />
      {Array.from({ length: 7 }, (_, i) => yc - R + (2 * R * (i + 0.5)) / 7).map((y) => (
        <line key={y} x1={xin + 2} y1={y} x2={xin + 2 + scale} y2={y} stroke="var(--plot-1)" strokeWidth={1.5} markerEnd={`url(#${aU})`} />
      ))}
      <text x={xin + 2 + scale + 4} y={yc - R + 14} className="fill-ink" fontSize={13} fontStyle="italic">
        U₀
      </text>
      {/* intermediate profile */}
      <line x1={158} y1={yc - R} x2={158} y2={yc + R} stroke="var(--plot-1)" />
      {mid.arrows.map((a) => (
        <line key={a.y} x1={158} y1={a.y} x2={158 + a.L} y2={a.y} stroke="var(--plot-1)" strokeWidth={1.5} markerEnd={`url(#${aU})`} />
      ))}
      <polyline points={mid.outline} fill="none" stroke="var(--plot-1)" strokeWidth={1.2} opacity={0.7} />
      {/* fully developed profile */}
      <line x1={xfd} y1={yc - R} x2={xfd} y2={yc + R} stroke="var(--plot-1)" />
      {fd.arrows.map((a) => (
        <line key={a.y} x1={xfd} y1={a.y} x2={xfd + a.L} y2={a.y} stroke="var(--plot-1)" strokeWidth={1.5} markerEnd={`url(#${aU})`} />
      ))}
      <polyline points={fd.outline} fill="none" stroke="var(--plot-1)" strokeWidth={1.6} />
      <text x={xfd + 2 * scale + 2} y={yc - 8} className="fill-ink" fontSize={13} fontStyle="italic">
        u
      </text>
      {/* axes r, x */}
      <line x1={xin + 8} y1={yc} x2={xin + 8} y2={yc - 30} stroke="var(--ink-2)" markerEnd={`url(#${aD})`} />
      <line x1={xin + 8} y1={yc} x2={xin + 38} y2={yc} stroke="var(--ink-2)" markerEnd={`url(#${aD})`} />
      <text x={xin + 12} y={yc - 26} className={T} fontSize={12} fontStyle="italic">
        r
      </text>
      <text x={xin + 34} y={yc + 14} className={T} fontSize={12} fontStyle="italic">
        x
      </text>
      {/* D dimension */}
      <line x1={462} y1={yc - R + 2} x2={462} y2={yc + R - 2} stroke="var(--ink-2)" markerStart={`url(#${aD})`} markerEnd={`url(#${aD})`} />
      <text x={467} y={yc + 4} className="fill-ink" fontSize={13} fontStyle="italic">
        D
      </text>
      {/* entrance length dimension */}
      <line x1={xin} y1={yc + R + 26} x2={xfd} y2={yc + R + 26} stroke="var(--ink-2)" markerStart={`url(#${aD})`} markerEnd={`url(#${aD})`} />
      <line x1={xin} y1={yc + R + 16} x2={xin} y2={yc + R + 32} stroke="var(--ink-3)" />
      <line x1={xfd} y1={yc + R + 16} x2={xfd} y2={yc + R + 32} stroke="var(--ink-3)" />
      <text x={(xin + xfd) / 2} y={yc + R + 44} textAnchor="middle" className="fill-ink" fontSize={12.5} fontWeight={600}>
        Entrance length
      </text>
      <text x={xfd + 6} y={yc + R + 44} className={T} fontSize={11}>
        Fully developed
      </text>
      <text x={xfd + 6} y={yc + R + 57} className={T} fontSize={11}>
        velocity profile
      </text>
      <line x1={xMeet} y1={yc - 3} x2={xMeet} y2={yc + 3} stroke="var(--plot-3)" strokeWidth={2} />
    </svg>
  )
}

/* ------------------------------------------------------------------ force balance on a fluid cylinder */

export function CylinderFBD() {
  const uid = useUid('fbd')
  const aP = `${uid}p`
  const aT = `${uid}t`
  const aD = `${uid}d`
  const yc = 118
  const R = 78
  const r = 40
  const xa = 170
  const xb = 320
  return (
    <svg viewBox="0 0 480 250" className="h-auto w-full" role="img" aria-label="Force balance on a cylinder of fluid in a pipe">
      <defs>
        <ArrowDefs id={aP} color="var(--plot-1)" />
        <ArrowDefs id={aT} color="var(--plot-5)" />
        <ArrowDefs id={aD} color="var(--ink-3)" />
      </defs>
      <rect x={20} y={yc - R - 10} width={440} height={10} fill="var(--body-fill)" stroke="var(--ink-3)" />
      <rect x={20} y={yc + R} width={440} height={10} fill="var(--body-fill)" stroke="var(--ink-3)" />
      <line x1={20} y1={yc} x2={460} y2={yc} stroke="var(--ink-3)" strokeDasharray="10 3 2 3" />
      <text x={24} y={yc - 6} className={T3} fontSize={10.5}>
        centreline
      </text>
      {/* the fluid cylinder */}
      <rect x={xa} y={yc - r} width={xb - xa} height={2 * r} fill="var(--plot-1)" opacity={0.14} stroke="var(--plot-1)" strokeWidth={1.4} />
      <ellipse cx={xa} cy={yc} rx={9} ry={r} fill="none" stroke="var(--plot-1)" strokeWidth={1.4} />
      <ellipse cx={xb} cy={yc} rx={9} ry={r} fill="none" stroke="var(--plot-1)" strokeWidth={1.4} strokeDasharray="3 3" />
      {/* pressure forces */}
      <line x1={xa - 62} y1={yc + 10} x2={xa - 4} y2={yc + 10} stroke="var(--plot-1)" strokeWidth={2.2} markerEnd={`url(#${aP})`} />
      <text x={xa - 64} y={yc + 30} className="fill-ink" fontSize={12}>
        p·πr²
      </text>
      <line x1={xb + 70} y1={yc + 10} x2={xb + 4} y2={yc + 10} stroke="var(--plot-1)" strokeWidth={2.2} markerEnd={`url(#${aP})`} />
      <text x={xb + 6} y={yc + 30} className="fill-ink" fontSize={12}>
        (p + ∂p/∂x·dx)·πr²
      </text>
      {/* shear on lateral surface (positive sign convention) */}
      {[0.2, 0.5, 0.8].map((f) => (
        <g key={f}>
          <line x1={xa + f * (xb - xa) - 18} y1={yc - r - 1} x2={xa + f * (xb - xa) + 18} y2={yc - r - 1} stroke="var(--plot-5)" strokeWidth={2} markerEnd={`url(#${aT})`} />
          <line x1={xa + f * (xb - xa) - 18} y1={yc + r + 1} x2={xa + f * (xb - xa) + 18} y2={yc + r + 1} stroke="var(--plot-5)" strokeWidth={2} markerEnd={`url(#${aT})`} />
        </g>
      ))}
      <text x={(xa + xb) / 2} y={yc - r - 10} textAnchor="middle" className="fill-ink" fontSize={12}>
        τ_rx on the side, area 2πr·dx (drawn in the + x sense)
      </text>
      {/* r and dx dimensions */}
      <line x1={xa + 30} y1={yc} x2={xa + 30} y2={yc - r + 2} stroke="var(--ink-2)" markerEnd={`url(#${aD})`} />
      <text x={xa + 35} y={yc - 14} className={T} fontSize={12} fontStyle="italic">
        r
      </text>
      <line x1={xa} y1={yc + r + 30} x2={xb} y2={yc + r + 30} stroke="var(--ink-2)" markerStart={`url(#${aD})`} markerEnd={`url(#${aD})`} />
      <text x={(xa + xb) / 2} y={yc + r + 23} textAnchor="middle" className={T} fontSize={12} fontStyle="italic">
        dx
      </text>
      <line x1={440} y1={yc} x2={440} y2={yc - R + 2} stroke="var(--ink-3)" markerEnd={`url(#${aD})`} />
      <text x={444} y={yc - 30} className={T3} fontSize={12} fontStyle="italic">
        R
      </text>
      <text x={24} y={yc + R + 32} className={T3} fontSize={11}>
        flow →   steady, fully developed, horizontal pipe
      </text>
    </svg>
  )
}

/* ------------------------------------------------------------------ Fig. 8.8 */

export function Fig88Plot({ showTotal = true }: { showTotal?: boolean }) {
  return (
    <Plot
      height={280}
      x={{ label: md`dimensionless distance from wall, $y/R$`, domain: [0, 1] }}
      y={{ label: md`$-\rho\overline{u'v'}/\tau_w$`, domain: [0, 1.05] }}
      series={[
        { label: md`$Re_U = 500\,000$ (Laufer)`, points: FIG88_SQUARES, kind: 'scatter', color: 'var(--plot-1)' },
        { label: md`$Re_U = 50\,000$ (Laufer)`, points: FIG88_CIRCLES, kind: 'scatter', color: 'var(--plot-3)' },
        ...(showTotal
          ? [{ label: md`total stress $\tau/\tau_w = 1 - y/R$ (Eq. 8.15)`, fn: (x: number) => 1 - x, color: 'var(--plot-7)', dash: '6 4', width: 1.6 }]
          : []),
      ]}
    />
  )
}
