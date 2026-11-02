/**
 * Pure math for "uniform flow + line source" (the half-body), Lec 12 slides 16–18.
 * All functions are unit-agnostic: pass U, m, b, x, y in any consistent units.
 */

export type Pt = [number, number]
/** [xMin, xMax, yMin, yMax] */
export type Box = [number, number, number, number]

export const TWO_PI = 2 * Math.PI

/** Surface angle of the speed maximum on the body (rad) — supplementary result, ≈ 62.96°. */
export const THETA_VMAX = 1.0988057191864873
/** V_max / U on the body surface (supplementary result). */
export const VMAX_RATIO = 1.2595905220901487
/** Surface angle where V = U (x = −b/2) (rad) — supplementary result, ≈ 113.2°. */
export const THETA_V_EQ_U = 1.976031468382582

/**
 * Polar angle on [0, 2π). With this branch the source's branch cut (where θ jumps by 2π, ψ by m)
 * lies on the +x axis downstream of the source — i.e. INSIDE the half-body, where it is hidden.
 */
export function theta02(x: number, y: number): number {
  const t = Math.atan2(y, x)
  return t < 0 ? t + TWO_PI : t
}

/** b = m / (2πU): source-to-stagnation-point distance (slide 16). */
export const bOf = (U: number, m: number) => m / (TWO_PI * U)

/** ψ = U r sinθ + (m/2π) θ = U y + (m/2π) θ, θ ∈ [0, 2π). */
export function psiUS(U: number, m: number) {
  const k = m / TWO_PI
  return (x: number, y: number) => U * y + k * theta02(x, y)
}

/** φ = U r cosθ + (m/2π) ln r (NaN at the source itself). */
export function phiUS(U: number, m: number) {
  const k = m / TWO_PI
  return (x: number, y: number) => {
    const r2 = x * x + y * y
    return r2 > 1e-12 ? U * x + 0.5 * k * Math.log(r2) : NaN
  }
}

/** Cartesian velocity (u, v) of uniform flow U plus a source m at the origin. */
export function velUS(U: number, m: number) {
  const k = m / TWO_PI
  return (x: number, y: number): Pt => {
    const r2 = x * x + y * y
    if (r2 < 1e-12) return [NaN, NaN]
    return [U + (k * x) / r2, (k * y) / r2]
  }
}

/** Inside test for the half-body whose nose is at x = −b (body surface y = b(π − θ)). */
export function insideHalfBody(b: number) {
  return (x: number, y: number) => {
    if (y === 0) return x > -b
    const yb = b * (Math.PI - theta02(x, y))
    return y > 0 ? y < yb : y > yb
  }
}

/** Body-surface point at polar angle θ ∈ (0, 2π): r = b(π − θ)/sinθ, y = b(π − θ). θ = π is the nose (−b, 0). */
export function bodyPoint(b: number, t: number): Pt {
  const d = Math.PI - t
  if (Math.abs(d) < 1e-7) return [-b, 0]
  const y = b * d
  return [(y * Math.cos(t)) / Math.sin(t), y]
}

/** r on the body surface at angle θ. */
export function bodyR(b: number, t: number): number {
  const d = Math.PI - t
  return Math.abs(d) < 1e-7 ? b : (b * d) / Math.sin(t)
}

/** (V/U)² anywhere: 1 + 2(b/r)cosθ + (b/r)² = 1 + b(2x + b)/r². */
export function speedRatio2(b: number, x: number, y: number): number {
  return 1 + (b * (2 * x + b)) / (x * x + y * y)
}

/** (V/U)² on the body surface as a function of θ (b/r = sinθ/(π − θ)). */
export function surfaceSpeed2(t: number): number {
  const d = Math.PI - t
  if (Math.abs(d) < 1e-7) return 0
  const s = Math.sin(t) / d
  return 1 + 2 * s * Math.cos(t) + s * s
}

/** Upper-surface angle θ ∈ (0, π) at which the body reaches abscissa X (x decreases monotonically with θ). */
export function thetaAtX(b: number, X: number): number {
  if (X <= -b) return Math.PI
  let lo = 1e-9
  let hi = Math.PI - 1e-9
  for (let i = 0; i < 80; i++) {
    const mid = 0.5 * (lo + hi)
    if (bodyPoint(b, mid)[0] > X) lo = mid
    else hi = mid
  }
  return 0.5 * (lo + hi)
}

