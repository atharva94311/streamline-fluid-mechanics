import { useState } from 'react'
import { Plot, Readout, Segmented, SimPanel, Slider, md, num } from '@/kit'
import { uPlusLog, uPlusSeventh } from './laws'

type FluidKey = 'water' | 'air'
const FLUIDS: Record<FluidKey, { label: string; rho: number; nu: number; v: [number, number, number] }> = {
  water: { label: 'Water (ρ = 1000 kg/m³, ν = 1.0×10⁻⁶ m²/s)', rho: 1000, nu: 1.0e-6, v: [0.1, 5, 2] },
  air: { label: 'Air (ρ = 1.2 kg/m³, ν = 1.5×10⁻⁵ m²/s)', rho: 1.2, nu: 1.5e-5, v: [1, 40, 12] },
}

/** Friction velocity from the log law (9.42) through the measured point: v/v* = 5.5 + 2.5 ln(y v* / ν). */
function vStarLog(v: number, y: number, nu: number): number {
  let s = 0.05 * v
  for (let i = 0; i < 200; i++) s = v / Math.max(1, uPlusLog((y * s) / nu))
  return s
}

/**
 * Wilkes Eqs. (9.79)–(9.80): wall shear stress from ONE time-averaged velocity reading v̄z at distance y,
 * via the 1/7 law; compared with the log law (9.42) interpretation of the same reading.
 */
export function PitotWallStress() {
  const [fluid, setFluid] = useState<FluidKey>('water')
  const F = FLUIDS[fluid]
  const [v, setV] = useState(F.v[2])
  const [y, setY] = useState(0.01)

  const changeFluid = (k: FluidKey) => {
    setFluid(k)
    setV(FLUIDS[k].v[2])
  }

  const vs80 = 0.15 * Math.pow(v, 7 / 8) * Math.pow(F.nu / y, 1 / 8)
  const tw80 = 0.0225 * F.rho * v * v * Math.pow(F.nu / (v * y), 0.25)
  const yp80 = (y * vs80) / F.nu
  const vsL = vStarLog(v, y, F.nu)
  const twL = F.rho * vsL * vsL
  const ypL = (y * vsL) / F.nu
  const diff = ((twL - tw80) / tw80) * 100
  const status = yp80 < 30 ? 'too close to the wall (y⁺ < 30): neither law applies' : yp80 > 1000 ? 'far from the wall: 1/7 law drifts from the log law' : 'turbulent core: both laws reasonable'
  const tone = yp80 < 30 ? 'bad' : yp80 > 1000 ? 'accent' : 'good'

  return (
    <SimPanel
      title="Wall shear stress from one Pitot reading"
      subtitle="Wilkes Eqs. (9.79)–(9.80) versus the log law (9.42)"
      wide
      controls={
        <>
          <Segmented
            label="fluid"
            value={fluid}
            onChange={changeFluid}
            options={[
              { value: 'water', label: 'Water' },
              { value: 'air', label: 'Air' },
            ]}
          />
          <div className="text-xs text-ink-3">{F.label}</div>
          <Slider label={md`measured velocity $\overline{v}_z$`} value={v} min={F.v[0]} max={F.v[1]} log onChange={setV} unit="m/s" />
          <Slider label={md`distance from the wall $y$`} value={y} min={2e-4} max={0.1} log onChange={setY} format={(x) => `${num.fmt(x * 1000, 3)} mm`} />
        </>
      }
      readout={
        <Readout
          items={[
            { label: md`$\overline{v}_z^{*}$ from (9.79)`, value: vs80, unit: 'm/s', digits: 4 },
            { label: md`$\tau_w$ from (9.80)`, value: tw80, unit: 'Pa', digits: 4, tone: 'accent' },
            { label: md`$y^+$ of the probe (9.79)`, value: yp80 },
            { label: md`$\tau_w$ from log law (9.42)`, value: twL, unit: 'Pa', digits: 4 },
            { label: 'log law vs (9.80)', value: diff, unit: '%', digits: 2 },
            { label: 'probe position', value: status, tone },
          ]}
        />
      }
      footer="Try this: slide the probe from 0.5 mm to 50 mm at fixed velocity. Inside 30 < y⁺ < ~1000 the two estimates of τw agree within a few per cent; very close to the wall (y⁺ < 30) neither formula is valid, and far out the 1/7 law drifts away from the log law."
    >
      <Plot
        height={320}
        x={{ label: md`$y^+ = y\overline{v}_z^{*}/\nu$`, domain: [1, 1e5], log: true }}
        y={{ label: md`$v_z^+ = \overline{v}_z/\overline{v}_z^{*}$`, domain: [0, 40] }}
        series={[
          { label: md`1/7 law (9.78)`, fn: uPlusSeventh, range: [1, 1e5], color: 'var(--plot-1)', width: 2.4 },
          { label: md`log law (9.42)`, fn: uPlusLog, range: [5, 1e5], color: 'var(--plot-5)', width: 2.2 },
          { label: md`sublayer $v_z^+ = y^+$`, fn: (x) => x, range: [1, 14], color: 'var(--plot-6)', width: 1.6 },
        ]}
        bands={[{ x0: 1, x1: 30, label: 'sublayer + buffer' }]}
        marks={[
          { x: yp80, y: v / vs80, label: 'reading via (9.80)', color: 'var(--plot-1)' },
          { x: ypL, y: v / vsL, label: 'via log law', color: 'var(--plot-5)' },
        ]}
      />
    </SimPanel>
  )
}
