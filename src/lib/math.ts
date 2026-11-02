/** Numeric helpers shared by simulations and calculators. */

export const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x))
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t

export function linspace(a: number, b: number, n: number): number[] {
  if (n < 2) return [a]
  return Array.from({ length: n }, (_, i) => a + ((b - a) * i) / (n - 1))
}

export function logspace(a: number, b: number, n: number): number[] {
  return linspace(Math.log10(a), Math.log10(b), n).map((e) => 10 ** e)
}

/** Format with `sig` significant figures; switches to scientific for very large/small values. */
export function fmt(x: number, sig = 3): string {
  if (!Number.isFinite(x)) return x > 0 ? '∞' : x < 0 ? '−∞' : '—'
  if (x === 0) return '0'
  const ax = Math.abs(x)
  if (ax >= 1e5 || ax < 1e-3) {
    const [m, e] = x.toExponential(sig - 1).split('e')
    return `${m}×10${superscript(+e)}`
  }
  const digits = Math.max(0, sig - 1 - Math.floor(Math.log10(ax)))
  return x.toFixed(Math.min(digits, 8)).replace(/-/, '−')
}

/** Same as fmt but returns TeX (for use inside $...$). */
export function fmtTeX(x: number, sig = 3): string {
  if (!Number.isFinite(x)) return x > 0 ? '\\infty' : '-\\infty'
  if (x === 0) return '0'
  const ax = Math.abs(x)
  if (ax >= 1e5 || ax < 1e-3) {
    const [m, e] = x.toExponential(sig - 1).split('e')
    return `${m}\\times 10^{${+e}}`
  }
  const digits = Math.max(0, sig - 1 - Math.floor(Math.log10(ax)))
  return x.toFixed(Math.min(digits, 8))
}

const SUP: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }
export const superscript = (n: number) => String(n).split('').map((c) => SUP[c] ?? c).join('')

/** Solve A x = b by Gaussian elimination with partial pivoting. Returns null if singular. */
export function solveLinear(A: number[][], b: number[]): number[] | null {
  const n = A.length
  const M = A.map((row, i) => [...row, b[i]])
  for (let c = 0; c < n; c++) {
    let p = c
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r
    if (Math.abs(M[p][c]) < 1e-12) return null
    ;[M[c], M[p]] = [M[p], M[c]]
    for (let r = 0; r < n; r++) {
      if (r === c) continue
      const f = M[r][c] / M[c][c]
      for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k]
    }
  }
  return M.map((row, i) => row[n] / row[i] || 0)
}

/** Rank of a matrix (for dimensional matrices). */
export function rank(A: number[][]): number {
  const M = A.map((r) => [...r])
  const rows = M.length
  const cols = M[0]?.length ?? 0
  let rk = 0
  for (let c = 0; c < cols && rk < rows; c++) {
    let p = rk
    for (let r = rk + 1; r < rows; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r
    if (Math.abs(M[p][c]) < 1e-10) continue
    ;[M[rk], M[p]] = [M[p], M[rk]]
    for (let r = 0; r < rows; r++) {
      if (r === rk) continue
      const f = M[r][c] / M[rk][c]
      for (let k = c; k < cols; k++) M[r][k] -= f * M[rk][k]
    }
    rk++
  }
  return rk
}

/** Best rational approximation p/q with q ≤ maxDen. */
export function toFraction(x: number, maxDen = 12): [number, number] {
  if (!Number.isFinite(x)) return [NaN, 1]
  let best: [number, number] = [Math.round(x), 1]
  let err = Math.abs(x - best[0])
  for (let q = 2; q <= maxDen; q++) {
    const p = Math.round(x * q)
    const e = Math.abs(x - p / q)
    if (e < err - 1e-12) {
      best = [p, q]
      err = e
    }
  }
  return best
}

/** TeX for a rational exponent, e.g. -1/2 → '-1/2' rendered as a fraction. */
export function fracTeX(x: number, maxDen = 12): string {
  const [p, q] = toFraction(x, maxDen)
  if (q === 1) return String(p)
  return `${p < 0 ? '-' : ''}\\tfrac{${Math.abs(p)}}{${q}}`
}

/** Bisection root finder on [a, b]. */
export function bisect(f: (x: number) => number, a: number, b: number, tol = 1e-10, maxIter = 200): number {
  let fa = f(a)
  for (let i = 0; i < maxIter; i++) {
    const m = (a + b) / 2
    const fm = f(m)
    if (Math.abs(fm) < tol || (b - a) / 2 < tol) return m
    if (Math.sign(fm) === Math.sign(fa)) {
      a = m
      fa = fm
    } else b = m
  }
  return (a + b) / 2
}

/** Fixed-point / Newton-free solve of x = g(x). */
export function fixedPoint(g: (x: number) => number, x0: number, tol = 1e-12, maxIter = 500): number {
  let x = x0
  for (let i = 0; i < maxIter; i++) {
    const nx = g(x)
    if (Math.abs(nx - x) < tol * Math.max(1, Math.abs(nx))) return nx
    x = nx
  }
  return x
}

/** Composite Simpson integration of f on [a, b] with n (even) panels. */
export function simpson(f: (x: number) => number, a: number, b: number, n = 200): number {
  const m = n % 2 ? n + 1 : n
  const h = (b - a) / m
  let s = f(a) + f(b)
  for (let i = 1; i < m; i++) s += f(a + i * h) * (i % 2 ? 4 : 2)
  return (s * h) / 3
}

/** Classic RK4 for y' = f(t, y) (vector). Returns array of [t, y]. */
export function rk4(
  f: (t: number, y: number[]) => number[],
  y0: number[],
  t0: number,
  t1: number,
  steps: number,
): [number, number[]][] {
  const h = (t1 - t0) / steps
  let t = t0
  let y = [...y0]
  const out: [number, number[]][] = [[t, [...y]]]
  for (let i = 0; i < steps; i++) {
    const k1 = f(t, y)
    const k2 = f(t + h / 2, y.map((v, j) => v + (h / 2) * k1[j]))
    const k3 = f(t + h / 2, y.map((v, j) => v + (h / 2) * k2[j]))
    const k4 = f(t + h, y.map((v, j) => v + h * k3[j]))
    y = y.map((v, j) => v + (h / 6) * (k1[j] + 2 * k2[j] + 2 * k3[j] + k4[j]))
    t += h
    out.push([t, [...y]])
  }
  return out
}

/** Deterministic pseudo-random generator (mulberry32) — keeps sims reproducible. */
export function seededRandom(seed = 1): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Standard normal sample via Box–Muller using a supplied uniform generator. */
export function gaussian(rand: () => number): number {
  const u = Math.max(1e-12, rand())
  const v = rand()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

/** Relative-tolerance comparison used by numeric self-checks. */
export function closeTo(input: number, target: number, relTol = 0.02): boolean {
  if (!Number.isFinite(input)) return false
  if (target === 0) return Math.abs(input) < relTol
  return Math.abs(input - target) <= Math.abs(target) * relTol
}

/** Parse user numeric input: accepts 1.2e-3, 1.2×10^-3, 1,234.5, unicode minus. */
export function parseNumber(s: string): number {
  const t = s
    .trim()
    .replace(/−/g, '-')
    .replace(/,/g, '')
    .replace(/\s/g, '')
    .replace(/[x×]10\^?\(?(-?\d+)\)?/i, 'e$1')
  return t === '' ? NaN : Number(t)
}
