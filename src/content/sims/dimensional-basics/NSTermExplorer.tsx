/**
 * Concept "nondimensional-equations": in Fox Eqs. (7.9)–(7.10) (p. 247) the inertia and pressure terms carry
 * coefficient 1, the viscous terms μ/(ρV∞L) = 1/Re and the gravity term gL/V∞² = 1/Fr². This explorer shows the
 * size of each coefficient on a log scale, writes the two equations with the live numbers, and states which forces
 * dominate. Fluid properties, presets and regime thresholds are supplementary.
 */
import { useState } from 'react'
import { M, MathBlock, Segmented, SimPanel, Slider, Toggle, md, num } from '@/kit'
import { FLUIDS, G, type FluidId } from './data'
import { sup } from './svg'
import { SimBody, Tiles } from './ui'

type Mode = 'groups' | 'physical'
type Fl = Extract<FluidId, 'air' | 'water' | 'glycerin'>

const PRESETS: { label: string; fluid: Fl; L: number; V: number; free: boolean }[] = [
  { label: 'car in air: 4 m, 30 m/s', fluid: 'air', L: 4, V: 30, free: false },
  { label: 'ship model: 2 m, 1.5 m/s', fluid: 'water', L: 2, V: 1.5, free: true },
  { label: 'river: depth 2 m, 1 m/s', fluid: 'water', L: 2, V: 1, free: true },
  { label: 'glycerin, 1 cm gap, 1 cm/s', fluid: 'glycerin', L: 0.01, V: 0.01, free: false },
  { label: 'bacterium: 2 μm, 30 μm/s', fluid: 'water', L: 2e-6, V: 3e-5, free: false },
]

const LMIN = -9
const LMAX = 5
const BX0 = 92
const BX1 = 404

function bx(v: number) {
  const e = Math.min(LMAX, Math.max(LMIN, Math.log10(v)))
  return BX0 + ((e - LMIN) / (LMAX - LMIN)) * (BX1 - BX0)
}

function BarRow({ y, label, value, color, note }: { y: number; label: string; value: number; color: string; note?: string }) {
  const x = bx(value)
  return (
    <g>
      <text x={BX0 - 8} y={y + 11} textAnchor="end" className="fill-ink text-[11px] font-semibold">
        {label}
      </text>
      <rect x={BX0} y={y} width={Math.max(2, x - BX0)} height={15} rx={3} fill={color} fillOpacity={0.85} />
      <text x={Math.min(x + 5, BX1 - 2)} y={y + 11.5} textAnchor={x > BX1 - 70 ? 'end' : 'start'} className="fill-ink text-[10.5px] font-bold">
        {num.fmt(value, 2)}
        {note ? ` ${note}` : ''}
      </text>
    </g>
  )
}

