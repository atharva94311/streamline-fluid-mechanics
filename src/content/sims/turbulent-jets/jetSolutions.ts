/**
 * Similarity solutions for turbulent jets (Wilkes §9.14) — shared by the turbulent-jets sims and topic.
 *
 *  - Plane jet, mixing-length model: f f' = (f'')²  (Eq. 9.115), f(0) = 0, f'(0) = 1, integrated with num.rk4.
 *    Written as two first-order ODEs  f' = g,  g' = −√(f g)   (f'' < 0 for ζ > 0).
 *  - Plane jet, eddy-viscosity model: f = tanh ζ, f' = sech² ζ  (Eq. 9.123).
 *  - Round jet (constant ν_T): Eqs. (9.132)–(9.134).
 */
import { num } from '@/kit'

/** Reichardt's constants for the mixing-length plane jet (Wilkes p. 528). */
export const BETA_ML = 7.67
export const ALPHA_ML = 0.0333
/** Exact edge of the mixing-length profile, from the first integral f'^{3/2} + f^{3/2} = 1:  ζ_e = 4π/(3√3). */
export const ZETA_EDGE = (4 * Math.PI) / (3 * Math.sqrt(3))
/** ∫ f'² dζ over the whole mixing-length jet (−ζ_e … ζ_e) = (4/3)·B(2/3, 5/3). */
export const I_ML = 1.36893
/** ζ at which f' = ½ for the mixing-length solution. */
export const ZETA_HALF_ML = 0.9555
/** ζ at which sech²ζ = ½ (tanh model):  arccosh √2. */
export const ZETA_HALF_TANH = Math.acosh(Math.SQRT2)
/** ζ at which (1 + ζ²/4)^{-2} = ½ (round jet):  2√(√2 − 1). */
export const ZETA_HALF_ROUND = 2 * Math.sqrt(Math.SQRT2 - 1)
/** Reichardt's round-jet constant, read dimensionally as ν_T = K √(Ṁ/ρ) (Wilkes p. 532 prints ν_Tρ/Ṁ = 0.0161). */
export const K_REICHARDT = 0.0161

export interface MLTable {
  z: number[]
  f: number[]
  fp: number[]
  h: number
}

/** RK4 integration of (9.115) from ζ = 0 with f = 0, f' = 1 (the book's starting values). */
export function solveMixingLength(steps = 1200, zMax = 2.6): MLTable {
  const rhs = (_t: number, y: number[]) => {
    const g = Math.max(y[1], 0)
    return [g, -Math.sqrt(Math.max(y[0] * g, 0))]
  }
  const out = num.rk4(rhs, [0, 1], 0, zMax, steps)
  const z: number[] = []
  const f: number[] = []
  const fp: number[] = []
  for (const [t, y] of out) {
    z.push(t)
    f.push(Math.min(y[0], 1.5))
    fp.push(Math.max(y[1], 0))
  }
  return { z, f, fp, h: zMax / steps }
}

const ML = solveMixingLength()

function interp(tab: MLTable, key: 'f' | 'fp', a: number): number {
  const i = Math.min(tab.z.length - 2, Math.floor(a / tab.h))
  const t = (a - tab.z[i]) / tab.h
  return tab[key][i] * (1 - t) + tab[key][i + 1] * t
}

/** Mixing-length profile at any ζ (f odd, f' even); beyond the edge f = ±1, f' = 0. */
export function mlProfile(zeta: number, tab: MLTable = ML): { f: number; fp: number } {
  const a = Math.abs(zeta)
  const s = zeta < 0 ? -1 : 1
  if (a >= Math.min(ZETA_EDGE, tab.z[tab.z.length - 1])) return { f: s * Math.min(1, interp(tab, 'f', Math.min(a, tab.z[tab.z.length - 1]))), fp: 0 }
  return { f: s * interp(tab, 'f', a), fp: interp(tab, 'fp', a) }
}

/** Eddy-viscosity (tanh) profile. */
export function tanhProfile(zeta: number): { f: number; fp: number } {
  const c = Math.cosh(zeta)
  return { f: Math.tanh(zeta), fp: 1 / (c * c) }
}

/** Transverse similarity velocity ζ f' − f/2 (Fig. 9.16 blue curve). */
export const transverse = (p: { f: number; fp: number }, zeta: number) => zeta * p.fp - p.f / 2

/* ------------------------------------------------------------------ */
/* Dimensional jets                                                    */
/* ------------------------------------------------------------------ */

export type JetModel = 'ml' | 'tanh' | 'round'

export interface JetState {
  model: JetModel
  /** exit velocity, m/s */
  U0: number
  /** slot width (plane) or nozzle diameter (round), m */
  d0: number
}

/** Kinematic momentum flux Ṁ/ρ for a uniform exit profile: U0² h0 (m³/s², plane, per unit depth) or U0² π d0²/4 (m⁴/s², round). */
export function kinematicMomentum(s: JetState): number {
  return s.model === 'round' ? (s.U0 * s.U0 * Math.PI * s.d0 * s.d0) / 4 : s.U0 * s.U0 * s.d0
}

