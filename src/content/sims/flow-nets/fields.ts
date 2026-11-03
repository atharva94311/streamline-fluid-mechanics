/**
 * Plane potential flows used by the flow-net simulations. Course sign convention (Lecture 12, slide 3):
 *   u = ∂φ/∂x = ∂ψ/∂y,   v = ∂φ/∂y = −∂ψ/∂x,   v_r = ∂φ/∂r = (1/r)∂ψ/∂θ,   v_θ = (1/r)∂φ/∂θ = −∂ψ/∂r.
 * Units: lengths in m, φ and ψ in m²/s, velocities in m/s.
 */
import { md, type FlowMarker, type Vec } from '@/kit'
import { getBend } from './bend'

export type Fn2 = (x: number, y: number) => number

/* ---------------------------------------------------------------- elementary analytic fields */

const C30 = Math.cos(Math.PI / 6)
const S30 = Math.sin(Math.PI / 6)

/** Uniform flow, U = 1 m/s at α = 30° to the x axis. */
export const uniform = {
  phi: (x: number, y: number) => x * C30 + y * S30,
  psi: (x: number, y: number) => y * C30 - x * S30,
  vel: (): Vec => [C30, S30],
}
/** 90° corner (stagnation-point) flow, A = 1 s⁻¹: φ = ½A(x² − y²), ψ = Axy. */
export const corner = {
  phi: (x: number, y: number) => 0.5 * (x * x - y * y),
  psi: (x: number, y: number) => x * y,
  vel: (x: number, y: number): Vec => [x, -y],
}
/** Line source with m/2π = 1 m²/s: φ = (m/2π) ln r, ψ = (m/2π) θ. */
export const source = {
  phi: (x: number, y: number) => 0.5 * Math.log(x * x + y * y),
  psi: (x: number, y: number) => Math.atan2(y, x),
  vel: (x: number, y: number): Vec => {
    const r2 = x * x + y * y
    return [x / r2, y / r2]
  },
}
/** Free vortex, K = 1 m²/s (counter-clockwise): φ = Kθ, ψ = −K ln r. */
export const vortex = {
  phi: (x: number, y: number) => Math.atan2(y, x),
  psi: (x: number, y: number) => -0.5 * Math.log(x * x + y * y),
  vel: (x: number, y: number): Vec => {
    const r2 = x * x + y * y
    return [-y / r2, x / r2]
  },
}
/** Fox Example 6.10: ψ = a(x² − y²), a = 3 s⁻¹ → u = −6y, v = −6x; course-convention φ = −6xy. */
export const fox610 = {
  psi: (x: number, y: number) => 3 * (x * x - y * y),
  phi: (x: number, y: number) => -6 * x * y,
  vel: (x: number, y: number): Vec => [-6 * y, -6 * x],
}

/* ---------------------------------------------------------------- numerics */

/** Wrap a difference into (−P/2, P/2] for multivalued functions (P = jump across the branch cut). */
export const unwrap = (d: number, period?: number) => (period ? d - period * Math.round(d / period) : d)

/** Central-difference gradient of f at (x, y). */
export function gradient(f: Fn2, x: number, y: number, h: number, period?: number): Vec {
  return [unwrap(f(x + h, y) - f(x - h, y), period) / (2 * h), unwrap(f(x, y + h) - f(x, y - h), period) / (2 * h)]
}

/** ∂f/∂r and (1/r)∂f/∂θ at polar point (r, θ) by central differences. */
export function polarDerivs(f: Fn2, r: number, th: number, h: number, period?: number): Vec {
  const at = (rr: number, tt: number) => f(rr * Math.cos(tt), rr * Math.sin(tt))
  const dr = unwrap(at(r + h, th) - at(r - h, th), period) / (2 * h)
  const dt = unwrap(at(r, th + h / r) - at(r, th - h / r), period) / (2 * (h / r))
  return [dr, dt / r]
}

/** Contour levels k·h inside [lo, hi] (optionally dropping the end values, e.g. wall streamlines). */
export function levelsFor(range: [number, number], h: number, dropEnds = false, maxCount = 90): number[] {
  const out: number[] = []
  if (!(h > 0)) return out
  const k0 = Math.ceil(range[0] / h - 1e-9)
  const k1 = Math.floor(range[1] / h + 1e-9)
  for (let k = k0; k <= k1 && out.length < maxCount; k++) {
    const L = +(k * h).toPrecision(12)
    if (dropEnds && (Math.abs(L - range[0]) < 1e-9 || Math.abs(L - range[1]) < 1e-9)) continue
    out.push(L)
  }
  return out
}

/**
 * Walk from p along unit direction d until f reaches `level`; returns the distance (or null if the level is
 * not met within maxDist, e.g. because the walk leaves the fluid). Multivalued f is unwrapped on the way.
 */
