/**
 * Concept "motivation": the cost of the brute-force sphere-drag programme in Fox p. 248 (10 values each of V, D, ρ, μ
 * → 10⁴ tests, about 2½ years of 40-h weeks at ½ h per run) against the ~10 tests needed once the drag data are
 * organised as F/(ρV²D²) = f(ρVD/μ). Bars are HTML so their text stays legible at any width.
 */
import { useState } from 'react'
import { M, Segmented, SimPanel, Slider, md, num } from '@/kit'
import { sup } from './svg'
import { SimBody, Tiles } from './ui'

const LOG_MAX = 8
const pct = (v: number) => (Math.min(LOG_MAX, Math.max(0, Math.log10(Math.max(1, v)))) / LOG_MAX) * 100

function Bar({ value, color, label }: { value: number; color: string; label: string }) {
  const w = Math.max(1.2, pct(value))
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
        <span className="text-ink-2">
          <M tex={label} />
        </span>
        <span className="font-mono text-sm font-bold text-ink">{Number.isInteger(value) && value < 1e9 ? value.toLocaleString('en-US') : num.fmt(value, 3)} tests</span>
      </div>
      <div className="relative h-4 w-full rounded-md bg-surface-2">
        <div className="absolute inset-y-0 left-0 rounded-md" style={{ width: `${w}%`, background: color, opacity: 0.85 }} />
      </div>
    </div>
  )
}

export function BudgetCalc() {
  const [n, setN] = useState(10)
  const [k, setK] = useState(4)
  const [g, setG] = useState(1)
  const [h, setH] = useState(0.5)
  const brute = n ** k
  const da = n ** g
  const hours = brute * h
  const weeks = hours / 40
  const years = weeks / 52

  return (
    <SimPanel
      title="Experiment-budget calculator"
      subtitle="one-variable-at-a-time testing vs. dimensionless groups"
      src={{ doc: 'fox', pages: '248' }}
      footer={
        <>
          <strong>Try this:</strong> keep 10 values and 4 variables — you reproduce Fox&apos;s 10⁴ tests and &ldquo;about 2½ years&rdquo;. Now
          drop to 5 values per variable: the brute-force bill falls 16-fold, yet still dwarfs the <M tex={md`n^1`} /> tests needed once the
          data are organised as <M tex={md`F/\rho V^2D^2 = f(\rho VD/\mu)`} />.
        </>
      }
    >
      <SimBody
        viz={
          <div className="space-y-3">
            <Bar value={brute} color="var(--plot-4)" label={md`\text{one variable at a time: } n^{${k}}`} />
            <Bar value={da} color="var(--plot-5)" label={md`\text{dimensionless groups: } n^{${g}}`} />
            <div className="relative h-4 text-[10px] text-ink-3">
              {[0, 2, 4, 6, 8].map((e) => (
                <span key={e} className="absolute -translate-x-1/2" style={{ left: `${(e / LOG_MAX) * 100}%` }}>
                  {e === 0 ? '1' : `10${sup(e)}`}
                </span>
              ))}
            </div>
            <p className="text-sm text-ink-2">
              Number of tests on a log scale. The count grows like <M tex={md`n^{k}`} />, where <M tex="k" /> is the number of quantities varied;
              dimensional analysis lowers the exponent from the number of dimensional variables (4 for the sphere) to the number of
              independent groups (1).
            </p>
          </div>
        }
        controls={
          <>
            <Slider
              label="values tested per variable, n"
              value={n}
              min={2}
              max={20}
              step={1}
              onChange={(v) => setN(Math.round(v))}
              format={(v) => String(Math.round(v))}
            />
            <Segmented
              label={md`dimensional variables varied (sphere: $V, D, \rho, \mu$)`}
              value={k}
              onChange={setK}
              options={[1, 2, 3, 4, 5].map((v) => ({ value: v, label: String(v) }))}
            />
            <Segmented
              label={md`independent groups varied (sphere: $\rho VD/\mu$)`}
              value={g}
              onChange={setG}
              options={[1, 2, 3].map((v) => ({ value: v, label: String(v) }))}
            />
            <Slider label="hours per run" value={h} min={0.1} max={2} step={0.1} onChange={setH} unit="h" digits={2} />
          </>
        }
        readout={
          <Tiles
            items={[
              { label: 'brute-force tests', value: String(brute) },
              { label: 'tests with groups', value: String(da), tone: 'good' },
              { label: 'brute-force time', value: hours, unit: 'h', digits: 3 },
              { label: 'in 40-h weeks', value: weeks, unit: 'weeks', digits: 3 },
              { label: 'in years (52 weeks)', value: years, unit: 'yr', digits: 2, tone: years > 1 ? 'bad' : 'default' },
              { label: 'time with groups', value: da * h, unit: 'h', digits: 3, tone: 'good' },
            ]}
          />
        }
      />
    </SimPanel>
  )
}
