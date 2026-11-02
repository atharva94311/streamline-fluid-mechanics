import { useState } from 'react'
import { Md, Readout, Segmented, SimPanel, Slider, md, num } from '@/kit'
import { FLUIDS, type FluidId } from './correlations'
import { Arrow, SvgTex } from './svg'

const VB = 'v̄'
const TB = 'T̄'
const CB = 'c̄'

interface Col {
  title: string
  qty: string
  grad: number
  flux: number
  fluxLabel: string
  unit: string
  color: string
}

/**
 * Table 9.1 made live: one eddy field (one ν_T = ℓ²|dv̄x/dy|) transports momentum, heat and a species,
 * each down its own mean gradient. Molecular values are shown for comparison (supplementary property data).
 */
export function TransportAnalogySim() {
  const [ellMM, setEllMM] = useState(4)
  const [G, setG] = useState(50)
  const [dT, setDT] = useState(-200)
  const [dc, setDc] = useState(-0.02)
  const [fluid, setFluid] = useState<FluidId>('air')
  const F = FLUIDS[fluid]

  const ell = ellMM / 1000
  const nuT = ell * ell * Math.abs(G)
  const tau = F.rho * nuT * G // τᵗ_yx
  const Nmom = -tau // upward flux of x momentum (Table 9.1: N̄ᵗ = −τᵗ_yx)
  const q = -F.rho * F.cp * nuT * dT
  const N = -nuT * dc
  const alphaMol = F.k / (F.rho * F.cp)

  const cols: Col[] = [
    { title: 'Momentum', qty: `ρ${VB}_x`, grad: G, flux: Nmom, fluxLabel: '−τ^t_{yx}', unit: 'Pa', color: 'var(--plot-1)' },
    { title: 'Heat', qty: `ρc_p${TB}`, grad: dT, flux: q, fluxLabel: 'q^t', unit: 'W/m²', color: 'var(--plot-4)' },
    { title: 'Mass', qty: CB, grad: dc, flux: N, fluxLabel: 'N^t', unit: 'kmol/m²s', color: 'var(--plot-5)' },
  ]

  return (
    <SimPanel
      title="One eddy field, three fluxes (Table 9.1)"
      subtitle={md`$\alpha_T=\mathcal{D}_T=\nu_{\mathrm T}$ assumed`}
      src={{ doc: 'wilkes', pages: '490', note: 'Table 9.1' }}
      wide
      controls={
        <>
          <Segmented
            label="fluid"
            value={fluid}
            onChange={setFluid}
            options={[
              { value: 'air', label: 'air' },
              { value: 'water', label: 'water' },
            ]}
          />
          <Slider label={md`mixing length $\ell$`} value={ellMM} min={0.5} max={15} step={0.5} onChange={setEllMM} unit="mm" />
          <Slider label={md`$d\overline{v}_x/dy$`} value={G} min={-80} max={80} step={1} onChange={setG} unit="s⁻¹" digits={2} />
          <Slider label={md`$\partial\overline{T}/\partial y$`} value={dT} min={-500} max={500} step={10} onChange={setDT} unit="K/m" digits={3} />
          <Slider label={md`$\partial\overline{c}/\partial y$`} value={dc} min={-0.1} max={0.1} step={0.002} onChange={setDc} unit="kmol/m⁴" digits={2} />
        </>
      }
      readout={
        <Readout
          items={[
            { label: md`$\nu_{\mathrm T}=\ell^2\lvert d\overline{v}_x/dy\rvert$`, value: nuT, unit: 'm²/s', tone: 'accent' },
            { label: md`$\tau^t_{yx}=\rho\nu_{\mathrm T}\,d\overline{v}_x/dy$`, value: tau, unit: 'Pa' },
            { label: md`$q^t$`, value: q, unit: 'W/m²' },
            { label: md`$N^t$`, value: N, unit: 'kmol/(m²·s)' },
            { label: md`$\nu_{\mathrm T}/\nu$`, value: nuT / F.nu },
            { label: md`$\nu_{\mathrm T}/\alpha$ (heat)`, value: nuT / alphaMol },
            { label: md`$\nu_{\mathrm T}/\mathcal{D}$ (mass)`, value: nuT / F.D },
            { label: 'fluid data', value: F.label },
          ]}
        />
      }
      footer={
        <Md inline>
          {md`**Try this:** flip the sign of $d\overline{v}_x/dy$ — the momentum arrow reverses, but $q^t$ and $N^t$ do not move: the velocity
          gradient enters them only through $\lvert d\overline{v}_x/dy\rvert$ inside $\nu_{\mathrm T}$. Then switch air → water: $\nu_{\mathrm T}$ is the same
          (it belongs to the flow), but the enhancement over molecular mass diffusion jumps by orders of magnitude.`}
        </Md>
      }
    >
      <svg viewBox="0 0 420 270" className="mx-auto block h-auto w-full max-w-[640px]" role="img" aria-label="Profiles and turbulent fluxes of momentum, heat and mass">
        <rect x={6} y={6} width={408} height={30} rx={8} fill="var(--surface-2)" />
        <SvgTex x={210} y={26} s={`same eddies ⇒ same ν_T = ${num.fmt(nuT, 3)} m²/s for all three`} size={12} anchor="middle" className="fill-ink" />
        {cols.map((c, i) => {
          const cx = 72 + i * 138
          const yTop = 60
          const yBot = 205
          const yMid = (yTop + yBot) / 2
          const s = Math.sign(c.grad)
          const tilt = 34 * s
          const up = c.flux > 0
          const zero = Math.abs(c.flux) < 1e-15
          return (
            <g key={c.title}>
              <SvgTex x={cx} y={54} s={c.title} size={12.5} anchor="middle" weight={700} className="fill-ink" />
              {/* y axis */}
              <Arrow x1={cx - 48} y1={yBot} x2={cx - 48} y2={yTop + 6} width={1.2} head={6} color="var(--ink-3)" />
              <SvgTex x={cx - 54} y={yTop + 12} s="y" size={11} anchor="end" className="fill-ink-3" />
              {/* mean profile: quantity (horizontal) vs y (vertical) */}
              <line x1={cx - 14 - tilt} y1={yBot - 8} x2={cx - 14 + tilt} y2={yTop + 14} stroke={c.color} strokeWidth={2.6} strokeLinecap="round" />
              <SvgTex x={cx - 14} y={yBot + 16} s={c.qty} size={11} anchor="middle" />
              {/* turbulent flux arrow, down the gradient */}
              {zero ? (
                <SvgTex x={cx + 32} y={yMid + 4} s="no flux" size={10.5} anchor="middle" className="fill-ink-3" />
              ) : (
                <Arrow x1={cx + 32} y1={up ? yMid + 40 : yMid - 40} x2={cx + 32} y2={up ? yMid - 40 : yMid + 40} color={c.color} width={4} head={12} />
              )}
              <SvgTex x={cx} y={yBot + 34} s={`${c.fluxLabel} = ${num.fmt(c.flux, 3)}`} size={11} anchor="middle" className="fill-ink" />
              <SvgTex x={cx} y={yBot + 48} s={c.unit} size={10} anchor="middle" className="fill-ink-3" />
            </g>
          )
        })}
      </svg>
    </SimPanel>
  )
}
