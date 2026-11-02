import { useMemo, useRef, useState } from 'react'
import { Md, md, Toggle, useInView, usePrefersReducedMotion, useUid } from '@/kit'
import { bodyOutline, mirror, streamlineUpper, toPath, type Box, type Pt } from './halfbody'

/*
 * Recreation of the Lec 12 slide 17 right-hand panels: U = constant, increasing m.
 * Same window and the same oncoming streamlines in every panel; b = m/2πU grows with m.
 * The "rescale" toggle zooms each panel by its own b — the three pictures then coincide (self-similarity).
 */
const BASE_X: [number, number] = [-2.2, 4.3]
const BASE_Y: [number, number] = [-1.95, 1.95]
const K = 40 // px per unit at scale 1 in the 260×156 viewBox
const HEIGHTS = [0.12, 0.3, 0.52, 0.78, 1.08, 1.42, 1.8]
const PANELS = [
  { b: 0.2, label: md`$m = m_0$` },
  { b: 0.4, label: md`$m = 2m_0$` },
  { b: 0.8, label: md`$m = 4m_0$` },
]
const B_REF = 0.4

function Panel({ b, scaled, dash, label }: { b: number; scaled: boolean; dash?: string; label: string }) {
  const clip = useUid('incm')
  const s = scaled ? b / B_REF : 1
  const X: [number, number] = [BASE_X[0] * s, BASE_X[1] * s]
  const Y: [number, number] = [BASE_Y[0] * s, BASE_Y[1] * s]
  const kk = K / s
  const sx = (v: number) => (v - X[0]) * kk
  const sy = (v: number) => (Y[1] - v) * kk
  const geo = useMemo(() => {
    const box: Box = [X[0], X[1], Y[0], Y[1]]
    const step = 0.02 * s
    const lines: Pt[][] = []
    for (const a of HEIGHTS) {
      const up = streamlineUpper(b, a * s + Math.PI * b, box, step)
      lines.push(up, mirror(up))
    }
    return { lines, body: bodyOutline(b, X[1] + s, box, step) }
  }, [b, s]) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <figure className="min-w-0">
      <svg viewBox="0 0 260 156" className="block h-auto w-full rounded-lg border border-line" style={{ background: 'var(--field-bg)' }} role="img" aria-label={`Half-body for b = ${b}`}>
        <defs>
          <clipPath id={clip}>
            <rect x={0} y={0} width={260} height={156} />
          </clipPath>
        </defs>
        <g clipPath={`url(#${clip})`}>
          <path d={toPath(geo.body, sx, sy, true)} fill="var(--plot-1)" fillOpacity={0.22} stroke="var(--plot-1)" strokeWidth={1.6} />
          <line x1={0} y1={sy(0)} x2={sx(-b)} y2={sy(0)} stroke="var(--streamline)" strokeWidth={1.2} className={dash} />
          {geo.lines.map((p, i) => (
            <path key={i} d={toPath(p, sx, sy)} fill="none" stroke="var(--streamline)" strokeWidth={1.2} className={dash} />
          ))}
          <circle cx={sx(0)} cy={sy(0)} r={3} fill="var(--ink-2)" />
          <circle cx={sx(-b)} cy={sy(0)} r={2.6} fill="var(--plot-3)" stroke="var(--ink)" strokeWidth={0.8} />
        </g>
      </svg>
      <figcaption className="mt-1 text-center text-xs text-ink-2">
        <Md inline>{label}</Md>
        <span className="text-ink-3"> · b = {b.toFixed(1)} (nose at −b)</span>
      </figcaption>
    </figure>
  )
}

export function IncreasingM() {
  const [scaled, setScaled] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref)
  const reduced = usePrefersReducedMotion()
  const dash = inView && !reduced ? 'flow-dash' : undefined
  return (
    <div ref={ref} className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {PANELS.map((p) => (
          <Panel key={p.b} b={p.b} scaled={scaled} dash={dash} label={p.label} />
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface-2/60 px-3 py-2">
        <span className="text-sm font-semibold text-ink-2">
          U = constant, increasing m <span aria-hidden>→</span>
        </span>
        <div className="min-w-[15rem]">
          <Toggle label="zoom each panel by its own $b$" checked={scaled} onChange={setScaled} />
        </div>
      </div>
    </div>
  )
}
