/**
 * Physics helpers for the "velocity-profiles" topic.
 * Primary source: Wilkes, Ch. 9 (§9.5–9.8, pp. 493–501). Everything here is plain math so the
 * sims, readouts and worked numbers all use exactly the same relations.
 */

/** Dimensionless constant k in ℓ = ky and in the log law (Wilkes p.494: k ≐ 0.4). */
export const K_VK = 0.4
/** Universal-profile constants (Wilkes p.496, Eq. 9.42). */
export const A_LOG = 5.5
export const B_LOG = 2.5

/** Log law in wall variables, Eq. (9.42): v⁺ = 5.5 + 2.5 ln y⁺. */
export const vLog = (yp: number) => A_LOG + B_LOG * Math.log(yp)

/** Junction of v⁺ = y⁺ with the log law, Eq. (9.56) — fixed-point iteration gives 11.635 (book: 11.63 / 11.6). */
export const Y_JUNCTION: number = (() => {
  let y = 10
  for (let i = 0; i < 80; i++) y = A_LOG + B_LOG * Math.log(y)
  return y
})()

/** Two-piece profile, Eqs. (9.54)–(9.55). */
export const vTwoPiece = (yp: number) => (yp <= Y_JUNCTION ? yp : vLog(yp))
/** Buffer law, Eq. (9.45). */
export const vBuffer = (yp: number) => -3.05 + 5 * Math.log(yp)
/** Von Kármán three-region profile, Eqs. (9.44)–(9.46). */
export const vThree = (yp: number) => (yp <= 5 ? yp : yp <= 30 ? vBuffer(yp) : vLog(yp))
/** Sleicher profile, Eq. (9.47) — meant for the sublayer and buffer only. */
export const vSleicher = (yp: number) => Math.atan(0.088 * yp) / 0.088
/** Saturation value of Sleicher's profile as y⁺ → ∞: π/(2·0.088) ≈ 17.85. */
export const SLEICHER_MAX = Math.PI / 2 / 0.088

export type Region = 'sublayer' | 'buffer' | 'core'
/** Region of the three-region (von Kármán) profile. */
export const regionOf = (yp: number): Region => (yp < 5 ? 'sublayer' : yp < 30 ? 'buffer' : 'core')
export const REGION_LABEL: Record<Region, string> = {
  sublayer: 'laminar sublayer (y⁺ < 5)',
  buffer: 'buffer region (5 < y⁺ < 30)',
  core: 'turbulent core (y⁺ > 30)',
}

/**
 * Smooth-pipe Fanning friction factor from Wilkes Eq. (9.53), p.498:
 * √(1/f) = 1.74 ln(Re √f) − 0.391, solved by fixed-point iteration on x = 1/√f.
 * (Belongs to the friction-factor topic; used here only to get τw for a given Re.)
 */
export function fFanning953(Re: number): number {
  const R = Math.max(1000, Re)
  let x = 15
  for (let i = 0; i < 100; i++) x = 1.74 * Math.log(R / x) - 0.391
  return 1 / (x * x)
}

/** Blasius law, Wilkes Eq. (9.59): f_F = 0.0790 Re^(−1/4), stated for Re < 10⁵. */
export const fBlasius = (Re: number) => 0.079 * Math.pow(Re, -0.25)

/** Pipe radius in wall units: a⁺ = a·v* ÷ ν = (Re/2)·√(f_F/2). */
export const aPlusOf = (Re: number, fF: number) => (Re / 2) * Math.sqrt(fF / 2)

/** Mixing-length distribution of Wilkes Eq. (9.29), p.491: ℓ/a as a function of η = y/a. */
export const ellOverA929 = (eta: number) => 0.14 - 0.08 * (1 - eta) ** 2 - 0.06 * (1 - eta) ** 4

/** Velocity defect (v̄zc − v̄z)/v* if the log law (9.37) is used up to the centreline: 2.5 ln(a/y). */
export const defectLog = (eta: number) => B_LOG * Math.log(1 / eta)

