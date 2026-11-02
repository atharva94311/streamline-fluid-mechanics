import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { fmt, seededRandom } from '@/lib/math'
import { useElementSize, useInView, usePrefersReducedMotion, useUid } from './hooks'
import { cx } from './cx'

export type Vec = [number, number]

export interface FlowMarker {
  x: number
  y: number
  label?: string
  kind?: 'stagnation' | 'source' | 'sink' | 'vortex' | 'point'
}

export interface FlowFieldProps {
  /** x-range and y-range of the plotted domain (equal aspect ratio is enforced). */
  x: [number, number]
  y: [number, number]
  /** Stream function ψ(x, y). Streamlines are its contours. */
  psi?: (x: number, y: number) => number
  /** Velocity potential φ(x, y). Equipotentials are its contours. */
  phi?: (x: number, y: number) => number
  /** Velocity (u, v). If omitted it is computed from ψ: u = ∂ψ/∂y, v = −∂ψ/∂x. */
  vel?: (x: number, y: number) => Vec
  /** Number of contour levels (default 22) or explicit levels. */
  psiLevels?: number | number[]
  phiLevels?: number | number[]
  streamlines?: boolean
  equipotentials?: boolean
  /** Number of animated tracer particles (0 = off). */
  particles?: number
  /** Particle speed multiplier. */
  speed?: number
  /** Velocity arrows; a number sets arrows per row. */
  quiver?: boolean | number
  /** Background colour map of speed |V|. */
  heatmap?: boolean
  /** Extra emphasised ψ contours (e.g. the dividing streamline). */
  highlight?: { level: number; color?: string; width?: number; label?: string }[]
  /** Region drawn as a solid body (particles avoid it). */
  body?: (x: number, y: number) => boolean
  markers?: FlowMarker[]
  /** Skip contour cells whose corner spread exceeds this (hides branch-cut artefacts). Default 4 × level spacing. */
  cut?: number
  /** Grid resolution along x (default 170). */
  grid?: number
  maxHeight?: number
  hover?: boolean
  /** Reference speed for colour scaling and the Cp readout (default: median speed). */
  Uref?: number
  showAxes?: boolean
  overlay?: (ctx: { sx: (v: number) => number; sy: (v: number) => number; width: number; height: number }) => ReactNode
  className?: string
}

/** Marching squares: returns flat [x1,y1,x2,y2,...] segments in grid units. */
function contourSegments(vals: Float64Array, nx: number, ny: number, L: number, cut: number): number[] {
  const out: number[] = []
  for (let j = 0; j < ny - 1; j++) {
    for (let i = 0; i < nx - 1; i++) {
      const a = vals[j * nx + i]
      const b = vals[j * nx + i + 1]
      const c = vals[(j + 1) * nx + i + 1]
      const d = vals[(j + 1) * nx + i]
      if (!(Number.isFinite(a) && Number.isFinite(b) && Number.isFinite(c) && Number.isFinite(d))) continue
      const mn = Math.min(a, b, c, d)
      const mx = Math.max(a, b, c, d)
      if (L < mn || L > mx || mx - mn > cut) continue
      let idx = 0
      if (a > L) idx |= 1
      if (b > L) idx |= 2
      if (c > L) idx |= 4
      if (d > L) idx |= 8
      if (idx === 0 || idx === 15) continue
      const e0x = i + (L - a) / (b - a), e0y = j
      const e1x = i + 1, e1y = j + (L - b) / (c - b)
      const e2x = i + (L - d) / (c - d), e2y = j + 1
      const e3x = i, e3y = j + (L - a) / (d - a)
      const seg = (x1: number, y1: number, x2: number, y2: number) => out.push(x1, y1, x2, y2)
      switch (idx) {
        case 1: case 14: seg(e0x, e0y, e3x, e3y); break
        case 2: case 13: seg(e0x, e0y, e1x, e1y); break
        case 3: case 12: seg(e1x, e1y, e3x, e3y); break
        case 4: case 11: seg(e1x, e1y, e2x, e2y); break
        case 6: case 9: seg(e0x, e0y, e2x, e2y); break
        case 7: case 8: seg(e2x, e2y, e3x, e3y); break
        case 5: {
          const center = (a + b + c + d) / 4
          if (center > L) { seg(e0x, e0y, e1x, e1y); seg(e2x, e2y, e3x, e3y) } else { seg(e0x, e0y, e3x, e3y); seg(e1x, e1y, e2x, e2y) }
          break
        }
        case 10: {
          const center = (a + b + c + d) / 4
          if (center > L) { seg(e0x, e0y, e3x, e3y); seg(e1x, e1y, e2x, e2y) } else { seg(e0x, e0y, e1x, e1y); seg(e2x, e2y, e3x, e3y) }
          break
        }
      }
    }
  }
  return out
}

