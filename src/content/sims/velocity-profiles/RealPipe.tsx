import { useMemo, useState } from 'react'
import { Md, Plot, Readout, Segmented, SimPanel, Slider, Toggle, md, num } from '@/kit'
import { fBlasius, fFanning953, fmtLength, vLog, vThree, vTwoPiece } from './profiles'

type Fluid = 'water' | 'air'
type FSrc = '953' | 'blasius'

/** Typical property values (supplementary, not from the PDFs). */
const FLUIDS: Record<Fluid, { rho: number; mu: number; vRange: [number, number]; v0: number }> = {
  water: { rho: 998.2, mu: 1.002e-3, vRange: [0.05, 5], v0: 1.6 },
  air: { rho: 1.204, mu: 1.81e-5, vRange: [0.5, 50], v0: 10 },
}

/** Mean of the three-region profile over the pipe cross-section, in wall units: (2/a⁺²)∫ v⁺ (a⁺ − y⁺) dy⁺. */
function meanThreePlus(aP: number): number {
  const n = 600
  const lo = Math.log(1e-3)
  const hi = Math.log(aP)
  const h = (hi - lo) / n
  let s = 0
  for (let i = 0; i <= n; i++) {
    const y = Math.exp(lo + i * h)
    const w = i === 0 || i === n ? 1 : i % 2 ? 4 : 2
    s += w * vThree(y) * (aP - y) * y
  }
  return ((2 / (aP * aP)) * s * h) / 3
}

