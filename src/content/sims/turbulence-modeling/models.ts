/**
 * Numerical models shared by the turbulence-modeling sims.
 *  - Churchill correlation (9.86) for the Reynolds-stress fraction and the velocity ODE (9.88), Wilkes pp. 504–505.
 *  - k–ε constants (9.94) and the 0-D (homogeneous) k–ε equations obtained from (9.92)–(9.93) by dropping
 *    convection and diffusion (supplementary).
 *  - Example 9.4 geometry / digitised centreline pressure (Fig. E9.4.4) and simple Bernoulli/Borda–Carnot estimates.
 *  - Example 9.5 U-duct geometry (Fig. E9.5.1).
 */

/* ------------------------------------------------------------------ Churchill (9.86) */

/** Near-wall asymptote y₀ = 0.7 (y⁺/10)³ of Eq. (9.86). */
export const churchillY0 = (yp: number) => 0.7 * (yp / 10) ** 3

/** Outer asymptote y∞ = |exp(−1/0.436y⁺) − (1/0.436a⁺)(1 + 6.95y⁺/a⁺)| of Eq. (9.86). */
export const churchillYinf = (yp: number, ap: number) =>
  Math.abs(Math.exp(-1 / (0.436 * yp)) - (1 / (0.436 * ap)) * (1 + (6.95 * yp) / ap))

/** Churchill–Usagi blend (9.87): yᵖ = y₀ᵖ + y∞ᵖ. */
export const usagiBlend = (y0: number, yi: number, p: number) => (y0 ** p + yi ** p) ** (1 / p)

/** Reynolds-stress fraction f(y⁺, a⁺) = ρ v'z v'r / [τw (r/a)], Eq. (9.86) (p = −8/7). */
export function churchillF(yp: number, ap: number): number {
  if (!(yp > 0)) return 0
  return usagiBlend(churchillY0(yp), churchillYinf(yp, ap), -8 / 7)
}

export interface ChurchillProfile {
  aPlus: number
  /** v_z⁺ at the centreline. */
  vcPlus: number
  /** mean velocity in wall units v_zm⁺. */
  vmPlus: number
  /** Fanning friction factor f_F = 2 / v_zm⁺². */
  fF: number
  /** Re = 2 a⁺ v_zm⁺. */
  Re: number
  /** sampled profile [y⁺, v⁺]. */
  profile: [number, number][]
}

/**
 * Integrate dv⁺/dy⁺ = (1 − y⁺/a⁺)(1 − f) from v⁺(0) = 0 (dimensionless form of Eq. 9.88) on a log grid,
 * then v_zm⁺ = (2/a⁺²) ∫ v⁺ (a⁺ − y⁺) dy⁺, f_F = 2/v_zm⁺², Re = 2 a⁺ v_zm⁺. Trapezoidal rule.
 */
export function integrateChurchill(aPlus: number, n = 1200): ChurchillProfile {
  const g = (y: number) => (y > 0 ? (1 - y / aPlus) * (1 - churchillF(y, aPlus)) : 1)
  const ys: number[] = [0]
  for (let i = 0; i <= n; i++) ys.push(1e-3 * (aPlus / 1e-3) ** (i / n))
  const v: number[] = [0]
  for (let i = 1; i < ys.length; i++) v.push(v[i - 1] + 0.5 * (ys[i] - ys[i - 1]) * (g(ys[i - 1]) + g(ys[i])))
  let I = 0
  for (let i = 1; i < ys.length; i++) {
    const h = ys[i] - ys[i - 1]
    I += 0.5 * h * (v[i - 1] * (aPlus - ys[i - 1]) + v[i] * (aPlus - ys[i]))
  }
  const vmPlus = (2 / aPlus ** 2) * I
  const profile: [number, number][] = []
  const stride = Math.max(1, Math.floor(ys.length / 240))
  for (let i = 1; i < ys.length; i += stride) profile.push([ys[i], v[i]])
  return { aPlus, vcPlus: v[v.length - 1], vmPlus, fF: 2 / vmPlus ** 2, Re: 2 * aPlus * vmPlus, profile }
}

/** Pre-computed table a⁺ → Re for inverting the slider (Re is monotonic in a⁺). */
const A_TABLE: { aPlus: number; Re: number }[] = (() => {
  const out: { aPlus: number; Re: number }[] = []
  for (let i = 0; i <= 48; i++) {
    const ap = 80 * (40000 / 80) ** (i / 48)
    out.push({ aPlus: ap, Re: integrateChurchill(ap, 500).Re })
  }
  return out
})()

/** a⁺ that gives the requested Re (log-log interpolation in the pre-computed table). */
export function aPlusForRe(Re: number): number {
  const t = A_TABLE
  if (Re <= t[0].Re) return t[0].aPlus
  if (Re >= t[t.length - 1].Re) return t[t.length - 1].aPlus
  let i = 1
  while (t[i].Re < Re) i++
  const a = t[i - 1]
  const b = t[i]
  const s = Math.log(Re / a.Re) / Math.log(b.Re / a.Re)
  return a.aPlus * (b.aPlus / a.aPlus) ** s
}

