import { useEffect, useRef, useState } from 'react'
import {
  Md, md, PlayPause, Readout, Segmented, SimPanel, Slider, Toggle, num, useAnimationFrame, useInView, usePrefersReducedMotion,
} from '@/kit'
import { Arrow, FLUIDS, type FluidKey, SvgTeX, fixed } from './shared'

/**
 * Eddies crossing the plane X–X in a mean shear flow v̄x(y) = U0 + S·y (Wilkes §9.2, Fig. 9.4 idea).
 * Each eddy comes from a level y0 above or below the plane and partly "remembers" the mean x-velocity
 * there: v'x = c·S·y0 + noise. Every crossing adds ρ v'y (v̄x + v'x) (Eq. 9.14) to a running tally.
 */

const U0 = 1.0 // mean velocity at X–X, m/s
const HH = 0.05 // half-height of the window, m
const LX = 0.3 // window width, m
const SLOW = 0.12 // physical seconds per real second (slow motion)
const NOISE = 0.04 // random x-kick unrelated to the eddy's origin, m/s
const EA = 0.08 // mean |v'y|, m/s   (uniform 0.04–0.12)
const ED = 0.0285 // mean origin distance, m (uniform 0.012–0.045)
const SPAWN = 0.8 // real seconds between eddy pairs
const HIST = 240

interface Eddy { id: number; x: number; y: number; y0: number; vy: number; vxp: number; crossed: boolean; fade: number }
interface Ring { x: number; life: number; up: boolean }
interface Tally { up: number; down: number; sVy: number; sMean: number; sCorr: number; last: [number, number] | null; hist: number[] }

const newTally = (): Tally => ({ up: 0, down: 0, sVy: 0, sMean: 0, sCorr: 0, last: null, hist: [] })

// SVG geometry
const FX0 = 92
const FX1 = 470
const MID = 122
const py = (y: number) => MID - (y / HH) * 96
const px = (x: number) => FX0 + (x / LX) * (FX1 - FX0)

