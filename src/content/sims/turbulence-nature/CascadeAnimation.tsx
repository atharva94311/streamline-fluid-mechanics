import { useEffect, useMemo, useRef, useState } from 'react'
import { PlayPause, num, useElementSize, useInView, usePrefersReducedMotion, useUid } from '@/kit'

/**
 * Animated energy cascade (supplementary illustration of Wilkes Fig. 9.1 / Richardson's picture).
 * Each generation halves the eddy size; eddies spin faster as they get smaller (turnover rate ∝ size^(-2/3),
 * Kolmogorov scaling); energy "packets" enter from the mean flow at a steady rate and pass through every
 * generation at that same rate until viscosity turns them into heat at the Kolmogorov limit.
 */

const LEVELS = 5
const LABELS = ['large (≈ D)', 'medium', 'small', 'smaller', 'Kolmogorov limit']
const COLORS = ['var(--plot-1)', 'var(--plot-6)', 'var(--plot-8)', 'var(--plot-3)', 'var(--plot-4)']
const POOL = 36
const EMIT = 0.45
const TAU0 = 1.15

function spiral(r: number): string {
  const n = 30
  let d = ''
  for (let k = 0; k <= n; k++) {
    const th = (k / n) * 3.2 * Math.PI
    const rho = r * (0.15 + (0.8 * k) / n)
    d += `${k ? 'L' : 'M'}${(rho * Math.cos(th)).toFixed(2)} ${(rho * Math.sin(th)).toFixed(2)}`
  }
  return d
}

interface Packet {
  alive: boolean
  level: number
  idx: number
  t: number
  dur: number
  x0: number
  y0: number
  x1: number
  y1: number
}