/** Experimental smooth-pipe law (9.53): √(1/f_F) = 1.74 ln(Re √f_F) − 0.391, solved by fixed-point iteration. */
export function fanning953(Re: number): number {
  let f = 0.005
  for (let i = 0; i < 80; i++) f = 1 / (1.74 * Math.log(Re * Math.sqrt(f)) - 0.391) ** 2
  return f
}

/** y⁺ at which the Reynolds stress carries exactly half of the local total stress (f = 0.5). */
export function crossoverYPlus(aPlus: number): number {
  let lo = 0.5
  let hi = 200
  for (let i = 0; i < 60; i++) {
    const m = Math.sqrt(lo * hi)
    if (churchillF(m, aPlus) < 0.5) lo = m
    else hi = m
  }
  return Math.sqrt(lo * hi)
}

/* ------------------------------------------------------------------ k–ε (9.91)–(9.94) */

export const KE = { Cmu: 0.09, Ce1: 1.44, Ce2: 1.92, sk: 1.0, se: 1.3 } as const

export const nuT = (k: number, eps: number, Cmu: number = KE.Cmu) => (Cmu * k * k) / eps

/**
 * Homogeneous (0-D) k–ε model in dimensionless form, t̂ = t ε₀/k₀, k̂ = k/k₀, ε̂ = ε/ε₀, Ŝ = S k₀/ε₀:
 *   dk̂/dt̂ = Cμ Ŝ² k̂²/ε̂ − ε̂,  dε̂/dt̂ = Cε1 Cμ Ŝ² k̂ − Cε2 ε̂²/k̂.
 * With Ŝ = 0 this is decaying turbulence with the exact solution k̂ = (1 + (Cε2 − 1) t̂)^(−1/(Cε2−1)).
 */
export function homogeneousKE(
  S: number,
  Ce2: number,
  tEnd: number,
  n = 400,
  Ce1: number = KE.Ce1,
): { t: number; k: number; e: number }[] {
  const rhs = (k: number, e: number): [number, number] => [
    KE.Cmu * S * S * (k * k) / e - e,
    Ce1 * KE.Cmu * S * S * k - Ce2 * (e * e) / k,
  ]
  // log-spaced output times; RK4 sub-steps between them
  const out = [{ t: 0, k: 1, e: 1 }]
  let k = 1
  let e = 1
  let t = 0
  for (let i = 1; i <= n; i++) {
    const tNext = 1e-3 * (tEnd / 1e-3) ** (i / n)
    const sub = 8
    const h = (tNext - t) / sub
    for (let j = 0; j < sub; j++) {
      const [a1, b1] = rhs(k, e)
      const [a2, b2] = rhs(k + 0.5 * h * a1, e + 0.5 * h * b1)
      const [a3, b3] = rhs(k + 0.5 * h * a2, e + 0.5 * h * b2)
      const [a4, b4] = rhs(k + h * a3, e + h * b3)
      k += (h / 6) * (a1 + 2 * a2 + 2 * a3 + a4)
      e += (h / 6) * (b1 + 2 * b2 + 2 * b3 + b4)
      if (!(k > 1e-12) || !(e > 1e-12) || !Number.isFinite(k) || !Number.isFinite(e)) return out
    }
    t = tNext
    out.push({ t, k, e })
  }
  return out
}

/* ------------------------------------------------------------------ Example 9.4 (orifice plate) */

export const FT = 0.3048
/** Example 9.4 data in SI (converted from ft, lbm/ft³, ft²/s). */
export const EX94 = {
  rho: 62.4 * 16.018463, // kg/m³
  nu: 1.077e-5 * FT * FT, // m²/s
  D: 0.1 * FT,
  L: 0.5 * FT,
  b: 0.1 * FT,
  plateT: 0.01 * FT,
  tipR: 0.005 * FT,
  dOrifice: 0.05 * FT,
  vIn: 1.0 * FT,
  vMaxBook: 1.48, // m/s, printed p.513
}

/** Fig. E9.4.4 centreline pressure (Pa) vs distance from inlet (m), digitised from the printed figure. */
export const FIG_E944: [number, number][] = [
  [0, 716], [0.005, 715], [0.01, 715], [0.015, 709], [0.017, 704], [0.02, 691], [0.0215, 678], [0.023, 659],
  [0.0235, 650], [0.025, 614], [0.0254, 600], [0.0267, 550], [0.0276, 500], [0.0284, 450], [0.0291, 400],
  [0.0297, 350], [0.0303, 300], [0.0308, 250], [0.0313, 200], [0.0319, 150], [0.0324, 100], [0.033, 50],
  [0.0336, 0], [0.0342, -50], [0.0349, -100], [0.0357, -150], [0.0368, -200], [0.0383, -250], [0.04, -284],
  [0.043, -315], [0.047, -328], [0.051, -331], [0.055, -330], [0.06, -321], [0.0665, -298], [0.07, -282],
  [0.074, -260], [0.08, -225], [0.09, -168], [0.1, -117], [0.11, -74], [0.12, -42], [0.13, -22], [0.14, -9],
  [0.147, -5], [0.152, -8],
]

