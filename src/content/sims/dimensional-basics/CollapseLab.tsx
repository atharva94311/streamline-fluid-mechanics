/**
 * Concept "motivation" — the data-collapse demo (Lecture 13, slides 2–3).
 *
 * Five SYNTHETIC "experiments" (different fluids and pipe diameters) are generated from standard smooth-pipe
 * correlations (laminar 32/Re, Blasius 0.158 Re^(−1/4); supplementary, not Lecture 13 material) with ±3 % scatter.
 * Plotted dimensionally (Δp_ℓ against V) they are five unrelated families; re-plotted as
 * Π₁ = DΔp_ℓ/(ρV²) against Re = ρVD/μ they collapse onto ONE curve. The morph animates every point between the views.
 */
import { useMemo, useState } from 'react'
import { scaleLog } from 'd3-scale'
import {
  M, Segmented, SimPanel, Slider, md, num, useAnimationFrame, useElementSize, useInView, usePrefersReducedMotion,
} from '@/kit'
import { FLUIDS, RE_BLASIUS_MAX, RE_LAM, RE_TURB, pipePi1, pipeRegime, type FluidId } from './data'
import { TeXLabel, decade } from './svg'
import { SimBody, Tiles } from './ui'

interface SeriesDef {
  id: string
  fluid: FluidId
  D: number
  V: [number, number]
  color: string
}

const SERIES: SeriesDef[] = [
  { id: 'water-10', fluid: 'water', D: 0.01, V: [0.02, 5], color: 'var(--plot-1)' },
  { id: 'water-50', fluid: 'water', D: 0.05, V: [0.005, 2], color: 'var(--plot-2)' },
  { id: 'air-25', fluid: 'air', D: 0.025, V: [0.1, 60], color: 'var(--plot-3)' },
  { id: 'oil-40', fluid: 'oil', D: 0.04, V: [0.2, 8], color: 'var(--plot-4)' },
  { id: 'gly-20', fluid: 'glycerin', D: 0.02, V: [0.05, 5], color: 'var(--plot-5)' },
]

interface Pt {
  s: number
  V: number
  dpl: number
  Re: number
  pi1: number
}

/** Generate the synthetic data once (deterministic). Transition-band points (2300 < Re < 4000) are omitted. */
function makeData(): Pt[] {
  const rand = num.seededRandom(11)
  const pts: Pt[] = []
  SERIES.forEach((sd, s) => {
    const f = FLUIDS[sd.fluid]
    for (const V of num.logspace(sd.V[0], sd.V[1], 10)) {
      const Re = (f.rho * V * sd.D) / f.mu
      const exact = pipePi1(Re)
      if (!Number.isFinite(exact)) continue
      const pi1 = exact * (1 + 0.03 * num.gaussian(rand))
      pts.push({ s, V, Re, pi1, dpl: (pi1 * f.rho * V * V) / sd.D })
    }
  })
  return pts
}
const DATA = makeData()

// axis domains (log)
const RAW_X: [number, number] = [1e-3, 100] // V, m/s
const RAW_Y: [number, number] = [1e-2, 1e6] // Δp_ℓ, Pa/m
const COL_X: [number, number] = [0.5, 2e5] // Re
const COL_Y: [number, number] = [3e-3, 100] // Π₁

const nrm = (v: number, [a, b]: [number, number]) => (Math.log10(v) - Math.log10(a)) / (Math.log10(b) - Math.log10(a))
const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2)
const decadesIn = ([a, b]: [number, number]) => {
  const out: number[] = []
  for (let e = Math.ceil(Math.log10(a) - 1e-9); e <= Math.floor(Math.log10(b) + 1e-9); e++) out.push(10 ** e)
  return out
}

const FLUID_OPTS: { value: FluidId; label: string }[] = [
  { value: 'water', label: 'water' },
  { value: 'air', label: 'air' },
  { value: 'oil', label: 'oil' },
  { value: 'glycerin', label: 'glycerin' },
]

function Star({ x, y, r, color }: { x: number; y: number; r: number; color: string }) {
  const p: string[] = []
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5
    const rr = i % 2 ? r * 0.45 : r
    p.push(`${(x + rr * Math.cos(a)).toFixed(1)},${(y + rr * Math.sin(a)).toFixed(1)}`)
  }
  return <polygon points={p.join(' ')} fill={color} stroke="var(--surface)" strokeWidth={1.2} />
}

