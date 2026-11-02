import { useEffect, useRef, useState } from 'react'
import {
  Md, md, PlayPause, Readout, Segmented, SimPanel, Slider, cx, num, useAnimationFrame, useInView, usePrefersReducedMotion,
} from '@/kit'
import { FLUIDS, type FluidKey, SvgTeX, fixed } from './shared'

/**
 * Averaging the convective product v_x v_y term by term (Wilkes Eq. 9.11).
 * Fluctuations: two AR(1) "turbulent" signals with prescribed RMS values and correlation r.
 */

const PHI = 0.9 // sample-to-sample memory of the synthetic signals
const PER_FRAME = 4
const NMAX = 8000
const HIST = 200

interface Acc {
  rnd: () => number
  z1: number
  z2: number
  n: number
  sMF: number
  sFM: number
  sFF: number
  sX: number
  sY: number
  sXY: number
  hx: number[]
  hy: number[]
}

function fresh(seed: number): Acc {
  return { rnd: num.seededRandom(seed), z1: 0, z2: 0, n: 0, sMF: 0, sFM: 0, sFF: 0, sX: 0, sY: 0, sXY: 0, hx: [], hy: [] }
}

function step(a: Acc, mx: number, my: number, sx: number, sy: number, r: number) {
  const k = Math.sqrt(1 - PHI * PHI)
  a.z1 = PHI * a.z1 + k * num.gaussian(a.rnd)
  a.z2 = PHI * a.z2 + k * num.gaussian(a.rnd)
  const fx = sx * a.z1
  const fy = sy * (r * a.z1 + Math.sqrt(Math.max(0, 1 - r * r)) * a.z2)
  const vx = mx + fx
  const vy = my + fy
  a.n += 1
  a.sMF += mx * fy
  a.sFM += fx * my
  a.sFF += fx * fy
  a.sX += vx
  a.sY += vy
  a.sXY += vx * vy
  a.hx.push(vx)
  a.hy.push(vy)
  if (a.hx.length > HIST) {
    a.hx.shift()
    a.hy.shift()
  }
}

function Trace({ data, mean, sd, y0, label, color }: { data: number[]; mean: number; sd: number; y0: number; label: string; color: string }) {
  const h = 50
  const lo = mean - 3.2 * sd
  const hi = mean + 3.2 * sd
  const py = (v: number) => y0 + h - ((Math.min(hi, Math.max(lo, v)) - lo) / (hi - lo)) * h
  const pts = data.map((v, i) => `${(52 + (i / (HIST - 1)) * 380).toFixed(1)},${py(v).toFixed(1)}`).join(' ')
  return (
    <g>
      <rect x={52} y={y0} width={380} height={h} fill="var(--field-bg)" stroke="var(--line)" />
      <line x1={52} x2={432} y1={py(mean)} y2={py(mean)} stroke="var(--ink-2)" strokeDasharray="5 4" strokeWidth={1.2} />
      {data.length > 1 ? <polyline points={pts} fill="none" stroke={color} strokeWidth={1.4} strokeLinejoin="round" /> : null}
      <SvgTeX x={4} y={y0 + h / 2} tex={label} w={46} align="left" size={12} />
    </g>
  )
}

function Bar({ label, value, max, tone, target }: { label: string; value: number; max: number; tone: string; target?: number }) {
  const w = Math.min(50, (Math.abs(value) / max) * 50)
  const left = value >= 0 ? 50 : 50 - w
  const tgt = target != null ? 50 + Math.max(-50, Math.min(50, (target / max) * 50)) : null
  return (
    <div className="grid grid-cols-[minmax(0,8.5rem)_minmax(0,1fr)_4.6rem] items-center gap-2 text-sm">
      <span className="truncate text-ink-2"><Md inline>{label}</Md></span>
      <span className="relative h-4 rounded bg-surface-2">
        <span className="absolute inset-y-0 left-1/2 w-px bg-ink-3/60" />
        <span className={cx('absolute inset-y-0.5 rounded-sm', tone)} style={{ left: `${left}%`, width: `${w}%` }} />
        {tgt != null ? <span className="absolute -inset-y-0.5 w-0.5 bg-ink" style={{ left: `${tgt}%` }} title="expected long-time value" /> : null}
      </span>
      <span className="text-right font-mono text-[12.5px] text-ink">{fixed(value, 3)}</span>
    </div>
  )
}

