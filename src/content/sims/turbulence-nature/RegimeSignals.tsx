import { useMemo } from 'react'
import { useElementSize } from '@/kit'
import { makeTurbSignal } from './signal'

type Kind = 'damped' | 'periodic' | 'turbulent'

const N = 700

function trace(kind: Kind): number[] {
  const out: number[] = []
  if (kind === 'turbulent') {
    const s = makeTurbSignal({ seed: 31, f0: 2.5, fEta: 60, modes: 140 })
    const y = s.sample(N, 1 / N, 0.3)
    for (let i = 0; i < N; i++) out.push(1 + 0.11 * y[i])
    return out
  }
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1)
    if (kind === 'periodic') out.push(1 + 0.22 * Math.sin(2 * Math.PI * 8 * t))
    else {
      const tk = 0.25
      out.push(t < tk ? 1 : 1 + 0.3 * Math.exp(-(t - tk) / 0.05) * Math.sin((2 * Math.PI * (t - tk)) / 0.06))
    }
  }
  return out
}

function Trace({ kind }: { kind: Kind }) {
  const [ref, size] = useElementSize<HTMLDivElement>()
  const W = Math.max(240, size.width || 480)
  const H = 92
  const pad = { l: 26, r: 8, t: 8, b: 16 }
  const data = useMemo(() => trace(kind), [kind])
  const sx = (i: number) => pad.l + (i / (N - 1)) * (W - pad.l - pad.r)
  const sy = (v: number) => pad.t + (1 - (v - 0.55) / 0.9) * (H - pad.t - pad.b)
  let d = ''
  data.forEach((v, i) => {
    d += `${i ? 'L' : 'M'}${sx(i).toFixed(1)} ${sy(v).toFixed(1)}`
  })
  const color = kind === 'turbulent' ? 'var(--plot-4)' : kind === 'periodic' ? 'var(--plot-6)' : 'var(--plot-5)'
  return (
    <div ref={ref} className="w-full">
      <svg width={W} height={H} className="block max-w-full" role="img" aria-label={`velocity signal at a fixed point: ${kind}`}>
        <line x1={pad.l} x2={pad.l} y1={pad.t - 2} y2={H - pad.b} stroke="var(--axis)" />
        <line x1={pad.l} x2={W - pad.r} y1={H - pad.b} y2={H - pad.b} stroke="var(--axis)" />
        <text x={4} y={pad.t + 10} className="fill-ink-3 text-[11px] italic">v</text>
        <text x={W - pad.r} y={H - 3} textAnchor="end" className="fill-ink-3 text-[11px] italic">t</text>
        <line x1={pad.l} x2={W - pad.r} y1={sy(1)} y2={sy(1)} stroke="var(--ink-3)" strokeDasharray="5 4" strokeWidth={1} />
        <path d={d} fill="none" stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
        {kind === 'damped' ? (
          <g>
            <line x1={sx(0.25 * (N - 1))} x2={sx(0.25 * (N - 1))} y1={pad.t} y2={sy(1.14)} stroke="var(--ink-2)" strokeWidth={1.2} />
            <path d={`M${sx(0.25 * (N - 1)) - 4} ${sy(1.14)} l4 6 l4 -6z`} fill="var(--ink-2)" />
            <text x={sx(0.25 * (N - 1)) + 6} y={pad.t + 8} className="fill-ink-2 text-[10.5px]">disturbance</text>
          </g>
        ) : null}
        <text x={W - pad.r} y={sy(1) - 5} textAnchor="end" className="fill-ink-3 text-[10px]">mean</text>
      </svg>
    </div>
  )
}

const ROWS: { kind: Kind; title: string; text: string; verdict: string; tone: string }[] = [
  {
    kind: 'damped',
    title: 'Low Re — steady laminar',
    text: 'A small disturbance dies away: viscosity damps it.',
    verdict: 'not turbulent',
    tone: 'text-emerald-700 dark:text-emerald-300',
  },
  {
    kind: 'periodic',
    title: 'Moderate Re — unstable but laminar',
    text: 'e.g. Kármán vortex street behind a cylinder at Re = 100: unsteady, but perfectly regular and predictable.',
    verdict: 'not turbulent (no randomness)',
    tone: 'text-violet-700 dark:text-violet-300',
  },
  {
    kind: 'turbulent',
    title: 'High Re — turbulent',
    text: 'Random, irregular wiggles of many sizes — yet a steady, well-defined mean (dashed) still exists.',
    verdict: 'turbulent (Hinze’s definition)',
    tone: 'text-rose-700 dark:text-rose-300',
  },
]

/** Velocity at one fixed point in three regimes (schematic signals, supplementary). */
export function RegimeSignals() {
  return (
    <div className="space-y-3">
      {ROWS.map((r) => (
        <div key={r.kind} className="grid items-center gap-2 rounded-xl border border-line bg-surface p-3 sm:grid-cols-[minmax(0,15rem)_1fr]">
          <div>
            <div className="text-sm font-semibold text-ink">{r.title}</div>
            <div className="mt-0.5 text-[13px] leading-snug text-ink-2">{r.text}</div>
            <div className={`mt-1 text-xs font-bold uppercase tracking-wide ${r.tone}`}>{r.verdict}</div>
          </div>
          <Trace kind={r.kind} />
        </div>
      ))}
    </div>
  )
}
