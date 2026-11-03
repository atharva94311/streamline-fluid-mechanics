/**
 * Dimensional-analysis engine for the buckingham-pi topic (own helpers — no cross-topic imports).
 * Variables are stored with MLT exponents; FLT exponents follow from M ≐ F L⁻¹ T² (since F ≐ M L T⁻²).
 */
import { num } from '@/kit'

export type Dim3 = [number, number, number]
export type Sys = 'MLT' | 'FLT'

export interface DimVar {
  id: string
  /** TeX symbol, e.g. '\\Delta p_\\ell'. */
  tex: string
  /** Plain-language name. */
  name: string
  /** Exponents of M, L, T. */
  mlt: Dim3
}

/** M^a L^b T^c = F^a L^(b−a) T^(c+2a). */
export const toFLT = (d: Dim3): Dim3 => [d[0], d[1] - d[0], d[2] + 2 * d[0]]
export const dimsOf = (v: DimVar, sys: Sys): Dim3 => (sys === 'MLT' ? v.mlt : toFLT(v.mlt))

export const DIM_LETTERS: Record<Sys, [string, string, string]> = { MLT: ['M', 'L', 'T'], FLT: ['F', 'L', 'T'] }
export const DIM_TEX: Record<Sys, [string, string, string]> = {
  MLT: ['\\dimM', '\\dimL', '\\dimT'],
  FLT: ['\\dimF', '\\dimL', '\\dimT'],
}

/** TeX for a dimension product, e.g. F L^{-4} T^{2}. Dimensionless → '1'. */
export function dimTeX(d: Dim3, sys: Sys, zeroForm = false): string {
  const L = DIM_TEX[sys]
  if (zeroForm) return `${L[0]}^{0}${L[1]}^{0}${L[2]}^{0}`
  const parts = d.map((e, i) => (e === 0 ? '' : e === 1 ? L[i] : `${L[i]}^{${num.fracTeX(e)}}`)).filter(Boolean)
  return parts.length ? parts.join('') : '1'
}

/** 3 × n dimensional matrix (rows = dimensions, columns = variables). */
export const dimMatrix = (vars: DimVar[], sys: Sys): number[][] =>
  [0, 1, 2].map((i) => vars.map((v) => dimsOf(v, sys)[i]))

/** Determinant by Gaussian elimination (square matrices only). */
export function det(M: number[][]): number {
  const n = M.length
  const A = M.map((r) => [...r])
  let d = 1
  for (let c = 0; c < n; c++) {
    let p = c
    for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r
    if (Math.abs(A[p][c]) < 1e-12) return 0
    if (p !== c) {
      ;[A[p], A[c]] = [A[c], A[p]]
      d = -d
    }
    d *= A[c][c]
    for (let r = c + 1; r < n; r++) {
      const f = A[r][c] / A[c][c]
      for (let k = c; k < n; k++) A[r][k] -= f * A[c][k]
    }
  }
  return Math.abs(d) < 1e-9 ? 0 : Math.round(d * 1e6) / 1e6
}

export const rankOf = (rows: number[][]): number => (rows.length && rows[0].length ? num.rank(rows) : 0)

/** All k-element subsets of [0..n). */
export function combos(n: number, k: number): number[][] {
  const out: number[][] = []
  const rec = (start: number, acc: number[]) => {
    if (acc.length === k) {
      out.push([...acc])
      return
    }
    for (let i = start; i < n; i++) rec(i + 1, [...acc, i])
  }
  rec(0, [])
  return out
}

export interface Analysis {
  A: number[][]
  /** Indices of dimension rows that are not all zero. */
  present: number[]
  r: number
  k: number
}

export function analyse(vars: DimVar[], sys: Sys): Analysis {
  const A = dimMatrix(vars, sys)
  const present = [0, 1, 2].filter((i) => A[i].some((x) => x !== 0))
  const r = rankOf(present.map((i) => A[i]))
  return { A, present, r, k: vars.length }
}

export type RepStatus = 'ok' | 'count' | 'dependent-var' | 'singular'

export function repeatingStatus(an: Analysis, rep: number[], dep = 0): RepStatus {
  if (rep.includes(dep)) return 'dependent-var'
  if (rep.length !== an.r) return 'count'
  const sub = an.present.map((i) => rep.map((j) => an.A[i][j]))
  return rankOf(sub) === an.r ? 'ok' : 'singular'
}

