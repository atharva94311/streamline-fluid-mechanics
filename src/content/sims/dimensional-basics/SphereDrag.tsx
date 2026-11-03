/**
 * Fox Fig. 7.1 (p. 248): drag coefficient of a smooth sphere against ρVD/μ — one curve for all spheres in all
 * fluids. The curve is an APPROXIMATE digitisation of the printed figure (±10 %); the original's data points are
 * not reproduced. SphereDragLab follows the recipe on Fox p. 249: compute ρVD/μ, read C_D, compute F.
 */
import { useState } from 'react'
import { M, Plot, Segmented, SimPanel, Slider, md, num, type PlotCtx } from '@/kit'
import { CD_TABLE, C_AIR, FLUIDS, RE_MIN_FIG, cdSphere, type FluidId } from './data'
import { SimBody, Tiles } from './ui'

const X_AX = { label: md`$\rho V D/\mu$  (log scale)`, domain: [0.1, 1e6] as [number, number], log: true }
const Y_AX = { label: md`$C_D = F\big/\tfrac12\rho V^2\,\tfrac{\pi D^2}{4}$`, domain: [0.05, 400] as [number, number], log: true }

const CURVE = { label: 'Fig. 7.1 curve (digitised, approx.)', points: CD_TABLE, color: 'var(--plot-1)', width: 2.6 }
const STOKES = {
  label: 'Stokes law 24/Re (supplementary)',
  fn: (r: number) => 24 / r,
  range: [0.1, 3] as [number, number],
  color: 'var(--plot-4)',
  dash: '6 4',
  width: 1.8,
}

function annotations({ sx, sy }: PlotCtx) {
  const txt = (x: number, y: number, s: string, anchor: 'start' | 'middle' | 'end' = 'start') => (
    <text x={sx(x)} y={sy(y)} textAnchor={anchor} className="fill-ink-2 text-[10.5px] font-medium">
      {s}
    </text>
  )
  return (
    <g>
      {txt(0.12, 25, 'slope ≈ −1')}
      {txt(130, 2.2, 'C_D ≈ 1 near Re ≈ 100')}
      {txt(3e3, 0.25, 'plateau ≈ 0.4–0.5')}
      <line x1={sx(2.9e5)} x2={sx(2.9e5)} y1={sy(0.75)} y2={sy(0.2)} stroke="var(--plot-3)" strokeWidth={1.4} />
      {txt(2.6e5, 0.95, 'abrupt drop', 'end')}
      {txt(9e5, 0.06, 'min ≈ 0.08–0.09', 'end')}
    </g>
  )
}

/** Static recreation of Fig. 7.1 with its main features annotated. */
export function SphereDragFigure() {
  return <Plot x={X_AX} y={Y_AX} series={[CURVE, STOKES]} height={330} overlay={annotations} />
}

type Fl = Extract<FluidId, 'air' | 'water' | 'glycerin'>
const FL_OPTS: { value: Fl; label: string }[] = [
  { value: 'air', label: 'air' },
  { value: 'water', label: 'water' },
  { value: 'glycerin', label: 'glycerin' },
]

const PRESETS: { label: string; fluid: Fl; D: number; V: number }[] = [
  { label: '25 mm sphere in air, 10 m/s', fluid: 'air', D: 0.025, V: 10 },
  { label: 'beach ball 0.4 m, 3 m/s breeze', fluid: 'air', D: 0.4, V: 3 },
  { label: 'balloon 16 m, 0.5 m/s crosswind', fluid: 'air', D: 16, V: 0.5 },
  { label: '1 mm bead in glycerin, 1 cm/s', fluid: 'glycerin', D: 0.001, V: 0.01 },
]

