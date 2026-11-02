import { useState } from 'react'
import { Md, Plot, Readout, SimPanel, Slider, Toggle, md, num } from '@/kit'
import { SublayerZoom } from './SublayerZoom'
import { aPlusOf, fFanning953, fmtLength } from './profiles'

const RE_LO = 5e3
const RE_HI = 1e7
const r78 = (Re: number) => Re ** 0.875

/** Sublayer thickness vs Reynolds number: Wilkes Eqs. (9.58), (9.60), (9.62), (9.63) + a to-scale zoom. */
export function SublayerVsRe() {
  const [Re, setRe] = useState(1e5)
  const [Dmm, setDmm] = useState(50)
  const [rough, setRough] = useState(false)
  const [epsD, setEpsD] = useState(2e-5)

  const fF = fFanning953(Re)
  const d60 = 58.3 / r78(Re)
  const d62 = 61.7 / r78(Re)
  const d63 = 25.2 / r78(Re)
  const d58 = 16.4 / (Re * Math.sqrt(fF))
  const aP = aPlusOf(Re, fF)
  const epsPlus = epsD * 2 * aP
  const regime = epsPlus < 5 ? 'hydraulically smooth (9.64)' : epsPlus < 70 ? 'transition (9.65)' : 'completely rough (9.66)'
  const dLen = fmtLength(d58 * Dmm * 1e-3)
  const d3Len = fmtLength(d63 * Dmm * 1e-3)
  const beyond = Re > 1e5

  const solidDash = (fn: (r: number) => number, label: string, color: string) => [
    { label, fn, range: [RE_LO, 1e5] as [number, number], color, width: 2.4 },
    { fn, range: [1e5, RE_HI] as [number, number], color, width: 1.6, dash: '5 4', hideInLegend: true },
  ]

  return (
    <SimPanel
      title="How thin is the laminar sublayer?"
      subtitle="δ/D against Re, and the sublayer drawn to scale"
      wide
      src={{ doc: 'wilkes', pages: '500', note: 'Eqs. (9.58)–(9.63)' }}
      controls={
        <>
          <Slider label={md`Reynolds number $\mathrm{Re}$`} value={Re} min={RE_LO} max={RE_HI} log onChange={setRe} format={(v) => num.fmt(v, 3)} />
          <Slider label="pipe diameter $D$" value={Dmm} min={10} max={1000} log onChange={setDmm} unit="mm" digits={3} />
          <Toggle label="show wall roughness" checked={rough} onChange={setRough} />
          {rough ? (
            <Slider label={md`relative roughness $\varepsilon/D$`} value={epsD} min={1e-6} max={1e-2} log onChange={setEpsD} format={(v) => num.fmt(v, 2)} />
          ) : null}
        </>
      }
      readout={
        <Readout
          cols={2}
          items={[
            { label: '$\\delta/D$ (9.60) two-piece', value: d60, digits: 3, tone: 'accent' },
            { label: '$\\delta/D$ (9.62) 1/7 law', value: d62, digits: 3 },
            { label: '$\\delta/D$ (9.63) three-piece', value: d63, digits: 3 },
            { label: '$\\delta/D$ (9.58) + (9.53)', value: d58, digits: 3 },
            { label: `$\\delta$ for $D$ = ${num.fmt(Dmm, 3)} mm`, value: dLen.value, unit: dLen.unit, digits: 3 },
            { label: '$\\delta$ three-piece edge', value: d3Len.value, unit: d3Len.unit, digits: 3 },
            { label: '$a^+ = a\\overline{v}_z^*/\\nu$', value: aP, digits: 4 },
            ...(rough
              ? [
                  { label: '$\\varepsilon\\overline{v}_z^*/\\nu$', value: epsPlus, digits: 3 },
                  { label: 'regime (p. 501)', value: regime, tone: epsPlus < 5 ? ('good' as const) : ('bad' as const) },
                ]
              : [{ label: 'Blasius (9.59) range', value: beyond ? 'extrapolated (Re > 10⁵)' : 'inside (Re < 10⁵)', tone: beyond ? ('bad' as const) : ('good' as const) }]),
          ]}
        />
      }
      footer={
        <Md className="md-tight">{md`**Try this:** move $\mathrm{Re}$ from $10^4$ to $10^5$ — every line drops by $10^{7/8} \approx 7.5\times$, "almost in direct proportion" to Re (Wilkes' conclusion 2). Watch the zoom: at $\mathrm{Re} = 10^5$ the whole sublayer is about one pixel of the to-scale radius, yet the velocity has already reached roughly half its centreline value at its edge (conclusion 1). Then switch on roughness and raise $\varepsilon/D$ until the teeth stick out beyond $y^+ = 5$: the pipe stops being hydraulically smooth.`}</Md>
      }
    >
      <Plot
        height={300}
        x={{ label: 'Reynolds number $\\mathrm{Re} = \\rho\\overline{v}_{zm}D/\\mu$', domain: [RE_LO, RE_HI], log: true }}
        y={{ label: '$\\delta/D$', domain: [1e-5, 0.1], log: true }}
        series={[
          ...solidDash((r) => 58.3 / r78(r), '(9.60) $58.3/\\mathrm{Re}^{7/8}$', 'var(--plot-1)'),
          ...solidDash((r) => 61.7 / r78(r), '(9.62) $61.7/\\mathrm{Re}^{7/8}$', 'var(--plot-6)'),
          ...solidDash((r) => 25.2 / r78(r), '(9.63) $25.2/\\mathrm{Re}^{7/8}$', 'var(--plot-3)'),
          { label: '(9.58) with $f_{\\mathrm F}$ from (9.53)', fn: (r) => 16.4 / (r * Math.sqrt(fFanning953(r))), color: 'var(--plot-5)', dash: '2 3', width: 2 },
        ]}
        bands={[{ x0: 1e5, x1: RE_HI, label: 'Blasius extrapolated', color: 'color-mix(in srgb, var(--plot-4) 7%, transparent)' }]}
        vlines={[{ x: Re, color: 'var(--ink-2)', dash: '4 3' }]}
        marks={[
          { x: Re, y: d60, color: 'var(--plot-1)' },
          { x: Re, y: d63, color: 'var(--plot-3)' },
        ]}
      />
      <div className="mt-4 border-t border-line pt-3">
        <SublayerZoom aPlus={aP} epsPlus={rough ? epsPlus : undefined} />
      </div>
      <p className="mt-2 text-xs text-ink-3">
        Zoom uses the two-piece profile with a⁺ = (Re/2)√(f_F/2), f_F from Eq. (9.53). Roughness height in wall units ε⁺ = (ε/D)·2a⁺ is
        estimated with the smooth-pipe friction velocity, so it is a lower bound once the pipe is rough. Dashed lines beyond Re = 10⁵ use the
        Blasius law outside its stated range.
      </p>
    </SimPanel>
  )
}