/** Greedy choice of r independent dimension rows for the repeating columns. */
export function rowBasis(an: Analysis, rep: number[]): number[] {
  const rows: number[] = []
  for (const i of an.present) {
    const trial = [...rows, i]
    if (rankOf(trial.map((t) => rep.map((j) => an.A[t][j]))) === trial.length) rows.push(i)
    if (rows.length === rep.length) break
  }
  return rows
}

const clean = (x: number) => {
  const r = Math.round(x * 1e6) / 1e6
  return Object.is(r, -0) ? 0 : r
}

export interface PiGroup {
  /** Index of the non-repeating variable. */
  q: number
  /** Exponents of the repeating variables (same order as rep). */
  sol: number[]
  /** Exponent of every variable (length k). */
  exps: number[]
}

export function solveGroups(an: Analysis, rep: number[]): PiGroup[] | null {
  const rows = rowBasis(an, rep)
  if (rows.length !== rep.length) return null
  const groups: PiGroup[] = []
  for (let q = 0; q < an.k; q++) {
    if (rep.includes(q)) continue
    const M = rows.map((i) => rep.map((j) => an.A[i][j]))
    const b = rows.map((i) => -an.A[i][q])
    const s = rep.length ? num.solveLinear(M, b) : []
    if (!s) return null
    const sol = s.map(clean)
    const exps: number[] = Array.from({ length: an.k }, (_, j) => (j === q ? 1 : 0))
    rep.forEach((j, t) => (exps[j] = sol[t]))
    groups.push({ q, sol, exps })
  }
  return groups
}

export const EXP_LETTERS = ['a', 'b', 'c']

/** "−3 + a + b − 4c = 0" for one dimension row. Returns null if the row is identically zero. */
export function exponentEqTeX(constant: number, coefs: number[], letters = EXP_LETTERS): string | null {
  const terms: string[] = []
  if (constant !== 0) terms.push(num.fracTeX(constant))
  coefs.forEach((c, i) => {
    if (c === 0) return
    const mag = Math.abs(c) === 1 ? '' : num.fracTeX(Math.abs(c))
    const sign = c < 0 ? '-' : '+'
    if (!terms.length) terms.push(`${c < 0 ? '-' : ''}${mag}${letters[i]}`)
    else terms.push(`${sign} ${mag}${letters[i]}`)
  })
  if (!terms.length) return null
  return `${terms.join(' ')} = 0`
}

const pow = (tex: string, e: number) => (e === 1 ? `{${tex}}` : `{${tex}}^{${num.fracTeX(e)}}`)

/** TeX of a product Π q_j^{e_j}, written as a fraction. */
export function productTeX(vars: DimVar[], exps: number[]): string {
  const numr: string[] = []
  const den: string[] = []
  exps.forEach((e, j) => {
    if (e > 0) numr.push(pow(vars[j].tex, e))
    else if (e < 0) den.push(pow(vars[j].tex, -e))
  })
  const n = numr.length ? numr.join('\\,') : '1'
  return den.length ? `\\dfrac{${n}}{${den.join('\\,')}}` : n
}

/** Net dimension exponents of a product. */
export function netDims(vars: DimVar[], exps: number[], sys: Sys): Dim3 {
  const out: Dim3 = [0, 0, 0]
  vars.forEach((v, j) => {
    const d = dimsOf(v, sys)
    for (let i = 0; i < 3; i++) out[i] = clean(out[i] + exps[j] * d[i])
  })
  return out
}

/* ------------------------------------------------------------------------------------ variable library */

