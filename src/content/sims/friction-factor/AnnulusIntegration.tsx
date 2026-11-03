import { useMemo, useState } from 'react'
import { Plot, Readout, Slider, md, num } from '@/kit'
import { aPlusOf, fSmoothTheory, flowIntegral, meanLog, uPlusLog, uPlusThree } from './laws'

const RINGS = 26
const CX = 120
const CY = 112
const R = 96

/** SVG path of an annulus (outer radius ro, inner radius ri) centred on (CX, CY), filled with the even-odd rule. */
function ringPath(ro: number, ri: number): string {
  const circle = (r: number, sweep: 0 | 1) =>
    `M ${CX + r} ${CY} A ${r} ${r} 0 1 ${sweep} ${CX - r} ${CY} A ${r} ${r} 0 1 ${sweep} ${CX + r} ${CY} Z`
  return `${circle(ro, 0)} ${circle(Math.max(0.1, ri), 1)}`
}

/**
 * Visual for Wilkes Eq. (9.48): the mean velocity is an area average over thin annuli 2πr dr.
 * Left: pipe cross-section shaded by the local time-averaged velocity (three-piece universal profile)
 * with one annulus highlighted. Right: local velocity and the flow-rate integrand 2(r/a)·v̄z/v̄zm,
 * whose area is exactly 1. The laminar sublayer is drawn at true scale — usually thinner than a pixel.
 */
