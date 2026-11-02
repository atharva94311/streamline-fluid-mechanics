import { useRef, useState } from 'react'
import {
  Md, PlayPause, Segmented, SimPanel, Slider, num, useAnimationFrame, useInView, usePrefersReducedMotion, useUid,
} from '@/kit'
import { COLORS } from './model'
import { ArrowDefs, HatchDef, SvgLabel, edgeFade, useDesignWidth } from './svg'
import { Tiles } from './Tiles'

type FluidId = 'air' | 'water'

/** Representative property values (≈20–25 °C) — supplementary data, not from the PDFs. */
const FLUIDS: Record<FluidId, { name: string; rho: number; cp: number; Pr: number; v: [number, number, number]; m: [number, number, number] }> = {
  air: { name: 'Air', rho: 1.18, cp: 1005, Pr: 0.71, v: [2, 30, 12], m: [0.005, 0.2, 0.04] },
  water: { name: 'Water', rho: 998, cp: 4180, Pr: 7.0, v: [0.2, 4, 1.0], m: [0.3, 20, 2.8] },
}

const MAX_LANES = 10

function fmtFlux(w: number): string {
  return Math.abs(w) >= 1000 ? `${num.fmt(w / 1000, 3)} kW/m²` : `${num.fmt(w, 3)} W/m²`
}

/** Concept 1 interactive: the eddy-exchange (Reynolds-analogy) model with live momentum and heat bookkeeping. */
export function EddyLab() {
  const [fluid, setFluid] = useState<FluidId>('air')
  const F = FLUIDS[fluid]
  const [m, setM] = useState(F.m[2])
  const [v, setV] = useState(F.v[2])
  const [dT, setDT] = useState(40)
  const [playing, setPlaying] = useState(true)

  const pickFluid = (id: FluidId) => {
    setFluid(id)
    setM(FLUIDS[id].m[2])
    setV(FLUIDS[id].v[2])
  }

  const tau = m * v // (9.95)
  const h = m * F.cp // from (9.96): q = m c_p ΔT = h ΔT
  const q = h * dT // (9.96)
  const half = tau / (F.rho * v * v) // f_F/2 = τ_w/(ρ v̄²) = m/(ρ v̄)
  const St = h / (F.rho * v * F.cp) // (9.99)
  const ratio = St / half

  // activity level 0..1 on a log scale of the slider range
  const level = Math.log(m / F.m[0]) / Math.log(F.m[1] / F.m[0])
  const lanes = Math.max(2, Math.min(MAX_LANES, Math.round(2 + level * (MAX_LANES - 2))))
  const vLevel = (v - F.v[0]) / (F.v[1] - F.v[0])

  return (
    <SimPanel
      title="Eddy-exchange lab"
      subtitle="the Reynolds-analogy model of Fig. 9.13, live"
      controls={
        <>
          <Segmented
            label="Fluid (typical properties near 20 °C)"
            options={[
              { value: 'air', label: 'Air' },
              { value: 'water', label: 'Water' },
            ]}
            value={fluid}
            onChange={pickFluid}
          />
          <Slider label="eddy mass flux $m$" value={m} min={F.m[0]} max={F.m[1]} log onChange={setM} unit="kg/(m²·s)" />
          <Slider label="mainstream velocity $\overline{v}_{zm}$" value={v} min={F.v[0]} max={F.v[1]} step={(F.v[1] - F.v[0]) / 200} onChange={setV} unit="m/s" />
          <Slider label="$\overline{T}_m-\overline{T}_w$" value={dT} min={2} max={80} step={1} onChange={setDT} unit="K" digits={2} />
          <PlayPause playing={playing} onToggle={() => setPlaying((p) => !p)} />
        </>
      }
      readout={
        <Tiles
          cols={2}
          items={[
            { label: '$\\tau_w = m\\overline{v}_{zm}$', value: tau, unit: 'Pa' },
            { label: '$q = mc_p\\Delta\\overline{T}$', value: fmtFlux(q) },
            { label: '$f_\\mathrm{F}/2 = m/(\\rho\\overline{v}_{zm})$', value: half, digits: 3 },
            { label: '$\\St = h/(\\rho\\overline{v}_{zm}c_p)$', value: St, digits: 3 },
            { label: '$\\St\\,/\\,(f_\\mathrm{F}/2)$', value: ratio.toFixed(3), tone: 'good' },
            { label: '$h = mc_p$', value: h, unit: 'W/(m²·K)' },
            { label: `$\\Pran$ of ${F.name.toLowerCase()}`, value: F.Pr.toFixed(2), tone: Math.abs(Math.log(F.Pr)) > 0.7 ? 'bad' : 'accent' },
            { label: 'exchanged fraction', value: `${num.fmt(100 * half, 3)} %` },
          ]}
        />
      }
      footer={
        <Md inline>
          {String.raw`**Try this:** double $m$ — both $\tau_w$ and $q$ double, yet $\St/(f_\mathrm{F}/2)$ stays exactly 1. Then switch air → water: $\tau_w$, $q$ and $h$ change by orders of magnitude, but the model *still* says $\St = f_\mathrm{F}/2$, because $\mu$ and $k$ (hence $\Pran$) never enter it. That blind spot is what Concepts 2 and 3 fix.`}
        </Md>
      }
    >
      <EddyScene lanes={lanes} vLevel={vLevel} playing={playing} />
      <Ledger tau={tau} q={q} m={m} v={v} />
    </SimPanel>
  )
}

