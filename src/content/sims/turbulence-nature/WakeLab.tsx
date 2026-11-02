import { useEffect, useRef, useState } from 'react'
import { Zap } from 'lucide-react'
import { Callout, PlayPause, Readout, SimPanel, Slider, Toggle, md, num, useElementSize, useInView, usePrefersReducedMotion } from '@/kit'
import { cssVar } from './signal'

/*
 * Cylinder-wake laboratory (supplementary, qualitative model).
 * Kinematic point-vortex model on top of potential flow past a cylinder (D = 1, U = 1):
 * vortices are shed alternately from the two sides at the Strouhal frequency and convected
 * downstream; dye released at the shoulders shows the wake pattern; a probe records v at (4D, 0).
 * Regime boundaries (≈47, ≈190, ≈1000) are typical literature values for a circular cylinder,
 * NOT taken from Wilkes — Wilkes (p. 482) only uses Re = 100 as an unstable-but-laminar example.
 */

const X0 = -1.5
const X1 = 12.5
const Y0 = -3
const Y1 = 3
const RC = 0.5
const PX = 4
const PY = 0
const SPEED = 3.5
const HIST = 48
const HN = 480
const MAXP = 1700
const MAXV = 80

export type Regime = 'steady' | 'laminar' | 'transitional' | 'turbulent'

export function regimeOf(re: number): Regime {
  if (re < 47) return 'steady'
  if (re < 190) return 'laminar'
  if (re < 1000) return 'transitional'
  return 'turbulent'
}

/** Strouhal number fD/U (Roshko-type fits; approximate, supplementary). */
export function strouhal(re: number): number {
  if (re < 47) return 0.12
  if (re < 190) return 0.212 * (1 - 21.2 / re)
  const st1 = 0.212 * (1 - 21.2 / 190)
  const st2 = 0.212 * (1 - 12.7 / Math.max(re, 300))
  if (re < 300) return st1 + ((st2 - st1) * (re - 190)) / 110
  return st2
}

interface Vortex {
  x: number
  y: number
  g: number
  rc: number
  age: number
  grow: number
  tau: number
  uc: number
  drift: number
}

interface Sim {
  t: number
  nextShed: number
  side: number
  vort: Vortex[]
  px: Float32Array
  py: Float32Array
  pk: Uint8Array
  head: number
  emitAcc: number
  freeAcc: number
  rand: () => number
  hist: Float32Array
  histHead: number
  histCount: number
  sampleAcc: number
  sway: { t: number; amp: number } | null
}

function createSim(): Sim {
  return {
    t: 0,
    nextShed: 0,
    side: 1,
    vort: [],
    px: new Float32Array(MAXP),
    py: new Float32Array(MAXP),
    pk: new Uint8Array(MAXP),
    head: 0,
    emitAcc: 0,
    freeAcc: 0,
    rand: num.seededRandom(2024),
    hist: new Float32Array(HN),
    histHead: 0,
    histCount: 0,
    sampleAcc: 0,
    sway: null,
  }
}

// ---- field evaluation (scratch arrays, refreshed every step) ----
const VX = new Float64Array(MAXV + 2)
const VY = new Float64Array(MAXV + 2)
const VG = new Float64Array(MAXV + 2)
const VR = new Float64Array(MAXV + 2)
let NV = 0
let DEFICIT = 0.3
let U_ = 0
let V_ = 0

function prepareField(s: Sim, re: number) {
  const reg = regimeOf(re)
  NV = 0
  for (const v of s.vort) {
    if (NV >= MAXV) break
    const ramp = Math.min(1, v.age / v.grow)
    VX[NV] = v.x
    VY[NV] = v.y
    VG[NV] = (v.g * ramp * Math.exp(-v.age / v.tau)) / (2 * Math.PI)
    VR[NV] = v.rc * v.rc
    NV++
  }
  DEFICIT = reg === 'steady' ? 0.36 : 0.3
  if (reg === 'steady') {
    const Lr = Math.max(0, 0.05 * re - 0.25)
    const xb = RC + 0.45 * Lr + 0.05
    const g = (1.5 * Math.min(1, Lr / 2)) / (2 * Math.PI)
    let d = 0
    if (s.sway) {
      const age = s.t - s.sway.t
      const sigma = -(0.05 + (0.5 * (47 - re)) / 47)
      d = s.sway.amp * Math.exp(sigma * age) * Math.sin(2 * Math.PI * 0.12 * age)
      if (Math.abs(d) < 1e-4 && age > 5) s.sway = null
    }
    if (g > 0) {
      VX[NV] = xb
      VY[NV] = 0.3 + d
      VG[NV] = -g
      VR[NV] = 0.09
      NV++
      VX[NV] = xb
      VY[NV] = -0.3 + d
      VG[NV] = g
      VR[NV] = 0.09
      NV++
    }
  }
}

