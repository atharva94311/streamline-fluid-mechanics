import { useMemo, useState } from 'react'
import { Md, md, Plot, Readout, Segmented, SimPanel, Slider, Toggle } from '@/kit'
import {
  aPlusForRe, churchillF, churchillY0, churchillYinf, crossoverYPlus, fanning953, integrateChurchill, usagiBlend,
} from './models'
import { Arrow, Label } from './svg'

const C_TOT = 'var(--ink)'
const C_REY = 'var(--plot-1)'
const C_VIS = 'var(--plot-4)'

/**
 * Recreation of Wilkes Fig. 9.12: total shear stress τw r/a (straight line) = viscous + Reynolds stress.
 * Centreline at the bottom, wall at the top, stress magnitude to the right (as in the book).
 * Curves are computed from (9.85)–(9.86) for a low a⁺ so that the wall layer is visible on a linear scale.
 */
export function StressPartitionFigure({ aPlus = 150 }: { aPlus?: number }) {
  const x0 = 96
  const x1 = 540
  const yW = 62
  const yC = 330
  const X = (s: number) => x0 + s * (x1 - x0)
  const Y = (q: number) => yW + q * (yC - yW) // q = y/a, distance from the wall
  const pts = (fn: (q: number) => number) => {
    const out: string[] = []
    const N = 260
    for (let i = 0; i <= N; i++) {
      const q = (i / N) ** 2
      out.push(`${i ? 'L' : 'M'}${X(fn(q)).toFixed(1)},${Y(q).toFixed(1)}`)
    }
    return out.join(' ')
  }
  const rey = (q: number) => churchillF(Math.max(aPlus * q, 1e-6), aPlus) * (1 - q)
  const vis = (q: number) => (1 - churchillF(Math.max(aPlus * q, 1e-6), aPlus)) * (1 - q)
  const yx = crossoverYPlus(aPlus) / aPlus
  return (
    <div>
      <svg viewBox="0 0 600 372" className="h-auto w-full" role="img" aria-label="Total, viscous and turbulent shear stress across a pipe radius">
        {/* wall */}
        <rect x={x0 - 24} y={yW - 16} width={x1 - x0 + 48} height={16} fill="var(--body-fill)" stroke="var(--ink-3)" />
        <Label x={x0 - 30} y={yW - 4} anchor="end" size={13} cls="fill-ink-2">wall</Label>
        <Arrow x1={(x0 + x1) / 2} y1={24} x2={x0} y2={24} color="var(--ink-2)" />
        <Arrow x1={(x0 + x1) / 2} y1={24} x2={x1} y2={24} color="var(--ink-2)" />
        <Label x={(x0 + x1) / 2} y={18} size={13}>wall stress τw</Label>
        {/* centreline */}
        <line x1={x0 - 24} x2={x1 + 24} y1={yC} y2={yC} stroke="var(--ink-3)" strokeDasharray="10 5" />
        <Label x={x1 + 20} y={yC + 18} anchor="end" size={12} cls="fill-ink-2">centreline</Label>
        <Arrow x1={x0} y1={yC + 22} x2={x0 + 40} y2={yC + 22} color="var(--ink-2)" />
        <Label x={x0 + 46} y={yC + 26} anchor="start" size={12} italic>z</Label>
        {/* r and y arrows */}
        <Arrow x1={44} y1={yC} x2={44} y2={yC - 70} color="var(--ink-2)" />
        <Label x={36} y={yC - 60} anchor="end" size={14} italic>r</Label>
        <Arrow x1={44} y1={yW} x2={44} y2={yW + 70} color="var(--ink-2)" />
        <Label x={36} y={yW + 66} anchor="end" size={14} italic>y</Label>
        {/* stress axis ticks */}
        <line x1={x0} x2={x0} y1={yW} y2={yC} stroke="var(--line)" />
        <line x1={x1} x2={x1} y1={yW} y2={yC} stroke="var(--line)" strokeDasharray="3 4" />
        {/* crossover band */}
        <rect x={x0} y={yW} width={x1 - x0} height={Y(yx) - yW} fill="color-mix(in srgb, var(--plot-4) 10%, transparent)" />
        <line x1={x0} x2={x1} y1={Y(yx)} y2={Y(yx)} stroke="var(--plot-4)" strokeDasharray="4 4" strokeWidth={1} />
        <Label x={x0 - 6} y={Y(yx) + 4} anchor="end" size={11} cls="fill-[var(--plot-4)]">f = ½</Label>
        {/* curves */}
        <path d={pts((q) => 1 - q)} fill="none" stroke={C_TOT} strokeWidth={2.4} />
        <path d={pts(rey)} fill="none" stroke={C_REY} strokeWidth={2.4} />
        <path d={pts(vis)} fill="none" stroke={C_VIS} strokeWidth={2.4} />
        <Label x={X(0.3) + 14} y={Y(0.7) + 4} anchor="start" size={13} weight={600} cls="fill-ink">total τw r/a</Label>
        <Label x={X(0.47) - 14} y={Y(0.45)} anchor="end" size={13} weight={600} cls="fill-[var(--plot-1)]">Reynolds (turbulent)</Label>
        <Label x={X(0.08)} y={Y(0.25)} anchor="start" size={13} weight={600} cls="fill-[var(--plot-4)]">viscous</Label>
      </svg>
      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-2">
        <span><span className="mr-1 inline-block h-0.5 w-5 align-middle" style={{ background: C_TOT }} /><Md inline>{md`total $\tau_w\,r/a$`}</Md></span>
        <span><span className="mr-1 inline-block h-0.5 w-5 align-middle" style={{ background: C_REY }} /><Md inline>{md`Reynolds $\rho\overline{v_z'v_r'}$`}</Md></span>
        <span><span className="mr-1 inline-block h-0.5 w-5 align-middle" style={{ background: C_VIS }} /><Md inline>{md`viscous $\mu\,d\overline{v}_z/dy$`}</Md></span>
      </div>
    </div>
  )
}