/** Chain marching-squares segments into polylines and emit an SVG path in normalised [0,1]² coordinates. */
function segsToPath(segs: number[], nx: number, ny: number): string {
  const n = segs.length / 4
  if (!n) return ''
  const key = (x: number, y: number) => `${Math.round(x * 1e5)},${Math.round(y * 1e5)}`
  const ends = new Map<string, number[]>()
  for (let s = 0; s < n; s++)
    for (let e = 0; e < 2; e++) {
      const k = key(segs[4 * s + 2 * e], segs[4 * s + 2 * e + 1])
      const arr = ends.get(k)
      if (arr) arr.push(s)
      else ends.set(k, [s])
    }
  const used = new Uint8Array(n)
  let d = ''
  const fx = (v: number) => (v / (nx - 1)).toFixed(4)
  const fy = (v: number) => (v / (ny - 1)).toFixed(4)
  for (let s = 0; s < n; s++) {
    if (used[s]) continue
    used[s] = 1
    const head: number[] = [segs[4 * s], segs[4 * s + 1]]
    const tail: number[] = [segs[4 * s + 2], segs[4 * s + 3]]
    for (const side of [tail, head]) {
      for (;;) {
        const x = side[side.length - 2]
        const y = side[side.length - 1]
        const next = (ends.get(key(x, y)) ?? []).find((c) => !used[c])
        if (next == null) break
        used[next] = 1
        const k0 = key(segs[4 * next], segs[4 * next + 1]) === key(x, y) ? 2 : 0
        side.push(segs[4 * next + k0], segs[4 * next + k0 + 1])
      }
    }
    const pts: number[] = []
    for (let k = head.length - 2; k >= 0; k -= 2) pts.push(head[k], head[k + 1])
    pts.push(...tail)
    d += `M${fx(pts[0])} ${fy(pts[1])}`
    for (let k = 2; k < pts.length; k += 2) d += `L${fx(pts[k])} ${fy(pts[k + 1])}`
  }
  return d
}

function niceStep(raw: number): number {
  if (!(raw > 0)) return 1
  const e = Math.floor(Math.log10(raw))
  const f = raw / 10 ** e
  const n = f < 1.5 ? 1 : f < 3.5 ? 2 : f < 7.5 ? 5 : 10
  return n * 10 ** e
}

function autoLevels(vals: Float64Array, count: number): number[] {
  const finite = Array.from(vals).filter(Number.isFinite).sort((p, q) => p - q)
  if (!finite.length) return []
  const lo = finite[Math.floor(finite.length * 0.02)]
  const hi = finite[Math.floor(finite.length * 0.98)]
  if (hi - lo < 1e-12) return [lo]
  const step = niceStep((hi - lo) / count)
  const out: number[] = []
  for (let k = Math.ceil(lo / step); k * step <= hi + 1e-12; k++) out.push(+(k * step).toPrecision(12))
  return out
}

function sampleGrid(f: (x: number, y: number) => number, x0: number, x1: number, y0: number, y1: number, nx: number, ny: number) {
  const vals = new Float64Array(nx * ny)
  for (let j = 0; j < ny; j++) {
    const yy = y0 + ((y1 - y0) * j) / (ny - 1)
    for (let i = 0; i < nx; i++) vals[j * nx + i] = f(x0 + ((x1 - x0) * i) / (nx - 1), yy)
  }
  return vals
}

