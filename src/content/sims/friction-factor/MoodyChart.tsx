import { useMemo, useState } from 'react'
import { Plot, Readout, Segmented, SimPanel, Slider, Toggle, md, num, type Series } from '@/kit'
import { REGIME_LABEL, REGIME_TONE, epsPlusOf, fColebrook, fFullyRough, fLaminar, fSmoothExp, reAtEpsPlus, wallRegime } from './laws'

const FAMILY = [1e-5, 1e-4, 5e-4, 1e-3, 5e-3, 1e-2, 2e-2, 5e-2]
const RE_MIN = 600
const RE_MAX = 1e8

function locus(target: number): [number, number][] {
  const pts: [number, number][] = []
  for (const rr of num.logspace(1e-6, 0.05, 56)) {
    const Re = reAtEpsPlus(rr, target)
    if (Re >= 4e3 && Re <= RE_MAX) pts.push([Re, fColebrook(Re, rr)])
  }
  return pts.sort((a, b) => a[0] - b[0])
}

/**
 * Moody-style chart in Wilkes notation: Fanning f_F (or Darcy 4f_F) against Re. Colebrook–White (9.70) for a
 * chosen ε/D, its completely rough limit, the smooth-pipe law (9.53), the loci where εv̄z* / ν = 5 and 70
 * (regime boundaries (9.64)–(9.66)) and a draggable operating point.
 */
export function MoodyChart() {
  const [Re, setRe] = useState(3e5)
  const [rr, setRr] = useState(1e-3)
  const [scale, setScale] = useState<'F' | 'D'>('F')
  const [family, setFamily] = useState(true)
  const [loci, setLoci] = useState(true)
  const k = scale === 'D' ? 4 : 1

  const bounds = useMemo(() => ({ l5: locus(5), l70: locus(70) }), [])

  const laminar = Re < 2300
  const fOp = laminar ? fLaminar(Re) : fColebrook(Re, rr)
  const ep = epsPlusOf(rr, Re, fOp)
  const reg = wallRegime(ep)
  const fRough = fFullyRough(rr)
  const regimeText = laminar ? 'Laminar flow' : Re < 4000 ? 'Laminar–turbulent transition' : REGIME_LABEL[reg]
  const regimeTone = laminar || Re < 4000 ? 'default' : REGIME_TONE[reg]

  const series: Series[] = [
    { label: md`laminar $${k === 1 ? '16' : '64'}/\Rey$ (supplementary)`, fn: (x) => k * fLaminar(x), range: [RE_MIN, 2300], color: 'var(--plot-6)', width: 2.2 },
    { fn: (x) => k * fLaminar(x), range: [2300, 4000], color: 'var(--plot-6)', dash: '3 4', width: 1.3, hideInLegend: true },
    { label: 'smooth pipe (9.53)', fn: (x) => k * fSmoothExp(x), range: [4e3, RE_MAX], color: 'var(--plot-5)', width: 2.2 },
  ]
  if (family)
    for (const r of FAMILY) series.push({ fn: (x) => k * fColebrook(x, r), range: [4e3, RE_MAX], color: 'var(--plot-7)', width: 1, opacity: 0.45, hideInLegend: true, samples: 160 })
  series.push({ label: `Colebrook–White (9.70), ε/D = ${num.fmt(rr, 2)}`, fn: (x) => k * fColebrook(x, rr), range: [4e3, RE_MAX], color: 'var(--plot-1)', width: 3 })
  if (loci) {
    series.push({ label: md`$\varepsilon^+ = 5$: smooth → transition`, points: bounds.l5.map(([x, y]) => [x, k * y] as [number, number]), color: 'var(--plot-3)', dash: '6 4', width: 1.8 })
    series.push({ label: md`$\varepsilon^+ = 70$: transition → completely rough`, points: bounds.l70.map(([x, y]) => [x, k * y] as [number, number]), color: 'var(--plot-4)', dash: '6 4', width: 1.8 })
  }

  return (
    <SimPanel
      title="Friction-factor chart (Moody-style, Wilkes notation)"
      subtitle="Colebrook–White (9.70) with the regime boundaries of (9.64)–(9.66)"
      wide
      controls={
        <>
          <Slider label={md`Reynolds number $\Rey$`} value={Re} min={1e3} max={RE_MAX} log onChange={setRe} />
          <Slider label={md`relative roughness $\varepsilon/D$`} value={rr} min={1e-6} max={0.05} log onChange={setRr} />
          <Segmented
            label="vertical axis"
            value={scale}
            onChange={setScale}
            options={[
              { value: 'F', label: md`Fanning $f_{\mathrm F}$` },
              { value: 'D', label: md`Darcy $4f_{\mathrm F}$` },
            ]}
          />
          <Toggle label={md`Colebrook family ($\varepsilon/D = 10^{-5}$ … $0.05$)`} checked={family} onChange={setFamily} />
          <Toggle label={md`regime boundaries $\varepsilon^+ = 5,\ 70$`} checked={loci} onChange={setLoci} />
        </>
      }
      readout={
        <Readout
          items={[
            { label: md`$f_{\mathrm F}$ at operating point`, value: fOp, digits: 4, tone: 'accent' },
            { label: md`Darcy $f_{\mathrm D} = 4f_{\mathrm F}$`, value: 4 * fOp, digits: 4 },
            { label: md`smooth $f_{\mathrm F}$ (9.53)`, value: Re >= 4000 ? fSmoothExp(Re) : '—', digits: 4 },
            { label: md`fully rough limit of (9.70)`, value: fRough, digits: 4 },
            { label: md`$\varepsilon^+ = \tfrac{\varepsilon}{D}\Rey\sqrt{f_{\mathrm F}/2}$`, value: laminar ? '—' : ep },
            { label: 'regime', value: regimeText, tone: regimeTone },
          ]}
        />
      }
      footer="Try this: keep ε/D = 10⁻³ and sweep Re from 10⁴ to 10⁸. The operating point leaves the smooth-pipe curve once ε⁺ passes about 5, then flattens onto the dotted fully-rough line beyond ε⁺ ≈ 70 — from there on f_F no longer changes with Re. Switch to the Darcy axis to compare with a printed Moody chart (every value ×4)."
    >
      <Plot
        height={360}
        x={{ label: md`Reynolds number $\Rey = \rho\overline{v}_{zm}D/\mu$`, domain: [RE_MIN, RE_MAX], log: true }}
        y={{ label: scale === 'F' ? md`Fanning friction factor $f_{\mathrm F}$` : md`Darcy friction factor $f_{\mathrm D} = 4f_{\mathrm F}$`, domain: [k * 0.0012, k * 0.03], log: true }}
        series={series}
        bands={[{ x0: 2300, x1: 4000, label: 'lam.→turb.' }]}
        hlines={[{ y: k * fRough, label: 'fully rough limit', color: 'var(--plot-1)', dash: '2 4' }]}
        marks={[{ x: Re, y: k * fOp, label: 'operating point', color: 'var(--plot-4)' }]}
        overlay={({ sx, sy }) =>
          family ? (
            <g>
              {FAMILY.map((r) => (
                <text key={r} x={sx(7e7)} y={sy(k * fColebrook(7e7, r)) - 3} textAnchor="end" className="fill-ink-3 text-[9.5px]">
                  {num.fmt(r, 1)}
                </text>
              ))}
            </g>
          ) : null
        }
      />
    </SimPanel>
  )
}
