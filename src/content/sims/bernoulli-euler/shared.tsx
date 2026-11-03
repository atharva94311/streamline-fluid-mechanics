/**
 * Shared helpers for the "bernoulli-euler" sims: SVG arrows/labels, pointer → SVG coordinates,
 * a marching-squares isoline generator and a colour ramp for canvas heat maps.
 */
import type { ReactNode } from 'react'

export const G = 9.81
export const RHO_WATER = 1000
/** Saturation (vapour) pressure of water at 20 °C, Pa — used for cavitation warnings. */
export const P_VAP_20C = 2340
/** Standard atmospheric pressure, Pa. */
export const P_ATM = 101325

/** Straight arrow with a filled head, in SVG user units. Theme-aware through `color` (CSS var). */
export function Arrow({
  x1, y1, x2, y2, color = 'var(--ink-2)', width = 2, head = 9, dash, opacity,
}: {
  x1: number
  y1: number
  x2: number
  y2: number
  color?: string
  width?: number
  head?: number
  dash?: string
  opacity?: number
}) {
  const dx = x2 - x1
  const dy = y2 - y1
  const L = Math.hypot(dx, dy)
  if (!(L > 1e-6)) return null
  const ux = dx / L
  const uy = dy / L
  const h = Math.min(head, L * 0.7)
  const bx = x2 - ux * h
  const by = y2 - uy * h
  const px = -uy * h * 0.45
  const py = ux * h * 0.45
  return (
    <g opacity={opacity}>
      <line x1={x1} y1={y1} x2={bx} y2={by} stroke={color} strokeWidth={width} strokeDasharray={dash} strokeLinecap="round" />
      <path d={`M${x2.toFixed(2)},${y2.toFixed(2)}L${(bx + px).toFixed(2)},${(by + py).toFixed(2)}L${(bx - px).toFixed(2)},${(by - py).toFixed(2)}Z`} fill={color} />
    </g>
  )
}

/** SVG text with a halo so it stays legible over lines and colour maps. */
export function Label({
  x, y, children, anchor = 'start', color = 'var(--ink)', size = 12, weight = 500, italic = false, halo = true, dy,
}: {
  x: number
  y: number
  children: ReactNode
  anchor?: 'start' | 'middle' | 'end'
  color?: string
  size?: number
  weight?: number
  italic?: boolean
  halo?: boolean
  dy?: string
}) {
  return (
    <text
      x={x}
      y={y}
      dy={dy}
      textAnchor={anchor}
      fontSize={size}
      fontWeight={weight}
      fontStyle={italic ? 'italic' : undefined}
      fill={color}
      stroke={halo ? 'var(--surface)' : undefined}
      strokeWidth={halo ? 3 : undefined}
      paintOrder="stroke"
      strokeLinejoin="round"
      pointerEvents="none"
    >
      {children}
    </text>
  )
}

/** Small right-angle marker at corner (x, y) between unit directions a and b (SVG units). */
export function RightAngle({ x, y, a, b, s = 9, color = 'var(--ink-2)' }: { x: number; y: number; a: [number, number]; b: [number, number]; s?: number; color?: string }) {
  const p1 = [x + a[0] * s, y + a[1] * s]
  const p2 = [x + (a[0] + b[0]) * s, y + (a[1] + b[1]) * s]
  const p3 = [x + b[0] * s, y + b[1] * s]
  return <path d={`M${p1[0]},${p1[1]}L${p2[0]},${p2[1]}L${p3[0]},${p3[1]}`} fill="none" stroke={color} strokeWidth={1.2} />
}

/** Convert a pointer position to the user coordinates of an SVG whose viewBox is (0 0 vbW vbH). */
export function pointerToSvg(svg: SVGSVGElement, clientX: number, clientY: number, vbW: number, vbH: number): [number, number] {
  const r = svg.getBoundingClientRect()
  if (!(r.width > 0) || !(r.height > 0)) return [vbW / 2, vbH / 2]
  // viewBox with the default preserveAspectRatio (xMidYMid meet): uniform scale, centred
  const s = Math.min(r.width / vbW, r.height / vbH)
  const ox = (r.width - vbW * s) / 2
  const oy = (r.height - vbH * s) / 2
  return [(clientX - r.left - ox) / s, (clientY - r.top - oy) / s]
}

/** Sample f on an nx × ny grid over [x0,x1]×[y0,y1]; index j*nx+i, j along y (upwards). */
export function sampleGrid(f: (x: number, y: number) => number, x0: number, x1: number, y0: number, y1: number, nx: number, ny: number): Float64Array {
  const out = new Float64Array(nx * ny)
  for (let j = 0; j < ny; j++) {
    const y = y0 + ((y1 - y0) * j) / (ny - 1)
    for (let i = 0; i < nx; i++) out[j * nx + i] = f(x0 + ((x1 - x0) * i) / (nx - 1), y)
  }
  return out
}

