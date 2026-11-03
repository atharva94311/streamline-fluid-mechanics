/**
 * "Exponent walk": for each basic dimension, every factor of a product moves the running exponent along a number
 * line by (its exponent in the product) × (its own dimension exponent). A product is dimensionless when every walk
 * ends back at 0 — exactly the bookkeeping of Lecture 13 slide 4 (and slide 16 in MLT).
 */
import { Fragment } from 'react'
import { M, cx } from '@/kit'
import { dimLetters, type Dim3, type DimSystem } from './data'
import { Arrow } from './svg'

export interface WalkFactor {
  /** TeX of the factor as it appears in the product, e.g. '\\rho^{-1}'. */
  tex: string
  /** Its exponents (in the chosen system) multiplied by the power it is raised to. */
  contrib: Dim3
  color: string
}

const W = 420
const X0 = 46
const X1 = 340
const ROW_TOP = 8

export function ExponentWalk({ factors, sys, caption }: { factors: WalkFactor[]; sys: DimSystem; caption?: string }) {
  const letters = dimLetters(sys)
  // range of the number line: cover every partial sum, at least ±4
  let R = 4
  for (let k = 0; k < 3; k++) {
    let s = 0
    for (const f of factors) {
      s += f.contrib[k]
      R = Math.max(R, Math.ceil(Math.abs(s)))
    }
  }
  R = Math.min(R, 12)
  const sx = (v: number) => X0 + ((v + R) / (2 * R)) * (X1 - X0)
  const rows = [0, 1, 2].map((k) => {
    const arrows: { from: number; to: number; color: string; c: number }[] = []
    let s = 0
    for (const f of factors) {
      const c = f.contrib[k]
      if (Math.abs(c) < 1e-9) continue
      arrows.push({ from: s, to: s + c, color: f.color, c })
      s += c
    }
    return { k, arrows, net: Math.round(s * 1000) / 1000 }
  })
  const rowH = rows.map((r) => 34 + Math.max(1, r.arrows.length) * 12)
  const H = rowH.reduce((a, b) => a + b, 0) + ROW_TOP + 6
  let y = ROW_TOP

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        {factors.map((f, i) => (
          <span key={i} className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-5 rounded-full" style={{ background: f.color }} aria-hidden />
            <M tex={f.tex} />
          </span>
        ))}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={caption ?? 'exponent bookkeeping for each basic dimension'}>
        {rows.map((r) => {
          const top = y
          const h = rowH[r.k]
          y += h
          const axisY = top + h - 16
          const ok = Math.abs(r.net) < 1e-9
          return (
            <g key={r.k}>
              <text x={8} y={axisY + 4} className="fill-ink text-[16px] font-bold" style={{ fontFamily: 'var(--font-sans)' }}>
                {letters[r.k]}
              </text>
              <line x1={X0} x2={X1} y1={axisY} y2={axisY} stroke="var(--axis)" strokeOpacity={0.6} />
              {Array.from({ length: 2 * R + 1 }, (_, i) => i - R).map((v) => (
                <Fragment key={v}>
                  <line x1={sx(v)} x2={sx(v)} y1={axisY - (v === 0 ? 5 : 3)} y2={axisY + (v === 0 ? 5 : 3)} stroke="var(--axis)" strokeOpacity={v === 0 ? 0.9 : 0.5} />
                  {v === 0 || v === -R || v === R || (R <= 6 && v % 2 === 0) ? (
                    <text x={sx(v)} y={axisY + 13} textAnchor="middle" className="fill-ink-3 text-[10px]">
                      {v < 0 ? `−${-v}` : v}
                    </text>
                  ) : null}
                </Fragment>
              ))}
              {r.arrows.map((a, i) => {
                const ay = top + 12 + i * 12
                return (
                  <g key={i}>
                    <line x1={sx(a.from)} x2={sx(a.from)} y1={ay} y2={axisY} stroke={a.color} strokeOpacity={0.25} strokeDasharray="2 2" />
                    <Arrow x1={sx(a.from)} y1={ay} x2={sx(a.to)} y2={ay} color={a.color} width={2.6} head={6} />
                    <text
                      x={(sx(a.from) + sx(a.to)) / 2}
                      y={ay - 3}
                      textAnchor="middle"
                      className="fill-ink-2 text-[10px] font-semibold"
                    >
                      {a.c > 0 ? `+${a.c}` : `−${-a.c}`}
                    </text>
                  </g>
                )
              })}
              <circle cx={sx(r.net)} cy={axisY} r={5} fill={ok ? 'var(--plot-5)' : 'var(--plot-4)'} stroke="var(--surface)" strokeWidth={1.2} />
              <text x={X1 + 12} y={axisY + 4} className={cx('text-[12px] font-semibold', ok ? 'fill-emerald-600 dark:fill-emerald-400' : 'fill-rose-600 dark:fill-rose-400')}>
                net {letters[r.k]}: {r.net < 0 ? `−${-r.net}` : r.net}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
