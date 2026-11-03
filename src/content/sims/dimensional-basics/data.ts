/**
 * Shared data + helpers for the "dimensional-basics" topic sims.
 *
 * - Dimension vectors (exponents of M, L, T) and the MLT <-> FLT conversion that follows from F ≐ MLT⁻²
 *   (Lecture 13, slide 3).
 * - Fluid property presets (typical values near 20 °C — SUPPLEMENTARY, not from the course PDFs).
 * - A pipe-friction model used only to GENERATE synthetic data for the collapse demo (SUPPLEMENTARY:
 *   laminar 32/Re and the Blasius smooth-pipe law — not part of Lecture 13 slides 2–4).
 * - The sphere drag curve of Fox Fig. 7.1 (p. 248), digitised approximately (±10 %) from the printed figure.
 */
import { md } from '@/kit'

/* ------------------------------------------------------------------------------------------------ dimensions */

/** Exponents of the three basic dimensions, in the order (M, L, T) or (F, L, T). */
export type Dim3 = [number, number, number]
export type DimSystem = 'MLT' | 'FLT'

/** M ≐ F L⁻¹ T², so M^m L^l T^t ≐ F^m L^(l−m) T^(t+2m). */
export const mltToFlt = ([m, l, t]: Dim3): Dim3 => [m, l - m, t + 2 * m]
/** F ≐ M L T⁻², so F^f L^l T^t ≐ M^f L^(l+f) T^(t−2f). */
export const fltToMlt = ([f, l, t]: Dim3): Dim3 => [f, l + f, t - 2 * f]

export const inSystem = (mlt: Dim3, sys: DimSystem): Dim3 => (sys === 'MLT' ? mlt : mltToFlt(mlt))

const clean = (x: number) => (Math.abs(x) < 1e-9 ? 0 : Math.round(x * 1000) / 1000)

export function addDims(a: Dim3, b: Dim3, k = 1): Dim3 {
  return [clean(a[0] + k * b[0]), clean(a[1] + k * b[1]), clean(a[2] + k * b[2])]
}

export const isDimensionless = (d: Dim3) => d.every((x) => Math.abs(x) < 1e-9)

/** Exponent as TeX: 1 → '', 2 → '^{2}', −0.5 → '^{-1/2}'. */
export function expTeX(e: number, showOne = false): string {
  if (Math.abs(e - 1) < 1e-9 && !showOne) return ''
  const r = Math.round(e * 2) / 2
  const s = Number.isInteger(r) ? String(r) : `${r < 0 ? '-' : ''}${Math.abs(r * 2)}/2`
  return `^{${s}}`
}

const DIM_SYM: Record<DimSystem, [string, string, string]> = {
  MLT: [md`\dimM`, md`\dimL`, md`\dimT`],
  FLT: [md`\dimF`, md`\dimL`, md`\dimT`],
}
export const dimLetters = (sys: DimSystem): [string, string, string] => (sys === 'MLT' ? ['M', 'L', 'T'] : ['F', 'L', 'T'])

/** TeX for a dimension vector, e.g. [1,−3,0] → \dimM\dimL^{-3}. All zero → \dimM^{0}\dimL^{0}\dimT^{0}. */
export function dimTeX(d: Dim3, sys: DimSystem): string {
  const sym = DIM_SYM[sys]
  if (isDimensionless(d)) return sym.map((s) => `${s}^{0}`).join('')
  return d
    .map((e, i) => (Math.abs(e) < 1e-9 ? '' : `${sym[i]}${expTeX(e)}`))
    .join('')
}

/** SI base-unit string for an MLT vector, e.g. [1,−1,−2] → 'kg·m⁻¹·s⁻²'. */
export function siBase(mlt: Dim3): string {
  const sup = (e: number) => {
    if (Math.abs(e - 1) < 1e-9) return ''
    const r = Math.round(e * 2) / 2
    if (!Number.isInteger(r)) return `^(${r})`
    return String(r)
      .split('')
      .map((c) => ({ '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' })[c] ?? c)
      .join('')
  }
  const parts = (['kg', 'm', 's'] as const).map((u, i) => (Math.abs(mlt[i]) < 1e-9 ? '' : `${u}${sup(mlt[i])}`)).filter(Boolean)
  return parts.length ? parts.join('·') : '— (pure number)'
}