function vel(x: number, y: number) {
  const r2 = x * x + y * y
  let u = 0
  let v = 0
  if (r2 > RC * RC * 0.98) {
    const r4 = r2 * r2
    u = 1 - (RC * RC * (x * x - y * y)) / r4
    v = -(2 * RC * RC * x * y) / r4
  }
  if (x > 0) {
    const b = 0.42 + 0.07 * x
    u -= (DEFICIT * Math.exp(-(y * y) / (b * b)) * Math.min(1, x / 0.6)) / (1 + 0.12 * x)
  }
  for (let i = 0; i < NV; i++) {
    const dx = x - VX[i]
    const dy = y - VY[i]
    const k = VG[i] / (dx * dx + dy * dy + VR[i])
    u -= k * dy
    v += k * dx
  }
  U_ = u
  V_ = v
}

function shed(s: Sim, re: number, reg: Regime) {
  const r = s.rand
  const Ts = 1 / strouhal(re)
  const A = reg === 'laminar' ? Math.min(1, Math.sqrt((re - 47) / 60)) : 1
  const j = reg === 'laminar' ? 0 : reg === 'transitional' ? (Math.log10(re) - Math.log10(190)) / (3 - Math.log10(190)) : 1
  const side = s.side
  s.vort.push({
    x: 0.85 + 0.25 * j * (r() - 0.5),
    y: side * (0.32 + 0.3 * j * (r() - 0.5)),
    g: -side * 2.0 * A * (1 + 0.6 * j * (r() - 0.5)),
    rc: 0.38,
    age: 0,
    grow: 0.3 * Ts,
    tau: reg === 'laminar' ? 40 : reg === 'transitional' ? 16 : 8,
    uc: 0.86 + 0.08 * j * (r() - 0.5),
    drift: side * 0.022 + 0.08 * j * (r() - 0.5),
  })
  const nSmall =
    reg === 'transitional' ? Math.round(3 * j * r()) : reg === 'turbulent' ? Math.round(3 + 2 * Math.min(3, Math.log10(re / 1000)) + 3 * r()) : 0
  for (let k = 0; k < nSmall; k++) {
    const x = 1.2 + 5 * r()
    s.vort.push({
      x,
      y: (r() - 0.5) * (0.9 + 0.22 * x),
      g: (r() < 0.5 ? -1 : 1) * (0.3 + 0.7 * r()),
      rc: 0.1 + 0.16 * r(),
      age: 0,
      grow: 0.4,
      tau: 1.2 + 3 * r(),
      uc: 0.72 + 0.22 * r(),
      drift: 0.16 * (r() - 0.5),
    })
  }
  s.side = -side
  s.nextShed += (Ts / 2) * (1 + 0.55 * j * (r() - 0.5))
}

function emit(s: Sim, x: number, y: number, kind: number) {
  const h = s.head
  s.px[h] = x
  s.py[h] = y
  s.pk[h] = kind
  s.head = (h + 1) % MAXP
}

