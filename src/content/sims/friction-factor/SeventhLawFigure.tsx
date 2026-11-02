import { useMemo, useState } from 'react'
import { Plot, Toggle, md, useUid, type Series } from '@/kit'
import { powerLawPoints } from './laws'

/**
 * Recreation of Wilkes Fig. 9.11 (p. 503): the one-seventh power-law profile v̄z/v̄zc = (y/a)^(1/7), Eq. (9.61),
 * on linear axes, with the location where the local velocity equals the mean (49/60 of the centreline value).
 */
export function SeventhLawFigure() {
  const [lam, setLam] = useState(false)
  const pts = useMemo(() => powerLawPoints(1 / 7), [])
  const yMean = Math.pow(49 / 60, 7)
  const series: Series[] = [{ label: md`one-seventh power law (9.61): $(y/a)^{1/7}$`, points: pts, color: 'var(--plot-1)', width: 2.6 }]
  if (lam) series.push({ label: 'laminar parabola, same centreline speed (supplementary)', fn: (t) => 2 * t - t * t, color: 'var(--plot-6)', dash: '6 4', width: 2 })
  return (
    <div className="space-y-2">
      <Plot
        height={300}
        x={{ label: 'Dimensionless distance from wall, $y/a$', domain: [0, 1], ticks: 5 }}
        y={{ label: md`Dimensionless velocity, $\overline{v}_z/\overline{v}_{zc}$`, domain: [0, 1], ticks: 5 }}
        series={series}
        hlines={[
          { y: 49 / 60, label: 'mean = 49/60 of centreline (1/7 law)', color: 'var(--plot-1)' },
          ...(lam ? [{ y: 0.5, label: 'laminar mean = 1/2 of centreline', color: 'var(--plot-6)' }] : []),
        ]}
        marks={[{ x: yMean, y: 49 / 60, label: 'y/a ≈ 0.24', color: 'var(--plot-4)' }]}
      />
      <Toggle label="overlay the laminar parabola (same centreline velocity)" checked={lam} onChange={setLam} />
    </div>
  )
}

/**
 * Supplementary sketch: velocity arrows across a pipe for laminar flow and for the 1/7 law at the SAME mean
 * velocity (laminar v̄c = 2 v̄m; 1/7 law v̄c = (60/49) v̄m ≈ 1.22 v̄m).
 */
export function PipeProfiles() {
  const id = useUid('ffarrow')
  const W = 600
  const H = 230
  const pw = 270
  const panels = [
    { x0: 14, title: 'Laminar (parabola): centre = 2.00 × mean', color: 'var(--plot-6)', u: (eta: number) => 2 * (1 - eta * eta) },
    { x0: 316, title: '1/7 law: centre = 1.22 × mean', color: 'var(--plot-1)', u: (eta: number) => (60 / 49) * Math.pow(Math.max(0, 1 - Math.abs(eta)), 1 / 7) },
  ]
  const yTop = 40
  const yBot = 200
  const yc = (yTop + yBot) / 2
  const half = (yBot - yTop) / 2
  const sx = 112 // px per unit of v/v̄m
  const etas = [-0.95, -0.8, -0.6, -0.4, -0.2, 0, 0.2, 0.4, 0.6, 0.8, 0.95]
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Laminar and one-seventh-law velocity profiles at equal mean velocity">
      <defs>
        {panels.map((p, k) => (
          <marker key={k} id={`${id}-${k}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0 0 L10 5 L0 10 z" fill={p.color} />
          </marker>
        ))}
      </defs>
      {panels.map((p, k) => {
        const base = p.x0 + 14
        const curve: string[] = []
        for (let i = 0; i <= 120; i++) {
          const eta = -1 + (2 * i) / 120
          curve.push(`${i ? 'L' : 'M'} ${(base + sx * p.u(eta)).toFixed(1)} ${(yc + eta * half).toFixed(1)}`)
        }
        return (
          <g key={k}>
            <text x={p.x0 + pw / 2} y={18} textAnchor="middle" className="fill-ink text-[12px] font-semibold">
              {p.title}
            </text>
            <rect x={p.x0} y={yTop - 9} width={pw} height={9} fill="var(--body-fill)" />
            <rect x={p.x0} y={yBot} width={pw} height={9} fill="var(--body-fill)" />
            <line x1={base} x2={base} y1={yTop} y2={yBot} stroke="var(--ink-3)" strokeDasharray="3 3" />
            <line x1={base + sx} x2={base + sx} y1={yTop} y2={yBot} stroke="var(--ink-3)" strokeDasharray="5 4" />
            <text x={base + sx + 3} y={yBot - 4} className="fill-ink-3 text-[10px]">
              mean
            </text>
            {etas.map((eta) => {
              const len = sx * p.u(eta)
              return len > 3 ? (
                <line key={eta} x1={base} x2={base + len - 1} y1={yc + eta * half} y2={yc + eta * half} stroke={p.color} strokeWidth={1.6} markerEnd={`url(#${id}-${k})`} />
              ) : null
            })}
            <path d={curve.join(' ')} fill="none" stroke={p.color} strokeWidth={2.2} />
          </g>
        )
      })}
      <text x={W / 2} y={H - 4} textAnchor="middle" className="fill-ink-3 text-[10.5px]">
        same flow rate in both pipes — the turbulent profile is much fuller and far steeper at the wall
      </text>
    </svg>
  )
}
