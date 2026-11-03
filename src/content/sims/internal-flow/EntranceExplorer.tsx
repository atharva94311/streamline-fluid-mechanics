/**
 * Concept "entrance-length": calculator for Eq. 8.1 (laminar L/D ≃ 0.06 Re, Fox p. 277) and the turbulent range
 * (mean profile 25–40 D, turbulence details 80+ D), with an animated developing profile.
 * The profile shapes come from the supplementary boundary-layer + core model in model.ts (mass-conserving,
 * schematic). The pipe is drawn axially compressed: x is shown relative to the entrance length.
 */
import { useMemo, useRef, useState } from 'react'
import {
  PlayPause, Plot, Readout, Segmented, SimPanel, Slider, md, num, useAnimationFrame, useInView, usePrefersReducedMotion, useUid,
} from '@/kit'
import { RE_CRIT, centreRatio, deltaOverR, fmtRe, uOverVbar } from './model'

const XIN = 30
const XEND = 460
const XI_MAX = 1.25 // pipe drawn up to 1.25 L
const YC = 92
const R = 56
const XS = 400 // x-pixel of x/L = XI_MAX (leaves room for the profile arrows)
const sxOf = (x: number) => XIN + (x / XI_MAX) * (XS - XIN)
const XI_WRAP = (XI_MAX * (XEND - XIN)) / (XS - XIN) // tracers run to the end of the drawn pipe
const LANES = [-0.92, -0.75, -0.55, -0.3, 0, 0.3, 0.55, 0.75, 0.92]