/** "Real pipe converter": fluid, diameter and mean velocity → friction velocity, wall units and sublayer in mm. */
export function RealPipe() {
  const [fluid, setFluid] = useState<Fluid>('water')
  const [Dmm, setDmm] = useState(50)
  const [V, setV] = useState(FLUIDS.water.v0)
  const [fsrc, setFsrc] = useState<FSrc>('953')
  const [lam, setLam] = useState(false)

  const F = FLUIDS[fluid]
  const nu = F.mu / F.rho
  const D = Dmm / 1000
  const a = D / 2
  const Re = (V * D) / nu
  const fF = fsrc === '953' ? fFanning953(Re) : fBlasius(Re)
  const tw = 0.5 * fF * F.rho * V * V
  const vs = Math.sqrt(tw / F.rho)
  const lv = nu / vs
  const d2 = 11.6 * lv
  const d3 = 5 * lv
  const vzd = 11.6 * vs
  const aP = a / lv
  const vc = vs * vLog(aP)
  const share = ((2 * vs * vs) / (nu * a * a * V)) * ((a * d2 * d2) / 2 - (d2 * d2 * d2) / 3)
  const meanProf = useMemo(() => vs * meanThreePlus(aP), [vs, aP])
  const turbulent = Re >= 4000

  const aMm = a * 1000
  // dense points near both walls so the steep near-wall rise is resolved
  const profile = useMemo(() => {
    // right half, ordered by increasing r: centreline (y = a) → wall (y → 0)
    const right: [number, number][] = []
    const n = 260
    for (let k = n; k >= 0; k--) {
      const y = Math.min(a, lv * 0.02 * (aP / 0.02) ** (k / n))
      right.push([(a - y) * 1000, vs * vThree(y / lv)])
    }
    right.push([a * 1000, 0])
    const left = right.map(([r, v]) => [-r, v] as [number, number]).reverse()
    return [...left, ...right]
  }, [lv, aP, vs, a])

  const zoomMax = 60 * lv
  const zu = zoomMax < 1e-3 ? { f: 1e6, unit: 'µm' } : { f: 1e3, unit: 'mm' }
  const L = (m: number) => fmtLength(m)
  const d2L = L(d2)
  const d3L = L(d3)
  const lvL = L(lv)
  const yMax = 1.15 * Math.max(vc, lam ? 2 * V : vc)

  const changeFluid = (f: Fluid) => {
    setFluid(f)
    setV(FLUIDS[f].v0)
  }

  return (
    <SimPanel
      title="Real-pipe converter"
      subtitle="fluid + pipe + mean velocity → v̄z*, wall units and sublayer thickness"
      wide
      controls={
        <>
          <Segmented<Fluid>
            label="Fluid (typical properties)"
            value={fluid}
            onChange={changeFluid}
            options={[
              { value: 'water', label: 'water 20 °C' },
              { value: 'air', label: 'air 20 °C, 1 atm' },
            ]}
          />
          <Slider label="pipe diameter $D$" value={Dmm} min={5} max={500} log onChange={setDmm} unit="mm" digits={3} />
          <Slider label={md`mean velocity $\overline{v}_{zm}$`} value={V} min={F.vRange[0]} max={F.vRange[1]} log onChange={setV} unit="m/s" digits={3} />
          <Segmented<FSrc>
            label="friction factor from"
            value={fsrc}
            onChange={setFsrc}
            options={[
              { value: '953', label: 'Eq. (9.53)' },
              { value: 'blasius', label: 'Blasius (9.59)' },
            ]}
          />
          <Toggle label="laminar profile, same mean (compare)" checked={lam} onChange={setLam} />
        </>
      }
      readout={
        <Readout
          cols={2}
          items={[
            { label: '$\\mathrm{Re}$', value: Re, digits: 3, tone: turbulent ? 'default' : 'bad' },
            { label: '$f_{\\mathrm F}$ (Fanning)', value: fF, digits: 3 },
            { label: '$\\tau_w = \\tfrac12 f_{\\mathrm F}\\rho\\overline{v}_{zm}^2$', value: tw, unit: 'Pa', digits: 3 },
            { label: '$\\overline{v}_z^* = \\sqrt{\\tau_w/\\rho}$', value: vs, unit: 'm/s', digits: 3, tone: 'accent' },
            { label: 'wall unit $\\nu/\\overline{v}_z^*$', value: lvL.value, unit: lvL.unit, digits: 3 },
            { label: '$\\delta = 11.6\\,\\nu/\\overline{v}_z^*$', value: d2L.value, unit: d2L.unit, digits: 3, tone: 'accent' },
            { label: 'three-piece edge $5\\,\\nu/\\overline{v}_z^*$', value: d3L.value, unit: d3L.unit, digits: 3 },
            { label: '$\\overline{v}_{z\\delta} = 11.6\\,\\overline{v}_z^*$', value: `${num.fmt(vzd, 3)} m/s (${Math.round((100 * vzd) / V)} % of mean)` },
            { label: 'centreline $\\overline{v}_{zc}$ (log law at $y=a$)', value: vc, unit: 'm/s', digits: 3 },
            { label: 'flow carried inside $\\delta$', value: `${(100 * share).toFixed(2)} %` },
            { label: 'mean of plotted profile', value: meanProf, unit: 'm/s', digits: 3 },
            { label: '$a^+ = a\\overline{v}_z^*/\\nu$', value: aP, digits: 4 },
          ]}
        />
      }
      footer={
        <Md className="md-tight">{md`**Try this:** with water in a 50 mm pipe, raise $\overline{v}_{zm}$ from 0.5 to 5 m/s: $\delta$ shrinks from about 0.42 mm to 0.05 mm, yet the velocity at its edge stays at 50–65 % of the mean and the sublayer carries only ~1 % → 0.1 % of the flow. Now keep 1.6 m/s and change $D$ from 50 to 500 mm: $\mathrm{Re}$ rises ten-fold and $\delta/D$ falls about eight-fold, yet $\delta$ itself only grows from about 0.15 to 0.19 mm — it is set by $\nu/\overline{v}_z^*$, i.e. by the wall shear stress, which changes little with pipe size at fixed velocity.`}</Md>
      }
    >
      {!turbulent ? (
        <div className="mb-3 rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-ink dark:border-red-500/30 dark:bg-red-500/10">
          Re = {num.fmt(Re, 3)} is below the turbulent range — these turbulent wall laws (and Eq. 9.53, valid from Re ≈ 5×10³) do not apply.
        </div>
      ) : null}
      {fsrc === 'blasius' && Re > 1e5 ? (
        <div className="mb-3 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-ink dark:border-amber-500/30 dark:bg-amber-500/10">
          Blasius (9.59) is stated for Re &lt; 10⁵ — here it is being extrapolated.
        </div>
      ) : null}
      <Plot
        height={260}
        title="Time-averaged velocity across the pipe (three-region profile)"
        x={{ label: 'radial position $r$ (mm)', domain: [-aMm, aMm] }}
        y={{ label: '$\\overline{v}_z$ (m/s)', domain: [0, yMax] }}
        series={[
          { label: 'turbulent (9.44)–(9.46)', points: profile, color: 'var(--plot-1)', width: 2.6 },
          ...(lam ? [{ label: 'laminar, same mean: $2\\overline{v}_{zm}(1-r^2/a^2)$', fn: (r: number) => 2 * V * (1 - (r / aMm) ** 2), color: 'var(--plot-7)', dash: '6 4' }] : []),
        ]}
        hlines={[{ y: V, label: 'mean', color: 'var(--plot-3)' }]}
      />
      <div className="mt-4">
        <Plot
          height={240}
          title={`Zoom on the wall: first 60 wall units (${num.fmt(zoomMax * zu.f, 3)} ${zu.unit})`}
          x={{ label: `distance from wall $y$ (${zu.unit})`, domain: [0, zoomMax * zu.f] }}
          y={{ label: '$\\overline{v}_z$ (m/s)', domain: [0, 1.1 * vs * vLog(60)] }}
          series={[
            { label: 'three-region', fn: (y: number) => vs * vThree(y / zu.f / lv), color: 'var(--plot-1)', width: 2.6 },
            { label: 'two-piece', fn: (y: number) => vs * vTwoPiece(y / zu.f / lv), color: 'var(--plot-8)', dash: '5 4', width: 1.6 },
          ]}
          bands={[
            { x0: 0, x1: 5 * lv * zu.f, label: 'sublayer', color: 'color-mix(in srgb, var(--plot-5) 14%, transparent)' },
            { x0: 5 * lv * zu.f, x1: 30 * lv * zu.f, label: 'buffer', color: 'color-mix(in srgb, var(--plot-3) 12%, transparent)' },
          ]}
          vlines={[{ x: d2 * zu.f, label: 'δ (y⁺ = 11.6)', color: 'var(--plot-5)' }]}
        />
      </div>
      <p className="mt-2 text-xs text-ink-3">
        Property values are typical handbook numbers (supplementary). f_F from Wilkes Eq. (9.53) or (9.59) — see the friction-factor topic. The log law
        has a small kink at the centreline (real profiles are rounded there); the plotted profile still integrates to within a few per cent of the
        chosen mean velocity, because the sublayer and buffer carry very little of the flow.
      </p>
    </SimPanel>
  )
}
