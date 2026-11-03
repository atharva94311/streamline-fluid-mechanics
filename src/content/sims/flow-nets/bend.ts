/**
 * Numerical potential flow through a two-dimensional 90° bend (the geometry of Lecture 12, slide 7):
 * a straight inlet leg (flow in +x), a bend whose inner and outer walls are concentric circular arcs,
 * and a straight outlet leg (flow in −y). Channel width w, inner-wall radius a, outer-wall radius b = a + w.
 *
 * Laplace's equation is solved for ψ (Dirichlet: ψ = 0 on the inner wall, ψ = Q on the outer wall, uniform
 * profiles at the far inlet/outlet) and for φ (zero normal derivative on both walls, fixed values at the far
 * inlet/outlet, then rescaled so that |∇φ| = |∇ψ|). The grid is channel-fitted: Cartesian in the legs and
 * polar in the bend, so the walls lie exactly on grid lines. A conservative finite-volume 5-point stencil is
 * iterated with SOR. Course sign convention: u = ∂φ/∂x = ∂ψ/∂y, v = ∂φ/∂y = −∂ψ/∂x.
 */
import type { Vec } from '@/kit'

export interface Bend {
  /** channel width, inner radius, outer radius, computational leg length (m) */
  w: number
  a: number
  b: number
  L: number
  /** flow rate per unit depth (m²/s) and the uniform inlet speed Q/w (m/s) */
  Q: number
  Vin: number
  inside: (x: number, y: number) => boolean
  psi: (x: number, y: number) => number
  phi: (x: number, y: number) => number
  vel: (x: number, y: number) => Vec
  gradPhi: (x: number, y: number) => Vec
  gradPsi: (x: number, y: number) => Vec
  phiRange: [number, number]
  /** Point on the bend radius at angle `deg` (0° = end of the inlet leg, 90° = start of the outlet leg). */
  radialPoint: (deg: number, n: number) => Vec
  /** Distance from the inner wall, along that radius, at which ψ equals `level`. */
  levelN: (deg: number, level: number) => number
  /** Speed sampled across the channel along that radius. */
  radial: (deg: number, samples: number) => { n: number; V: number }[]
}

let cache: Bend | null = null

export function getBend(): Bend {
  if (!cache) cache = solveBend()
  return cache
}

