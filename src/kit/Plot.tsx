import { useMemo, useState, type ReactNode } from 'react'
import { scaleLinear, scaleLog } from 'd3-scale'
import { area as d3area, line as d3line } from 'd3-shape'
import { superscript } from '@/lib/math'
import { useElementSize, useUid } from './hooks'
import { Md, renderTeX } from './Md'

export interface Axis {
  /** Text; may include $TeX$ segments, e.g. '$y^+$ (log scale)'. */
  label?: string
  domain: [number, number]
  log?: boolean
  ticks?: number
  format?: (v: number) => string
}

export interface Series {
  label?: string
  /** Function sampled across the x-domain (or `range`). */
  fn?: (x: number) => number
  /** Explicit data points. */
  points?: [number, number][]
  samples?: number
  range?: [number, number]
  color?: string
  width?: number
  dash?: string
  kind?: 'line' | 'scatter' | 'area'
  opacity?: number
  hideInLegend?: boolean
}

export interface PlotCtx {
  sx: (v: number) => number
  sy: (v: number) => number
  width: number
  height: number
}

export interface PlotProps {
  x: Axis
  y: Axis
  series: Series[]
  height?: number
  title?: string
  vlines?: { x: number; label?: string; color?: string; dash?: string }[]
  hlines?: { y: number; label?: string; color?: string; dash?: string }[]
  /** Shaded x-intervals (e.g. viscous sublayer / buffer zone). */
  bands?: { x0: number; x1: number; label?: string; color?: string }[]
  /** Highlighted points (operating point, data). */
  marks?: { x: number; y: number; label?: string; color?: string }[]
  legend?: boolean
  crosshair?: boolean
  /** Extra SVG drawn inside the plotting area (clipped), in data coordinates via ctx.sx/sy. */
  overlay?: (ctx: PlotCtx) => ReactNode
}

export const PALETTE = ['var(--plot-1)', 'var(--plot-2)', 'var(--plot-3)', 'var(--plot-4)', 'var(--plot-5)', 'var(--plot-6)', 'var(--plot-7)', 'var(--plot-8)']

type Scale = ((v: number) => number) & { invert(v: number): number; ticks(n?: number): number[] }

function makeScale(axis: Axis, range: [number, number]): Scale {
  const s = axis.log ? scaleLog().domain(axis.domain).range(range) : scaleLinear().domain(axis.domain).range(range)
  return s as unknown as Scale
}

function fmtTick(v: number, log?: boolean): string {
  if (v === 0) return '0'
  const a = Math.abs(v)
  const e = Math.floor(Math.log10(a) + 1e-9)
  if (log && Math.abs(a / 10 ** e - 1) < 1e-6 && (e >= 4 || e <= -3)) return `10${superscript(e)}`
  if (a >= 1e5 || a < 1e-3) {
    const m = v / 10 ** e
    return `${+m.toFixed(1)}×10${superscript(e)}`
  }
  return String(+v.toPrecision(4)).replace('-', '−')
}

function ticksFor(axis: Axis, s: Scale): { major: number[]; minor: number[] } {
  if (!axis.log) return { major: s.ticks(axis.ticks ?? 6), minor: [] }
  const all = s.ticks()
  const [a, b] = axis.domain
  const decades = Math.log10(b / a)
  const isPow = (v: number) => Math.abs(Math.log10(v) - Math.round(Math.log10(v))) < 1e-9
  const major = all.filter((v) => {
    if (isPow(v)) return true
    if (decades <= 2.2) {
      const m = v / 10 ** Math.floor(Math.log10(v) + 1e-9)
      return Math.abs(m - 2) < 1e-6 || Math.abs(m - 5) < 1e-6
    }
    return false
  })
  return { major, minor: all.filter((v) => !major.includes(v)) }
}