function step(s: Sim, re: number, dt: number) {
  const reg = regimeOf(re)
  s.t += dt
  if (reg !== 'steady') {
    if (s.nextShed < s.t - 4) s.nextShed = s.t
    let guard = 0
    while (s.t >= s.nextShed && guard++ < 6) shed(s, re, reg)
  } else s.nextShed = s.t + 0.2
  for (let i = s.vort.length - 1; i >= 0; i--) {
    const v = s.vort[i]
    v.age += dt
    v.x += v.uc * dt
    v.y += v.drift * dt
    if (v.x > X1 + 2 || v.age > 5 * v.tau) s.vort.splice(i, 1)
  }
  if (s.vort.length > MAXV) s.vort.splice(0, s.vort.length - MAXV)
  prepareField(s, re)

  // dye from the two shoulders, faint streaks in the outer flow
  s.emitAcc += dt * 16
  while (s.emitAcc >= 1) {
    s.emitAcc -= 1
    const jit = (s.rand() - 0.5) * 0.02
    emit(s, 0.02, 0.535 + jit, 1)
    emit(s, 0.02, -0.535 - jit, 1)
  }
  s.freeAcc += dt * 3
  while (s.freeAcc >= 1) {
    s.freeAcc -= 1
    for (const y of [-2.2, -1.3, 1.3, 2.2]) emit(s, X0 + 0.05, y, 2)
  }

  for (let i = 0; i < MAXP; i++) {
    if (!s.pk[i]) continue
    const x = s.px[i]
    const y = s.py[i]
    vel(x, y)
    const xm = x + 0.5 * dt * U_
    const ym = y + 0.5 * dt * V_
    vel(xm, ym)
    const nx = x + dt * U_
    const ny = y + dt * V_
    if (!Number.isFinite(nx) || !Number.isFinite(ny) || nx > X1 + 0.2 || nx < X0 - 0.5 || Math.abs(ny) > Y1 + 0.3 || nx * nx + ny * ny < RC * RC) {
      s.pk[i] = 0
      continue
    }
    s.px[i] = nx
    s.py[i] = ny
  }

  s.sampleAcc += dt
  const ds = HIST / HN
  while (s.sampleAcc >= ds) {
    s.sampleAcc -= ds
    vel(PX, PY)
    s.hist[s.histHead] = V_
    s.histHead = (s.histHead + 1) % HN
    s.histCount = Math.min(HN, s.histCount + 1)
  }
}

function kick(s: Sim, re: number) {
  const reg = regimeOf(re)
  const r = s.rand
  const tau = reg === 'steady' ? 0.6 + (5 * re) / 47 : reg === 'laminar' ? 6 : 3
  const y0 = (r() < 0.5 ? -1 : 1) * 0.25
  s.vort.push({ x: 1.1, y: y0, g: (r() < 0.5 ? -1 : 1) * 1.3, rc: 0.3, age: 0, grow: 0.15, tau, uc: 0.62, drift: 0 })
  if (reg === 'steady') s.sway = { t: s.t, amp: 0.3 }
  if (reg === 'transitional' || reg === 'turbulent') {
    const n = reg === 'turbulent' ? 8 : 4
    for (let k = 0; k < n; k++) {
      s.vort.push({
        x: 1.1 + 1.6 * r(),
        y: y0 + (r() - 0.5) * 1.2,
        g: (r() < 0.5 ? -1 : 1) * (0.4 + 0.6 * r()),
        rc: 0.1 + 0.12 * r(),
        age: 0,
        grow: 0.3,
        tau: 1.5 + 2.5 * r(),
        uc: 0.7 + 0.2 * r(),
        drift: 0.2 * (r() - 0.5),
      })
    }
  }
}

function repeatability(s: Sim, re: number): number | null {
  const M = Math.min(s.histCount, 320)
  const lag = Math.round(1 / strouhal(re) / (HIST / HN))
  if (M - lag < 60) return null
  const arr = new Float64Array(M)
  for (let i = 0; i < M; i++) arr[i] = s.hist[(s.histHead - M + i + HN * 4) % HN]
  let ma = 0
  let mb = 0
  const n = M - lag
  for (let i = 0; i < n; i++) {
    ma += arr[i + lag]
    mb += arr[i]
  }
  ma /= n
  mb /= n
  let sab = 0
  let saa = 0
  let sbb = 0
  for (let i = 0; i < n; i++) {
    const a = arr[i + lag] - ma
    const b = arr[i] - mb
    sab += a * b
    saa += a * a
    sbb += b * b
  }
  if (Math.sqrt(saa / n) < 0.02 || Math.sqrt(sbb / n) < 0.02) return null
  return sab / Math.sqrt(saa * sbb)
}

