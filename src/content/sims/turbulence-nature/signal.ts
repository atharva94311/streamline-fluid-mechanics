/**
 * Synthetic turbulence signals for the turbulence-nature topic (supplementary models, not source data).
 *
 * A fluctuation is built as a sum of many sinusoids with random phases whose amplitudes follow a
 * von Kármán-type spectrum: flat at low frequency (so time averages converge like 1/√T, as in real
 * turbulence), ∝ f^(-5/3) in the "inertial" range and cut off exponentially at the Kolmogorov
 * frequency fEta. Below the cut-off time scale 1/fEta the trace is perfectly smooth — the
 * "Kolmogorov limit" of Wilkes p. 483 — while above it wiggles exist at every scale.
 */
import { num } from '@/kit'

export interface TurbMode {
  f: number
  a: number
  ph: number
}

export interface TurbSpec {
  seed?: number
  /** Roll-over frequency of the spectrum (Hz) — the large-eddy (integral-scale) frequency. */
  f0?: number
  /** Kolmogorov cut-off frequency (Hz): nothing faster than this survives. */
  fEta?: number
  /** Lowest frequency represented (Hz). */
  fMin?: number
  /** Number of sinusoidal modes. */
  modes?: number
}

export interface TurbSignal {
  modes: TurbMode[]
  /** Integral time scale of the model spectrum (s): T_I = E(0) / (4 σ²). */
  TI: number
  f0: number
  fEta: number
  /** Zero-mean, unit-RMS fluctuation at time t (s) — exact, any resolution. */
  at(t: number): number
  /** n equally spaced samples (spacing dt, s) starting at t0 (s). */
  sample(n: number, dt: number, t0?: number): Float64Array
}

const cache = new Map<string, TurbSignal>()

/** Build (or reuse) a deterministic multi-scale turbulence signal. */
export function makeTurbSignal(spec: TurbSpec = {}): TurbSignal {
  const { seed = 7, f0 = 3, fEta = 200, fMin = 0.05, modes = 160 } = spec
  const key = `${seed}|${f0}|${fEta}|${fMin}|${modes}`
  const hit = cache.get(key)
  if (hit) return hit

  const rand = num.seededRandom(seed)
  const fMax = 1.7 * fEta
  const lo = Math.log(fMin)
  const hi = Math.log(fMax)
  const E = (f: number) => Math.pow(1 + (f / f0) ** 2, -5 / 6) * Math.exp(-((f / fEta) ** 2))
  const list: TurbMode[] = []
  let variance = 0
  for (let k = 0; k < modes; k++) {
    const a0 = lo + ((hi - lo) * k) / modes
    const a1 = lo + ((hi - lo) * (k + 1)) / modes
    const f = Math.exp(a0 + (a1 - a0) * (0.15 + 0.7 * rand()))
    const band = E(f) * (Math.exp(a1) - Math.exp(a0))
    variance += band
    list.push({ f, a: Math.sqrt(2 * band), ph: 2 * Math.PI * rand() })
  }
  const norm = 1 / Math.sqrt(variance)
  for (const m of list) m.a *= norm

  const sig: TurbSignal = {
    modes: list,
    TI: 1 / (4 * variance),
    f0,
    fEta,
    at(t: number) {
      let s = 0
      for (const m of list) s += m.a * Math.sin(2 * Math.PI * m.f * t + m.ph)
      return s
    },
    sample(n: number, dt: number, t0 = 0) {
      const y = new Float64Array(n)
      for (const m of list) {
        const w = 2 * Math.PI * m.f
        const c = Math.cos(w * dt)
        const s = Math.sin(w * dt)
        let cs = Math.cos(w * t0 + m.ph)
        let sn = Math.sin(w * t0 + m.ph)
        const a = m.a
        for (let i = 0; i < n; i++) {
          y[i] += a * sn
          const ncs = cs * c - sn * s
          sn = sn * c + cs * s
          cs = ncs
        }
      }
      return y
    },
  }
  cache.set(key, sig)
  return sig
}

/** Arithmetic mean of a[i0..i1). */
export function meanOf(a: ArrayLike<number>, i0 = 0, i1 = a.length): number {
  let s = 0
  for (let i = i0; i < i1; i++) s += a[i]
  return i1 > i0 ? s / (i1 - i0) : 0
}

/** Root-mean-square deviation of a[i0..i1) about `m`. */
export function rmsAbout(a: ArrayLike<number>, m: number, i0 = 0, i1 = a.length): number {
  let s = 0
  for (let i = i0; i < i1; i++) s += (a[i] - m) ** 2
  return i1 > i0 ? Math.sqrt(s / (i1 - i0)) : 0
}

/** Prefix sums P[k] = a[0] + … + a[k-1] (length n + 1) for O(1) window means. */
export function prefixSums(a: ArrayLike<number>): Float64Array {
  const p = new Float64Array(a.length + 1)
  for (let i = 0; i < a.length; i++) p[i + 1] = p[i] + a[i]
  return p
}

/**
 * Oscilloscope-style decimation: for each of `buckets` slices of a[i0..i1) keep the min and the max
 * (in time order), so that sub-pixel "fuzz" is drawn as a band instead of being aliased away.
 */
export function envelope(a: ArrayLike<number>, i0: number, i1: number, buckets: number): [number, number][] {
  const out: [number, number][] = []
  const n = i1 - i0
  if (n <= 0) return out
  if (n <= 2 * buckets) {
    for (let i = i0; i < i1; i++) out.push([i, a[i]])
    return out
  }
  for (let b = 0; b < buckets; b++) {
    const s = i0 + Math.floor((n * b) / buckets)
    const e = i0 + Math.floor((n * (b + 1)) / buckets)
    let iMin = s
    let iMax = s
    for (let i = s; i < e; i++) {
      if (a[i] < a[iMin]) iMin = i
      if (a[i] > a[iMax]) iMax = i
    }
    if (iMin < iMax) out.push([iMin, a[iMin]], [iMax, a[iMax]])
    else out.push([iMax, a[iMax]], [iMin, a[iMin]])
  }
  return out
}

/** Zero-mean, unit-RMS, positively skewed version of a (roughly Gaussian) fluctuation record. */
export function skewed(a: Float64Array, strength = 0.6): Float64Array {
  const y = new Float64Array(a.length)
  for (let i = 0; i < a.length; i++) y[i] = Math.exp(strength * a[i])
  const m = meanOf(y)
  const r = rmsAbout(y, m)
  for (let i = 0; i < y.length; i++) y[i] = (y[i] - m) / (r || 1)
  return y
}

/** "1.2×10⁻⁵"-style label for powers of ten. */
export function pow10Label(e: number): string {
  if (e === 0) return '1'
  if (e === 1) return '10'
  return `10${num.superscript(e)}`
}

/** Read a CSS custom property (theme colour) for canvas drawing, with a fallback for tests. */
export function cssVar(el: Element | null, name: string, fallback: string): string {
  if (!el || typeof getComputedStyle === 'undefined') return fallback
  const v = getComputedStyle(el).getPropertyValue(name).trim()
  return v || fallback
}