/** Map speed ratio to a cool→warm colour (rgba). */
function speedColor(r: number): [number, number, number] {
  const stops: [number, [number, number, number]][] = [
    [0, [49, 54, 149]], [0.35, [69, 117, 180]], [0.7, [116, 173, 209]], [1, [171, 217, 233]],
    [1.3, [254, 224, 144]], [1.7, [253, 174, 97]], [2.2, [244, 109, 67]], [3, [215, 48, 39]],
  ]
  if (r <= 0) return stops[0][1]
  for (let k = 1; k < stops.length; k++) {
    if (r <= stops[k][0]) {
      const [a, ca] = stops[k - 1]
      const [b, cb] = stops[k]
      const t = (r - a) / (b - a)
      return [0, 1, 2].map((c) => Math.round(ca[c] + (cb[c] - ca[c]) * t)) as [number, number, number]
    }
  }
  return stops[stops.length - 1][1]
}

/**
 * 2-D flow visualiser for potential-flow topics: streamlines (ψ contours), equipotentials (φ contours),
 * animated tracer particles, velocity arrows, speed colour map, bodies, markers and a hover probe.
 */
export function FlowField(props: FlowFieldProps) {
  const {
    x: [x0, x1], y: [y0, y1], psi, phi, vel, psiLevels = 22, phiLevels = 22, streamlines = !!psi, equipotentials = false,
    particles = 0, speed = 1, quiver = false, heatmap = false, highlight, body, markers, cut, grid = 170, maxHeight = 460,
    hover = true, Uref, showAxes = true, overlay, className,
  } = props
  const [ref, size] = useElementSize<HTMLDivElement>()
  const clip = useUid('ffclip')
  const arrowId = useUid('ffarrow')
  const W = Math.max(260, size.width || 640)
  const aspect = (y1 - y0) / (x1 - x0)
  const H = Math.min(maxHeight, W * aspect)
  const plotW = H / aspect
  const offX = (W - plotW) / 2
  const sx = (v: number) => offX + ((v - x0) / (x1 - x0)) * plotW
  const sy = (v: number) => H - ((v - y0) / (y1 - y0)) * H
  const inv = (px: number, py: number): Vec => [x0 + ((px - offX) / plotW) * (x1 - x0), y0 + ((H - py) / H) * (y1 - y0)]

  const velocity = useMemo<(x: number, y: number) => Vec>(() => {
    if (vel) return vel
    if (psi) {
      const h = 1e-4 * Math.max(x1 - x0, y1 - y0)
      return (x: number, y: number) => [(psi(x, y + h) - psi(x, y - h)) / (2 * h), -(psi(x + h, y) - psi(x - h, y)) / (2 * h)]
    }
    return () => [0, 0]
  }, [vel, psi, x0, x1, y0, y1])

  const nx = grid
  const ny = Math.max(12, Math.round(grid * aspect))

  const contours = useMemo(() => {
    const build = (f: ((x: number, y: number) => number) | undefined, levels: number | number[], on: boolean) => {
      if (!f || !on) return { paths: [] as string[], levels: [] as number[], vals: null as Float64Array | null }
      const vals = sampleGrid(f, x0, x1, y0, y1, nx, ny)
      const lv = Array.isArray(levels) ? levels : autoLevels(vals, levels)
      const sorted = [...lv].sort((p, q) => p - q)
      const spacing = sorted.length > 1 ? Math.min(...sorted.slice(1).map((v, i) => v - sorted[i])) : Infinity
      const cutoff = cut ?? (Number.isFinite(spacing) ? 4 * spacing : Infinity)
      const paths = lv.map((L) => segsToPath(contourSegments(vals, nx, ny, L, cutoff), nx, ny))
      return { paths, levels: lv, vals, cutoff }
    }
    const s = build(psi, psiLevels, streamlines)
    const p = build(phi, phiLevels, equipotentials)
    const hl = (highlight ?? []).map((h) => {
      if (!psi) return ''
      const vals = s.vals ?? sampleGrid(psi, x0, x1, y0, y1, nx, ny)
      return segsToPath(contourSegments(vals, nx, ny, h.level, cut ?? (s as { cutoff?: number }).cutoff ?? Infinity), nx, ny)
    })
    return { s, p, hl }
  }, [psi, phi, psiLevels, phiLevels, streamlines, equipotentials, highlight, cut, x0, x1, y0, y1, nx, ny])

  // reference speed
  const uRef = useMemo(() => {
    if (Uref) return Uref
    const sp: number[] = []
    for (let j = 1; j < 12; j++)
      for (let i = 1; i < 16; i++) {
        const [u, v] = velocity(x0 + ((x1 - x0) * i) / 16, y0 + ((y1 - y0) * j) / 12)
        const s = Math.hypot(u, v)
        if (Number.isFinite(s)) sp.push(s)
      }
    sp.sort((a, b) => a - b)
    return sp[Math.floor(sp.length / 2)] || 1
  }, [Uref, velocity, x0, x1, y0, y1])

  // body mask as run-length rectangles
  const bodyRects = useMemo(() => {
    if (!body) return []
    const bx = 220
    const by = Math.max(12, Math.round(bx * aspect))
    const rects: [number, number, number, number][] = []
    for (let j = 0; j < by; j++) {
      const yy = y0 + ((y1 - y0) * (j + 0.5)) / by
      let start = -1
      for (let i = 0; i <= bx; i++) {
        const inside = i < bx && body(x0 + ((x1 - x0) * (i + 0.5)) / bx, yy)
        if (inside && start < 0) start = i
        if (!inside && start >= 0) {
          rects.push([start / bx, j / by, (i - start) / bx, 1 / by])
          start = -1
        }
      }
    }
    return rects
  }, [body, x0, x1, y0, y1, aspect])

  // heatmap canvas
  const heatRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const cv = heatRef.current
    if (!heatmap || !cv) return
    const ctx = cv.getContext?.('2d')
    if (!ctx) return
    const gw = 160
    const gh = Math.max(10, Math.round(gw * aspect))
    cv.width = gw
    cv.height = gh
    const img = ctx.createImageData(gw, gh)
    for (let j = 0; j < gh; j++)
      for (let i = 0; i < gw; i++) {
        const X = x0 + ((x1 - x0) * (i + 0.5)) / gw
        const Y = y1 - ((y1 - y0) * (j + 0.5)) / gh
        const [u, v] = velocity(X, Y)
        const r = Math.hypot(u, v) / uRef
        const [R, G, B] = speedColor(Number.isFinite(r) ? r : 3)
        const k = (j * gw + i) * 4
        img.data[k] = R
        img.data[k + 1] = G
        img.data[k + 2] = B
        img.data[k + 3] = body?.(X, Y) ? 0 : 120
      }
    ctx.putImageData(img, 0, 0)
  }, [heatmap, velocity, uRef, x0, x1, y0, y1, aspect, body])

  // particles
  const partRef = useRef<HTMLCanvasElement>(null)
  const inView = useInView(ref)
  const reduced = usePrefersReducedMotion()
  const [playing, setPlaying] = useState(true)
  useEffect(() => {
    const cv = partRef.current
    if (!cv || !particles || !inView || !playing || reduced || typeof requestAnimationFrame === 'undefined') return
    const ctx = cv.getContext?.('2d')
    if (!ctx) return
    const dpr = window.devicePixelRatio || 1
    cv.width = Math.round(W * dpr)
    cv.height = Math.round(H * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    const rand = seededRandom(7)
    const span = x1 - x0
    const scale = (span / 7) / uRef
    const spawn = (): [number, number, number] => {
      for (let t = 0; t < 20; t++) {
        const px = x0 + rand() * (x1 - x0)
        const py = y0 + rand() * (y1 - y0)
        if (!body?.(px, py)) return [px, py, 2 + rand() * 6]
      }
      return [x0, y0 + rand() * (y1 - y0), 4]
    }
    const P = Array.from({ length: particles }, spawn)
    let raf = 0
    let last = performance.now()
    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      ctx.globalCompositeOperation = 'destination-out'
      ctx.fillStyle = 'rgba(0,0,0,0.16)'
      ctx.fillRect(0, 0, W, H)
      ctx.globalCompositeOperation = 'source-over'
      ctx.strokeStyle = 'rgba(14,165,233,0.9)'
      ctx.lineWidth = 1.6
      ctx.lineCap = 'round'
      ctx.beginPath()
      for (const p of P) {
        const [u1, v1] = velocity(p[0], p[1])
        const mx = p[0] + 0.5 * dt * scale * speed * u1
        const my = p[1] + 0.5 * dt * scale * speed * v1
        const [u2, v2] = velocity(mx, my)
        let dx = dt * scale * speed * u2
        let dy = dt * scale * speed * v2
        const len = Math.hypot(dx, dy)
        const maxLen = 0.03 * span
        const sp = Math.hypot(u2, v2) / uRef
        if (len > maxLen) {
          dx *= maxLen / len
          dy *= maxLen / len
        }
        const nxp = p[0] + dx
        const nyp = p[1] + dy
        p[2] -= dt
        if (!Number.isFinite(nxp) || !Number.isFinite(nyp) || nxp < x0 || nxp > x1 || nyp < y0 || nyp > y1 || p[2] <= 0 || sp > 25 || body?.(nxp, nyp)) {
          const s = spawn()
          p[0] = s[0]
          p[1] = s[1]
          p[2] = s[2]
          continue
        }
        ctx.moveTo(sx(p[0]), sy(p[1]))
        ctx.lineTo(sx(nxp), sy(nyp))
        p[0] = nxp
        p[1] = nyp
      }
      ctx.stroke()
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => {
      cancelAnimationFrame(raf)
      ctx.clearRect(0, 0, W, H)
    }
  }, [particles, inView, playing, reduced, velocity, uRef, W, H, x0, x1, y0, y1, speed, body]) // eslint-disable-line react-hooks/exhaustive-deps

  // quiver arrows
  const arrows = useMemo(() => {
    if (!quiver) return []
    const n = typeof quiver === 'number' ? quiver : 17
    const m = Math.max(4, Math.round(n * aspect))
    const cell = (x1 - x0) / n
    const out: { x: number; y: number; dx: number; dy: number }[] = []
    for (let j = 0; j < m; j++)
      for (let i = 0; i < n; i++) {
        const X = x0 + cell * (i + 0.5)
        const Y = y0 + ((y1 - y0) * (j + 0.5)) / m
        if (body?.(X, Y)) continue
        const [u, v] = velocity(X, Y)
        const s = Math.hypot(u, v)
        if (!Number.isFinite(s) || s === 0) continue
        const L = 0.8 * cell * Math.min(1.6, Math.log1p(s / uRef) / Math.log(2))
        out.push({ x: X, y: Y, dx: (u / s) * L, dy: (v / s) * L })
      }
    return out
  }, [quiver, velocity, uRef, x0, x1, y0, y1, aspect, body])

  const [probe, setProbe] = useState<Vec | null>(null)
  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!hover) return
    const r = e.currentTarget.getBoundingClientRect()
    const p = inv(e.clientX - r.left, e.clientY - r.top)
    if (p[0] < x0 || p[0] > x1 || p[1] < y0 || p[1] > y1) return setProbe(null)
    setProbe(p)
  }
  const probeData = probe
    ? (() => {
        const [u, v] = velocity(probe[0], probe[1])
        const V = Math.hypot(u, v)
        return { u, v, V, psi: psi?.(probe[0], probe[1]), phi: phi?.(probe[0], probe[1]), cp: 1 - (V / uRef) ** 2 }
      })()
    : null

  const tf = `translate(${offX},0) scale(${plotW},${H}) translate(0,1) scale(1,-1)`
  const ticks = (a: number, b: number, px: number) => {
    const st = niceStep((b - a) / Math.max(2, Math.floor(px / 75)))
    const out: number[] = []
    for (let k = Math.ceil(a / st); k * st <= b + 1e-9; k++) out.push(+(k * st).toPrecision(10))
    return out
  }

  return (
    <div ref={ref} className={cx('flow-field relative w-full', className)}>
      <div className="relative mx-auto" style={{ width: W, height: H }}>
        {heatmap ? (
          <canvas ref={heatRef} className="absolute rounded-lg" style={{ left: offX, top: 0, width: plotW, height: H, imageRendering: 'auto' }} />
        ) : null}
        <svg width={W} height={H} className="absolute inset-0 block" onPointerMove={onMove} onPointerLeave={() => setProbe(null)} role="img" aria-label="flow field">
          <defs>
            <clipPath id={clip}>
              <rect x={offX} y={0} width={plotW} height={H} />
            </clipPath>
            <marker id={arrowId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M0 0L10 5L0 10z" fill="var(--quiver)" />
            </marker>
          </defs>
          <rect x={offX} y={0} width={plotW} height={H} fill={heatmap ? 'none' : 'var(--field-bg)'} stroke="var(--line)" rx={8} />
          <g clipPath={`url(#${clip})`}>
            {showAxes ? (
              <g>
                {x0 < 0 && x1 > 0 ? <line x1={sx(0)} x2={sx(0)} y1={0} y2={H} stroke="var(--grid)" strokeDasharray="3 4" /> : null}
                {y0 < 0 && y1 > 0 ? <line x1={offX} x2={offX + plotW} y1={sy(0)} y2={sy(0)} stroke="var(--grid)" strokeDasharray="3 4" /> : null}
              </g>
            ) : null}
            <g transform={tf}>
              {contours.p.paths.map((d, i) => (
                <path key={`p${i}`} d={d} fill="none" stroke="var(--equipotential)" strokeWidth={1.1} vectorEffect="non-scaling-stroke" strokeDasharray="4 3" />
              ))}
              {contours.s.paths.map((d, i) => (
                <path key={`s${i}`} d={d} fill="none" stroke="var(--streamline)" strokeWidth={1.35} vectorEffect="non-scaling-stroke" strokeLinecap="round" />
              ))}
              {bodyRects.map(([bx, by, bw, bh], i) => (
                <rect key={`r${i}`} x={bx} y={by} width={bw + 0.002} height={bh + 0.002} fill="var(--body-fill)" />
              ))}
              {contours.hl.map((d, i) => (
                <path
                  key={`h${i}`}
                  d={d}
                  fill="none"
                  stroke={highlight![i].color ?? 'var(--plot-4)'}
                  strokeWidth={highlight![i].width ?? 2.6}
                  vectorEffect="non-scaling-stroke"
                  strokeLinecap="round"
                />
              ))}
            </g>
            {arrows.map((a, i) => (
              <line
                key={`q${i}`}
                x1={sx(a.x - a.dx / 2)}
                y1={sy(a.y - a.dy / 2)}
                x2={sx(a.x + a.dx / 2)}
                y2={sy(a.y + a.dy / 2)}
                stroke="var(--quiver)"
                strokeWidth={1.4}
                markerEnd={`url(#${arrowId})`}
              />
            ))}
            {overlay?.({ sx, sy, width: W, height: H })}
          </g>
          {markers?.map((mk, i) => {
            const cxp = sx(mk.x)
            const cyp = sy(mk.y)
            const col = mk.kind === 'source' ? '#16a34a' : mk.kind === 'sink' ? '#dc2626' : mk.kind === 'vortex' ? '#7c3aed' : mk.kind === 'stagnation' ? '#f59e0b' : 'var(--ink)'
            return (
              <g key={`m${i}`}>
                <circle cx={cxp} cy={cyp} r={mk.kind === 'point' ? 3.5 : 6} fill={mk.kind === 'stagnation' ? col : 'var(--surface)'} stroke={col} strokeWidth={2} />
                {mk.kind === 'source' || mk.kind === 'sink' ? (
                  <path d={`M${cxp - 3.5} ${cyp}H${cxp + 3.5}${mk.kind === 'source' ? `M${cxp} ${cyp - 3.5}V${cyp + 3.5}` : ''}`} stroke={col} strokeWidth={1.8} />
                ) : null}
                {mk.kind === 'vortex' ? <circle cx={cxp} cy={cyp} r={2} fill={col} /> : null}
                {mk.label ? (
                  <text x={cxp + 9} y={cyp - 8} className="fill-ink text-[11px] font-semibold" paintOrder="stroke" stroke="var(--surface)" strokeWidth={3}>
                    {mk.label}
                  </text>
                ) : null}
              </g>
            )
          })}
          {showAxes ? (
            <g className="fill-ink-3 text-[10px]" pointerEvents="none">
              {ticks(x0, x1, plotW).map((t) => (
                <text key={`tx${t}`} x={sx(t)} y={H - 4} textAnchor="middle" paintOrder="stroke" stroke="var(--surface)" strokeWidth={2.5}>
                  {String(+t.toPrecision(3)).replace('-', '−')}
                </text>
              ))}
              {ticks(y0, y1, H).map((t) => (
                <text key={`ty${t}`} x={offX + 4} y={sy(t)} dy="0.32em" paintOrder="stroke" stroke="var(--surface)" strokeWidth={2.5}>
                  {String(+t.toPrecision(3)).replace('-', '−')}
                </text>
              ))}
            </g>
          ) : null}
        </svg>
        {particles ? <canvas ref={partRef} className="pointer-events-none absolute inset-0" style={{ width: W, height: H }} /> : null}
        {probeData && probe ? (
          <div className="pointer-events-none absolute right-2 top-2 rounded-lg border border-line bg-surface/90 px-2.5 py-1.5 font-mono text-[11px] leading-5 text-ink-2 shadow backdrop-blur">
            <div>
              (x, y) = ({fmt(probe[0], 3)}, {fmt(probe[1], 3)})
            </div>
            <div>
              u = {fmt(probeData.u, 3)}, v = {fmt(probeData.v, 3)}
            </div>
            <div>|V| = {fmt(probeData.V, 3)}</div>
            {probeData.psi != null ? <div>ψ = {fmt(probeData.psi, 3)}</div> : null}
            {probeData.phi != null ? <div>φ = {fmt(probeData.phi, 3)}</div> : null}
            <div title="Pressure coefficient relative to the reference speed">Cp = {fmt(probeData.cp, 3)}</div>
          </div>
        ) : null}
        {particles && !reduced ? (
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            className="absolute bottom-2 right-2 rounded-lg border border-line bg-surface/90 px-2 py-1 text-[11px] font-semibold text-ink-2 shadow-sm hover:text-ink"
          >
            {playing ? 'Pause tracers' : 'Play tracers'}
          </button>
        ) : null}
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-ink-3">
        {streamlines && psi ? (
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-5 rounded" style={{ background: 'var(--streamline)' }} /> streamlines (ψ = const)
          </span>
        ) : null}
        {equipotentials && phi ? (
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block w-5 border-t-2 border-dashed" style={{ borderColor: 'var(--equipotential)' }} /> equipotentials (φ = const)
          </span>
        ) : null}
        {particles ? <span>moving dots: fluid particles</span> : null}
        {heatmap ? <span>colour: speed |V| (blue slow → red fast)</span> : null}
        {highlight?.map((h, i) =>
          h.label ? (
            <span key={i} className="inline-flex items-center gap-1.5">
              <span className="inline-block h-1 w-5 rounded" style={{ background: h.color ?? 'var(--plot-4)' }} /> {h.label}
            </span>
          ) : null,
        )}
        {hover ? <span>hover to probe u, v, ψ, φ</span> : null}
      </div>
    </div>
  )
}
