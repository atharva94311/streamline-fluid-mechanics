import { useState } from 'react'
import { Md, Plot, Readout, Segmented, SimPanel, Slider, md } from '@/kit'
import { FLUIDS, type FluidId, ellOverA, nuT31 } from './correlations'

/**
 * The §9.4 procedure as a virtual experiment: a measured pressure gradient fixes the stress at every radius
 * (Eq. 9.27); a measured velocity gradient at one point then gives ν_T and ℓ (Eq. 9.28), which are compared
 * with Nikuradse's correlations (9.29) and (9.31).
 */
export function MeasurementLab() {
  const [fluid, setFluid] = useState<FluidId>('water')
  const [a, setA] = useState(0.05) // pipe radius, m
  const [dpdx, setDpdx] = useState(400) // −dp/dz, Pa/m
  const [ya, setYa] = useState(0.5)
  const [G, setG] = useState(12) // measured |dv̄z/dy|, s⁻¹
  const F = FLUIDS[fluid]

  const tauW = (a / 2) * dpdx // (9.82) with (9.27) at r = a
  const vStar = Math.sqrt(tauW / F.rho)
  const r = a * (1 - ya)
  const tau = (r / 2) * dpdx // |τᵗ_rz| from (9.27)
  const nuT = tau / (F.rho * G) // (9.28): τ = ρ ν_T |dv̄/dy|
  const ell = Math.sqrt(nuT / G)
  const ellCorr = ellOverA(ya) * a
  const nuCorr = nuT31(ya) * a * vStar
  const Gpred = Math.sqrt(tau / F.rho) / ellCorr // gradient that (9.28) + (9.29) predict
  const devEll = (ell / ellCorr - 1) * 100
  const devNu = (nuT / nuCorr - 1) * 100

  return (
    <SimPanel
      title="Virtual experiment: ν_T and ℓ from Δp and a Pitot traverse"
      subtitle="the §9.4 recipe"
      src={{ doc: 'wilkes', pages: '491', note: 'Eqs. (9.27)–(9.28)' }}
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
          <Slider label="pipe radius a" value={a} min={0.01} max={0.5} log onChange={setA} unit="m" digits={3} />
          <Slider label={md`measured $-dp/dz$`} value={dpdx} min={1} max={5000} log onChange={setDpdx} unit="Pa/m" digits={3} />
          <Slider label={md`probe position $y/a$`} value={ya} min={0.05} max={0.95} step={0.01} onChange={setYa} digits={2} />
          <Slider label={md`measured $\lvert d\overline{v}_z/dy\rvert$`} value={G} min={0.1} max={10000} log onChange={setG} unit="s⁻¹" digits={3} />
          <button type="button" className="btn-ghost w-full justify-center" onClick={() => setG(Gpred)}>
            Set gradient to the value (9.29) predicts
          </button>
        </>
      }
      readout={
        <Readout
          items={[
            { label: md`$\tau_w=\tfrac{a}{2}(-dp/dz)$`, value: tauW, unit: 'Pa' },
            { label: md`$\lvert\tau^t_{rz}\rvert=\tfrac{r}{2}(-dp/dz)$`, value: tau, unit: 'Pa' },
            { label: md`$\nu_{\mathrm T}=\lvert\tau\rvert/(\rho\lvert d\overline{v}_z/dy\rvert)$`, value: nuT, unit: 'm²/s', tone: 'accent' },
            { label: md`$\ell=\sqrt{\nu_{\mathrm T}/\lvert d\overline{v}_z/dy\rvert}$`, value: ell * 1000, unit: 'mm', tone: 'accent' },
            { label: md`$\ell/a$ measured vs (9.29)`, value: `${(ell / a).toFixed(4)} vs ${ellOverA(ya).toFixed(4)}` },
            { label: md`deviation from (9.29)`, value: `${devEll >= 0 ? '+' : '−'}${Math.abs(devEll).toFixed(1)} %`, tone: Math.abs(devEll) < 5 ? 'good' : 'bad' },
            { label: md`$\nu_{\mathrm T}/(a\overline{v}_z^*)$ vs (9.31)`, value: `${(nuT / (a * vStar)).toFixed(4)} vs ${nuT31(ya).toFixed(4)}` },
            { label: md`deviation from (9.31)`, value: `${devNu >= 0 ? '+' : '−'}${Math.abs(devNu).toFixed(1)} %`, tone: Math.abs(devNu) < 8 ? 'good' : 'bad' },
          ]}
        />
      }
      footer={
        <Md inline>
          {md`**Try this:** press the button, then nudge the measured gradient up by 10 %: both $\nu_{\mathrm T}$ and $\ell$ drop by about 9 %
          (at fixed stress each is proportional to $1/\lvert d\overline{v}_z/dy\rvert$). Move the probe toward the wall and watch the required gradient shoot
          up — that is where a Pitot tube has to be smallest and the neglected viscous stress starts to matter.`}
        </Md>
      }
    >
      <div className="space-y-4">
        <Plot
          height={230}
          x={{ label: md`$y/a$`, domain: [0, 1] }}
          y={{ label: md`$\ell/a$`, domain: [0, 0.2] }}
          series={[
            { label: '(9.29) Nikuradse', fn: ellOverA, color: 'var(--plot-1)' },
            { label: md`$0.4\,y/a$`, fn: (x) => 0.4 * x, range: [0, 0.5], color: 'var(--plot-3)', dash: '6 4' },
          ]}
          marks={[{ x: ya, y: Math.min(0.199, ell / a), label: 'your measurement', color: 'var(--plot-4)' }]}
        />
        <Plot
          height={200}
          x={{ label: md`$y/a$`, domain: [0, 1] }}
          y={{ label: md`$\lvert\tau\rvert/\tau_w$`, domain: [0, 1.05] }}
          series={[{ label: md`linear stress, Eq. (9.27): $\lvert\tau\rvert/\tau_w = r/a = 1-y/a$`, fn: (x) => 1 - x, color: 'var(--plot-2)' }]}
          marks={[{ x: ya, y: 1 - ya, color: 'var(--plot-4)' }]}
        />
      </div>
    </SimPanel>
  )
}