interface Colors {
  bg: string
  dye: string
  free: string
  body: string
  line: string
  probe: string
  cw: string
  ccw: string
  ink: string
  grid: string
}

function readColors(el: Element): Colors {
  return {
    bg: cssVar(el, '--field-bg', '#fbfcff'),
    dye: cssVar(el, '--plot-2', '#0891b2'),
    free: cssVar(el, '--ink-3', '#64748b'),
    body: cssVar(el, '--body-fill', '#cbd5e1'),
    line: cssVar(el, '--line', '#e2e6ef'),
    probe: cssVar(el, '--plot-3', '#d97706'),
    cw: cssVar(el, '--plot-4', '#e11d48'),
    ccw: cssVar(el, '--plot-1', '#4f46e5'),
    ink: cssVar(el, '--ink-2', '#334155'),
    grid: cssVar(el, '--grid', '#e5e8f0'),
  }
}

function drawField(ctx: CanvasRenderingContext2D, s: Sim, W: number, H: number, c: Colors, cores: boolean) {
  const sx = (x: number) => ((x - X0) / (X1 - X0)) * W
  const sy = (y: number) => ((Y1 - y) / (Y1 - Y0)) * H
  const sc = W / (X1 - X0)
  ctx.fillStyle = c.bg
  ctx.fillRect(0, 0, W, H)
  ctx.globalAlpha = 0.5
  ctx.fillStyle = c.free
  for (let i = 0; i < MAXP; i++) if (s.pk[i] === 2) ctx.fillRect(sx(s.px[i]) - 0.8, sy(s.py[i]) - 0.8, 1.6, 1.6)
  ctx.globalAlpha = 0.85
  ctx.fillStyle = c.dye
  for (let i = 0; i < MAXP; i++) if (s.pk[i] === 1) ctx.fillRect(sx(s.px[i]) - 1, sy(s.py[i]) - 1, 2, 2)
  ctx.globalAlpha = 1
  if (cores) {
    ctx.lineWidth = 1.5
    for (let i = 0; i < NV; i++) {
      ctx.strokeStyle = VG[i] < 0 ? c.cw : c.ccw
      ctx.beginPath()
      ctx.arc(sx(VX[i]), sy(VY[i]), Math.max(2, Math.sqrt(VR[i]) * sc), 0, 2 * Math.PI)
      ctx.stroke()
    }
  }
  ctx.fillStyle = c.body
  ctx.strokeStyle = c.ink
  ctx.lineWidth = 1.2
  ctx.beginPath()
  ctx.arc(sx(0), sy(0), RC * sc, 0, 2 * Math.PI)
  ctx.fill()
  ctx.stroke()
  ctx.strokeStyle = c.probe
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(sx(PX), sy(PY), 5, 0, 2 * Math.PI)
  ctx.moveTo(sx(PX) - 9, sy(PY))
  ctx.lineTo(sx(PX) + 9, sy(PY))
  ctx.moveTo(sx(PX), sy(PY) - 9)
  ctx.lineTo(sx(PX), sy(PY) + 9)
  ctx.stroke()
  ctx.fillStyle = c.ink
  ctx.font = '600 11px "Inter Variable", system-ui, sans-serif'
  ctx.fillText('probe', sx(PX) + 8, sy(PY) - 8)
  ctx.fillText('flow →', 6, 14)
}