export function CollapseLab() {
  const [boxRef, size] = useElementSize<HTMLDivElement>()
  const inView = useInView(boxRef)
  const reduced = usePrefersReducedMotion()
  const [target, setTarget] = useState<0 | 1>(0)
  const [t, setT] = useState(0)
  const [fluid, setFluid] = useState<FluidId>('glycerin')
  const [D, setD] = useState(0.05)
  const [V, setV] = useState(0.5)
  const [pins, setPins] = useState<{ fluid: FluidId; D: number; V: number }[]>([])

  const animating = Math.abs(t - target) > 1e-4
  useAnimationFrame(
    (dt) => {
      setT((prev) => (target > prev ? Math.min(target, prev + dt / 1.3) : Math.max(target, prev - dt / 1.3)))
    },
    animating && inView && !reduced,
  )
  const go = (v: 0 | 1) => {
    setTarget(v)
    if (reduced) setT(v)
  }

  const W = Math.max(300, size.width || 640)
  const H = 310
  const m = { left: 54, right: 12, top: 30, bottom: 42 }
  const iw = W - m.left - m.right
  const ih = H - m.top - m.bottom
  const e = ease(t)
  const px = (u: number) => m.left + u * iw
  const py = (v: number) => m.top + (1 - v) * ih

  // the student's own experiment
  const fl = FLUIDS[fluid]
  const Re = (fl.rho * V * D) / fl.mu
  const pi1 = pipePi1(Re)
  const dpl = (pi1 * fl.rho * V * V) / D
  const regime = pipeRegime(Re)
  const inModel = Re <= RE_BLASIUS_MAX && Number.isFinite(pi1)
  const regimeText =
    regime === 'transition'
      ? 'transition: no single curve'
      : Re > RE_BLASIUS_MAX
        ? 'beyond Blasius range (Re > 10⁵)'
        : Re < COL_X[0]
          ? 'laminar (left of the chart)'
          : regime

  const curve = useMemo(() => {
    const lam = num.logspace(COL_X[0], RE_LAM, 40).map((r) => [nrm(r, COL_X), nrm(32 / r, COL_Y)] as const)
    const tur = num.logspace(RE_TURB, RE_BLASIUS_MAX, 30).map((r) => [nrm(r, COL_X), nrm(0.158 * r ** -0.25, COL_Y)] as const)
    return { lam, tur }
  }, [])
  const pathOf = (pts: readonly (readonly [number, number])[]) =>
    pts.map(([u, v], i) => `${i ? 'L' : 'M'}${px(u).toFixed(1)},${py(v).toFixed(1)}`).join('')

  const rawXT = decadesIn(RAW_X)
  const rawYT = decadesIn(RAW_Y)
  const colXT = decadesIn(COL_X)
  const colYT = decadesIn(COL_Y)
  // keep tick-label density readable on phones
  const thin = (arr: number[]) => (iw < 380 ? arr.filter((_, i) => i % 2 === 0) : arr)

  const mine = Number.isFinite(dpl)
    ? {
        u: (1 - e) * nrm(V, RAW_X) + e * nrm(Re, COL_X),
        v: (1 - e) * nrm(dpl, RAW_Y) + e * nrm(pi1, COL_Y),
      }
    : null
  const mineVisible = mine && mine.u >= 0 && mine.u <= 1 && mine.v >= 0 && mine.v <= 1

  /** Interpolated (u, v) of any experiment, or null if it is in the transition band or off the chart. */
  const placeOf = (pf: FluidId, pD: number, pV: number) => {
    const ff = FLUIDS[pf]
    const r = (ff.rho * pV * pD) / ff.mu
    const p1 = pipePi1(r)
    const dp = (p1 * ff.rho * pV * pV) / pD
    if (!Number.isFinite(dp)) return null
    const u = (1 - e) * nrm(pV, RAW_X) + e * nrm(r, COL_X)
    const v = (1 - e) * nrm(dp, RAW_Y) + e * nrm(p1, COL_Y)
    return u >= 0 && u <= 1 && v >= 0 && v <= 1 ? { u, v } : null
  }

  const chart = (
    <div ref={boxRef} className="w-full">
      <div className="mb-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-2">
        {SERIES.map((sd) => (
          <span key={sd.id} className="inline-flex items-center gap-1.5">
            <svg width="10" height="10" aria-hidden>
              <circle cx="5" cy="5" r="4" fill={sd.color} />
            </svg>
            {FLUIDS[sd.fluid].label}, D = {sd.D * 1000} mm
          </span>
        ))}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label="pipe pressure-drop data in raw and dimensionless coordinates">
        {/* raw-view grid + ticks */}
        <g opacity={1 - e}>
          {rawXT.map((v) => (
            <line key={`rx${v}`} x1={px(nrm(v, RAW_X))} x2={px(nrm(v, RAW_X))} y1={m.top} y2={m.top + ih} stroke="var(--grid)" />
          ))}
          {rawYT.map((v) => (
            <line key={`ry${v}`} y1={py(nrm(v, RAW_Y))} y2={py(nrm(v, RAW_Y))} x1={m.left} x2={m.left + iw} stroke="var(--grid)" />
          ))}
          {thin(rawXT).map((v) => (
            <text key={`rxl${v}`} x={px(nrm(v, RAW_X))} y={m.top + ih + 15} textAnchor="middle" className="fill-ink-3 text-[11px]">
              {decade(v)}
            </text>
          ))}
          {thin(rawYT).map((v) => (
            <text key={`ryl${v}`} x={m.left - 6} y={py(nrm(v, RAW_Y))} dy="0.32em" textAnchor="end" className="fill-ink-3 text-[11px]">
              {decade(v)}
            </text>
          ))}
          <TeXLabel x={m.left + iw / 2} y={H - 10} tex={md`V\ \ (\mathrm{m/s})`} anchor="middle" w={140} />
          <TeXLabel x={4} y={13} tex={md`\Delta p_\ell\ \ (\mathrm{Pa/m})`} w={160} />
        </g>
        {/* dimensionless-view grid + ticks */}
        <g opacity={e}>
          {colXT.map((v) => (
            <line key={`cx${v}`} x1={px(nrm(v, COL_X))} x2={px(nrm(v, COL_X))} y1={m.top} y2={m.top + ih} stroke="var(--grid)" />
          ))}
          {colYT.map((v) => (
            <line key={`cy${v}`} y1={py(nrm(v, COL_Y))} y2={py(nrm(v, COL_Y))} x1={m.left} x2={m.left + iw} stroke="var(--grid)" />
          ))}
          {thin(colXT).map((v) => (
            <text key={`cxl${v}`} x={px(nrm(v, COL_X))} y={m.top + ih + 15} textAnchor="middle" className="fill-ink-3 text-[11px]">
              {decade(v)}
            </text>
          ))}
          {colYT.map((v) => (
            <text key={`cyl${v}`} x={m.left - 6} y={py(nrm(v, COL_Y))} dy="0.32em" textAnchor="end" className="fill-ink-3 text-[11px]">
              {v < 1 ? String(v) : decade(v)}
            </text>
          ))}
          <TeXLabel x={m.left + iw / 2} y={H - 10} tex={md`Re = \rho V D/\mu`} anchor="middle" w={160} />
          <TeXLabel x={4} y={13} tex={md`\Pi_1 = D\,\Delta p_\ell/\rho V^2`} w={200} />
          {/* model curve + transition gap */}
          <path d={pathOf(curve.lam)} fill="none" stroke="var(--ink-3)" strokeWidth={1.4} strokeDasharray="5 4" />
          <path d={pathOf(curve.tur)} fill="none" stroke="var(--ink-3)" strokeWidth={1.4} strokeDasharray="5 4" />
          <rect
            x={px(nrm(RE_LAM, COL_X))}
            y={m.top}
            width={px(nrm(RE_TURB, COL_X)) - px(nrm(RE_LAM, COL_X))}
            height={ih}
            fill="var(--band)"
          />
          <text x={px(nrm(3000, COL_X))} y={m.top + 12} textAnchor="middle" className="fill-ink-3 text-[10px]">
            transition
          </text>
          <text x={px(nrm(3, COL_X))} y={py(nrm(32 / 3, COL_Y)) - 8} className="fill-ink-3 text-[10px]">
            laminar: 32/Re
          </text>
          <text x={px(nrm(2e4, COL_X))} y={py(nrm(0.158 * 2e4 ** -0.25, COL_Y)) - 10} textAnchor="middle" className="fill-ink-3 text-[10px]">
            Blasius
          </text>
        </g>
        <rect x={m.left} y={m.top} width={iw} height={ih} fill="none" stroke="var(--axis)" strokeOpacity={0.5} />
        {/* data points, interpolated between the two coordinate systems */}
        {DATA.map((p, i) => {
          const u = (1 - e) * nrm(p.V, RAW_X) + e * nrm(p.Re, COL_X)
          const v = (1 - e) * nrm(p.dpl, RAW_Y) + e * nrm(p.pi1, COL_Y)
          return <circle key={i} cx={px(u)} cy={py(v)} r={3.6} fill={SERIES[p.s].color} fillOpacity={0.85} stroke="var(--surface)" strokeWidth={0.8} />
        })}
        {pins.map((pn, i) => {
          const pl = placeOf(pn.fluid, pn.D, pn.V)
          return pl ? (
            <g key={`pin${i}`}>
              <Star x={px(pl.u)} y={py(pl.v)} r={7} color="var(--plot-8)" />
              <text x={px(pl.u) + 9} y={py(pl.v) - 6} className="fill-ink-2 text-[10px] font-semibold">
                {FLUIDS[pn.fluid].label}
              </text>
            </g>
          ) : null
        })}
        {mine && mineVisible ? <Star x={px(mine.u)} y={py(mine.v)} r={8} color="var(--ink)" /> : null}
      </svg>
      <p className="mt-1 text-xs text-ink-3">
        Synthetic data (supplementary): smooth-pipe laminar law and Blasius law with ±3 % random scatter; points in the transition band
        are omitted. Lecture 13 draws the same idea qualitatively, without numbers.
      </p>
    </div>
  )

  const btn = 'rounded-lg border border-line bg-surface px-2.5 py-1 text-xs font-semibold text-ink-2 hover:border-teal-400 hover:text-ink'

  return (
    <SimPanel
      title="Data-collapse lab"
      subtitle="five synthetic pipe experiments, one dimensionless curve"
      footer={
        <>
          <strong>Try this:</strong> switch between the two views and watch five unrelated families fall onto one curve. Then put your ★ in
          glycerin and press <em>pin</em>; switch the fluid to air and adjust <M tex="D" /> and <M tex="V" /> until <M tex="Re" /> matches the
          pinned value — in the dimensionless view the new ★ lands on the pinned one, although <M tex={md`\Delta p_\ell`} /> differs by orders
          of magnitude (compare the raw view).
        </>
      }
    >
      <SimBody
        viz={chart}
        controls={
          <>
            <Segmented
              label="View"
              value={target}
              onChange={go}
              options={[
                { value: 0, label: md`raw: $\Delta p_\ell$ vs $V$` },
                { value: 1, label: md`$\Pi_1$ vs $Re$` },
              ]}
            />
            <div className="rounded-xl border border-line p-3">
              <div className="mb-2 text-sm font-semibold text-ink">Your experiment (★)</div>
              <Segmented label="fluid" value={fluid} onChange={setFluid} options={FLUID_OPTS} />
              <div className="mt-3 space-y-3">
                <Slider label={md`pipe diameter $D$`} value={D} min={0.005} max={0.2} log onChange={setD} unit="m" digits={2} />
                <Slider label={md`mean velocity $V$`} value={V} min={0.001} max={100} log onChange={setV} unit="m/s" digits={2} />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" className={btn} onClick={() => setPins((ps) => [...ps.slice(-3), { fluid, D, V }])}>
                  pin ★
                </button>
                <button type="button" className={btn} onClick={() => setPins([])} disabled={!pins.length}>
                  clear pins
                </button>
              </div>
            </div>
          </>
        }
        readout={
          <Tiles
            items={[
              { label: md`$Re = \rho VD/\mu$`, value: Re, digits: 3 },
              { label: md`$\Pi_1 = D\Delta p_\ell/\rho V^2$`, value: Number.isFinite(pi1) ? pi1 : '—', digits: 3 },
              { label: md`$\Delta p_\ell$`, value: Number.isFinite(dpl) ? dpl : '—', unit: Number.isFinite(dpl) ? 'Pa/m' : undefined, digits: 3 },
              {
                label: 'regime (model)',
                value: regimeText,
                tone: !inModel ? 'bad' : 'accent',
              },
              ...pins.map((pn) => {
                const ff = FLUIDS[pn.fluid]
                return { label: `pinned: ${ff.label}`, value: `Re = ${num.fmt((ff.rho * pn.V * pn.D) / ff.mu, 3)}` }
              }),
            ]}
          />
        }
      />
    </SimPanel>
  )
}