export function EntranceExplorer() {
  const [logRe, setLogRe] = useState(Math.log10(1000))
  const [Dmm, setDmm] = useState(25)
  const [xi, setXi] = useState(0.3)
  const [view, setView] = useState<'pipe' | 'chart'>('pipe')
  const [playing, setPlaying] = useState(true)
  const reduced = usePrefersReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref)
  const uid = useUid('ent')

  const Re = 10 ** logRe
  const D = Dmm / 1000
  const turbulent = Re >= RE_CRIT
  const LD = turbulent ? 40 : 0.06 * Re // length used to scale the drawing
  const Lm = LD * D

  // tracers: one per lane, several per lane
  const tracers = useRef<{ lane: number; xi: number }[]>(
    LANES.flatMap((_, li) => Array.from({ length: 6 }, (_, k) => ({ lane: li, xi: (k / 6) * XI_WRAP }))),
  )
  const [, setTick] = useState(0)
  useAnimationFrame(
    (dt) => {
      for (const p of tracers.current) {
        const u = uOverVbar(LANES[p.lane], p.xi, turbulent)
        p.xi += dt * 0.12 * u
        if (p.xi > XI_WRAP) p.xi -= XI_WRAP
      }
      setTick((t) => (t + 1) % 1_000_000)
    },
    playing && inView && !reduced && view === 'pipe',
  )

  const scale = 30 // px per V̄ for profile arrows
  const station = sxOf(xi)
  const prof = useMemo(() => {
    const pts: string[] = []
    for (let k = 0; k <= 60; k++) {
      const rho = -1 + (2 * k) / 60
      pts.push(`${(station + uOverVbar(rho, xi, turbulent) * scale).toFixed(1)},${(YC + rho * R).toFixed(1)}`)
    }
    return pts.join(' ')
  }, [station, xi, turbulent])
  const edges = useMemo(() => {
    const top: string[] = []
    const bot: string[] = []
    for (let k = 0; k <= 80; k++) {
      const x = (k / 80) * XI_WRAP
      const d = deltaOverR(x, turbulent)
      top.push(`${sxOf(x).toFixed(1)},${(YC - R * (1 - d)).toFixed(1)}`)
      bot.push(`${sxOf(x).toFixed(1)},${(YC + R * (1 - d)).toFixed(1)}`)
    }
    return { top: top.join(' '), bot: bot.join(' ') }
  }, [turbulent])

  const uc = centreRatio(xi, turbulent)
  const d = deltaOverR(xi, turbulent)

  return (
    <SimPanel
      title="Entrance-length calculator & developing profile"
      subtitle={md`laminar: $L/D \simeq 0.06\,\Rey$ (Eq. 8.1) · turbulent: 25–40 $D$ (mean profile), 80+ $D$ (turbulence)`}
      wide
      controls={
        <>
          <Segmented
            label="View"
            options={[
              { value: 'pipe', label: 'developing profile' },
              { value: 'chart', label: 'L/D vs Re chart' },
            ]}
            value={view}
            onChange={setView}
          />
          <Slider
            label={md`Reynolds number $\Rey = \rho\bar VD/\mu$`}
            value={logRe}
            min={1}
            max={6}
            step={0.01}
            onChange={setLogRe}
            format={(v) => fmtRe(10 ** v)}
          />
          <Slider label={md`diameter $D$`} value={Dmm} min={1} max={300} log onChange={setDmm} unit="mm" digits={3} />
          <Slider label={md`probe station $x/L$`} value={xi} min={0} max={XI_MAX} step={0.01} onChange={setXi} digits={2} />
          {view === 'pipe' ? <PlayPause playing={playing} onToggle={() => setPlaying((p) => !p)} /> : null}
        </>
      }
      readout={
        <div className="space-y-2">
          <div
            className={`rounded-xl px-3 py-2 text-center text-sm font-bold uppercase tracking-wide ${
              turbulent
                ? 'bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300'
                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300'
            }`}
          >
            {turbulent ? 'turbulent (Re ≥ 2300)' : 'laminar (Re < 2300)'}
          </div>
          <Readout
            items={
              turbulent
                ? [
                    { label: 'mean profile developed', value: '25–40', unit: 'D' },
                    { label: 'i.e.', value: `${num.fmt(25 * D, 3)}–${num.fmt(40 * D, 3)}`, unit: 'm', tone: 'accent' },
                    { label: 'turbulence details', value: `≥ ${num.fmt(80 * D, 3)}`, unit: 'm' },
                    { label: md`$u_c/\bar V$ at probe`, value: uc, digits: 3 },
                    { label: md`$\delta/R$ at probe`, value: d, digits: 2 },
                    { label: md`probe $x$`, value: num.fmt(xi * Lm, 3), unit: 'm' },
                  ]
                : [
                    { label: md`$L/D = 0.06\,\Rey$`, value: 0.06 * Re, digits: 3 },
                    { label: md`$L$`, value: num.fmt(Lm, 3), unit: 'm', tone: 'accent' },
                    { label: md`$u_c/\bar V$ at probe`, value: uc, digits: 3 },
                    { label: md`$\delta/R$ at probe`, value: d, digits: 2 },
                    { label: md`probe $x$`, value: num.fmt(xi * Lm, 3), unit: 'm' },
                    { label: md`max laminar $L/D$`, value: '138' },
                  ]
            }
          />
        </div>
      }
      footer={
        <span>
          <b>Try this:</b> in the laminar range drag the probe from 0 to 1 and read u_c/V̄ climb from 1 toward 2 (the parabola) — the
          core must speed up because the same Q passes while the wall layers slow down. Note that δ/R reaches 1 (layers meet) at about
          x = 0.78 L, yet u_c/V̄ keeps creeping up until x = L: the shape still changes slightly after the core is gone. Now raise Re to 2000 (L ≈ 120 D) and then past
          2300: the required length collapses to 25–40 D because turbulent mixing thickens the boundary layer much faster. Open the chart
          to see both rules side by side. (Profile shapes are a schematic model; L comes from Fox.)
        </span>
      }
    >
      <div ref={ref}>
        {view === 'pipe' ? (
          <svg viewBox="0 0 480 200" className="h-auto w-full" role="img" aria-label="developing velocity profile in a pipe entrance">
            <defs>
              <marker id={`${uid}a`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M0,0 L10,5 L0,10 z" fill="var(--plot-1)" />
              </marker>
            </defs>
            <rect x={XIN} y={YC - R - 9} width={XEND - XIN} height={9} fill="var(--body-fill)" stroke="var(--ink-3)" />
            <rect x={XIN} y={YC + R} width={XEND - XIN} height={9} fill="var(--body-fill)" stroke="var(--ink-3)" />
            <line x1={XIN} y1={YC} x2={XEND} y2={YC} stroke="var(--ink-3)" strokeDasharray="10 3 2 3" />
            <polyline points={edges.top} fill="none" stroke="var(--plot-3)" strokeDasharray="5 4" strokeWidth={1.5} />
            <polyline points={edges.bot} fill="none" stroke="var(--plot-3)" strokeDasharray="5 4" strokeWidth={1.5} />
            {/* fully developed station */}
            <line x1={sxOf(1)} y1={YC - R} x2={sxOf(1)} y2={YC + R} stroke="var(--plot-5)" strokeDasharray="3 3" />
            <text x={sxOf(1)} y={YC + R + 24} textAnchor="middle" className="fill-ink-2" fontSize={11}>
              x = L ({turbulent ? '≈ 40 D' : `${num.fmt(0.06 * Re, 3)} D`})
            </text>
            {turbulent ? (
              <rect x={sxOf(25 / 40)} y={YC + R + 30} width={sxOf(1) - sxOf(25 / 40)} height={6} fill="var(--plot-5)" opacity={0.5} />
            ) : null}
            {turbulent ? (
              <text x={sxOf(25 / 40) - 4} y={YC + R + 36} textAnchor="end" className="fill-ink-3" fontSize={10}>
                25–40 D
              </text>
            ) : null}
            {/* tracers */}
            {tracers.current.map((p, i) => (
              <circle key={i} cx={sxOf(p.xi)} cy={YC + LANES[p.lane] * R} r={2.2} fill="var(--plot-2)" opacity={0.8} />
            ))}
            {/* profile at probe */}
            <line x1={station} y1={YC - R} x2={station} y2={YC + R} stroke="var(--plot-1)" />
            {[-0.85, -0.6, -0.3, 0, 0.3, 0.6, 0.85].map((rho) => (
              <line
                key={rho}
                x1={station}
                y1={YC + rho * R}
                x2={station + Math.max(2, uOverVbar(rho, xi, turbulent) * scale)}
                y2={YC + rho * R}
                stroke="var(--plot-1)"
                strokeWidth={1.4}
                markerEnd={`url(#${uid}a)`}
              />
            ))}
            <polyline points={prof} fill="none" stroke="var(--plot-1)" strokeWidth={1.8} />
            <text x={XIN} y={16} className="fill-ink-2" fontSize={10.5}>
              dashed: boundary-layer edge · arrows: u(r) at probe · dots: timelines · x compressed
            </text>
            <text x={XIN} y={YC + R + 24} className="fill-ink-3" fontSize={11}>
              inlet: uniform U₀ = V̄
            </text>
          </svg>
        ) : (
          <Plot
            height={300}
            x={{ label: md`Reynolds number $\Rey$`, domain: [10, 1e6], log: true }}
            y={{ label: md`entrance length $L/D$`, domain: [0, 160] }}
            bands={[{ x0: RE_CRIT, x1: 1e6, label: 'turbulent', color: 'var(--plot-5)' }]}
            series={[
              { label: md`laminar, Eq. 8.1: $L/D = 0.06\,\Rey$`, fn: (r) => 0.06 * r, range: [10, RE_CRIT], color: 'var(--plot-1)', width: 2.2 },
              { label: 'turbulent mean profile: 25 D', fn: () => 25, range: [RE_CRIT, 1e6], color: 'var(--plot-5)', dash: '6 4' },
              { label: 'turbulent mean profile: 40 D', fn: () => 40, range: [RE_CRIT, 1e6], color: 'var(--plot-5)', width: 2 },
              { label: 'turbulence details: 80 D and more', fn: () => 80, range: [RE_CRIT, 1e6], color: 'var(--plot-7)', dash: '2 3' },
            ]}
            hlines={[{ y: 138, label: 'laminar maximum ≈ 138 D', color: 'var(--plot-1)', dash: '4 4' }]}
            marks={[{ x: Re, y: turbulent ? 40 : 0.06 * Re, label: 'you', color: 'var(--plot-4)' }]}
          />
        )}
      </div>
    </SimPanel>
  )
}
