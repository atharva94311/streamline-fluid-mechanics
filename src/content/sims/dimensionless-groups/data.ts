/**
 * Shared data for the "dimensionless-groups" sims: fluid property presets (typical handbook values,
 * supplementary — NOT from the course PDFs) and the group / force-estimate formulas of Fox §7.4
 * (Eqs. 7.11–7.16) and Lecture 13 slide 21.
 */

export const G = 9.81 // m/s²
export const P_ATM = 101_325 // Pa

export type FluidKey = 'water' | 'air' | 'oil' | 'mercury'

export interface Fluid {
  key: FluidKey
  label: string
  long: string
  /** density, kg/m³ */
  rho: number
  /** dynamic viscosity, Pa·s */
  mu: number
  /** surface tension against air, N/m (null for a gas: no free surface of its own) */
  sigma: number | null
  /** speed of sound, m/s */
  c: number
  /** vapour pressure, Pa (null for a gas) */
  pv: number | null
}

/** Typical values near 20 °C and 1 atm (rounded handbook values; oil values are approximate). */
export const FLUIDS: Record<FluidKey, Fluid> = {
  water: { key: 'water', label: 'water', long: 'water, 20 °C', rho: 998, mu: 1.0e-3, sigma: 0.0728, c: 1481, pv: 2340 },
  air: { key: 'air', label: 'air', long: 'air, 20 °C, 1 atm', rho: 1.204, mu: 1.81e-5, sigma: null, c: 343.2, pv: null },
  oil: { key: 'oil', label: 'engine oil', long: 'engine oil, ≈20 °C (approx.)', rho: 890, mu: 0.8, sigma: 0.03, c: 1450, pv: 0 },
  mercury: { key: 'mercury', label: 'mercury', long: 'mercury, 20 °C', rho: 13550, mu: 1.55e-3, sigma: 0.484, c: 1450, pv: 0.16 },
}

/** Bulk modulus from the sound speed, E_v = ρc² (Fox p. 257: c = √(E_v/ρ)). */
export const bulkModulus = (f: Fluid) => f.rho * f.c * f.c

/** Order-of-magnitude force estimates of Fox p. 255 (all in newtons). */
export function forceEstimates(f: Fluid, V: number, L: number, dp: number) {
  const Ev = bulkModulus(f)
  return {
    inertia: f.rho * V * V * L * L,
    viscous: f.mu * V * L,
    pressure: dp * L * L,
    gravity: G * f.rho * L * L * L,
    surface: f.sigma == null ? null : f.sigma * L,
    compress: Ev * L * L,
  }
}

/** The named groups. Eu and Ca (cavitation) use Fox's ½ρV² denominators (Eqs. 7.12, 7.13). */
export function groups(f: Fluid, V: number, L: number, dp: number, freq: number, pAmb = P_ATM) {
  const q = 0.5 * f.rho * V * V
  return {
    Re: (f.rho * V * L) / f.mu,
    Fr: V / Math.sqrt(G * L),
    Eu: dp / q,
    Cav: f.pv == null ? null : (pAmb - f.pv) / q,
    We: f.sigma == null ? null : (f.rho * V * V * L) / f.sigma,
    Ma: V / f.c,
    Cauchy: (f.rho * V * V) / bulkModulus(f),
    St: (freq * L) / V,
  }
}

/** Format a positive number as "1.23 × 10⁴" style text for SVG labels. */
export function sci(x: number, sig = 3): string {
  if (!Number.isFinite(x)) return '—'
  if (x === 0) return '0'
  const e = Math.floor(Math.log10(Math.abs(x)))
  if (e >= -2 && e <= 3) return String(+x.toPrecision(sig))
  const m = x / 10 ** e
  return `${+m.toPrecision(sig)}×10${sup(e)}`
}

const SUP: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }
export const sup = (n: number) =>
  String(n)
    .split('')
    .map((ch) => SUP[ch] ?? ch)
    .join('')

export const MATH_FONT = 'KaTeX_Math, "Times New Roman", serif'
export const MAIN_FONT = 'KaTeX_Main, "Times New Roman", serif'
