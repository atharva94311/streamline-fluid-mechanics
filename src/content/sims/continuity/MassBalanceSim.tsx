import { useCallback, useEffect, useRef, useState } from 'react'
import { Md, PlayPause, Readout, SimPanel, Slider, md, num, useAnimationFrame, usePrefersReducedMotion, useUid } from '@/kit'
import { AX, ArrowMarkers, pn, useOnScreen } from './shared'

/*
 * Mass bookkeeping for a fixed cubic control volume of edge δ = 0.2 m.
 * Mass flux through each face = centre value ± gradient × δ/2. A uniform "through-flow" F0 enters and leaves unchanged.
 * Animation: dots = parcels of mass crossing the faces (rate ∝ face flux); box shading = density inside.
 */
const DELTA = 0.2 // m
const F0 = { x: 3, y: 2.5, z: 2 } // kg/(m²·s)  centre mass fluxes ρu, ρv, ρw
const RHO0 = 1.2 // kg/m³ at the start of each loop
const T_SIM = 0.035 // s of simulated time per loop
const T_REAL = 4.5 // s of real time per loop (slow motion)
const POOL = 96

// geometry (viewBox 0 0 440 300)
const BX0 = 150
const BX1 = 290
const BY0 = 80
const BY1 = 220
const BCX = (BX0 + BX1) / 2
const BCY = (BY0 + BY1) / 2
const LEN = 92 // travel distance of the dots outside the box
const PX_PER_FLUX = 9 // band thickness per kg/(m²·s)

type Face = 0 | 1 | 2 | 3 // x-in, x-out, y-in, y-out
interface Dot {
  on: boolean
  face: Face
  s: number
  off: number
}

const PRESETS = [
  { key: 'steady', label: 'Steady compressible', g: [6, -4, -2] },
  { key: 'fill', label: 'Filling', g: [-4, -3, -1] },
  { key: 'empty', label: 'Emptying', g: [5, 2, 3] },
] as const

function BalanceBars({ gx, gy, gz }: { gx: number; gy: number; gz: number }) {
  const sum = gx + gy + gz
  const rows: { label: string; v: number; color: string; strong?: boolean }[] = [
    { label: '∂(ρu)/∂x', v: gx, color: AX.x },
    { label: '∂(ρv)/∂y', v: gy, color: AX.y },
    { label: '∂(ρw)/∂z', v: gz, color: AX.z },
    { label: 'net outflow', v: sum, color: 'var(--ink-2)', strong: true },
    { label: '∂ρ/∂t', v: -sum, color: 'var(--plot-6)', strong: true },
  ]
  const W = 320
  const x0 = 112
  const half = (W - x0 - 46) / 2
  const mid = x0 + half
  const scale = half / 30
  return (
    <svg viewBox={`0 0 ${W} 150`} className="block h-auto w-full" role="img" aria-label="Rate balance per unit volume">
      <line x1={mid} x2={mid} y1={6} y2={142} stroke="var(--axis)" strokeWidth={1} />
      <text x={mid} y={148} textAnchor="middle" fontSize={9} className="fill-ink-3">0</text>
      {rows.map((r, i) => {
        const y = 10 + i * 26 + (i >= 3 ? 6 : 0)
        const w = Math.max(-half, Math.min(half, r.v * scale))
        return (
          <g key={r.label}>
            <text x={x0 - 6} y={y + 11} textAnchor="end" fontSize={11} fontWeight={r.strong ? 700 : 500} className="fill-ink-2">
              {r.label}
            </text>
            <rect x={w >= 0 ? mid : mid + w} y={y} width={Math.max(0.5, Math.abs(w))} height={16} rx={3} fill={r.color} opacity={r.strong ? 0.9 : 0.75} />
            <text x={mid + half + 4} y={y + 12} fontSize={10.5} fontWeight={600} className="fill-ink">
              {pn(r.v, 2)}
            </text>
          </g>
        )
      })}
      <line x1={x0 - 100} x2={W - 4} y1={85} y2={85} stroke="var(--line)" strokeDasharray="3 3" />
    </svg>
  )
}

