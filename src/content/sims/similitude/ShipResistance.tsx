/**
 * Ship-resistance splitter: steps through Fox's procedure (p.261) on the digitised data of Figs. 7.2 and 7.3.
 */
import { useMemo, useState } from 'react'
import { Md, Plot, Readout, Segmented, SimPanel, Slider, Toggle, md, type Series } from '@/kit'
import { FIG72_TOTAL, FIG72_VISC, FIG72_WAVE, FIG73_TOTAL, FIG73_VISC, FIG73_WAVE, interp, mergeRuns } from './data'

type Stage = 1 | 2 | 3 | 4
const STAGES: { value: Stage; label: string }[] = [
  { value: 1, label: '1 · measure' },
  { value: 2, label: '2 · viscous' },
  { value: 3, label: '3 · subtract' },
  { value: 4, label: '4 · full scale' },
]
const TEXT: Record<Stage, string> = {
  1: md`**Step 1 (model tank test, Fig. 7.2).** Only the **total** resistance of the 1:80 model can be measured — squares (repeated runs give two squares at some $Fr$).`,
  2: md`**Step 2.** Boundary-layer theory predicts the model's **viscous** (skin-friction) resistance at the model Reynolds number — diamonds. It falls as $Fr$ (hence speed, hence $Re_m$) rises.`,
  3: md`**Step 3.** **Wave resistance = total − viscous**, point by point — circles. Waves depend on $Fr$ only, so this curve is valid for the full-size ship as well.`,
  4: md`**Step 4 (Fig. 7.3).** Theory gives the much lower **full-scale viscous** coefficient (huge $Re_p$); add it to the same wave curve to predict the full-scale **total**. The line is our own sum; the squares are the book's prediction.`,
}

const M_TOT = mergeRuns(FIG72_TOTAL)
const M_VISC = FIG72_VISC
const P_VISC = FIG73_VISC
const WAVE = mergeRuns(FIG72_WAVE)
const P_TOT = FIG73_TOTAL
const ALLOW = 0.00047

export function ShipResistance() {
  const [stage, setStage] = useState<Stage>(1)
  const [Fr, setFr] = useState(0.5)
  const [allow, setAllow] = useState(true)

  const series = useMemo(() => {
    const s: Series[] = []
    if (stage < 4) s.push({ label: 'model total (measured)', points: FIG72_TOTAL, kind: 'scatter', color: 'var(--plot-1)' })
    else s.push({ label: 'model total (Fig. 7.2)', points: FIG72_TOTAL, kind: 'scatter', color: 'var(--plot-7)', opacity: 0.35 })
    if (stage >= 2 && stage < 4) s.push({ label: 'model viscous (theory)', points: FIG72_VISC, kind: 'scatter', color: 'var(--plot-5)' })
    if (stage === 3) {
      s.push({ label: 'wave = total − viscous', points: FIG72_WAVE, kind: 'scatter', color: 'var(--plot-4)' })
      s.push({ label: 'our subtraction', fn: (x) => interp(M_TOT, x) - interp(M_VISC, x), range: [0.015, 0.6], color: 'var(--plot-4)', dash: '4 3', width: 1.5 })
    }
    if (stage === 4) {
      s.push({ label: 'wave (same curve)', points: FIG73_WAVE, kind: 'scatter', color: 'var(--plot-4)' })
      s.push({ label: 'full-scale viscous (theory)', points: FIG73_VISC, kind: 'scatter', color: 'var(--plot-3)' })
      s.push({ label: 'full-scale total (Fig. 7.3)', points: FIG73_TOTAL, kind: 'scatter', color: 'var(--plot-1)' })
      s.push({
        label: allow ? 'our sum + allowance' : 'our sum: wave + viscous',
        fn: (x) => interp(WAVE, x) + interp(P_VISC, x) + (allow ? ALLOW : 0),
        range: [0.015, 0.6],
        color: 'var(--plot-1)',
        width: 1.8,
      })
    }
    return s
  }, [stage, allow])

  const mt = interp(M_TOT, Fr)
  const mv = interp(M_VISC, Fr)
  const wave = mt - mv
  const pv = interp(P_VISC, Fr)
  const sum = wave + pv + (allow ? ALLOW : 0)
  const book = interp(P_TOT, Fr)

  return (
    <SimPanel
      title="Ship-resistance splitter (Figs. 7.2 → 7.3)"
      subtitle="1:80 model of the frigate FFG-7"
      src={{ doc: 'fox', pages: '260–261', note: 'Figs. 7.2–7.3 (data digitised)' }}
      wide
      controls={
        <>
          <Segmented label="Procedure step" options={STAGES} value={stage} onChange={setStage} />
          <Slider label="Froude number $Fr$" value={Fr} min={0.02} max={0.6} step={0.005} onChange={setFr} digits={3} />
          {stage === 4 ? <Toggle label="add roughness allowance ≈ 0.00047" checked={allow} onChange={setAllow} /> : null}
          <Md className="md-tight text-sm text-ink-2">{TEXT[stage]}</Md>
        </>
      }
      readout={
        <Readout
          items={[
            { label: 'model total', value: mt * 1e3, digits: 3, unit: '×10⁻³' },
            { label: 'model viscous', value: mv * 1e3, digits: 3, unit: '×10⁻³' },
            { label: 'wave (total − visc.)', value: wave * 1e3, digits: 3, unit: '×10⁻³', tone: 'accent' },
            { label: 'full-scale viscous', value: pv * 1e3, digits: 3, unit: '×10⁻³' },
            { label: 'predicted full-scale total', value: sum * 1e3, digits: 3, unit: '×10⁻³', tone: 'good' },
            { label: 'Fig. 7.3 total', value: book * 1e3, digits: 3, unit: '×10⁻³' },
          ]}
        />
      }
      footer={
        <Md>{md`**Try this:** set $Fr = 0.5$ and walk through steps 1→4. Using the model's total coefficient directly (≈ 7.0×10⁻³) would over-predict the full-scale value (≈ 5.3×10⁻³) by about a third — the viscous part does **not** scale with $Fr$. Turn the allowance off in step 4 and see that the book's Fig. 7.3 totals sit ≈ 0.0005 above wave + viscous (our inference: the roughness correction mentioned in the text).`}</Md>
      }
    >
      <Plot
        x={{ label: 'Froude number, $Fr$', domain: [0, 0.6] }}
        y={{ label: 'Resistance coefficient (×10⁻³)', domain: [-0.002, 0.009], format: (v) => (v * 1e3).toFixed(0) }}
        series={series}
        vlines={[{ x: Fr, color: 'var(--ink-3)', dash: '3 3' }]}
        hlines={[{ y: 0, color: 'var(--axis)' }]}
        height={340}
      />
    </SimPanel>
  )
}
