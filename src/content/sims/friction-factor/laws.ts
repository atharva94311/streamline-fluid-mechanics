/**
 * Friction-factor and wall-law relations from Wilkes, Ch. 9 (§9.6–§9.10), shared by the friction-factor sims.
 * Everything is dimensionless or SI. Implicit laws are solved for x = 1/√f by fixed-point iteration,
 * which converges in a handful of steps because |dg/dx| ≈ 1.7/x ≈ 0.1.
 */
import { bisect, fixedPoint, simpson } from '@/lib/math'

export const G = 9.81

/** Laminar Fanning friction factor 16/Re (Hagen–Poiseuille) — supplementary, for comparison only. */
export const fLaminar = (Re: number): number => 16 / Re

/** Blasius law, Wilkes (9.59)/(9.71): f_F = 0.0790 Re^(−1/4); smooth pipe, Re ≲ 1e5. */
export const fBlasius = (Re: number): number => 0.079 * Math.pow(Re, -0.25)

const clampX = (x: number): number => (Number.isFinite(x) ? Math.min(200, Math.max(0.5, x)) : 10)

function solveX(g: (x: number) => number, x0: number): number {
  const x = fixedPoint((v) => clampX(g(v)), clampX(x0), 1e-12, 400)
  return 1 / (x * x)
}

/** Wilkes (9.52), from the universal velocity profile: √(1/f) = 1.77 ln(Re√f) − 0.601. */
export const fSmoothTheory = (Re: number): number => solveX((x) => 1.77 * Math.log(Re / x) - 0.601, 15)

/** Wilkes (9.53), experimental smooth-pipe law: √(1/f) = 1.74 ln(Re√f) − 0.391. */
export const fSmoothExp = (Re: number): number => solveX((x) => 1.74 * Math.log(Re / x) - 0.391, 15)

export interface IterRow {
  k: number
  x: number
  f: number
}

/** Fixed-point iterates of (9.53) from a starting guess f0 (used for the teaching table). */
export function iterate953(Re: number, f0: number, steps = 6): IterRow[] {
  let x = 1 / Math.sqrt(f0)
  const rows: IterRow[] = [{ k: 0, x, f: f0 }]
  for (let k = 1; k <= steps; k++) {
    x = clampX(1.74 * Math.log(Re / x) - 0.391)
    rows.push({ k, x, f: 1 / (x * x) })
  }
  return rows
}

/** Colebrook–White, Wilkes (9.70): 1/√f = −1.737 ln(0.269 ε/D + 1.257/(Re√f)). `rr` = ε/D. */
export function fColebrook(Re: number, rr: number): number {
  const x0 = rr > 0 ? -1.737 * Math.log(0.269 * rr) : 15
  return solveX((x) => -1.737 * Math.log(0.269 * rr + (1.257 * x) / Re), x0)
}

/** Re → ∞ limit of (9.70): the completely rough friction factor, a function of ε/D only. */
export function fFullyRough(rr: number): number {
  const x = -1.737 * Math.log(0.269 * rr)
  return 1 / (x * x)
}

/** Roughness Reynolds number ε v̄z* / ν written with Re and f: (ε/D) Re √(f/2). */
export const epsPlusOf = (rr: number, Re: number, f: number): number => rr * Re * Math.sqrt(f / 2)

export type WallRegime = 'smooth' | 'transition' | 'rough'

/** Wilkes (9.64)–(9.66): < 5 hydraulically smooth, 5–70 transition, > 70 completely rough. */
export const wallRegime = (ep: number): WallRegime => (ep < 5 ? 'smooth' : ep < 70 ? 'transition' : 'rough')

export const REGIME_LABEL: Record<WallRegime, string> = {
  smooth: 'Hydraulically smooth',
  transition: 'Transition',
  rough: 'Completely rough',
}

export const REGIME_TONE: Record<WallRegime, 'good' | 'accent' | 'bad'> = {
  smooth: 'good',
  transition: 'accent',
  rough: 'bad',
}

/** Reynolds number at which ε⁺ reaches `target` for relative roughness rr (friction from Colebrook). */
export function reAtEpsPlus(rr: number, target: number): number {
  const h = (lg: number) => {
    const Re = 10 ** lg
    return epsPlusOf(rr, Re, fColebrook(Re, rr)) - target
  }
  return 10 ** bisect(h, 2, 11, 1e-9, 120)
}

/** Three-piece universal profile, Wilkes (9.44)–(9.46). */
export function uPlusThree(yp: number): number {
  if (!(yp > 0)) return 0
  if (yp < 5) return yp
  if (yp < 30) return -3.05 + 5 * Math.log(yp)
  return 5.5 + 2.5 * Math.log(yp)
}

/** Log law (9.42)/(9.46): v⁺ = 5.5 + 2.5 ln y⁺. */
export const uPlusLog = (yp: number): number => 5.5 + 2.5 * Math.log(yp)

/** One-seventh power law in wall units (9.78): v⁺ = 8.74 (y⁺)^(1/7). */
export const uPlusSeventh = (yp: number): number => 8.74 * Math.pow(yp, 1 / 7)

/** Completely rough profile (9.69) written in wall units: v⁺ = 8.5 + 2.5 ln(y⁺/ε⁺). */
export const uPlusRough = (yp: number, ep: number): number => 8.5 + 2.5 * Math.log(yp / ep)

/** a⁺ = a v̄z* / ν from Re and f_F:  (Re/2) √(f/2). */
export const aPlusOf = (Re: number, f: number): number => (Re / 2) * Math.sqrt(f / 2)

/** (9.49)–(9.50): v̄zm/v̄z* = 2.5 ln a⁺ + 1.75 when the log law is used over the whole pipe. */
export const meanLog = (aPlus: number): number => 2.5 * Math.log(aPlus) + 1.75

/** ∫₀^Y (a⁺ − y⁺) v⁺(y⁺) dy⁺ for the three-piece profile (flow carried within y⁺ < Y, up to a constant). */
export function flowIntegral(aPlus: number, Y: number): number {
  const g = (yp: number) => (aPlus - yp) * uPlusThree(yp)
  const topY = Math.min(Y, aPlus)
  let I = simpson(g, 0, Math.min(5, topY), 40)
  if (topY > 5) I += simpson(g, 5, Math.min(30, topY), 80)
  if (topY > 30)
    I += simpson(
      (s) => {
        const yp = Math.exp(s)
        return g(yp) * yp
      },
      Math.log(30),
      Math.log(topY),
      240,
    )
  return I
}

/** v̄zm/v̄z* from numerical integration of the three-piece profile (sublayer + buffer + core). */
export const meanThreePiece = (aPlus: number): number => (2 / (aPlus * aPlus)) * flowIntegral(aPlus, aPlus)

/** Points of y ↦ y^m on [0, 1], dense near the wall where the curve is nearly vertical. */
export function powerLawPoints(m: number): [number, number][] {
  const pts: [number, number][] = [[0, 0]]
  for (let i = 0; i <= 60; i++) {
    const t = 10 ** (-8 + (6.3 * i) / 60)
    pts.push([t, Math.pow(t, m)])
  }
  for (let i = 1; i <= 160; i++) {
    const t = 0.02 + (0.98 * i) / 160
    pts.push([t, Math.pow(t, m)])
  }
  return pts
}
