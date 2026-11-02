import { useMemo, useState } from 'react'
import { M, Plot, Readout, SimPanel, Slider, Toggle, md, num, type Series } from '@/kit'
import { aPlusOf, fBlasius, fLaminar, fSmoothExp, fSmoothTheory, iterate953 } from './laws'

/**
 * Interactive for Wilkes §9.7: the implicit smooth-pipe laws (9.52)/(9.53) on log–log axes, compared with
 * Blasius (9.59)/(9.71) and (supplementary) laminar 16/Re, plus a live fixed-point iteration table for (9.53).
 */
export function SmoothFrictionLab() {
  const [Re, setRe] = useState(1e5)
  const [f0, setF0] = useState(0.02)
  const [show952, setShow952] = useState(true)
  const [showBl, setShowBl] = useState(true)
  const [showLam, setShowLam] = useState(true)

  const f53 = fSmoothExp(Re)
  const f52 = fSmoothTheory(Re)
  const fb = fBlasius(Re)
  const rows = useMemo(() => iterate953(Re, f0, 6), [Re, f0])

  const series: Series[] = [
    { label: '(9.53) experimental law', fn: fSmoothExp, range: [4e3, 1e7], color: 'var(--plot-1)', width: 2.8 },
  ]
  if (show952) series.push({ label: '(9.52) from the universal profile', fn: fSmoothTheory, range: [4e3, 1e7], color: 'var(--plot-2)', dash: '7 4', width: 2 })
  if (showBl) {
    series.push({ label: 'Blasius (9.59)/(9.71), valid to $10^5$', fn: fBlasius, range: [4e3, 1e5], color: 'var(--plot-3)', width: 2.2 })
    series.push({ fn: fBlasius, range: [1e5, 1e7], color: 'var(--plot-3)', dash: '2 5', width: 1.6, hideInLegend: true })
  }
  if (showLam) {
    series.push({ label: md`laminar $16/\Rey$ (supplementary)`, fn: fLaminar, range: [2e3, 2300], color: 'var(--plot-6)', width: 2.2 })
    series.push({ fn: fLaminar, range: [2300, 4e3], color: 'var(--plot-6)', dash: '3 4', width: 1.4, hideInLegend: true })
  }

  const pct = (a: number, b: number) => ((a - b) / b) * 100

  return (
    <SimPanel
      title="Smooth-pipe friction-factor lab"
      subtitle="Wilkes Eqs. (9.52), (9.53) and the Blasius law"
      wide
      controls={
        <>
          <Slider label={md`Reynolds number $\Rey$`} value={Re} min={3e3} max={1e7} log onChange={setRe} />
          <Slider label={md`starting guess $f_0$ for the iteration`} value={f0} min={0.001} max={0.05} log onChange={setF0} digits={3} />
          <Toggle label="show (9.52)" checked={show952} onChange={setShow952} />
          <Toggle label="show Blasius" checked={showBl} onChange={setShowBl} />
          <Toggle label={md`show laminar $16/\Rey$`} checked={showLam} onChange={setShowLam} />
        </>
      }
      readout={
        <Readout
          items={[
            { label: md`$f_{\mathrm F}$ (9.53)`, value: f53, digits: 4, tone: 'accent' },
            { label: md`Darcy $f_{\mathrm D} = 4f_{\mathrm F}$`, value: 4 * f53, digits: 4 },
            { label: md`(9.52) vs (9.53)`, value: pct(f52, f53), unit: '%', digits: 2 },
            { label: md`Blasius vs (9.53)`, value: pct(fb, f53), unit: '%', digits: 2, tone: Math.abs(pct(fb, f53)) > 5 ? 'bad' : 'good' },
            { label: md`$\overline{v}_{zm}/\overline{v}_z^{*} = \sqrt{2/f_{\mathrm F}}$`, value: Math.sqrt(2 / f53) },
            { label: md`$a^+ = a\overline{v}_z^{*}/\nu$`, value: aPlusOf(Re, f53) },
          ]}
        />
      }
      footer={md`Try this: set Re = 10⁶ and switch the Blasius curve on — it falls about 14 % below (9.53), which is why Wilkes limits it to Re ≤ 10⁵. Then drag the starting guess f₀ from 0.001 to 0.05: the iteration lands on the same f_F within 3–4 steps every time.`}
    >
      <Plot
        height={330}
        x={{ label: md`Reynolds number $\Rey = \overline{v}_{zm}D/\nu$`, domain: [2e3, 1e7], log: true }}
        y={{ label: md`Fanning friction factor $f_{\mathrm F}$`, domain: [0.0015, 0.02], log: true }}
        series={series}
        bands={[{ x0: 5e3, x1: 3.4e6, label: '(9.53) verified range' }]}
        vlines={showBl ? [{ x: 1e5, label: 'Re = 10⁵', color: 'var(--plot-3)' }] : []}
        marks={[{ x: Re, y: f53, label: `f_F = ${num.fmt(f53, 3)}`, color: 'var(--plot-4)' }]}
      />
      <div className="mt-3 overflow-x-auto rounded-xl border border-line">
        <div className="border-b border-line bg-surface-2 px-3 py-1.5 text-xs font-semibold text-ink-2">
          Fixed-point iteration of (9.53): <M tex={md`x_{k+1} = 1.74\ln(\Rey/x_k) - 0.391`} />, with <M tex={md`x = 1/\sqrt{f_{\mathrm F}}`} />
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-ink-3">
              <th className="px-3 py-1.5 font-semibold">k</th>
              <th className="px-3 py-1.5 font-semibold">
                <M tex={md`x_k`} />
              </th>
              <th className="px-3 py-1.5 font-semibold">
                <M tex={md`f_k = 1/x_k^2`} />
              </th>
              <th className="px-3 py-1.5 font-semibold">change in f</th>
            </tr>
          </thead>
          <tbody className="font-mono text-[13px] text-ink">
            {rows.map((r, i) => (
              <tr key={r.k} className="border-t border-line">
                <td className="px-3 py-1">{r.k}</td>
                <td className="px-3 py-1">{r.x.toFixed(4)}</td>
                <td className="px-3 py-1">{r.f.toFixed(6)}</td>
                <td className="px-3 py-1 text-ink-3">{i === 0 ? 'guess' : `${num.fmt(Math.abs(pct(r.f, rows[i - 1].f)), 2)} %`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SimPanel>
  )
}
