/**
 * Wind-tunnel error budget (supplementary model illustrating Fox p.267's warnings):
 * a misaligned balance leaks lift into "drag", and an axial pressure gradient adds a horizontal-buoyancy force.
 */
import { useState } from 'react'
import { Md, Readout, SimPanel, Slider, Toggle, md } from '@/kit'
import { Arrow, Tx } from './svg'

export function TunnelLab() {
  const [D, setD] = useState(20)
  const [L, setL] = useState(200)
  const [eps, setEps] = useState(0.5)
  const [vol, setVol] = useState(0.04)
  const [dpdx, setDpdx] = useState(-15)
  const [suction, setSuction] = useState(false)

  const e = (eps * Math.PI) / 180
  const g = suction ? 0 : dpdx
  const buoy = -g * vol
  const leak = L * Math.sin(e)
  const dcos = D * Math.cos(e)
  const meas = dcos + leak + buoy
  const err = (meas - D) / D

  // bar geometry
  const scale = 300 / Math.max(60, Math.abs(meas) * 1.15, D * 1.15)
  const x0 = 150
  const bars: { label: string; v: number; color: string }[] = [
    { label: 'true drag', v: D, color: 'var(--plot-5)' },
    { label: 'lift leak L sin ε', v: leak, color: 'var(--plot-3)' },
    { label: 'buoyancy −(dp/dx)V', v: buoy, color: 'var(--plot-6)' },
    { label: 'balance reads', v: meas, color: Math.abs(err) > 0.02 ? 'var(--plot-4)' : 'var(--plot-1)' },
  ]
  const tilt = eps * 10 // exaggerated for visibility

  return (
    <SimPanel
      title="Tunnel error budget: what the balance really reads"
      subtitle="supplementary model of two error sources named in the text"
      wide
      controls={
        <>
          <Slider label="True drag $D$" value={D} min={5} max={50} step={0.5} onChange={setD} unit="N" />
          <Slider label="Lift $L$" value={L} min={0} max={300} step={5} onChange={setL} unit="N" digits={3} />
          <Slider label={md`Balance misalignment $\varepsilon$`} value={eps} min={-1} max={1} step={0.05} onChange={setEps} unit="°" digits={2} />
          <Slider label={md`Model volume $\mathcal{V}$`} value={vol} min={0.005} max={0.1} step={0.005} onChange={setVol} unit="m³" digits={2} />
          <Slider label="Axial gradient $dp/dx$" value={dpdx} min={-40} max={0} step={0.5} onChange={setDpdx} unit="Pa/m" digits={3} />
          <Toggle label="Wall boundary layers removed (suction / blowing)" checked={suction} onChange={setSuction} />
        </>
      }
      readout={
        <Readout
          items={[
            { label: 'lift leak', value: leak, unit: 'N', digits: 3 },
            { label: 'buoyancy force', value: buoy, unit: 'N', digits: 3 },
            { label: 'balance reads', value: meas, unit: 'N', digits: 4, tone: 'accent' },
            { label: 'error', value: `${(err * 100).toFixed(1)} %`, tone: Math.abs(err) > 0.02 ? 'bad' : 'good' },
          ]}
        />
      }
      footer={
        <Md>{md`**Try this:** with the defaults a half-degree misalignment and a modest pressure gradient corrupt a 20 N drag reading by about 12 %. Zero $\varepsilon$, then switch the wall-boundary-layer removal on — the error vanishes. Notice that the lift leak matters most for **high-lift, low-drag** models: raise $L$ and lower $D$.`}</Md>
      }
    >
      <svg viewBox="0 0 480 290" className="h-auto w-full" role="img" aria-label="Model with lift and drag, tilted balance axes, and bar chart of measured drag contributions">
        {/* model + forces */}
        <rect x={2} y={2} width={476} height={120} rx={10} fill="var(--field-bg)" stroke="var(--line)" />
        {Array.from({ length: 5 }, (_, i) => (
          <Arrow key={i} x1={14} y1={24 + i * 20} x2={44} y2={24 + i * 20} color="var(--streamline)" width={1.3} head={5} opacity={0.7} />
        ))}
        <Tx x={14} y={116} size={10} cls="fill-ink-3">
          {suction ? 'p uniform' : 'p falls along section →'}
        </Tx>
        <ellipse cx={200} cy={66} rx={70} ry={14} fill="var(--body-fill)" stroke="var(--ink-2)" strokeWidth={1.4} />
        <Arrow x1={200} y1={66} x2={200} y2={66 - Math.min(52, 12 + L * 0.16)} color="var(--plot-2)" width={2.4} />
        <Tx x={206} y={22} size={13} math>
          L
        </Tx>
        <Arrow x1={200} y1={66} x2={200 + Math.min(110, 18 + D * 2)} y2={66} color="var(--plot-5)" width={2.4} />
        <Tx x={200 + Math.min(110, 18 + D * 2) + 4} y={62} size={13} math>
          D
        </Tx>
        {/* balance axes (tilt exaggerated ×10) */}
        <g transform={`rotate(${-tilt} 380 66)`}>
          <line x1={330} y1={66} x2={450} y2={66} stroke="var(--plot-4)" strokeDasharray="5 4" strokeWidth={1.6} />
          <line x1={380} y1={110} x2={380} y2={20} stroke="var(--plot-4)" strokeDasharray="5 4" strokeWidth={1.6} />
          <Tx x={452} y={62} size={11} cls="fill-rose-600 dark:fill-rose-400">
            balance x
          </Tx>
        </g>
        <line x1={330} y1={66} x2={450} y2={66} stroke="var(--ink-3)" strokeWidth={1} />
        <Tx x={330} y={116} size={10} cls="fill-ink-3">
          {`tilt drawn ×10: ε = ${eps.toFixed(2)}°`}
        </Tx>
        {/* bars */}
        {bars.map((b, i) => {
          const y = 140 + i * 36
          const w = b.v * scale
          return (
            <g key={b.label}>
              <Tx x={8} y={y + 16} size={12} cls="fill-ink-2">
                {b.label}
              </Tx>
              <rect x={w >= 0 ? x0 : x0 + w} y={y + 2} width={Math.max(1.5, Math.abs(w))} height={20} rx={4} fill={b.color} fillOpacity={0.8} />
              <Tx x={x0 + Math.max(w, 0) + 6} y={y + 17} size={12} halo>
                {`${b.v.toFixed(2)} N`}
              </Tx>
            </g>
          )
        })}
        <line x1={x0} y1={136} x2={x0} y2={286} stroke="var(--axis)" />
        <line x1={x0 + D * scale} y1={136} x2={x0 + D * scale} y2={286} stroke="var(--plot-5)" strokeDasharray="3 3" />
        <Tx x={x0 + D * scale + 3} y={284} size={10} cls="fill-ink-3">
          true D
        </Tx>
      </svg>
    </SimPanel>
  )
}
