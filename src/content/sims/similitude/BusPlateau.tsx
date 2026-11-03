/**
 * Example 7.5 (Fox p.263–264): drag-coefficient plateau of a 1:16 bus model and the scaled prototype drag/power.
 */
import { useState } from 'react'
import { Md, Plot, Readout, Segmented, SimPanel, Slider, md } from '@/kit'
import { EX75_F, EX75_POINTS, EX75_V, ex75CD } from './data'

const RHO = 1.23
const AP = 7.8
const WP = 2.44
const NU = 1.46e-5

export function BusPlateau() {
  const [kmh, setKmh] = useState(100)
  const [which, setWhich] = useState<'plateau' | 'low'>('plateau')
  const CD = which === 'plateau' ? 0.46 : ex75CD(EX75_V[0], EX75_F[0])
  const V = kmh / 3.6
  const F = 0.5 * CD * RHO * V * V * AP
  const P = F * V
  const Rep = (V * WP) / NU

  return (
    <SimPanel
      title="Bus drag: plateau, then scale up"
      subtitle="Example 7.5, 1:16 model in standard air"
      src={{ doc: 'fox', pages: '263–264', note: 'Example 7.5' }}
      wide
      controls={
        <>
          <Segmented
            label="$C_D$ used for the prototype"
            options={[
              { value: 'plateau', label: 'plateau 0.46' },
              { value: 'low', label: 'slowest run 0.51' },
            ]}
            value={which}
            onChange={setWhich}
          />
          <Slider label="Prototype speed $V_p$" value={kmh} min={20} max={130} step={1} onChange={setKmh} unit="km/h" digits={3} />
        </>
      }
      readout={
        <Readout
          items={[
            { label: md`$Re_p = V_p w_p/\nu$`, value: Rep.toExponential(2) },
            { label: '$C_D$ used', value: CD, digits: 3 },
            { label: 'drag $F_{D_p}$', value: F / 1000, unit: 'kN', digits: 3, tone: 'accent' },
            { label: 'power $F_{D_p}V_p$', value: P / 1000, unit: 'kW', digits: 3, tone: 'accent' },
          ]}
        />
      }
      footer={
        <Md>{md`**Try this:** at 100 km/h the plateau value gives ≈ 1.70 kN and ≈ 47 kW (the book prints 1.71 kN, 47.5 kW after rounding). Switch to the slowest-run value 0.51 — a test that never reached the plateau would over-predict drag by about 11 %. Halve the speed: drag drops ×4, power ×8.`}</Md>
      }
    >
      <div className="space-y-3">
        <Plot
          x={{ label: 'Model Reynolds number, $Re_m$ (×10⁵)', domain: [0, 5.2] }}
          y={{ label: 'Model drag coefficient, $C_{D_m}$', domain: [0.4, 0.6] }}
          series={[
            { label: 'test points (C_D = 53.3 F/V², Re = 1.04×10⁴ V)', points: EX75_POINTS.map(([r, c]) => [r / 1e5, c]), kind: 'scatter', color: 'var(--plot-1)' },
            { label: 'plateau C_D ≈ 0.46', fn: () => 0.46, range: [4, 5.2], color: 'var(--plot-4)', width: 2.2 },
          ]}
          vlines={[{ x: 4, label: 'Re_m = 4×10⁵ (≈ 40 m/s)', color: 'var(--ink-3)', dash: '4 4' }]}
          height={250}
        />
        <Plot
          x={{ label: 'Prototype speed (km/h)', domain: [0, 130] }}
          y={{ label: 'Drag power (kW)', domain: [0, 110] }}
          series={[{ label: 'P = ½ C_D ρ A V³', fn: (k) => (0.5 * CD * RHO * AP * (k / 3.6) ** 3) / 1000, color: 'var(--plot-3)', width: 2.2 }]}
          marks={[
            { x: kmh, y: P / 1000, label: `${(P / 1000).toFixed(1)} kW`, color: 'var(--plot-3)' },
            { x: 100, y: 47.5, label: 'book: 47.5 kW', color: 'var(--plot-4)' },
          ]}
          height={210}
        />
      </div>
    </SimPanel>
  )
}
