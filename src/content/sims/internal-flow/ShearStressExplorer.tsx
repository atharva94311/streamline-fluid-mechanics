/**
 * Concept "shear-stress-distribution": τ_rx = (r/2) ∂p/∂x (Eq. 8.15) and τ_w = −(R/2) ∂p/∂x (Eq. 8.16),
 * valid for laminar AND turbulent fully developed flow (Fox p. 293). The split of the total stress into a viscous
 * part μ dū/dy and a turbulent (Reynolds) part −ρ\overline{u'v'} (Eq. 8.17) is drawn with van Driest's
 * mixing-length model — a supplementary, schematic illustration of Fig. 8.8 and the wall layer (Fox p. 294).
 */
import { useMemo, useState } from 'react'
import { Plot, Readout, SimPanel, Slider, Toggle, md, num, useUid, type Series } from '@/kit'
import { FIG88_CIRCLES, FIG88_SQUARES, RE_CRIT, RPlus, crossoverYR, fmtRe, stressSplit } from './model'

const YC = 100
const RP = 70 // pipe radius in px
const X0 = 30
const X1 = 450

export function ShearStressExplorer() {
  const [G, setG] = useState(240) // |∂p/∂x| in Pa/m
  const [Dmm, setDmm] = useState(50)
  const [probe, setProbe] = useState(0.5)
  const [logRe, setLogRe] = useState(Math.log10(5e4))
  const [logAxis, setLogAxis] = useState(false)
  const [showData, setShowData] = useState(true)
  const uid = useUid('tau')

  const R = Dmm / 2000
  const dpdx = -G
  const tauW = -(R / 2) * dpdx
  const tauProbe = (probe * R) / 2 * dpdx // τ_rx at r = probe·R (negative for flow in +x)
  const Re = 10 ** logRe
  const turbulent = Re >= RE_CRIT
  const yCross = turbulent ? crossoverYR(Re) : null
  const Rplus = RPlus(Re)
  const uStar = Math.sqrt(tauW / 998)

  const xDom: [number, number] = logAxis ? [1e-4, 1] : [0, 1]
  const series = useMemo(() => {
    const lo = logAxis ? 1e-4 : 0
    const rg: [number, number] = [lo, 1]
    const s: Series[] = [
      { label: md`total $\tau/\tau_w = 1 - y/R$ (Eq. 8.15)`, fn: (y: number) => stressSplit(y, Re, turbulent).total, color: 'var(--plot-7)', width: 2.4, range: rg, samples: 300 },
      { label: md`viscous $\mu\,d\bar u/dy$ (schematic)`, fn: (y: number) => stressSplit(y, Re, turbulent).visc, color: 'var(--plot-2)', width: 2, range: rg, samples: 400 },
      ...(turbulent
        ? [{ label: md`turbulent $-\rho\overline{u'v'}$ (schematic)`, fn: (y: number) => stressSplit(y, Re, true).turb, color: 'var(--plot-5)', width: 2, dash: '7 4', range: rg, samples: 400 }]
        : []),
    ]
    if (showData) {
      s.push(
        { label: md`Fig. 8.8 data, $Re_U = 5\times10^5$`, points: FIG88_SQUARES, kind: 'scatter', color: 'var(--plot-1)' },
        { label: md`Fig. 8.8 data, $Re_U = 5\times10^4$`, points: FIG88_CIRCLES, kind: 'scatter', color: 'var(--plot-3)' },
      )
    }
    return s
  }, [Re, turbulent, logAxis, showData])

  // arrows: shear exerted by the outer fluid on the inner cylinder (−x for flow in +x), length ∝ r
  const arrowRadii = [0.2, 0.4, 0.6, 0.8]
  const maxLen = 90

  return (
    <SimPanel
      title="Shear stress across the pipe — total, viscous and turbulent"
      subtitle={md`$\tau_{rx} = \tfrac{r}{2}\pd{p}{x}$ for laminar **and** turbulent flow; the split (Eq. 8.17) depends on Re`}
      wide
      controls={
        <>
          <Slider label={md`pressure gradient magnitude $\lvert\partial p/\partial x\rvert$`} value={G} min={1} max={5000} log onChange={setG} unit="Pa/m" digits={3} />
          <Slider label={md`diameter $D$`} value={Dmm} min={5} max={500} log onChange={setDmm} unit="mm" digits={3} />
          <Slider label={md`probe radius $r/R$`} value={probe} min={0} max={1} step={0.01} onChange={setProbe} digits={2} />
          <Slider
            label={md`Reynolds number $\Rey$ (sets the split only)`}
            value={logRe}
            min={Math.log10(500)}
            max={6}
            step={0.01}
            onChange={setLogRe}
            format={(v) => fmtRe(10 ** v)}
          />
          <Toggle label="log scale for y/R (zoom into the wall layer)" checked={logAxis} onChange={setLogAxis} />
          <Toggle label="overlay Fox Fig. 8.8 data (Laufer)" checked={showData} onChange={setShowData} />
        </>
      }
      readout={
        <Readout
          items={[
            { label: md`$\tau_w = -\tfrac{R}{2}\pd{p}{x}$`, value: num.fmt(tauW, 3), unit: 'Pa', tone: 'accent' },
            { label: md`$\tau_{rx}$ at probe`, value: num.fmt(tauProbe, 3), unit: 'Pa' },
            { label: md`$\lvert\tau\rvert/\tau_w = r/R$`, value: probe, digits: 2 },
            { label: md`$u_* = \sqrt{\tau_w/\rho}$ (water)`, value: num.fmt(uStar, 3), unit: 'm/s' },
            { label: 'regime', value: turbulent ? 'turbulent' : 'laminar', tone: turbulent ? 'bad' : 'good' },
            {
              label: 'viscous = turbulent at',
              value: yCross == null ? 'nowhere (all viscous)' : `y/R ≈ ${num.fmt(yCross, 2)}`,
            },
            ...(yCross != null
              ? [
                  { label: md`same, in $y^+ = y u_*/\nu$`, value: num.fmt(yCross * Rplus, 3) },
                  { label: md`$R^+ = R u_*/\nu$ (est.)`, value: num.fmt(Rplus, 3) },
                ]
              : []),
          ]}
        />
      }
      footer={
        <span>
          <b>Try this:</b> move the probe from the centreline to the wall — |τ| grows in proportion to r whatever the Re slider says,
          because Eq. 8.15 is a pure force balance. Then slide Re below 2300: the whole stress becomes viscous. Back in the turbulent
          range, switch on the log axis: the viscous curve owns a thin wall layer (y⁺ ≲ 10) that shrinks toward the wall as Re rises,
          and almost all the remaining friction is Reynolds stress — just as the Fig. 8.8 points sit on the 1 − y/R line.
        </span>
      }
    >
      <div className="space-y-3">
        <svg viewBox="0 0 480 205" className="h-auto w-full" role="img" aria-label="shear stress arrows across a pipe">
          <defs>
            <marker id={`${uid}a`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M0,0 L10,5 L0,10 z" fill="var(--plot-5)" />
            </marker>
            <marker id={`${uid}w`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M0,0 L10,5 L0,10 z" fill="var(--plot-4)" />
            </marker>
          </defs>
          <rect x={X0} y={YC - RP - 10} width={X1 - X0} height={10} fill="var(--body-fill)" stroke="var(--ink-3)" />
          <rect x={X0} y={YC + RP} width={X1 - X0} height={10} fill="var(--body-fill)" stroke="var(--ink-3)" />
          <line x1={X0} y1={YC} x2={X1} y2={YC} stroke="var(--ink-3)" strokeDasharray="10 3 2 3" />
          {/* probe cylinder */}
          <rect x={150} y={YC - probe * RP} width={170} height={2 * probe * RP} fill="var(--plot-1)" opacity={0.12} stroke="var(--plot-1)" />
          <text x={235} y={YC + 4} textAnchor="middle" className="fill-ink-2" fontSize={11}>
            fluid cylinder r = {probe.toFixed(2)} R
          </text>
          {/* linear distribution "triangle" on the left */}
          <polygon points={`${X0 + 100},${YC} ${X0 + 100 - maxLen * 0.9},${YC - RP} ${X0 + 100},${YC - RP}`} fill="var(--plot-5)" opacity={0.12} />
          <polygon points={`${X0 + 100},${YC} ${X0 + 100 - maxLen * 0.9},${YC + RP} ${X0 + 100},${YC + RP}`} fill="var(--plot-5)" opacity={0.12} />
          {arrowRadii.map((rho) => (
            <g key={rho}>
              <line x1={X0 + 100} y1={YC - rho * RP} x2={X0 + 100 - maxLen * 0.9 * rho} y2={YC - rho * RP} stroke="var(--plot-5)" strokeWidth={1.8} markerEnd={`url(#${uid}a)`} />
              <line x1={X0 + 100} y1={YC + rho * RP} x2={X0 + 100 - maxLen * 0.9 * rho} y2={YC + rho * RP} stroke="var(--plot-5)" strokeWidth={1.8} markerEnd={`url(#${uid}a)`} />
            </g>
          ))}
          <text x={X0 + 104} y={YC - RP + 14} className="fill-ink-3" fontSize={10.5}>
            |τ| ∝ r
          </text>
          {/* wall shear on the wall (+x) */}
          <line x1={355} y1={YC - RP - 16} x2={355 + 60} y2={YC - RP - 16} stroke="var(--plot-4)" strokeWidth={2.2} markerEnd={`url(#${uid}w)`} />
          <text x={350} y={YC - RP - 12} textAnchor="end" className="fill-ink-2" fontSize={11}>
            τ_w on the wall = {num.fmt(tauW, 3)} Pa
          </text>
          {/* probe arrow on cylinder surface */}
          <line x1={300} y1={YC - probe * RP} x2={300 - Math.max(4, maxLen * 0.9 * probe)} y2={YC - probe * RP} stroke="var(--plot-1)" strokeWidth={2.2} markerEnd={`url(#${uid}a)`} />
          <text x={X1 - 4} y={YC + RP + 26} textAnchor="end" className="fill-ink-3" fontSize={10.5}>
            arrows: stress of the slower outer fluid on the inner core (−x) · flow →
          </text>
        </svg>
        <Plot
          height={270}
          x={{ label: md`distance from wall $y/R = 1 - r/R$${logAxis ? ' (log)' : ''}`, domain: xDom, log: logAxis }}
          y={{ label: md`stress $/\,\tau_w$`, domain: [0, 1.05] }}
          series={series}
          vlines={[
            { x: Math.max(xDom[0] * 1.0001, 1 - probe), label: 'probe', color: 'var(--plot-1)', dash: '3 3' },
            ...(yCross != null && (!logAxis ? yCross > 0.004 : true) ? [{ x: yCross, label: 'wall layer edge', color: 'var(--plot-2)', dash: '2 3' }] : []),
          ]}
        />
      </div>
    </SimPanel>
  )
}