type View = 'frac' | 'stress' | 'vel'

/** Interactive stress partition from the Churchill correlation (9.86) and the velocity ODE (9.88). */
export function StressPartitionLab() {
  const [Re, setRe] = useState(1e5)
  const [view, setView] = useState<View>('frac')
  const [asym, setAsym] = useState(false)
  const aPlus = useMemo(() => aPlusForRe(Re), [Re])
  const prof = useMemo(() => integrateChurchill(aPlus, 900), [aPlus])
  const yx = useMemo(() => crossoverYPlus(aPlus), [aPlus])
  const f53 = useMemo(() => fanning953(prof.Re), [prof.Re])
  const dom: [number, number] = [0.1, aPlus]
  const bands = [
    { x0: 0.1, x1: 5, label: 'sublayer', color: 'color-mix(in srgb, var(--plot-4) 12%, transparent)' },
    { x0: 5, x1: 30, label: 'buffer', color: 'color-mix(in srgb, var(--plot-3) 10%, transparent)' },
  ]

  let plot
  if (view === 'frac') {
    plot = (
      <Plot
        height={300}
        x={{ label: '$y^+$ (log scale)', domain: dom, log: true }}
        y={{ label: 'fraction of local total stress', domain: [0, 1.05] }}
        bands={bands}
        vlines={[{ x: yx, label: 'f = ½', color: 'var(--plot-6)', dash: '4 3' }]}
        series={[
          { label: 'Reynolds fraction $f(y^+,a^+)$', fn: (y) => churchillF(y, aPlus), color: C_REY, width: 2.4, samples: 300 },
          { label: 'viscous fraction $1-f$', fn: (y) => 1 - churchillF(y, aPlus), color: C_VIS, width: 2.4, samples: 300 },
          ...(asym
            ? [
                { label: 'near-wall asymptote $y_0$', fn: churchillY0, color: 'var(--plot-2)', dash: '6 4', range: [0.1, 15] as [number, number] },
                { label: 'outer asymptote $y_\\infty$', fn: (y: number) => churchillYinf(y, aPlus), color: 'var(--plot-5)', dash: '6 4' },
              ]
            : []),
        ]}
      />
    )
  } else if (view === 'stress') {
    plot = (
      <Plot
        height={300}
        x={{ label: '$y^+$ (log scale)', domain: dom, log: true }}
        y={{ label: 'stress $/\\tau_w$', domain: [0, 1.05] }}
        bands={bands}
        series={[
          { label: 'total $1-y^+/a^+$', fn: (y) => 1 - y / aPlus, color: C_TOT, width: 2.2 },
          { label: 'Reynolds', fn: (y) => churchillF(y, aPlus) * (1 - y / aPlus), color: C_REY, width: 2.4, samples: 300 },
          { label: 'viscous', fn: (y) => (1 - churchillF(y, aPlus)) * (1 - y / aPlus), color: C_VIS, width: 2.4, samples: 300 },
        ]}
      />
    )
  } else {
    plot = (
      <Plot
        height={300}
        x={{ label: '$y^+$ (log scale)', domain: dom, log: true }}
        y={{ label: '$v_z^+ = \\overline{v}_z/v^*$', domain: [0, 32] }}
        bands={bands}
        series={[
          { label: 'integrated (9.88)', points: prof.profile.filter((p) => p[0] >= 0.1), color: C_REY, width: 2.6 },
          { label: '$v_z^+=y^+$ (9.43)', fn: (y) => y, range: [0.1, 14], color: 'var(--plot-4)', dash: '5 4' },
          { label: '$5.5+2.5\\ln y^+$ (9.42)', fn: (y) => 5.5 + 2.5 * Math.log(y), range: [8, aPlus], color: 'var(--plot-2)', dash: '5 4' },
        ]}
      />
    )
  }

  return (
    <SimPanel
      title="Who carries the shear? — Churchill's stress partition"
      subtitle="Eqs. (9.85)–(9.88), smooth pipe"
      wide
      controls={
        <>
          <Slider label="Reynolds number $\mathrm{Re}$" value={Re} min={5e3} max={1e6} log onChange={setRe} format={(v) => Math.round(v).toLocaleString('en-US')} />
          <Segmented
            label="show"
            value={view}
            onChange={setView}
            options={[
              { value: 'frac', label: 'fractions' },
              { value: 'stress', label: 'stresses' },
              { value: 'vel', label: 'velocity' },
            ]}
          />
          {view === 'frac' ? <Toggle label="show the two asymptotes of (9.87)" checked={asym} onChange={setAsym} /> : null}
        </>
      }
      readout={
        <Readout
          items={[
            { label: '$a^+ = a v^*/\\nu$', value: aPlus, digits: 4 },
            { label: '$y^+$ where $f=\\tfrac12$', value: yx, digits: 3, tone: 'accent' },
            { label: '$f$ at $y^+=30$', value: churchillF(30, aPlus), digits: 3 },
            { label: '$v_{zm}^+$ from (9.88)', value: prof.vmPlus, digits: 4 },
            { label: '$f_F$ from (9.88)', value: prof.fF, digits: 3, tone: 'good' },
            { label: '$f_F$ from (9.53)', value: f53, digits: 3 },
            { label: 'Darcy $f = 4f_F$', value: 4 * prof.fF, digits: 3 },
            { label: 'difference', value: `${((100 * (prof.fF - f53)) / f53).toFixed(1)} %` },
          ]}
        />
      }
      footer={
        <Md inline>{md`Try this: drag Re from 5,000 to 10⁶. The crossover $f=\tfrac12$ stays pinned near $y^+\approx 11$ (the sublayer edge of Section 9.8) while $a^+$ grows ~100-fold — in wall units the wall layer never changes; it is the pipe that gets "bigger". Then open **velocity** and see the integrated (9.88) profile hug $v_z^+=y^+$ and then the log law.`}</Md>
      }
    >
      {plot}
    </SimPanel>
  )
}