export function ProductTermsLab() {
  const [mx, setMx] = useState(2)
  const [my, setMy] = useState(0.3)
  const [sx, setSx] = useState(0.4)
  const [sy, setSy] = useState(0.3)
  const [r, setR] = useState(-0.5)
  const [fluid, setFluid] = useState<FluidKey>('water')
  const [playing, setPlaying] = useState(true)
  const [, setTick] = useState(0)
  const reduced = usePrefersReducedMotion()
  const box = useRef<HTMLDivElement>(null)
  const inView = useInView(box)
  const acc = useRef<Acc | null>(null)
  if (acc.current === null) acc.current = fresh(3)
  const seed = useRef(3)

  useEffect(() => {
    if (reduced) setPlaying(false)
  }, [reduced])

  const restart = () => {
    seed.current += 1
    acc.current = fresh(seed.current)
    setTick((k) => k + 1)
  }
  useEffect(restart, [mx, my, sx, sy, r])

  useAnimationFrame(() => {
    const a = acc.current
    if (!a) return
    if (a.n >= NMAX) {
      setPlaying(false)
      return
    }
    for (let k = 0; k < PER_FRAME; k++) step(a, mx, my, sx, sy, r)
    setTick((k) => k + 1)
  }, playing && inView)

  const a = acc.current ?? fresh(3)
  const n = Math.max(1, a.n)
  const t1 = mx * my
  const t2 = a.sMF / n
  const t3 = a.sFM / n
  const t4 = a.sFF / n
  const tot = a.sXY / n
  const prodAvg = (a.sX / n) * (a.sY / n)
  const target = r * sx * sy
  const max = Math.max(Math.abs(t1), Math.abs(t1 + target), sx * sy, 0.05) * 1.25
  const rho = FLUIDS[fluid].rho

  return (
    <SimPanel
      title="Which terms survive the time average?"
      subtitle={md`$\avg{v_xv_y}=\avg{v}_x\avg{v}_y+\avg{\avg{v}_xv_y'}+\avg{v_x'\avg{v}_y}+\avg{v_x'v_y'}$`}
      wide
      controls={
        <>
          <PlayPause playing={playing} onToggle={() => setPlaying((p) => !p)} onReset={() => { restart(); setPlaying(true) }} />
          <Slider label={md`mean $\avg{v}_x$`} value={mx} min={0} max={4} step={0.1} onChange={setMx} unit="m/s" digits={2} />
          <Slider label={md`mean $\avg{v}_y$`} value={my} min={-1} max={1} step={0.05} onChange={setMy} unit="m/s" digits={2} />
          <Slider label={md`RMS $\widetilde{v_x'}$`} value={sx} min={0.05} max={1} step={0.05} onChange={setSx} unit="m/s" digits={2} />
          <Slider label={md`RMS $\widetilde{v_y'}$`} value={sy} min={0.05} max={1} step={0.05} onChange={setSy} unit="m/s" digits={2} />
          <Slider label={md`correlation $r_{xy}$`} value={r} min={-0.95} max={0.95} step={0.05} onChange={setR} digits={2} />
          <Segmented label="fluid" options={[{ value: 'water', label: 'water (998 kg/m³)' }, { value: 'air', label: 'air (1.2 kg/m³)' }]} value={fluid} onChange={(v) => setFluid(v as FluidKey)} />
        </>
      }
      readout={
        <Readout
          items={[
            { label: 'samples $N$', value: String(a.n) },
            { label: md`$\langle v_xv_y\rangle$`, value: fixed(tot, 4), unit: 'm²/s²' },
            { label: md`$\langle v_x\rangle\langle v_y\rangle$`, value: fixed(prodAvg, 4), unit: 'm²/s²' },
            { label: md`difference $\approx\avg{v_x'v_y'}$`, value: fixed(tot - prodAvg, 4), unit: 'm²/s²', tone: 'accent' },
            { label: md`expected $r_{xy}\widetilde{v_x'}\widetilde{v_y'}$`, value: fixed(target, 4), unit: 'm²/s²' },
            { label: md`$\tau^t_{yx}=-\rho\avg{v_x'v_y'}$`, value: -rho * t4, unit: 'Pa', digits: 3, tone: 'good' },
          ]}
        />
      }
      footer={
        <Md>{md`**Try this:** set $r_{xy}=0$ — the fluctuation-product bar collapses to zero even though both signals keep fluctuating just as hard. Then set $r_{xy}=-0.8$: $\langle v_xv_y\rangle$ falls below $\langle v_x\rangle\langle v_y\rangle$, the gap is $\avg{v_x'v_y'}$, and $-\rho\avg{v_x'v_y'}$ is a *positive* Reynolds stress. Change $\avg{v}_y$: the two cross-term bars still shrink to zero, exactly as in Eq. (9.11). The black tick marks the long-time value of each bar.`}</Md>
      }
    >
      <div ref={box} className="space-y-3">
        <svg viewBox="0 0 440 122" className="h-auto w-full" role="img" aria-label="Recent samples of v_x and v_y with their mean values">
          <Trace data={a.hx} mean={mx} sd={sx} y0={4} label={md`v_x(t)`} color="var(--plot-1)" />
          <Trace data={a.hy} mean={my} sd={sy} y0={66} label={md`v_y(t)`} color="var(--plot-3)" />
          <text x={432} y={120} textAnchor="end" className="fill-ink-3 text-[9.5px]">last {HIST} samples · dashed = mean</text>
        </svg>
        <div className="space-y-1.5 rounded-xl border border-line p-3">
          <div className="mb-1 text-xs font-bold uppercase tracking-wider text-ink-3">running time averages (m²/s²)</div>
          <Bar label={md`$\avg{v}_x\,\avg{v}_y$`} value={t1} max={max} tone="bg-emerald-500" target={t1} />
          <Bar label={md`$\langle\avg{v}_x\,v_y'\rangle$`} value={t2} max={max} tone="bg-slate-400" target={0} />
          <Bar label={md`$\langle v_x'\,\avg{v}_y\rangle$`} value={t3} max={max} tone="bg-slate-400" target={0} />
          <Bar label={md`$\langle v_x'v_y'\rangle$`} value={t4} max={max} tone="bg-amber-500" target={target} />
          <div className="border-t border-line pt-1.5">
            <Bar label={md`sum $=\langle v_xv_y\rangle$`} value={tot} max={max} tone="bg-indigo-500" target={t1 + target} />
          </div>
        </div>
      </div>
    </SimPanel>
  )
}
