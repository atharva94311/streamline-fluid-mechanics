/**
 * Shared physics for the mixing-length topic (Wilkes Ch. 9, §9.3–9.4).
 * The correlations are transcribed exactly from the book; fluid properties are
 * typical textbook values (supplementary, ~20 °C, 1 atm).
 */

/** Wilkes Eq. (9.29): mixing length / pipe radius, smooth AND rough pipes; ya = y/a with y measured from the wall. */
export const ellOverA = (ya: number) => 0.14 - 0.08 * (1 - ya) ** 2 - 0.06 * (1 - ya) ** 4

/** Wilkes Eq. (9.30): approximate dimensionless eddy viscosity ν_T / (a√(τw/ρ)), Nikuradse, smooth pipes. */
export const nuT30 = (ya: number) => 0.32 * ya * (1 - ya)

/** Wilkes Eq. (9.31): accurate polynomial (note: no (y/a)^4 term). */
export const nuT31 = (ya: number) => 0.407 * ya - 0.7012 * ya ** 2 + 0.4505 * ya ** 3 - 0.1437 * ya ** 5

/**
 * Supplementary consistency curve: mixing length (9.29) combined with the linear total-stress
 * distribution |τ| = τw (1 − y/a) through (9.28) gives ν_T/(a v*) = (ℓ/a) √(1 − y/a).
 */
export const nuTFromEllAndStress = (ya: number) => ellOverA(ya) * Math.sqrt(Math.max(0, 1 - ya))

/**
 * Fanning friction factor for a smooth pipe from Wilkes Eq. (9.53):
 *   √(1/fF) = 1.74 ln(Re √fF) − 0.391     (5×10³ ≤ Re ≤ 3.4×10⁶ and probably beyond)
 * solved by fixed-point iteration on x = 1/√fF  →  x = 1.74 ln(Re/x) − 0.391.
 */
export function fanningSmooth(Re: number): number {
  let x = 12
  for (let i = 0; i < 100; i++) {
    const nx = 1.74 * Math.log(Re / x) - 0.391
    if (Math.abs(nx - x) < 1e-12) {
      x = nx
      break
    }
    x = nx
  }
  return 1 / (x * x)
}

export type FluidId = 'water' | 'air'

export interface Fluid {
  label: string
  /** density, kg/m³ */
  rho: number
  /** dynamic viscosity, Pa·s */
  mu: number
  /** kinematic viscosity, m²/s */
  nu: number
  /** specific heat, J/(kg·K) */
  cp: number
  /** thermal conductivity, W/(m·K) */
  k: number
  /** molecular diffusivity of a typical species, m²/s */
  D: number
  /** what D refers to */
  Dnote: string
}

/** Typical property values (supplementary, rounded). */
export const FLUIDS: Record<FluidId, Fluid> = {
  water: { label: 'water (≈20 °C)', rho: 1000, mu: 1.0e-3, nu: 1.0e-6, cp: 4180, k: 0.6, D: 1.0e-9, Dnote: 'small dissolved solute' },
  air: { label: 'air (≈20 °C, 1 atm)', rho: 1.2, mu: 1.8e-5, nu: 1.5e-5, cp: 1005, k: 0.026, D: 2.5e-5, Dnote: 'water vapour in air' },
}