function drawTrace(ctx: CanvasRenderingContext2D, s: Sim, W: number, H: number, c: Colors) {
  const padL = 34
  const padR = 8
  ctx.fillStyle = c.bg
  ctx.fillRect(0, 0, W, H)
  const sy = (v: number) => H / 2 - (v / 1.1) * (H / 2 - 10)
  ctx.strokeStyle = c.grid
  ctx.lineWidth = 1
  ctx.beginPath()
  for (const v of [-1, -0.5, 0.5, 1]) {
    ctx.moveTo(padL, sy(v))
    ctx.lineTo(W - padR, sy(v))
  }
  ctx.stroke()
  ctx.strokeStyle = c.free
  ctx.beginPath()
  ctx.moveTo(padL, sy(0))
  ctx.lineTo(W - padR, sy(0))
  ctx.stroke()
  ctx.fillStyle = c.free
  ctx.font = '10px "Inter Variable", system-ui, sans-serif'
  ctx.fillText('+1', 6, sy(1) + 3)
  ctx.fillText(' 0', 6, sy(0) + 3)
  ctx.fillText('−1', 6, sy(-1) + 3)
  ctx.fillText(`last ${HIST} D/U →`, W - padR - 92, H - 4)
  ctx.fillText('v/U at probe', padL + 4, 11)
  const n = s.histCount
  if (n < 2) return
  ctx.strokeStyle = c.probe
  ctx.lineWidth = 1.6
  ctx.beginPath()
  for (let k = 0; k < n; k++) {
    const idx = (s.histHead - n + k + HN * 4) % HN
    const x = padL + ((HN - n + k) / (HN - 1)) * (W - padL - padR)
    const y = sy(Math.max(-1.25, Math.min(1.25, s.hist[idx])))
    if (k) ctx.lineTo(x, y)
    else ctx.moveTo(x, y)
  }
  ctx.stroke()
}

const INFO: Record<Regime, { name: string; pattern: string; turbulent: string; tone: 'good' | 'bad' | 'accent' | 'default' }> = {
  steady: { name: 'steady laminar wake', pattern: 'steady (no shedding)', turbulent: 'No', tone: 'good' },
  laminar: { name: 'laminar vortex shedding', pattern: 'periodic, regular', turbulent: 'No', tone: 'good' },
  transitional: { name: 'transitional wake', pattern: 'periodic + irregular', turbulent: 'Partly', tone: 'accent' },
  turbulent: { name: 'turbulent wake', pattern: 'random, many sizes', turbulent: 'Yes', tone: 'bad' },
}

const KICK_MSG: Record<Regime, string> = {
  steady: 'Kick damped out by viscosity — the wake returns to its steady state.',
  laminar: 'Kick swept downstream — the same regular street carries on (unstable, but still laminar).',
  transitional: 'Kick breaks up into smaller eddies that wander irregularly.',
  turbulent: 'Kick shredded into random eddies — lost in the turbulence.',
}