/** Animated channel cross-section: `lanes` eddy paths alternating down (hot) and up (cold). */
function EddyScene({ lanes, vLevel, playing }: { lanes: number; vLevel: number; playing: boolean }) {
  const [ref, W] = useDesignWidth(320, 640)
  const uid = useUid('lab')
  const inView = useInView(ref)
  const reduced = usePrefersReducedMotion()
  const x0 = 10
  const x1 = W - 10
  const yTop = 52
  const yw = 190
  const H = yw + 34
  const refs = useRef<(SVGGElement | null)[]>([])
  const phase = useRef(0)
  const laneX = (i: number) => x0 + ((i + 0.5) / MAX_LANES) * (x1 - x0)
  const laneOffset = (i: number) => ((i * 0.37) % 1 + (i % 2) * 0.5) % 1
  const posOf = (i: number, t: number) => {
    const down = i % 2 === 0
    const y = down ? yTop + t * (yw - 12 - yTop) : yw - 12 - t * (yw - 12 - yTop)
    return `translate(${laneX(i)},${y})`
  }
  const active = (i: number) => {
    // spread the active lanes across the width
    const order = [0, 9, 4, 5, 2, 7, 1, 8, 3, 6]
    return order.indexOf(i) < lanes
  }

  useAnimationFrame(
    (dt) => {
      phase.current = (phase.current + dt * 0.38) % 1
      for (let i = 0; i < MAX_LANES; i++) {
        const el = refs.current[i]
        if (!el) continue
        const t = (phase.current + laneOffset(i)) % 1
        el.setAttribute('transform', posOf(i, t))
        el.setAttribute('opacity', active(i) ? String(edgeFade(t)) : '0')
      }
    },
    playing && inView && !reduced,
  )

  const streakDur = 2.6 - 2 * Math.max(0, Math.min(1, vLevel))
  const anim = playing && inView && !reduced

  return (
    <div ref={ref} className="w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label="Eddies exchanging fluid between the mainstream and the wall">
        <defs>
          <ArrowDefs uid={uid} colors={{ hot: COLORS.hot }} />
          <HatchDef id={`${uid}-hatch`} />
        </defs>
        <rect x={x0} y={8} width={x1 - x0} height={yw - 8} rx={6} fill="var(--surface-2)" />
        <rect x={x0} y={8} width={x1 - x0} height={yTop - 14} rx={6} fill={COLORS.hot} opacity={0.12} />
        {[22, 36].map((y) => (
          <line
            key={y}
            x1={x0 + 8}
            x2={x1 - 14}
            y1={y}
            y2={y}
            stroke={COLORS.hot}
            strokeWidth={1.6}
            strokeDasharray="6 8"
            className={anim ? 'flow-dash' : undefined}
            style={anim ? { animationDuration: `${streakDur}s` } : undefined}
            markerEnd={`url(#${uid}-hot)`}
          />
        ))}
        <SvgLabel x={x0 + 8} y={29} label={String.raw`mainstream: $\overline{v}_{zm}$, $\overline{T}_m$`} size={11.5} box w={190} />
        <rect x={x0} y={yw} width={x1 - x0} height={10} fill={`url(#${uid}-hatch)`} stroke="var(--ink-3)" strokeWidth={0.8} />
        <SvgLabel x={x0 + 8} y={yw + 22} label={String.raw`wall: $\overline{v}_{zw}=0$, $\overline{T}_w$`} size={11.5} w={190} />
        <SvgLabel x={x1 - 4} y={yw + 22} label={`${lanes} of ${MAX_LANES} eddy paths active`} size={11} align="end" w={200} className="text-ink-3" />
        {Array.from({ length: MAX_LANES }, (_, i) => (
          <line
            key={`l${i}`}
            x1={laneX(i)}
            x2={laneX(i)}
            y1={yTop}
            y2={yw - 4}
            stroke={i % 2 === 0 ? COLORS.hot : COLORS.cold}
            strokeWidth={1}
            strokeDasharray="2 4"
            opacity={active(i) ? 0.55 : 0.12}
          />
        ))}
        {Array.from({ length: MAX_LANES }, (_, i) => {
          const t = (phase.current + laneOffset(i)) % 1
          const down = i % 2 === 0
          return (
            <g
              key={`p${i}`}
              ref={(el) => {
                refs.current[i] = el
              }}
              transform={posOf(i, t)}
              opacity={active(i) ? edgeFade(t) : 0}
            >
              <circle r={7.5} fill={down ? COLORS.hot : COLORS.cold} stroke="var(--surface)" strokeWidth={1.4} />
              {down ? <path d="M-3,-3.5 L4,0 L-3,3.5 z" fill="var(--surface)" /> : null}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

/** Per-unit-area bookkeeping with the wall temperature as enthalpy datum. */
function Ledger({ tau, q, m, v }: { tau: number; q: number; m: number; v: number }) {
  const rows = [
    { what: 'carried **down** by eddies', mom: `$m\\overline{v}_{zm}$ = ${num.fmt(m * v, 3)} Pa`, heat: `$mc_p(\\overline{T}_m-\\overline{T}_w)$ = ${fmtFlux(q)}` },
    { what: 'carried **back up**', mom: '$m\\overline{v}_{zw} = 0$', heat: '$0$ (leaves at $\\overline{T}_w$)' },
    { what: '**net to the wall**', mom: `$\\tau_w$ = ${num.fmt(tau, 3)} Pa`, heat: `$q$ = ${fmtFlux(q)}` },
  ]
  return (
    <div className="mt-3 overflow-x-auto rounded-xl border border-line">
      <table className="w-full min-w-[300px] text-left text-xs text-ink-2">
        <thead className="bg-surface-2 text-[11px] tracking-wide text-ink-3">
          <tr>
            <th className="px-2.5 py-1.5 font-semibold">per m² of wall, per s</th>
            <th className="px-2.5 py-1.5 font-semibold">z-momentum</th>
            <th className="px-2.5 py-1.5 font-semibold">
              <Md inline>{String.raw`heat (datum $\overline{T}_w$)`}</Md>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-line">
              <td className="px-2.5 py-1.5"><Md inline>{r.what}</Md></td>
              <td className="px-2.5 py-1.5 font-mono"><Md inline>{r.mom}</Md></td>
              <td className="px-2.5 py-1.5 font-mono"><Md inline>{r.heat}</Md></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
