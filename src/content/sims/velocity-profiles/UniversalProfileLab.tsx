import { useRef, useState, type PointerEvent } from 'react'
import { Md, Plot, Readout, Segmented, SimPanel, Slider, Toggle, md, type PlotCtx, type Series } from '@/kit'
import {
  LAUFER_5E4, LAUFER_5E5, REGION_LABEL, SLEICHER_MAX, Y_JUNCTION, regionOf, vLog, vSleicher, vThree, vTwoPiece,
} from './profiles'

type Mode = 'loglog' | 'semilog' | 'linear'

const DOMAINS: Record<Mode, { x: [number, number]; y: [number, number]; xLog: boolean; yLog: boolean }> = {
  loglog: { x: [1, 1e4], y: [1, 100], xLog: true, yLog: true },
  semilog: { x: [1, 1e4], y: [0, 30], xLog: true, yLog: false },
  linear: { x: [0, 60], y: [0, 20], xLog: false, yLog: false },
}

const band = (c: string, pct: number) => `color-mix(in srgb, var(${c}) ${pct}%, transparent)`

/** Draggable vertical probe drawn inside a kit <Plot> overlay (crosshair disabled). */
function ProbeLayer({
  ctx, domain, log, value, onChange,
}: {
  ctx: PlotCtx
  domain: [number, number]
  log: boolean
  value: number
  onChange: (v: number) => void
}) {
  const drag = useRef(false)
  const inv = (f: number) =>
    log
      ? 10 ** (Math.log10(domain[0]) + f * (Math.log10(domain[1]) - Math.log10(domain[0])))
      : domain[0] + f * (domain[1] - domain[0])
  const set = (e: PointerEvent<SVGRectElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    if (!(r.width > 0)) return
    const f = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width))
    onChange(inv(f))
  }
  const inside = value >= domain[0] && value <= domain[1] && (!log || value > 0)
  const x = inside ? ctx.sx(value) : -100
  return (
    <g>
      {inside ? (
        <g pointerEvents="none">
          <line x1={x} x2={x} y1={0} y2={ctx.height} stroke="var(--ink-2)" strokeWidth={1.6} strokeDasharray="6 4" />
          <rect x={x - 8} y={ctx.height - 26} width={16} height={22} rx={5} fill="var(--surface)" stroke="var(--ink-2)" strokeWidth={1.4} />
          <line x1={x - 2.5} x2={x - 2.5} y1={ctx.height - 20} y2={ctx.height - 10} stroke="var(--ink-2)" strokeWidth={1.2} />
          <line x1={x + 2.5} x2={x + 2.5} y1={ctx.height - 20} y2={ctx.height - 10} stroke="var(--ink-2)" strokeWidth={1.2} />
        </g>
      ) : null}
      <rect
        x={0}
        y={0}
        width={ctx.width}
        height={ctx.height}
        fill="transparent"
        style={{ cursor: 'ew-resize', touchAction: 'pan-y' }}
        onPointerDown={(e) => {
          drag.current = true
          e.currentTarget.setPointerCapture?.(e.pointerId)
          set(e)
        }}
        onPointerMove={(e) => {
          if (drag.current) set(e)
        }}
        onPointerUp={(e) => {
          drag.current = false
          e.currentTarget.releasePointerCapture?.(e.pointerId)
        }}
        onPointerCancel={() => {
          drag.current = false
        }}
      />
    </g>
  )
}

