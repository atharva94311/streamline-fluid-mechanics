import { useMemo, useState } from 'react'
import { Plot, Readout, SimPanel, Slider, Toggle, md, useElementSize } from '@/kit'
import { envelope, makeTurbSignal, prefixSums } from './signal'

/**
 * Reynolds-decomposition lab (supplementary model): a synthetic hot-wire record v_x(t) = v̄_x + v′_x(t)
 * with fluctuations from ~0.3 s down to ~5 ms. Choose an averaging window T, slide it along the record,
 * and watch the time average converge (statistical scatter ≈ intensity·√(2T_I/T)).
 */

const SIG = makeTurbSignal({ seed: 3, f0: 3, fEta: 200, fMin: 0.04, modes: 170 })
const DT = 0.0005
const NS = 16384
const TREC = NS * DT
const BASE = SIG.sample(NS, DT, 0)
const TI = SIG.TI

export function DecompositionLab() {
  const [vbar, setVbar] = useState(2.0)
  const [I, setI] = useState(5)
  const [T, setT] = useState(0.05)
  const [t0, setT0] = useState(1.0)
  const [drift, setDrift] = useState(false)
  const [ref, size] = useElementSize<HTMLDivElement>()

  const W = Math.max(300, Math.round(size.width || 640))
  const H = 250
  const m = { l: 46, r: 10, t: 12, b: 34 }
  const iw = W - m.l - m.r
  const ih = H - m.t - m.b

  const meanAt = (t: number) => vbar * (drift ? 1 + 0.15 * Math.sin((2 * Math.PI * t) / 6 - 0.6) : 1)
  const data = useMemo(() => {
    const v = new Float64Array(NS)
    for (let i = 0; i < NS; i++) v[i] = meanAt(i * DT) + (I / 100) * vbar * BASE[i]
    const sq = new Float64Array(NS)
    for (let i = 0; i < NS; i++) sq[i] = v[i] * v[i]
    return { v, P: prefixSums(v), Q: prefixSums(sq) }
  }, [vbar, I, drift]) // eslint-disable-line react-hooks/exhaustive-deps

  const Tc = Math.min(T, TREC - 0.01)
  const t0c = Math.min(Math.max(0, t0), TREC - Tc)
  const i0 = Math.round(t0c / DT)
  const n = Math.max(1, Math.round(Tc / DT))
  const i1 = Math.min(NS, i0 + n)
  const cnt = i1 - i0
  const wm = (data.P[i1] - data.P[i0]) / cnt
  const ms = (data.Q[i1] - data.Q[i0]) / cnt
  const rms = Math.sqrt(Math.max(0, ms - wm * wm))
  const refMean = vbar
  const err = ((wm - refMean) / refMean) * 100
  const expect = Math.min(I, I * Math.sqrt((2 * TI) / Tc))

  // main trace
  const lo = 0.5 * vbar
  const hi = 1.5 * vbar
  const sx = (t: number) => m.l + (t / TREC) * iw
  const sy = (val: number) => m.t + (1 - (val - lo) / (hi - lo)) * ih
  const path = useMemo(() => {
    const pts = envelope(data.v, 0, NS, Math.max(120, Math.round(iw)))
    return pts.map(([i, val], k) => `${k ? 'L' : 'M'}${sx(i * DT).toFixed(1)} ${sy(Math.min(hi, Math.max(lo, val))).toFixed(1)}`).join('')
  }, [data, iw]) // eslint-disable-line react-hooks/exhaustive-deps
  const driftPath = drift
    ? Array.from({ length: 120 }, (_, k) => {
        const t = (k / 119) * TREC
        return `${k ? 'L' : 'M'}${sx(t).toFixed(1)} ${sy(meanAt(t)).toFixed(1)}`
      }).join('')
    : ''

  // convergence of the running average
  const conv: [number, number][] = []
  for (let k = 0; k < 140; k++) {
    const tau = 10 ** (Math.log10(DT * 2) + (k / 139) * (Math.log10(Tc) - Math.log10(DT * 2)))
    const j = Math.min(i1, i0 + Math.max(1, Math.round(tau / DT)))
    const rm = (data.P[j] - data.P[i0]) / (j - i0)
    conv.push([tau, ((rm - refMean) / refMean) * 100])
  }
  const band = (tau: number) => Math.min(I, I * Math.sqrt((2 * TI) / tau))
  const ylim = Math.max(1.3 * I, drift ? 18 : 0)

  // fluctuation inside the window (decimated)
  const fl: [number, number][] = envelope(data.v, i0, i1, 260).map(([i, val]) => [(i - i0) * DT * 1000, val - wm])
  const flLim = Math.max(4 * (I / 100) * vbar, 1e-3)

  const onPointer = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.type === 'pointermove' && e.buttons !== 1) return
    const r = e.currentTarget.getBoundingClientRect()
    const t = ((e.clientX - r.left - m.l) / iw) * TREC
    setT0(Math.min(TREC - Tc, Math.max(0, t - Tc / 2)))
  }

  const xticks = [0, 1, 2, 3, 4, 5, 6, 7, 8]
  const yticks = [0.6, 0.8, 1, 1.2, 1.4].map((f) => f * vbar)

  return (
    <SimPanel
      title="Reynolds-decomposition lab"
      subtitle="split a turbulent record into mean + fluctuation"
      wide
      controls={
        <>
          <Slider label={md`mean velocity $\overline{v}_x$`} value={vbar} min={0.5} max={5} step={0.1} unit="m/s" onChange={setVbar} digits={2} />
          <Slider label={md`intensity $\widetilde{v'}/\overline{v}$`} value={I} min={1} max={10} step={0.5} unit="%" onChange={setI} digits={2} />
          <Slider label={md`averaging time $T$`} value={Tc} min={0.002} max={8} log unit="s" onChange={setT} digits={3} />
          <Slider label={md`window start $t_0$`} value={t0c} min={0} max={Math.max(0.001, TREC - Tc)} step={0.001} unit="s" onChange={setT0} digits={3} />
          <Toggle label="slowly drifting mean (not steady in the mean)" checked={drift} onChange={setDrift} />
        </>
      }
      readout={
        <Readout
          cols={2}
          items={[
            { label: md`window mean $\overline{v}_x$`, value: wm, unit: 'm/s', digits: 4, tone: 'accent' },
            { label: drift ? 'deviation from nominal mean' : md`error vs true $\overline{v}_x$`, value: `${err >= 0 ? '+' : '−'}${Math.abs(err).toFixed(2)} %`, tone: Math.abs(err) <= 2 * expect ? 'good' : 'bad' },
            { label: 'expected scatter (±1σ)', value: `±${expect.toFixed(2)} %` },
            { label: md`$T/T_I$`, value: Tc / TI, digits: 3 },
            { label: md`RMS $\widetilde{v'_x}$ in window`, value: rms, unit: 'm/s', digits: 3 },
            { label: md`mean of $v_x'$ in window`, value: '0 (Eq. 9.2)' },
          ]}
        />
      }
      footer={
        <span>
          <b>Try this:</b> with T = 20 ms, drag the window along the record — the window mean jumps by several per cent. Now stretch T to a few seconds:
          the running average (lower plot) settles inside the shrinking ±σ funnel and the error falls below about 0.5 %. That is why Wilkes averages over a
          few seconds for millisecond fluctuations. Finally switch on the drifting mean: no single T gives a unique answer any more.
        </span>
      }
    >
      <div ref={ref} className="w-full space-y-3">
        <svg
          width={W}
          height={H}
          className="block max-w-full cursor-ew-resize select-none"
          style={{ touchAction: 'pan-y' }}
          onPointerDown={onPointer}
          onPointerMove={onPointer}
          role="img"
          aria-label="Velocity record with the averaging window"
        >
          {yticks.map((y) => (
            <g key={`y${y}`}>
              <line x1={m.l} x2={m.l + iw} y1={sy(y)} y2={sy(y)} stroke="var(--grid)" />
              <text x={m.l - 6} y={sy(y)} dy="0.32em" textAnchor="end" className="fill-ink-3 text-[11px]">
                {+y.toFixed(2)}
              </text>
            </g>
          ))}
          {xticks.map((x) => (
            <text key={`x${x}`} x={sx(x)} y={m.t + ih + 15} textAnchor="middle" className="fill-ink-3 text-[11px]">
              {x}
            </text>
          ))}
          <rect x={sx(t0c)} y={m.t} width={Math.max(1.5, sx(t0c + Tc) - sx(t0c))} height={ih} fill="var(--plot-3)" fillOpacity={0.16} stroke="var(--plot-3)" strokeOpacity={0.6} />
          <path d={path} fill="none" stroke="var(--plot-1)" strokeWidth={1} strokeLinejoin="round" opacity={0.9} />
          {drift ? <path d={driftPath} fill="none" stroke="var(--plot-5)" strokeWidth={2} strokeDasharray="7 4" /> : null}
          <line x1={m.l} x2={m.l + iw} y1={sy(vbar)} y2={sy(vbar)} stroke="var(--ink-2)" strokeDasharray="6 5" strokeWidth={1.2} />
          <line x1={sx(t0c)} x2={Math.max(sx(t0c) + 6, sx(t0c + Tc))} y1={sy(wm)} y2={sy(wm)} stroke="var(--plot-4)" strokeWidth={3} />
          <line x1={m.l} x2={m.l} y1={m.t} y2={m.t + ih} stroke="var(--axis)" />
          <line x1={m.l} x2={m.l + iw} y1={m.t + ih} y2={m.t + ih} stroke="var(--axis)" />
          <text x={m.l + iw} y={H - 4} textAnchor="end" className="fill-ink-2 text-[11.5px] font-medium">
            t (s) — drag to move the window
          </text>
          <text x={4} y={m.t + 2} dy="0.6em" className="fill-ink-2 text-[11.5px] font-medium">
            vₓ (m/s)
          </text>
          <text x={m.l + iw - 4} y={sy(vbar) - 6} textAnchor="end" className="fill-ink-2 text-[10.5px]">
            {drift ? 'nominal mean' : 'true mean v̄ₓ'}
          </text>
        </svg>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11.5px] text-ink-3">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-4 rounded-sm" style={{ background: 'var(--plot-3)', opacity: 0.5 }} /> averaging window T
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-1 w-4 rounded" style={{ background: 'var(--plot-4)' }} /> window mean
          </span>
          {drift ? (
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-1 w-4 rounded" style={{ background: 'var(--plot-5)' }} /> slowly varying local mean
            </span>
          ) : null}
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          <Plot
            height={220}
            x={{ label: md`averaging time so far, $t-t_0$ (s)`, domain: [DT * 2, Math.max(Tc, DT * 4)], log: true }}
            y={{ label: md`running-mean error (%)`, domain: [-ylim, ylim] }}
            series={[
              { label: 'running average', points: conv, color: 'var(--plot-4)', width: 2 },
              { label: md`$\pm$ expected scatter`, fn: band, color: 'var(--plot-7)', dash: '5 4', width: 1.4 },
              { fn: (tau: number) => -band(tau), color: 'var(--plot-7)', dash: '5 4', width: 1.4, hideInLegend: true },
            ]}
            hlines={[{ y: 0, color: 'var(--axis)', dash: '2 3' }]}
          />
          <Plot
            height={220}
            x={{ label: 'time inside the window (ms)', domain: [0, Math.max(1, Tc * 1000)] }}
            y={{ label: md`$v_x' = v_x - \overline{v}_x$ (m/s)`, domain: [-flLim, flLim] }}
            series={[{ label: md`fluctuation $v_x'$`, points: fl, color: 'var(--plot-1)', width: 1.3 }]}
            hlines={[
              { y: rms, label: '+RMS', color: 'var(--plot-5)' },
              { y: -rms, label: '−RMS', color: 'var(--plot-5)' },
              { y: 0, color: 'var(--axis)', dash: '2 3' },
            ]}
          />
        </div>
      </div>
    </SimPanel>
  )
}