export const V = {
  dpl: { id: 'dpl', tex: '\\Delta p_\\ell', name: 'pressure drop per unit length', mlt: [1, -2, -2] },
  dp: { id: 'dp', tex: '\\Delta p', name: 'pressure drop', mlt: [1, -1, -2] },
  F: { id: 'F', tex: 'F', name: 'force (drag)', mlt: [1, 1, -2] },
  V: { id: 'V', tex: 'V', name: 'velocity', mlt: [0, 1, -1] },
  Vbar: { id: 'Vbar', tex: '\\overline{V}', name: 'average velocity', mlt: [0, 1, -1] },
  D: { id: 'D', tex: 'D', name: 'diameter', mlt: [0, 1, 0] },
  l: { id: 'l', tex: 'l', name: 'length', mlt: [0, 1, 0] },
  e: { id: 'e', tex: 'e', name: 'roughness height', mlt: [0, 1, 0] },
  A: { id: 'A', tex: 'A', name: 'area', mlt: [0, 2, 0] },
  rho: { id: 'rho', tex: '\\rho', name: 'density', mlt: [1, -3, 0] },
  mu: { id: 'mu', tex: '\\mu', name: 'dynamic viscosity', mlt: [1, -1, -1] },
  nu: { id: 'nu', tex: '\\nu', name: 'kinematic viscosity', mlt: [0, 2, -1] },
  g: { id: 'g', tex: 'g', name: 'gravity', mlt: [0, 1, -2] },
  gamma: { id: 'gamma', tex: '\\gamma', name: 'specific weight', mlt: [1, -2, -2] },
  sigma: { id: 'sigma', tex: '\\sigma', name: 'surface tension', mlt: [1, 0, -2] },
  Ev: { id: 'Ev', tex: 'E_v', name: 'bulk modulus', mlt: [1, -1, -2] },
  c: { id: 'c', tex: 'c', name: 'speed of sound', mlt: [0, 1, -1] },
  omega: { id: 'omega', tex: '\\omega', name: 'angular speed / frequency', mlt: [0, 0, -1] },
  Q: { id: 'Q', tex: 'Q', name: 'volume flow rate', mlt: [0, 3, -1] },
  m: { id: 'm', tex: 'm', name: 'mass', mlt: [1, 0, 0] },
  t: { id: 't', tex: 't', name: 'time', mlt: [0, 0, 1] },
  delta: { id: 'delta', tex: '\\delta', name: 'bottom deflection', mlt: [0, 1, 0] },
  h: { id: 'h', tex: 'h', name: 'paint depth', mlt: [0, 1, 0] },
  d: { id: 'd', tex: 'd', name: 'bottom thickness', mlt: [0, 1, 0] },
  E: { id: 'E', tex: 'E', name: 'elastic modulus', mlt: [1, -1, -2] },
  dh: { id: 'dh', tex: '\\Delta h', name: 'capillary rise', mlt: [0, 1, 0] },
} satisfies Record<string, DimVar>

export interface Preset {
  id: string
  label: string
  title: string
  vars: DimVar[]
  /** Default repeating variables (indices into vars). */
  rep: number[]
  sys: Sys
  note: string
}

export const PRESETS: Preset[] = [
  {
    id: 'pipe',
    label: 'Pipe Δp',
    title: 'Lecture 13: pressure drop per unit length in a pipe',
    vars: [V.dpl, V.D, V.rho, V.mu, V.V],
    rep: [1, 4, 2],
    sys: 'FLT',
    note: 'Lecture 13 slides 12–16 use D, V, ρ in the FLT system.',
  },
  {
    id: 'paint',
    label: 'Paint can',
    title: 'Lecture 13: deflection of a paint-can bottom',
    vars: [V.delta, V.D, V.h, V.d, V.gamma, V.E],
    rep: [1, 4],
    sys: 'FLT',
    note: 'Lecture 13 slides 18–20 use D and γ; only two reference dimensions are needed.',
  },
  {
    id: 'sphere',
    label: 'Sphere drag',
    title: 'Fox Example 7.1: drag force on a smooth sphere',
    vars: [V.F, V.V, V.D, V.rho, V.mu],
    rep: [3, 1, 2],
    sys: 'MLT',
    note: 'Fox Example 7.1 uses ρ, V, D in the MLt system.',
  },
  {
    id: 'pipe72',
    label: 'Rough pipe',
    title: 'Fox Example 7.2: pressure drop in a rough pipe of length l',
    vars: [V.dp, V.rho, V.mu, V.Vbar, V.l, V.D, V.e],
    rep: [1, 3, 5],
    sys: 'MLT',
    note: 'Fox Example 7.2 uses ρ, V̄, D in the MLt system.',
  },
  {
    id: 'capillary',
    label: 'Capillary',
    title: 'Fox Example 7.3: capillary rise in a small tube',
    vars: [V.dh, V.D, V.gamma, V.sigma],
    rep: [1, 2],
    sys: 'MLT',
    note: 'Fox Example 7.3: rank 2 although M, L and t all appear.',
  },
]
