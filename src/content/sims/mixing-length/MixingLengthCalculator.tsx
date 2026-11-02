import { useState } from 'react'
import { FlowRow, Md, Plot, Readout, Segmented, SimPanel, Slider, md, num } from '@/kit'
import { FLUIDS, type FluidId } from './correlations'

const t = (x: number, s = 3) => num.fmtTeX(x, s)

/**
 * Interactive version of Wilkes' derivation (Eqs. 9.19–9.26): eddy statistics (λ̃, R, α, β) and the mean
 * velocity gradient give the RMS fluctuations, the eddy viscosity, the Prandtl mixing length and the stress.
 */
export function MixingLengthCalculator() {
  const [lamMM, setLamMM] = useState(8)
  const [R, setR] = useState(0.6)
  const [alpha, setAlpha] = useState(1)
  const [beta, setBeta] = useState(0.8)
  const [G, setG] = useState(20)
  const [fluid, setFluid] = useState<FluidId>('water')
  const F = FLUIDS[fluid]

  const lam = lamMM / 1000
  const aG = Math.abs(G)
  const vx = alpha * lam * aG // (9.22)
  const vy = beta * vx // (9.23)
  const nuT1 = R * vy * lam // (9.19) + (9.20)
  const ell = lam * Math.sqrt(R * alpha * beta) // (9.25)
  const nuT2 = ell * ell * aG // (9.26)
  const tau = F.rho * nuT2 * G // Table 9.1, momentum row
  const tauVisc = F.mu * G
  const yMax = Math.max(1e-9, F.rho * ell * ell * 3600) * 1.08

  return (
    <SimPanel
      title="Prandtl's chain: eddy statistics → ℓ → ν_T"
      subtitle="two routes, one answer"
      src={{ doc: 'wilkes', pages: '489–490', note: 'Eqs. (9.20)–(9.26)' }}
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
          <Slider label={md`RMS travel $\widetilde{\lambda}$`} value={lamMM} min={1} max={20} step={0.5} onChange={setLamMM} unit="mm" />
          <Slider label={md`correlation $R$`} value={R} min={0.1} max={1} step={0.01} onChange={setR} digits={2} />
          <Slider label={md`kick factor $\alpha$`} value={alpha} min={0.2} max={2} step={0.05} onChange={setAlpha} digits={2} />
          <Slider label={md`$\beta=\widetilde{v_y'}/\widetilde{v_x'}$ (1 = isotropic)`} value={beta} min={0.2} max={1.5} step={0.05} onChange={setBeta} digits={2} />
          <Slider label={md`mean gradient $d\overline{v}_x/dy$`} value={G} min={-60} max={60} step={1} onChange={setG} unit="s⁻¹" digits={2} />
        </>
      }
      readout={
        <Readout
          items={[
            { label: md`$\ell=\widetilde\lambda\sqrt{R\alpha\beta}$`, value: ell * 1000, unit: 'mm', tone: 'accent' },
            { label: md`$\nu_{\mathrm T}=\ell^2\lvert d\overline{v}_x/dy\rvert$`, value: nuT2, unit: 'm²/s', tone: 'accent' },
            { label: md`$\nu_{\mathrm T}/\nu$ (${fluid})`, value: nuT2 / F.nu },
            { label: md`$\tau^t_{yx}$`, value: tau, unit: 'Pa', tone: tau >= 0 ? 'good' : 'bad' },
            { label: md`viscous $\mu\,d\overline{v}_x/dy$`, value: tauVisc, unit: 'Pa' },
            { label: md`$\tau^t_{yx}/\tau^{\ell}_{yx}$`, value: G === 0 ? NaN : tau / tauVisc },
          ]}
        />
      }
      footer={
        <Md inline>
          {md`**Try this:** set $R=\alpha=\beta=1$ — then $\ell=\widetilde\lambda$ exactly. Flip the sign of $d\overline{v}_x/dy$: $\nu_{\mathrm T}$
          does not change but $\tau^t_{yx}$ does. Double the gradient: $\nu_{\mathrm T}$ doubles while $\tau^t_{yx}$ quadruples (follow the dot on the parabola).`}
        </Md>
      }
    >
      <div className="space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-ink-3">Route 1 — follow the fluctuations, Eqs. (9.20)–(9.23)</div>
        <FlowRow
          nodes={[
            { title: 'eddy travel', md: md`$\widetilde\lambda=${t(lamMM)}$ mm`, tone: 'slate' },
            { title: '(9.22) x-kick', md: md`$\widetilde{v_x'}=\alpha\widetilde\lambda\lvert d\overline{v}_x/dy\rvert=${t(vx)}$ m/s`, tone: 'cyan' },
            { title: '(9.23) y-motion', md: md`$\widetilde{v_y'}=\beta\widetilde{v_x'}=${t(vy)}$ m/s`, tone: 'cyan' },
            { title: '(9.19)+(9.20)', md: md`$\nu_{\mathrm T}=R\,\widetilde{v_y'}\,\widetilde\lambda=${t(nuT1)}$ m²/s`, tone: 'emerald' },
          ]}
        />
        <div className="text-xs font-bold uppercase tracking-wider text-ink-3">Route 2 — Prandtl's lumped length, Eqs. (9.25)–(9.26)</div>
        <FlowRow
          nodes={[
            { title: 'lump constants', md: md`$\sqrt{R\alpha\beta}=${t(Math.sqrt(R * alpha * beta))}$`, tone: 'slate' },
            { title: '(9.25) mixing length', md: md`$\ell=${t(ell * 1000)}$ mm`, tone: 'violet' },
            { title: '(9.26) eddy viscosity', md: md`$\nu_{\mathrm T}=\ell^2\lvert d\overline{v}_x/dy\rvert=${t(nuT2)}$ m²/s`, tone: 'emerald' },
          ]}
        />
        <Plot
          height={240}
          x={{ label: md`$d\overline{v}_x/dy$ (s⁻¹)`, domain: [-60, 60] }}
          y={{ label: md`$\tau_{yx}$ (Pa)`, domain: [-yMax, yMax] }}
          series={[
            { label: md`turbulent $\rho\ell^2\lvert d\overline{v}_x/dy\rvert\,d\overline{v}_x/dy$`, fn: (g) => F.rho * ell * ell * Math.abs(g) * g, color: 'var(--plot-1)' },
            { label: md`viscous $\mu\,d\overline{v}_x/dy$`, fn: (g) => F.mu * g, color: 'var(--plot-3)', dash: '6 4' },
          ]}
          marks={[{ x: G, y: tau, color: 'var(--plot-4)' }]}
        />
      </div>
    </SimPanel>
  )
}
