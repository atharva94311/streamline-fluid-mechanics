import { useMemo, useState } from 'react'
import { Slider, md, useElementSize, useUid } from '@/kit'
import { envelope, makeTurbSignal } from './signal'
import { TeXLabel } from './TeXLabel'

/**
 * Wilkes Fig. 9.3 (p. 483) recreated with a working "magnifying glass": the instantaneous v_x(t)
 * fluctuates about the dashed mean; the lens inset reproduces the book's magnified view, and
 * increasing the magnification reveals ever finer "fuzziness" until, below the smallest-eddy
 * time scale (the Kolmogorov limit), the trace finally looks smooth.
 * Numbers (v̄_x = 2 m/s, 5 % intensity, finest wiggles ≈ 2.5 ms) are illustrative, not from the book.
 */

const VBAR = 2.0
const AMP = 0.1
const TMAX = 1.0
const SIG = makeTurbSignal({ seed: 21, f0: 8, fEta: 400, fMin: 0.5, modes: 170 })
const NS = 4000
const DT = TMAX / NS
const v = (t: number) => VBAR + AMP * SIG.at(t)

export function Fig93Magnifier() {
  const [ref, size] = useElementSize<HTMLDivElement>()
  const [tc, setTc] = useState(0.43)
  const [M, setM] = useState(4)
  const clip = useUid('f93')
  const W = Math.max(300, Math.round(size.width || 640))
  const H = 310
  const m = { l: 46, r: 12, t: 14, b: 36 }
  const iw = W - m.l - m.r
  const ih = H - m.t - m.b
  const sx = (t: number) => m.l + (t / TMAX) * iw
  const sy = (val: number) => m.t + (1 - val / 2.5) * ih

  const samples = useMemo(() => {
    const y = SIG.sample(NS, DT, 0)
    for (let i = 0; i < NS; i++) y[i] = VBAR + AMP * y[i]
    return y
  }, [])
  const path = useMemo(() => {
    const pts = envelope(samples, 0, NS, Math.max(100, Math.round(iw)))
    return pts.map(([i, val], k) => `${k ? 'L' : 'M'}${sx(i * DT).toFixed(1)} ${sy(val).toFixed(1)}`).join('')
  }, [samples, iw]) // eslint-disable-line react-hooks/exhaustive-deps

  const rl = 18
  const ri = Math.max(48, Math.min(80, iw * 0.2, ih * 0.33))
  const icx = m.l + iw - ri - 12
  const icy = m.t + ih - ri - 8
  const span = ((2 * rl) / iw) * TMAX / M
  const N = 220
  const inset = useMemo(() => {
    const out: number[] = []
    for (let k = 0; k < N; k++) out.push(v(tc - span / 2 + (k * span) / (N - 1)))
    return out
  }, [tc, span])
  let lo = Math.min(...inset)
  let hi = Math.max(...inset)
  const half = Math.max((hi - lo) / 2, 1e-6)
  const mid = (hi + lo) / 2
  lo = mid - half * 1.35
  hi = mid + half * 1.35
  const ix = (k: number) => icx - ri + (k / (N - 1)) * 2 * ri
  const iy = (val: number) => icy + ri - ((val - lo) / (hi - lo)) * 2 * ri * 0.86 - ri * 0.07
  const insetPath = inset.map((val, k) => `${k ? 'L' : 'M'}${ix(k).toFixed(1)} ${iy(val).toFixed(1)}`).join('')
  let extrema = 0
  const tol = (inset.length ? Math.max(...inset) - Math.min(...inset) : 0) * 1e-3
  let lastSign = 0
  for (let k = 1; k < N; k++) {
    const d = inset[k] - inset[k - 1]
    if (Math.abs(d) < tol * 0.01) continue
    const sgn = Math.sign(d)
    if (lastSign && sgn !== lastSign) extrema++
    lastSign = sgn
  }
  const smooth = extrema <= 1
  const vc = v(tc)
  const lensX = sx(tc)
  const lensY = sy(vc)
  const meanInInset = VBAR >= lo && VBAR <= hi

  const onPointer = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.type === 'pointermove' && e.buttons !== 1) return
    const r = e.currentTarget.getBoundingClientRect()
    const t = ((e.clientX - r.left - m.l) / iw) * TMAX
    setTc(Math.min(0.97, Math.max(0.03, t)))
  }

  const xticks = [0, 0.2, 0.4, 0.6, 0.8, 1.0]
  const yticks = [0, 0.5, 1, 1.5, 2, 2.5]
  const spanText = span >= 1e-3 ? `${(span * 1e3).toPrecision(3)} ms` : `${(span * 1e6).toPrecision(3)} µs`

  return (
    <div ref={ref} className="w-full">
      <svg
        width={W}
        height={H}
        className="block max-w-full cursor-ew-resize select-none"
        style={{ touchAction: 'pan-y' }}
        onPointerDown={onPointer}
        onPointerMove={onPointer}
        role="img"
        aria-label="Instantaneous velocity versus time with a movable magnifying lens"
      >
        <defs>
          <clipPath id={clip}>
            <circle cx={icx} cy={icy} r={ri - 1} />
          </clipPath>
        </defs>
        {yticks.map((y) => (
          <g key={`y${y}`}>
            <line x1={m.l} x2={m.l + iw} y1={sy(y)} y2={sy(y)} stroke="var(--grid)" />
            <text x={m.l - 6} y={sy(y)} dy="0.32em" textAnchor="end" className="fill-ink-3 text-[11px]">
              {y}
            </text>
          </g>
        ))}
        {xticks.map((x) => (
          <text key={`x${x}`} x={sx(x)} y={m.t + ih + 15} textAnchor="middle" className="fill-ink-3 text-[11px]">
            {Math.round(x * 1000)}
          </text>
        ))}
        <line x1={m.l} x2={m.l} y1={m.t} y2={m.t + ih} stroke="var(--axis)" />
        <line x1={m.l} x2={m.l + iw} y1={m.t + ih} y2={m.t + ih} stroke="var(--axis)" />
        <text x={m.l + iw} y={H - 4} textAnchor="end" className="fill-ink-2 text-[11.5px] font-medium">
          t (ms)
        </text>
        <text x={4} y={m.t + 4} className="fill-ink-2 text-[11.5px] font-medium">
          vₓ (m/s)
        </text>
        <line x1={m.l} x2={m.l + iw} y1={sy(VBAR)} y2={sy(VBAR)} stroke="var(--ink-3)" strokeDasharray="6 5" />
        <TeXLabel x={m.l + 4} y={sy(VBAR) + 13} tex={md`\overline{v}_x`} w={40} />
        <path d={path} fill="none" stroke="var(--plot-1)" strokeWidth={1.1} strokeLinejoin="round" />
        <line x1={lensX} x2={lensX} y1={sy(VBAR)} y2={lensY} stroke="var(--plot-4)" strokeWidth={2} />
        <circle cx={lensX} cy={lensY} r={rl} fill="var(--plot-3)" fillOpacity={0.12} stroke="var(--plot-3)" strokeWidth={2} />
        <TeXLabel x={lensX + rl + 4} y={(sy(VBAR) + lensY) / 2 + (vc > VBAR ? -10 : 10)} tex={md`v_x'`} w={36} />
        {lensX < icx - ri - 14 ? (
          <g>
            <path d={`M${lensX} ${lensY + rl} Q ${lensX} ${icy} ${icx - ri - 2} ${icy}`} fill="none" stroke="var(--ink-3)" strokeWidth={1.4} />
            <path d={`M${icx - ri - 2} ${icy} l-9 -5 l0 10z`} fill="var(--ink-3)" />
          </g>
        ) : (
          <g>
            <path d={`M${lensX} ${lensY + rl} Q ${lensX} ${icy - ri - 6} ${icx} ${icy - ri - 2}`} fill="none" stroke="var(--ink-3)" strokeWidth={1.4} />
            <path d={`M${icx} ${icy - ri - 2} l-5 -9 l10 0z`} fill="var(--ink-3)" />
          </g>
        )}
        <circle cx={icx} cy={icy} r={ri} fill="var(--surface)" stroke="var(--plot-3)" strokeWidth={2.2} />
        <g clipPath={`url(#${clip})`}>
          {meanInInset ? (
            <line x1={icx - ri} x2={icx + ri} y1={iy(VBAR)} y2={iy(VBAR)} stroke="var(--ink-3)" strokeDasharray="5 4" />
          ) : null}
          <path d={insetPath} fill="none" stroke="var(--plot-1)" strokeWidth={1.8} strokeLinejoin="round" />
          <line x1={icx} x2={icx} y1={icy - ri} y2={icy + ri} stroke="var(--plot-3)" strokeOpacity={0.35} strokeDasharray="2 3" />
        </g>
        <text x={icx - ri - 8} y={icy + ri - 16} textAnchor="end" className="fill-ink-2 text-[11px] font-semibold">
          lens ×{M < 10 ? M.toFixed(1) : Math.round(M)}
        </text>
        <text x={icx - ri - 8} y={icy + ri - 2} textAnchor="end" className="fill-ink-3 text-[11px]">
          window {spanText}
        </text>
      </svg>
      <div className="mt-2 grid gap-3 sm:grid-cols-2">
        <Slider label="magnifying power" value={M} min={1} max={256} log onChange={setM} digits={3} format={(x) => `×${x < 10 ? x.toFixed(1) : Math.round(x)}`} />
        <Slider label="lens position $t$" value={tc * 1000} min={30} max={970} step={1} onChange={(x) => setTc(x / 1000)} unit="ms" digits={3} />
      </div>
      <div
        className={`mt-2 rounded-xl px-3 py-2 text-[13px] ${smooth ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200' : 'bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-200'}`}
      >
        {smooth
          ? `Smooth: the ${spanText} window is shorter than the fastest fluctuation (≈ 2.5 ms here) — the "Kolmogorov limit" of the cascade has been reached.`
          : `Still fuzzy: ${extrema} wiggles inside a ${spanText} window — smaller eddies are still showing up. Keep magnifying.`}
      </div>
    </div>
  )
}
