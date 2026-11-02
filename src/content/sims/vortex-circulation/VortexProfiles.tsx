import { useState } from 'react'
import { Plot, Readout, Segmented, SimPanel, Slider, md, type Series } from '@/kit'

type Quantity = 'v' | 'w' | 'G'

/**
 * Free vortex K/r, forced vortex Ωr and the Rankine combination (forced core of radius R, free vortex outside),
 * plotted as speed, element rotation ω_z or circulation round a circle of radius r.
 */
export function VortexProfiles() {
  const [K, setK] = useState(0.2)
  const [R, setR] = useState(0.1)
  const [q, setQ] = useState<Quantity>('v')
  const Om = K / (R * R) // core angular velocity (rad/s)
  const G = 2 * Math.PI * K

  const rankineV = (r: number) => (r <= R ? Om * r : K / r)
  let series: Series[]
  let yLabel: string
  let yDomain: [number, number]
  if (q === 'v') {
    yLabel = md`speed $v_\theta$ (m/s)`
    yDomain = [0, 7]
    series = [
      { label: md`free vortex $K/r$`, fn: (r) => K / r, color: 'var(--plot-1)', dash: '6 4', range: [0.01, 0.6] },
      { label: md`forced vortex $\Omega r$, $\Omega = K/R^2$`, fn: (r) => Om * r, color: 'var(--plot-3)', dash: '6 4' },
      { label: 'Rankine vortex (core + free)', fn: rankineV, color: 'var(--plot-4)', width: 3.2, samples: 480 },
    ]
  } else if (q === 'w') {
    yLabel = md`rotation $\omega_z$ (rad/s)`
    yDomain = [0, 1.3 * Om]
    series = [
      { label: md`free vortex: $\omega_z = 0$ for $r>0$`, fn: () => 0, color: 'var(--plot-1)', dash: '6 4', width: 3 },
      { label: md`forced vortex: $\omega_z = \Omega$`, fn: () => Om, color: 'var(--plot-3)', dash: '6 4' },
      { label: 'Rankine vortex', fn: (r) => (r <= R ? Om : 0), color: 'var(--plot-4)', width: 3.2, samples: 600 },
    ]
  } else {
    yLabel = md`circulation $\Gamma(r)$ (m²/s)`
    yDomain = [0, 2.2]
    series = [
      { label: md`free vortex: $2\pi K$`, fn: () => G, color: 'var(--plot-1)', dash: '6 4', range: [0.003, 0.6] },
      { label: md`forced vortex: $2\pi\Omega r^2$`, fn: (r) => 2 * Math.PI * Om * r * r, color: 'var(--plot-3)', dash: '6 4' },
      { label: 'Rankine vortex', fn: (r) => (r <= R ? 2 * Math.PI * Om * r * r : G), color: 'var(--plot-4)', width: 3.2, samples: 480 },
    ]
  }

  return (
    <SimPanel
      title="Free, forced and Rankine vortices"
      subtitle={md`$v_\theta = Kr/R^2$ inside the core, $K/r$ outside`}
      controls={
        <>
          <Segmented<Quantity>
            label="plot"
            value={q}
            onChange={setQ}
            options={[
              { value: 'v', label: md`speed $v_\theta$` },
              { value: 'w', label: md`rotation $\omega_z$` },
              { value: 'G', label: md`circulation $\Gamma$` },
            ]}
          />
          <Slider label={md`free-vortex strength $K$`} value={K} min={0.1} max={0.3} step={0.01} onChange={setK} unit="m²/s" digits={2} />
          <Slider label={md`core radius $R$`} value={R} min={0.05} max={0.3} step={0.005} onChange={setR} unit="m" digits={3} />
        </>
      }
      readout={
        <Readout
          items={[
            { label: md`peak speed $K/R$`, value: K / R, unit: 'm/s', tone: 'accent' },
            { label: md`core spin $\Omega = K/R^2$`, value: Om, unit: 'rad/s' },
            { label: md`core vorticity $2\Omega$`, value: 2 * Om, unit: '1/s' },
            { label: md`total $\Gamma = 2\pi K$`, value: G, unit: 'm²/s' },
          ]}
        />
      }
      footer="Try this: shrink the core radius R towards 0.05 m. The peak speed K/R climbs and the core spins faster (Ω = K/R²), yet nothing outside the core changes and the total circulation 2πK stays fixed — the ideal free vortex is the limit R → 0, with all of its rotation squeezed into the single point r = 0."
    >
      <Plot
        x={{ label: md`radius $r$ (m)`, domain: [0, 0.6] }}
        y={{ label: yLabel, domain: yDomain }}
        series={series}
        bands={[{ x0: 0, x1: R, label: 'forced core' }]}
        vlines={[{ x: R, label: 'r = R' }]}
        marks={q === 'v' ? [{ x: R, y: K / R, label: `peak ${(K / R).toFixed(2)} m/s` }] : []}
        height={320}
      />
    </SimPanel>
  )
}
