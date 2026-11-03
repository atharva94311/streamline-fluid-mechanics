/**
 * Static figures for the "dimensional-basics" topic.
 *  - PipeSlideFigure: Lecture 13 slides 2–3 (four one-variable-at-a-time plots → one dimensionless curve), qualitative.
 *  - MltFltDiagram: the two basic-dimension systems and the bridge F ≐ MLT⁻² (slide 3).
 *  - TermScalingFigure: where 1/Re and 1/Fr² come from in Fox Eqs. (7.6)–(7.10) (pp. 246–247).
 */
import { ArrowDown, ArrowRight } from 'lucide-react'
import { M, cx, md } from '@/kit'
import { TeXLabel } from './svg'

/* ------------------------------------------------------------------------------------------------ slide 2–3 */

interface Panel {
  key: string
  xLabel: string
  note: string
  fn: (x: number) => number
  range: [number, number]
  pts: number[]
}

const PANELS: Panel[] = [
  { key: '(a)', xLabel: 'V', note: md`D,\ \rho,\ \mu\ \text{– constant}`, fn: (x) => 0.06 + 0.9 * x ** 2.4, range: [0.08, 1], pts: [0.22, 0.45, 0.64, 0.82, 0.95] },
  { key: '(b)', xLabel: 'D', note: md`V,\ \rho,\ \mu\ \text{– constant}`, fn: (x) => 0.08 + 0.86 * (1 - x) ** 2.1, range: [0.05, 1], pts: [0.1, 0.28, 0.47, 0.68, 0.9] },
  { key: '(c)', xLabel: md`\rho`, note: md`D,\ V,\ \mu\ \text{– constant}`, fn: (x) => 0.16 + 0.32 * x + 0.12 * x * x, range: [0.06, 0.96], pts: [0.13, 0.3, 0.48, 0.66, 0.84] },
  { key: '(d)', xLabel: md`\mu`, note: md`D,\ \rho,\ V\ \text{– constant}`, fn: (x) => 0.2 + 0.38 * x + 0.24 * x * x, range: [0.06, 0.96], pts: [0.16, 0.34, 0.52, 0.72, 0.9] },
]

function curvePath(fn: (x: number) => number, [a, b]: [number, number], sx: (x: number) => number, sy: (y: number) => number) {
  const n = 60
  let d = ''
  for (let i = 0; i < n; i++) {
    const x = a + ((b - a) * i) / (n - 1)
    d += `${i ? 'L' : 'M'}${sx(x).toFixed(1)},${sy(fn(x)).toFixed(1)}`
  }
  return d
}

function MiniPanel({ p }: { p: Panel }) {
  const sx = (x: number) => 30 + x * 140
  const sy = (y: number) => 112 - y * 92
  return (
    <div className="min-w-0">
      <svg viewBox="0 0 180 136" className="h-auto w-full" role="img" aria-label={`Panel ${p.key}: pressure drop per length against one variable`}>
        <line x1={28} y1={8} x2={28} y2={114} stroke="var(--plot-4)" strokeOpacity={0.7} strokeWidth={1.2} />
        <line x1={28} y1={114} x2={176} y2={114} stroke="var(--plot-4)" strokeOpacity={0.7} strokeWidth={1.2} />
        <TeXLabel x={4} y={14} tex={md`\Delta p_\ell`} w={40} h={18} className="text-[10px]" />
        <TeXLabel x={176} y={126} tex={p.xLabel} w={30} h={18} anchor="end" className="text-[10px]" />
        <TeXLabel x={104} y={20} tex={p.note} w={120} h={16} anchor="middle" className="text-[9px] text-ink-2" />
        <path d={curvePath(p.fn, p.range, sx, sy)} fill="none" stroke="var(--ink)" strokeWidth={2} />
        {p.pts.map((x) => (
          <circle key={x} cx={sx(x)} cy={sy(p.fn(x))} r={3.2} fill="var(--surface)" stroke="var(--ink)" strokeWidth={1.3} />
        ))}
      </svg>
      <div className="text-center text-xs font-semibold text-ink-3">{p.key}</div>
    </div>
  )
}

const collapsed = (x: number) => 0.07 + 0.9 * (1 - x) ** 2.6