/**
 * Sample a parametric curve t ↦ (x, y) on [t0, t1] (t1 < t0 allowed) with adaptive refinement:
 * consecutive points near the view box end up at most `step` apart; far-away parts are left coarse.
 */
export function sampleCurve(f: (t: number) => Pt, t0: number, t1: number, box: Box, step: number, n0 = 96, maxDepth = 14): Pt[] {
  const [xa, xb, ya, yb] = box
  const mx = 0.5 * (xb - xa)
  const my = 0.5 * (yb - ya)
  const near = (p: Pt) => p[0] > xa - mx && p[0] < xb + mx && p[1] > ya - my && p[1] < yb + my
  const out: Pt[] = []
  const rec = (ta: number, pa: Pt, tb: number, pb: Pt, depth: number) => {
    const d = Math.hypot(pb[0] - pa[0], pb[1] - pa[1])
    if (depth < maxDepth && d > step && (near(pa) || near(pb))) {
      const tm = 0.5 * (ta + tb)
      const pm = f(tm)
      rec(ta, pa, tm, pm, depth + 1)
      rec(tm, pm, tb, pb, depth + 1)
    } else out.push(pb)
  }
  let ta = t0
  let pa = f(t0)
  out.push(pa)
  for (let i = 1; i <= n0; i++) {
    const tb = t0 + ((t1 - t0) * i) / n0
    const pb = f(tb)
    rec(ta, pa, tb, pb, 0)
    ta = tb
    pa = pb
  }
  return out.filter((p) => Number.isFinite(p[0]) && Number.isFinite(p[1]))
}

/**
 * Upper-half streamline ψ = U·h of the half-body flow (h = ψ/U, a length):
 *   y = h − bθ,  x = y cotθ,  θ from θ_end = min(π, h/b) down to 0 (i.e. in the flow direction).
 * h > πb: outer streamline (far-upstream height h − πb, far-downstream height h);
 * h = πb: the body surface; h < πb: a source streamline leaving the origin at angle h/b.
 */
export function streamlineUpper(b: number, h: number, box: Box, step: number): Pt[] {
  if (h <= 0) return []
  const interior = h < Math.PI * b - 1e-12
  const tEnd = interior ? h / b : Math.PI
  const f = (t: number): Pt => {
    if (Math.abs(h - Math.PI * b) < 1e-12) return bodyPoint(b, t)
    const y = h - b * t
    return [(y * Math.cos(t)) / Math.sin(t), y]
  }
  const eps = 1e-6
  const pts = sampleCurve(f, tEnd - eps, eps, box, step)
  if (interior) pts.unshift([0, 0])
  return pts
}

/** Mirror a polyline in the x-axis (the flow is symmetric about y = 0). */
export const mirror = (pts: Pt[]): Pt[] => pts.map(([x, y]) => [x, -y])

/** Closed outline of the half-body cut off at x = X (upper surface from far right to the nose, then the lower surface back). */
export function bodyOutline(b: number, X: number, box: Box, step: number): Pt[] {
  const tFar = thetaAtX(b, X)
  const upper = sampleCurve((t) => bodyPoint(b, t), tFar, Math.PI, box, step)
  const lower = mirror(upper).reverse()
  return [...upper, ...lower.slice(1)]
}

/** SVG path through points mapped to pixels. */
export function toPath(pts: Pt[], sx: (v: number) => number, sy: (v: number) => number, close = false): string {
  if (!pts.length) return ''
  let d = `M${sx(pts[0][0]).toFixed(1)} ${sy(pts[0][1]).toFixed(1)}`
  for (let i = 1; i < pts.length; i++) d += `L${sx(pts[i][0]).toFixed(1)} ${sy(pts[i][1]).toFixed(1)}`
  return close ? `${d}Z` : d
}

/** Point and unit direction of a polyline at the vertex whose x is closest to `x`. */
export function pointNearX(pts: Pt[], x: number): { p: Pt; dir: Pt } | null {
  if (pts.length < 2) return null
  let best = 0
  for (let i = 1; i < pts.length; i++) if (Math.abs(pts[i][0] - x) < Math.abs(pts[best][0] - x)) best = i
  const i0 = Math.max(0, best - 1)
  const i1 = Math.min(pts.length - 1, best + 1)
  const dx = pts[i1][0] - pts[i0][0]
  const dy = pts[i1][1] - pts[i0][1]
  const L = Math.hypot(dx, dy) || 1
  return { p: pts[best], dir: [dx / L, dy / L] }
}