export function AnnulusIntegration() {
  const [Re, setRe] = useState(1e5)
  const [eta, setEta] = useState(0.8)

  const d = useMemo(() => {
    const f = fSmoothTheory(Re)
    const ap = aPlusOf(Re, f)
    const total = flowIntegral(ap, ap)
    const vmNum = (2 / (ap * ap)) * total
    const vmLog = meanLog(ap)
    const fracSub = flowIntegral(ap, 5) / total
    const uc = uPlusLog(ap)
    return { f, ap, vmNum, vmLog, fracSub, uc }
  }, [Re])

  const uOf = (e: number) => uPlusThree(d.ap * (1 - e))
  const ringFill = (e: number) => 0.1 + 0.78 * Math.max(0, Math.min(1, uOf(e) / d.uc))

  // Each ring is drawn as a true annulus (even-odd fill) so that semi-transparent fills do not stack up
  // towards the centre — the shade of every ring then reflects only its own local velocity.
  const rings = Array.from({ length: RINGS }, (_, i) => {
    const outer = (RINGS - i) / RINGS
    const inner = (RINGS - i - 1) / RINGS
    const mid = (RINGS - i - 0.5) / RINGS
    return { ro: outer * R, ri: inner * R, op: ringFill(mid) }
  })

  const selR = eta * R
  const dr = 0.035 * R
  const subFrac = 5 / d.ap // δ/a with δ = 5ν/v* (edge of the three-piece sublayer)
  const ang = -0.7

  return (
    <div className="space-y-4">
      <div className="grid items-center gap-4 sm:grid-cols-[minmax(0,230px)_minmax(0,1fr)]">
        <svg viewBox="0 0 240 250" className="mx-auto h-auto w-full max-w-[250px]" role="img" aria-label="Pipe cross-section split into annuli">
          {rings.map((g, i) => (
            <path key={i} d={ringPath(g.ro, g.ri)} fill="var(--plot-1)" fillOpacity={g.op} fillRule="evenodd" stroke="var(--surface)" strokeWidth={0.4} />
          ))}
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="var(--ink-2)" strokeWidth={2.2} />
          {/* true-scale sublayer ring (usually far below one pixel) */}
          <circle cx={CX} cy={CY} r={R * (1 - subFrac / 2)} fill="none" stroke="var(--plot-3)" strokeWidth={Math.max(0.15, R * subFrac)} />
          <path d={ringPath(selR + dr / 2, selR - dr / 2)} fill="var(--plot-4)" fillOpacity={0.55} fillRule="evenodd" stroke="var(--plot-4)" strokeWidth={1} />
          <line x1={CX} y1={CY} x2={CX + selR * Math.cos(ang)} y2={CY + selR * Math.sin(ang)} stroke="var(--ink)" strokeWidth={1.2} />
          <circle cx={CX} cy={CY} r={2.2} fill="var(--ink)" />
          <text x={CX + 0.5 * selR * Math.cos(ang) + 4} y={CY + 0.5 * selR * Math.sin(ang) - 4} className="fill-ink text-[11px] font-semibold">
            r
          </text>
          <text x={CX} y={CY + R + 18} textAnchor="middle" className="fill-ink-2 text-[11px]">
            highlighted annulus: dA = 2πr dr
          </text>
          <text x={CX} y={CY + R + 33} textAnchor="middle" className="fill-ink-3 text-[10px]">
            amber sublayer ring = {num.fmt(subFrac * 100, 2)} % of a (true scale)
          </text>
        </svg>
        <Plot
          height={270}
          x={{ label: 'Radial position $r/a$ (centre → wall)', domain: [0, 1], ticks: 5 }}
          y={{ label: 'Dimensionless value', domain: [0, 2.6] }}
          series={[
            {
              label: md`flow-rate integrand $2(r/a)\,\overline{v}_z/\overline{v}_{zm}$ (area = 1)`,
              fn: (e) => (2 * e * uOf(e)) / d.vmNum,
              kind: 'area',
              color: 'var(--plot-4)',
              opacity: 0.16,
              samples: 400,
            },
            {
              fn: (e) => (2 * e * uOf(e)) / d.vmNum,
              color: 'var(--plot-4)',
              samples: 400,
              hideInLegend: true,
            },
            {
              label: md`local velocity $\overline{v}_z/\overline{v}_{zm}$`,
              fn: (e) => uOf(e) / d.vmNum,
              color: 'var(--plot-1)',
              width: 2.6,
              samples: 400,
            },
          ]}
          vlines={[{ x: eta, label: 'annulus', color: 'var(--plot-4)' }]}
          bands={[{ x0: 1 - subFrac, x1: 1, color: 'var(--plot-3)' }]}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label={md`Reynolds number $\Rey$`} value={Re} min={5e3} max={1e7} log onChange={setRe} />
        <Slider label={md`annulus position $r/a$`} value={eta} min={0.05} max={0.98} step={0.01} onChange={setEta} digits={2} />
      </div>
      <Readout
        cols={3}
        items={[
          { label: md`$a^+ = a\overline{v}_z^{*}/\nu$`, value: d.ap },
          { label: md`sublayer $5\nu/\overline{v}_z^{*}$ as % of $a$`, value: subFrac * 100, unit: '%' },
          { label: md`share of $Q$ inside $y^+<5$`, value: d.fracSub * 100, unit: '%', tone: 'accent' },
          { label: md`$\overline{v}_{zm}/\overline{v}_z^{*}$ from Eq. (9.49)`, value: d.vmLog, digits: 4 },
          { label: md`$\overline{v}_{zm}/\overline{v}_z^{*}$, 3-piece, numerical`, value: d.vmNum, digits: 4 },
          { label: 'difference', value: ((d.vmLog - d.vmNum) / d.vmNum) * 100, unit: '%', digits: 2, tone: 'good' },
        ]}
      />
      <p className="text-sm text-ink-2">
        Try this: slide the annulus towards the wall — the integrand 2(r/a)·v̄z/v̄zm peaks close to r/a ≈ 0.8–0.9 because the
        outer rings have the most area and still move almost at full speed. Then lower Re from 10⁵ to 5×10³: the sublayer&apos;s share
        of Q rises from about 0.05 % to about 1 %, and Eq. (9.49) now overestimates the three-region mean by about 5 % instead of
        0.3 % — neglecting the sublayer is an approximation that improves as Re grows.
      </p>
    </div>
  )
}