/** Universal velocity profile lab: two-piece, three-region and Sleicher forms on log–log / semi-log / linear axes. */
export function UniversalProfileLab() {
  const [mode, setMode] = useState<Mode>('loglog')
  const [two, setTwo] = useState(true)
  const [three, setThree] = useState(true)
  const [sle, setSle] = useState(false)
  const [data, setData] = useState(false)
  const [probe, setProbe] = useState(15)

  const D = DOMAINS[mode]
  const lo = mode === 'linear' ? 0 : 1
  const hi = D.x[1]
  const changeMode = (m: Mode) => {
    setMode(m)
    if (m === 'linear' && probe > 60) setProbe(20)
  }

  const series: Series[] = []
  if (two) {
    series.push({ label: 'two-piece: $v_z^+=y^+$ then $5.5+2.5\\ln y^+$', fn: vTwoPiece, range: [lo, hi], color: 'var(--plot-1)', width: 2.6 })
    series.push({ fn: (y) => y, range: [Y_JUNCTION, 40], color: 'var(--plot-1)', dash: '3 4', width: 1.3, opacity: 0.55, hideInLegend: true })
    series.push({ fn: vLog, range: [mode === 'linear' ? 1.6 : 1, Y_JUNCTION], color: 'var(--plot-1)', dash: '3 4', width: 1.3, opacity: 0.55, hideInLegend: true })
  }
  if (three) series.push({ label: 'three-region (9.44)–(9.46)', fn: vThree, range: [lo, hi], color: 'var(--plot-3)', dash: '9 5', width: 2.4 })
  if (sle) {
    series.push({ label: 'Sleicher (9.47)', fn: vSleicher, range: [lo, 30], color: 'var(--plot-5)', width: 2.4 })
    series.push({ fn: vSleicher, range: [30, hi], color: 'var(--plot-5)', dash: '2 4', width: 1.4, opacity: 0.6, hideInLegend: true })
  }
  if (data) {
    series.push({ label: 'Laufer $\\mathrm{Re}_U=5\\times10^4$ (Fox Fig. 8.9)', points: LAUFER_5E4, kind: 'scatter', color: 'var(--plot-7)' })
    series.push({ label: 'Laufer $\\mathrm{Re}_U=5\\times10^5$', points: LAUFER_5E5, kind: 'scatter', color: 'var(--plot-6)' })
  }

  const v2 = vTwoPiece(probe)
  const v3 = vThree(probe)
  const vs = vSleicher(probe)
  const marks: { x: number; y: number; label?: string; color?: string }[] = []
  if (two) marks.push({ x: probe, y: v2, color: 'var(--plot-1)' })
  if (three) marks.push({ x: probe, y: v3, color: 'var(--plot-3)' })
  if (sle && probe <= 30) marks.push({ x: probe, y: vs, color: 'var(--plot-5)' })
  if (two && mode !== 'semilog') marks.push({ x: Y_JUNCTION, y: Y_JUNCTION, label: 'y⁺ = 11.6', color: 'var(--plot-8)' })

  const bands =
    mode === 'linear'
      ? [
          { x0: 0, x1: 5, label: 'sublayer', color: band('--plot-5', 12) },
          { x0: 5, x1: 30, label: 'buffer', color: band('--plot-3', 12) },
          { x0: 30, x1: 60, label: 'core', color: band('--plot-1', 7) },
        ]
      : [
          { x0: 1, x1: 5, label: 'sublayer', color: band('--plot-5', 12) },
          { x0: 5, x1: 30, label: 'buffer', color: band('--plot-3', 12) },
          { x0: 30, x1: 1e4, label: 'turbulent core', color: band('--plot-1', 7) },
        ]

  return (
    <SimPanel
      title="Universal velocity profile lab"
      subtitle="drag the dashed probe across the plot"
      wide
      src={{ doc: 'wilkes', pages: '496–497', note: 'Eqs. (9.42)–(9.47), Fig. 9.9' }}
      controls={
        <>
          <Segmented<Mode>
            label="Axes"
            value={mode}
            onChange={changeMode}
            options={[
              { value: 'loglog', label: 'log–log (Fig. 9.9)' },
              { value: 'semilog', label: 'semi-log' },
              { value: 'linear', label: 'linear, near wall' },
            ]}
          />
          <Toggle label="two-piece (9.42) + (9.43)" checked={two} onChange={setTwo} />
          <Toggle label="three-region (9.44)–(9.46)" checked={three} onChange={setThree} />
          <Toggle label="Sleicher (9.47)" checked={sle} onChange={setSle} />
          <Toggle label="Laufer data (Fox, cross-ref.)" checked={data} onChange={setData} />
          <Slider
            label="probe $y^+$"
            value={probe}
            min={mode === 'linear' ? 0.5 : 1}
            max={mode === 'linear' ? 60 : 1e4}
            log
            onChange={setProbe}
            digits={3}
          />
        </>
      }
      readout={
        <Readout
          cols={2}
          items={[
            { label: 'probe $y^+$', value: probe, digits: 3 },
            { label: 'region', value: REGION_LABEL[regionOf(probe)], tone: 'accent' },
            { label: '$v_z^+$ two-piece', value: v2, digits: 4 },
            { label: '$v_z^+$ three-region', value: v3, digits: 4 },
            {
              label: '$v_z^+$ Sleicher',
              value: probe <= 30 ? vs.toFixed(2) : `${vs.toFixed(2)} (outside its range)`,
              tone: probe <= 30 ? 'default' : 'bad',
            },
            { label: 'two-piece − three-region', value: v2 - v3, digits: 2, tone: Math.abs(v2 - v3) > 1 ? 'bad' : 'good' },
          ]}
        />
      }
      footer={
        <Md className="md-tight">{md`**Try this:** drag the probe to $y^+ \approx 11.6$. The two-piece model has a sharp corner there, while the buffer law ($v_z^+ = 9.22$) and Sleicher's curve ($9.06$) round it off about 2.4–2.6 units lower. Switch to **semi-log**: the core law becomes a straight line rising $2.5\ln 10 = 5.76$ for every factor of 10 in $y^+$. Turn on **Laufer data**: the measurements hug $v_z^+ = y^+$ below about 5, bend through the buffer, follow the log law, and lift slightly above it near the centreline (the last point of each set). Sleicher's curve flattens towards ${SLEICHER_MAX.toFixed(2)}$, which is why it is only meant for $y^+ \lesssim 30$.`}</Md>
      }
    >
      <Plot
        height={340}
        crosshair={false}
        x={{ label: '$y^+ = y\\sqrt{\\tau_w/\\rho}\\,/\\,\\nu$' + (D.xLog ? ' (log scale)' : ''), domain: D.x, log: D.xLog }}
        y={{ label: '$v_z^+ = \\overline{v}_z/\\sqrt{\\tau_w/\\rho}$', domain: D.y, log: D.yLog }}
        series={series}
        bands={bands}
        marks={marks}
        overlay={(ctx) => <ProbeLayer ctx={ctx} domain={D.x} log={D.xLog} value={probe} onChange={setProbe} />}
      />
      <p className="mt-2 text-xs text-ink-3">
        Log–log axes reproduce Wilkes&apos; Fig. 9.9; semi-log is the more common presentation (the log law is then a straight line).
        Laufer&apos;s points are read off Fox &amp; McDonald&apos;s Fig. 8.9 (approximate) and are shown only as a cross-reference — Wilkes&apos; figure has no data points.
      </p>
    </SimPanel>
  )
}
