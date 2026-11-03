/**
 * Exact polynomial algebra in two variables (rational coefficients) for the ψ ↔ φ integrator.
 * A polynomial is a list of terms c·xⁱ·yʲ with c a reduced fraction n/d (d > 0).
 */

export interface Frac {
  n: number
  d: number
}

const gcd = (a: number, b: number): number => {
  a = Math.abs(a)
  b = Math.abs(b)
  while (b) [a, b] = [b, a % b]
  return a || 1
}

export function fr(n: number, d = 1): Frac {
  if (d < 0) {
    n = -n
    d = -d
  }
  const g = gcd(n, d)
  return { n: n / g, d: d / g }
}
/** Fraction from a decimal that is an exact multiple of 1/den (e.g. slider values in steps of 0.25). */
export const frDec = (x: number, den = 8): Frac => fr(Math.round(x * den), den)
export const fAdd = (a: Frac, b: Frac) => fr(a.n * b.d + b.n * a.d, a.d * b.d)
export const fMul = (a: Frac, b: Frac) => fr(a.n * b.n, a.d * b.d)
export const fNeg = (a: Frac): Frac => ({ n: -a.n, d: a.d })
export const fVal = (a: Frac) => a.n / a.d

export interface Term {
  i: number
  j: number
  c: Frac
}
export type Poly = Term[]

/** Combine like terms, drop zeros, order by total degree then by power of x (both descending). */
export function norm(terms: Term[]): Poly {
  const map = new Map<string, Term>()
  for (const t of terms) {
    const k = `${t.i},${t.j}`
    const prev = map.get(k)
    map.set(k, prev ? { i: t.i, j: t.j, c: fAdd(prev.c, t.c) } : t)
  }
  return [...map.values()].filter((t) => t.c.n !== 0).sort((a, b) => b.i + b.j - (a.i + a.j) || b.i - a.i)
}

/** Build from [coefficient, i, j] triples; coefficients may be numbers (integers) or fractions. */
export const poly = (...ts: [number | Frac, number, number][]): Poly =>
  norm(ts.map(([c, i, j]) => ({ i, j, c: typeof c === 'number' ? fr(c) : c })))

export const pAdd = (p: Poly, q: Poly) => norm([...p, ...q])
export const pNeg = (p: Poly): Poly => p.map((t) => ({ ...t, c: fNeg(t.c) }))
export const pSub = (p: Poly, q: Poly) => pAdd(p, pNeg(q))
export const pScale = (p: Poly, s: number) => norm(p.map((t) => ({ ...t, c: fMul(t.c, fr(s)) })))
export const pDx = (p: Poly) => norm(p.filter((t) => t.i > 0).map((t) => ({ i: t.i - 1, j: t.j, c: fMul(t.c, fr(t.i)) })))
export const pDy = (p: Poly) => norm(p.filter((t) => t.j > 0).map((t) => ({ i: t.i, j: t.j - 1, c: fMul(t.c, fr(t.j)) })))
export const pIntX = (p: Poly) => norm(p.map((t) => ({ i: t.i + 1, j: t.j, c: fMul(t.c, fr(1, t.i + 1)) })))
export const pIntY = (p: Poly) => norm(p.map((t) => ({ i: t.i, j: t.j + 1, c: fMul(t.c, fr(1, t.j + 1)) })))
export const pIsZero = (p: Poly) => p.length === 0
export const pHasX = (p: Poly) => p.some((t) => t.i > 0)
export const pHasY = (p: Poly) => p.some((t) => t.j > 0)
export const pLap = (p: Poly) => pAdd(pDx(pDx(p)), pDy(pDy(p)))

export function pEval(p: Poly, x: number, y: number): number {
  let s = 0
  for (const t of p) s += fVal(t.c) * x ** t.i * y ** t.j
  return s
}

function mono(i: number, j: number): string {
  const xs = i === 0 ? '' : i === 1 ? 'x' : `x^{${i}}`
  const ys = j === 0 ? '' : j === 1 ? 'y' : `y^{${j}}`
  return xs + ys
}

function coefTeX(c: Frac, withMono: boolean): string {
  const a = Math.abs(c.n)
  if (withMono && a === 1 && c.d === 1) return ''
  return c.d === 1 ? String(a) : `\\tfrac{${a}}{${c.d}}`
}

/** TeX for a polynomial, e.g. 5x^{2}y - \tfrac{5}{3}y^{3}. Empty polynomial → '0'. */
export function pTeX(p: Poly): string {
  if (!p.length) return '0'
  return p
    .map((t, k) => {
      const m = mono(t.i, t.j)
      const body = coefTeX(t.c, m !== '') + m
      const neg = t.c.n < 0
      if (k === 0) return (neg ? '-' : '') + body
      return (neg ? ' - ' : ' + ') + body
    })
    .join('')
}

/** Function form for plotting. */
export const pFn = (p: Poly) => (x: number, y: number) => pEval(p, x, y)