export interface OrificeEstimate {
  vOrifice: number
  vVC: number
  dropToVC: number
  loss: number
  recovery: number
}

/** Continuity + Bernoulli (inlet → vena contracta) + Borda–Carnot expansion loss (vena contracta → full pipe). */
export function orificeEstimate(vIn: number, beta: number, Cc: number, rho: number): OrificeEstimate {
  const vOrifice = vIn / (beta * beta)
  const vVC = vOrifice / Cc
  const dropToVC = 0.5 * rho * (vVC * vVC - vIn * vIn)
  const loss = 0.5 * rho * (vVC - vIn) ** 2
  return { vOrifice, vVC, dropToVC, loss, recovery: dropToVC - loss }
}

/** Schematic centreline-pressure model (Pa, outlet = 0) along z ∈ [0, L]; plate face at zp, vena contracta at zvc. */
export function orificePressure(z: number, est: OrificeEstimate, zp: number, zvc: number, L: number, D: number): number {
  const pIn = est.loss
  const pMin = pIn - est.dropToVC
  if (z <= zvc) {
    // smootherstep from zₐ (0.6 D upstream of the plate) to the vena contracta: steepest at the plate, zero slope at the minimum
    const za = Math.max(0, zp - 0.6 * D)
    const t = Math.min(1, Math.max(0, (z - za) / (zvc - za)))
    return pIn - est.dropToVC * (t * t * t * (t * (6 * t - 15) + 10))
  }
  const lam = 1.1 * D
  const x = (z - zvc) / lam
  const xe = (L - zvc) / lam
  const g = (q: number) => 1 - Math.exp(-q) * (1 + q) // S-shaped rise with zero slope at the vena contracta
  return pMin + (0 - pMin) * (g(x) / g(xe))
}

export const smooth = (t: number) => {
  const u = Math.min(1, Math.max(0, t))
  return u * u * (3 - 2 * u)
}

export interface OrificeJet {
  R: number
  rTip: number
  rVC: number
  zp1: number
  zp2: number
  zvc: number
  zr: number
  /** jet (through-flow) radius at z. */
  h: (z: number) => number
}

/**
 * Schematic time-averaged jet boundary for the orifice of Example 9.4 (geometry from Steps 4–8), with the
 * orifice radius set by β = d/D. The vena-contracta position (≈0.57 D past the plate) and reattachment
 * (≈2.4 D past the plate for β = 0.5) follow the book's figures; the β-dependence is a qualitative assumption.
 */
export function orificeJet(beta: number, Cc: number, g = EX94): OrificeJet {
  const D = g.D
  const R = D / 2
  const rTip = beta * R
  const rVC = rTip * Math.sqrt(Cc)
  const zp1 = g.b
  const zp2 = g.b + g.plateT
  const za = zp1 - 0.6 * D
  const zvc = zp2 + 0.57 * D
  const zr = zp2 + 2.44 * D * (1 + 1.6 * (0.5 - beta))
  const h = (z: number) => {
    if (z <= za) return R
    if (z <= zp2) return R - (R - rTip) * smooth((z - za) / (zp2 - za))
    if (z <= zvc) return rTip - (rTip - rVC) * smooth((z - zp2) / (zvc - zp2))
    if (z <= zr) return rVC + (R - rVC) * smooth((z - zvc) / (zr - zvc))
    return R
  }
  return { R, rTip, rVC, zp1, zp2, zvc, zr, h }
}

/* ------------------------------------------------------------------ Example 9.5 (U-duct) */

/** Fluid boundary (m), from the rectangles of Steps 3–5 (r1 minus r2–r5). */
export const UDUCT_POLY: [number, number][] = [
  [0, 0], [2.5, 0], [2.5, 0.2], [3.0, 0.2], [3.0, 0], [4, 0], [4, 1], [0, 1], [0, 0.9], [0.5, 0.9], [0.5, 0.7],
  [0, 0.7], [0, 0.6], [3.5, 0.6], [3.5, 0.4], [2.0, 0.4], [2.0, 0.2], [1.5, 0.2], [1.5, 0.4], [0, 0.4],
]

/** Solid rectangles r2–r5: [x, y, width, height] (m). */
export const UDUCT_RECTS: { id: string; x: number; y: number; w: number; h: number }[] = [
  { id: 'r2', x: 0, y: 0.4, w: 3.5, h: 0.2 },
  { id: 'r3', x: 0, y: 0.7, w: 0.5, h: 0.2 },
  { id: 'r4', x: 1.5, y: 0.2, w: 0.5, h: 0.2 },
  { id: 'r5', x: 2.5, y: 0, w: 0.5, h: 0.2 },
]

export const EX95 = { rho: 1.18, nu: 1.83e-5, V1: 30, V2: 10, w: 0.1, W: 0.4, gap: 0.2, nuTmax: 0.17 }