/** Interactive: cylinder wake from steady laminar to turbulent. */
export function WakeLab() {
  const [re, setRe] = useState(100)
  const [cores, setCores] = useState(false)
  const reduced = usePrefersReducedMotion()
  const [playing, setPlaying] = useState(true)
  const [metric, setMetric] = useState<number | null>(null)
  const [kickMsg, setKickMsg] = useState('')
  const [wrapRef, size] = useElementSize<HTMLDivElement>()
  const inView = useInView(wrapRef)
  const W = Math.max(280, Math.round(size.width || 640))
  const H = Math.round((W * (Y1 - Y0)) / (X1 - X0))
  const TH = 96
  const fieldRef = useRef<HTMLCanvasElement>(null)
  const traceRef = useRef<HTMLCanvasElement>(null)
  const simRef = useRef<Sim | null>(null)
  if (!simRef.current) simRef.current = createSim()
  const reRef = useRef(re)
  reRef.current = re
  const coresRef = useRef(cores)
  coresRef.current = cores
  const kickRef = useRef(false)
  const reg = regimeOf(re)
  const live = playing
  const staticRe = useRef(re)

  useEffect(() => {
    if (reduced) setPlaying(false)
  }, [reduced])

  useEffect(() => {
    const cv = fieldRef.current
    const tv = traceRef.current
    const ctx = cv?.getContext?.('2d') ?? null
    const tctx = tv?.getContext?.('2d') ?? null
    if (!cv || !tv || !ctx || !tctx) return
    const dpr = window.devicePixelRatio || 1
    cv.width = Math.round(W * dpr)
    cv.height = Math.round(H * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    tv.width = Math.round(W * dpr)
    tv.height = Math.round(TH * dpr)
    tctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    const s = simRef.current!
    let colors = readColors(cv)
    const render = () => {
      drawField(ctx, s, W, H, colors, coresRef.current)
      drawTrace(tctx, s, W, TH, colors)
    }
    if (!live || !inView) {
      const changed = staticRe.current !== reRef.current
      staticRe.current = reRef.current
      const target = s.t + (s.t < 1 ? 36 : changed ? 24 : 0)
      while (s.t < target) step(s, reRef.current, 0.05)
      prepareField(s, reRef.current)
      render()
      return
    }
    let raf = 0
    let last = performance.now()
    let frame = 0
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      if (kickRef.current) {
        kick(s, reRef.current)
        kickRef.current = false
      }
      step(s, reRef.current, dt * SPEED)
      frame++
      if (frame % 45 === 0) {
        colors = readColors(cv)
        const m = repeatability(s, reRef.current)
        setMetric((old) => (m == null ? null : old != null && Math.abs(old - m) < 0.02 ? old : m))
      }
      render()
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [live, inView, W, H, cores, live ? 0 : re]) // eslint-disable-line react-hooks/exhaustive-deps

  const st = strouhal(re)
  const info = INFO[reg]
  const onKick = () => {
    kickRef.current = true
    setKickMsg(KICK_MSG[reg])
    if (!playing) setPlaying(true)
  }

  return (
    <SimPanel
      title="Cylinder-wake lab: unsteady ≠ turbulent"
      subtitle="dye from the cylinder shoulders · probe at 4 D downstream"
      wide
      controls={
        <>
          <Slider label={md`Reynolds number $\Rey = UD/\nu$`} value={re} min={10} max={100000} log onChange={setRe} digits={3} />
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={onKick} className="btn-primary bg-amber-600 hover:bg-amber-700">
              <Zap className="h-4 w-4" /> Kick the wake
            </button>
            <PlayPause playing={live} onToggle={() => setPlaying((p) => !p)} />
          </div>
          <Toggle label="show vortex cores" checked={cores} onChange={setCores} />
          {kickMsg ? <p className="rounded-lg bg-amber-50 px-3 py-2 text-[13px] text-ink-2 dark:bg-amber-500/10">{kickMsg}</p> : null}
        </>
      }
      readout={
        <Readout
          cols={2}
          items={[
            { label: 'regime', value: info.name, tone: info.tone },
            { label: 'pattern', value: info.pattern },
            { label: 'Strouhal no. $fD/U$', value: reg === 'steady' ? '—' : st.toFixed(3) },
            { label: 'repeatability $r$', value: metric == null ? '—' : metric.toFixed(2), tone: metric != null && metric > 0.9 ? 'good' : 'default' },
            { label: 'turbulent?', value: info.turbulent, tone: info.tone },
            { label: 'shedding period $T_sU/D$', value: reg === 'steady' ? '—' : (1 / st).toFixed(1) },
          ]}
        />
      }
      footer={
        <span>
          <b>Try this:</b> at Re = 100 (Wilkes’s example) the street is unsteady yet repeats exactly — the repeatability r (correlation of the probe
          signal with itself one shedding period earlier) stays near 1. Drop below Re ≈ 47 and kick the wake: the disturbance dies away. Push Re
          above 1000: r collapses because the signal has become random — that randomness, not mere unsteadiness, is what makes it turbulent.
        </span>
      }
    >
      <div ref={wrapRef} className="w-full">
        <canvas ref={fieldRef} className="block rounded-lg border border-line" style={{ width: W, height: H, maxWidth: '100%' }} />
        <canvas ref={traceRef} className="mt-2 block rounded-lg border border-line" style={{ width: W, height: TH, maxWidth: '100%' }} />
        <div className="mt-2">
          <Callout kind="note" title="Model note">
            <span className="text-[13px]">
              Qualitative point-vortex model. The regime boundaries used here (shedding starts near Re ≈ 47, the wake turns three-dimensional near
              Re ≈ 190 and is fully turbulent beyond roughly Re ≈ 1000) are typical values for a circular cylinder from the fluid-mechanics
              literature, not from Wilkes.
            </span>
          </Callout>
        </div>
      </div>
    </SimPanel>
  )
}
