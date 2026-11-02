import { useMemo, useRef, useState } from 'react'
import { Md, PlayPause, Slider, md, num, useAnimationFrame, useInView, usePrefersReducedMotion, useUid } from '@/kit'
import { REGIME_LABEL, uPlusRough, uPlusThree, wallRegime, type WallRegime } from './laws'

const VW = 600
const N_ELEM = 15
const N_PART = 42

interface Elem {
  xc: number
  hw: number
  h: number
}

/**
 * Schematic close-up of a pipe wall in wall units (y⁺ = y v̄z* / ν): roughness elements of height ε⁺ drawn against
 * the viscous sublayer (y⁺ < 5), the buffer layer (5–30) and the turbulent core. Tracer dots move with the local
 * mean velocity (three-piece smooth law, or the completely rough law (9.69) once it is lower), with random
 * vertical "eddy" motion outside the sublayer. Animation pauses off-screen and respects reduced motion.
 */
export function WallCloseUp({
  epsPlus,
  animate = true,
  compact = false,
  playing = true,
  tracers = true,
}: {
  epsPlus: number
  animate?: boolean
  compact?: boolean
  playing?: boolean
  tracers?: boolean
}) {
  const markerId = useUid('ffwake')
  const VH = compact ? 200 : 280
  const left = 46
  const right = 10
  const top = 14
  const wallH = compact ? 16 : 22
  const plotW = VW - left - right
  const base = VH - wallH
  const plotH = base - top
  const Ymax = epsPlus < 22 ? 40 : Math.min(900, epsPlus * 1.8)
  const sy = (yp: number) => base - (Math.min(yp, Ymax) / Ymax) * plotH

  const elems = useMemo<Elem[]>(() => {
    const rnd = num.seededRandom(11)
    const w = plotW / N_ELEM
    const raw = Array.from({ length: N_ELEM }, (_, i) => ({
      xc: left + w * (i + 0.5) + (rnd() - 0.5) * w * 0.3,
      hw: w * (0.3 + 0.14 * rnd()),
      h: 0.55 + 0.45 * rnd(),
    }))
    const hmax = Math.max(...raw.map((e) => e.h))
    return raw.map((e) => ({ ...e, h: e.h / hmax }))
  }, [plotW])

  const localH = (x: number): number => {
    let h = 0
    for (const e of elems) {
      const s = (x - e.xc) / e.hw
      if (s > -1 && s < 1) h = Math.max(h, e.h * epsPlus * (1 - s * s))
    }
    return h
  }

  const uAt = (yp: number): number => {
    const s = uPlusThree(yp)
    if (epsPlus <= 3.32) return s
    const r = uPlusRough(Math.max(yp, 1e-6), epsPlus)
    return Math.max(0.25, Math.min(s, r))
  }

  // particles live in a ref and are moved by direct DOM updates (no React state per frame)
  const rndRef = useRef(num.seededRandom(5))
  const seedY = () => Ymax * Math.pow(rndRef.current(), 1.6) + 0.2
  const parts = useRef<{ x: number; yp: number }[] | null>(null)
  if (!parts.current) parts.current = Array.from({ length: N_PART }, () => ({ x: left + rndRef.current() * plotW, yp: seedY() }))
  const dots = useRef<(SVGCircleElement | null)[]>([])
  const svgRef = useRef<SVGSVGElement>(null)
  const inView = useInView(svgRef)
  const reduced = usePrefersReducedMotion()
  const running = tracers && animate && playing && inView && !reduced

  useAnimationFrame((dt) => {
    const P = parts.current
    if (!P) return
    const rnd = rndRef.current
    const uMax = Math.max(1, uAt(Ymax))
    const k = plotW / (uMax * 3.2)
    for (let i = 0; i < P.length; i++) {
      const p = P[i]
      const h = localH(p.x)
      const trapped = p.yp < h
      const u = trapped ? 0.3 + 0.15 * uAt(Math.max(h, 0.5)) * 0.2 : uAt(p.yp)
      p.x += u * k * dt
      if (trapped) p.yp += (rnd() - 0.35) * Math.max(1, h) * 0.9 * dt
      else if (p.yp > 5) {
        const amp = Math.min(1, (p.yp - 5) / 25) * Ymax * 0.06
        p.yp += num.gaussian(rnd) * amp * Math.sqrt(dt) * 2
      }
      if (p.yp < 0.15) p.yp = 0.15 + rnd() * 0.3
      if (p.yp > Ymax * 0.995) p.yp = Ymax * (0.95 + 0.04 * rnd())
      if (p.x > VW - right) {
        p.x = left
        p.yp = seedY()
      }
      if (!Number.isFinite(p.x) || !Number.isFinite(p.yp)) {
        p.x = left + rnd() * plotW
        p.yp = seedY()
      }
      const el = dots.current[i]
      if (el) {
        el.setAttribute('cx', p.x.toFixed(1))
        el.setAttribute('cy', sy(p.yp).toFixed(1))
      }
    }
  }, running)

  // y-axis ticks: keep only ticks at least 12 px apart
  const tickCands = [0, 5, 30, 70, 100, 200, 400, 800].filter((t) => t <= Ymax)
  const ticks: number[] = []
  for (const t of tickCands) if (!ticks.length || sy(ticks[ticks.length - 1]) - sy(t) >= 12) ticks.push(t)

  const band = (y0: number, y1: number) => ({ y: sy(Math.min(y1, Ymax)), h: Math.max(0, sy(y0) - sy(Math.min(y1, Ymax))) })
  const sub = band(0, 5)
  const buf = band(5, 30)
  const core = band(30, Ymax)
  const wakeOpacity = Math.max(0, Math.min(0.9, (epsPlus - 5) / 65))
  const yEps = sy(epsPlus)

  return (
    <svg ref={svgRef} viewBox={`0 0 ${VW} ${VH}`} className="h-auto w-full" role="img" aria-label={`Wall close-up: roughness height ε⁺ = ${num.fmt(epsPlus, 3)} compared with the viscous sublayer`}>
      <defs>
        <marker id={markerId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill="var(--plot-4)" />
        </marker>
      </defs>
      {/* regions */}
      <rect x={left} y={core.y} width={plotW} height={core.h} fill="var(--plot-1)" fillOpacity={0.05} />
      <rect x={left} y={buf.y} width={plotW} height={buf.h} fill="var(--plot-3)" fillOpacity={0.13} />
      <rect x={left} y={sub.y} width={plotW} height={sub.h} fill="var(--plot-2)" fillOpacity={0.2} />
      {sub.h >= 13 ? (
        <text x={VW - right - 6} y={sub.y + sub.h / 2 + 4} textAnchor="end" className="fill-ink-2 text-[11px] font-semibold">
          viscous sublayer, y⁺ &lt; 5
        </text>
      ) : (
        <text x={VW - right - 6} y={sub.y - 3} textAnchor="end" className="fill-ink-3 text-[10px]">
          viscous sublayer (y⁺ &lt; 5) — thin band at the wall
        </text>
      )}
      {buf.h >= 13 ? (
        <text x={VW - right - 6} y={buf.y + buf.h / 2 + 4} textAnchor="end" className="fill-ink-2 text-[11px] font-semibold">
          buffer layer, 5 &lt; y⁺ &lt; 30
        </text>
      ) : null}
      {core.h >= 16 ? (
        <text x={VW - right - 6} y={core.y + 14} textAnchor="end" className="fill-ink-2 text-[11px] font-semibold">
          turbulent core, y⁺ &gt; 30
        </text>
      ) : null}
      {Ymax > 70 ? (
        <g>
          <line x1={left} x2={VW - right} y1={sy(70)} y2={sy(70)} stroke="var(--plot-4)" strokeDasharray="3 5" strokeOpacity={0.7} />
          <text x={left + 6} y={sy(70) - 4} className="fill-ink-3 text-[10px]">
            y⁺ = 70 (completely rough threshold)
          </text>
        </g>
      ) : null}
      {/* axis */}
      <line x1={left} x2={left} y1={top} y2={base} stroke="var(--axis)" strokeOpacity={0.6} />
      {ticks.map((t) => (
        <g key={t}>
          <line x1={left - 4} x2={left} y1={sy(t)} y2={sy(t)} stroke="var(--axis)" />
          <text x={left - 7} y={sy(t) + 3.5} textAnchor="end" className="fill-ink-3 text-[10.5px]">
            {t}
          </text>
        </g>
      ))}
      <text x={12} y={top + plotH / 2} textAnchor="middle" transform={`rotate(-90 12 ${top + plotH / 2})`} className="fill-ink-2 text-[11px] font-semibold">
        y⁺ = y v* / ν
      </text>
      {/* tracers */}
      {(tracers ? parts.current : []).map((p, i) => (
        <circle
          key={i}
          ref={(el) => {
            dots.current[i] = el
          }}
          cx={Number.isFinite(p.x) ? p.x : left}
          cy={Number.isFinite(sy(p.yp)) ? sy(p.yp) : base}
          r={2.6}
          fill="var(--streamline)"
          fillOpacity={0.85}
        />
      ))}
      {/* wakes behind elements that stick out of the sublayer (schematic form drag) */}
      {wakeOpacity > 0
        ? elems.map((e, i) => {
            const hTop = sy(e.h * epsPlus)
            const hp = base - hTop
            if (e.h * epsPlus < 5) return null
            const r = Math.max(4, Math.min(16, hp * 0.35))
            const x0 = e.xc + e.hw * 0.55
            const y0 = hTop + r * 0.2
            return (
              <path
                key={i}
                d={`M ${x0} ${y0} A ${r} ${r} 0 1 1 ${x0 + 0.2} ${y0 + 2 * r * 0.9}`}
                fill="none"
                stroke="var(--plot-4)"
                strokeWidth={1.4}
                strokeOpacity={wakeOpacity}
                markerEnd={`url(#${markerId})`}
              />
            )
          })
        : null}
      {/* roughness elements and wall */}
      {elems.map((e, i) => {
        const yt = sy(e.h * epsPlus)
        return (
          <path
            key={i}
            d={`M ${e.xc - e.hw} ${base} C ${e.xc - e.hw * 0.55} ${base} ${e.xc - e.hw * 0.45} ${yt} ${e.xc} ${yt} C ${e.xc + e.hw * 0.45} ${yt} ${e.xc + e.hw * 0.55} ${base} ${e.xc + e.hw} ${base} Z`}
            fill="var(--body-fill)"
            stroke="var(--ink-3)"
            strokeWidth={0.8}
          />
        )
      })}
      <rect x={left} y={base} width={plotW} height={wallH} fill="var(--body-fill)" />
      <line x1={left} x2={VW - right} y1={base} y2={base} stroke="var(--ink-3)" strokeWidth={1} />
      <text x={left + 8} y={VH - 5} className="fill-ink-2 text-[10.5px] font-semibold">
        pipe wall
      </text>
      {/* roughness height marker */}
      <line x1={left} x2={VW - right} y1={yEps} y2={yEps} stroke="var(--ink)" strokeDasharray="6 4" strokeWidth={1.1} />
      <text x={left + 70} y={Math.max(top + 10, yEps - 5)} className="fill-ink text-[11px] font-semibold">
        top of roughness: ε⁺ = {num.fmt(epsPlus, 3)}
      </text>
    </svg>
  )
}

const REGIME_TEXT: Record<WallRegime, string> = {
  smooth: md`**Hydraulically smooth** ($\varepsilon\overline{v}_z^{*}/\nu < 5$): the bumps are buried inside the viscous sublayer, the flow creeps over them and the wall behaves as if it were smooth, so $f_{\mathrm F} = f_{\mathrm F}(\Rey)$ — Eq. (9.64).`,
  transition: md`**Transition** ($5 < \varepsilon\overline{v}_z^{*}/\nu < 70$): the bumps poke out of the sublayer into the buffer layer; viscous friction and form drag on the bumps both matter, so $f_{\mathrm F} = f_{\mathrm F}(\Rey, \varepsilon/a)$ — Eq. (9.65).`,
  rough: md`**Completely rough** ($\varepsilon\overline{v}_z^{*}/\nu > 70$): the bumps reach far beyond the buffer layer and shed wakes; their pressure (form) drag dominates and does not depend on viscosity, so $f_{\mathrm F} = f_{\mathrm F}(\varepsilon/a)$ only — Eq. (9.66).`,
}

/** Wall close-up with an ε⁺ slider, play/pause and the regime explanation (visual step of the rough-pipe concept). */
export function RoughnessSublayerDemo() {
  const [ep, setEp] = useState(2)
  const [playing, setPlaying] = useState(true)
  const reg = wallRegime(ep)
  return (
    <div className="space-y-3">
      <WallCloseUp epsPlus={ep} playing={playing} />
      <div className="grid items-end gap-3 sm:grid-cols-[1fr_auto]">
        <Slider label={md`roughness height in wall units, $\varepsilon^+ = \varepsilon\overline{v}_z^{*}/\nu$`} value={ep} min={0.5} max={400} log onChange={setEp} />
        <PlayPause playing={playing} onToggle={() => setPlaying((p) => !p)} />
      </div>
      <div
        className={
          reg === 'smooth'
            ? 'rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm dark:border-emerald-500/30 dark:bg-emerald-500/10'
            : reg === 'transition'
              ? 'rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm dark:border-amber-500/30 dark:bg-amber-500/10'
              : 'rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-sm dark:border-rose-500/30 dark:bg-rose-500/10'
        }
      >
        <span className="mr-2 text-xs font-bold uppercase tracking-wider text-ink-3">{REGIME_LABEL[reg]}</span>
        <Md inline>{REGIME_TEXT[reg]}</Md>
      </div>
    </div>
  )
}
