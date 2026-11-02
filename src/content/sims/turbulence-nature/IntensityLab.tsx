import { useMemo, useState } from 'react'
import { Plot, Readout, SimPanel, Slider, Toggle, md, num } from '@/kit'
import { envelope, makeTurbSignal, meanOf, rmsAbout, skewed } from './signal'

/**
 * Turbulence-intensity lab (supplementary model). A synthetic record v = v̄ (1 + I·s(t)), where s has zero mean
 * and unit RMS, so ṽ′ = I·v̄ exactly (Eqs. 9.4–9.5). Optionally the fluctuation is made skewed (still zero mean).
 */

const DT = 0.0005
const NS = 16384
const RAW = makeTurbSignal({ seed: 9, f0: 4, fEta: 150, fMin: 0.05, modes: 160 }).sample(NS, DT, 0)
const NORMAL = (() => {
  const m = meanOf(RAW)
  const r = rmsAbout(RAW, m)
  const y = new Float64Array(NS)
  for (let i = 0; i < NS; i++) y[i] = (RAW[i] - m) / r
  return y
})()
const SKEW = skewed(NORMAL, 0.6)
const SHOW = 2000 // first 1 s on the trace plot
const BINS = 48

export function IntensityLab() {
  const [vbar, setVbar] = useState(2.0)
  const [I, setI] = useState(5)
  const [skew, setSkew] = useState(false)
  const s = skew ? SKEW : NORMAL
  const rmsV = (I / 100) * vbar
  const lo = 0.4 * vbar
  const hi = 1.6 * vbar

  const stats = useMemo(() => {
    let within = 0
    let below = 0
    let peak = 0
    let sum = 0
    let sumSq = 0
    for (let i = 0; i < NS; i++) {
      const vp = rmsV * s[i]
      sum += vp
      sumSq += vp * vp
      if (Math.abs(vp) <= rmsV) within++
      if (vp < 0) below++
      peak = Math.max(peak, Math.abs(vp))
    }
    const counts = new Array<number>(BINS).fill(0)
    const bw = (hi - lo) / BINS
    for (let i = 0; i < NS; i++) {
      const v = vbar + rmsV * s[i]
      const b = Math.floor((v - lo) / bw)
      if (b >= 0 && b < BINS) counts[b]++
    }
    const dens = counts.map((c) => c / (NS * bw))
    return { mean: sum / NS, msq: sumSq / NS, within: within / NS, below: below / NS, peak, dens, bw }
  }, [s, rmsV, vbar, lo, hi])

  const trace = useMemo(() => {
    const y = new Float64Array(SHOW)
    for (let i = 0; i < SHOW; i++) y[i] = vbar + rmsV * s[i]
    return envelope(y, 0, SHOW, 420).map(([i, v]) => [i * DT, Math.min(hi, Math.max(lo, v))] as [number, number])
  }, [s, rmsV, vbar, lo, hi])

  const gauss = (v: number) => Math.exp(-0.5 * ((v - vbar) / rmsV) ** 2) / (rmsV * Math.sqrt(2 * Math.PI))
  const dMax = Math.max(...stats.dens, gauss(vbar)) * 1.12
  const typical = I >= 1 && I <= 10

  return (
    <SimPanel
      title="Turbulence-intensity lab"
      subtitle="same mean, different jitter"
      wide
      controls={
        <>
          <Slider label={md`mean velocity $\overline{v}$`} value={vbar} min={0.5} max={10} step={0.1} unit="m/s" onChange={setVbar} digits={2} />
          <Slider label={md`intensity $\widetilde{v'}/\overline{v}$`} value={I} min={0.5} max={15} step={0.5} unit="%" onChange={setI} digits={3} />
          <Toggle label="skewed fluctuations (still zero mean)" checked={skew} onChange={setSkew} />
        </>
      }
      readout={
        <Readout
          cols={2}
          items={[
            { label: md`RMS $\widetilde{v'}$`, value: rmsV, unit: 'm/s', tone: 'accent' },
            { label: md`$\overline{v'}$`, value: Math.abs(stats.mean) < 1e-9 * vbar ? '0' : num.fmt(stats.mean, 2), unit: 'm/s' },
            { label: md`$\overline{v'^{2}}$`, value: stats.msq, unit: 'm²/s²' },
            { label: md`intensity (typical 0.01–0.1)`, value: (I / 100).toFixed(3), tone: typical ? 'good' : 'bad' },
            { label: md`time within $\pm\widetilde{v'}$`, value: `${(100 * stats.within).toFixed(0)} %` },
            { label: 'time below the mean', value: `${(100 * stats.below).toFixed(0)} %` },
            { label: md`peak $\vert v'\vert/\widetilde{v'}$`, value: stats.peak / rmsV, digits: 3 },
            { label: md`$k$ if isotropic, $\tfrac32\widetilde{v'}^{2}$`, value: 1.5 * rmsV * rmsV, unit: 'm²/s²' },
          ]}
        />
      }
      footer={
        <span>
          <b>Try this:</b> double the mean velocity at fixed intensity — the picture looks identical, only the axis numbers double, because intensity is a
          ratio. Then switch on the skewed fluctuations: v′ now sits below zero about 60 % of the time with rare large positive bursts, yet its mean is
          still exactly zero and the RMS still measures its strength.
        </span>
      }
    >
      <div className="space-y-3">
        <Plot
          height={220}
          x={{ label: 't (s)', domain: [0, SHOW * DT] }}
          y={{ label: md`$v$ (m/s)`, domain: [lo, hi] }}
          series={[{ label: md`instantaneous $v = \overline{v} + v'$`, points: trace, color: 'var(--plot-1)', width: 1.1 }]}
          hlines={[
            { y: vbar, label: 'mean v̄', color: 'var(--ink-2)', dash: '6 4' },
            { y: vbar + rmsV, color: 'var(--plot-5)' },
            { y: vbar - rmsV, color: 'var(--plot-5)' },
          ]}
          overlay={(ctx) => (
            <rect
              x={0}
              width={ctx.width}
              y={ctx.sy(vbar + rmsV)}
              height={Math.max(0, ctx.sy(vbar - rmsV) - ctx.sy(vbar + rmsV))}
              fill="var(--plot-5)"
              fillOpacity={0.12}
            />
          )}
        />
        <Plot
          height={210}
          x={{ label: md`velocity $v$ (m/s)`, domain: [lo, hi] }}
          y={{ label: 'fraction of time per (m/s)', domain: [0, dMax] }}
          series={[{ label: md`Gaussian with the same $\widetilde{v'}$`, fn: gauss, color: 'var(--plot-7)', dash: '5 4', width: 1.6 }]}
          vlines={[
            { x: vbar, label: 'v̄', color: 'var(--ink-2)' },
            { x: vbar - rmsV, label: '−ṽ′', color: 'var(--plot-5)' },
            { x: vbar + rmsV, label: '+ṽ′', color: 'var(--plot-5)' },
          ]}
          overlay={(ctx) => (
            <g>
              {stats.dens.map((dv, b) => {
                const x0 = ctx.sx(lo + b * stats.bw)
                const x1 = ctx.sx(lo + (b + 1) * stats.bw)
                return <rect key={b} x={x0 + 0.5} width={Math.max(0, x1 - x0 - 1)} y={ctx.sy(dv)} height={Math.max(0, ctx.sy(0) - ctx.sy(dv))} fill="var(--plot-1)" fillOpacity={0.35} />
              })}
            </g>
          )}
        />
      </div>
    </SimPanel>
  )
}