/** Marching squares for one level: flat list of segments [gx1, gy1, gx2, gy2, …] in grid units. */
export function isoSegments(vals: Float64Array, nx: number, ny: number, L: number): number[] {
  const out: number[] = []
  for (let j = 0; j < ny - 1; j++) {
    for (let i = 0; i < nx - 1; i++) {
      const a = vals[j * nx + i]
      const b = vals[j * nx + i + 1]
      const c = vals[(j + 1) * nx + i + 1]
      const d = vals[(j + 1) * nx + i]
      if (!(Number.isFinite(a) && Number.isFinite(b) && Number.isFinite(c) && Number.isFinite(d))) continue
      let idx = 0
      if (a > L) idx |= 1
      if (b > L) idx |= 2
      if (c > L) idx |= 4
      if (d > L) idx |= 8
      if (idx === 0 || idx === 15) continue
      const e0x = i + (L - a) / (b - a)
      const e0y = j
      const e1x = i + 1
      const e1y = j + (L - b) / (c - b)
      const e2x = i + (L - d) / (c - d)
      const e2y = j + 1
      const e3x = i
      const e3y = j + (L - a) / (d - a)
      switch (idx) {
        case 1: case 14: out.push(e0x, e0y, e3x, e3y); break
        case 2: case 13: out.push(e0x, e0y, e1x, e1y); break
        case 3: case 12: out.push(e1x, e1y, e3x, e3y); break
        case 4: case 11: out.push(e1x, e1y, e2x, e2y); break
        case 6: case 9: out.push(e0x, e0y, e2x, e2y); break
        case 7: case 8: out.push(e2x, e2y, e3x, e3y); break
        case 5: out.push(e0x, e0y, e1x, e1y, e2x, e2y, e3x, e3y); break
        case 10: out.push(e0x, e0y, e3x, e3y, e1x, e1y, e2x, e2y); break
      }
    }
  }
  return out
}

/** SVG path data for several levels of a sampled field; `toPx` maps grid units → SVG units. */
export function isoPath(vals: Float64Array, nx: number, ny: number, levels: number[], toPx: (gx: number, gy: number) => [number, number]): string {
  let d = ''
  for (const L of levels) {
    const s = isoSegments(vals, nx, ny, L)
    for (let k = 0; k < s.length; k += 4) {
      const [ax, ay] = toPx(s[k], s[k + 1])
      const [bx, by] = toPx(s[k + 2], s[k + 3])
      d += `M${ax.toFixed(1)} ${ay.toFixed(1)}L${bx.toFixed(1)} ${by.toFixed(1)}`
    }
  }
  return d
}

/** Evenly spaced levels strictly inside (lo, hi). */
export function levelsBetween(lo: number, hi: number, n: number): number[] {
  return Array.from({ length: n }, (_, k) => lo + ((hi - lo) * (k + 1)) / (n + 1))
}

/**
 * Sequential low → high colour ramp (deep blue → teal → pale yellow → orange → red) for pressure maps.
 * Returned as RGB 0–255; draw with some transparency so it sits well on light and dark backgrounds.
 */
const STOPS: [number, number, number][] = [
  [49, 54, 149],
  [69, 117, 180],
  [116, 173, 209],
  [171, 217, 233],
  [254, 224, 144],
  [253, 174, 97],
  [244, 109, 67],
  [215, 48, 39],
]
export function ramp(t: number): [number, number, number] {
  const x = Math.min(1, Math.max(0, Number.isFinite(t) ? t : 0)) * (STOPS.length - 1)
  const i = Math.min(STOPS.length - 2, Math.floor(x))
  const f = x - i
  const a = STOPS[i]
  const b = STOPS[i + 1]
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f]
}
export const rampCss = (t: number, alpha = 1) => {
  const [r, g, b] = ramp(t)
  return `rgba(${r.toFixed(0)},${g.toFixed(0)},${b.toFixed(0)},${alpha})`
}

/** "Nice" tick step for an axis span. */
export function niceStep(span: number, target = 5): number {
  const raw = Math.abs(span) / Math.max(1, target)
  if (!(raw > 0)) return 1
  const p = 10 ** Math.floor(Math.log10(raw))
  const m = raw / p
  return (m < 1.5 ? 1 : m < 3 ? 2 : m < 7 ? 5 : 10) * p
}

export function ticksFor(a: number, b: number, target = 5): number[] {
  const lo = Math.min(a, b)
  const hi = Math.max(a, b)
  const st = niceStep(hi - lo, target)
  const out: number[] = []
  for (let k = Math.ceil(lo / st - 1e-9); k * st <= hi + 1e-9; k++) out.push(+(k * st).toPrecision(10))
  return out
}

/** Minus sign for display. */
export const fmtSigned = (s: string) => s.replace(/^-/, '−')
