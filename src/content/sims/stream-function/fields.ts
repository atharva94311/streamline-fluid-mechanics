/**
 * Numerical helpers shared by the stream-function sims (plain functions, no React).
 * Convention used everywhere: u = ∂ψ/∂y, v = −∂ψ/∂x (Lecture 9, slide 12).
 */
import { num } from '@/kit'

export type V2 = [number, number]
export type VelFn = (x: number, y: number) => V2
export type ScalarFn = (x: number, y: number) => number
/** [x0, x1, y0, y1] */
export type Bounds = [number, number, number, number]

/** One classical RK4 step of size h for dX/ds = f(X). */
export function rk4Point(f: VelFn, p: V2, h: number): V2 {
  const [x, y] = p
  const k1 = f(x, y)
  const k2 = f(x + 0.5 * h * k1[0], y + 0.5 * h * k1[1])
  const k3 = f(x + 0.5 * h * k2[0], y + 0.5 * h * k2[1])
  const k4 = f(x + h * k3[0], y + h * k3[1])
  return [x + (h / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]), y + (h / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1])]
}

export function inBounds(p: V2, b: Bounds, pad = 0): boolean {
  return p[0] >= b[0] - pad && p[0] <= b[1] + pad && p[1] >= b[2] - pad && p[1] <= b[3] + pad
}

/**
 * Integrate the streamline ODE dy/dx = v/u through (x0, y0) in both directions.
 * Uses the unit direction field V/|V| (arc-length parameter), so it also copes with u = 0.
 * Stops at the domain edge, inside a body, at a stagnation point, or after closing a loop.
 */
export function traceStreamline(
  vel: VelFn,
  x0: number,
  y0: number,
  opts: { bounds: Bounds; step: number; maxSteps?: number; body?: (x: number, y: number) => boolean; minSpeed?: number },
): V2[] {
  const { bounds, step, maxSteps = 800, body, minSpeed = 1e-7 } = opts
  let closed = false
  const run = (sgn: 1 | -1): V2[] => {
    const dir: VelFn = (x, y) => {
      const [u, v] = vel(x, y)
      const s = Math.hypot(u, v)
      if (!(s > minSpeed) || !Number.isFinite(s)) return [0, 0]
      return [(sgn * u) / s, (sgn * v) / s]
    }
    const pts: V2[] = []
    let p: V2 = [x0, y0]
    for (let i = 0; i < maxSteps; i++) {
      const [u, v] = vel(p[0], p[1])
      if (!(Math.hypot(u, v) > minSpeed)) break
      const q = rk4Point(dir, p, step)
      if (!Number.isFinite(q[0]) || !Number.isFinite(q[1])) break
      if (body?.(q[0], q[1])) break
      pts.push(q)
      if (!inBounds(q, bounds)) break
      if (i > 12 && Math.hypot(q[0] - x0, q[1] - y0) < 0.6 * step) {
        closed = true
        break
      }
      p = q
    }
    return pts
  }
  const fwd = run(1)
  const bwd = closed ? [] : run(-1)
  return [...bwd.reverse(), [x0, y0], ...fwd]
}

/** Volume flux per unit depth crossing a parametric path P(t), t ∈ [0, 1]: ∫ (u dy − v dx). */
export function fluxAlong(vel: VelFn, P: (t: number) => V2, dP: (t: number) => V2, n = 200): number {
  return num.simpson(
    (t) => {
      const [x, y] = P(t)
      const [dx, dy] = dP(t)
      const [u, v] = vel(x, y)
      return u * dy - v * dx
    },
    0,
    1,
    n,
  )
}

/** Shoelace area of a closed polygon. */
export function polygonArea(pts: V2[]): number {
  let s = 0
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i]
    const [x2, y2] = pts[(i + 1) % pts.length]
    s += x1 * y2 - x2 * y1
  }
  return Math.abs(s) / 2
}

/** Boundary points of a square (counter-clockwise), `perSide` points per edge. */
export function squareLoop(cx: number, cy: number, half: number, perSide = 16): V2[] {
  const out: V2[] = []
  const corners: V2[] = [
    [cx - half, cy - half],
    [cx + half, cy - half],
    [cx + half, cy + half],
    [cx - half, cy + half],
  ]
  for (let e = 0; e < 4; e++) {
    const [ax, ay] = corners[e]
    const [bx, by] = corners[(e + 1) % 4]
    for (let i = 0; i < perSide; i++) {
      const t = i / perSide
      out.push([ax + (bx - ax) * t, ay + (by - ay) * t])
    }
  }
  return out
}

/** Move every point with the flow for a time h (RK4). */
export function advect(vel: VelFn, pts: V2[], h: number): V2[] {
  return pts.map((p) => rk4Point(vel, p, h))
}

export function centroid(pts: V2[]): V2 {
  let x = 0
  let y = 0
  for (const p of pts) {
    x += p[0]
    y += p[1]
  }
  return [x / pts.length, y / pts.length]
}

/** Central-difference divergence ∂u/∂x + ∂v/∂y of a velocity field. */
export function divergence(vel: VelFn, x: number, y: number, h = 1e-4): number {
  const ux = (vel(x + h, y)[0] - vel(x - h, y)[0]) / (2 * h)
  const vy = (vel(x, y + h)[1] - vel(x, y - h)[1]) / (2 * h)
  return ux + vy
}

/** Compact number for TeX: up to 3 significant figures, no trailing zeros. */
export function texNum(v: number, sig = 3): string {
  if (!Number.isFinite(v)) return '\\infty'
  const s = String(+v.toPrecision(sig))
  return s.includes('e') ? num.fmtTeX(v, sig) : s
}

/**
 * TeX for a sum of terms c·monomial, e.g. [[2, 'y^2'], [-2, 'x^2']] → "2y^2 - 2x^2".
 * Zero coefficients are dropped; ±1 coefficients print without the 1.
 */
export function texPoly(terms: [number, string][], sig = 3): string {
  let out = ''
  for (const [c, mono] of terms) {
    if (Math.abs(c) < 1e-12) continue
    const neg = c < 0
    const mag = Math.abs(c)
    const coef = mono && Math.abs(mag - 1) < 1e-12 ? '' : texNum(mag, sig)
    const body = `${coef}${mono}`
    out += out ? (neg ? ' - ' : ' + ') + body : (neg ? '-' : '') + body
  }
  return out || '0'
}

/** Wrap an angle to (−π, π]. */
export function wrapPi(a: number): number {
  let t = a
  while (t <= -Math.PI) t += 2 * Math.PI
  while (t > Math.PI) t -= 2 * Math.PI
  return t
}
