import { useState } from 'react'
import { Md, Plot, Readout, SimPanel, Slider, md } from '@/kit'
import { ALPHA_ML, BETA_ML, mlProfile, ZETA_HALF_ML, ZETA_HALF_TANH } from './jetSolutions'

/**
 * Eddy-viscosity (tanh) plane jet: the role of the free constant k = 4αβ/γ in (9.121), and how the uniform eddy
 * viscosity of (9.116) compares with the mixing-length eddy viscosity ℓ²|∂v̄x/∂y| across the jet.
 */
export function TanhExplorer() {
  const [k, setK] = useState(2)
  const [zp, setZp] = useState(0.88)
  const rk = Math.sqrt(k)
  const fk = (z: number) => rk * Math.tanh(z / rk)
  const fpk = (z: number) => 1 / Math.cosh(z / rk) ** 2
  // ν_T / (b½ v̄c) for both models (β = 7.67 in both, α_ML = 0.0333)
  const cTanh = 1 / (4 * BETA_ML * ZETA_HALF_TANH)
  const mlNu = (z: number) => {
    const p = mlProfile(z)
    return (ALPHA_ML * ALPHA_ML * BETA_ML * BETA_ML * Math.sqrt(Math.max(Math.abs(p.f) * p.fp, 0))) / ZETA_HALF_ML
  }
  const residual = fk(zp) ** 2 + k * fpk(zp) - k
  return (
    <SimPanel
      title="The tanh solution and its free constant"
      subtitle={md`$f^2 = -k\,f' + c$ with $k = 4\alpha\beta/\gamma$`}
      src={{ doc: 'wilkes', pages: '529–530', note: 'Eqs. (9.116)–(9.123)' }}
      wide
      controls={
        <>
          <Slider label={md`$k = 4\alpha\beta/\gamma$`} value={k} min={0.25} max={4} step={0.05} onChange={setK} digits={2} />
          <Slider label={md`probe $\zeta$`} value={zp} min={0} max={3} step={0.01} onChange={setZp} digits={3} />
          <button type="button" className="btn-ghost w-full justify-center" onClick={() => setK(1)}>
            {"Wilkes' choice β = γ/(4α) → k = 1"}
          </button>
        </>
      }
      readout={
        <Readout
          items={[
            { label: md`$f = \sqrt{k}\tanh(\zeta/\sqrt{k})$`, value: fk(zp), digits: 4 },
            { label: md`$f' = \overline{v}_x/\overline{v}_{xc}$`, value: fpk(zp), digits: 4, tone: 'accent' },
            { label: md`residual $f^2 + k f' - k$`, value: Math.abs(residual) < 1e-12 ? 0 : residual, digits: 2, tone: 'good' },
            { label: md`$\zeta$ where $f' = \tfrac12$`, value: rk * ZETA_HALF_TANH, digits: 4 },
            { label: md`uniform $\nu_{\mathrm T}/(b_{1/2}\overline{v}_{xc})$ (tanh)`, value: cTanh, digits: 3 },
            { label: md`mixing-length $\nu_{\mathrm T}/(b_{1/2}\overline{v}_{xc})$ at probe`, value: mlNu(zp), digits: 3 },
          ]}
        />
      }
      footer={
        <Md inline>
          {md`**Try this:** move $k$ — every curve still starts at $f'(0)=1$ and is the *same* bell, merely stretched in $\zeta$, and the residual stays zero. Choosing $\beta$ to make $k=1$ is just a choice of ruler for $\zeta$. In the lower plot compare the two eddy viscosities: the mixing-length value vanishes on the axis (no velocity gradient there), the simplified model of Eq. (9.116) spreads one value across the whole section.`}
        </Md>
      }
    >
      <div className="space-y-3">
        <Plot
          x={{ label: md`$\zeta$`, domain: [-3, 3] }}
          y={{ label: md`axial velocity $f' = \overline{v}_x/\overline{v}_{xc}$`, domain: [0, 1.1] }}
          series={[
            { label: md`$f' = \mathrm{sech}^2(\zeta/\sqrt{k})$, current $k$`, fn: fpk, color: 'var(--plot-3)', width: 2.6 },
            { label: md`$k = 1$: $f' = \mathrm{sech}^2\zeta$ (Eq. 9.123)`, fn: (z) => 1 / Math.cosh(z) ** 2, color: 'var(--plot-2)', dash: '6 4' },
            { label: 'mixing-length solution (Fig. 9.16)', fn: (z) => mlProfile(z).fp, color: 'var(--plot-1)', width: 2 },
          ]}
          vlines={[{ x: zp, color: 'var(--ink-2)', dash: '3 3' }]}
          height={250}
        />
        <Plot
          x={{ label: md`$\zeta = \beta y/x$ (both with $\beta = 7.67$)`, domain: [-3, 3] }}
          y={{ label: md`$\nu_{\mathrm T}/(b_{1/2}\,\overline{v}_{xc})$`, domain: [0, 0.06] }}
          series={[
            { label: 'mixing length: ℓ²|∂v̄x/∂y|', fn: mlNu, color: 'var(--plot-1)', width: 2.4, samples: 400 },
            { label: 'simplified model (9.116): uniform', fn: () => cTanh, color: 'var(--plot-3)', width: 2.4, dash: '6 4' },
          ]}
          vlines={[{ x: zp, color: 'var(--ink-2)', dash: '3 3' }]}
          height={200}
        />
      </div>
    </SimPanel>
  )
}