export function CascadeAnimation() {
  const [ref, size] = useElementSize<HTMLDivElement>()
  const inView = useInView(ref)
  const reduced = usePrefersReducedMotion()
  const [playing, setPlaying] = useState(true)
  const gradId = useUid('tnheat')
  useEffect(() => {
    if (reduced) setPlaying(false)
  }, [reduced])

  const W = Math.max(300, Math.round(size.width || 640))
  const wide = W >= 520
  const labW = wide ? 128 : 0
  const x0 = labW + 8
  const x1 = W - (wide ? 70 : 8)
  const H = 412
  const yLevel = (n: number) => 54 + 70 * n
  const R0 = Math.min(44, (x1 - x0) / 6)
  const rad = (n: number) => R0 / 2 ** n
  const ex = (n: number, i: number) => x0 + ((i + 0.5) * (x1 - x0)) / 2 ** n
  const heatY = yLevel(LEVELS - 1) + 36

  const eddies = useMemo(() => {
    const out: { n: number; i: number; x: number; y: number; r: number }[] = []
    for (let n = 0; n < LEVELS; n++) for (let i = 0; i < 2 ** n; i++) out.push({ n, i, x: ex(n, i), y: yLevel(n), r: rad(n) })
    return out
  }, [W]) // eslint-disable-line react-hooks/exhaustive-deps
  const spirals = useMemo(() => Array.from({ length: LEVELS }, (_, n) => spiral(rad(n) * 0.92)), [W]) // eslint-disable-line react-hooks/exhaustive-deps

  const spinRefs = useRef<(SVGGElement | null)[]>([])
  const dotRefs = useRef<(SVGCircleElement | null)[]>([])
  const rateRefs = useRef<(SVGTextElement | null)[]>([])

  useEffect(() => {
    if (!playing || !inView || typeof requestAnimationFrame === 'undefined') return
    const rand = num.seededRandom(5)
    const packets: Packet[] = Array.from({ length: POOL }, () => ({ alive: false, level: -1, idx: 0, t: 0, dur: 1, x0: 0, y0: 0, x1: 0, y1: 0 }))
    const arrivals: number[][] = Array.from({ length: LEVELS + 1 }, () => [])
    let clock = 0
    let emitAcc = EMIT
    let rateAcc = 0
    let raf = 0
    let last = performance.now()
    const hop = (p: Packet) => {
      // arrive at next level
      const n = p.level + 1
      arrivals[Math.min(n, LEVELS)].push(clock)
      if (n >= LEVELS) {
        p.alive = false
        return
      }
      const child = n === 0 ? 0 : 2 * p.idx + (rand() < 0.5 ? 0 : 1)
      p.level = n
      p.idx = child
      p.x0 = ex(n, child)
      p.y0 = yLevel(n)
      if (n + 1 < LEVELS) {
        const c2 = 2 * child + (rand() < 0.5 ? 0 : 1)
        p.x1 = ex(n + 1, c2)
        p.y1 = yLevel(n + 1)
      } else {
        p.x1 = p.x0 + (rand() - 0.5) * 16
        p.y1 = heatY
      }
      p.t = 0
      p.dur = TAU0 * 2 ** ((-2 * n) / 3)
    }
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      clock += dt
      for (const e of eddies) {
        const g = spinRefs.current[e.n * 32 + e.i]
        if (!g) continue
        const w = 0.7 * 2 ** ((2 * e.n) / 3) * (e.i % 2 ? 1 : -1)
        g.setAttribute('transform', `translate(${e.x.toFixed(1)},${e.y.toFixed(1)}) rotate(${((w * clock * 180) / Math.PI) % 360})`)
      }
      emitAcc += dt
      if (emitAcc >= EMIT) {
        emitAcc -= EMIT
        const p = packets.find((q) => !q.alive)
        if (p) {
          p.alive = true
          p.level = -1
          p.idx = 0
          p.x0 = x0
          p.y0 = yLevel(0)
          p.x1 = ex(0, 0)
          p.y1 = yLevel(0)
          p.t = 0
          p.dur = 1.0
        }
      }
      packets.forEach((p, k) => {
        const el = dotRefs.current[k]
        if (p.alive) {
          p.t += dt
          if (p.t >= p.dur) hop(p)
        }
        if (!el) return
        if (!p.alive) {
          el.setAttribute('opacity', '0')
          return
        }
        const f = Math.min(1, p.t / p.dur)
        const s = f * f * (3 - 2 * f)
        el.setAttribute('cx', (p.x0 + (p.x1 - p.x0) * s).toFixed(1))
        el.setAttribute('cy', (p.y0 + (p.y1 - p.y0) * s).toFixed(1))
        el.setAttribute('opacity', p.level >= LEVELS - 1 ? (1 - 0.7 * f).toFixed(2) : '1')
        el.setAttribute('fill', p.level >= LEVELS - 1 ? 'var(--plot-4)' : 'var(--plot-3)')
      })
      rateAcc += dt
      if (rateAcc > 0.5) {
        rateAcc = 0
        for (let n = 0; n <= LEVELS; n++) {
          const a = arrivals[n]
          while (a.length && a[0] < clock - 8) a.shift()
          const el = rateRefs.current[n]
          if (el) el.textContent = clock > 10 ? `${(a.length / 8).toFixed(1)}/s` : '…'
        }
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [playing, inView, eddies]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div ref={ref} className="w-full">
      <svg width={W} height={H} className="block max-w-full" role="img" aria-label="Animated energy cascade: large eddies break into smaller ones down to the Kolmogorov limit">
        <defs>
          <linearGradient id={gradId} x1="0" x2="1">
            <stop offset="0" stopColor="var(--plot-3)" stopOpacity={0.25} />
            <stop offset="1" stopColor="var(--plot-4)" stopOpacity={0.3} />
          </linearGradient>
        </defs>
        <text x={x0} y={16} className="fill-ink-2 text-[11.5px] font-semibold">
          mean flow → (pressure energy)
        </text>
        <line x1={x0} x2={ex(0, 0) - rad(0) - 4} y1={yLevel(0)} y2={yLevel(0)} stroke="var(--plot-5)" strokeWidth={3} />
        <path d={`M${ex(0, 0) - rad(0) - 12} ${yLevel(0) - 6} l10 6 l-10 6z`} fill="var(--plot-5)" />
        {eddies.map((e) =>
          e.n + 1 < LEVELS ? (
            <g key={`c${e.n}-${e.i}`} stroke="var(--line)" strokeWidth={1.2}>
              <line x1={e.x} y1={e.y + e.r} x2={ex(e.n + 1, 2 * e.i)} y2={yLevel(e.n + 1) - rad(e.n + 1)} />
              <line x1={e.x} y1={e.y + e.r} x2={ex(e.n + 1, 2 * e.i + 1)} y2={yLevel(e.n + 1) - rad(e.n + 1)} />
            </g>
          ) : null,
        )}
        {eddies.map((e) => (
          <g key={`e${e.n}-${e.i}`}>
            <circle cx={e.x} cy={e.y} r={e.r} fill={COLORS[e.n]} fillOpacity={0.12} stroke={COLORS[e.n]} strokeWidth={e.n > 2 ? 1 : 1.6} />
            <g
              ref={(el) => {
                spinRefs.current[e.n * 32 + e.i] = el
              }}
              transform={`translate(${e.x.toFixed(1)},${e.y.toFixed(1)})`}
            >
              <path d={spirals[e.n]} fill="none" stroke={COLORS[e.n]} strokeWidth={e.n > 2 ? 1 : 1.8} strokeLinecap="round" />
            </g>
          </g>
        ))}
        <rect x={x0 - 4} y={heatY - 12} width={x1 - x0 + 8} height={26} rx={8} fill={`url(#${gradId})`} />
        <text x={(x0 + x1) / 2} y={heatY + 5} textAnchor="middle" className="fill-ink text-[12px] font-semibold">
          heat — viscosity converts the mechanical energy
        </text>
        {Array.from({ length: POOL }, (_, k) => (
          <circle
            key={`p${k}`}
            ref={(el) => {
              dotRefs.current[k] = el
            }}
            r={3.2}
            cx={0}
            cy={0}
            opacity={0}
            fill="var(--plot-3)"
            stroke="var(--surface)"
            strokeWidth={1}
          />
        ))}
        {LABELS.map((l, n) => (
          <g key={l}>
            <text
              x={wide ? 8 : 6}
              y={wide ? yLevel(n) + 4 : n === 0 ? yLevel(0) + 24 : n === 1 ? yLevel(1) + 4 : yLevel(n) - rad(n) - 8}
              className="fill-ink-2 text-[11.5px] font-semibold"
            >
              {l}
            </text>
            {wide ? (
              <text x={8} y={yLevel(n) + 19} className="fill-ink-3 text-[10.5px]">
                {n === 0 ? `1 eddy` : `${2 ** n} eddies (×${8 ** n} in 3-D)`}
              </text>
            ) : null}
            {wide ? (
              <text
                ref={(el) => {
                  rateRefs.current[n] = el
                }}
                x={W - 8}
                y={yLevel(n) + 4}
                textAnchor="end"
                className="fill-ink-3 font-mono text-[11px]"
              >
                …
              </text>
            ) : null}
          </g>
        ))}
        {wide ? (
          <text
            ref={(el) => {
              rateRefs.current[LEVELS] = el
            }}
            x={W - 8}
            y={heatY + 5}
            textAnchor="end"
            className="fill-ink-3 font-mono text-[11px]"
          >
            …
          </text>
        ) : null}
        {wide ? (
          <text x={W - 8} y={22} textAnchor="end" className="fill-ink-3 text-[10.5px]">
            packets/s
          </text>
        ) : null}
      </svg>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <PlayPause playing={playing} onToggle={() => setPlaying((p) => !p)} />
        <span className="text-[13px] text-ink-2">
          Size halves at every step; smaller eddies spin faster. Count the orange packets: the same number per second passes every level — the energy
          flux down the cascade is constant.
        </span>
      </div>
    </div>
  )
}
