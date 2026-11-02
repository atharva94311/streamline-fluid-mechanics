/**
 * Physics of Wilkes §9.13 (momentum/heat-transfer analogies) and Example 9.6.
 * Every function is a direct transcription of a printed equation (numbers in comments).
 */

/** Blasius law, Fanning friction factor: f_F = 0.0790 Re^(-1/4)  — Eq. (E9.6.2) = (9.59), Re < 1e5. */
export const blasiusFF = (Re: number) => 0.079 * Re ** -0.25

/** Velocity ratio at the edge of the laminar sublayer: v̄_zδ / v̄_zm = 2.44 / Re^(1/8) — Eq. (9.103). */
export const velocityRatio = (Re: number) => 2.44 / Re ** 0.125

/** Laminar-sublayer thickness from the 1/7 power law: δ/D = 61.7 / Re^(7/8) — Eq. (9.62). */
export const sublayerThickness = (Re: number) => 61.7 / Re ** 0.875

/** Reynolds analogy with Blasius: Nu = 0.0395 Re^(3/4) Pr — Eq. (E9.6.5). */
export const nuRA = (Re: number, Pr: number) => 0.0395 * Re ** 0.75 * Pr

/** Dittus–Boelter correlation (smooth pipe, experiment-based): Nu = 0.023 Re^0.8 Pr^0.4 — Eq. (E9.6.1). */
export const nuDB = (Re: number, Pr: number) => 0.023 * Re ** 0.8 * Pr ** 0.4

/** Denominator of the Prandtl–Taylor analogy, 1 + (v̄_zδ/v̄_zm)(Pr − 1) — Eq. (9.102). */
export const ptaFactor = (Re: number, Pr: number) => 1 + velocityRatio(Re) * (Pr - 1)

/** Prandtl–Taylor analogy with Blasius: Nu = 0.0395 Re^(3/4) Pr / [1 + (v̄_zδ/v̄_zm)(Pr − 1)] — Eq. (E9.6.8). */
export const nuPTA = (Re: number, Pr: number) => nuRA(Re, Pr) / ptaFactor(Re, Pr)

/**
 * Share of the overall temperature difference that is dropped across the laminar sublayer,
 * (T̄_δ − T̄_w)/(T̄_m − T̄_w) = Pr r / [1 + r (Pr − 1)], with r = v̄_zδ/v̄_zm.
 * Obtained by eliminating δ and m from Eqs. (9.100)–(9.101) (algebra written for this platform).
 */
export const sublayerTempShare = (r: number, Pr: number) => (Pr * r) / (1 + r * (Pr - 1))

/** Table E9.6 exactly as printed (Wilkes p. 523): Nusselt numbers at Re = 50 000. */
export const TABLE_E96 = [
  { Pr: 0.5, RA: 67, DB: 100, PTA: 95 },
  { Pr: 1.0, RA: 130, DB: 130, PTA: 130 },
  { Pr: 2.0, RA: 264, DB: 173, PTA: 162 },
] as const

/** Colours used consistently by every sim of this topic. */
export const COLORS = {
  RA: 'var(--plot-4)',
  PTA: 'var(--plot-1)',
  DB: 'var(--plot-5)',
  hot: 'var(--plot-3)',
  cold: 'var(--plot-2)',
  velocity: 'var(--plot-1)',
  temperature: 'var(--plot-3)',
} as const

/** Signed percentage difference of a model from the benchmark. */
export const pctDiff = (model: number, ref: number) => (100 * (model - ref)) / ref

/** Format a signed percentage, e.g. +52.6 % / −33.0 %. */
export function fmtPct(p: number, digits = 1): string {
  const s = Math.abs(p).toFixed(digits)
  if (Math.abs(p) < 0.5 * 10 ** -digits) return `${(0).toFixed(digits)} %`
  return `${p > 0 ? '+' : '−'}${s} %`
}
