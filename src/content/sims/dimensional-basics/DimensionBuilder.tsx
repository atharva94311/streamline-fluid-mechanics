/**
 * Concept "dimensions": build a product of powers of fluid-mechanics variables and watch its dimensions in MLT and
 * FLT update live (F ≐ MLT⁻², Lecture 13 slide 3). The exponent walks show the slide-4 bookkeeping: a product is
 * dimensionless only when the net exponent of every basic dimension is zero.
 */
import { useMemo, useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { M, Segmented, SimPanel, cx, md } from '@/kit'
import { SimBody, Tiles } from './ui'
import { ExponentWalk, type WalkFactor } from './ExponentWalk'
import {
  VAR, VARS, dimTeX, expTeX, inSystem, isDimensionless, productDim, productTeX, siBase, type Dim3, type DimSystem, type Factor,
} from './data'

const COLORS = ['var(--plot-1)', 'var(--plot-3)', 'var(--plot-2)', 'var(--plot-6)', 'var(--plot-8)']

/** Factors → walk rows (unused rows with exponent 0 are dropped). */
export function walkFactors(factors: Factor[], sys: DimSystem): WalkFactor[] {
  return factors
    .map((f, i) => ({ f, i }))
    .filter(({ f }) => Math.abs(f.exp) > 1e-9)
    .map(({ f, i }) => {
      const v = VAR[f.varId]
      const d = inSystem(v.mlt, sys)
      const base = v.paren && Math.abs(f.exp - 1) > 1e-9 ? `(${v.tex})` : v.tex
      return {
        tex: `${base}${expTeX(f.exp)}`,
        contrib: [d[0] * f.exp, d[1] * f.exp, d[2] * f.exp] as Dim3,
        color: COLORS[i % COLORS.length],
      }
    })
}

interface Preset {
  /** Pure TeX shown on the preset button. */
  tex: string
  trap?: boolean
  note: string
  factors: Factor[]
}

const PRESETS: Preset[] = [
  {
    tex: md`D\Delta p_\ell/\rho V^2`,
    note: 'Lecture 13, slide 4 (first group)',
    factors: [{ varId: 'D', exp: 1 }, { varId: 'dpl', exp: 1 }, { varId: 'rho', exp: -1 }, { varId: 'V', exp: -2 }],
  },
  {
    tex: md`\rho VD/\mu`,
    note: 'Lecture 13, slide 4 (second group)',
    factors: [{ varId: 'rho', exp: 1 }, { varId: 'V', exp: 1 }, { varId: 'D', exp: 1 }, { varId: 'mu', exp: -1 }],
  },
  {
    tex: md`F/\rho V^2D^2`,
    note: 'sphere-drag group, Fox p. 248',
    factors: [{ varId: 'F', exp: 1 }, { varId: 'rho', exp: -1 }, { varId: 'V', exp: -2 }, { varId: 'D', exp: -2 }],
  },
  {
    tex: md`V^2/gL`,
    note: 'gravity group (cf. the T. Rex case study, Fox p. 245)',
    factors: [{ varId: 'V', exp: 2 }, { varId: 'g', exp: -1 }, { varId: 'L', exp: -1 }, { varId: 'D', exp: 0 }],
  },
  {
    tex: md`\rho V^2/\mu`,
    trap: true,
    note: 'looks plausible — but a length is missing',
    factors: [{ varId: 'rho', exp: 1 }, { varId: 'V', exp: 2 }, { varId: 'mu', exp: -1 }, { varId: 'D', exp: 0 }],
  },
  {
    tex: md`\mu/\rho`,
    note: 'kinematic viscosity — not dimensionless',
    factors: [{ varId: 'mu', exp: 1 }, { varId: 'rho', exp: -1 }, { varId: 'V', exp: 0 }, { varId: 'D', exp: 0 }],
  },
]

const EXP_MIN = -4
const EXP_MAX = 4

function Stepper({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  const set = (v: number) => onChange(Math.max(EXP_MIN, Math.min(EXP_MAX, Math.round(v * 2) / 2)))
  const shown = Number.isInteger(value) ? String(value) : `${value < 0 ? '−' : ''}${Math.abs(value * 2)}/2`
  return (
    <div className="flex shrink-0 items-center gap-1">
      <button
        type="button"
        aria-label={`decrease exponent of ${label}`}
        onClick={() => set(value - 0.5)}
        className="rounded-md border border-line bg-surface p-1 text-ink-2 hover:bg-surface-2"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="w-9 text-center font-mono text-sm font-semibold text-ink">{shown.replace('-', '−')}</span>
      <button
        type="button"
        aria-label={`increase exponent of ${label}`}
        onClick={() => set(value + 0.5)}
        className="rounded-md border border-line bg-surface p-1 text-ink-2 hover:bg-surface-2"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

export function DimensionBuilder() {
  const [factors, setFactors] = useState<Factor[]>(PRESETS[0].factors)
  const [sys, setSys] = useState<DimSystem>('FLT')
  const [note, setNote] = useState(PRESETS[0].note)

  const mlt = useMemo(() => productDim(factors, 'MLT'), [factors])
  const flt = useMemo(() => productDim(factors, 'FLT'), [factors])
  const walk = useMemo(() => walkFactors(factors, sys), [factors, sys])
  const ok = isDimensionless(mlt)
  const anyUsed = factors.some((f) => Math.abs(f.exp) > 1e-9)

  const setRow = (i: number, patch: Partial<Factor>) => {
    setNote('your own product')
    setFactors((fs) => fs.map((f, j) => (j === i ? { ...f, ...patch } : f)))
  }

  const chip = 'rounded-lg border border-line bg-surface px-2 py-1 text-xs text-ink-2 hover:border-teal-400 hover:text-ink'

  return (
    <SimPanel
      title="Dimension builder"
      subtitle="pick variables and powers — read off MLT and FLT live"
      footer={
        <>
          <strong>Try this:</strong> load <M tex={md`\rho VD/\mu`} />, then change the power of <M tex="D" /> from 1 to 2 — the L-walk
          now ends at +1, so the group picks up a length. Then load the trap <M tex={md`\rho V^2/\mu`} /> (it comes out as{' '}
          <M tex={md`\dimT^{-1}`} />): change just two powers — those of <M tex="V" /> and <M tex="D" /> — to turn it into the Reynolds number.
        </>
      }
    >
      <SimBody
        viz={
          <div className="space-y-3">
            <div className="text-xs font-medium tracking-wide text-ink-3">{note}</div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-lg">
              <M tex={productTeX(factors)} className="text-ink" />
              <M tex={md`\doteq`} className="text-ink-3" />
              <M
                tex={dimTeX(sys === 'MLT' ? mlt : flt, sys)}
                className={cx('font-semibold', ok ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300')}
              />
            </div>
            {walk.length ? (
              <ExponentWalk factors={walk} sys={sys} caption="exponent walk for the product" />
            ) : (
              <div className="rounded-xl border border-dashed border-line p-6 text-center text-sm text-ink-3">Give at least one factor a non-zero power.</div>
            )}
            <p className="text-xs text-ink-3">
              Each arrow is one factor&apos;s contribution: (power in the product) × (that variable&apos;s own exponent). A green dot at 0 on all
              three lines means every basic dimension cancels — the product is a pure number with the same value in any consistent set of units.
            </p>
          </div>
        }
        controls={
          <>
            <div>
              <div className="mb-1 text-sm text-ink-2">Presets</div>
              <div className="flex flex-wrap gap-1.5">
                {PRESETS.map((p) => (
                  <button
                    key={p.tex}
                    type="button"
                    onClick={() => {
                      setFactors(p.factors)
                      setNote(p.note)
                    }}
                    className={chip}
                  >
                    <M tex={p.tex} />
                    {p.trap ? <span className="ml-1 text-rose-600 dark:text-rose-400">(trap)</span> : null}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-ink-2">Factors (power 0 = not used)</div>
              {factors.map((f, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: COLORS[i % COLORS.length] }} aria-hidden />
                  <select
                    value={f.varId}
                    onChange={(e) => setRow(i, { varId: e.target.value })}
                    aria-label={`variable ${i + 1}`}
                    className="min-w-0 flex-1 rounded-lg border border-line bg-surface px-2 py-1 text-sm text-ink"
                  >
                    {VARS.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.si})
                      </option>
                    ))}
                  </select>
                  <Stepper value={f.exp} onChange={(e) => setRow(i, { exp: e })} label={VAR[f.varId].name} />
                </div>
              ))}
            </div>
          </>
        }
        readout={
          <div className="space-y-3">
            <Segmented
              label="Show the walk in"
              value={sys}
              onChange={setSys}
              options={[
                { value: 'MLT', label: 'MLT' },
                { value: 'FLT', label: 'FLT' },
              ]}
            />
            <Tiles
              items={[
                { label: 'MLT', value: anyUsed ? (ok ? 'M⁰L⁰T⁰' : texToPlain(mlt, 'MLT')) : '—' },
                { label: 'FLT', value: anyUsed ? (ok ? 'F⁰L⁰T⁰' : texToPlain(flt, 'FLT')) : '—' },
                { label: 'SI base units', value: anyUsed ? siBase(mlt) : '—' },
                { label: 'verdict', value: !anyUsed ? 'empty' : ok ? 'dimensionless ✓' : 'has dimensions', tone: !anyUsed ? 'default' : ok ? 'good' : 'bad' },
              ]}
            />
          </div>
        }
      />
    </SimPanel>
  )
}

/** Plain-text (Unicode) version of a dimension vector for the readout tiles. */
function texToPlain(d: Dim3, sys: DimSystem): string {
  const letters = sys === 'MLT' ? ['M', 'L', 'T'] : ['F', 'L', 'T']
  const supMap: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }
  const sup = (e: number) => {
    if (Math.abs(e - 1) < 1e-9) return ''
    const r = Math.round(e * 2) / 2
    if (!Number.isInteger(r)) return `^(${r < 0 ? '−' : ''}${Math.abs(r * 2)}/2)`
    return String(r)
      .split('')
      .map((c) => supMap[c] ?? c)
      .join('')
  }
  return d.map((e, i) => (Math.abs(e) < 1e-9 ? '' : `${letters[i]}${sup(e)}`)).join('') || '1'
}

/** Static figure: the two slide-4 checks as exponent walks (FLT), side by side on wide screens. */
export function Slide4Walks() {
  const g1: Factor[] = PRESETS[0].factors
  const g2: Factor[] = PRESETS[1].factors
  return (
    <div className="space-y-5">
      <div className="min-w-0 space-y-1">
        <div className="text-sm font-semibold text-ink">
          <M tex={md`\dfrac{D\,\Delta p_\ell}{\rho V^2} \doteq \dimF^0\dimL^0\dimT^0`} />
        </div>
        <ExponentWalk factors={walkFactors(g1, 'FLT')} sys="FLT" caption="FLT exponent walk for D Δp over rho V squared" />
      </div>
      <div className="min-w-0 space-y-1">
        <div className="text-sm font-semibold text-ink">
          <M tex={md`\dfrac{\rho V D}{\mu} \doteq \dimF^0\dimL^0\dimT^0`} />
        </div>
        <ExponentWalk factors={walkFactors(g2, 'FLT')} sys="FLT" caption="FLT exponent walk for rho V D over mu" />
      </div>
    </div>
  )
}
