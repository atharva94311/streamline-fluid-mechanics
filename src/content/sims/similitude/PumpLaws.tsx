/**
 * Pump "laws" playground (Fox Eqs. 7.19–7.22, Example 7.6). The head–flow curve SHAPE is Fig. 7.5's (qualitative),
 * anchored so its design point is Example 7.6's (68 m³/h, H from N_scu at 1170 rpm).
 */
import { useState } from 'react'
import { Md, Plot, Readout, SimPanel, Slider, md } from '@/kit'
import { FIG75_DESIGN_X, HEAD_SHAPE, interp } from './data'
import { Tx } from './svg'

const N1 = 1170
const D1 = 200
const Q1 = 68
const ETA = 0.8
const RHO = 1000
const G = 9.81
const SI_FACTOR = (2 * Math.PI) / 60 / 60 / G ** 0.75 // N_s(SI, h = gH) = N_scu × this

export function PumpLaws() {
  const [N2, setN2] = useState(1750)
  const [D2, setD2] = useState(200)
  const [Ns, setNs] = useState(2323)

  const H1 = ((N1 * Math.sqrt(Q1)) / Ns) ** (4 / 3)
  const rw = N2 / N1
  const rd = D2 / D1
  const Q2 = Q1 * rw * rd ** 3
  const H2 = H1 * rw ** 2 * rd ** 2
  const P1 = (RHO * G * (Q1 / 3600) * H1) / 1000
  const P2 = P1 * rw ** 3 * rd ** 5
  const Pin = P2 / ETA
  const Ns2 = (N2 * Math.sqrt(Q2)) / H2 ** 0.75
  const NsSI = Ns2 * SI_FACTOR
  const cls = Ns2 >= 580 && Ns2 <= 4645 ? '“low”' : Ns2 >= 11615 && Ns2 <= 17420 ? '“high”' : Ns2 > 4645 && Ns2 < 11615 ? 'between the ranges' : 'outside printed ranges'

  const yD = interp(HEAD_SHAPE, FIG75_DESIGN_X)
  const curve1: [number, number][] = HEAD_SHAPE.map(([x, y]) => [(Q1 * x) / FIG75_DESIGN_X, (H1 * y) / yD])
  const curve2: [number, number][] = curve1.map(([q, h]) => [q * rw * rd ** 3, h * rw ** 2 * rd ** 2])
  const qMax = Math.max(curve1[curve1.length - 1][0], curve2[curve2.length - 1][0]) * 1.05
  const hMax = Math.max(curve1[0][1], curve2[0][1]) * 1.12
  const k2 = H2 / (Q2 * Q2)

  const preset = () => {
    setN2(1750)
    setD2(200)
    setNs(2323)
  }

  // N_scu gauge (log axis 300 → 30 000)
  const gx = (v: number) => 14 + ((Math.log10(Math.min(30000, Math.max(300, v))) - Math.log10(300)) / 2) * 452

  return (
    <SimPanel
      title="Pump-law playground"
      subtitle="geometrically similar pumps at similar flow conditions"
      src={{ doc: 'fox', pages: '265–267', note: 'Eqs. (7.19)–(7.22b), Example 7.6' }}
      wide
      controls={
        <>
          <button type="button" onClick={preset} className="w-full rounded-lg border border-teal-300 bg-teal-50 px-3 py-1.5 text-sm font-semibold text-teal-800 dark:border-teal-500/40 dark:bg-teal-500/10 dark:text-teal-200">
            Load Example 7.6 (1170 → 1750 rpm)
          </button>
          <Slider label={md`New speed $\omega_2$`} value={N2} min={600} max={3000} step={10} onChange={setN2} unit="rpm" digits={4} />
          <Slider label="New impeller diameter $D_2$" value={D2} min={100} max={400} step={5} onChange={setD2} unit="mm" digits={3} />
          <Slider label="Design specific speed $N_{s_{cu}}$" value={Ns} min={500} max={20000} log onChange={setNs} digits={4} />
          <Md className="md-tight text-xs text-ink-3">{md`Condition 1 is fixed: $\omega_1 = 1170$ rpm, $D_1 = 200$ mm, $Q_1 = 68$ m³/h, water, $\eta = 80\%$.`}</Md>
        </>
      }
      readout={
        <Readout
          items={[
            { label: '$H_1$ (from $N_{s_{cu}}$)', value: H1, unit: 'm', digits: 3 },
            { label: md`$\mathcal{P}_1$ (to fluid)`, value: P1, unit: 'kW', digits: 3 },
            { label: '$Q_2$', value: Q2, unit: 'm³/h', digits: 4, tone: 'accent' },
            { label: '$H_2$', value: H2, unit: 'm', digits: 4, tone: 'accent' },
            { label: md`$\mathcal{P}_2$ (to fluid)`, value: P2, unit: 'kW', digits: 3, tone: 'accent' },
            { label: md`motor input $\mathcal{P}_2/\eta$`, value: Pin, unit: 'kW', digits: 3, tone: 'good' },
            { label: '$N_{s_{cu}}$ at condition 2', value: Ns2, digits: 4 },
            { label: '$N_s$ (SI, dimensionless)', value: NsSI, digits: 3 },
          ]}
        />
      }
      footer={
        <Md>{md`**Try this:** load Example 7.6 — you should read $Q_2 = 101.7$ m³/h, $H_2 = 14.9$ m, $\mathcal P_2 \approx 4.1$ kW and an input of ≈ 5.2 kW. Now drag $\omega_2$ or $D_2$ anywhere: the design point slides along a parabola $H \propto Q^2$ (fixed $D$) and $N_{s_{cu}}$ **never changes** — it labels the whole family of similar operating points. Only the specific-speed slider moves the gauge (a different pump design).`}</Md>
      }
    >
      <div className="space-y-2">
        <Plot
          x={{ label: 'Volume flow rate $Q$ (m³/h)', domain: [0, qMax] }}
          y={{ label: 'Head $H$ (m)', domain: [0, hMax] }}
          series={[
            { label: `curve at ${N1} rpm, D = ${D1} mm`, points: curve1, color: 'var(--plot-7)', width: 2.2 },
            { label: `curve at ${N2.toFixed(0)} rpm, D = ${D2.toFixed(0)} mm`, points: curve2, color: 'var(--plot-1)', width: 2.6 },
            { label: 'similar points (H ∝ Q² at this D)', fn: (q) => k2 * q * q, color: 'var(--plot-3)', dash: '5 4', width: 1.5 },
          ]}
          marks={[
            { x: Q1, y: H1, label: 'design 1', color: 'var(--plot-7)' },
            { x: Q2, y: H2, label: 'design 2', color: 'var(--plot-1)' },
          ]}
          height={290}
        />
        <svg viewBox="0 0 480 74" className="h-auto w-full" role="img" aria-label="Specific-speed gauge with low and high ranges">
          <Tx x={14} y={14} size={12} weight={700}>
            {`specific speed N(s,cu) in rpm, m³/h, m — ${cls}`}
          </Tx>
          <rect x={gx(580)} y={26} width={gx(4645) - gx(580)} height={18} fill="var(--plot-2)" fillOpacity={0.25} />
          <rect x={gx(11615)} y={26} width={gx(17420) - gx(11615)} height={18} fill="var(--plot-6)" fillOpacity={0.25} />
          <Tx x={(gx(580) + gx(4645)) / 2} y={39} size={11} anchor="middle" cls="fill-ink-2">
            low 580–4645
          </Tx>
          <Tx x={(gx(11615) + gx(17420)) / 2} y={39} size={10} anchor="middle" cls="fill-ink-2">
            high
          </Tx>
          <line x1={14} y1={44} x2={466} y2={44} stroke="var(--axis)" />
          {[300, 1000, 3000, 10000, 30000].map((v) => (
            <g key={v}>
              <line x1={gx(v)} y1={44} x2={gx(v)} y2={49} stroke="var(--axis)" />
              <Tx x={gx(v)} y={62} size={10} anchor="middle" cls="fill-ink-3">
                {String(v)}
              </Tx>
            </g>
          ))}
          <polygon points={`${gx(Ns2)},44 ${gx(Ns2) - 6},22 ${gx(Ns2) + 6},22`} fill="var(--plot-4)" />
        </svg>
      </div>
    </SimPanel>
  )
}
