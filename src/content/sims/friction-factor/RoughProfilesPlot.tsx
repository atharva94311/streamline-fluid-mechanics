import { useState } from 'react'
import { Plot, Readout, Segmented, Slider, md, type Series } from '@/kit'
import { REGIME_LABEL, REGIME_TONE, uPlusLog, wallRegime } from './laws'

type AxisMode = 'yplus' | 'yeps'

/**
 * Wilkes Eqs. (9.67)–(9.69): v̄z/v̄z* = 2.5 ln(y/ε) + B, with B = 5.5 + 2.5 ln ε⁺ (hydraulically smooth)
 * or B = 8.5 (completely rough). Plotted against y⁺ (rough profiles sit lower by ΔB = 2.5 ln ε⁺ − 3)
 * or against y/ε (fully rough profiles collapse onto one line, intercept 8.5).
 */
export function RoughProfilesPlot() {
  const [ep, setEp] = useState(150)
  const [mode, setMode] = useState<AxisMode>('yplus')
  const reg = wallRegime(ep)
  const Bs = 5.5 + 2.5 * Math.log(ep)
  const dB = Bs - 8.5
  const smoothApplies = reg === 'smooth'
  const roughApplies = reg === 'rough'

  const series: Series[] =
    mode === 'yplus'
      ? [
          {
            label: md`hydraulically smooth (9.68): $5.5 + 2.5\ln y^+$`,
            fn: uPlusLog,
            range: [30, 1e4],
            color: 'var(--plot-5)',
            width: smoothApplies ? 3 : 1.8,
            opacity: smoothApplies ? 1 : 0.7,
          },
          { fn: uPlusLog, range: [5, 30], color: 'var(--plot-5)', dash: '3 4', width: 1.4, hideInLegend: true },
          {
            label: md`completely rough (9.69): $8.5 + 2.5\ln(y^+/\varepsilon^+)$`,
            fn: (x) => 8.5 + 2.5 * Math.log(x / ep),
            range: [Math.max(1, ep), 1e4],
            color: 'var(--plot-4)',
            width: roughApplies ? 3 : 1.8,
            opacity: roughApplies ? 1 : 0.7,
          },
          { fn: (x) => 8.5 + 2.5 * Math.log(x / ep), range: [Math.max(1, ep * 0.04), Math.max(1.0001, ep)], color: 'var(--plot-4)', dash: '3 4', width: 1.4, hideInLegend: true },
        ]
      : [
          {
            label: md`completely rough (9.69): $B = 8.5$ for every $\varepsilon^+ > 70$`,
            fn: (x) => 8.5 + 2.5 * Math.log(x),
            range: [1, 1e4],
            color: 'var(--plot-4)',
            width: roughApplies ? 3 : 1.8,
            opacity: roughApplies ? 1 : 0.7,
          },
          {
            label: md`hydraulically smooth (9.68): $B = 5.5 + 2.5\ln\varepsilon^+$`,
            fn: (x) => Bs + 2.5 * Math.log(x),
            range: [Math.max(1, 30 / ep), 1e4],
            color: 'var(--plot-5)',
            width: smoothApplies ? 3 : 1.8,
            opacity: smoothApplies ? 1 : 0.7,
          },
        ]

  return (
    <div className="space-y-3">
      <Plot
        height={300}
        x={{ label: mode === 'yplus' ? md`distance from wall $y^+ = y\overline{v}_z^{*}/\nu$` : md`distance from wall in roughness heights, $y/\varepsilon$`, domain: [1, 1e4], log: true }}
        y={{ label: md`$\overline{v}_z/\overline{v}_z^{*}$`, domain: [0, 34] }}
        series={series}
        vlines={mode === 'yplus' && ep >= 1 ? [{ x: ep, label: 'top of roughness', color: 'var(--ink-3)' }] : []}
        overlay={({ sx, sy }) => {
          if (mode !== 'yplus' || ep <= 3.4) return null
          const xa = 3000
          const y1 = uPlusLog(xa)
          const y2 = 8.5 + 2.5 * Math.log(xa / ep)
          return (
            <g>
              <line x1={sx(xa)} x2={sx(xa)} y1={sy(y1)} y2={sy(y2)} stroke="var(--ink)" strokeWidth={1.4} />
              <line x1={sx(xa) - 5} x2={sx(xa) + 5} y1={sy(y1)} y2={sy(y1)} stroke="var(--ink)" strokeWidth={1.4} />
              <line x1={sx(xa) - 5} x2={sx(xa) + 5} y1={sy(y2)} y2={sy(y2)} stroke="var(--ink)" strokeWidth={1.4} />
              <text x={sx(xa) - 8} y={(sy(y1) + sy(y2)) / 2 + 4} textAnchor="end" className="fill-ink text-[11px] font-semibold">
                ΔB = {dB.toFixed(1)}
              </text>
            </g>
          )
        }}
      />
      <div className="grid items-end gap-3 sm:grid-cols-2">
        <Slider label={md`roughness Reynolds number $\varepsilon^+ = \varepsilon\overline{v}_z^{*}/\nu$`} value={ep} min={1} max={1000} log onChange={setEp} />
        <Segmented
          label="horizontal axis"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'yplus', label: md`$y^+$ (wall units)` },
            { value: 'yeps', label: md`$y/\varepsilon$ (roughness units)` },
          ]}
        />
      </div>
      <Readout
        cols={4}
        items={[
          { label: md`$B$ if smooth (9.68)`, value: Bs },
          { label: md`$B$ if fully rough (9.69)`, value: 8.5 },
          { label: md`shift $\Delta B = 2.5\ln\varepsilon^+ - 3$`, value: dB },
          { label: 'regime', value: REGIME_LABEL[reg], tone: REGIME_TONE[reg] },
        ]}
      />
    </div>
  )
}