export function EddyCrossingSim() {
  const [S, setS] = useState(6)
  const [c, setC] = useState(0.8)
  const [fluid, setFluid] = useState<FluidKey>('water')
  const [ride, setRide] = useState(true)
  const [playing, setPlaying] = useState(true)
  const [, setTick] = useState(0)
  const reduced = usePrefersReducedMotion()
  const box = useRef<HTMLDivElement>(null)
  const inView = useInView(box)

  const rnd = useRef(num.seededRandom(17))
  const eddies = useRef<Eddy[]>([])
  const rings = useRef<Ring[]>([])
  const tally = useRef<Tally>(newTally())
  const clock = useRef(SPAWN)
  const nextId = useRef(0)
  const rho = FLUIDS[fluid].rho

  useEffect(() => {
    if (reduced) setPlaying(false)
  }, [reduced])

  const reset = () => {
    rnd.current = num.seededRandom(17)
    eddies.current = []
    rings.current = []
    tally.current = newTally()
    clock.current = SPAWN
    setTick((k) => k + 1)
  }
  useEffect(reset, [S, c, fluid])

  const spawnPair = () => {
    const r = rnd.current
    const a = 0.04 + 0.08 * r()
    const d1 = 0.012 + 0.033 * r()
    const d2 = 0.012 + 0.033 * r()
    const mk = (y0: number, vy: number): Eddy => ({
      id: nextId.current++,
      x: LX * r(),
      y: y0,
      y0,
      vy,
      vxp: c * S * y0 + NOISE * num.gaussian(r),
      crossed: false,
      fade: 1,
    })
    eddies.current.push(mk(-d1, a), mk(d2, -a)) // same |v'y| up and down, so ⟨v'y⟩ → 0 exactly in pairs
  }

  useAnimationFrame((dt) => {
    const dtp = dt * SLOW
    const frame = ride ? U0 : 0
    clock.current += dt
    if (clock.current >= SPAWN) {
      clock.current -= SPAWN
      spawnPair()
    }
    const T = tally.current
    for (const e of eddies.current) {
      e.y += e.vy * dtp
      e.x = (((e.x + (U0 + e.vxp - frame) * dtp) % LX) + LX) % LX
      if (!e.crossed && e.y * e.y0 <= 0) {
        e.crossed = true
        if (e.vy > 0) T.up++
        else T.down++
        T.sVy += e.vy
        T.sMean += rho * e.vy * U0
        T.sCorr += rho * e.vy * e.vxp
        T.last = [e.vy, e.vxp]
        T.hist.push(-T.sCorr / (T.up + T.down))
        if (T.hist.length > HIST) T.hist.shift()
        rings.current.push({ x: e.x, life: 1, up: e.vy > 0 })
      }
      if (e.crossed) e.fade -= dt / 1.4
    }
    eddies.current = eddies.current.filter((e) => e.fade > 0 && Math.abs(e.y) < HH * 1.02)
    for (const g of rings.current) g.life -= dt / 0.7
    rings.current = rings.current.filter((g) => g.life > 0)
    setTick((k) => k + 1)
  }, playing && inView)

  const T = tally.current
  const n = T.up + T.down
  const avgVy = n ? T.sVy / n : 0
  const meanPart = n ? T.sMean / n : 0
  const corrPart = n ? T.sCorr / n : 0
  const tau = -corrPart
  const expected = rho * c * S * EA * ED
  const vmax = Math.max(0.05, Math.abs(c * S) * 0.045 + 2 * NOISE)

  // velocity-profile arrows (left panel)
  const frame = ride ? U0 : 0
  const lv = [-0.04, -0.02, 0, 0.02, 0.04].map((y) => ({ y, v: U0 + S * y - frame }))
  const vm = Math.max(0.05, ...lv.map((l) => Math.abs(l.v)))
  const base = ride ? 46 : 12
  const maxLen = ride ? 32 : 66

  // sparkline of the running τ^t
  const hs = T.hist
  const hMax = Math.max(Math.abs(expected) * 1.6, ...hs.map((v) => Math.abs(v)), 1e-9)
  const spark = hs.map((v, i) => `${(4 + (i / (HIST - 1)) * 292).toFixed(1)},${(30 - (v / hMax) * 24).toFixed(1)}`).join(' ')

  return (
    <SimPanel
      title="Eddies crossing the plane X–X"
      subtitle="tally of the x-momentum they carry, averaged per crossing (slow motion)"
      wide
      controls={
        <>
          <PlayPause playing={playing} onToggle={() => setPlaying((p) => !p)} onReset={reset} />
          <Slider label={md`mean shear $d\avg{v}_x/dy$`} value={S} min={-10} max={10} step={0.5} onChange={setS} unit="s⁻¹" digits={2} />
          <Slider label="eddy memory of its origin (correlation)" value={c} min={0} max={1} step={0.05} onChange={setC} digits={2} />
          <Segmented label="fluid" options={[{ value: 'water', label: 'water (998)' }, { value: 'air', label: 'air (1.2)' }]} value={fluid} onChange={(v) => setFluid(v as FluidKey)} />
          <Toggle label={md`ride along at $\avg{v}_x(0)$ (moving frame)`} checked={ride} onChange={setRide} />
        </>
      }
      readout={
        <Readout
          items={[
            { label: 'crossings ↑ / ↓', value: `${T.up} / ${T.down}` },
            { label: md`$\langle v_y'\rangle$`, value: fixed(avgVy, 4), unit: 'm/s' },
            { label: md`$\langle\rho v_y'\rangle\,\avg{v}_x$`, value: fixed(meanPart, 3), unit: 'Pa' },
            { label: md`$\rho\langle v_y'v_x'\rangle$`, value: fixed(corrPart, 3), unit: 'Pa' },
            { label: md`$\tau^t_{yx}=-\rho\langle v_y'v_x'\rangle$`, value: fixed(tau, 3), unit: 'Pa', tone: 'good' },
            { label: 'model long-run value', value: fixed(expected, 3), unit: 'Pa' },
          ]}
        />
      }
      footer={
        <Md>{md`**Try this:** with positive shear, upward eddies (from the slow side) arrive with $v_x'<0$ (cyan) and downward eddies (from the fast side) with $v_x'>0$ (red), so every crossing adds a negative $v_y'v_x'$ and $\tau^t_{yx}$ settles at a positive value — x-momentum is carried *down* the velocity gradient. The mean-flow part $\langle\rho v_y'\rangle\avg{v}_x$ dies away because $\langle v_y'\rangle\to0$ (Eq. 9.15). Set the shear to zero, or the memory to zero: the eddies still cross just as often, but the correlation — and the Reynolds stress — vanishes. Reverse the shear and $\tau^t_{yx}$ changes sign.`}</Md>
      }
    >
      <div ref={box} className="space-y-2">
        <svg viewBox="0 0 480 236" className="h-auto w-full" role="img" aria-label="Eddies crossing a horizontal plane in a shear flow, coloured by their x-velocity fluctuation">
          {/* velocity profile */}
          <rect x={4} y={22} width={82} height={200} rx={6} fill="var(--surface-2)" />
          <line x1={base} x2={base} y1={26} y2={218} stroke="var(--ink-3)" strokeWidth={1} />
          {lv.map((l) => (
            <Arrow key={l.y} x1={base} y1={py(l.y)} x2={base + (l.v / vm) * maxLen} y2={py(l.y)} color="var(--plot-1)" width={1.8} head={6} />
          ))}
          <SvgTeX x={45} y={11} tex={ride ? String.raw`\overline{v}_x-\overline{v}_x(0)` : String.raw`\overline{v}_x(y)`} w={90} h={18} size={10.5} />

          {/* field */}
          <rect x={FX0} y={22} width={FX1 - FX0} height={200} rx={6} fill="var(--field-bg)" stroke="var(--line)" />
          <text x={FX0 + 6} y={36} className="fill-ink-3 text-[10px]">above X–X: {S >= 0 ? 'faster' : 'slower'} mean flow</text>
          <text x={FX0 + 6} y={214} className="fill-ink-3 text-[10px]">below X–X: {S >= 0 ? 'slower' : 'faster'} mean flow</text>
          <line x1={FX0} x2={FX1} y1={MID} y2={MID} stroke="var(--ink-2)" strokeDasharray="7 5" strokeWidth={1.4} />
          <text x={FX0 + 4} y={MID - 5} className="fill-ink text-[12px] italic">X</text>
          <text x={FX1 - 12} y={MID - 5} className="fill-ink text-[12px] italic">X</text>

          {rings.current.map((g, i) => (
            <circle key={`r${i}`} cx={px(g.x)} cy={MID} r={10 + (1 - g.life) * 16} fill="none" stroke="var(--plot-6)" strokeWidth={2} opacity={Math.max(0, g.life)} />
          ))}
          {eddies.current.map((e) => {
            const cx = px(e.x)
            const cy = py(e.y)
            const strength = Math.min(1, Math.abs(e.vxp) / vmax)
            const op = Math.max(0, Math.min(1, e.fade)) * (0.35 + 0.65 * strength)
            return (
              <g key={e.id} opacity={op}>
                <circle cx={cx} cy={cy} r={10} fill={e.vxp >= 0 ? 'var(--plot-4)' : 'var(--plot-2)'} stroke="var(--surface)" strokeWidth={1.5} />
                <Arrow x1={cx} y1={cy} x2={cx} y2={cy + (e.vy > 0 ? -16 : 16)} color="var(--ink)" width={1.4} head={5} />
              </g>
            )
          })}
        </svg>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-2">
          <span className="inline-flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-full bg-[var(--plot-4)]" /> eddy faster than the mean flow at X–X (v′ₓ &gt; 0)</span>
          <span className="inline-flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-full bg-[var(--plot-2)]" /> slower (v′ₓ &lt; 0)</span>
          <span className="inline-flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-full border-2 border-[var(--plot-6)]" /> crossing recorded</span>
        </div>
        <div className="rounded-xl border border-line p-2">
          <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2 text-xs">
            <span className="font-bold uppercase tracking-wider text-ink-3">running Reynolds stress after each crossing (Pa)</span>
            {T.last ? (
              <span className="font-mono text-ink-2">
                last: v′y = {fixed(T.last[0], 3)}, v′x = {fixed(T.last[1], 3)} m/s → product {T.last[0] * T.last[1] < 0 ? '< 0' : '≥ 0'}
              </span>
            ) : (
              <span className="text-ink-3">waiting for the first crossing…</span>
            )}
          </div>
          <svg viewBox="0 0 300 60" className="h-auto w-full" role="img" aria-label="Running value of the Reynolds stress">
            <line x1={4} x2={296} y1={30} y2={30} stroke="var(--ink-3)" strokeWidth={0.8} />
            <line x1={4} x2={296} y1={30 - (expected / hMax) * 24} y2={30 - (expected / hMax) * 24} stroke="var(--plot-5)" strokeDasharray="4 3" strokeWidth={1} />
            {hs.length > 1 ? <polyline points={spark} fill="none" stroke="var(--plot-1)" strokeWidth={1.6} /> : null}
            <text x={296} y={58} textAnchor="end" className="fill-ink-3 text-[8px]">0 line solid · dashed = model long-run value</text>
          </svg>
        </div>
      </div>
    </SimPanel>
  )
}
