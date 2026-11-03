/**
 * Animated recreation of the idea behind Fox Fig. 7.4 (a photograph): a smoke streakline released upstream of a
 * full-size car follows the body contour over the bonnet, windscreen and roof. Schematic (not a flow solution).
 */
import { useMemo, useRef, useState } from 'react'
import { PlayPause, num, useAnimationFrame, useInView, usePrefersReducedMotion } from '@/kit'
import { Tx } from './svg'

const CAR =
  'M40,150 L40,128 C40,118 52,112 70,110 L150,104 C175,90 200,72 232,66 L330,64 C352,64 372,80 392,100 L430,108 C446,111 452,120 452,132 L452,150 Z'

/** Streakline path (polyline) hugging the body: approaches, rises over the bonnet/windscreen, rides the roof, separates. */
const PATH: [number, number][] = [
  [0, 112], [20, 108], [36, 100], [60, 94], [110, 90], [150, 86], [175, 74], [200, 60], [232, 52], [280, 49], [330, 50],
  [360, 58], [392, 74], [420, 86], [450, 92], [480, 96],
]

function cumulative(p: [number, number][]) {
  const s = [0]
  for (let i = 1; i < p.length; i++) s.push(s[i - 1] + Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]))
  return s
}

export function SmokeStreak() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref)
  const reduced = usePrefersReducedMotion()
  const [playing, setPlaying] = useState(true)
  const [t, setT] = useState(0)
  useAnimationFrame((dt) => setT((v) => v + dt), playing && inView && !reduced)

  const cum = useMemo(() => cumulative(PATH), [])
  const total = cum[cum.length - 1]
  const at = (s: number): [number, number] => {
    const d = ((s % total) + total) % total
    let i = 1
    while (i < cum.length - 1 && cum[i] < d) i++
    const f = (d - cum[i - 1]) / (cum[i] - cum[i - 1])
    return [num.lerp(PATH[i - 1][0], PATH[i][0], f), num.lerp(PATH[i - 1][1], PATH[i][1], f)]
  }
  const rand = useMemo(() => {
    const r = num.seededRandom(7)
    return Array.from({ length: 70 }, () => [r() - 0.5, r() - 0.5, r()])
  }, [])
  const N = 70
  const speed = 120 // px/s along path

  return (
    <div ref={ref} className="space-y-2">
      <svg viewBox="0 0 480 170" className="h-auto w-full" role="img" aria-label="Smoke streakline flowing over a car in a wind tunnel">
        <rect x={0} y={0} width={480} height={170} fill="var(--field-bg)" />
        <line x1={0} y1={151} x2={480} y2={151} stroke="var(--ink-3)" strokeWidth={1.5} />
        {/* faint guide of the streakline */}
        <polyline points={PATH.map((p) => p.join(',')).join(' ')} fill="none" stroke="var(--ink-3)" strokeOpacity={0.25} strokeWidth={6} strokeLinecap="round" />
        {/* smoke puffs */}
        {rand.map(([a, b, c], i) => {
          const s = (i / N) * total + t * speed
          const d = ((s % total) + total) % total
          const [x, y] = at(s)
          const spread = 1 + (d / total) * 7 // diffuses downstream
          const sep = x > 395 ? (x - 395) * 0.12 : 0 // wake: widens after separation
          return (
            <circle
              key={i}
              cx={x + a * spread * 2}
              cy={y + b * (spread + sep) * 2}
              r={3 + (d / total) * 3 + c}
              fill="var(--ink-3)"
              fillOpacity={0.55 - (d / total) * 0.35}
            />
          )
        })}
        {/* smoke wand */}
        <line x1={0} y1={112} x2={14} y2={112} stroke="var(--ink-2)" strokeWidth={3} />
        <path d={CAR} fill="var(--body-fill)" stroke="var(--ink-2)" strokeWidth={1.6} />
        <circle cx={110} cy={150} r={16} fill="var(--ink-2)" />
        <circle cx={385} cy={150} r={16} fill="var(--ink-2)" />
        <path d="M168,100 L232,72 L262,72 L262,100 Z" fill="var(--surface)" fillOpacity={0.7} stroke="var(--ink-3)" />
        <Tx x={6} y={18} size={12} cls="fill-ink-3">
          wind →  (smoke released upstream)
        </Tx>
      </svg>
      <div className="flex items-center justify-between gap-2 text-xs text-ink-3">
        <span>Schematic streakline (illustrative, not a computed flow).</span>
        <PlayPause playing={playing} onToggle={() => setPlaying((p) => !p)} />
      </div>
    </div>
  )
}