export interface VarSpec {
  id: string
  /** TeX symbol. */
  tex: string
  /** Wrap in parentheses when raised to a power ≠ 1 (multi-letter symbols). */
  paren?: boolean
  name: string
  /** Exponents of (M, L, T). */
  mlt: Dim3
  si: string
}

/** Variable library for the dimension builder (MLT exponents; FLT follows from F ≐ MLT⁻²). */
export const VARS: VarSpec[] = [
  { id: 'dpl', tex: md`\Delta p_\ell`, paren: true, name: 'pressure drop per unit length', mlt: [1, -2, -2], si: 'Pa/m' },
  { id: 'D', tex: 'D', name: 'diameter', mlt: [0, 1, 0], si: 'm' },
  { id: 'rho', tex: md`\rho`, name: 'density', mlt: [1, -3, 0], si: 'kg/m³' },
  { id: 'mu', tex: md`\mu`, name: 'dynamic viscosity', mlt: [1, -1, -1], si: 'Pa·s' },
  { id: 'V', tex: 'V', name: 'velocity', mlt: [0, 1, -1], si: 'm/s' },
  { id: 'F', tex: 'F', name: 'force (e.g. drag)', mlt: [1, 1, -2], si: 'N' },
  { id: 'dp', tex: md`\Delta p`, paren: true, name: 'pressure difference', mlt: [1, -1, -2], si: 'Pa' },
  { id: 'L', tex: 'L', name: 'length (reference)', mlt: [0, 1, 0], si: 'm' },
  { id: 'g', tex: 'g', name: 'gravitational acceleration', mlt: [0, 1, -2], si: 'm/s²' },
  { id: 'nu', tex: md`\nu`, name: 'kinematic viscosity', mlt: [0, 2, -1], si: 'm²/s' },
  { id: 'sigma', tex: md`\sigma`, name: 'surface tension', mlt: [1, 0, -2], si: 'N/m' },
  { id: 'gamma', tex: md`\gamma`, name: 'specific weight', mlt: [1, -2, -2], si: 'N/m³' },
  { id: 'Ev', tex: 'E_v', paren: true, name: 'bulk modulus', mlt: [1, -1, -2], si: 'Pa' },
  { id: 'c', tex: 'c', name: 'speed of sound', mlt: [0, 1, -1], si: 'm/s' },
  { id: 'omega', tex: md`\omega`, name: 'angular frequency', mlt: [0, 0, -1], si: 's⁻¹' },
  { id: 'Q', tex: 'Q', name: 'volume flow rate', mlt: [0, 3, -1], si: 'm³/s' },
  { id: 'mdot', tex: md`\dot m`, name: 'mass flow rate', mlt: [1, 0, -1], si: 'kg/s' },
  { id: 'P', tex: md`\mathcal{P}`, name: 'power', mlt: [1, 2, -3], si: 'W' },
  { id: 'tau', tex: md`\tau_w`, paren: true, name: 'wall shear stress', mlt: [1, -1, -2], si: 'Pa' },
]
export const VAR = Object.fromEntries(VARS.map((v) => [v.id, v])) as Record<string, VarSpec>

export interface Factor {
  varId: string
  exp: number
}

/** TeX for a product of powers, written as a fraction (positive exponents up, negative down). */
export function productTeX(factors: Factor[]): string {
  const term = (f: Factor, e: number) => {
    const v = VAR[f.varId]
    const base = v.paren && Math.abs(e - 1) > 1e-9 ? `(${v.tex})` : v.tex
    return `${base}${expTeX(e)}`
  }
  const used = factors.filter((f) => Math.abs(f.exp) > 1e-9)
  if (!used.length) return '1'
  const up = used.filter((f) => f.exp > 0).map((f) => term(f, f.exp))
  const down = used.filter((f) => f.exp < 0).map((f) => term(f, -f.exp))
  const num = up.length ? up.join('\\,') : '1'
  return down.length ? `\\dfrac{${num}}{${down.join('\\,')}}` : num
}

export function productDim(factors: Factor[], sys: DimSystem = 'MLT'): Dim3 {
  let d: Dim3 = [0, 0, 0]
  for (const f of factors) d = addDims(d, inSystem(VAR[f.varId].mlt, sys), f.exp)
  return d
}