/**
 * Velocity defect from Wilkes' p.495 result (linear stress τ = τw r/a + von Kármán's ℓ):
 * v̄z = v̄zc + (1/k) v* [√(r/a) + ln(1 − √(r/a))], with r/a = 1 − η.
 */
export const defectVK = (eta: number) => {
  const s = Math.sqrt(Math.max(0, 1 - eta))
  return -(1 / K_VK) * (s + Math.log(1 - s))
}

/**
 * "Realistic" defect: integrate dv̄z/dy = v* √(1 − y/a) / ℓ with ℓ from Eq. (9.29) and the linear
 * total-stress distribution (9.27). D(η) = ∫_η^1 √(1−s)/(ℓ/a)(s) ds, tabulated once in u = ln s.
 */
const DR = (() => {
  const n = 2400
  const lo = Math.log(1e-4)
  const us: number[] = []
  const g: number[] = []
  for (let i = 0; i <= n; i++) {
    const u = lo + (-lo * i) / n
    const s = Math.exp(u)
    us.push(u)
    g.push((Math.sqrt(Math.max(0, 1 - s)) / ellOverA929(s)) * s)
  }
  const D = new Array<number>(n + 1).fill(0)
  for (let i = n - 1; i >= 0; i--) D[i] = D[i + 1] + 0.5 * (g[i] + g[i + 1]) * (us[i + 1] - us[i])
  return { lo, n, D }
})()

export function defectRealistic(eta: number): number {
  if (eta >= 1) return 0
  if (eta <= 1e-4) return defectLog(eta) + (DR.D[0] - defectLog(1e-4))
  const t = ((Math.log(eta) - DR.lo) / -DR.lo) * DR.n
  const i = Math.min(DR.n - 1, Math.floor(t))
  const f = t - i
  return DR.D[i] * (1 - f) + DR.D[i + 1] * f
}

/**
 * Laufer's fully developed smooth-pipe data as plotted in Fox & McDonald's Fig. 8.9 (p.295), read off the
 * printed figure (≈ ±3 % in y⁺, ±0.2 in v⁺). Cross-reference data only — Wilkes' Fig. 9.9 shows no data points.
 * The last point of each set is the centreline value (solid symbol in Fox).
 */
export const LAUFER_5E4: [number, number][] = [
  [3.1, 3.3], [3.6, 3.7], [4.05, 4.2], [5.0, 5.2], [5.5, 5.3], [6.2, 6.4], [7.1, 6.6], [7.6, 7.5], [8.4, 7.95],
  [9.6, 8.6], [10.2, 9.1], [12.0, 9.85], [16.2, 11.3], [23.9, 12.8], [40.7, 14.4], [61, 15.2], [94, 16.4],
  [156, 17.35], [221, 18.1], [280, 19.4], [380, 20.4], [490, 21.3], [590, 22.0], [710, 22.5], [800, 22.9],
  [900, 23.2], [990, 23.35],
]
export const LAUFER_5E5: [number, number][] = [
  [308, 19.2], [530, 20.5], [785, 21.5], [1290, 22.8], [1820, 23.7], [2370, 24.25], [3250, 25.3], [4040, 26.05],
  [4980, 26.7], [5760, 27.1], [6600, 27.55], [7390, 27.9], [8270, 28.1],
]

/** Same data replotted as velocity defect vs y/a, using each set's centreline point (a⁺, v⁺c). */
export function lauferDefect(set: [number, number][], minEta = 0.02): [number, number][] {
  const [aP, vc] = set[set.length - 1]
  return set.map(([yp, vp]) => [yp / aP, vc - vp] as [number, number]).filter(([eta]) => eta >= minEta && eta < 1)
}

/** Format a length given in metres with a sensible unit (µm / mm / m). */
export function fmtLength(m: number): { value: number; unit: string } {
  const a = Math.abs(m)
  if (a < 1e-3) return { value: m * 1e6, unit: 'µm' }
  if (a < 1) return { value: m * 1e3, unit: 'mm' }
  return { value: m, unit: 'm' }
}