/** Mixed text + $TeX$ label → HTML string. */
export function labelHTML(label: string): string {
  return label
    .split('$')
    .map((seg, i) => (i % 2 ? renderTeX(seg) : seg.replace(/&/g, '&amp;').replace(/</g, '&lt;')))
    .join('')
}

/** Responsive 2-D line/scatter plot with linear or log axes and a hover crosshair. */
export function Plot({
  x, y, series, height = 300, title, vlines, hlines, bands, marks, legend = true, crosshair = true, overlay,
}: PlotProps) {
  const [ref, size] = useElementSize<HTMLDivElement>()
  const clip = useUid('clip')
  const W = Math.max(280, size.width || 640)
  const H = height
  const m = { top: 12, right: 16, bottom: x.label ? 46 : 30, left: y.label ? 62 : 46 }
  const iw = W - m.left - m.right
  const ih = H - m.top - m.bottom
  const sx = useMemo(() => makeScale(x, [0, iw]), [x.domain[0], x.domain[1], x.log, iw]) // eslint-disable-line react-hooks/exhaustive-deps
  const sy = useMemo(() => makeScale(y, [ih, 0]), [y.domain[0], y.domain[1], y.log, ih]) // eslint-disable-line react-hooks/exhaustive-deps
  const [hx, setHx] = useState<number | null>(null)

  const sampled = useMemo(
    () =>
      series.map((s) => {
        if (s.points) return s.points
        if (!s.fn) return []
        const [a, b] = s.range ?? x.domain
        const n = s.samples ?? 320
        const pts: [number, number][] = []
        for (let i = 0; i < n; i++) {
          const t = i / (n - 1)
          const xv = x.log ? 10 ** (Math.log10(a) + t * (Math.log10(b) - Math.log10(a))) : a + t * (b - a)
          pts.push([xv, s.fn(xv)])
        }
        return pts
      }),
    [series, x.domain, x.log],
  )

  const lim = (v: number) => Math.max(-10 * ih, Math.min(11 * ih, v))
  const ok = (p: [number, number]) => Number.isFinite(p[0]) && Number.isFinite(p[1]) && (!x.log || p[0] > 0) && (!y.log || p[1] > 0)
  const lineGen = d3line<[number, number]>()
    .defined(ok)
    .x((p) => sx(p[0]))
    .y((p) => lim(sy(p[1])))
  const areaGen = d3area<[number, number]>()
    .defined(ok)
    .x((p) => sx(p[0]))
    .y0(() => sy(y.log ? y.domain[0] : Math.max(y.domain[0], Math.min(0, y.domain[1]))))
    .y1((p) => lim(sy(p[1])))

  const xt = ticksFor(x, sx)
  const yt = ticksFor(y, sy)
  const color = (i: number) => series[i].color ?? PALETTE[i % PALETTE.length]

  const onMove = (e: React.PointerEvent<SVGRectElement>) => {
    const r = (e.currentTarget as SVGRectElement).getBoundingClientRect()
    const px = e.clientX - r.left
    if (px < 0 || px > iw) return setHx(null)
    setHx(sx.invert(px))
  }

  const hoverRows =
    hx == null
      ? []
      : series
          .map((s, i) => {
            if (s.hideInLegend && !s.label) return null
            let yv: number | null = null
            let xv = hx
            if (s.fn) yv = s.fn(hx)
            else if (s.points?.length) {
              let best = s.points[0]
              for (const p of s.points) if (Math.abs(sx(p[0]) - sx(hx)) < Math.abs(sx(best[0]) - sx(hx))) best = p
              if (Math.abs(sx(best[0]) - sx(hx)) > 24) return null
              xv = best[0]
              yv = best[1]
            }
            if (yv == null || !Number.isFinite(yv)) return null
            return { i, label: s.label ?? `series ${i + 1}`, x: xv, y: yv }
          })
          .filter((r): r is { i: number; label: string; x: number; y: number } => r != null)

  const xFmt = x.format ?? ((v: number) => fmtTick(v, x.log))
  const yFmt = y.format ?? ((v: number) => fmtTick(v, y.log))
  const legendItems = series.map((s, i) => ({ s, i })).filter(({ s }) => s.label && !s.hideInLegend)

  return (
    <div ref={ref} className="plot w-full select-none">
      {title ? <div className="mb-1 text-sm font-semibold text-ink"><Md inline>{title}</Md></div> : null}
      {legend && legendItems.length ? (
        <div className="mb-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-2">
          {legendItems.map(({ s, i }) => (
            <span key={i} className="inline-flex items-center gap-1.5">
              <svg width="22" height="10" aria-hidden>
                {s.kind === 'scatter' ? (
                  <circle cx="11" cy="5" r="3.5" fill={color(i)} />
                ) : (
                  <line x1="1" x2="21" y1="5" y2="5" stroke={color(i)} strokeWidth={s.width ?? 2.2} strokeDasharray={s.dash} />
                )}
              </svg>
              <Md inline>{s.label!}</Md>
            </span>
          ))}
        </div>
      ) : null}
      <svg width={W} height={H} className="block max-w-full overflow-visible" role="img" aria-label={title ?? 'plot'}>
        <defs>
          <clipPath id={clip}>
            <rect x={0} y={0} width={iw} height={ih} />
          </clipPath>
        </defs>
        <g transform={`translate(${m.left},${m.top})`}>
          {bands?.map((b, i) => {
            const x0 = Math.max(0, sx(b.x0))
            const x1 = Math.min(iw, sx(b.x1))
            return (
              <g key={`b${i}`}>
                <rect x={x0} y={0} width={Math.max(0, x1 - x0)} height={ih} fill={b.color ?? 'var(--band)'} />
                {b.label ? (
                  <text x={(x0 + x1) / 2} y={12} textAnchor="middle" className="fill-ink-3 text-[10px] font-semibold">
                    {b.label}
                  </text>
                ) : null}
              </g>
            )
          })}
          {xt.minor.map((v) => (
            <line key={`xm${v}`} x1={sx(v)} x2={sx(v)} y1={0} y2={ih} stroke="var(--grid)" strokeOpacity={0.45} />
          ))}
          {yt.minor.map((v) => (
            <line key={`ym${v}`} y1={sy(v)} y2={sy(v)} x1={0} x2={iw} stroke="var(--grid)" strokeOpacity={0.45} />
          ))}
          {xt.major.map((v) => (
            <g key={`x${v}`}>
              <line x1={sx(v)} x2={sx(v)} y1={0} y2={ih} stroke="var(--grid)" />
              <text x={sx(v)} y={ih + 16} textAnchor="middle" className="fill-ink-3 text-[11px]">
                {xFmt(v)}
              </text>
            </g>
          ))}
          {yt.major.map((v) => (
            <g key={`y${v}`}>
              <line y1={sy(v)} y2={sy(v)} x1={0} x2={iw} stroke="var(--grid)" />
              <text x={-8} y={sy(v)} dy="0.32em" textAnchor="end" className="fill-ink-3 text-[11px]">
                {yFmt(v)}
              </text>
            </g>
          ))}
          <rect x={0} y={0} width={iw} height={ih} fill="none" stroke="var(--axis)" strokeOpacity={0.5} />

          <g clipPath={`url(#${clip})`}>
            {hlines?.map((h, i) => (
              <g key={`h${i}`}>
                <line x1={0} x2={iw} y1={sy(h.y)} y2={sy(h.y)} stroke={h.color ?? 'var(--axis)'} strokeDasharray={h.dash ?? '5 4'} strokeWidth={1.3} />
                {h.label ? (
                  <text x={iw - 4} y={sy(h.y) - 4} textAnchor="end" className="fill-ink-2 text-[10.5px] font-medium">
                    {h.label}
                  </text>
                ) : null}
              </g>
            ))}
            {vlines?.map((v, i) => (
              <g key={`v${i}`}>
                <line x1={sx(v.x)} x2={sx(v.x)} y1={0} y2={ih} stroke={v.color ?? 'var(--axis)'} strokeDasharray={v.dash ?? '5 4'} strokeWidth={1.3} />
                {v.label ? (
                  <text x={sx(v.x) + 4} y={14} className="fill-ink-2 text-[10.5px] font-medium">
                    {v.label}
                  </text>
                ) : null}
              </g>
            ))}
            {sampled.map((pts, i) => {
              const s = series[i]
              if (s.kind === 'scatter')
                return (
                  <g key={i} fill={color(i)} opacity={s.opacity ?? 1}>
                    {pts.filter(ok).map((p, k) => (
                      <circle key={k} cx={sx(p[0])} cy={sy(p[1])} r={3.4} />
                    ))}
                  </g>
                )
              if (s.kind === 'area')
                return <path key={i} d={areaGen(pts) ?? ''} fill={color(i)} opacity={s.opacity ?? 0.18} stroke="none" />
              return (
                <path
                  key={i}
                  d={lineGen(pts) ?? ''}
                  fill="none"
                  stroke={color(i)}
                  strokeWidth={s.width ?? 2.2}
                  strokeDasharray={s.dash}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  opacity={s.opacity ?? 1}
                />
              )
            })}
            {overlay?.({ sx, sy, width: iw, height: ih })}
            {marks?.filter((mk) => Number.isFinite(sx(mk.x)) && Number.isFinite(sy(mk.y))).map((mk, i) => (
              <g key={`m${i}`}>
                <circle cx={sx(mk.x)} cy={sy(mk.y)} r={5} fill={mk.color ?? 'var(--plot-4)'} stroke="var(--surface)" strokeWidth={2} />
                {mk.label ? (
                  <text x={sx(mk.x) + 8} y={sy(mk.y) - 8} className="fill-ink text-[11px] font-semibold">
                    {mk.label}
                  </text>
                ) : null}
              </g>
            ))}
          </g>

          {crosshair && hx != null ? (
            <g pointerEvents="none">
              <line x1={sx(hx)} x2={sx(hx)} y1={0} y2={ih} stroke="var(--axis)" strokeOpacity={0.6} />
              {hoverRows.map((r) => (
                <circle key={r.i} cx={sx(r.x)} cy={lim(sy(r.y))} r={4} fill={color(r.i)} stroke="var(--surface)" strokeWidth={1.5} />
              ))}
            </g>
          ) : null}

          {x.label ? (
            <foreignObject x={0} y={ih + 22} width={iw} height={22}>
              <div className="axis-label text-center text-xs font-medium text-ink-2" dangerouslySetInnerHTML={{ __html: labelHTML(x.label) }} />
            </foreignObject>
          ) : null}
          {y.label ? (
            <g transform="rotate(-90)">
              <foreignObject x={-ih} y={-m.left + 2} width={ih} height={22}>
                <div className="axis-label text-center text-xs font-medium text-ink-2" dangerouslySetInnerHTML={{ __html: labelHTML(y.label) }} />
              </foreignObject>
            </g>
          ) : null}

          {crosshair ? (
            <rect
              x={0}
              y={0}
              width={iw}
              height={ih}
              fill="transparent"
              onPointerMove={onMove}
              onPointerLeave={() => setHx(null)}
              style={{ touchAction: 'pan-y' }}
            />
          ) : null}
        </g>
      </svg>
      {crosshair && hx != null && hoverRows.length ? (
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 rounded-lg bg-surface-2 px-3 py-1.5 font-mono text-[11.5px] text-ink-2">
          <span>x = {fmtTick(hoverRows[0].x)}</span>
          {hoverRows.map((r) => (
            <span key={r.i} className="inline-flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full" style={{ background: color(r.i) }} />
              <Md inline>{r.label}</Md>: {fmtTick(r.y)}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  )
}
