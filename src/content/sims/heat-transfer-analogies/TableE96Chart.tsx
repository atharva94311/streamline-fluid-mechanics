import { useState } from 'react'
import { Md, Toggle, md } from '@/kit'
import { COLORS, TABLE_E96, fmtPct, nuDB, nuPTA, nuRA, pctDiff } from './model'
import { SvgLabel, useDesignWidth } from './svg'

const KEYS = [
  { key: 'RA', name: 'Reynolds analogy (RA)', color: COLORS.RA, fn: nuRA },
  { key: 'DB', name: 'Dittus–Boelter (DB, experiment-based)', color: COLORS.DB, fn: nuDB },
  { key: 'PTA', name: 'Prandtl–Taylor analogy (PTA)', color: COLORS.PTA, fn: nuPTA },
] as const

/** Grouped-bar rendering of Table E9.6 (Wilkes p. 523): Nu at Re = 50 000 for Pr = 0.5, 1, 2 (printed values). */
export function TableE96Chart() {
  const [ref, W] = useDesignWidth(320, 640)
  const [overlay, setOverlay] = useState(false)
  const H = 300
  const x0 = 44
  const x1 = W - 8
  const yt = 18
  const yb = H - 62
  const ymax = 300
  const sy = (v: number) => yb - (v / ymax) * (yb - yt)
  const gw = (x1 - x0) / 3
  const bw = Math.min(40, gw * 0.24)
  const gap = Math.min(6, gw * 0.04)

  return (
    <div ref={ref} className="w-full">
      <div className="mb-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-2">
        {KEYS.map((k) => (
          <span key={k.key} className="inline-flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-sm" style={{ background: k.color }} />
            {k.name}
          </span>
        ))}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label="Table E9.6 as grouped bars: Nusselt numbers at Re = 50 000">
        {[0, 100, 200, 300].map((v) => (
          <g key={v}>
            <line x1={x0} x2={x1} y1={sy(v)} y2={sy(v)} stroke="var(--grid)" />
            <text x={x0 - 6} y={sy(v)} dy="0.32em" textAnchor="end" className="fill-ink-3 text-[11px]">
              {v}
            </text>
          </g>
        ))}
        <SvgLabel x={4} y={yt - 4} label="$\Nu$" size={13} w={30} h={20} />
        <line x1={x0} x2={x1} y1={yb} y2={yb} stroke="var(--axis)" />
        {TABLE_E96.map((row, gi) => {
          const cx = x0 + gw * (gi + 0.5)
          const start = cx - (3 * bw + 2 * gap) / 2
          return (
            <g key={row.Pr}>
              {KEYS.map((k, i) => {
                const val = row[k.key]
                const x = start + i * (bw + gap)
                const live = k.fn(50000, row.Pr)
                return (
                  <g key={k.key}>
                    <rect x={x} y={sy(val)} width={bw} height={yb - sy(val)} rx={3} fill={k.color} opacity={0.9}>
                      <title>{`${k.key} at Pr = ${row.Pr}: printed ${val}, recomputed ${live.toFixed(1)}`}</title>
                    </rect>
                    <text x={x + bw / 2} y={sy(val) - 5} textAnchor="middle" className="fill-ink text-[11px] font-semibold">
                      {val}
                    </text>
                    {overlay ? (
                      <g>
                        <line x1={x - 3} x2={x + bw + 3} y1={sy(live)} y2={sy(live)} stroke="var(--ink)" strokeWidth={2} />
                        <circle cx={x + bw / 2} cy={sy(live)} r={2.6} fill="var(--ink)" />
                      </g>
                    ) : null}
                  </g>
                )
              })}
              <text x={cx} y={yb + 18} textAnchor="middle" className="fill-ink text-[12px] font-semibold">
                {`Pr = ${row.Pr.toFixed(1)}`}
              </text>
              <text x={cx} y={yb + 34} textAnchor="middle" className="fill-ink-3 text-[10.5px]">
                {`RA ${fmtPct(pctDiff(row.RA, row.DB), 0)}`}
              </text>
              <text x={cx} y={yb + 48} textAnchor="middle" className="fill-ink-3 text-[10.5px]">
                {`PTA ${fmtPct(pctDiff(row.PTA, row.DB), 0)}`}
              </text>
            </g>
          )
        })}
      </svg>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-ink-3">
        <Md inline className="text-xs">{md`Percentages under each group: difference from the Dittus–Boelter value (printed numbers).`}</Md>
        <div className="min-w-[15rem]">
          <Toggle label="overlay recomputed values (ticks)" checked={overlay} onChange={setOverlay} />
        </div>
      </div>
    </div>
  )
}