export function distanceToLevel(f: Fn2, p: Vec, d: Vec, level: number, maxDist: number, period?: number): number | null {
  const steps = 240
  const ds = maxDist / steps
  let prevT = 0
  let prevV = f(p[0], p[1])
  if (!Number.isFinite(prevV)) return null
  if (Math.abs(prevV - level) < 1e-12) return 0
  for (let k = 1; k <= steps; k++) {
    const t = k * ds
    const raw = f(p[0] + d[0] * t, p[1] + d[1] * t)
    if (!Number.isFinite(raw)) {
      // left the fluid: accept the wall if the last value sits on the level (walls are streamlines)
      let lo = prevT
      let hi = t
      for (let it = 0; it < 40; it++) {
        const m = 0.5 * (lo + hi)
        if (Number.isFinite(f(p[0] + d[0] * m, p[1] + d[1] * m))) lo = m
        else hi = m
      }
      const fw = f(p[0] + d[0] * lo, p[1] + d[1] * lo)
      return Math.abs(fw - level) < 1e-3 * Math.max(1, Math.abs(level)) ? lo : null
    }
    const v = prevV + unwrap(raw - prevV, period)
    if ((prevV - level) * (v - level) <= 0) {
      let lo = prevT
      let hi = t
      let flo = prevV - level
      for (let it = 0; it < 50; it++) {
        const m = 0.5 * (lo + hi)
        const fm = prevV + unwrap(f(p[0] + d[0] * m, p[1] + d[1] * m) - prevV, period) - level
        if (Math.sign(fm) === Math.sign(flo)) {
          lo = m
          flo = fm
        } else hi = m
      }
      return 0.5 * (lo + hi)
    }
    prevT = t
    prevV = v
  }
  return null
}

/* ---------------------------------------------------------------- flow-net presets */

export type NetId = 'uniform' | 'corner' | 'source' | 'fox610' | 'bend'

export interface NetPreset {
  id: NetId
  /** short label for the selector (may contain $TeX$) */
  label: string
  /** one-line description (markdown) */
  blurb: string
  x: [number, number]
  y: [number, number]
  psi: Fn2
  phi: Fn2
  vel: (x: number, y: number) => Vec
  gradPsi?: (x: number, y: number) => Vec
  gradPhi?: (x: number, y: number) => Vec
  psiPeriod?: number
  phiPeriod?: number
  psiRange: [number, number]
  phiRange: [number, number]
  dropWallLevels?: boolean
  /** level spacing Δψ = Δφ (m²/s): default and slider range */
  h: { def: number; min: number; max: number }
  probe: Vec
  Uref: number
  markers?: FlowMarker[]
  body?: (x: number, y: number) => boolean
  /** reference speed for the pressure readout (only where a physical reference exists) */
  Vin?: number
}

const ORIGIN_STAG: FlowMarker[] = [{ x: 0, y: 0, kind: 'stagnation', label: 'stagnation point' }]

const STATIC: Record<Exclude<NetId, 'bend'>, NetPreset> = {
  uniform: {
    id: 'uniform', label: 'Uniform', blurb: md`Uniform flow $U = 1$ m/s at $\alpha = 30^\circ$: $\phi = U(x\cos\alpha + y\sin\alpha)$, $\psi = U(y\cos\alpha - x\sin\alpha)$.`,
    x: [-2, 2], y: [-2, 2], ...uniform, psiRange: [-2.8, 2.8], phiRange: [-2.8, 2.8],
    h: { def: 0.25, min: 0.1, max: 0.6 }, probe: [0.35, 0.3], Uref: 1,
  },
  corner: {
    id: 'corner', label: '90° corner', blurb: md`Flow into a 90° corner, $A = 1\ \mathrm{s^{-1}}$: $\phi = \tfrac12 A(x^2 - y^2)$, $\psi = Axy$; the walls $x = 0$ and $y = 0$ are the streamline $\psi = 0$.`,
    x: [0, 2], y: [0, 2], ...corner, psiRange: [0, 4], phiRange: [-2, 2], dropWallLevels: false,
    h: { def: 0.25, min: 0.1, max: 0.5 }, probe: [1.1, 0.7], Uref: 1.4, markers: ORIGIN_STAG,
  },
  source: {
    id: 'source', label: 'Source', blurb: md`Line source with $m/2\pi = 1$ m²/s: $\phi = \tfrac{m}{2\pi}\ln r$, $\psi = \tfrac{m}{2\pi}\theta$ (radial streamlines, circular equipotentials).`,
    x: [-2, 2], y: [-2, 2], ...source, psiPeriod: 2 * Math.PI, psiRange: [-Math.PI, Math.PI], phiRange: [-2.6, 1.05],
    h: { def: Math.PI / 12, min: 0.12, max: 0.6 }, probe: [0.9, 0.45], Uref: 0.8,
    markers: [{ x: 0, y: 0, kind: 'source' }],
  },
  fox610: {
    id: 'fox610', label: 'Fox Ex. 6.10', blurb: md`Fox Example 6.10: $\psi = a(x^2 - y^2)$, $a = 3\ \mathrm{s^{-1}}$; course-convention $\phi = -2axy$. Both families are rectangular hyperbolas.`,
    x: [-2, 2], y: [-2, 2], ...fox610, psiRange: [-12, 12], phiRange: [-24, 24],
    h: { def: 1.5, min: 0.75, max: 3 }, probe: [1, 0.5], Uref: 6, markers: ORIGIN_STAG,
  },
}