/** Churchill–Usagi interpolation (9.87) with an adjustable exponent p, using the two asymptotes of (9.86). */
export function UsagiBlendDemo() {
  const [p, setP] = useState(-8 / 7)
  const aPlus = 2000
  const fp = (y: number) => usagiBlend(churchillY0(y), churchillYinf(y, aPlus), p)
  return (
    <SimPanel
      title="Churchill–Usagi blending lab"
      subtitle="Eq. (9.87) with the asymptotes of (9.86), a⁺ = 2000"
      controls={
        <>
          <Slider label="exponent $p$" value={p} min={-6} max={-0.3} step={0.01} onChange={setP} digits={3} />
          <button type="button" className="btn-ghost text-sm" onClick={() => setP(-8 / 7)}>
            reset to Churchill's p = −8/7
          </button>
        </>
      }
      readout={
        <Readout
          cols={2}
          items={[
            { label: '$y_0$ at $y^+=10$', value: churchillY0(10), digits: 3 },
            { label: '$y_\\infty$ at $y^+=10$', value: churchillYinf(10, aPlus), digits: 3 },
            { label: 'blend at $y^+=10$', value: fp(10), digits: 3, tone: 'accent' },
            { label: 'Churchill $f$ at $y^+=10$', value: churchillF(10, aPlus), digits: 3, tone: 'good' },
          ]}
        />
      }
      footer="Try this: push p towards −6 — the blend hugs the smaller asymptote and develops a sharp corner. Move p towards −0.3 — the blend becomes far too small in the overlap zone. Churchill's p = −8/7 is the value that fits the data between the extremes."
    >
      <Plot
        height={280}
        x={{ label: '$y^+$ (log scale)', domain: [0.5, 2000], log: true }}
        y={{ label: 'Reynolds-stress fraction (log scale)', domain: [1e-4, 2], log: true }}
        series={[
          { label: '$y_0 = 0.7(y^+/10)^3$', fn: churchillY0, color: 'var(--plot-2)', dash: '6 4', width: 1.8 },
          { label: '$y_\\infty$', fn: (y) => churchillYinf(y, aPlus), color: 'var(--plot-5)', dash: '6 4', width: 1.8 },
          { label: 'blend with your $p$', fn: fp, color: 'var(--plot-1)', width: 2.6, samples: 300 },
        ]}
      />
    </SimPanel>
  )
}