export function MassBalanceSim() {
  const [gx, setGx] = useState(-4)
  const [gy, setGy] = useState(-3)
  const [gz, setGz] = useState(-1)
  const [playing, setPlaying] = useState(true)
  const [tShow, setTShow] = useState(0.5 * T_SIM)
  const uid = useUid('mb')
  const wrap = useRef<HTMLDivElement>(null)
  const visible = useOnScreen(wrap)
  const reduced = usePrefersReducedMotion()
  const running = playing && visible && !reduced

  const sum = gx + gy + gz
  const dRho = -sum
  const face = {
    xin: F0.x - (gx * DELTA) / 2,
    xout: F0.x + (gx * DELTA) / 2,
    yin: F0.y - (gy * DELTA) / 2,
    yout: F0.y + (gy * DELTA) / 2,
    zin: F0.z - (gz * DELTA) / 2,
    zout: F0.z + (gz * DELTA) / 2,
  }
  const fluxes: [number, number, number, number] = [face.xin, face.xout, face.yin, face.yout]
  const rhoAt = (t: number) => Math.max(0.05, RHO0 + dRho * t)
  const rho = rhoAt(tShow)
  const vol = DELTA ** 3

  // ---- particle animation (imperative, no React re-render per frame) ----
  const dots = useRef<Dot[]>(Array.from({ length: POOL }, () => ({ on: false, face: 0 as Face, s: 0, off: 0 })))
  const els = useRef<(SVGCircleElement | null)[]>([])
  const credit = useRef<[number, number, number, number]>([0, 0, 0, 0])
  const rand = useRef(num.seededRandom(11))
  const boxEl = useRef<SVGRectElement | null>(null)
  const tSim = useRef(0.5 * T_SIM)
  const lastShow = useRef(0)
  const fluxRef = useRef(fluxes)
  fluxRef.current = fluxes

  const dotPos = useCallback((d: Dot): [number, number, number] => {
    const band = (f: number) => Math.max(4, f * PX_PER_FLUX)
    const s = d.s
    switch (d.face) {
      case 0: {
        const h = band(fluxRef.current[0])
        return [BX0 - LEN + s * LEN, BCY + d.off * h, s > 0.82 ? (1 - s) / 0.18 : Math.min(1, s / 0.1)]
      }
      case 1: {
        const h = band(fluxRef.current[1])
        return [BX1 + s * LEN, BCY + d.off * h, s < 0.18 ? s / 0.18 : Math.min(1, (1 - s) / 0.1)]
      }
      case 2: {
        const h = band(fluxRef.current[2])
        return [BCX + d.off * h, BY1 + LEN - s * LEN, s > 0.82 ? (1 - s) / 0.18 : Math.min(1, s / 0.1)]
      }
      default: {
        const h = band(fluxRef.current[3])
        return [BCX + d.off * h, BY0 - s * LEN, s < 0.18 ? s / 0.18 : Math.min(1, (1 - s) / 0.1)]
      }
    }
  }, [])

  const paint = useCallback(() => {
    dots.current.forEach((d, i) => {
      const el = els.current[i]
      if (!el) return
      if (!d.on) {
        el.setAttribute('opacity', '0')
        return
      }
      const [x, y, o] = dotPos(d)
      el.setAttribute('cx', x.toFixed(1))
      el.setAttribute('cy', y.toFixed(1))
      el.setAttribute('opacity', Math.max(0, Math.min(1, o)).toFixed(2))
    })
  }, [dotPos])

  useAnimationFrame((dt) => {
    // emission: rate ∝ |face flux| (dots per second)
    const f = fluxRef.current
    for (let k = 0; k < 4; k++) {
      credit.current[k] += Math.abs(f[k]) * 2.6 * dt
      while (credit.current[k] >= 1) {
        credit.current[k] -= 1
        const free = dots.current.find((d) => !d.on)
        if (!free) break
        free.on = true
        free.face = k as Face
        free.s = 0
        free.off = rand.current() - 0.5
      }
    }
    for (const d of dots.current) {
      if (!d.on) continue
      d.s += dt / 1.5
      if (d.s >= 1) d.on = false
    }
    paint()
    // density clock
    tSim.current += (dt * T_SIM) / T_REAL
    if (tSim.current > T_SIM) tSim.current = 0
    const rhoNow = Math.max(0.05, RHO0 - (gx + gy + gz) * tSim.current)
    if (boxEl.current) boxEl.current.setAttribute('fill-opacity', (0.08 + 0.32 * Math.min(1, rhoNow / 2.4)).toFixed(3))
    lastShow.current += dt
    if (lastShow.current > 0.12) {
      lastShow.current = 0
      setTShow(tSim.current)
    }
  }, running)

  // static frame (tests, reduced motion, paused): seed a few dots so the picture is meaningful
  useEffect(() => {
    if (running) return
    const r = num.seededRandom(5)
    let i = 0
    for (let k = 0; k < 4; k++)
      for (let j = 0; j < 5; j++) {
        const d = dots.current[i++]
        d.on = true
        d.face = k as Face
        d.s = 0.1 + 0.16 * j
        d.off = r() - 0.5
      }
    for (; i < POOL; i++) dots.current[i].on = false
    paint()
  }, [running, paint, gx, gy, gz])

  const fillOp = 0.08 + 0.32 * Math.min(1, rho / 2.4)
  const band = (f: number) => Math.max(4, f * PX_PER_FLUX)
  const setPreset = (g: readonly [number, number, number]) => {
    setGx(g[0])
    setGy(g[1])
    setGz(g[2])
  }

  return (
    <SimPanel
      title="Mass balance on a fixed control volume"
      subtitle="edge δ = 0.2 m · centre fluxes ρu = 3, ρv = 2.5, ρw = 2 kg/(m²·s)"
      wide
      controls={
        <>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p) => (
              <button key={p.key} type="button" className="btn-ghost text-xs" onClick={() => setPreset(p.g)}>
                {p.label}
              </button>
            ))}
          </div>
          <Slider label={md`$\partial(\rho u)/\partial x$`} value={gx} min={-10} max={10} step={0.5} onChange={setGx} unit="kg/(m³·s)" digits={2} />
          <Slider label={md`$\partial(\rho v)/\partial y$`} value={gy} min={-10} max={10} step={0.5} onChange={setGy} unit="kg/(m³·s)" digits={2} />
          <Slider label={md`$\partial(\rho w)/\partial z$`} value={gz} min={-10} max={10} step={0.5} onChange={setGz} unit="kg/(m³·s)" digits={2} />
          <PlayPause playing={playing} onToggle={() => setPlaying((p) => !p)} onReset={() => { tSim.current = 0; setTShow(0) }} />
        </>
      }
      readout={
        <Readout
          cols={2}
          items={[
            { label: 'net outflow / vol.', value: sum, unit: 'kg/(m³·s)', digits: 3 },
            { label: md`$\partial\rho/\partial t$`, value: dRho, unit: 'kg/(m³·s)', digits: 3, tone: Math.abs(dRho) < 1e-9 ? 'good' : 'accent' },
            { label: 'mass in box', value: rho * vol * 1000, unit: 'g', digits: 3 },
            { label: 'net outflow rate', value: sum * vol * 1000, unit: 'g/s', digits: 3 },
            { label: 'ρ inside (live)', value: rho, unit: 'kg/m³', digits: 3 },
            { label: 'sim. time', value: tShow * 1000, unit: 'ms', digits: 2 },
          ]}
        />
      }
      footer={
        <Md inline>
          {md`**Try this:** press *Steady compressible* — $\partial(\rho u)/\partial x \ne 0$, yet the $y$ and $z$ changes cancel it, so $\partial\rho/\partial t = 0$ and the shading never changes. Then make all three gradients negative: more mass enters than leaves, the box darkens, and $\partial\rho/\partial t$ equals minus the net outflow exactly.`}
        </Md>
      }
    >
      <div ref={wrap} className="space-y-3">
        <svg viewBox="0 0 440 300" className="block h-auto w-full" role="img" aria-label="Control volume with mass fluxes and density shading">
          <defs>
            <ArrowMarkers id={uid} colors={{ x: AX.x, y: AX.y }} size={3.2} />
          </defs>
          {/* flux bands */}
          <rect x={BX0 - LEN} y={BCY - band(face.xin) / 2} width={LEN} height={band(face.xin)} fill={AX.x} opacity={0.13} />
          <rect x={BX1} y={BCY - band(face.xout) / 2} width={LEN} height={band(face.xout)} fill={AX.x} opacity={0.13} />
          <rect x={BCX - band(face.yin) / 2} y={BY1} width={band(face.yin)} height={LEN} fill={AX.y} opacity={0.13} />
          <rect x={BCX - band(face.yout) / 2} y={BY0 - LEN} width={band(face.yout)} height={LEN} fill={AX.y} opacity={0.13} />
          <line x1={BX0 - LEN + 4} y1={BCY} x2={BX0 - 4} y2={BCY} stroke={AX.x} strokeWidth={2} markerEnd={`url(#${uid}-x)`} opacity={0.7} />
          <line x1={BX1 + 4} y1={BCY} x2={BX1 + LEN - 4} y2={BCY} stroke={AX.x} strokeWidth={2} markerEnd={`url(#${uid}-x)`} opacity={0.7} />
          <line x1={BCX} y1={BY1 + LEN - 4} x2={BCX} y2={BY1 + 4} stroke={AX.y} strokeWidth={2} markerEnd={`url(#${uid}-y)`} opacity={0.7} />
          <line x1={BCX} y1={BY0 - 4} x2={BCX} y2={BY0 - LEN + 4} stroke={AX.y} strokeWidth={2} markerEnd={`url(#${uid}-y)`} opacity={0.7} />

          {/* the box */}
          <rect ref={boxEl} x={BX0} y={BY0} width={BX1 - BX0} height={BY1 - BY0} fill="var(--plot-6)" fillOpacity={fillOp} stroke="var(--ink)" strokeWidth={2} rx={3} />
          <text x={BX0 + 8} y={BY0 + 18} fontSize={12} fontWeight={700} className="fill-ink">fixed CV</text>
          <text x={BX0 + 8} y={BY1 - 10} fontSize={11.5} className="fill-ink-2">ρ = {pn(rho, 3)} kg/m³</text>

          {/* z faces (normal to the page) */}
          <g>
            <circle cx={BCX - 26} cy={BCY} r={4 + face.zin * 2.2} fill="none" stroke={AX.z} strokeWidth={2} />
            <circle cx={BCX - 26} cy={BCY} r={2.4} fill={AX.z} />
            <circle cx={BCX + 26} cy={BCY} r={4 + face.zout * 2.2} fill="none" stroke={AX.z} strokeWidth={2} />
            <circle cx={BCX + 26} cy={BCY} r={2.4} fill={AX.z} />
            <text x={BCX - 26} y={BCY + 30} textAnchor="middle" fontSize={10} className="fill-ink-2">z in {pn(face.zin, 2)}</text>
            <text x={BCX + 26} y={BCY + 30} textAnchor="middle" fontSize={10} className="fill-ink-2">z out {pn(face.zout, 2)}</text>
          </g>

          {/* mass parcels */}
          {Array.from({ length: POOL }, (_, i) => (
            <circle
              key={i}
              ref={(el) => {
                els.current[i] = el
              }}
              cx={-20}
              cy={-20}
              r={3.1}
              fill={i % 2 ? 'var(--plot-2)' : 'var(--plot-6)'}
              opacity={0}
            />
          ))}

          {/* face flux labels */}
          <g fontSize={11} fontWeight={600}>
            <text x={BX0 - LEN} y={BCY - band(face.xin) / 2 - 6} fill={AX.x}>in {pn(face.xin, 2)}</text>
            <text x={BX1 + LEN} y={BCY - band(face.xout) / 2 - 6} textAnchor="end" fill={AX.x}>out {pn(face.xout, 2)}</text>
            <text x={BCX + band(face.yin) / 2 + 6} y={BY1 + LEN - 4} fill={AX.y}>in {pn(face.yin, 2)}</text>
            <text x={BCX + band(face.yout) / 2 + 6} y={BY0 - LEN + 12} fill={AX.y}>out {pn(face.yout, 2)}</text>
          </g>
          <text x={436} y={296} textAnchor="end" fontSize={9.5} className="fill-ink-3">face fluxes in kg/(m²·s) · ⊙ = toward you (+z)</text>
        </svg>
        <div className="rounded-xl border border-line bg-surface-2/50 p-2">
          <div className="mb-1 px-1 text-[11px] font-semibold uppercase tracking-wide text-ink-3">Rates per unit volume, kg/(m³·s)</div>
          <BalanceBars gx={gx} gy={gy} gz={gz} />
        </div>
      </div>
    </SimPanel>
  )
}