let bendPreset: NetPreset | null = null

export function getNetPreset(id: NetId): NetPreset {
  if (id !== 'bend') return STATIC[id]
  if (!bendPreset) {
    const B = getBend()
    bendPreset = {
      id: 'bend', label: '90° bend',
      blurb: md`2-D channel bend of Lecture 12, slide 7 (width $w = 1$ m, inner-wall radius $0.3w$, $V_\text{in} = 1$ m/s, $q = 1$ m²/s), solved numerically from Laplace's equation.`,
      x: [-1.5, 1.42], y: [-1.5, 1.42], psi: B.psi, phi: B.phi, vel: B.vel, gradPsi: B.gradPsi, gradPhi: B.gradPhi,
      psiRange: [0, B.Q], phiRange: B.phiRange, dropWallLevels: true,
      h: { def: 0.25, min: 0.0625, max: 0.5 }, probe: B.radialPoint(45, 0.82), Uref: B.Vin, Vin: B.Vin,
      body: (x, y) => !B.inside(x, y),
    }
  }
  return bendPreset
}

/* ---------------------------------------------------------------- presets for the velocity-routes sim */

export type RouteId = 'corner' | 'uniform' | 'source' | 'vortex'

export interface RoutePreset {
  id: RouteId
  label: string
  phi: Fn2
  psi: Fn2
  vel: (x: number, y: number) => Vec
  phiPeriod?: number
  psiPeriod?: number
  psiLevels: number[]
  phiLevels: number[]
  markers?: FlowMarker[]
  Uref: number
  /** Cartesian and polar forms (markdown) */
  cart: string
  polar: string
  comps: string
}

const range = (a: number, b: number, h: number) => levelsFor([a, b], h)

export const ROUTES: Record<RouteId, RoutePreset> = {
  corner: {
    id: 'corner', label: 'Corner flow', ...corner, psiLevels: range(-4, 4, 0.25), phiLevels: range(-2, 2, 0.25), Uref: 1.2,
    markers: [{ x: 0, y: 0, kind: 'stagnation' }],
    cart: md`$\phi = \tfrac12 A(x^2-y^2)$, $\psi = Axy$ with $A = 1\ \mathrm{s^{-1}}$`,
    polar: md`$\phi = \tfrac12 A r^2\cos 2\theta$, $\psi = \tfrac12 A r^2 \sin 2\theta$`,
    comps: md`$u = Ax,\ v = -Ay$;  $v_r = Ar\cos 2\theta,\ v_\theta = -Ar\sin 2\theta$`,
  },
  uniform: {
    id: 'uniform', label: 'Uniform (α = 30°)', ...uniform, psiLevels: range(-2.8, 2.8, 0.25), phiLevels: range(-2.8, 2.8, 0.25), Uref: 1,
    cart: md`$\phi = U(x\cos\alpha + y\sin\alpha)$, $\psi = U(y\cos\alpha - x\sin\alpha)$, $U = 1$ m/s, $\alpha = 30^\circ$`,
    polar: md`$\phi = Ur\cos(\theta-\alpha)$, $\psi = Ur\sin(\theta-\alpha)$`,
    comps: md`$u = U\cos\alpha,\ v = U\sin\alpha$;  $v_r = U\cos(\theta-\alpha),\ v_\theta = -U\sin(\theta-\alpha)$`,
  },
  source: {
    id: 'source', label: 'Source', ...source, psiPeriod: 2 * Math.PI, psiLevels: range(-Math.PI, Math.PI, Math.PI / 8),
    phiLevels: range(-2.4, 1.1, Math.PI / 8), Uref: 0.8, markers: [{ x: 0, y: 0, kind: 'source' }],
    cart: md`$\phi = \tfrac{m}{4\pi}\ln(x^2+y^2)$, $\psi = \tfrac{m}{2\pi}\tan^{-1}(y/x)$ with $m/2\pi = 1$ m²/s`,
    polar: md`$\phi = \tfrac{m}{2\pi}\ln r$, $\psi = \tfrac{m}{2\pi}\theta$`,
    comps: md`$v_r = \dfrac{m}{2\pi r},\ v_\theta = 0$ — one polar component instead of two Cartesian ones`,
  },
  vortex: {
    id: 'vortex', label: 'Free vortex', ...vortex, phiPeriod: 2 * Math.PI, psiLevels: range(-1.1, 2.4, Math.PI / 8),
    phiLevels: range(-Math.PI, Math.PI, Math.PI / 8), Uref: 0.8, markers: [{ x: 0, y: 0, kind: 'vortex' }],
    cart: md`$\phi = K\tan^{-1}(y/x)$, $\psi = -\tfrac{K}{2}\ln(x^2+y^2)$ with $K = 1$ m²/s`,
    polar: md`$\phi = K\theta$, $\psi = -K\ln r$`,
    comps: md`$v_r = 0,\ v_\theta = \dfrac{K}{r}$ — purely tangential`,
  },
}

