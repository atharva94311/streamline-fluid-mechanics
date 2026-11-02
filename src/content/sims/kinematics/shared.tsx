import { useState, type ReactNode, type RefObject } from 'react'
import { useAnimationFrame, useInView, usePrefersReducedMotion } from '@/kit'

/**
 * Shared helpers for the fluid-element kinematics sims.
 * Velocity-gradient notation used everywhere in this folder:
 *   a = ∂u/∂x,  b = ∂u/∂y,  c = ∂v/∂x,  d = ∂v/∂y   (all in s⁻¹)
 */
export interface Grad {
  a: number
  b: number
  c: number
  d: number
}
export type P2 = [number, number]

export const ZERO_GRAD: Grad = { a: 0, b: 0, c: 0, d: 0 }

/** Rotation rate, vorticity, shear-strain rate and dilatation rate of a 2-D gradient. */
export function kin(g: Grad) {
  return {
    omegaZ: 0.5 * (g.c - g.b),
    zeta: g.c - g.b,
    gammaDot: g.c + g.b,
    dil: g.a + g.d,
  }
}

export type Part = 'all' | 'translation' | 'linear' | 'rotation' | 'shear'

/** The part of the velocity gradient responsible for one kind of motion (2-D decomposition). */
export function partGrad(g: Grad, part: Part): Grad {
  const w = 0.5 * (g.c - g.b)
  const s = 0.5 * (g.b + g.c)
  switch (part) {
    case 'translation':
      return ZERO_GRAD
    case 'linear':
      return { a: g.a, b: 0, c: 0, d: g.d }
    case 'rotation':
      return { a: 0, b: -w, c: w, d: 0 }
    case 'shear':
      return { a: 0, b: s, c: s, d: 0 }
    default:
      return g
  }
}

/** 3×3 matrix product (row-major arrays of 9). */
function mul3(A: number[], B: number[]): number[] {
  const C = new Array(9).fill(0)
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++) {
      let s = 0
      for (let k = 0; k < 3; k++) s += A[3 * i + k] * B[3 * k + j]
      C[3 * i + j] = s
    }
  return C
}

/** Matrix exponential of a 3×3 matrix (scaling and squaring + 14-term Taylor series). */
export function expm3(A: number[]): number[] {
  let norm = 0
  for (let i = 0; i < 3; i++) norm = Math.max(norm, Math.abs(A[3 * i]) + Math.abs(A[3 * i + 1]) + Math.abs(A[3 * i + 2]))
  const s = norm > 0.5 ? Math.ceil(Math.log2(norm / 0.5)) : 0
  const f = 2 ** -s
  const X = A.map((v) => v * f)
  let E = [1, 0, 0, 0, 1, 0, 0, 0, 1]
  let term = [1, 0, 0, 0, 1, 0, 0, 0, 1]
  for (let k = 1; k <= 14; k++) {
    term = mul3(term, X).map((v) => v / k)
    E = E.map((v, i) => v + term[i])
  }
  for (let i = 0; i < s; i++) E = mul3(E, E)
  return E
}

/**
 * Exact flow map of the linear (affine) velocity field  V(p) = V0 + L·(p − origin)  after time t.
 * Material points move by  p(t) = Φ(t)·[p − origin; 1] + origin  with Φ = exp([[L, V0],[0, 0]] t).
 */
export function flowMap(g: Grad, V0: P2, t: number, origin: P2 = [0, 0]): (p: P2) => P2 {
  const E = expm3([g.a * t, g.b * t, V0[0] * t, g.c * t, g.d * t, V0[1] * t, 0, 0, 0])
  return ([x, y]) => {
    const X = x - origin[0]
    const Y = y - origin[1]
    return [E[0] * X + E[1] * Y + E[2] + origin[0], E[3] * X + E[4] * Y + E[5] + origin[1]]
  }
}

/** Area ratio of a material element after time t in the linear field (det exp(Lt) = exp(tr L · t)). */
export const areaRatio = (g: Grad, t: number) => Math.exp((g.a + g.d) * t)

/**
 * Looping animation clock that pauses off-screen and under reduced motion.
 * Returns the elapsed time within the loop (0 … period, then a short hold) and the progress 0…1.
 * With reduced motion it returns the final state (progress 1) so diagrams stay readable.
 */
export function useLoop(ref: RefObject<Element | null>, period: number, opts: { hold?: number; playing?: boolean; speed?: number } = {}) {
  const { hold = 0.9, playing = true, speed = 1 } = opts
  const inView = useInView(ref)
  const reduced = usePrefersReducedMotion()
  const [t, setT] = useState(0)
  useAnimationFrame(
    (dt) =>
      setT((x) => {
        const n = x + dt * speed
        return n > period + hold ? 0 : n
      }),
    playing && inView && !reduced,
  )
  const tt = reduced ? period : Math.min(t, period)
  return { t: tt, s: period > 0 ? tt / period : 1, reduced, setT }
}

export const easeInOut = (s: number) => (s < 0.5 ? 2 * s * s : 1 - (-2 * s + 2) ** 2 / 2)

