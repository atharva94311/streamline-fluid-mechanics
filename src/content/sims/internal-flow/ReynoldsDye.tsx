/**
 * Concept "laminar-turbulent": Reynolds' dye experiment as a live calculator.
 * Re = ρV̄D/μ (Fox p. 276) decides whether the dye filament stays a single line (Re < 2300) or breaks up.
 * The animation is a qualitative cartoon: the breakup distance, intermittent puffs in the transitional band
 * and the dispersion strength are illustrative (supplementary), not computed from the equations of motion.
 */
import { useMemo, useRef, useState } from 'react'
import {
  PlayPause, Readout, Segmented, SimPanel, Slider, Toggle, md, num, useAnimationFrame, useInView, usePrefersReducedMotion, useUid,
} from '@/kit'
import { FLUIDS, RE_CRIT, RE_QUIET, SOUND_SPEED_AIR, fmtRe, regimeOf, type Fluid } from './model'

interface P {
  x: number
  y: number
  vy: number
  turb: boolean
}

const W = 480
const H = 150
const YC = 80
const HALF = 42 // tube inner half-height in px
const X0 = 30
const X1 = 470
const MAXP = 600

const BADGE: Record<string, string> = {
  laminar: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300',
  transitional: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
  turbulent: 'bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300',
}

