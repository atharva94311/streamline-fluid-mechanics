import { useMemo } from 'react'
import { FlowRow, Plot, md } from '@/kit'
import { envelope, makeTurbSignal, meanOf } from './signal'

/**
 * Visual construction of the RMS (Wilkes Eq. 9.5) from a synthetic fluctuation record (illustrative data):
 * v′ averages to zero, v′² does not; ṽ′ = √(mean of v′²); intensity = ṽ′ / v̄ (Eq. 9.4).
 */

const VBAR = 2.0
const NS = 2000
const TW = 0.5
const DT = TW / NS

export function RmsConstruction() {
  const d = useMemo(() => {
    const s = makeTurbSignal({ seed: 5, f0: 10, fEta: 300, fMin: 0.5, modes: 150 }).sample(NS, DT, 0.2)
    const m = meanOf(s)
    const vp = new Float64Array(NS)
    const sq = new Float64Array(NS)
    for (let i = 0; i < NS; i++) {
      vp[i] = 0.1 * (s[i] - m)
      sq[i] = vp[i] * vp[i]
    }
    const msq = meanOf(sq)
    const rms = Math.sqrt(msq)
    const toPts = (a: Float64Array): [number, number][] => envelope(a, 0, NS, 360).map(([i, v]) => [i * DT * 1000, v])
    return { vp: toPts(vp), sq: toPts(sq), msq, rms, mean: meanOf(vp), peak: Math.max(...Array.from(sq)) }
  }, [])

  return (
    <div className="space-y-3">
      <div className="grid gap-3 lg:grid-cols-2">
        <div>
          <div className="mb-1 text-sm font-semibold text-ink">① the fluctuation itself</div>
          <Plot
            height={200}
            x={{ label: 't (ms)', domain: [0, TW * 1000] }}
            y={{ label: md`$v'$ (m/s)`, domain: [-0.35, 0.35] }}
            series={[{ label: md`$v'(t)$ — positive and negative parts cancel`, points: d.vp, color: 'var(--plot-1)', width: 1.2 }]}
            hlines={[
              { y: 0, label: 'time average of v′ = 0  (Eq. 9.2)', color: 'var(--ink-2)', dash: '6 4' },
              { y: d.rms, label: '+ṽ′', color: 'var(--plot-5)' },
              { y: -d.rms, label: '−ṽ′', color: 'var(--plot-5)' },
            ]}
          />
        </div>
        <div>
          <div className="mb-1 text-sm font-semibold text-ink">② its square — never negative</div>
          <Plot
            height={200}
            x={{ label: 't (ms)', domain: [0, TW * 1000] }}
            y={{ label: md`$v'^{2}$ (m²/s²)`, domain: [0, Math.max(0.06, d.peak * 1.05)] }}
            series={[{ label: md`$v'^{2}(t)$`, points: d.sq, color: 'var(--plot-3)', kind: 'area', opacity: 0.35 }, { points: d.sq, color: 'var(--plot-3)', width: 1, hideInLegend: true }]}
            hlines={[{ y: d.msq, label: 'time average of v′²', color: 'var(--plot-4)', dash: '6 4' }]}
          />
        </div>
      </div>
      <FlowRow
        nodes={[
          { title: '③ average the square', md: md`$\overline{v'^{2}} = ${d.msq.toFixed(4)}$ m²/s²`, tone: 'amber' },
          { title: '④ take the square root', md: md`$\widetilde{v'} = \sqrt{\overline{v'^{2}}} = ${d.rms.toFixed(3)}$ m/s`, tone: 'emerald' },
          { title: '⑤ divide by the mean', md: md`$\widetilde{v'}/\overline{v} = ${d.rms.toFixed(3)}/${VBAR.toFixed(2)} = ${((100 * d.rms) / VBAR).toFixed(1)}\,\%$`, tone: 'rose' },
        ]}
      />
      <p className="text-[12.5px] text-ink-3">
        Illustrative record: 0.5 s of a synthetic fluctuation about a mean of 2.00 m/s. The plain average of v′ is zero by definition, so it cannot measure
        how violent the turbulence is; squaring first makes every excursion count.
      </p>
    </div>
  )
}
