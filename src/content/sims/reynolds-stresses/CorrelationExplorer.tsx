import { useMemo, useState } from 'react'
import { Md, md, Readout, Segmented, SimPanel, Slider, num } from '@/kit'
import { FLUIDS, type FluidKey, SvgTeX, fixed } from './shared'

/** Fixed Gaussian base samples, so moving a slider morphs the same cloud instead of redrawing a new one. */
const NBASE = 1000
const BASE = (() => {
  const rnd = num.seededRandom(21)
  const g1: number[] = []
  const g2: number[] = []
  for (let i = 0; i < NBASE; i++) {
    g1.push(num.gaussian(rnd))
    g2.push(num.gaussian(rnd))
  }
  return { g1, g2 }
})()

// SVG geometry (square plotting area)
const X0 = 40
const X1 = 332
const Y0 = 8
const Y1 = 300
const CX = (X0 + X1) / 2
const CY = (Y0 + Y1) / 2
const HALF = (X1 - X0) / 2

function niceStep(L: number): number {
  const raw = L / 2.5
  const p = 10 ** Math.floor(Math.log10(raw))
  const m = raw / p
  return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p
}

/** Continuous version of Example 9.1: a cloud of (v'x, v'y) samples with adjustable correlation. */
export function CorrelationExplorer() {
  const [r, setR] = useState(-0.45)
  const [sx, setSx] = useState(0.8)
  const [sy, setSy] = useState(0.5)
  const [N, setN] = useState(300)
  const [fluid, setFluid] = useState<FluidKey>('air')

  const d = useMemo(() => {
    const n = Math.max(2, Math.min(NBASE, Math.round(N)))
    let m1 = 0
    let m2 = 0
    for (let i = 0; i < n; i++) {
      m1 += BASE.g1[i]
      m2 += BASE.g2[i]
    }
    m1 /= n
    m2 /= n
    const c = Math.sqrt(Math.max(0, 1 - r * r))
    const pts: [number, number][] = []
    let sxy = 0
    let sxx = 0
    let syy = 0
    let neg = 0
    for (let i = 0; i < n; i++) {
      const a = BASE.g1[i] - m1
      const b = BASE.g2[i] - m2
      const u = sx * a
      const v = sy * (r * a + c * b)
      pts.push([u, v])
      sxy += u * v
      sxx += u * u
      syy += v * v
      if (u * v < 0) neg++
    }
    const cov = sxy / n
    return { pts, cov, rmsx: Math.sqrt(sxx / n), rmsy: Math.sqrt(syy / n), slope: sxx > 0 ? sxy / sxx : 0, negShare: neg / n, n }
  }, [r, sx, sy, N])

  const L = 3.3 * Math.max(sx, sy)
  const px = (u: number) => CX + (u / L) * HALF
  const py = (v: number) => CY - (v / L) * HALF
  const step = niceStep(L)
  const ticks: number[] = []
  for (let t = step; t < L * 0.98; t += step) ticks.push(t)
  const rho = FLUIDS[fluid].rho
  const rs = d.rmsx * d.rmsy > 0 ? d.cov / (d.rmsx * d.rmsy) : 0
  const lineEnd = (u: number) => [px(u), py(d.slope * u)] as const
  const clipU = Math.abs(d.slope) > 1e-9 ? Math.min(L, L / Math.abs(d.slope)) : L
  const [lx1, ly1] = lineEnd(-clipU)
  const [lx2, ly2] = lineEnd(clipU)

  return (
    <SimPanel
      title="Correlation explorer"
      subtitle={md`continuous version of Example 9.1: $N$ samples of $(v_x', v_y')$`}
      wide
      controls={
        <>
          <Slider label={md`correlation $r_{xy}$`} value={r} min={-0.95} max={0.95} step={0.05} onChange={setR} digits={2} />
          <Slider label={md`RMS $\widetilde{v_x'}$`} value={sx} min={0.05} max={1.5} step={0.05} onChange={setSx} unit="m/s" digits={2} />
          <Slider label={md`RMS $\widetilde{v_y'}$`} value={sy} min={0.05} max={1.5} step={0.05} onChange={setSy} unit="m/s" digits={2} />
          <Slider label={md`samples $N$`} value={N} min={10} max={1000} log onChange={(v) => setN(Math.round(v))} format={(v) => String(Math.round(v))} />
          <Segmented label="fluid" options={[{ value: 'air', label: 'air (1.2 kg/m³)' }, { value: 'water', label: 'water (998 kg/m³)' }]} value={fluid} onChange={(v) => setFluid(v as FluidKey)} />
        </>
      }
      readout={
        <Readout
          items={[
            { label: md`$\avg{v_x'v_y'}$ (samples)`, value: fixed(d.cov, 4), unit: 'm²/s²', tone: 'accent' },
            { label: md`expected $r_{xy}\widetilde{v_x'}\widetilde{v_y'}$`, value: fixed(r * sx * sy, 4), unit: 'm²/s²' },
            { label: md`sample $r_{xy}$`, value: fixed(rs, 3) },
            { label: 'share in Q2 + Q4', value: `${Math.round(d.negShare * 100)} %` },
            { label: md`$\tau^t_{yx}=-\rho\avg{v_x'v_y'}$`, value: -rho * d.cov, unit: 'Pa', digits: 3, tone: 'good' },
          ]}
        />
      }
      footer={
        <Md>{md`**Try this:** drag $r_{xy}$ from $+0.9$ to $-0.9$ and watch the cloud tilt out of Q1/Q3 into Q2/Q4 — the averaged product, and with it the Reynolds stress, changes sign. At $r_{xy}=0$ the cloud is untilted and $\avg{v_x'v_y'}\approx0$ although the fluctuations are as strong as ever (the "independent" case of Table E9.1). Now drop $N$ to about 15: the estimate becomes noisy — this is why the averaging time must be long compared with the fluctuations.`}</Md>
      }
    >
      <svg viewBox="0 0 340 336" className="mx-auto h-auto w-full max-w-[460px]" role="img" aria-label="Scatter plot of velocity-fluctuation pairs coloured by the sign of their product">
        <rect x={CX} y={Y0} width={HALF} height={HALF} fill="var(--plot-5)" opacity={0.08} />
        <rect x={X0} y={CY} width={HALF} height={HALF} fill="var(--plot-5)" opacity={0.08} />
        <rect x={X0} y={Y0} width={HALF} height={HALF} fill="var(--plot-4)" opacity={0.07} />
        <rect x={CX} y={CY} width={HALF} height={HALF} fill="var(--plot-4)" opacity={0.07} />
        <rect x={X0} y={Y0} width={X1 - X0} height={Y1 - Y0} fill="none" stroke="var(--line)" />
        {ticks.flatMap((t) => [
          <line key={`gx${t}`} x1={px(t)} x2={px(t)} y1={Y0} y2={Y1} stroke="var(--grid)" />,
          <line key={`gx-${t}`} x1={px(-t)} x2={px(-t)} y1={Y0} y2={Y1} stroke="var(--grid)" />,
          <line key={`gy${t}`} y1={py(t)} y2={py(t)} x1={X0} x2={X1} stroke="var(--grid)" />,
          <line key={`gy-${t}`} y1={py(-t)} y2={py(-t)} x1={X0} x2={X1} stroke="var(--grid)" />,
          <text key={`tx${t}`} x={px(t)} y={Y1 + 12} textAnchor="middle" className="fill-ink-3 text-[9px]">{+t.toPrecision(3)}</text>,
          <text key={`tx-${t}`} x={px(-t)} y={Y1 + 12} textAnchor="middle" className="fill-ink-3 text-[9px]">−{+t.toPrecision(3)}</text>,
          <text key={`ty${t}`} x={X0 - 4} y={py(t) + 3} textAnchor="end" className="fill-ink-3 text-[9px]">{+t.toPrecision(3)}</text>,
          <text key={`ty-${t}`} x={X0 - 4} y={py(-t) + 3} textAnchor="end" className="fill-ink-3 text-[9px]">−{+t.toPrecision(3)}</text>,
        ])}
        <line x1={X0} x2={X1} y1={CY} y2={CY} stroke="var(--ink-3)" />
        <line x1={CX} x2={CX} y1={Y0} y2={Y1} stroke="var(--ink-3)" />
        <g>
          {d.pts.map(([u, v], i) =>
            Math.abs(u) < L && Math.abs(v) < L ? (
              <circle key={i} cx={px(u)} cy={py(v)} r={d.n > 400 ? 2 : 2.8} fill={u * v >= 0 ? 'var(--plot-5)' : 'var(--plot-4)'} opacity={0.75} />
            ) : null,
          )}
        </g>
        <line x1={lx1} y1={ly1} x2={lx2} y2={ly2} stroke="var(--plot-1)" strokeWidth={2} strokeDasharray="7 5" />
        <text x={X1 - 6} y={Y0 + 14} textAnchor="end" className="fill-ink-2 text-[10px] font-semibold">Q1 (+)</text>
        <text x={X0 + 6} y={Y0 + 14} className="fill-ink-2 text-[10px] font-semibold">Q2 (−)</text>
        <text x={X0 + 6} y={Y1 - 6} className="fill-ink-2 text-[10px] font-semibold">Q3 (+)</text>
        <text x={X1 - 6} y={Y1 - 6} textAnchor="end" className="fill-ink-2 text-[10px] font-semibold">Q4 (−)</text>
        <SvgTeX x={(X0 + X1) / 2} y={Y1 + 26} tex={md`v_x'\ \ (\mathrm{m/s})`} w={140} h={18} size={11} />
        <g transform={`translate(10 ${CY}) rotate(-90)`}>
          <SvgTeX x={0} y={0} tex={md`v_y'\ \ (\mathrm{m/s})`} w={140} h={18} size={11} />
        </g>
      </svg>
      <div className="mt-1 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-ink-2">
        <span className="inline-flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-full bg-[var(--plot-5)]" /> product &gt; 0</span>
        <span className="inline-flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-full bg-[var(--plot-4)]" /> product &lt; 0</span>
        <span className="inline-flex items-center gap-1.5"><span className="inline-block h-0.5 w-5 border-t-2 border-dashed border-[var(--plot-1)]" /> best-fit line through the origin</span>
      </div>
    </SimPanel>
  )
}
