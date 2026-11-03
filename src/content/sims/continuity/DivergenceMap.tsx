import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useAnimationFrame, useElementSize, usePrefersReducedMotion, useUid } from '@/kit'
import { AX, polygonArea, useOnScreen } from './shared'

export type V2 = [number, number]

export interface MapCtx {
  sx: (x: number) => number
  sy: (y: number) => number
  /** pixels per metre */
  k: number
}

export interface DivergenceMapProps {
  x: [number, number]
  y: [number, number]
  /** Velocity (u, v) in the plotted plane; t in seconds (ignored by steady fields). */
  vel: (x: number, y: number, t: number) => V2
  /** Full divergence ∂u/∂x + ∂v/∂y + ∂w/∂z at (x, y) — may include an out-of-plane ∂w/∂z. */
  div: (x: number, y: number, t: number) => number
  /**
   * Out-of-plane stretching rate ∂w/∂z (1/s) at (x, y, t). Each material square tracks its depth with it
   * (d ln h/dt = ∂w/∂z), so the square's colour shows the change of its VOLUME (area × depth) — not just of its
   * x–y cross-section. Omit for plane flows (depth constant).
   */
  dwdz?: (x: number, y: number, t: number) => number
  /** Recompute arrows and colours every frame (time-dependent fields). */
  unsteady?: boolean
  /** |∇·V| (1/s) that gives full colour. */
  divScale?: number
  /** Points excluded from the plot (singular core, solid body). */
  mask?: (x: number, y: number) => boolean
  /** Draw a solid disc of this radius at the origin (cylinder / singular core). */
  disc?: number
  arrows?: number
  tracers?: boolean
  seeds?: V2[]
  tracerHalf?: number
  /** simulated seconds before the material squares restart */
  life?: number
  /** simulated seconds per real second */
  timeScale?: number
  probe?: V2 | null
  onProbe?: (p: V2) => void
  onTime?: (t: number) => void
  overlay?: (ctx: MapCtx) => ReactNode
  maxHeight?: number
  paused?: boolean
}

const GRID = 32

function squarePoly(cx: number, cy: number, h: number): V2[] {
  const pts: V2[] = []
  const n = 3 // points per edge
  for (let i = 0; i < n; i++) pts.push([cx - h + (2 * h * i) / n, cy - h])
  for (let i = 0; i < n; i++) pts.push([cx + h, cy - h + (2 * h * i) / n])
  for (let i = 0; i < n; i++) pts.push([cx + h - (2 * h * i) / n, cy + h])
  for (let i = 0; i < n; i++) pts.push([cx - h, cy + h - (2 * h * i) / n])
  return pts
}

/**
 * Divergence colour map (rose = expansion, indigo = compression, blank = ∇·V = 0) with velocity arrows,
 * optional advected material squares whose volume change (x–y area × depth) visualises ∇·V, and a click-to-probe marker.
 */