export function NSTermExplorer() {
  const [mode, setMode] = useState<Mode>('physical')
  const [ReG, setReG] = useState(1e4)
  const [FrG, setFrG] = useState(1)
  const [fluid, setFluid] = useState<Fl>('water')
  const [L, setL] = useState(2)
  const [V, setV] = useState(1.5)
  const [free, setFree] = useState(true)

  const f = FLUIDS[fluid]
  const Re = mode === 'groups' ? ReG : (f.rho * V * L) / f.mu
  const Fr = mode === 'groups' ? FrG : V / Math.sqrt(G * L)
  const invRe = 1 / Re
  const invFr2 = 1 / (Fr * Fr)

  const viscText =
    Re < 1
      ? 'Creeping flow: the viscous term outweighs inertia. Pressure must then balance viscosity, so p* grows like 1/Re (scaling p with μV∞/L instead of ρV∞² would be more natural here — supplementary).'
      : Re < 1000
        ? 'Moderate Re: inertia and viscous forces are both important throughout the flow.'
        : 'Large Re: the viscous terms can be neglected in most of the flow (Euler’s equations), but not in the thin boundary layer next to a wall, where no-slip must still hold (Fox p. 247).'
  const gravText = free
    ? invFr2 >= 1
      ? 'gL/V∞² ≳ 1: gravity is as strong as inertia or stronger — with a free surface it shapes the flow (waves, drawdown), so Fr must be matched in model tests.'
      : invFr2 > 0.01
        ? 'gL/V∞² is below 1 but not negligible: free-surface (wave) effects are present and Fr still matters.'
        : 'gL/V∞² ≪ 1: inertia overwhelms gravity; free-surface waves have little effect on the flow.'
    : 'No free surface (and constant ρ): gravity only adds a hydrostatic part to p. Writing p + ρgy as one modified pressure removes the gravity term, so Fr drops out of the velocity field however large gL/V∞² is (supplementary).'

  const e79 = md`u^*\pd{u^*}{x^*}+v^*\pd{u^*}{y^*} = -\pd{p^*}{x^*} + \underbrace{${num.fmtTeX(invRe, 3)}}_{1/Re}\left(\frac{\partial^2u^*}{\partial x^{*2}}+\frac{\partial^2u^*}{\partial y^{*2}}\right)`
  const e710 = md`u^*\pd{v^*}{x^*}+v^*\pd{v^*}{y^*} = -\underbrace{${num.fmtTeX(invFr2, 3)}}_{gL/V_\infty^2} - \pd{p^*}{y^*} + \underbrace{${num.fmtTeX(invRe, 3)}}_{1/Re}\left(\frac{\partial^2v^*}{\partial x^{*2}}+\frac{\partial^2v^*}{\partial y^{*2}}\right)`

  const chip = 'rounded-lg border border-line bg-surface px-2 py-1 text-xs text-ink-2 hover:border-teal-400 hover:text-ink'

  return (
    <SimPanel
      title="Which forces dominate? — Eqs. (7.9)–(7.10) live"
      subtitle="the only parameters left are 1/Re and gL/V∞²"
      footer={
        <>
          <strong>Try this:</strong> start from the ship model and shrink <M tex="L" /> to 2 cm at the same speed: <M tex="1/Re" /> grows
          a hundredfold and <M tex={md`gL/V_\infty^2`} /> falls a hundredfold. Then load the bacterium — the viscous bar towers over inertia,
          the opposite extreme from the car.
        </>
      }
    >
      <SimBody
        viz={
          <div className="space-y-3">
            <svg viewBox="0 0 420 150" className="h-auto w-full" role="img" aria-label="size of each term coefficient on a log scale">
              <rect x={bx(0.1)} y={6} width={bx(10) - bx(0.1)} height={118} fill="var(--band)" />
              <text x={bx(1)} y={16} textAnchor="middle" className="fill-ink-3 text-[9.5px]">
                order one
              </text>
              {[-9, -6, -3, 0, 3].map((e) => (
                <g key={e}>
                  <line x1={bx(10 ** e)} x2={bx(10 ** e)} y1={20} y2={124} stroke="var(--grid)" />
                  <text x={bx(10 ** e)} y={137} textAnchor="middle" className="fill-ink-3 text-[9.5px]">
                    {e === 0 ? '1' : `10${sup(e)}`}
                  </text>
                </g>
              ))}
              <BarRow y={24} label="inertia" value={1} color="var(--plot-1)" />
              <BarRow y={48} label="pressure" value={1} color="var(--plot-2)" note={Re < 1 ? '(p* adjusts)' : ''} />
              <BarRow y={72} label="viscous" value={invRe} color="var(--plot-4)" />
              <BarRow y={96} label="gravity (7.10)" value={invFr2} color="var(--plot-5)" note={free ? '' : '(hydrostatic only)'} />
              <text x={BX1} y={148} textAnchor="end" className="fill-ink-3 text-[9px]">
                coefficient in the nondimensional equation (log scale)
              </text>
            </svg>
            <div className="space-y-1 rounded-xl border border-line bg-surface-2/50 p-2">
              <div className="text-xs font-semibold text-ink-3">Eq. (7.9) with today&apos;s numbers</div>
              <MathBlock tex={e79} />
              <div className="text-xs font-semibold text-ink-3">Eq. (7.10) with today&apos;s numbers</div>
              <MathBlock tex={e710} />
            </div>
            <ul className="list-disc space-y-1 pl-5 text-sm text-ink-2">
              <li>{viscText}</li>
              <li>{gravText}</li>
            </ul>
          </div>
        }
        controls={
          <>
            <Segmented
              label="set the flow by"
              value={mode}
              onChange={setMode}
              options={[
                { value: 'physical', label: md`fluid, $L$, $V_\infty$` },
                { value: 'groups', label: md`$Re$ and $Fr$ directly` },
              ]}
            />
            {mode === 'physical' ? (
              <>
                <div className="flex flex-wrap gap-1.5">
                  {PRESETS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => {
                        setFluid(p.fluid)
                        setL(p.L)
                        setV(p.V)
                        setFree(p.free)
                      }}
                      className={chip}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <Segmented
                  label="fluid"
                  value={fluid}
                  onChange={setFluid}
                  options={[
                    { value: 'air', label: 'air' },
                    { value: 'water', label: 'water' },
                    { value: 'glycerin', label: 'glycerin' },
                  ]}
                />
                <Slider label={md`reference length $L$`} value={L} min={1e-6} max={1000} log onChange={setL} unit="m" digits={2} />
                <Slider label={md`reference speed $V_\infty$`} value={V} min={1e-5} max={100} log onChange={setV} unit="m/s" digits={2} />
              </>
            ) : (
              <>
                <Slider label={md`Reynolds number $Re$`} value={ReG} min={1e-3} max={1e9} log onChange={setReG} digits={2} />
                <Slider label={md`Froude number $Fr = V_\infty/\sqrt{gL}$`} value={FrG} min={0.01} max={100} log onChange={setFrG} digits={2} />
              </>
            )}
            <Toggle label="free surface present" checked={free} onChange={setFree} />
          </>
        }
        readout={
          <Tiles
            items={[
              { label: md`$Re = \rho V_\infty L/\mu$`, value: Re, digits: 3 },
              { label: md`$Fr = V_\infty/\sqrt{gL}$`, value: Fr, digits: 3 },
              { label: md`viscous coeff. $1/Re$`, value: invRe, digits: 3, tone: invRe > 1 ? 'bad' : 'default' },
              { label: md`gravity coeff. $gL/V_\infty^2$`, value: invFr2, digits: 3, tone: free && invFr2 >= 1 ? 'bad' : 'default' },
            ]}
          />
        }
      />
    </SimPanel>
  )
}