function solveBend(): Bend {
  const w = 1
  const a = 0.3
  const b = a + w
  const L = 2.5
  const Q = 1
  const Vin = Q / w
  const N = 24
  const nArc = 30
  const dn = w / N
  const nLeg = Math.round(L / dn)
  const ds = L / nLeg
  const dth = Math.PI / 2 / nArc
  const i1 = nLeg
  const i2 = nLeg + nArc
  const M = i2 + nLeg
  const NX = M + 1
  const NY = N + 1
  const id = (i: number, j: number) => i * NY + j
  /** along-channel distance from node i to node i+1 at cross-channel position n */
  const seg = (i: number, n: number) => (i < i1 || i >= i2 ? ds : (a + n) * dth)

  // finite-volume coefficients (shared by ψ and φ; wall rows use half control volumes)
  const cE = new Float64Array(NX * NY)
  const cW = new Float64Array(NX * NY)
  const cN = new Float64Array(NX * NY)
  const cS = new Float64Array(NX * NY)
  for (let i = 1; i < NX - 1; i++)
    for (let j = 0; j < NY; j++) {
      const n = j * dn
      const h = j === 0 || j === N ? dn / 2 : dn
      const k = id(i, j)
      cW[k] = h / seg(i - 1, n)
      cE[k] = h / seg(i, n)
      if (j < N) cN[k] = (0.5 * (seg(i - 1, n + dn / 2) + seg(i, n + dn / 2))) / dn
      if (j > 0) cS[k] = (0.5 * (seg(i - 1, n - dn / 2) + seg(i, n - dn / 2))) / dn
    }

  const sMid = new Float64Array(NX)
  for (let i = 1; i < NX; i++) sMid[i] = sMid[i - 1] + seg(i - 1, w / 2)

  const sor = (fixedValue: (i: number, j: number) => number | null, init: (i: number, j: number) => number, omega: number) => {
    const f = new Float64Array(NX * NY)
    const fixed = new Uint8Array(NX * NY)
    for (let i = 0; i < NX; i++)
      for (let j = 0; j < NY; j++) {
        const k = id(i, j)
        const d = fixedValue(i, j)
        if (d !== null) {
          f[k] = d
          fixed[k] = 1
        } else f[k] = init(i, j)
      }
    let maxd = 1
    for (let it = 0; it < 8000 && maxd > 1e-10; it++) {
      maxd = 0
      for (let i = 1; i < NX - 1; i++)
        for (let j = 0; j < NY; j++) {
          const k = id(i, j)
          if (fixed[k]) continue
          let num = cE[k] * f[k + NY] + cW[k] * f[k - NY]
          let den = cE[k] + cW[k]
          if (j < N) {
            num += cN[k] * f[k + 1]
            den += cN[k]
          }
          if (j > 0) {
            num += cS[k] * f[k - 1]
            den += cS[k]
          }
          const d = omega * (num / den - f[k])
          f[k] += d
          const ad = d < 0 ? -d : d
          if (ad > maxd) maxd = ad
        }
    }
    return f
  }

  const PS = sor((i, j) => (j === 0 ? 0 : j === N ? Q : i === 0 || i === M ? (Q * j) / N : null), (_i, j) => (Q * j) / N, 1.85)
  const F0 = sor((i) => (i === 0 ? 0 : i === M ? 1 : null), (i) => sMid[i] / sMid[M], 1.97)
  // rescale φ so that the flux it carries through the inlet equals Q (then |∇φ| = |∇ψ|); φ = −L·Vin at the inlet
  let Qphi = 0
  for (let j = 0; j <= N; j++) Qphi += (j === 0 || j === N ? dn / 2 : dn) * ((-3 * F0[id(0, j)] + 4 * F0[id(1, j)] - F0[id(2, j)]) / (2 * ds))
  const kφ = Q / Qphi
  const PH = new Float64Array(NX * NY)
  for (let k = 0; k < PH.length; k++) PH[k] = kφ * F0[k] - L * Vin

  // nodal derivatives along n (cross-channel) and s (along-channel arc length)
  const dN = (f: Float64Array) => {
    const out = new Float64Array(NX * NY)
    for (let i = 0; i < NX; i++)
      for (let j = 0; j < NY; j++)
        out[id(i, j)] =
          j === 0
            ? (-3 * f[id(i, 0)] + 4 * f[id(i, 1)] - f[id(i, 2)]) / (2 * dn)
            : j === N
              ? (3 * f[id(i, N)] - 4 * f[id(i, N - 1)] + f[id(i, N - 2)]) / (2 * dn)
              : (f[id(i, j + 1)] - f[id(i, j - 1)]) / (2 * dn)
    return out
  }
  const dS = (f: Float64Array) => {
    const out = new Float64Array(NX * NY)
    for (let i = 0; i < NX; i++)
      for (let j = 0; j < NY; j++) {
        const n = j * dn
        if (i === 0) out[id(i, j)] = (-3 * f[id(0, j)] + 4 * f[id(1, j)] - f[id(2, j)]) / (2 * ds)
        else if (i === M) out[id(i, j)] = (3 * f[id(M, j)] - 4 * f[id(M - 1, j)] + f[id(M - 2, j)]) / (2 * ds)
        else {
          const dW = seg(i - 1, n)
          const dE = seg(i, n)
          const P = f[id(i, j)]
          out[id(i, j)] = (dW * dW * (f[id(i + 1, j)] - P) + dE * dE * (P - f[id(i - 1, j)])) / (dW * dE * (dW + dE))
        }
      }
    return out
  }
  const psiN = dN(PS)
  const psiS = dS(PS)
  const phiN = dN(PH)
  const phiS = dS(PH)

  const eps = 1e-9
  /** channel coordinates of a point: fractional node indices, region and bend angle; null outside the fluid */
  const locate = (x: number, y: number): { fi: number; fj: number; reg: 0 | 1 | 2; th: number } | null => {
    let fi: number
    let n: number
    let reg: 0 | 1 | 2
    let th = 0
    if (x <= 0 && y >= a - eps && y <= b + eps) {
      fi = (x + L) / ds
      n = y - a
      reg = 0
    } else if (x >= 0 && y >= 0) {
      const r = Math.hypot(x, y)
      if (r < a - eps || r > b + eps) return null
      th = Math.atan2(x, y)
      fi = i1 + th / dth
      n = r - a
      reg = 1
    } else if (y <= 0 && x >= a - eps && x <= b + eps) {
      fi = i2 + -y / ds
      n = x - a
      reg = 2
    } else return null
    if (fi < -eps || fi > M + eps) return null
    return { fi: Math.min(M, Math.max(0, fi)), fj: Math.min(N, Math.max(0, n / dn)), reg, th }
  }
  const interp = (f: Float64Array, fi: number, fj: number) => {
    const i0 = Math.min(M - 1, Math.floor(fi))
    const j0 = Math.min(N - 1, Math.floor(fj))
    const tx = fi - i0
    const ty = fj - j0
    const f00 = f[id(i0, j0)]
    const f10 = f[id(i0 + 1, j0)]
    const f01 = f[id(i0, j0 + 1)]
    const f11 = f[id(i0 + 1, j0 + 1)]
    return (1 - tx) * ((1 - ty) * f00 + ty * f01) + tx * ((1 - ty) * f10 + ty * f11)
  }
  /** unit vectors along the channel (e_s, flow direction) and across it (e_n, toward the outer wall) */
  const frame = (reg: 0 | 1 | 2, th: number): [Vec, Vec] =>
    reg === 0 ? [[1, 0], [0, 1]] : reg === 2 ? [[0, -1], [1, 0]] : [[Math.cos(th), -Math.sin(th)], [Math.sin(th), Math.cos(th)]]
  const toXY = (reg: 0 | 1 | 2, th: number, gs: number, gn: number): Vec => {
    const [es, en] = frame(reg, th)
    return [gs * es[0] + gn * en[0], gs * es[1] + gn * en[1]]
  }

  const inside = (x: number, y: number) => locate(x, y) !== null
  const psi = (x: number, y: number) => {
    const p = locate(x, y)
    return p ? interp(PS, p.fi, p.fj) : NaN
  }
  const phi = (x: number, y: number) => {
    const p = locate(x, y)
    return p ? interp(PH, p.fi, p.fj) : NaN
  }
  // velocity: V_s = ∂ψ/∂n, V_n = −∂ψ/∂s in the right-handed (s, n) frame
  const vel = (x: number, y: number): Vec => {
    const p = locate(x, y)
    if (!p) return [NaN, NaN]
    return toXY(p.reg, p.th, interp(psiN, p.fi, p.fj), -interp(psiS, p.fi, p.fj))
  }
  const gradPsi = (x: number, y: number): Vec => {
    const p = locate(x, y)
    if (!p) return [NaN, NaN]
    return toXY(p.reg, p.th, interp(psiS, p.fi, p.fj), interp(psiN, p.fi, p.fj))
  }
  const gradPhi = (x: number, y: number): Vec => {
    const p = locate(x, y)
    if (!p) return [NaN, NaN]
    return toXY(p.reg, p.th, interp(phiS, p.fi, p.fj), interp(phiN, p.fi, p.fj))
  }
  const radialPoint = (deg: number, n: number): Vec => {
    const t = (deg * Math.PI) / 180
    const r = a + n
    return [r * Math.sin(t), r * Math.cos(t)]
  }
  const levelN = (deg: number, level: number) => {
    let lo = 0
    let hi = w
    const f = (n: number) => psi(...radialPoint(deg, n)) - level
    let flo = f(lo)
    for (let k = 0; k < 60; k++) {
      const m = 0.5 * (lo + hi)
      const fm = f(m)
      if (Math.sign(fm) === Math.sign(flo)) {
        lo = m
        flo = fm
      } else hi = m
    }
    return 0.5 * (lo + hi)
  }
  const radial = (deg: number, samples: number) =>
    Array.from({ length: samples + 1 }, (_, k) => {
      const n = (k / samples) * w
      const [u, v] = vel(...radialPoint(deg, n))
      return { n, V: Math.hypot(u, v) }
    })

  return {
    w, a, b, L, Q, Vin, inside, psi, phi, vel, gradPhi, gradPsi,
    phiRange: [PH[id(0, 0)], PH[id(M, 0)]],
    radialPoint, levelN, radial,
  }
}
