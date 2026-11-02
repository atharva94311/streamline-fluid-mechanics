import { useState } from 'react'
import { Md, Plot, Readout, Segmented, SimPanel, Slider, Toggle, md } from '@/kit'
import {
  K_VK, LAUFER_5E4, LAUFER_5E5, defectLog, defectRealistic, defectVK, ellOverA929, lauferDefect,
} from './profiles'

type View = 'local' | 'defect'

const D5E4 = lauferDefect(LAUFER_5E4)
const D5E5 = lauferDefect(LAUFER_5E5)

/**
 * Why do Prandtl's two over-estimates (ℓ = ky and τ ≐ τw) give such a good profile?
 * Compares them with a "realistic" model: ℓ from Wilkes Eq. (9.29) and the linear total-stress
 * distribution τ = τw(1 − y/a) of Eq. (9.27). Supplementary model built on Wilkes pp. 491–495.
 */
export function CancellationExplorer() {
  const [eta, setEta] = useState(0.5)
  const [view, setView] = useState<View>('local')
  const [data, setData] = useState(false)

  const lP = K_VK * eta
  const lR = ellOverA929(eta)
  const lFac = lP / lR
  const tFac = 1 / (1 - eta)
  const net = Math.sqrt(tFac) / lFac
  const dLog = defectLog(eta)
  const dReal = defectRealistic(eta)
  const dVK = defectVK(eta)

  const probe = [{ x: eta, label: `y/a = ${eta.toFixed(2)}`, color: 'var(--axis)', dash: '2 3' }]

  return (
    <SimPanel
      title="Why two over-estimates cancel"
      subtitle="Prandtl's assumptions vs. a realistic mixing length and stress"
      wide
      controls={
        <>
          <Segmented<View>
            label="View"
            value={view}
            onChange={setView}
            options={[
              { value: 'local', label: 'Local factors' },
              { value: 'defect', label: 'Velocity defect' },
            ]}
          />
          <Slider label="probe position $y/a$" value={eta} min={0.02} max={0.95} step={0.01} onChange={setEta} digits={2} />
          {view === 'defect' ? <Toggle label="Laufer data (Fox Fig. 8.9, cross-ref.)" checked={data} onChange={setData} /> : null}
        </>
      }
      readout={
        view === 'local' ? (
          <Readout
            cols={2}
            items={[
              { label: '$\\ell$ Prandtl / realistic', value: lFac, digits: 3 },
              { label: '$\\tau$ assumed / real $=\\tau_w/\\tau$', value: tFac, digits: 3 },
              { label: 'gradient boost $\\sqrt{\\tau_w/\\tau}$', value: Math.sqrt(tFac), digits: 3 },
              { label: 'net error in $d\\overline{v}_z/dy$', value: `${net >= 1 ? '+' : '−'}${Math.abs((net - 1) * 100).toFixed(0)} %`, tone: Math.abs(net - 1) < 0.2 ? 'good' : 'bad' },
            ]}
          />
        ) : (
          <Readout
            cols={2}
            items={[
              { label: 'log law (Prandtl)', value: dLog, digits: 3, tone: 'accent' },
              { label: 'realistic $\\ell$ (9.29) + linear $\\tau$', value: dReal, digits: 3 },
              { label: 'von Kármán + linear $\\tau$ (p. 495)', value: dVK, digits: 3 },
              { label: 'log law − realistic', value: dLog - dReal, digits: 2, tone: Math.abs(dLog - dReal) < 0.8 ? 'good' : 'bad' },
            ]}
          />
        )
      }
      footer={
        <Md className="md-tight">{md`**Try this:** in *Local factors* put the probe at $y/a = 0.5$: Prandtl over-states $\ell$ by 72 % and $\tau$ by 100 %, yet the predicted velocity gradient is off by only about 18 %, because $d\overline{v}_z/dy = \sqrt{\tau/\rho}/\ell$ and the two errors pull in opposite directions. Then open *Velocity defect*: the simple log law stays within about $0.8\,\overline{v}_z^*$ of the realistic curve everywhere, while the "more sophisticated" von Kármán result (Wilkes p. 495) drifts further away. That matches the book's verdict that it is *not as accurate*.`}</Md>
      }
    >
      {view === 'local' ? (
        <Plot
          height={320}
          x={{ label: '$y/a$ (distance from wall ÷ pipe radius)', domain: [0, 1] }}
          y={{ label: 'Prandtl value ÷ realistic value', domain: [0, 3] }}
          series={[
            { label: '$\\ell$ over-estimate $ky/\\ell_{(9.29)}$', fn: (e) => (K_VK * e) / ellOverA929(e), range: [0.004, 1], color: 'var(--plot-3)' },
            { label: 'gradient boost from $\\tau$: $\\sqrt{\\tau_w/\\tau}$', fn: (e) => 1 / Math.sqrt(1 - e), range: [0, 0.985], color: 'var(--plot-4)' },
            { label: 'net error in $d\\overline{v}_z/dy$', fn: (e) => ellOverA929(e) / (K_VK * e * Math.sqrt(1 - e)), range: [0.004, 0.985], color: 'var(--plot-1)', width: 3 },
          ]}
          hlines={[{ y: 1, label: 'exact', color: 'var(--plot-5)' }]}
          bands={[{ x0: 0, x1: 0.1, label: 'near wall' }]}
          vlines={probe}
          marks={[
            { x: eta, y: Math.min(2.95, lFac), color: 'var(--plot-3)' },
            { x: eta, y: Math.min(2.95, Math.sqrt(tFac)), color: 'var(--plot-4)' },
            { x: eta, y: Math.min(2.95, net), color: 'var(--plot-1)' },
          ]}
        />
      ) : (
        <Plot
          height={320}
          x={{ label: '$y/a$ (distance from wall ÷ pipe radius)', domain: [0, 1] }}
          y={{ label: 'defect $(\\overline{v}_{zc}-\\overline{v}_z)/\\overline{v}_z^*$', domain: [0, 12] }}
          series={[
            { label: 'log law used to the centre: $2.5\\ln(a/y)$', fn: defectLog, range: [0.004, 1], color: 'var(--plot-1)', width: 2.6 },
            { label: 'realistic: $\\ell$ from (9.29) + linear $\\tau$', fn: defectRealistic, range: [0.004, 1], color: 'var(--plot-3)', dash: '7 4' },
            { label: 'von Kármán + linear $\\tau$ (Wilkes p. 495)', fn: defectVK, range: [0.004, 1], color: 'var(--plot-4)' },
            ...(data
              ? [
                  { label: 'Laufer, $\\mathrm{Re}_U = 5\\times10^4$', points: D5E4, kind: 'scatter' as const, color: 'var(--plot-7)' },
                  { label: 'Laufer, $\\mathrm{Re}_U = 5\\times10^5$', points: D5E5, kind: 'scatter' as const, color: 'var(--plot-6)' },
                ]
              : []),
          ]}
          vlines={probe}
          marks={[
            { x: eta, y: Math.min(11.9, dLog), color: 'var(--plot-1)' },
            { x: eta, y: Math.min(11.9, dReal), color: 'var(--plot-3)' },
            { x: eta, y: Math.min(11.9, dVK), color: 'var(--plot-4)' },
          ]}
        />
      )}
      <p className="mt-2 text-xs text-ink-3">
        {view === 'local'
          ? 'Realistic model (supplementary): mixing length ℓ/a from Wilkes Eq. (9.29) and the linear stress τ = τw(1 − y/a) from the momentum balance (9.27), p. 491. Prandtl: ℓ = 0.4y and τ = τw.'
          : 'Defects measured from the centreline in units of the friction velocity. The realistic curve integrates dv̄z/dy = v̄z*√(1 − y/a)/ℓ with ℓ from Eq. (9.29). Laufer points are read off Fox & McDonald’s Fig. 8.9 (approximate) and shifted by each set’s centreline value.'}
      </p>
    </SimPanel>
  )
}
