import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Md, md, PlayPause, Readout, SimPanel, Slider, Toggle, num, useAnimationFrame, useInView, usePrefersReducedMotion,
} from '@/kit'
import { Arrow, fixed } from './shared'

/**
 * Time-averaging a fluctuating, divergence-free 2-D velocity field.
 * Mean field: plane stagnation flow toward a wall, v̄x = A x, v̄y = −A y (satisfies Eq. 9.8).
 * Fluctuations: curl of a random travelling-wave stream function, so every snapshot is divergence-free.
 */

interface Mode { kx: number; ky: number; a: number; w: number; phi: number }

const NX = 9
const NY = 5
const XS = Array.from({ length: NX }, (_, i) => -0.8 + 0.2 * i)
const YS = Array.from({ length: NY }, (_, j) => 0.1 + 0.2 * j)
const PX = 0.4 // probe P (a grid node)
const PY = 0.5
const H = 0.01 // finite-difference step, m
const DT = 0.05 // simulated seconds between snapshots
const NMAX = 4000

function makeModes(seed: number): Mode[] {
  const rnd = num.seededRandom(seed)
  const out: Mode[] = []
  for (let m = 0; m < 6; m++) {
    const k = 2.5 + 4 * rnd()
    const ang = 2 * Math.PI * rnd()
    const weight = 0.6 + 0.8 * rnd()
    out.push({
      kx: k * Math.cos(ang),
      ky: k * Math.sin(ang),
      a: weight / k,
      w: (1.5 + 3 * rnd()) * (rnd() < 0.5 ? -1 : 1),
      phi: 2 * Math.PI * rnd(),
    })
  }
  return out
}
const MODES = makeModes(11)
const WEIGHT2 = MODES.reduce((s, m) => s + (m.a * Math.hypot(m.kx, m.ky)) ** 2, 0)

/** Fluctuation velocity (and ∂v'x/∂x) at (x, y, t) for amplitude scale s. */
function fluct(x: number, y: number, t: number, s: number): [number, number, number] {
  let u = 0
  let v = 0
  let dudx = 0
  for (const m of MODES) {
    const th = m.kx * x + m.ky * y - m.w * t + m.phi
    const c = Math.cos(th)
    u += s * m.a * m.ky * c
    v -= s * m.a * m.kx * c
    dudx -= s * m.a * m.ky * m.kx * Math.sin(th)
  }
  return [u, v, dudx]
}

interface Acc {
  t: number
  n: number
  sx: Float64Array
  sy: Float64Array
  pX: number
  pXp: number
  pXm: number
  pYp: number
  pYm: number
  pD: number
}

function fresh(): Acc {
  return { t: 0, n: 0, sx: new Float64Array(NX * NY), sy: new Float64Array(NX * NY), pX: 0, pXp: 0, pXm: 0, pYp: 0, pYm: 0, pD: 0 }
}

function addSample(acc: Acc, A: number, s: number) {
  const t = acc.t
  for (let j = 0; j < NY; j++)
    for (let i = 0; i < NX; i++) {
      const [u, v] = fluct(XS[i], YS[j], t, s)
      acc.sx[j * NX + i] += A * XS[i] + u
      acc.sy[j * NX + i] += -A * YS[j] + v
    }
  const [u0, , d0] = fluct(PX, PY, t, s)
  acc.pX += A * PX + u0
  acc.pD += A + d0
  acc.pXp += A * (PX + H) + fluct(PX + H, PY, t, s)[0]
  acc.pXm += A * (PX - H) + fluct(PX - H, PY, t, s)[0]
  acc.pYp += -A * (PY + H) + fluct(PX, PY + H, t, s)[1]
  acc.pYm += -A * (PY - H) + fluct(PX, PY - H, t, s)[1]
  acc.n += 1
}

// SVG geometry: x ∈ [−1, 1] m → 30…430 px, y ∈ [0, 1] m → 210…10 px
const sx = (x: number) => 30 + (x + 1) * 200
const sy = (y: number) => 210 - y * 200

