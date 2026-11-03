import { useState } from 'react'
import { Plot, Readout, SimPanel, Slider, md } from '@/kit'

/**
 * Zoom on σ_xx(x) across one element: exact face values vs the first-order Taylor estimates
 * σ_xx ± (∂σ_xx/∂x)(δx/2) that label the faces on Lecture 10 slide 3.
 * The profile is an illustrative smooth stress field (x in mm, σ in Pa).
 */
const S0 = -1500
const G = -60 // Pa/mm  (= −60 kPa/m)
const C = 1.5
const D = 0.08
export const sigmaProfile = (x: number) => S0 + G * x + C * x * x + D * x * x * x

export function taylorFaces(deltaMM: number) {
  const h = deltaMM / 2
  const exactR = sigmaProfile(h)
  const exactL = sigmaProfile(-h)
  const taylorR = S0 + G * h
  const taylorL = S0 - G * h
  const exactDiff = exactR - exactL
  const taylorDiff = G * deltaMM
  return {
    exactR,
    exactL,
    taylorR,
    taylorL,
    exactDiff,
    taylorDiff,
    /** absolute error of one face estimate (Pa): the curvature term, ∝ δx² */
    errFace: Math.abs(exactR - taylorR),
    /** absolute error of right − left (Pa): the δx² errors cancel, leaving ∝ δx³ */
    errDiff: Math.abs(exactDiff - taylorDiff),
    errDiffPct: (100 * Math.abs(exactDiff - taylorDiff)) / Math.abs(exactDiff),
  }
}

export function TaylorFaceSim() {
  const [dx, setDx] = useState(12)
  const t = taylorFaces(dx)
  const h = dx / 2
  return (
    <SimPanel
      title="Zoom: where the face labels come from"
      subtitle={md`$\sigma_{xx}$ across one element (illustrative profile)`}
      controls={<Slider label="element width $\delta x$" value={dx} min={1} max={24} step={0.5} onChange={setDx} unit="mm" />}
      readout={
        <Readout
          items={[
            { label: 'right face, exact', value: t.exactR, unit: 'Pa' },
            { label: 'right face, Taylor', value: t.taylorR, unit: 'Pa', tone: 'accent' },
            { label: 'left face, exact', value: t.exactL, unit: 'Pa' },
            { label: 'left face, Taylor', value: t.taylorL, unit: 'Pa', tone: 'accent' },
            { label: 'right − left, exact', value: t.exactDiff, unit: 'Pa' },
            { label: 'right − left, Taylor', value: t.taylorDiff, unit: 'Pa', tone: 'accent' },
            { label: 'error of right-face estimate', value: t.errFace, unit: 'Pa' },
            { label: 'error of right − left', value: t.errDiff, unit: 'Pa', tone: t.errDiffPct < 1 ? 'good' : 'default' },
          ]}
        />
      }
      footer={
        <span>
          <b>Try this:</b> halve δx from 24 mm to 12 mm, then to 6 mm, and watch the two error readouts. The right-face estimate
          is off by a curvature (δx²) term that falls about four- to fivefold per halving, but the same term appears on the left
          face, so it cancels in right − left: that error — the part that produces the net force — falls exactly eightfold
          (∝ δx³). Per unit volume (÷ δx) it still vanishes as δx → 0, so the first-order labels on slide 3 give the net force exactly.
        </span>
      }
    >
      <Plot
        height={300}
        x={{ label: 'position relative to the element centre, $x - x_0$ (mm)', domain: [-12, 12] }}
        y={{ label: md`$\sigma_{xx}$ (Pa)`, domain: [-2300, -500] }}
        bands={[{ x0: -h, x1: h }]}
        vlines={[
          { x: -h, label: 'left face', color: 'var(--plot-7)' },
          { x: h, label: 'right face', color: 'var(--plot-7)' },
        ]}
        series={[
          { label: md`actual $\sigma_{xx}(x)$`, fn: sigmaProfile, color: 'var(--plot-1)' },
          { label: 'tangent at centre (first-order Taylor)', fn: (x) => S0 + G * x, color: 'var(--plot-4)', dash: '6 4' },
        ]}
        marks={[
          { x: 0, y: S0, label: 'centre', color: 'var(--plot-5)' },
          { x: h, y: t.exactR, color: 'var(--plot-1)' },
          { x: -h, y: t.exactL, color: 'var(--plot-1)' },
          { x: h, y: t.taylorR, color: 'var(--plot-4)' },
          { x: -h, y: t.taylorL, color: 'var(--plot-4)' },
        ]}
      />
    </SimPanel>
  )
}
