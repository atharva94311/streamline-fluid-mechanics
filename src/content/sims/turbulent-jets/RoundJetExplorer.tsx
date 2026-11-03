import { useState } from 'react'
import { Md, Plot, Readout, Segmented, SimPanel, Slider, md } from '@/kit'
import { K_REICHARDT, ROUND_ZETA_COEFF, ZETA_HALF_ROUND } from './jetSolutions'

const FLUIDS = {
  air: { rho: 1.2, nu: 1.5e-5, label: 'air' },
  water: { rho: 1000, nu: 1.0e-6, label: 'water' },
} as const

/**
 * Round (axisymmetric) turbulent jet, Eqs. (9.132)–(9.134), with ν_T = 0.0161 √(Ṁ/ρ) (dimensionally consistent reading
 * of Reichardt's constant, Wilkes p. 532). Profiles at a chosen station, plus centre-line decay and entrainment.
 */
export function RoundJetExplorer() {
  const [fluid, setFluid] = useState<'air' | 'water'>('air')
  const [U0, setU0] = useState(fluid === 'air' ? 50 : 3)
  const [d0mm, setD0mm] = useState(10)
  const [zd, setZd] = useState(50)
  const { rho, nu } = FLUIDS[fluid]
  const d0 = d0mm / 1000
  const z = zd * d0
  const Mdot = (rho * U0 * U0 * Math.PI * d0 * d0) / 4 // N
  const K = Mdot / rho
  const nuT = K_REICHARDT * Math.sqrt(K)
  const S = Math.sqrt((3 * Mdot) / (Math.PI * rho))
  const zetaOf = (r: number, zz: number) => (S * Math.abs(r)) / (4 * nuT * zz)
  const vz = (r: number, zz: number) => {
    const D = 1 + zetaOf(r, zz) ** 2 / 4
    return (3 * Mdot) / (8 * Math.PI * nuT * rho * zz * D * D)
  }
  const vr = (r: number, zz: number) => {
    const t = zetaOf(r, zz)
    const D = 1 + (t * t) / 4
    const s = (S / (4 * zz)) * ((t - (t * t * t) / 4) / (D * D))
    return r < 0 ? -s : s
  }
  const vzc = vz(0, z)
  const rHalf = (ZETA_HALF_ROUND * 4 * nuT * z) / S
  const Q = 8 * Math.PI * nuT * z
  const Q0 = (U0 * Math.PI * d0 * d0) / 4
  const rTurn = (2 * 4 * nuT * z) / S // ζ = 2: radial velocity changes sign
  const decay = (x: number) => (3 * Mdot) / (8 * Math.PI * nuT * rho * x * d0) / U0 // x is z/d0
  return (
    <SimPanel
      title="Round-jet explorer"
      subtitle={md`Eqs. (9.132)–(9.134) with $\nu_{\mathrm T} = 0.0161\sqrt{\dot{\mathcal M}/\rho}$`}
      src={{ doc: 'wilkes', pages: '531–532', note: 'Eqs. (9.132)–(9.134)' }}
      wide
      controls={
        <>
          <Segmented
            label="Fluid"
            value={fluid}
            onChange={(f) => {
              setFluid(f)
              setU0(f === 'air' ? 50 : 3)
            }}
            options={[
              { value: 'air', label: 'Air' },
              { value: 'water', label: 'Water' },
            ]}
          />
          <Slider label={md`exit velocity $U_0$`} value={U0} min={fluid === 'air' ? 5 : 0.5} max={fluid === 'air' ? 100 : 10} step={fluid === 'air' ? 1 : 0.1} onChange={setU0} unit="m/s" digits={3} />
          <Slider label={md`nozzle diameter $d_0$`} value={d0mm} min={2} max={50} step={1} onChange={setD0mm} unit="mm" />
          <Slider label={md`station $z/d_0$`} value={zd} min={10} max={100} step={1} onChange={setZd} />
        </>
      }
      readout={
        <Readout
          items={[
            { label: md`$\dot{\mathcal M} = \rho U_0^2\pi d_0^2/4$`, value: Mdot, unit: 'N' },
            { label: md`$\nu_{\mathrm T}$ (constant)`, value: nuT, unit: 'm²/s' },
            { label: md`$\nu_{\mathrm T}/\nu$`, value: nuT / nu },
            { label: md`$\overline{v}_{zc}$ at $z$`, value: vzc, unit: 'm/s', tone: 'accent' },
            { label: md`$r_{1/2}$ (half velocity)`, value: rHalf * 1000, unit: 'mm' },
            { label: md`$\overline{v}_r = 0$ at $r$ ($\zeta=2$)`, value: rTurn * 1000, unit: 'mm' },
            { label: md`$Q = 8\pi\nu_{\mathrm T}z$`, value: Q * 1000, unit: 'L/s' },
            { label: md`$Q/Q_0$`, value: Q / Q0, tone: 'good' },
          ]}
        />
      }
      footer={
        <Md inline>
          {md`**Try this:** double $z/d_0$ from 25 to 50 — $\overline{v}_{zc}$ halves, $r_{1/2}$ and $Q$ double. Now double $U_0$ instead: $\overline{v}_{zc}$, $\nu_{\mathrm T}$ and $Q$ all double but $r_{1/2}$ does not move, because $\zeta = ${ROUND_ZETA_COEFF.toFixed(2)}\,r/z$ contains no velocity at all. The radial velocity (×10) is outward near the axis and inward (entrainment) beyond $\zeta = 2$.`}
        </Md>
      }
    >
      <div className="space-y-3">
        <Plot
          x={{ label: md`radial position $r/d_0$ (meridional plane)`, domain: [-30, 30] }}
          y={{ label: md`velocity / $U_0$`, domain: [-0.04, 0.7] }}
          series={[
            { label: md`axial $\overline{v}_z/U_0$ (9.132)`, fn: (x) => vz(x * d0, z) / U0, color: 'var(--plot-1)', width: 2.6, samples: 400 },
            { label: md`radial $10\,\overline{v}_r/U_0$ (9.133)`, fn: (x) => (10 * vr(x * d0, z)) / U0, color: 'var(--plot-2)', width: 2, samples: 400 },
          ]}
          hlines={[{ y: 0, color: 'var(--ink-3)' }]}
          vlines={[
            { x: rHalf / d0, label: 'r½', color: 'var(--ink-3)', dash: '4 4' },
            { x: -rHalf / d0, color: 'var(--ink-3)', dash: '4 4' },
          ]}
          height={260}
        />
        <Plot
          x={{ label: md`axial distance $z/d_0$ (plane jet: $x/h_0$)`, domain: [5, 200], log: true }}
          y={{ label: 'ratio', domain: [0.01, 100], log: true }}
          series={[
            { label: md`round: $\overline{v}_{zc}/U_0 \propto 1/z$`, fn: decay, color: 'var(--plot-1)', width: 2.4 },
            { label: md`round: $Q/Q_0 \propto z$`, fn: (x) => (8 * Math.PI * nuT * x * d0) / Q0, color: 'var(--plot-4)', width: 2.4 },
            { label: md`plane jet for comparison: $\overline{v}_{xc}/U_0 \propto x^{-1/2}$`, fn: (x) => 2.367 / Math.sqrt(x), color: 'var(--plot-1)', dash: '6 4' },
            { label: md`plane jet: $Q'/Q'_0 \propto x^{1/2}$`, fn: (x) => 0.617 * Math.sqrt(x), color: 'var(--plot-4)', dash: '6 4' },
          ]}
          vlines={[{ x: zd, label: 'station', color: 'var(--ink-2)', dash: '3 3' }]}
          height={240}
        />
      </div>
    </SimPanel>
  )
}