/** Initial volume flow: U0 h0 (m²/s per unit depth) or U0 π d0²/4 (m³/s). */
export function exitFlow(s: JetState): number {
  return s.model === 'round' ? (s.U0 * Math.PI * s.d0 * s.d0) / 4 : s.U0 * s.d0
}

export interface JetPoint {
  /** axial velocity, m/s */
  u: number
  /** transverse / radial velocity, m/s (signed with y) */
  v: number
}

/**
 * Mean velocity at (x, y) for each model. x = distance from the (virtual) origin at the slot, y = transverse
 * coordinate (for the round jet, y is the signed radius in a meridional plane).
 */
export function jetVelocity(s: JetState, x: number, y: number): JetPoint {
  const K = kinematicMomentum(s)
  if (s.model === 'ml') {
    const gamma = Math.sqrt(K / (BETA_ML * I_ML))
    const zeta = (BETA_ML * y) / x
    const p = mlProfile(zeta)
    const sx = Math.sqrt(x)
    return { u: (BETA_ML * gamma * p.fp) / sx, v: (gamma * transverse(p, zeta)) / sx }
  }
  if (s.model === 'tanh') {
    // β assumed = 7.67; βγ = 1 so that (9.118) gives v̄xc = V/√x;  Ṁ/ρ = (4/3) V²/β.
    const beta = BETA_ML
    const gamma = 1 / beta
    const V = Math.sqrt((3 * beta * K) / 4)
    const zeta = (beta * y) / x
    const p = tanhProfile(zeta)
    const sx = Math.sqrt(x)
    return { u: (beta * gamma * V * p.fp) / sx, v: (gamma * V * transverse(p, zeta)) / sx }
  }
  // round jet
  const nuT = K_REICHARDT * Math.sqrt(K)
  const S = Math.sqrt((3 * K) / Math.PI)
  const zeta = (S * Math.abs(y)) / (4 * nuT * x)
  const D = 1 + (zeta * zeta) / 4
  const u = (3 * K) / (8 * Math.PI * nuT * x * D * D)
  const vr = (S / (4 * x)) * ((zeta - (zeta * zeta * zeta) / 4) / (D * D))
  return { u, v: y < 0 ? -vr : vr }
}

/** Centre-line velocity v̄c(x). */
export function centreline(s: JetState, x: number): number {
  return jetVelocity(s, x, 0).u
}

/** Half-velocity half-width b½ (m) at x. */
export function halfWidth(s: JetState, x: number): number {
  if (s.model === 'ml') return (ZETA_HALF_ML * x) / BETA_ML
  if (s.model === 'tanh') return (ZETA_HALF_TANH * x) / BETA_ML
  const K = kinematicMomentum(s)
  const nuT = K_REICHARDT * Math.sqrt(K)
  const S = Math.sqrt((3 * K) / Math.PI)
  return (ZETA_HALF_ROUND * 4 * nuT * x) / S
}

/** Volume flow in the jet at x: plane → per unit depth (m²/s), round → m³/s. */
export function jetFlow(s: JetState, x: number): number {
  const K = kinematicMomentum(s)
  if (s.model === 'ml') return 2 * Math.sqrt(K / (BETA_ML * I_ML)) * Math.sqrt(x)
  if (s.model === 'tanh') {
    const V = Math.sqrt((3 * BETA_ML * K) / 4)
    return (2 * V * Math.sqrt(x)) / BETA_ML
  }
  return 8 * Math.PI * K_REICHARDT * Math.sqrt(K) * x
}

/** Eddy kinematic viscosity: plane-ML → value on the half-velocity line; tanh → uniform αV√x; round → constant. */
export function eddyViscosity(s: JetState, x: number): number {
  const K = kinematicMomentum(s)
  if (s.model === 'round') return K_REICHARDT * Math.sqrt(K)
  if (s.model === 'tanh') {
    const V = Math.sqrt((3 * BETA_ML * K) / 4)
    const alpha = 1 / (4 * BETA_ML * BETA_ML)
    return alpha * V * Math.sqrt(x)
  }
  // ℓ² |∂v̄x/∂y| = α² β² γ √x |f''|, |f''| = √(f f') evaluated at f' = ½
  const gamma = Math.sqrt(K / (BETA_ML * I_ML))
  const p = mlProfile(ZETA_HALF_ML)
  return ALPHA_ML * ALPHA_ML * BETA_ML * BETA_ML * gamma * Math.sqrt(x) * Math.sqrt(p.f * p.fp)
}

/** Round-jet similarity variable coefficient: ζ = C r/z with C = √(3/π)/(4K). */
export const ROUND_ZETA_COEFF = Math.sqrt(3 / Math.PI) / (4 * K_REICHARDT)