export function MeanFieldAverager() {
  const [A, setA] = useState(1)
  const [I, setI] = useState(0.35)
  const [showInst, setShowInst] = useState(true)
  const [showMean, setShowMean] = useState(true)
  const [playing, setPlaying] = useState(true)
  const [, setTick] = useState(0)
  const reduced = usePrefersReducedMotion()
  const box = useRef<HTMLDivElement>(null)
  const inView = useInView(box)

  const s = (I * A) / Math.sqrt(WEIGHT2 / 4) // RMS of each fluctuation component = I·A·(1 m)
  const acc = useRef<Acc | null>(null)
  if (acc.current === null) {
    acc.current = fresh()
    addSample(acc.current, A, s)
  }

  useEffect(() => {
    if (reduced) setPlaying(false)
  }, [reduced])

  // new parameters → restart the average with a single snapshot
  useEffect(() => {
    const a = fresh()
    addSample(a, A, s)
    acc.current = a
    setTick((k) => k + 1)
  }, [A, s])

  useAnimationFrame(() => {
    const a = acc.current
    if (!a) return
    if (a.n >= NMAX) {
      setPlaying(false)
      return
    }
    for (let k = 0; k < 2; k++) {
      a.t += DT
      addSample(a, A, s)
    }
    setTick((k) => k + 1)
  }, playing && inView)

  const a = acc.current
  const n = Math.max(1, a.n)
  const exact = A * PX
  const avgVx = a.pX / n
  const avgD = a.pD / n
  const dAvg = (a.pXp - a.pXm) / (2 * H * n)
  const cont = dAvg + (a.pYp - a.pYm) / (2 * H * n)
  const scale = 34 / (1.25 * A) // px per (m/s)

  const inst = useMemo(() => {
    if (!showInst) return []
    const out: [number, number, number, number][] = []
    for (let j = 0; j < NY; j++)
      for (let i = 0; i < NX; i++) {
        const [u, v] = fluct(XS[i], YS[j], a.t, s)
        out.push([XS[i], YS[j], A * XS[i] + u, -A * YS[j] + v])
      }
    return out
  }, [showInst, a.t, s, A])

  const reset = () => {
    const f = fresh()
    addSample(f, A, s)
    acc.current = f
    setTick((k) => k + 1)
    setPlaying(true)
  }

  return (
    <SimPanel
      title="Averaging a fluctuating flow field"
      subtitle={md`$\langle\cdot\rangle$ = running average of the $N$ snapshots so far`}
      wide
      controls={
        <>
          <PlayPause playing={playing} onToggle={() => setPlaying((p) => !p)} onReset={reset} />
          <Slider label={md`mean strain rate $A$`} value={A} min={0.5} max={2} step={0.1} onChange={setA} unit="s⁻¹" digits={2} />
          <Slider label={md`fluctuation level $\widetilde{v'}/(A\cdot 1\,\mathrm{m})$`} value={I} min={0.05} max={0.6} step={0.01} onChange={setI} digits={2} />
          <Toggle label="show instantaneous field (grey)" checked={showInst} onChange={setShowInst} />
          <Toggle label="show exact mean field (dashed)" checked={showMean} onChange={setShowMean} />
        </>
      }
      readout={
        <Readout
          items={[
            { label: 'snapshots $N$', value: String(a.n) },
            { label: 'averaging time $T$', value: fixed(a.n * DT, 1), unit: 's' },
            { label: md`$\langle v_x\rangle$ at P`, value: fixed(avgVx, 3), unit: 'm/s' },
            { label: md`exact $\avg{v}_x$ at P`, value: fixed(exact, 3), unit: 'm/s' },
            { label: md`$\langle v_x'\rangle$ at P`, value: fixed(avgVx - exact, 3), unit: 'm/s', tone: Math.abs(avgVx - exact) < 0.01 * A ? 'good' : 'default' },
            { label: md`$\langle\partial v_x/\partial x\rangle$ at P`, value: fixed(avgD, 3), unit: 's⁻¹' },
            { label: md`$\partial\langle v_x\rangle/\partial x$ at P`, value: fixed(dAvg, 3), unit: 's⁻¹' },
            { label: md`$\partial_x\langle v_x\rangle+\partial_y\langle v_y\rangle$`, value: fixed(cont, 3), unit: 's⁻¹', tone: 'accent' },
          ]}
        />
      }
      footer={
        <Md>{md`**Try this:** press Play and watch the jittery grey arrows (one snapshot) while the blue arrows (the running average) settle onto the dashed mean field $\avg{v}_x = Ax$, $\avg{v}_y=-Ay$. The two derivative readouts agree at every $N$ (average of the derivative = derivative of the average), and the continuity residual stays at zero — averaging cannot create a divergence. Raise the fluctuation level: $\langle v_x'\rangle$ takes longer to die out, but the limit is the same mean field. (Real intensities are only 1–10 %, Eq. 9.4; they are exaggerated here so you can see them.)`}</Md>
      }
    >
      <div ref={box}>
        <svg viewBox="0 0 440 250" className="h-auto w-full" role="img" aria-label="Instantaneous, running-average and exact mean velocity fields of a stagnation flow">
          <rect x={30} y={10} width={400} height={200} fill="var(--field-bg)" stroke="var(--line)" />
          {/* wall */}
          <line x1={30} x2={430} y1={210} y2={210} stroke="var(--ink-2)" strokeWidth={2} />
          {Array.from({ length: 26 }, (_, k) => (
            <line key={k} x1={34 + k * 15.5} y1={211} x2={28 + k * 15.5} y2={219} stroke="var(--ink-3)" strokeWidth={1} />
          ))}
          <text x={436} y={207} textAnchor="end" className="fill-ink-3 text-[10px]">wall</text>
          {/* axes ticks */}
          {[-1, -0.5, 0, 0.5, 1].map((x) => (
            <text key={`tx${x}`} x={sx(x)} y={232} textAnchor="middle" className="fill-ink-3 text-[10px]">{String(x).replace('-', '−')}</text>
          ))}
          <text x={230} y={246} textAnchor="middle" className="fill-ink-2 text-[11px]">x (m)</text>
          {[0, 0.5, 1].map((y) => (
            <text key={`ty${y}`} x={24} y={sy(y) + 3} textAnchor="end" className="fill-ink-3 text-[10px]">{y}</text>
          ))}
          <text x={6} y={20} className="fill-ink-2 text-[11px]">y (m)</text>

          {showMean
            ? XS.flatMap((x, i) =>
                YS.map((y, j) => (
                  <Arrow key={`m${i}-${j}`} x1={sx(x)} y1={sy(y)} x2={sx(x) + A * x * scale} y2={sy(y) + A * y * scale} color="var(--plot-5)" width={1.3} dash="3 2.5" head={6} />
                )),
              )
            : null}
          {inst.map(([x, y, u, v], k) => (
            <Arrow key={`i${k}`} x1={sx(x)} y1={sy(y)} x2={sx(x) + u * scale} y2={sy(y) - v * scale} color="var(--plot-7)" width={1.1} head={5} opacity={0.5} />
          ))}
          {XS.flatMap((x, i) =>
            YS.map((y, j) => {
              const u = a.sx[j * NX + i] / n
              const v = a.sy[j * NX + i] / n
              return <Arrow key={`a${i}-${j}`} x1={sx(x)} y1={sy(y)} x2={sx(x) + u * scale} y2={sy(y) - v * scale} color="var(--plot-1)" width={2} head={7} />
            }),
          )}
          <circle cx={sx(PX)} cy={sy(PY)} r={6} fill="none" stroke="var(--plot-4)" strokeWidth={1.8} />
          <text x={sx(PX) + 8} y={sy(PY) - 8} className="fill-ink text-[11px] font-semibold">P</text>
        </svg>
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-2">
          <span className="inline-flex items-center gap-1.5"><span className="inline-block h-0.5 w-5 bg-[var(--plot-7)]" /> one snapshot</span>
          <span className="inline-flex items-center gap-1.5"><span className="inline-block h-1 w-5 bg-[var(--plot-1)]" /> running average</span>
          <span className="inline-flex items-center gap-1.5"><span className="inline-block h-0.5 w-5 border-t-2 border-dashed border-[var(--plot-5)]" /> exact mean</span>
        </div>
      </div>
    </SimPanel>
  )
}