/** Recreation of Lecture 13 slides 2–3 (qualitative: the slides have no axis scales). */
export function PipeSlideFigure() {
  const sx = (x: number) => 64 + x * 196
  const sy = (y: number) => 150 - y * 132
  return (
    <div className="space-y-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-ink-3">
        Slide 2 — one variable at a time (four separate experiments)
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-2 sm:grid-cols-4">
        {PANELS.map((p) => (
          <MiniPanel key={p.key} p={p} />
        ))}
      </div>
      <div className="flex flex-col items-center gap-1 py-1 text-center text-sm text-ink-2">
        <ArrowDown className="h-5 w-5 text-teal-600 dark:text-teal-300" aria-hidden />
        <span>
          regroup the five variables into two dimensionless products: <M tex={md`\dfrac{D\,\Delta p_\ell}{\rho V^2}`} /> and{' '}
          <M tex={md`\dfrac{\rho V D}{\mu}`} />
        </span>
      </div>
      <div className="text-xs font-semibold uppercase tracking-wide text-ink-3">Slide 3 — every data point on one curve</div>
      <div className="mx-auto max-w-md">
        <svg viewBox="0 0 280 184" className="h-auto w-full" role="img" aria-label="Collapsed curve: D times pressure drop per length over rho V squared against rho V D over mu">
          <line x1={60} y1={10} x2={60} y2={154} stroke="var(--plot-4)" strokeOpacity={0.7} strokeWidth={1.3} />
          <line x1={60} y1={154} x2={274} y2={154} stroke="var(--plot-4)" strokeOpacity={0.7} strokeWidth={1.3} />
          <TeXLabel x={2} y={26} tex={md`\dfrac{D\,\Delta p_\ell}{\rho V^2}`} w={56} h={40} className="text-[11px]" />
          <TeXLabel x={274} y={172} tex={md`\dfrac{\rho V D}{\mu}`} w={50} h={30} anchor="end" className="text-[11px]" />
          <path d={curvePath(collapsed, [0.04, 1], sx, sy)} fill="none" stroke="var(--ink)" strokeWidth={2.2} />
          {[0.1, 0.2, 0.32, 0.45, 0.6, 0.76, 0.9].map((x) => (
            <circle key={x} cx={sx(x)} cy={sy(collapsed(x))} r={3.6} fill="var(--surface)" stroke="var(--ink)" strokeWidth={1.4} />
          ))}
        </svg>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------------------------------------ MLT ↔ FLT */

function SysCard({ title, basic, derived, tone }: { title: string; basic: string; derived: string; tone: 'indigo' | 'amber' }) {
  return (
    <div
      className={cx(
        'min-w-0 flex-1 rounded-xl border p-3',
        tone === 'indigo'
          ? 'border-indigo-300 bg-indigo-50 dark:border-indigo-500/40 dark:bg-indigo-500/10'
          : 'border-amber-300 bg-amber-50 dark:border-amber-500/40 dark:bg-amber-500/10',
      )}
    >
      <div className="text-sm font-bold text-ink">{title}</div>
      <div className="mt-1 text-sm text-ink-2">
        basic: <M tex={basic} />
      </div>
      <div className="mt-1 text-sm text-ink-2">
        derived: <M tex={derived} />
      </div>
    </div>
  )
}

const CONVERSIONS: { name: string; mlt: string; sub: string; flt: string }[] = [
  { name: 'density ρ', mlt: md`\dimM\dimL^{-3}`, sub: md`(\dimF\dimL^{-1}\dimT^{2})\,\dimL^{-3}`, flt: md`\dimF\dimL^{-4}\dimT^{2}` },
  { name: 'viscosity μ', mlt: md`\dimM\dimL^{-1}\dimT^{-1}`, sub: md`(\dimF\dimL^{-1}\dimT^{2})\,\dimL^{-1}\dimT^{-1}`, flt: md`\dimF\dimL^{-2}\dimT` },
  { name: 'pressure drop per length Δpℓ', mlt: md`\dimM\dimL^{-2}\dimT^{-2}`, sub: md`(\dimF\dimL^{-1}\dimT^{2})\,\dimL^{-2}\dimT^{-2}`, flt: md`\dimF\dimL^{-3}` },
]

/** The two systems of basic dimensions and the conversion rule between them. */
export function MltFltDiagram() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
        <SysCard title="MLT system" basic={md`\dimM,\ \dimL,\ \dimT`} derived={md`\dimF \doteq \dimM\dimL\dimT^{-2}`} tone="indigo" />
        <div className="flex shrink-0 flex-col items-center px-1 text-center text-xs text-ink-3">
          <span className="font-semibold text-ink-2">Newton&apos;s 2nd law</span>
          <M tex={md`F = m\,a`} />
          <ArrowRight className="hidden h-5 w-5 text-teal-600 sm:block dark:text-teal-300" aria-hidden />
          <ArrowDown className="h-5 w-5 text-teal-600 sm:hidden dark:text-teal-300" aria-hidden />
        </div>
        <SysCard title="FLT system" basic={md`\dimF,\ \dimL,\ \dimT`} derived={md`\dimM \doteq \dimF\dimL^{-1}\dimT^{2}`} tone="amber" />
      </div>
      <div className="overflow-x-auto rounded-xl border border-line">
        <table className="w-full min-w-[420px] text-sm">
          <thead className="bg-surface-2 text-left text-xs uppercase tracking-wide text-ink-3">
            <tr>
              <th className="px-3 py-2 font-semibold">variable</th>
              <th className="px-3 py-2 font-semibold">MLT</th>
              <th className="px-3 py-2 font-semibold">replace M</th>
              <th className="px-3 py-2 font-semibold">FLT</th>
            </tr>
          </thead>
          <tbody>
            {CONVERSIONS.map((c) => (
              <tr key={c.name} className="border-t border-line">
                <td className="px-3 py-2 text-ink-2">{c.name}</td>
                <td className="px-3 py-2"><M tex={c.mlt} /></td>
                <td className="px-3 py-2"><M tex={c.sub} /></td>
                <td className="px-3 py-2 font-semibold"><M tex={c.flt} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------------------------------------ term scaling */

const TERMS: { title: string; tone: string; head: string; term: string; scale: string; coef: string; meaning: string }[] = [
  {
    title: 'Inertia',
    tone: 'border-indigo-300 bg-indigo-50 dark:border-indigo-500/40 dark:bg-indigo-500/10',
    head: 'text-indigo-700 dark:text-indigo-300',
    term: md`\rho\,u\pd{u}{x}`,
    scale: md`\dfrac{\rho V_\infty^2}{L}`,
    coef: md`1`,
    meaning: 'the yardstick every other force is measured against',
  },
  {
    title: 'Pressure',
    tone: 'border-cyan-300 bg-cyan-50 dark:border-cyan-500/40 dark:bg-cyan-500/10',
    head: 'text-cyan-700 dark:text-cyan-300',
    term: md`\pd{p}{x}`,
    scale: md`\dfrac{\rho V_\infty^2}{L}`,
    coef: md`1`,
    meaning: 'order one because p was scaled with ρV∞²',
  },
  {
    title: 'Viscous',
    tone: 'border-rose-300 bg-rose-50 dark:border-rose-500/40 dark:bg-rose-500/10',
    head: 'text-rose-700 dark:text-rose-300',
    term: md`\mu\dfrac{\partial^2 u}{\partial x^2}`,
    scale: md`\dfrac{\mu V_\infty}{L^2}`,
    coef: md`\dfrac{\mu}{\rho V_\infty L}=\dfrac{1}{Re}`,
    meaning: 'viscous force ÷ inertia force',
  },
  {
    title: 'Gravity',
    tone: 'border-emerald-300 bg-emerald-50 dark:border-emerald-500/40 dark:bg-emerald-500/10',
    head: 'text-emerald-700 dark:text-emerald-300',
    term: md`\rho g`,
    scale: md`\rho g`,
    coef: md`\dfrac{gL}{V_\infty^2}=\dfrac{1}{Fr^2}`,
    meaning: 'gravity force ÷ inertia force',
  },
]

/** Each term of Eqs. (7.2)/(7.3), its dimensional size after substituting Eq. (7.4), and its coefficient after ÷ ρV∞²/L. */
export function TermScalingFigure() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {TERMS.map((t) => (
          <div key={t.title} className={cx('flex min-w-0 flex-col items-center rounded-xl border p-2.5 text-center', t.tone)}>
            <div className={cx('text-xs font-bold uppercase tracking-wide', t.head)}>{t.title}</div>
            <div className="mt-1.5 text-[11px] text-ink-3">term in (7.2)/(7.3)</div>
            <M tex={t.term} className="text-ink" />
            <div className="mt-1.5 text-[11px] text-ink-3">size after Eq. (7.4)</div>
            <M tex={t.scale} className="text-ink" />
            <div className="my-1 flex items-center gap-1 text-[11px] font-semibold text-ink-2">
              <ArrowDown className="h-4 w-4" aria-hidden />
              <M tex={md`\div\ \rho V_\infty^2/L`} />
            </div>
            <div className="rounded-lg bg-surface px-2 py-1 shadow-sm">
              <M tex={t.coef} className="text-ink" />
            </div>
            <div className="mt-1.5 text-[11px] leading-snug text-ink-2">{t.meaning}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