/* ------------------------------------------------------------------------------------------------ fluids */

export interface Fluid {
  id: string
  label: string
  /** density, kg/m³ */
  rho: number
  /** dynamic viscosity, Pa·s */
  mu: number
}

/** Typical property values near 20 °C and 1 atm (approximate; supplementary — not from the course PDFs). */
export const FLUIDS: Record<'air' | 'water' | 'oil' | 'glycerin', Fluid> = {
  air: { id: 'air', label: 'air', rho: 1.2, mu: 1.81e-5 },
  water: { id: 'water', label: 'water', rho: 998, mu: 1.0e-3 },
  oil: { id: 'oil', label: 'SAE 30 oil', rho: 891, mu: 0.29 },
  glycerin: { id: 'glycerin', label: 'glycerin', rho: 1260, mu: 1.41 },
}
export type FluidId = keyof typeof FLUIDS

/* ------------------------------------------------------------------------------------------------ pipe model */

/** Laminar limit and turbulent start used by the synthetic-data model. */
export const RE_LAM = 2300
export const RE_TURB = 4000
/** Upper validity of the Blasius smooth-pipe law. */
export const RE_BLASIUS_MAX = 1e5

/**
 * Π₁ = DΔp_ℓ/(ρV²) for a smooth pipe (SUPPLEMENTARY model, used only to generate demo data):
 * laminar (Hagen–Poiseuille) Π₁ = 32/Re for Re ≤ 2300; Blasius Π₁ = f/2 = 0.158 Re^(−1/4) for 4000 ≤ Re ≤ 10⁵.
 * Returns NaN in the transition band, where no single correlation applies.
 */
export function pipePi1(Re: number): number {
  if (!(Re > 0)) return NaN
  if (Re <= RE_LAM) return 32 / Re
  if (Re >= RE_TURB) return 0.158 * Re ** -0.25
  return NaN
}

export function pipeRegime(Re: number): 'laminar' | 'transition' | 'turbulent' {
  if (Re <= RE_LAM) return 'laminar'
  if (Re < RE_TURB) return 'transition'
  return 'turbulent'
}

/* ------------------------------------------------------------------------------------------------ sphere drag (Fox Fig. 7.1) */

/**
 * Approximate points read off Fox Fig. 7.1 (p. 248): [Re = ρVD/μ, C_D]. About ±10 % (more below C_D = 0.1 and on
 * the near-vertical drop at Re ≈ 2.5–3.3 × 10⁵). The printed figure is the authority.
 */
export const CD_TABLE: [number, number][] = [
  [0.1, 255],
  [0.2, 120],
  [0.5, 47],
  [1, 26],
  [2, 14],
  [5, 6.6],
  [10, 4.0],
  [20, 2.5],
  [50, 1.5],
  [100, 1.0],
  [200, 0.71],
  [500, 0.52],
  [1000, 0.44],
  [2000, 0.4],
  [10000, 0.4],
  [20000, 0.43],
  [50000, 0.45],
  [100000, 0.47],
  [150000, 0.47],
  [200000, 0.42],
  [250000, 0.39],
  [270000, 0.25],
  [290000, 0.17],
  [300000, 0.13],
  [330000, 0.1],
  [380000, 0.09],
  [420000, 0.085],
  [500000, 0.09],
  [600000, 0.1],
  [800000, 0.12],
  [1000000, 0.15],
]
export const RE_MIN_FIG = 0.1
export const RE_MAX_FIG = 1e6

/** Log–log interpolation in CD_TABLE; NaN outside 0.1 ≤ Re ≤ 10⁶. */
export function cdSphere(Re: number): number {
  if (!(Re >= RE_MIN_FIG && Re <= RE_MAX_FIG)) return NaN
  for (let i = 1; i < CD_TABLE.length; i++) {
    const [r1, c1] = CD_TABLE[i]
    if (Re <= r1) {
      const [r0, c0] = CD_TABLE[i - 1]
      const t = Math.log(Re / r0) / Math.log(r1 / r0)
      return Math.exp(Math.log(c0) + t * Math.log(c1 / c0))
    }
  }
  return CD_TABLE[CD_TABLE.length - 1][1]
}

/** Speed of sound in air near 20 °C (supplementary), for the Mach-number warning. */
export const C_AIR = 343
export const G = 9.81
