/**
 * Tiny, safe expression compiler for typed potentials φ(x, y).
 * Supports + − * / ^ (also **), parentheses, implicit multiplication (2xy, 3x^2, x cos(y)),
 * constants pi and e, and the functions sin cos tan exp log ln sqrt abs sinh cosh tanh atan atan2.
 * No eval: the text is tokenised and turned into a tree of closures.
 */
export type Fn2 = (x: number, y: number) => number

const F1: Record<string, (a: number) => number> = {
  sin: Math.sin, cos: Math.cos, tan: Math.tan, exp: Math.exp, log: Math.log, ln: Math.log, sqrt: Math.sqrt,
  abs: Math.abs, sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh, atan: Math.atan,
}
const F2: Record<string, (a: number, b: number) => number> = { atan2: Math.atan2 }
const NAMES = [...Object.keys(F1), ...Object.keys(F2), 'pi', 'x', 'y', 'e'].sort((a, b) => b.length - a.length)

type Tok = { t: 'num'; v: number } | { t: 'id'; v: string } | { t: 'op'; v: string }

function tokenize(src: string): Tok[] {
  const s = src.replace(/\*\*/g, '^').replace(/[−–]/g, '-').replace(/[·×]/g, '*').replace(/π/g, 'pi').toLowerCase()
  const out: Tok[] = []
  let k = 0
  while (k < s.length) {
    const ch = s[k]
    if (/\s/.test(ch)) {
      k++
      continue
    }
    const num = /^(\d+\.?\d*|\.\d+)(e[+-]?\d+)?/.exec(s.slice(k))
    if (num) {
      out.push({ t: 'num', v: parseFloat(num[0]) })
      k += num[0].length
      continue
    }
    if (/[a-z_]/.test(ch)) {
      const word = /^[a-z_][a-z_0-9]*/.exec(s.slice(k))![0]
      // split a run of letters greedily into known names: "xcos" → x, cos ; "xy" → x, y
      let p = 0
      while (p < word.length) {
        const name = NAMES.find((n) => word.startsWith(n, p))
        if (!name) throw new Error(`unknown name "${word.slice(p)}" (use x, y, pi, e and functions like sin, exp)`)
        out.push({ t: 'id', v: name })
        p += name.length
      }
      k += word.length
      continue
    }
    if ('+-*/^(),'.includes(ch)) {
      out.push({ t: 'op', v: ch })
      k++
      continue
    }
    throw new Error(`unexpected character "${ch}"`)
  }
  return out
}

export function compileExpr(src: string): { f: Fn2; error?: undefined } | { f?: undefined; error: string } {
  let toks: Tok[]
  try {
    toks = tokenize(src)
  } catch (e) {
    return { error: (e as Error).message }
  }
  if (!toks.length) return { error: 'type an expression in x and y' }
  let pos = 0
  const peek = () => toks[pos]
  const isOp = (v: string) => peek()?.t === 'op' && (peek() as { v: string }).v === v
  const expect = (v: string) => {
    if (!isOp(v)) throw new Error(`expected "${v}"`)
    pos++
  }

  const primary = (): Fn2 => {
    const tk = peek()
    if (!tk) throw new Error('unexpected end of expression')
    if (tk.t === 'num') {
      pos++
      const v = tk.v
      return () => v
    }
    if (tk.t === 'op' && tk.v === '(') {
      pos++
      const e = expr()
      expect(')')
      return e
    }
    if (tk.t === 'id') {
      pos++
      const n = tk.v
      if (n === 'x') return (x) => x
      if (n === 'y') return (_x, y) => y
      if (n === 'pi') return () => Math.PI
      if (n === 'e') return () => Math.E
      if (F1[n]) {
        expect('(')
        const a = expr()
        expect(')')
        const g = F1[n]
        return (x, y) => g(a(x, y))
      }
      if (F2[n]) {
        expect('(')
        const a = expr()
        expect(',')
        const b = expr()
        expect(')')
        const g = F2[n]
        return (x, y) => g(a(x, y), b(x, y))
      }
    }
    throw new Error(`unexpected "${String(tk.v)}"`)
  }
  const power = (): Fn2 => {
    const base = primary()
    if (isOp('^')) {
      pos++
      const ex = unary()
      return (x, y) => base(x, y) ** ex(x, y)
    }
    return base
  }
  const unary = (): Fn2 => {
    if (isOp('-')) {
      pos++
      const a = unary()
      return (x, y) => -a(x, y)
    }
    if (isOp('+')) {
      pos++
      return unary()
    }
    return power()
  }
  const startsPrimary = () => {
    const tk = peek()
    return !!tk && (tk.t === 'num' || tk.t === 'id' || (tk.t === 'op' && tk.v === '('))
  }
  const term = (): Fn2 => {
    let a = unary()
    for (;;) {
      if (isOp('*') || isOp('/')) {
        const op = (peek() as { v: string }).v
        pos++
        const b = unary()
        const l = a
        a = op === '*' ? (x, y) => l(x, y) * b(x, y) : (x, y) => l(x, y) / b(x, y)
      } else if (startsPrimary()) {
        const b = unary()
        const l = a
        a = (x, y) => l(x, y) * b(x, y)
      } else return a
    }
  }
  function expr(): Fn2 {
    let a = term()
    while (isOp('+') || isOp('-')) {
      const op = (peek() as { v: string }).v
      pos++
      const b = term()
      const l = a
      a = op === '+' ? (x, y) => l(x, y) + b(x, y) : (x, y) => l(x, y) - b(x, y)
    }
    return a
  }

  try {
    const f = expr()
    if (pos < toks.length) throw new Error('could not read the whole expression — check the brackets and operators')
    const probes: [number, number][] = [[0.31, 0.47], [-1.13, 0.82], [1.57, -0.66], [-0.4, -1.2]]
    if (!probes.some(([x, y]) => Number.isFinite(f(x, y)))) return { error: 'the expression is not finite in the plotted region' }
    return { f }
  } catch (e) {
    return { error: (e as Error).message }
  }
}