export function DivergenceMap(props: DivergenceMapProps) {
  const {
    x: [x0, x1], y: [y0, y1], vel, div, dwdz, unsteady = false, divScale = 3, mask, disc, arrows = 15, tracers = true, seeds,
    tracerHalf = 0.13, life = 1.6, timeScale = 0.55, probe, onProbe, onTime, overlay, maxHeight = 420, paused = false,
  } = props
  const [ref, size] = useElementSize<HTMLDivElement>()
  const uid = useUid('dm')
  const W = Math.max(260, size.width || 560)
  const aspect = (y1 - y0) / (x1 - x0)
  const H = Math.min(maxHeight, W * aspect)
  const plotW = H / aspect
  const offX = (W - plotW) / 2
  const k = plotW / (x1 - x0)
  const sx = (v: number) => offX + (v - x0) * k
  const sy = (v: number) => H - (v - y0) * k
  const inv = (px: number, py: number): V2 => [x0 + (px - offX) / k, y0 + (H - py) / k]

  const visible = useOnScreen(ref)
  const reduced = usePrefersReducedMotion()
  const running = visible && !reduced && !paused
  const [clock, setClock] = useState(0)
  const clockRef = useRef(0)
  const tClock = unsteady ? clock : 0

  // ---------- divergence colour cells ----------
  const cells = useMemo(() => {
    const nx = GRID
    const ny = Math.max(8, Math.round(GRID * aspect))
    const dx = (x1 - x0) / nx
    const dy = (y1 - y0) / ny
    const out: { i: number; j: number; d: number }[] = []
    let mn = Infinity
    let mx = -Infinity
    for (let j = 0; j < ny; j++)
      for (let i = 0; i < nx; i++) {
        const X = x0 + (i + 0.5) * dx
        const Y = y0 + (j + 0.5) * dy
        if (mask?.(X, Y)) continue
        const d = div(X, Y, tClock)
        if (!Number.isFinite(d)) continue
        mn = Math.min(mn, d)
        mx = Math.max(mx, d)
        out.push({ i, j, d })
      }
    return { nx, ny, out, uniform: out.length > 0 && mx - mn < 1e-9 && !mask, value: out[0]?.d ?? 0 }
  }, [div, mask, x0, x1, y0, y1, aspect, tClock])

  const colorOf = (d: number) => {
    const m = Math.min(1, Math.abs(d) / divScale)
    if (m < 1e-6) return null
    return { fill: d > 0 ? AX.pos : AX.neg, op: 0.08 + 0.5 * Math.pow(m, 0.75) }
  }

  // ---------- arrows ----------
  const quiver = useMemo(() => {
    const n = arrows
    const m = Math.max(4, Math.round(n * aspect))
    const cell = (x1 - x0) / n
    const pts: { X: number; Y: number; u: number; v: number; s: number }[] = []
    for (let j = 0; j < m; j++)
      for (let i = 0; i < n; i++) {
        const X = x0 + cell * (i + 0.5)
        const Y = y0 + ((y1 - y0) * (j + 0.5)) / m
        if (mask?.(X, Y)) continue
        const [u, v] = vel(X, Y, tClock)
        const s = Math.hypot(u, v)
        if (!Number.isFinite(s)) continue
        pts.push({ X, Y, u, v, s })
      }
    const sorted = pts.map((p) => p.s).filter((s) => s > 0).sort((a, b) => a - b)
    const sRef = sorted[Math.floor(sorted.length / 2)] || 1
    return pts
      .filter((p) => p.s > 1e-9)
      .map((p) => {
        const L = 0.78 * cell * Math.min(1.7, Math.log1p(p.s / sRef) / Math.log(2))
        return { X: p.X, Y: p.Y, dx: (p.u / p.s) * L, dy: (p.v / p.s) * L }
      })
  }, [vel, mask, arrows, x0, x1, y0, y1, aspect, tClock])

  // ---------- material squares ----------
  const seedList = useMemo<V2[]>(() => {
    if (seeds) return seeds
    const out: V2[] = []
    const nx = 5
    const ny = Math.max(3, Math.round(nx * aspect))
    for (let j = 0; j < ny; j++)
      for (let i = 0; i < nx; i++) {
        const X = x0 + ((x1 - x0) * (i + 0.5)) / nx
        const Y = y0 + ((y1 - y0) * (j + 0.5)) / ny
        if (!mask?.(X, Y)) out.push([X, Y])
      }
    return out
  }, [seeds, mask, x0, x1, y0, y1, aspect])

  /** lnH = ln(depth / initial depth), integrated from ∂w/∂z along the square's path (0 for plane flows). */
  const polys = useRef<{ pts: V2[]; a0: number; lnH: number; dead: boolean }[]>([])
  const age = useRef(0)
  const reset = () => {
    polys.current = seedList
      .filter(([X, Y]) => !mask?.(X, Y))
      .map(([X, Y]) => {
        const pts = squarePoly(X, Y, tracerHalf)
        return { pts, a0: polygonArea(pts), lnH: 0, dead: false }
      })
    age.current = 0
  }
  useEffect(() => {
    reset()
    setClock((c) => c + 1e-9) // re-render with fresh squares
  }, [seedList, tracerHalf, vel, dwdz]) // eslint-disable-line react-hooks/exhaustive-deps

  const lastTimeCb = useRef(0)
  useAnimationFrame((dtReal) => {
    const dt = dtReal * timeScale
    const t = clockRef.current
    if (tracers) {
      const steps = 3
      const h = dt / steps
      for (const p of polys.current) {
        if (p.dead) continue
        for (let s = 0; s < steps; s++) {
          const tt = t + s * h
          if (dwdz) {
            let cx = 0
            let cy = 0
            for (const [X, Y] of p.pts) {
              cx += X
              cy += Y
            }
            const rate = dwdz(cx / p.pts.length, cy / p.pts.length, tt + 0.5 * h)
            if (Number.isFinite(rate)) p.lnH += h * rate
          }
          for (let q = 0; q < p.pts.length; q++) {
            const [X, Y] = p.pts[q]
            const [u1, v1] = vel(X, Y, tt)
            const [u2, v2] = vel(X + 0.5 * h * u1, Y + 0.5 * h * v1, tt + 0.5 * h)
            const nx = X + h * u2
            const ny = Y + h * v2
            if (!Number.isFinite(nx) || !Number.isFinite(ny) || mask?.(nx, ny) || nx < x0 - 0.3 || nx > x1 + 0.3 || ny < y0 - 0.3 || ny > y1 + 0.3) {
              p.dead = true
              break
            }
            p.pts[q] = [nx, ny]
          }
          if (p.dead) break
        }
      }
      age.current += dt
      if (age.current > life) reset()
    }
    clockRef.current = t + dt
    setClock(clockRef.current)
    if (onTime) {
      lastTimeCb.current += dtReal
      if (lastTimeCb.current > 0.1) {
        lastTimeCb.current = 0
        onTime(clockRef.current)
      }
    }
  }, running)

  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!onProbe) return
    const r = e.currentTarget.getBoundingClientRect()
    const p = inv(e.clientX - r.left, e.clientY - r.top)
    if (p[0] < x0 || p[0] > x1 || p[1] < y0 || p[1] > y1 || mask?.(p[0], p[1])) return
    onProbe([+p[0].toFixed(3), +p[1].toFixed(3)])
  }

  const ticks = (a: number, b: number) => {
    const span = b - a
    const st = span > 5 ? 1 : 0.5
    const out: number[] = []
    for (let v = Math.ceil(a / st) * st; v <= b + 1e-9; v += st) out.push(+v.toFixed(6))
    return out
  }

  const cw = plotW / cells.nx
  const ch = H / cells.ny
  const uni = cells.uniform ? colorOf(cells.value) : null

  return (
    <div ref={ref} className="divergence-map w-full select-none">
      <div className="relative mx-auto" style={{ width: W, height: H }}>
        <svg
          width={W}
          height={H}
          className="absolute inset-0 block"
          onPointerDown={onPointerDown}
          style={{ touchAction: 'manipulation', cursor: onProbe ? 'crosshair' : undefined }}
          role="img"
          aria-label="Divergence map with velocity arrows"
        >
          <defs>
            <clipPath id={`${uid}-clip`}>
              <rect x={offX} y={0} width={plotW} height={H} rx={8} />
            </clipPath>
            <marker id={`${uid}-arr`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M0 0L10 5L0 10z" fill="var(--quiver)" />
            </marker>
          </defs>
          <rect x={offX} y={0} width={plotW} height={H} rx={8} fill="var(--field-bg)" stroke="var(--line)" />
          <g clipPath={`url(#${uid}-clip)`}>
            {uni ? (
              <rect x={offX} y={0} width={plotW} height={H} fill={uni.fill} fillOpacity={uni.op} />
            ) : (
              <g shapeRendering="crispEdges">
                {cells.out.map(({ i, j, d }) => {
                  const c = colorOf(d)
                  if (!c) return null
                  return <rect key={`${i}-${j}`} x={offX + i * cw} y={H - (j + 1) * ch} width={cw + 0.6} height={ch + 0.6} fill={c.fill} fillOpacity={c.op} />
                })}
              </g>
            )}
            {x0 < 0 && x1 > 0 ? <line x1={sx(0)} x2={sx(0)} y1={0} y2={H} stroke="var(--grid)" strokeDasharray="3 4" /> : null}
            {y0 < 0 && y1 > 0 ? <line x1={offX} x2={offX + plotW} y1={sy(0)} y2={sy(0)} stroke="var(--grid)" strokeDasharray="3 4" /> : null}
            {quiver.map((a, i) => (
              <line
                key={i}
                x1={sx(a.X - a.dx / 2)}
                y1={sy(a.Y - a.dy / 2)}
                x2={sx(a.X + a.dx / 2)}
                y2={sy(a.Y + a.dy / 2)}
                stroke="var(--quiver)"
                strokeWidth={1.35}
                markerEnd={`url(#${uid}-arr)`}
                opacity={0.85}
              />
            ))}
            {disc ? <circle cx={sx(0)} cy={sy(0)} r={disc * k} fill="var(--body-fill)" stroke="var(--ink-3)" strokeWidth={1.2} /> : null}
            {tracers
              ? polys.current.map((p, i) => {
                  if (p.dead) return null
                  // volume ratio = (x–y area ratio) × (depth ratio e^lnH)
                  const lr = Math.log(polygonArea(p.pts) / p.a0) + p.lnH
                  const keep = Math.abs(lr) < 0.03
                  const col = keep ? AX.ok : lr > 0 ? AX.pos : AX.neg
                  return (
                    <polygon
                      key={i}
                      points={p.pts.map(([X, Y]) => `${sx(X).toFixed(1)},${sy(Y).toFixed(1)}`).join(' ')}
                      fill={col}
                      fillOpacity={keep ? 0.35 : Math.min(0.75, 0.3 + 0.5 * Math.abs(lr))}
                      stroke={col}
                      strokeWidth={1.4}
                      strokeLinejoin="round"
                    />
                  )
                })
              : null}
            {overlay?.({ sx, sy, k })}
            {probe ? (
              <g pointerEvents="none">
                <circle cx={sx(probe[0])} cy={sy(probe[1])} r={7} fill="none" stroke="var(--ink)" strokeWidth={2} />
                <line x1={sx(probe[0]) - 11} x2={sx(probe[0]) + 11} y1={sy(probe[1])} y2={sy(probe[1])} stroke="var(--ink)" strokeWidth={1.2} />
                <line x1={sx(probe[0])} x2={sx(probe[0])} y1={sy(probe[1]) - 11} y2={sy(probe[1]) + 11} stroke="var(--ink)" strokeWidth={1.2} />
              </g>
            ) : null}
          </g>
          <g className="fill-ink-3 text-[10px]" pointerEvents="none">
            {ticks(x0, x1).map((t) => (
              <text key={`x${t}`} x={sx(t)} y={H - 4} textAnchor="middle" paintOrder="stroke" stroke="var(--surface)" strokeWidth={2.5}>
                {String(t).replace('-', '−')}
              </text>
            ))}
            {ticks(y0, y1).map((t) => (
              <text key={`y${t}`} x={offX + 4} y={sy(t)} dy="0.32em" paintOrder="stroke" stroke="var(--surface)" strokeWidth={2.5}>
                {String(t).replace('-', '−')}
              </text>
            ))}
            <text x={offX + plotW - 6} y={H - 16} textAnchor="end" fontStyle="italic" paintOrder="stroke" stroke="var(--surface)" strokeWidth={2.5}>
              x (m)
            </text>
            <text x={offX + 24} y={13} fontStyle="italic" paintOrder="stroke" stroke="var(--surface)" strokeWidth={2.5}>
              y (m)
            </text>
          </g>
        </svg>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-ink-3">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm" style={{ background: AX.neg, opacity: 0.55 }} /> ∇·V &lt; 0 (compression)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm border border-line" style={{ background: 'var(--field-bg)' }} /> ∇·V = 0
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm" style={{ background: AX.pos, opacity: 0.55 }} /> ∇·V &gt; 0 (expansion)
        </span>
        {tracers ? (
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-sm" style={{ background: AX.ok, opacity: 0.6 }} /> material element keeping its volume{dwdz ? ' (x–y area × depth)' : ''}
          </span>
        ) : null}
        {onProbe ? <span>click / tap to move the probe ⊕</span> : null}
      </div>
    </div>
  )
}