export const deg = (rad: number) => (rad * 180) / Math.PI

/** Finite-number guard for SVG attributes. */
export const fin = (v: number, fallback = 0) => (Number.isFinite(v) ? v : fallback)

/** Arrow (line + filled head) in screen coordinates. */
export function Arrow({
  x1, y1, x2, y2, color = 'var(--ink-2)', width = 1.6, head = 7, dash, opacity = 1,
}: {
  x1: number
  y1: number
  x2: number
  y2: number
  color?: string
  width?: number
  head?: number
  dash?: string
  opacity?: number
}) {
  const dx = x2 - x1
  const dy = y2 - y1
  const L = Math.hypot(dx, dy)
  if (!Number.isFinite(L) || L < 0.8) return null
  const ux = dx / L
  const uy = dy / L
  const h = Math.min(head, L * 0.7)
  const bx = x2 - ux * h
  const by = y2 - uy * h
  const px = -uy * h * 0.42
  const py = ux * h * 0.42
  return (
    <g opacity={opacity}>
      <line x1={x1} y1={y1} x2={bx} y2={by} stroke={color} strokeWidth={width} strokeDasharray={dash} strokeLinecap="round" />
      <path d={`M${x2} ${y2}L${bx + px} ${by + py}L${bx - px} ${by - py}Z`} fill={color} />
    </g>
  )
}

/** Double-headed dimension arrow. */
export function DimArrow({ x1, y1, x2, y2, color = 'var(--ink-2)' }: { x1: number; y1: number; x2: number; y2: number; color?: string }) {
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2
  return (
    <g>
      <Arrow x1={mx} y1={my} x2={x1} y2={y1} color={color} width={1.1} head={6} />
      <Arrow x1={mx} y1={my} x2={x2} y2={y2} color={color} width={1.1} head={6} />
    </g>
  )
}

/**
 * SVG arc path around (cx, cy) in screen space from math angle a0 to a1 (radians, counter-clockwise positive,
 * measured with y pointing UP — the function converts to SVG's y-down convention).
 */
export function arcPath(cx: number, cy: number, r: number, a0: number, a1: number): string {
  const p = (a: number) => [cx + r * Math.cos(a), cy - r * Math.sin(a)]
  const [x0, y0] = p(a0)
  const [x1, y1] = p(a1)
  const large = Math.abs(a1 - a0) > Math.PI ? 1 : 0
  const sweep = a1 > a0 ? 0 : 1
  return `M${fin(x0)} ${fin(y0)}A${r} ${r} 0 ${large} ${sweep} ${fin(x1)} ${fin(y1)}`
}

/** Small arc with an arrow head at its end (shows a sense of rotation). */
export function ArcArrow({ cx, cy, r, a0, a1, color, width = 1.4 }: { cx: number; cy: number; r: number; a0: number; a1: number; color: string; width?: number }) {
  if (Math.abs(a1 - a0) < 0.02) return null
  const end: P2 = [cx + r * Math.cos(a1), cy - r * Math.sin(a1)]
  const dir = Math.sign(a1 - a0)
  // tangent (screen) at the end in the direction of travel
  const tx = -Math.sin(a1) * dir
  const ty = -Math.cos(a1) * dir
  const h = 6
  const bx = end[0] - tx * h
  const by = end[1] - ty * h
  const px = -ty * h * 0.45
  const py = tx * h * 0.45
  return (
    <g>
      <path d={arcPath(cx, cy, r, a0, a1)} fill="none" stroke={color} strokeWidth={width} />
      <path d={`M${end[0]} ${end[1]}L${bx + px} ${by + py}L${bx - px} ${by - py}Z`} fill={color} />
    </g>
  )
}

/** A small status pill used under several sims. */
export function Chip({ on, children, tone = 'emerald' }: { on: boolean; children: ReactNode; tone?: 'emerald' | 'sky' | 'amber' }) {
  const onCls =
    tone === 'emerald'
      ? 'border-emerald-400 bg-emerald-50 text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-500/15 dark:text-emerald-200'
      : tone === 'sky'
        ? 'border-sky-400 bg-sky-50 text-sky-800 dark:border-sky-500/40 dark:bg-sky-500/15 dark:text-sky-200'
        : 'border-amber-400 bg-amber-50 text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-200'
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${on ? onCls : 'border-line bg-surface-2 text-ink-3 line-through decoration-1'}`}
    >
      {children}
    </span>
  )
}

/** Compact preset button row. */
export function PresetRow<T extends string>({ presets, onPick, active }: { presets: { key: T; label: string }[]; onPick: (k: T) => void; active?: T | null }) {
  return (
    <div>
      <div className="mb-1 text-sm text-ink-2">Presets</div>
      <div className="flex flex-wrap gap-1.5">
        {presets.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => onPick(p.key)}
            className={`rounded-lg border px-2 py-1 text-xs font-semibold transition ${
              active === p.key ? 'border-teal-500 bg-teal-600 text-white' : 'border-line bg-surface text-ink-2 hover:border-teal-400 hover:text-ink'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  )
}
