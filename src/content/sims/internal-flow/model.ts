/**
 * Shared physics for the "internal-flow" topic sims.
 *
 * Source-based relations (Fox & McDonald, Ch. 8):
 *   Re = ρ V̄ D / μ, transition benchmark Re ≈ 2300 (p. 276)
 *   laminar entrance length L/D ≃ 0.06 Re (Eq. 8.1, p. 277); turbulent mean profile 25–40 D, details 80+ D (p. 277)
 *   τ_rx = (r/2) ∂p/∂x, τ_w = −(R/2) ∂p/∂x (Eqs. 8.15, 8.16, p. 293)
 *
 * Everything else here (developing-profile shapes, viscous/turbulent split) is a SUPPLEMENTARY schematic model,
 * chosen to be physically sensible (mass-conserving, correct limits) — it is not taken from the PDF.
 */

export const RE_CRIT = 2300
export const RE_QUIET = 100_000

export type Regime = 'laminar' | 'transitional' | 'turbulent'

/** Regime badge. Fox gives only the benchmark 2300; the 2300–4000 "transitional" band is supplementary. */
export function regimeOf(Re: number, quiet = false): Regime {
  if (quiet) return Re < RE_QUIET ? 'laminar' : 'turbulent'
  if (Re < RE_CRIT) return 'laminar'
  if (Re < 4000) return 'transitional'
  return 'turbulent'
}

export interface Fluid {
  key: 'water' | 'oil' | 'air'
  label: string
  rho: number // kg/m³
  mu: number // Pa·s
}

/** Typical property values at about 20 °C (supplementary; standard table values). */
export const FLUIDS: Record<Fluid['key'], Fluid> = {
  water: { key: 'water', label: 'water (20 °C)', rho: 998, mu: 1.0e-3 },
  oil: { key: 'oil', label: 'SAE 30 motor oil (20 °C)', rho: 891, mu: 0.29 },
  air: { key: 'air', label: 'air (20 °C, 1 atm)', rho: 1.2, mu: 1.81e-5 },
}

export const SOUND_SPEED_AIR = 343 // m/s at 20 °C (supplementary)

/* ---------------------------------------------------------------- developing profile (schematic) */

/**
 * Developing velocity profile in the entrance region (schematic boundary-layer + core model).
 * ξ = x / L_e (station relative to the entrance length), ρ = r/R in [0, 1].
 * Boundary-layer thickness δ/R grows like ξ^0.5 (laminar) or ξ^0.8 (turbulent) and reaches the centreline at
 * ξ = XI_MEET. Inside the core u = u_c; inside the layer u/u_c = 1 − s² (laminar) or s^(1/7) (turbulent),
 * with s the distance from the wall over δ. u_c follows from mass conservation, so the profile always carries the
 * same flow rate Q = V̄ A.
 */
export const XI_MEET = { laminar: 0.78, turbulent: 0.7 }

export function deltaOverR(xi: number, turbulent: boolean): number {
  if (xi <= 0) return 0
  const m = turbulent ? XI_MEET.turbulent : XI_MEET.laminar
  const p = turbulent ? 0.8 : 0.5
  return Math.min(1, (xi / m) ** p)
}

/** ∫0^1 2ρ (u/u_c) dρ for core radius a = 1 − δ/R (closed form). */
function shapeIntegral(d: number, turbulent: boolean): number {
  const a = 1 - d
  if (turbulent) return a * a + 2 * d * (7 / 8 - (7 * d) / 15)
  return a * a + 2 * d * ((2 * a) / 3 + d / 4)
}

/** Centreline velocity over average velocity, u_c / V̄. */
export function centreRatio(xi: number, turbulent: boolean): number {
  return 1 / shapeIntegral(deltaOverR(xi, turbulent), turbulent)
}

/** Local velocity u / V̄ at radius ρ = r/R and station ξ. */
export function uOverVbar(rho: number, xi: number, turbulent: boolean): number {
  const d = deltaOverR(xi, turbulent)
  const uc = 1 / shapeIntegral(d, turbulent)
  const yw = 1 - Math.abs(rho) // distance from wall / R
  if (yw <= 0) return 0
  if (d <= 0 || yw >= d) return uc
  const s = yw / d
  return uc * (turbulent ? s ** (1 / 7) : 1 - (1 - s) * (1 - s))
}

/* ---------------------------------------------------------------- stress split (schematic) */

/** Blasius smooth-pipe friction factor (supplementary), used only to estimate R⁺ for the schematic split. */
export function frictionFactor(Re: number): number {
  return Re < RE_CRIT ? 64 / Re : 0.316 * Re ** -0.25
}

/** R⁺ = R u_* / ν = (Re/2) √(f/8). */
export function RPlus(Re: number): number {
  return (Re / 2) * Math.sqrt(frictionFactor(Re) / 8)
}

/**
 * Split of the total stress τ/τ_w = 1 − y/R (Eq. 8.15) into viscous and turbulent parts with van Driest's
 * mixing-length model (supplementary): τ⁺ = S + l⁺² S², l⁺ = κ y⁺ (1 − e^(−y⁺/26)), S = du⁺/dy⁺.
 * Returns fractions of τ_w. Laminar flow: everything is viscous.
 */
export function stressSplit(yR: number, Re: number, turbulent: boolean): { total: number; visc: number; turb: number } {
  const total = Math.max(0, 1 - yR)
  if (!turbulent) return { total, visc: total, turb: 0 }
  const yp = yR * RPlus(Re)
  const l = 0.41 * yp * (1 - Math.exp(-yp / 26))
  const S = (2 * total) / (1 + Math.sqrt(1 + 4 * l * l * total))
  return { total, visc: S, turb: total - S }
}

/** Distance from the wall (as y/R) where viscous and turbulent stresses are equal (schematic model). */
export function crossoverYR(Re: number): number {
  let lo = 1e-7
  let hi = 0.5
  for (let i = 0; i < 80; i++) {
    const m = Math.sqrt(lo * hi)
    const s = stressSplit(m, Re, true)
    if (s.visc > s.turb) lo = m
    else hi = m
  }
  return Math.sqrt(lo * hi)
}

/* ---------------------------------------------------------------- Fig. 8.8 data */

/** Fox Fig. 8.8 (p. 294), Laufer's data, digitised approximately (±0.01) from the printed figure. */
export const FIG88_SQUARES: [number, number][] = [
  [0.08, 0.955], [0.18, 0.81], [0.28, 0.725], [0.38, 0.58], [0.49, 0.47], [0.59, 0.405], [0.69, 0.305], [0.79, 0.22], [0.9, 0.095],
]
export const FIG88_CIRCLES: [number, number][] = [
  [0.08, 0.93], [0.18, 0.865], [0.28, 0.71], [0.38, 0.585], [0.49, 0.55], [0.59, 0.42], [0.69, 0.31], [0.79, 0.245], [0.9, 0.1],
]

/** Compact number formatting with thin-space thousands. */
export function fmtRe(Re: number): string {
  if (!Number.isFinite(Re)) return '—'
  if (Re >= 1e6) return `${(Re / 1e6).toPrecision(3)}×10⁶`
  if (Re >= 100) return Math.round(Re).toLocaleString('en-US').replace(/,/g, ' ')
  if (Re >= 1) return Re.toPrecision(3)
  return Re.toPrecision(2)
}
