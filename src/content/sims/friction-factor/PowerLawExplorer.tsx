import { useMemo, useState } from 'react'
import { Plot, Readout, Segmented, SimPanel, Slider, Toggle, md, num, type Series } from '@/kit'
import { aPlusOf, fSmoothExp, meanLog, powerLawPoints, uPlusLog, uPlusSeventh, uPlusThree } from './laws'

type View = 'outer' | 'wall'

/** y⁺ range in which the 1/7 law (9.78) stays within ±3 % of the log law (9.42). */
function agreementBand(): [number, number] {
  let lo = NaN
  let hi = NaN
  for (let i = 1000; i <= 5000; i++) {
    const yp = 10 ** (i / 1000)
    const ok = Math.abs(uPlusSeventh(yp) / uPlusLog(yp) - 1) < 0.03
    if (ok && Number.isNaN(lo)) lo = yp
    if (ok) hi = yp
  }
  return [lo, hi]
}

/**
 * Wilkes §9.10: a Blasius-type law f_F = A(a v̄zm/ν)^(−1/n) (9.72) implies a power-law profile with
 * m = 1/(2n − 1) (9.77). Outer view: v̄z/v̄zc = (y/a)^m against the log law at a chosen Re.
 * Wall view: the 1/7 law in wall units (9.78) against the log law (9.42) and v⁺ = y⁺.
 */
export function PowerLawExplorer() {
  const [n, setN] = useState(4)
  const [Re, setRe] = useState(1e5)
  const [view, setView] = useState<View>('outer')
  const [lam, setLam] = useState(false)

  const m = 1 / (2 * n - 1)
  const foxN = 2 * n - 1
  const ratio = 2 / ((m + 1) * (m + 2))
  const f = fSmoothExp(Re)
  const ap = aPlusOf(Re, f)
  const uc = uPlusLog(ap)
  const logRatio = meanLog(ap) / uc
  const centreMismatch = (uPlusSeventh(ap) / uc - 1) * 100
  const pts = useMemo(() => powerLawPoints(m), [m])
  const pts7 = useMemo(() => powerLawPoints(1 / 7), [])
  const band = useMemo(agreementBand, [])

  const outer: Series[] = [
    { label: md`power law $(y/a)^{m}$, $m = 1/${foxN}$`, points: pts, color: 'var(--plot-1)', width: 3 },
    { label: md`log law (9.42) at $\Rey = ${num.fmtTeX(Re, 2)}$, scaled by its centreline value`, fn: (t) => uPlusThree(ap * t) / uc, color: 'var(--plot-5)', width: 2, samples: 400 },
  ]
  if (n !== 4) outer.push({ label: md`reference: $m = 1/7$`, points: pts7, color: 'var(--plot-7)', dash: '5 4', width: 1.6 })
  if (lam) outer.push({ label: 'laminar parabola (supplementary)', fn: (t) => 2 * t - t * t, color: 'var(--plot-6)', dash: '6 4', width: 1.8 })

  const wall: Series[] = [
    { label: md`one-seventh law (9.78): $8.74\,(y^+)^{1/7}$`, fn: uPlusSeventh, range: [1, 1e5], color: 'var(--plot-1)', width: 2.6 },
    { label: md`log law (9.42): $5.5 + 2.5\ln y^+$`, fn: uPlusLog, range: [5, 1e5], color: 'var(--plot-5)', width: 2.2 },
    { label: md`sublayer (9.43): $v_z^+ = y^+$`, fn: (x) => x, range: [1, 14], color: 'var(--plot-6)', width: 1.8 },
  ]

  return (
    <SimPanel
      title="Power-law profile explorer"
      subtitle="Wilkes Eqs. (9.72)–(9.78): from the friction-law exponent n to the profile exponent m"
      wide
      controls={
        <>
          <Segmented
            label="view"
            value={view}
            onChange={setView}
            options={[
              { value: 'outer', label: md`$\overline{v}_z/\overline{v}_{zc}$ vs $y/a$` },
              { value: 'wall', label: md`wall units $v_z^+$ vs $y^+$` },
            ]}
          />
          <Slider label={md`Blasius-type exponent $n$ in $f_{\mathrm F}\propto \Rey^{-1/n}$`} value={n} min={2.5} max={8} step={0.5} onChange={setN} digits={2} />
          <Slider label={md`Reynolds number $\Rey$ (log-law comparison)`} value={Re} min={5e3} max={3e6} log onChange={setRe} />
          {view === 'outer' ? <Toggle label="overlay laminar parabola" checked={lam} onChange={setLam} /> : null}
        </>
      }
      readout={
        <Readout
          items={[
            { label: md`$m = 1/(2n-1)$`, value: `1/${foxN} = ${m.toFixed(4)}`, tone: 'accent' },
            { label: md`Fox's exponent $n_{\text{Fox}} = 1/m$`, value: foxN },
            { label: md`$\overline{v}_{zm}/\overline{v}_{zc}$, power law`, value: ratio, digits: 4 },
            { label: md`$\overline{v}_{zm}/\overline{v}_{zc}$, log law at this Re`, value: logRatio, digits: 4 },
            { label: md`$a^+$ at this Re`, value: ap },
            { label: md`1/7 law vs log law at the centreline`, value: centreMismatch, unit: '%', digits: 2, tone: Math.abs(centreMismatch) > 5 ? 'bad' : 'good' },
          ]}
        />
      }
      footer="Try this: in the wall-units view, move Re from 10⁴ to 10⁶ and watch the centreline line (a⁺) slide right — beyond y⁺ ≈ 1000 the 1/7 law climbs above the log law, which is why the Blasius law it comes from is limited to Re ≤ 10⁵. In the outer view, raise n: a friction factor that falls more slowly with Re goes with a blunter profile (smaller m, larger v̄zm/v̄zc)."
    >
      {view === 'outer' ? (
        <Plot
          height={320}
          x={{ label: 'Dimensionless distance from wall, $y/a$', domain: [0, 1], ticks: 5 }}
          y={{ label: md`$\overline{v}_z/\overline{v}_{zc}$`, domain: [0, 1.05] }}
          series={outer}
          hlines={[{ y: ratio, label: `power-law mean = ${ratio.toFixed(3)} × centreline`, color: 'var(--plot-1)' }]}
        />
      ) : (
        <Plot
          height={320}
          x={{ label: md`$y^+ = y\overline{v}_z^{*}/\nu$`, domain: [1, 1e5], log: true }}
          y={{ label: md`$v_z^+ = \overline{v}_z/\overline{v}_z^{*}$`, domain: [0, 40] }}
          series={wall}
          bands={[{ x0: band[0], x1: band[1], label: '1/7 law within ±3 % of log law' }]}
          vlines={[{ x: ap, label: `centreline a⁺ = ${num.fmt(ap, 3)}`, color: 'var(--plot-4)' }]}
        />
      )}
    </SimPanel>
  )
}
