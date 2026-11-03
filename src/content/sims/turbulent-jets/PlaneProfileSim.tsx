import { useMemo, useState } from 'react'
import { Md, Plot, Readout, SimPanel, Slider, Toggle, md, type Series } from '@/kit'
import { mlProfile, solveMixingLength, tanhProfile, transverse, ZETA_EDGE } from './jetSolutions'

/**
 * Fig. 9.16 recomputed in the browser: Eq. (9.115) integrated with num.rk4 from ζ = 0 (f = 0, f' = 1).
 * The step count is adjustable so the student can see the numerical solution converge.
 */
export function PlaneProfileSim() {
  const [steps, setSteps] = useState(40)
  const [showT, setShowT] = useState(true)
  const [showTanh, setShowTanh] = useState(false)
  const [zp, setZp] = useState(1)

  const tab = useMemo(() => solveMixingLength(steps, 2.6), [steps])
  const res = useMemo(() => {
    // edge (first ζ where f' hits 0), sign change of the transverse velocity, momentum integral, first-integral error
    let edge = NaN
    let zero = NaN
    let I = 0
    let err = 0
    for (let i = 0; i < tab.z.length - 1; i++) {
      const T0 = tab.z[i] * tab.fp[i] - tab.f[i] / 2
      const T1 = tab.z[i + 1] * tab.fp[i + 1] - tab.f[i + 1] / 2
      if (Number.isNaN(zero) && i > 0 && T0 > 0 && T1 <= 0) zero = tab.z[i] + (tab.h * T0) / (T0 - T1)
      if (Number.isNaN(edge) && tab.fp[i + 1] <= 1e-9) edge = tab.z[i] + (tab.h * tab.fp[i]) / Math.max(tab.fp[i] - tab.fp[i + 1], 1e-12)
      I += ((tab.fp[i] ** 2 + tab.fp[i + 1] ** 2) / 2) * tab.h
      if (tab.fp[i] > 0) err = Math.max(err, Math.abs(Math.pow(Math.max(tab.fp[i], 0), 1.5) + Math.pow(Math.max(tab.f[i], 0), 1.5) - 1))
    }
    return { edge, zero, I: 2 * I, err }
  }, [tab])

  const pts = (g: (z: number) => number): [number, number][] => {
    const out: [number, number][] = []
    for (let i = tab.z.length - 1; i >= 0; i--) out.push([-tab.z[i], g(-tab.z[i])])
    for (let i = 1; i < tab.z.length; i++) out.push([tab.z[i], g(tab.z[i])])
    return out
  }
  const axial = pts((z) => mlProfile(z, tab).fp)
  const trans = pts((z) => transverse(mlProfile(z, tab), z))

  const series: Series[] = [
    { label: md`axial $\overline{v}_x\sqrt{x}/(\beta\gamma) = f'$ (RK4)`, points: axial, color: 'var(--plot-1)', width: 2.4 },
  ]
  if (showT) series.push({ label: md`transverse $\overline{v}_y\sqrt{x}/\gamma = \zeta f' - f/2$`, points: trans, color: 'var(--plot-2)', width: 2.2 })
  if (steps < 400)
    series.push({ label: 'RK4 nodes', points: axial.filter((_, i) => i % Math.max(1, Math.round(steps / 20)) === 0), kind: 'scatter', color: 'var(--plot-1)' })
  if (showTanh) {
    series.push({ label: md`tanh model $f' = \mathrm{sech}^2\zeta$`, fn: (z) => tanhProfile(z).fp, color: 'var(--plot-3)', dash: '6 4' })
    if (showT) series.push({ label: md`tanh model $\zeta f' - f/2$`, fn: (z) => transverse(tanhProfile(z), z), color: 'var(--plot-5)', dash: '6 4' })
  }

  const pp = mlProfile(zp, tab)
  return (
    <SimPanel
      title="Fig. 9.16, recomputed live"
      subtitle={md`RK4 on $f\,f' = (f'')^2$, $f(0)=0$, $f'(0)=1$`}
      src={{ doc: 'wilkes', pages: '527–529', note: 'Eq. (9.115), Fig. 9.16' }}
      wide
      controls={
        <>
          <Slider label="RK4 steps on 0 ≤ ζ ≤ 2.6" value={steps} min={4} max={800} step={1} log onChange={(v) => setSteps(Math.round(v))} digits={3} />
          <Slider label={md`probe $\zeta$`} value={zp} min={0} max={2.5} step={0.01} onChange={setZp} digits={3} />
          <Toggle label="show transverse velocity" checked={showT} onChange={setShowT} />
          <Toggle label="overlay tanh (eddy-viscosity) model" checked={showTanh} onChange={setShowTanh} />
        </>
      }
      readout={
        <Readout
          items={[
            { label: md`$f'(\zeta)$ at probe`, value: pp.fp, digits: 4, tone: 'accent' },
            { label: md`$\zeta f'-f/2$ at probe`, value: transverse(pp, zp), digits: 3 },
            { label: md`$\overline{v}_y$ changes sign at $\zeta$`, value: res.zero, digits: 4 },
            { label: md`edge where $f'=0$`, value: res.edge, digits: 4 },
            { label: md`exact edge $4\pi/(3\sqrt3)$`, value: ZETA_EDGE, digits: 4, tone: 'good' },
            { label: md`$\int f'^2\,d\zeta$ (whole jet)`, value: res.I, digits: 4 },
            { label: md`max $\vert f'^{3/2}+f^{3/2}-1\vert$`, value: res.err, digits: 2 },
            { label: 'step size h', value: tab.h, digits: 3 },
          ]}
        />
      }
      footer={
        <Md inline>
          {md`**Try this:** start at 4 steps — the curve is already roughly right but the edge and the sign-change point are off. Drag up to a few hundred steps and watch the edge converge on $4\pi/(3\sqrt3)\approx 2.418$ and the sign change on $\zeta\approx 1.2$ (the book reads "about 1.25" off its plot). Turn on the tanh overlay: it is a little wider beyond $\zeta\approx1.5$, exactly what Wilkes warns about.`}
        </Md>
      }
    >
      <Plot
        x={{ label: md`dimensionless distance $\zeta = \beta y/x$`, domain: [-2.5, 2.5] }}
        y={{ label: 'dimensionless velocities', domain: [-1, 1.5] }}
        series={series}
        height={330}
        hlines={[{ y: 0, color: 'var(--ink-3)' }]}
        bands={[
          { x0: -1.205, x1: 1.205, label: 'spreading', color: 'var(--plot-1)' },
          { x0: 1.205, x1: 2.5, label: 'entrainment', color: 'var(--plot-4)' },
          { x0: -2.5, x1: -1.205, label: 'entrainment', color: 'var(--plot-4)' },
        ]}
        vlines={[{ x: zp, label: 'probe', color: 'var(--ink-2)', dash: '3 3' }]}
      />
    </SimPanel>
  )
}
