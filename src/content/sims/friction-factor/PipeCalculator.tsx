import { useState } from 'react'
import { Readout, Segmented, SimPanel, Slider, md, num } from '@/kit'
import { G, REGIME_LABEL, REGIME_TONE, fColebrook, fLaminar, wallRegime } from './laws'
import { WallCloseUp } from './WallCloseUp'

type FluidKey = 'water' | 'air' | 'oil'
type MatKey = 'drawn' | 'steel' | 'galv' | 'cast' | 'concrete'

/** Approximate properties at 20 °C (supplementary; the oil is an illustrative viscous liquid). */
const FLUIDS: Record<FluidKey, { label: string; rho: number; mu: number; liquid: boolean }> = {
  water: { label: 'Water', rho: 998, mu: 1.0e-3, liquid: true },
  air: { label: 'Air (1 atm)', rho: 1.2, mu: 1.81e-5, liquid: false },
  oil: { label: 'Viscous oil', rho: 900, mu: 0.1, liquid: true },
}

/** Typical handbook roughness heights (supplementary, not from the course PDFs). */
const MATERIALS: Record<MatKey, { label: string; eps: number }> = {
  drawn: { label: 'Drawn tubing', eps: 1.5e-6 },
  steel: { label: 'Commercial steel', eps: 4.5e-5 },
  galv: { label: 'Galvanized iron', eps: 1.5e-4 },
  cast: { label: 'Cast iron', eps: 2.6e-4 },
  concrete: { label: 'Concrete', eps: 1.0e-3 },
}

const mm = (v: number) => `${num.fmt(v * 1000, 3)} mm`

/**
 * Pipe pressure-drop calculator: fluid, D, L, ε and Q → v̄zm, Re, f_F (16/Re or Colebrook–White (9.70)), τw (9.73),
 * v̄z*, ε⁺ and its regime (9.64)–(9.66), Δp = 4 f_F (L/D) ½ρv̄zm², head loss and pumping power.
 */
