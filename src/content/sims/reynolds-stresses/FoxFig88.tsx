import { Plot, md } from '@/kit'

/**
 * Fox & McDonald's Fig. 8.8 (p. 294): Laufer's measured Reynolds stress in fully developed turbulent pipe flow.
 * Values digitised approximately (±0.01) from the printed figure — a cross-reference, not Wilkes material.
 */
const SQUARES: [number, number][] = [
  [0.08, 0.955], [0.18, 0.81], [0.28, 0.725], [0.38, 0.58], [0.49, 0.47], [0.59, 0.405], [0.69, 0.305], [0.79, 0.22], [0.9, 0.095],
]
const CIRCLES: [number, number][] = [
  [0.08, 0.93], [0.18, 0.865], [0.28, 0.71], [0.38, 0.585], [0.49, 0.55], [0.59, 0.42], [0.69, 0.31], [0.79, 0.245], [0.9, 0.1],
]

export function FoxFig88() {
  return (
    <Plot
      height={280}
      x={{ label: md`dimensionless distance from wall, $y/R$`, domain: [0, 1] }}
      y={{ label: md`$-\rho\overline{u'v'}/\tau_w$`, domain: [0, 1.05] }}
      series={[
        { label: md`$Re_U = 500\,000$`, points: SQUARES, kind: 'scatter', color: 'var(--plot-1)' },
        { label: md`$Re_U = 50\,000$`, points: CIRCLES, kind: 'scatter', color: 'var(--plot-3)' },
        { label: md`total shear stress $\tau/\tau_w = 1 - y/R$`, fn: (x) => 1 - x, color: 'var(--plot-7)', dash: '6 4', width: 1.6 },
      ]}
    />
  )
}
