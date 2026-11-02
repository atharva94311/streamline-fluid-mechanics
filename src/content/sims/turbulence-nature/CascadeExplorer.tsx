import { useState } from 'react'
import { Plot, Readout, Segmented, SimPanel, Slider, md, num } from '@/kit'

/**
 * Kolmogorov-scale explorer (supplementary). Order-of-magnitude estimates:
 *   ε ~ ṽ'^3 / L,  η = (ν³/ε)^{1/4},  τ_η = (ν/ε)^{1/2},  u_η = (νε)^{1/4},  L/η ~ Re_L^{3/4}.
 */

const FLUIDS = { water: 1.0e-6, air: 1.5e-5 } as const
type Fluid = keyof typeof FLUIDS
type Preset = 'pipe' | 'duct' | 'atmos' | 'custom'
const PRESETS: Record<Exclude<Preset, 'custom'>, { fluid: Fluid; L: number; u: number }> = {
  pipe: { fluid: 'water', L: 0.05, u: 0.1 },
  duct: { fluid: 'air', L: 0.4, u: 0.48 },
  atmos: { fluid: 'air', L: 100, u: 1.0 },
}

function lengthText(m: number): string {
  if (m < 1e-3) return `${num.fmt(m * 1e6, 3)} µm`
  if (m < 1) return `${num.fmt(m * 1e3, 3)} mm`
  return `${num.fmt(m, 3)} m`
}
function timeText(s: number): string {
  if (s < 1) return `${num.fmt(s * 1e3, 3)} ms`
  return `${num.fmt(s, 3)} s`
}

export function kolmogorov(L: number, u: number, nu: number) {
  const ReL = (u * L) / nu
  const eps = u ** 3 / L
  const eta = (nu ** 3 / eps) ** 0.25
  const teta = Math.sqrt(nu / eps)
  const ueta = (nu * eps) ** 0.25
  const ratio = L / eta
  return { ReL, eps, eta, teta, ueta, ratio, gens: Math.log2(ratio), tauL: L / u }
}

export function CascadeExplorer() {
  const [preset, setPreset] = useState<Preset>('pipe')
  const [fluid, setFluid] = useState<Fluid>('water')
  const [L, setL] = useState(0.05)
  const [u, setU] = useState(0.1)
  const nu = FLUIDS[fluid]
  const k = kolmogorov(L, u, nu)

  const choose = (p: Preset) => {
    setPreset(p)
    if (p === 'custom') return
    const q = PRESETS[p]
    setFluid(q.fluid)
    setL(q.L)
    setU(q.u)
  }
  const nGen = Math.max(0, Math.floor(k.gens))
  const gens: [number, number][] = []
  for (let n = 0; n <= nGen; n++) {
    const l = L / 2 ** n
    gens.push([l, k.ReL * (l / L) ** (4 / 3)])
  }
  const reAt = (l: number) => k.ReL * (l / L) ** (4 / 3)

  return (
    <SimPanel
      title="How far down does the cascade go?"
      subtitle="Kolmogorov estimates from the large eddies"
      wide
      controls={
        <>
          <Segmented<Preset>
            label="example"
            value={preset}
            onChange={choose}
            options={[
              { value: 'pipe', label: 'water pipe' },
              { value: 'duct', label: 'air duct' },
              { value: 'atmos', label: 'atmosphere' },
              { value: 'custom', label: 'custom' },
            ]}
          />
          <Segmented<Fluid>
            label={md`fluid ($\nu$ at about 20 °C)`}
            value={fluid}
            onChange={(f) => {
              setFluid(f)
              setPreset('custom')
            }}
            options={[
              { value: 'water', label: 'water' },
              { value: 'air', label: 'air' },
            ]}
          />
          <Slider
            label={md`largest-eddy size $L$ (≈ pipe diameter)`}
            value={L}
            min={0.005}
            max={200}
            log
            unit="m"
            onChange={(v) => {
              setL(v)
              setPreset('custom')
            }}
          />
          <Slider
            label={md`large-eddy velocity $\widetilde{v'}$ (RMS)`}
            value={u}
            min={0.005}
            max={3}
            log
            unit="m/s"
            onChange={(v) => {
              setU(v)
              setPreset('custom')
            }}
          />
        </>
      }
      readout={
        <Readout
          cols={2}
          items={[
            { label: md`$\Rey_L = \widetilde{v'}L/\nu$`, value: k.ReL },
            { label: md`$\varepsilon \sim \widetilde{v'}^{3}/L$`, value: k.eps, unit: 'W/kg' },
            { label: md`Kolmogorov length $\eta$`, value: lengthText(k.eta), tone: 'accent' },
            { label: md`Kolmogorov time $\tau_\eta$`, value: timeText(k.teta), tone: 'accent' },
            { label: md`Kolmogorov velocity $u_\eta$`, value: k.ueta, unit: 'm/s' },
            { label: md`size range $L/\eta$`, value: k.ratio },
            { label: 'halvings from L to η', value: k.gens.toFixed(1) },
            { label: md`large-eddy time $L/\widetilde{v'}$`, value: timeText(k.tauL) },
          ]}
        />
      }
      footer={
        <span>
          <b>Try this:</b> on the water-pipe preset, double the eddy velocity. Re<sub>L</sub> doubles, but η shrinks only by 2<sup>3/4</sup> ≈ 1.7 and
          the cascade gains just one more halving — every extra generation costs a factor 2<sup>4/3</sup> ≈ 2.5 in Re. Then try the atmosphere: about 17
          generations separate 100-m gusts from sub-millimetre eddies.
        </span>
      }
    >
      <Plot
        height={330}
        x={{ label: md`eddy size $\ell$ (m), log scale`, domain: [1e-6, 300], log: true }}
        y={{ label: md`eddy Reynolds number $\Rey_\ell$`, domain: [0.1, 1e9], log: true }}
        series={[
          { label: md`inertial range: $\Rey_\ell = \Rey_L(\ell/L)^{4/3}$`, fn: reAt, range: [k.eta, L], color: 'var(--plot-1)', width: 2.6 },
          { label: 'below η: no eddies survive', fn: reAt, range: [Math.max(1e-6, k.eta / 40), k.eta], color: 'var(--plot-7)', dash: '5 4', width: 1.6 },
          { label: 'eddy generations (size halves)', points: gens, kind: 'scatter', color: 'var(--plot-3)' },
        ]}
        hlines={[{ y: 1, label: 'Re_ℓ ≈ 1: viscosity takes over', color: 'var(--plot-4)' }]}
        vlines={[
          { x: k.eta, label: 'η', color: 'var(--plot-4)' },
          { x: L, label: 'L', color: 'var(--plot-1)' },
        ]}
        marks={[{ x: L, y: k.ReL, label: 'largest eddies', color: 'var(--plot-1)' }]}
      />
    </SimPanel>
  )
}
