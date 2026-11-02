import { useRef, useState } from 'react'
import { PlayPause, Segmented, num, useAnimationFrame, useInView, usePrefersReducedMotion } from '@/kit'
import { Arrow, Label } from './svg'

const N = 110
const R0 = 12
const R1 = 134
/** d(r²)/dt / 2 in px²/s: radial speed = RATE / r (px/s), i.e. v_r ∝ 1/r exactly as for a line source. */
const RATE = 950

/**
 * Fluid particles leaving a line source (or converging on a sink). Each dot moves with v_r ∝ 1/r, so dots slow
 * down as they spread out — yet they stay evenly spaced, because the fluid is incompressible.
 * Supplementary intuition builder; pauses off-screen and respects reduced motion.
 */
export function RadialParticles() {
  const [sink, setSink] = useState(false)
  const [playing, setPlaying] = useState(true)
  const wrap = useRef<HTMLDivElement>(null)
  const inView = useInView(wrap)
  const reduced = usePrefersReducedMotion()
  const [parts] = useState(() => {
    const rand = num.seededRandom(11)
    // uniform in r² = uniform areal density (the steady state of an incompressible radial flow)
    return Array.from({ length: N }, () => ({ th: rand() * 2 * Math.PI, r2: R0 * R0 + rand() * (R1 * R1 - R0 * R0) }))
  })
  const dots = useRef<(SVGCircleElement | null)[]>([])
  const O = { x: 150, y: 150 }
  const span = R1 * R1 - R0 * R0

  useAnimationFrame(
    (dt) => {
      const d = 2 * RATE * dt * (sink ? -1 : 1)
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i]
        p.r2 += d
        if (p.r2 > R1 * R1) p.r2 -= span
        if (p.r2 < R0 * R0) p.r2 += span
        const el = dots.current[i]
        if (el) {
          const r = Math.sqrt(p.r2)
          el.setAttribute('cx', (O.x + r * Math.cos(p.th)).toFixed(2))
          el.setAttribute('cy', (O.y - r * Math.sin(p.th)).toFixed(2))
        }
      }
    },
    playing && inView && !reduced,
  )

  const rings = [40, 80, 120]
  const len = [33, 16.5, 11]
  return (
    <div ref={wrap} className="space-y-3">
      <svg viewBox="0 0 300 300" className="mx-auto block h-auto w-full max-w-[380px]" role="img" aria-label="Animated fluid particles around a line source or sink">
        {rings.map((r, i) => (
          <g key={r}>
            <circle cx={O.x} cy={O.y} r={r} fill="none" stroke="var(--equipotential)" strokeWidth={1.1} strokeDasharray="5 4" opacity={0.85} />
            <Label x={O.x - r * 0.7071 - 4} y={O.y + r * 0.7071 + 14} anchor="end" size={11} italic>
              {['r', '2r', '3r'][i]}
            </Label>
          </g>
        ))}
        {parts.map((p, i) => {
          const r = Math.sqrt(p.r2)
          return (
            <circle
              key={i}
              ref={(el) => {
                dots.current[i] = el
              }}
              cx={O.x + r * Math.cos(p.th)}
              cy={O.y - r * Math.sin(p.th)}
              r={2.6}
              fill="var(--plot-2)"
              opacity={0.9}
            />
          )
        })}
        {rings.map((r, i) => {
          const a = sink ? r + len[i] : r
          const b = sink ? r : r + len[i]
          return <Arrow key={`v${r}`} x1={O.x + a} y1={O.y} x2={O.x + b} y2={O.y} color="var(--plot-4)" width={2.4} head={7} />
        })}
        {rings.map((r, i) => (
          <Label key={`t${r}`} x={O.x + r + len[i] / 2} y={O.y - 9} anchor="middle" size={11} weight={600} color="var(--plot-4)">
            {['v', 'v/2', 'v/3'][i]}
          </Label>
        ))}
        <circle cx={O.x} cy={O.y} r={5} fill="var(--surface)" stroke="var(--plot-4)" strokeWidth={2} />
        <text x={8} y={18} fontSize={11.5} fontWeight={600} fill="var(--ink)">
          same m through every circle: 2πr · v<tspan dy={3} fontSize={8.5}>r</tspan>
          <tspan dy={-3}> = m</tspan>
        </text>
      </svg>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <div className="w-full max-w-[17rem]">
          <Segmented
            options={[
              { value: 'source', label: 'Source ($m>0$)' },
              { value: 'sink', label: 'Sink ($m<0$)' },
            ]}
            value={sink ? 'sink' : 'source'}
            onChange={(v) => setSink(v === 'sink')}
          />
        </div>
        {!reduced ? <PlayPause playing={playing} onToggle={() => setPlaying((p) => !p)} /> : <span className="text-xs text-ink-3">Animation off (reduced-motion setting).</span>}
      </div>
    </div>
  )
}