export function PipeCalculator() {
  const [fluid, setFluid] = useState<FluidKey>('water')
  const [mat, setMat] = useState<MatKey>('steel')
  const [D, setD] = useState(0.1)
  const [L, setL] = useState(100)
  const [Q, setQ] = useState(0.0236)

  const F = FLUIDS[fluid]
  const eps = MATERIALS[mat].eps
  const nu = F.mu / F.rho
  const A = (Math.PI * D * D) / 4
  const v = Q / A
  const Re = (v * D) / nu
  const rr = eps / D
  const laminar = Re < 2300
  const f = laminar ? fLaminar(Re) : fColebrook(Re, rr)
  const q = 0.5 * F.rho * v * v
  const tw = f * q
  const vs = Math.sqrt(tw / F.rho)
  const ep = (eps * vs) / nu
  const reg = wallRegime(ep)
  const dp = 4 * f * (L / D) * q
  const hf = dp / (F.rho * G)
  const power = Q * dp

  const flowRegime = laminar ? 'Laminar' : Re < 4000 ? 'Transitional (uncertain)' : 'Turbulent'
  const warn =
    !F.liquid && v > 100
      ? 'Air above ~100 m/s (Mach ≈ 0.3): compressibility matters and this incompressible Δp formula is no longer reliable.'
      : F.liquid && v > 10
        ? 'Above ~10 m/s is an unusually high velocity for a liquid line — check the flow rate or the diameter.'
        : Re >= 2300 && Re < 4000
          ? 'Re is between 2300 and 4000: the flow may be laminar or turbulent, so the friction factor is uncertain (the turbulent value is shown).'
          : null

  return (
    <SimPanel
      title="Pipe pressure-drop calculator"
      subtitle="f_F from Colebrook–White (9.70) or 16/Re, then Δp = 4f_F(L/D)·½ρv̄²"
      wide
      controls={
        <>
          <Segmented
            label="fluid (approx. properties at 20 °C)"
            value={fluid}
            onChange={setFluid}
            options={(Object.keys(FLUIDS) as FluidKey[]).map((k) => ({ value: k, label: FLUIDS[k].label }))}
          />
          <Segmented
            label={md`pipe material (typical $\varepsilon$)`}
            value={mat}
            onChange={setMat}
            options={(Object.keys(MATERIALS) as MatKey[]).map((k) => ({ value: k, label: MATERIALS[k].label }))}
          />
          <Slider label={md`diameter $D$`} value={D} min={0.005} max={1} log onChange={setD} format={mm} />
          <Slider label={md`length $L$`} value={L} min={1} max={5000} log onChange={setL} unit="m" />
          <Slider label={md`flow rate $Q$`} value={Q} min={1e-6} max={2} log onChange={setQ} format={(x) => `${num.fmt(x * 1000, 3)} L/s`} />
        </>
      }
      readout={
        <Readout
          items={[
            { label: md`mean velocity $\overline{v}_{zm}$`, value: v, unit: 'm/s' },
            { label: md`$\Rey$`, value: Re },
            { label: 'flow', value: flowRegime, tone: laminar ? 'default' : 'accent' },
            { label: md`$f_{\mathrm F}$ (Darcy $4f_{\mathrm F}$)`, value: `${num.fmt(f, 3)} (${num.fmt(4 * f, 3)})` },
            { label: md`$\tau_w = f_{\mathrm F}\cdot\tfrac12\rho\overline{v}_{zm}^2$`, value: tw, unit: 'Pa' },
            { label: md`$\overline{v}_z^{*} = \sqrt{\tau_w/\rho}$`, value: vs, unit: 'm/s' },
            { label: md`$\varepsilon^+ = \varepsilon\overline{v}_z^{*}/\nu$`, value: laminar ? '—' : ep },
            { label: 'wall', value: laminar ? 'n/a (laminar)' : REGIME_LABEL[reg], tone: laminar ? 'default' : REGIME_TONE[reg] },
            { label: md`pressure drop $\Delta p$`, value: dp / 1000, unit: 'kPa', tone: 'accent' },
            { label: md`head loss $h_f = \Delta p/\rho g$`, value: hf, unit: 'm' },
            { label: md`pumping power $Q\,\Delta p$`, value: power, unit: 'W' },
            { label: md`sublayer edge $5\nu/\overline{v}_z^{*}$`, value: laminar ? '—' : mm(5 * nu / vs) },
          ]}
        />
      }
      footer="Try this: with water in a 100 mm commercial-steel pipe, raise Q from 5 L/s (ε⁺ ≈ 1.5, hydraulically smooth) to 60 L/s (ε⁺ ≈ 16, transition) and watch the bumps emerge from the sublayer in the close-up. Switch to concrete: at 24 L/s ε⁺ ≈ 200, completely rough — now doubling Q almost exactly quadruples Δp. Finally choose the viscous oil at about 5 L/s: the flow is laminar and the roughness no longer matters."
    >
      <div className="space-y-3">
        <div className="rounded-xl border border-line bg-surface-2/60 px-3 py-2 text-sm text-ink-2">
          {F.label}: ρ = {num.fmt(F.rho, 3)} kg/m³, μ = {num.fmt(F.mu, 3)} Pa·s, ν = {num.fmt(nu, 3)} m²/s · {MATERIALS[mat].label}: ε = {mm(eps)}, ε/D = {num.fmt(rr, 3)}
        </div>
        {laminar ? (
          <div className="rounded-xl border border-dashed border-line px-4 py-6 text-center text-sm text-ink-2">
            Laminar flow (Re &lt; 2300): f_F = 16/Re does not depend on roughness, and there is no turbulent sublayer to compare ε with.
          </div>
        ) : (
          <WallCloseUp epsPlus={ep} compact tracers={false} />
        )}
        {warn ? <div className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-ink dark:border-amber-500/30 dark:bg-amber-500/10">{warn}</div> : null}
      </div>
    </SimPanel>
  )
}