export function SphereDragLab() {
  const [fluid, setFluid] = useState<Fl>('air')
  const [D, setD] = useState(0.025)
  const [V, setV] = useState(10)
  const f = FLUIDS[fluid]
  const Re = (f.rho * V * D) / f.mu
  const cdFig = cdSphere(Re)
  const onChart = Number.isFinite(cdFig)
  const below = Re < RE_MIN_FIG
  const cd = onChart ? cdFig : below ? 24 / Re : NaN
  const A = (Math.PI * D * D) / 4
  const q = 0.5 * f.rho * V * V
  const F = cd * q * A
  const Mach = fluid === 'air' ? V / C_AIR : NaN

  const status = onChart
    ? 'read from Fig. 7.1'
    : below
      ? 'below Fig. 7.1 (Re < 0.1): Stokes 24/Re used'
      : 'beyond Fig. 7.1 (Re > 10⁶): no reading'

  const marks = onChart ? [{ x: Re, y: cdFig, label: `C_D ≈ ${num.fmt(cdFig, 2)}`, color: 'var(--plot-4)' }] : []
  const vlines = Re >= 0.1 && Re <= 1e6 ? [{ x: Re, color: 'var(--plot-4)', dash: '3 3' }] : []

  const btn = 'rounded-lg border border-line bg-surface px-2 py-1 text-xs text-ink-2 hover:border-teal-400 hover:text-ink'

  return (
    <SimPanel
      title="Sphere-drag calculator"
      subtitle="the Fox p. 249 recipe: ρVD/μ → read C_D → compute F"
      src={{ doc: 'fox', pages: '248–249', note: 'Fig. 7.1' }}
      footer={
        <>
          <strong>Try this:</strong> load the 25 mm sphere, then switch the fluid to water and lower <M tex="V" /> until{' '}
          <M tex={md`\rho VD/\mu`} /> is back to the same value — <M tex="C_D" /> is unchanged, although <M tex="F" /> is not. Then push air past
          about 100 m/s: the Mach warning shows the limit hidden in Fox&apos;s words &ldquo;for most velocities&rdquo;.
        </>
      }
    >
      <SimBody
        viz={
          <>
            <Plot x={X_AX} y={Y_AX} series={[CURVE, STOKES]} height={330} overlay={annotations} marks={marks} vlines={vlines} />
            <p className="mt-1 text-xs text-ink-3">
              Curve digitised by hand from the printed Fig. 7.1 (about ±10 %; the steep drop near Re ≈ 3 × 10⁵ is very sensitive). Fluid
              properties and the Stokes line are supplementary.
            </p>
          </>
        }
        controls={
          <>
            <div>
              <div className="mb-1 text-sm text-ink-2">Presets</div>
              <div className="flex flex-wrap gap-1.5">
                {PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => {
                      setFluid(p.fluid)
                      setD(p.D)
                      setV(p.V)
                    }}
                    className={btn}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <Segmented label="fluid (typical values near 20 °C)" value={fluid} onChange={setFluid} options={FL_OPTS} />
            <Slider label={md`sphere diameter $D$`} value={D} min={1e-4} max={20} log onChange={setD} unit="m" digits={2} />
            <Slider label={md`stream speed $V$`} value={V} min={1e-3} max={300} log onChange={setV} unit="m/s" digits={2} />
          </>
        }
        readout={
          <Tiles
            items={[
              { label: md`$\rho VD/\mu$`, value: Re, digits: 3 },
              { label: md`$C_D$`, value: Number.isFinite(cd) ? cd : '—', digits: 2, tone: onChart ? 'accent' : 'bad' },
              { label: md`drag $F$`, value: Number.isFinite(F) ? F : '—', unit: Number.isFinite(F) ? 'N' : undefined, digits: 3 },
              { label: md`$F/\rho V^2D^2 = \tfrac{\pi}{8}C_D$`, value: Number.isFinite(cd) ? (Math.PI / 8) * cd : '—', digits: 3 },
              { label: md`source of $C_D$`, value: status, tone: onChart ? 'good' : 'bad' },
              {
                label: md`Mach $V/c$ (air)`,
                value: Number.isFinite(Mach) ? Mach : 'n/a',
                digits: 2,
                tone: Number.isFinite(Mach) && Mach > 0.3 ? 'bad' : 'default',
              },
            ]}
          />
        }
      />
    </SimPanel>
  )
}