export function ReynoldsDye() {
  const [fluidKey, setFluidKey] = useState<Fluid['key']>('water')
  const fluid = FLUIDS[fluidKey]
  const [V, setV] = useState(0.05) // m/s
  const [Dmm, setDmm] = useState(25) // mm
  const [quiet, setQuiet] = useState(false)
  const [playing, setPlaying] = useState(true)
  const reduced = usePrefersReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref)
  const uid = useUid('dye')

  const D = Dmm / 1000
  const Re = (fluid.rho * V * D) / fluid.mu
  const nu = fluid.mu / fluid.rho
  const regime = regimeOf(Re, quiet)
  const Vcrit = (RE_CRIT * fluid.mu) / (fluid.rho * D)
  const Q = V * (Math.PI * D * D) / 4
  const mach = fluidKey === 'air' ? V / SOUND_SPEED_AIR : null

  // strength of the cartoon dispersion: 0 (laminar) … 1 (well into turbulence)
  const strength = regime === 'laminar' ? 0 : Math.min(1, 0.35 + 0.65 * Math.log10(Re / (quiet ? RE_QUIET : RE_CRIT)) / 1.5)
  const breakX = regime === 'laminar' ? X1 + 100 : X0 + 40 + 260 * (1 - Math.min(1, Math.log10(Re / (quiet ? RE_QUIET : RE_CRIT)) / 1.8))

  const parts = useRef<P[]>([])
  const rnd = useRef(num.seededRandom(11))
  const burst = useRef({ on: false, t: 0 })
  const spawn = useRef(0)
  const [, setTick] = useState(0)
  const running = playing && inView && !reduced

  useAnimationFrame((dt) => {
    const R = rnd.current
    // intermittent "puffs" in the transitional band
    if (regime === 'transitional') {
      burst.current.t -= dt
      if (burst.current.t <= 0) {
        burst.current.on = !burst.current.on
        burst.current.t = burst.current.on ? 0.6 + R() * 0.8 : 0.5 + R() * 1.2
      }
    } else burst.current.on = regime === 'turbulent'
    const speed = 150 // px/s — animation speed is not to scale
    const arr = parts.current
    spawn.current += dt * 110 // particles per second (independent of frame rate)
    while (spawn.current >= 1) {
      spawn.current -= 1
      arr.push({ x: X0 + 8 + R() * 2, y: 0, vy: 0, turb: burst.current.on })
    }
    for (const p of arr) {
      p.x += speed * dt * (1 - 0.35 * (p.y / HALF) ** 2)
      if (p.turb && p.x > breakX) {
        const s = strength * 260
        p.vy += num.gaussian(R) * s * Math.sqrt(dt) * 6 - p.vy * 4 * dt
        p.y += p.vy * dt + num.gaussian(R) * s * 0.02 * Math.sqrt(dt) * 10
        p.x += num.gaussian(R) * s * 0.03 * Math.sqrt(dt) * 10
        if (p.y > HALF - 2) p.y = 2 * (HALF - 2) - p.y
        if (p.y < -(HALF - 2)) p.y = -2 * (HALF - 2) - p.y
      }
    }
    parts.current = arr.filter((p) => p.x < X1).slice(-MAXP)
    setTick((t) => (t + 1) % 1_000_000)
  }, running)

  const staticPts = useMemo(() => {
    // reduced-motion / paused fallback when no particles exist yet
    const out: P[] = []
    const R = num.seededRandom(3)
    for (let i = 0; i < 260; i++) {
      const x = X0 + 8 + (i / 260) * (X1 - X0 - 8)
      let y = 0
      if (regime !== 'laminar' && x > breakX) y = (R() * 2 - 1) * Math.min(HALF - 3, (x - breakX) * 0.5 * strength + 4)
      out.push({ x, y, vy: 0, turb: false })
    }
    return out
  }, [regime, breakX, strength])
  const pts = parts.current.length > 20 ? parts.current : staticPts

  return (
    <SimPanel
      title="Reynolds' dye experiment — live Re calculator"
      subtitle={md`$\Rey = \rho\bar V D/\mu$ · benchmark $\Rey \approx 2300$`}
      wide
      controls={
        <>
          <Segmented
            label="Fluid"
            options={(Object.keys(FLUIDS) as Fluid['key'][]).map((k) => ({ value: k, label: k === 'oil' ? 'motor oil' : k }))}
            value={fluidKey}
            onChange={setFluidKey}
          />
          <Slider label={md`average velocity $\bar V$`} value={V} min={0.001} max={120} log onChange={setV} unit="m/s" digits={3} />
          <Slider label={md`pipe diameter $D$`} value={Dmm} min={0.2} max={500} log onChange={setDmm} unit="mm" digits={3} />
          <Toggle label="disturbance-free laboratory pipe (laminar up to Re ≈ 100 000)" checked={quiet} onChange={setQuiet} />
          <PlayPause playing={playing} onToggle={() => setPlaying((p) => !p)} onReset={() => (parts.current = [])} />
        </>
      }
      readout={
        <div className="space-y-2">
          <div className={`rounded-xl px-3 py-2 text-center text-sm font-bold uppercase tracking-wide ${BADGE[regime]}`}>
            {regime}
            {regime === 'transitional' ? ' (intermittent)' : ''}
          </div>
          <Readout
            items={[
              { label: md`$\Rey$`, value: fmtRe(Re), tone: 'accent' },
              { label: md`$\nu = \mu/\rho$`, value: num.fmt(nu, 3), unit: 'm²/s' },
              { label: md`$\bar V$ at $\Rey = 2300$`, value: num.fmt(Vcrit, 3), unit: 'm/s' },
              { label: md`$Q = \bar V\,\pi D^2/4$`, value: num.fmt(Q * 1000, 3), unit: 'L/s' },
              ...(mach != null
                ? [{ label: md`Mach $M = \bar V/c$`, value: num.fmt(mach, 2), tone: mach >= 0.3 ? ('bad' as const) : ('good' as const) }]
                : []),
            ]}
          />
          {mach != null && mach >= 0.3 ? (
            <div className="rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-xs text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
              M ≥ 0.3: compressibility can no longer be ignored — outside the scope of Fox Ch. 8 (incompressible only).
            </div>
          ) : null}
        </div>
      }
      footer={
        <span>
          <b>Try this:</b> with water in the 25 mm pipe, raise V̄ slowly through about 0.09 m/s (Re ≈ 2300) and watch the filament
          start to break up in puffs. Then switch to motor oil at the same V̄ and D — Re drops by a factor of about 325 and the dye line
          straightens. Finally tick the disturbance-free pipe: water stays laminar far above 2300. (Animation speed and dispersion are
          a cartoon; only Re is computed.)
        </span>
      }
    >
      <div ref={ref}>
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="dye filament in a tube">
          <defs>
            <clipPath id={`${uid}c`}>
              <rect x={X0} y={YC - HALF} width={X1 - X0} height={2 * HALF} />
            </clipPath>
          </defs>
          <text x={X0} y={20} className="fill-ink-2" fontSize={12}>
            {fluid.label} · D = {num.fmt(Dmm, 3)} mm · V̄ = {num.fmt(V, 3)} m/s
          </text>
          <rect x={X0} y={YC - HALF} width={X1 - X0} height={2 * HALF} fill="var(--streamline)" opacity={0.1} />
          <line x1={X0} y1={YC - HALF} x2={X1} y2={YC - HALF} stroke="var(--ink-3)" strokeWidth={2} />
          <line x1={X0} y1={YC + HALF} x2={X1} y2={YC + HALF} stroke="var(--ink-3)" strokeWidth={2} />
          <path d={`M${X0 - 6},${YC - 30} L${X0 - 6},${YC - 4} Q${X0 - 6},${YC} ${X0 + 2},${YC} L${X0 + 8},${YC}`} fill="none" stroke="var(--ink-3)" strokeWidth={2.5} />
          <g clipPath={`url(#${uid}c)`}>
            {pts.map((p, i) => (
              <circle key={i} cx={p.x} cy={YC + p.y} r={1.7} fill="var(--plot-4)" opacity={0.75} />
            ))}
          </g>
          <text x={X1} y={H - 6} textAnchor="end" className="fill-ink-3" fontSize={10.5}>
            dye injected on the axis at the entrance · flow →
          </text>
        </svg>
      </div>
    </SimPanel>
  )
}
