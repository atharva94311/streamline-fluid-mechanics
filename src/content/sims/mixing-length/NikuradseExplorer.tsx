import { useState } from 'react'
import { Md, Plot, Readout, Segmented, SimPanel, Slider, Toggle, md, num } from '@/kit'
import { FLUIDS, type FluidId, ellOverA, fanningSmooth, nuT30, nuT31, nuTFromEllAndStress } from './correlations'

/**
 * Figs. 9.7 and 9.8 with physical units: pick Re, pipe size and fluid; the friction factor (9.53) gives τw and the
 * friction velocity, which turn the universal curves (9.29)–(9.31) into ℓ (mm), ν_T (m²/s) and ν_T/ν.
 */
export function NikuradseExplorer() {
  const [Re, setRe] = useState(1e5)
  const [D, setD] = useState(0.05)
  const [fluid, setFluid] = useState<FluidId>('water')
  const [ya, setYa] = useState(0.5)
  const [showModel, setShowModel] = useState(false)
  const F = FLUIDS[fluid]

  const fF = fanningSmooth(Re) // (9.53)
  const V = (Re * F.nu) / D // mean velocity v̄zm
  const tauW = 0.5 * fF * F.rho * V * V // (9.51)
  const vStar = Math.sqrt(tauW / F.rho) // friction velocity
  const a = D / 2
  const aPlus = (a * vStar) / F.nu
  const y = ya * a
  const ell = ellOverA(ya) * a
  const nuT = nuT31(ya) * a * vStar
  const grad = ell > 0 ? nuT / (ell * ell) : NaN // from (9.32)
  const yPlus = y * aPlus / a
  const viscBand = Math.min(1, 30 / aPlus)
  const tooFast = fluid === 'air' && V > 100

  return (
    <SimPanel
      title="Nikuradse's pipe correlations in real units"
      subtitle="Figs. 9.7–9.8 + a Reynolds-number slider"
      src={[
        { doc: 'wilkes', pages: '491–492', note: 'Eqs. (9.29)–(9.32)' },
        { doc: 'wilkes', pages: '498', note: 'Eqs. (9.51), (9.53)' },
      ]}
      wide
      controls={
        <>
          <Segmented
            label="fluid"
            value={fluid}
            onChange={setFluid}
            options={[
              { value: 'water', label: 'water' },
              { value: 'air', label: 'air' },
            ]}
          />
          <Slider label="Reynolds number Re" value={Re} min={5e3} max={3.4e6} log onChange={setRe} digits={3} />
          <Slider label="pipe diameter D" value={D} min={0.01} max={1} log onChange={setD} unit="m" digits={3} />
          <Slider label={md`position $y/a$ (from the wall)`} value={ya} min={0.01} max={1} step={0.01} onChange={setYa} digits={2} />
          <Toggle label="show (9.29) + linear stress (supplementary)" checked={showModel} onChange={setShowModel} />
        </>
      }
      readout={
        <Readout
          items={[
            { label: md`$f_F$ from (9.53)`, value: fF, digits: 3 },
            { label: md`$\overline{v}_{zm}$`, value: V, unit: 'm/s', tone: tooFast ? 'bad' : 'default' },
            { label: md`$\tau_w$`, value: tauW, unit: 'Pa' },
            { label: md`$\overline{v}_z^*=\sqrt{\tau_w/\rho}$`, value: vStar, unit: 'm/s' },
            { label: md`$\ell$ at $y/a$`, value: ell * 1000, unit: 'mm', tone: 'accent' },
            { label: md`$\nu_{\mathrm T}$ at $y/a$`, value: nuT, unit: 'm²/s', tone: 'accent' },
            { label: md`$\nu_{\mathrm T}/\nu$`, value: nuT / F.nu, tone: 'good' },
            { label: md`$\lvert d\overline{v}_z/dy\rvert=\nu_{\mathrm T}/\ell^2$`, value: grad, unit: 's⁻¹' },
            { label: md`$y^+=y\overline{v}_z^*/\nu$`, value: yPlus },
            { label: md`$a^+=a\overline{v}_z^*/\nu$`, value: aPlus },
          ]}
        />
      }
      footer={
        <Md inline>
          {md`**Try this:** raise Re from $10^4$ to $10^6$. The dimensionless curves do not move at all — (9.29)–(9.31) contain no Re — yet
          $\nu_{\mathrm T}/\nu$ at mid-radius climbs from about 25 to about 1500, and the shaded viscous-affected strip ($y^+<30$) shrinks toward the wall.
          Then slide $y/a$ to 1: $\ell$ is largest at the centreline while $\nu_{\mathrm T}$ is not.`}
        </Md>
      }
    >
      <div className="space-y-4">
        <Plot
          height={220}
          x={{ label: md`$y/a$ (distance from the wall / radius)`, domain: [0, 1] }}
          y={{ label: md`$\ell/a$`, domain: [0, 0.15] }}
          series={[
            { label: '(9.29) Nikuradse', fn: ellOverA, color: 'var(--plot-1)' },
            { label: md`$\ell = 0.4y$ (near-wall tangent)`, fn: (x) => 0.4 * x, range: [0, 0.375], color: 'var(--plot-3)', dash: '6 4' },
          ]}
          bands={[{ x0: 0, x1: viscBand, label: viscBand > 0.06 ? 'y⁺ < 30' : undefined }]}
          marks={[{ x: ya, y: ellOverA(ya), color: 'var(--plot-4)' }]}
        />
        <Plot
          height={240}
          x={{ label: md`$y/a$`, domain: [0, 1] }}
          y={{ label: md`$\nu_{\mathrm T}/(a\sqrt{\tau_w/\rho})$`, domain: [0, 0.09] }}
          series={[
            { label: '(9.31) accurate', fn: nuT31, color: 'var(--plot-2)' },
            { label: '(9.30) approximate', fn: nuT30, color: 'var(--plot-6)', dash: '6 4' },
            ...(showModel
              ? [{ label: md`$(\ell/a)\sqrt{1-y/a}$ from (9.29) + linear stress`, fn: nuTFromEllAndStress, color: 'var(--plot-5)', dash: '2 3' }]
              : []),
          ]}
          bands={[{ x0: 0, x1: viscBand, label: viscBand > 0.06 ? 'y⁺ < 30' : undefined }]}
          marks={[{ x: ya, y: nuT31(ya), color: 'var(--plot-4)' }]}
        />
        {tooFast ? (
          <p className="text-xs text-red-600 dark:text-red-300">
            {`Mean air speed ≈ ${num.fmt(V, 3)} m/s — far beyond the incompressible range (Ma > 0.3). Use a larger pipe or a lower Re.`}
          </p>
        ) : null}
      </div>
    </SimPanel>
  )
}
