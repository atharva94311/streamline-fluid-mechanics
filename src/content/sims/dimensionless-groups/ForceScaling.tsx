/**
 * Concept "force-ratios": how the order-of-magnitude force estimates of Fox p. 255 scale with the size L
 * of the flow. Log–log plot of every estimate versus L at the chosen V and fluid, a marker at the chosen L,
 * and live ratios to the inertia force ρV²L².
 */
import { useMemo, useState } from 'react'
import { Md, Plot, Readout, Segmented, SimPanel, Slider, md, type Series } from '@/kit'
import { FLUIDS, forceEstimates, sci, type FluidKey } from './data'

const LD: [number, number] = [1e-5, 1e2]
const YD: [number, number] = [1e-14, 1e16]
const clampY = (v: number) => Math.min(YD[1] * 10, Math.max(YD[0] / 10, v))

const COLORS = {
  inertia: 'var(--plot-1)',
  viscous: 'var(--plot-2)',
  pressure: 'var(--plot-3)',
  gravity: 'var(--plot-4)',
  surface: 'var(--plot-5)',
  compress: 'var(--plot-6)',
}

export function ForceScaling() {
  const [fk, setFk] = useState<FluidKey>('water')
  const [V, setV] = useState(2)
  const [L, setL] = useState(0.1)
  const [dp, setDp] = useState(2000)
  const f = FLUIDS[fk]

  const series = useMemo<Series[]>(() => {
    const s: Series[] = [
      { label: md`inertia $\rho V^2L^2$`, fn: (x) => clampY(forceEstimates(f, V, x, dp).inertia), color: COLORS.inertia, width: 3 },
      { label: md`viscous $\mu VL$`, fn: (x) => clampY(forceEstimates(f, V, x, dp).viscous), color: COLORS.viscous },
      { label: md`pressure $\Delta p L^2$`, fn: (x) => clampY(forceEstimates(f, V, x, dp).pressure), color: COLORS.pressure, dash: '6 4' },
      { label: md`gravity $\rho g L^3$`, fn: (x) => clampY(forceEstimates(f, V, x, dp).gravity), color: COLORS.gravity },
      { label: 'compressibility $E_vL^2$', fn: (x) => clampY(forceEstimates(f, V, x, dp).compress), color: COLORS.compress, dash: '2 3' },
    ]
    if (f.sigma != null) {
      s.splice(4, 0, {
        label: md`surface tension $\sigma L$`,
        fn: (x) => clampY(forceEstimates(f, V, x, dp).surface ?? 0),
        color: COLORS.surface,
      })
    }
    return s
  }, [f, V, dp])

  const F = forceEstimates(f, V, L, dp)
  const ratio = (x: number | null) => (x == null ? null : x / F.inertia)
  const others: [string, number | null][] = [
    ['viscous', F.viscous],
    ['pressure', F.pressure],
    ['gravity', F.gravity],
    ['surface tension', F.surface],
    ['compressibility', F.compress],
  ]
  // largest of the non-inertia forces, ignoring compressibility (it never acts unless density can change)
  const biggest = others
    .filter(([k, v]) => v != null && k !== 'compressibility')
    .sort((a, b) => (b[1] as number) - (a[1] as number))[0]

  const marks = [
    { x: L, y: F.inertia, color: COLORS.inertia },
    { x: L, y: F.viscous, color: COLORS.viscous },
    { x: L, y: F.gravity, color: COLORS.gravity },
    ...(F.surface != null ? [{ x: L, y: F.surface, color: COLORS.surface }] : []),
  ]

  return (
    <SimPanel
      title="Force-scaling explorer"
      subtitle="order-of-magnitude forces on a fluid element of size $L$"
      wide
      controls={
        <>
          <Segmented
            label="Fluid (typical values)"
            value={fk}
            onChange={setFk}
            options={(Object.keys(FLUIDS) as FluidKey[]).map((k) => ({ value: k, label: FLUIDS[k].label }))}
          />
          <Slider label="speed $V$" value={V} min={1e-3} max={1e3} log onChange={setV} unit="m/s" />
          <Slider label="size $L$" value={L} min={LD[0]} max={LD[1]} log onChange={setL} unit="m" />
          <Slider label="pressure difference $\Delta p$" value={dp} min={1} max={1e7} log onChange={setDp} unit="Pa" />
        </>
      }
      readout={
        <div className="space-y-2">
          <Readout
            cols={2}
            items={[
              { label: md`inertia $\rho V^2L^2$`, value: F.inertia, unit: 'N', tone: 'accent' },
              { label: 'viscous / inertia', value: ratio(F.viscous) ?? 0 },
              { label: 'pressure / inertia', value: ratio(F.pressure) ?? 0 },
              { label: 'gravity / inertia', value: ratio(F.gravity) ?? 0 },
              { label: 'surf. tension / inertia', value: F.surface == null ? 'n/a (gas)' : (ratio(F.surface) as number) },
              { label: 'compress. / inertia', value: ratio(F.compress) ?? 0 },
            ]}
          />
          <div className="rounded-xl border border-line bg-surface-2 px-3 py-2 text-sm text-ink-2">
            <Md>{md`Largest competitor of inertia here: **${biggest ? biggest[0] : '—'}**
(${biggest ? sci((biggest[1] as number) / F.inertia) : '—'} × inertia).`}</Md>
          </div>
        </div>
      }
      footer={
        <Md>{md`**Try this:** keep water at $V = 2$ m/s and slide $L$ from 10 μm to 100 m. Watch the viscous and surface-tension lines (slope 1) fall behind inertia (slope 2) while gravity (slope 3) overtakes it — small things live in a viscous, capillary world; big things in a gravity-and-inertia world.`}</Md>
      }
    >
      <Plot
        height={340}
        x={{ label: 'size $L$ (m)', domain: LD, log: true }}
        y={{ label: 'force estimate (N)', domain: YD, log: true }}
        series={series}
        vlines={[{ x: L, label: `L = ${sci(L)} m`, color: 'var(--ink-3)', dash: '4 4' }]}
        marks={marks}
      />
      <p className="mt-2 text-xs text-ink-3">
        Property presets: {f.long}. Slopes on log–log axes: viscous and surface tension ∝ L, inertia, pressure and compressibility ∝ L²,
        gravity ∝ L³.
      </p>
    </SimPanel>
  )
}
