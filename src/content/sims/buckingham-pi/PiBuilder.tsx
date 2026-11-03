/**
 * Pi-group builder: presets (lecture + Fox examples) or a custom variable list → dimensional matrix, rank r,
 * k − r, choice of repeating variables with an independence check, exponent equations, Π groups, Step 8 inversion
 * and the final relation, walking through the 9 steps of the method of repeating variables.
 */
import { useMemo, useState, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight, ListChecks, Plus, Minus } from 'lucide-react'
import { Readout, Segmented, SimPanel, cx } from '@/kit'
import {
  DIM_LETTERS, DIM_TEX, EXP_LETTERS, PRESETS, analyse, dimTeX, dimsOf, exponentEqTeX, netDims, productTeX, repeatingStatus,
  rowBasis, solveGroups, type DimVar, type Sys,
} from './dimlib'
import { MatrixTable } from './MatrixTable'
import { Chip, TeX } from './svg'

export const NINE_STEPS = [
  'List all variables',
  'Express in basic dimensions',
  'Count pi terms: k − r',
  'Pick r repeating variables',
  'Form the first Π (dependent variable)',
  'Repeat for each other variable',
  'Check: dimensionless & independent',
  'Rearrange to customary form',
  'Final relationship — interpret it',
]

/** Horizontal 9-step rail with the current step highlighted. */
export function StepRail({ stage, onPick, maxStage = 9 }: { stage: number; onPick?: (s: number) => void; maxStage?: number }) {
  return (
    <ol className="grid grid-cols-3 gap-1.5 sm:grid-cols-9" aria-label="Nine steps of the method of repeating variables">
      {NINE_STEPS.map((t, i) => {
        const s = i + 1
        const state = s < stage ? 'done' : s === stage ? 'now' : 'todo'
        return (
          <li key={s}>
            <button
              type="button"
              disabled={!onPick || s > maxStage}
              onClick={() => onPick?.(s)}
              className={cx(
                'flex h-full w-full flex-col items-start gap-0.5 rounded-lg border px-2 py-1.5 text-left text-[11px] leading-tight transition',
                state === 'done' && 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-100',
                state === 'now' && 'border-teal-500 bg-teal-100 text-teal-950 shadow-sm ring-2 ring-teal-400/50 dark:bg-teal-500/25 dark:text-teal-50',
                state === 'todo' && 'border-line bg-surface text-ink-3',
                s > maxStage && 'opacity-60',
              )}
            >
              <span className="font-bold">Step {s}</span>
              <span>{t}</span>
            </button>
          </li>
        )
      })}
    </ol>
  )
}

const CUSTOM_START: DimVar[] = [
  { id: 'c0', tex: '\\text{q1}', name: 'q1 (dependent)', mlt: [1, -1, -2] },
  { id: 'c1', tex: '\\text{q2}', name: 'q2', mlt: [0, 1, 0] },
  { id: 'c2', tex: '\\text{q3}', name: 'q3', mlt: [0, 0, -1] },
  { id: 'c3', tex: '\\text{q4}', name: 'q4', mlt: [1, -3, 0] },
  { id: 'c4', tex: '\\text{q5}', name: 'q5', mlt: [0, 3, -1] },
]

function Section({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-line bg-surface-2/40 p-3">
      <h4 className="mb-1.5 text-sm font-semibold text-ink">
        <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-teal-600 text-[11px] font-bold text-white">{n}</span>
        {title}
      </h4>
      <div className="space-y-1.5 text-sm text-ink-2">{children}</div>
    </section>
  )
}

export function PiBuilder({ initial = 'pipe' }: { initial?: string }) {
  const [presetId, setPresetId] = useState(initial)
  const preset = PRESETS.find((p) => p.id === presetId)
  const [custom, setCustom] = useState<DimVar[]>(CUSTOM_START)
  const vars = preset ? preset.vars : custom
  const [sys, setSys] = useState<Sys>(preset?.sys ?? 'MLT')
  const [rep, setRep] = useState<number[]>(preset?.rep ?? [1, 2, 3])
  const [stage, setStage] = useState(1)
  const [inv, setInv] = useState<number[]>([])

  const choosePreset = (id: string) => {
    setPresetId(id)
    const p = PRESETS.find((x) => x.id === id)
    setSys(p?.sys ?? 'MLT')
    setRep(p ? [...p.rep] : [1, 2, 3])
    setInv([])
    setStage(1)
  }

  const an = useMemo(() => analyse(vars, sys), [vars, sys])
  const status = repeatingStatus(an, rep, 0)
  const groups = useMemo(() => (status === 'ok' ? solveGroups(an, rep) : null), [an, rep, status])
  const basis = status === 'ok' ? rowBasis(an, rep) : []
  const nPi = an.k - an.r
  const maxStage = status === 'ok' && groups ? 9 : 4
  const st = Math.min(stage, maxStage)
  const other: Sys = sys === 'MLT' ? 'FLT' : 'MLT'

  const toggleRep = (j: number) => {
    setInv([])
    setRep((r) => (r.includes(j) ? r.filter((x) => x !== j) : [...r, j]))
  }
  const toggleInv = (q: number) => setInv((s) => (s.includes(q) ? s.filter((x) => x !== q) : [...s, q]))

  const setCell = (i: number, j: number, v: number) => {
    // edits are in the displayed system; convert back to MLT
    setCustom((cs) =>
      cs.map((c, jj) => {
        if (jj !== j) return c
        const d = [...dimsOf(c, sys)] as [number, number, number]
        d[i] = v
        const mlt: [number, number, number] = sys === 'MLT' ? d : [d[0], d[1] + d[0], d[2] - 2 * d[0]]
        return { ...c, mlt }
      }),
    )
    setInv([])
  }
  const addVar = () =>
    setCustom((cs) => (cs.length >= 8 ? cs : [...cs, { id: `c${cs.length}`, tex: `\\text{q${cs.length + 1}}`, name: `q${cs.length + 1}`, mlt: [0, 1, 0] }]))
  const removeVar = () => {
    setCustom((cs) => (cs.length <= 2 ? cs : cs.slice(0, -1)))
    setRep((r) => r.filter((j) => j < custom.length - 1))
  }

  const statusText =
    status === 'ok'
      ? 'Valid: r dimensionally independent variables, dependent variable excluded.'
      : status === 'dependent-var'
        ? 'Never use the dependent variable as a repeating variable.'
        : status === 'count'
          ? `Select exactly r = ${an.r} repeating variables (you have ${rep.length}).`
          : 'Not independent: these repeating variables can form a dimensionless product among themselves.'

  const piTeX = (g: { q: number; exps: number[] }, invert: boolean) =>
    productTeX(vars, invert ? g.exps.map((e) => -e) : g.exps)
  const rowLabels = DIM_TEX[sys]
  const letters = EXP_LETTERS

  const repTeX = rep.map((j, t) => `{${vars[j].tex}}^{${letters[t]}}`).join('\\,')

  return (
    <SimPanel
      title="Pi-group builder"
      subtitle="the 9 steps, solved live"
      wide
      controls={
        <>
          <Segmented
            label="Problem"
            value={presetId}
            onChange={choosePreset}
            options={[...PRESETS.map((p) => ({ value: p.id, label: p.label })), { value: 'custom', label: 'Custom' }]}
          />
          <Segmented
            label="Basic dimensions"
            value={sys}
            onChange={(s: Sys) => {
              setSys(s)
              setInv([])
            }}
            options={[
              { value: 'MLT', label: 'M L T' },
              { value: 'FLT', label: 'F L T' },
            ]}
          />
          <div>
            <div className="mb-1 text-sm text-ink-2">Repeating variables (Step 4)</div>
            <div className="flex flex-wrap gap-1.5">
              {vars.map((v, j) => (
                <Chip
                  key={j}
                  active={rep.includes(j)}
                  tone={j === 0 ? 'rose' : 'teal'}
                  onClick={() => toggleRep(j)}
                  title={j === 0 ? 'dependent variable' : v.name}
                >
                  <TeX tex={v.tex} />
                </Chip>
              ))}
            </div>
            <p className={cx('mt-1.5 text-xs', status === 'ok' ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300')}>
              {statusText}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setStage((s) => Math.max(1, Math.min(s, maxStage) - 1))}
              className="inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-xs font-semibold text-ink-2 hover:bg-surface-2"
            >
              <ChevronLeft size={14} /> Back
            </button>
            <button
              type="button"
              disabled={st >= maxStage}
              onClick={() => setStage((s) => Math.min(maxStage, Math.min(s, maxStage) + 1))}
              className="inline-flex items-center gap-1 rounded-lg bg-teal-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
            >
              Next step <ChevronRight size={14} />
            </button>
            <button
              type="button"
              onClick={() => setStage(maxStage)}
              className="inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-xs font-semibold text-ink-2 hover:bg-surface-2"
            >
              <ListChecks size={14} /> Show all
            </button>
          </div>
        </>
      }
      readout={
        <Readout
          cols={2}
          items={[
            { label: 'variables $k$', value: an.k },
            { label: 'rank $r$', value: an.r, tone: an.r < an.present.length ? 'accent' : 'default' },
            { label: 'pi terms $k-r$', value: nPi, tone: 'accent' },
            { label: 'repeating set', value: status === 'ok' ? 'valid' : 'not yet', tone: status === 'ok' ? 'good' : 'bad' },
          ]}
        />
      }
      footer={
        <span>
          <b>Try this:</b> in <i>Pipe Δp</i>, swap ρ for μ in the repeating set — the first Π becomes Δp<sub>ℓ</sub>D²/(μV): equally valid,
          but different (Π groups are not unique). Then open <i>Paint can</i> in M L T and notice r = 2 although three basic
          dimensions appear.
        </span>
      }
    >
      <div className="space-y-3">
        <StepRail stage={st} onPick={setStage} maxStage={maxStage} />
        <p className="text-xs text-ink-3">{preset ? `${preset.title}. ${preset.note}` : 'Custom problem: edit the exponents (in the selected system). The first column is the dependent variable.'}</p>

        <Section n={1} title="Variables (dependent variable first)">
          <TeX display tex={`${vars[0].tex} = f\\left(${vars.slice(1).map((v) => v.tex).join(',\\ ')}\\right) \\qquad k = ${an.k}`} />
          {!preset ? (
            <div className="flex gap-2">
              <button type="button" onClick={addVar} className="inline-flex items-center gap-1 rounded-lg border border-line px-2 py-1 text-xs text-ink-2 hover:bg-surface-2">
                <Plus size={13} /> variable
              </button>
              <button type="button" onClick={removeVar} className="inline-flex items-center gap-1 rounded-lg border border-line px-2 py-1 text-xs text-ink-2 hover:bg-surface-2">
                <Minus size={13} /> variable
              </button>
            </div>
          ) : null}
        </Section>

        {st >= 2 ? (
          <Section n={2} title={`Dimensions in ${sys} — the dimensional matrix`}>
            <MatrixTable vars={vars} rowLabels={rowLabels} A={an.A} rows={[0, 1, 2]} dep={0} rep={status === 'ok' ? rep : []} onCell={preset ? undefined : setCell} />
            <p className="text-xs text-ink-3">Each column lists the exponents of {DIM_LETTERS[sys].join(', ')} for one variable. Amber = dependent, teal = repeating.</p>
          </Section>
        ) : null}

        {st >= 3 ? (
          <Section n={3} title="How many pi terms?">
            <TeX display tex={`k - r = ${an.k} - ${an.r} = ${nPi}\\ \\text{pi term${nPi === 1 ? '' : 's'}}`} />
            {an.r < an.present.length ? (
              <p className="text-amber-800 dark:text-amber-200">
                {an.present.length} basic dimensions appear, but the matrix has rank only {an.r}: some dimensions always occur in a fixed
                combination (e.g. M T⁻²), so only {an.r} reference dimensions are needed.
              </p>
            ) : null}
            {nPi === 0 ? <p className="text-rose-700 dark:text-rose-300">No dimensionless group can be formed — the list is incomplete (a dimension appears in only one variable).</p> : null}
            {an.present.some((i) => an.A[i].filter((x) => x !== 0).length === 1) ? (
              <p className="text-rose-700 dark:text-rose-300">
                Warning: a dimension appears in only one variable — that variable will be forced out of every Π (it is irrelevant, or another variable is missing).
              </p>
            ) : null}
          </Section>
        ) : null}

        {st >= 4 ? (
          <Section n={4} title={`Choose r = ${an.r} repeating variables`}>
            <p>{statusText}</p>
            {status === 'ok' ? <p>Selected: <TeX tex={rep.map((j) => vars[j].tex).join(',\\ ')} /> — no dimensionless product can be formed from them.</p> : <p className="text-xs">Use the chips on the right; Steps 5–9 unlock once the set is valid.</p>}
          </Section>
        ) : null}

        {st >= 5 && groups
          ? groups.map((g, gi) => {
              if (gi > 0 && st < 6) return null
              const consts = [0, 1, 2].map((i) => an.A[i][g.q])
              const eqRows = an.present
                .map((i) => ({ i, tex: exponentEqTeX(consts[i], rep.map((j) => an.A[i][j]), letters) }))
                .filter((x) => x.tex)
              const factors = [g.q, ...rep].map((j, t) => `(${dimTeX(dimsOf(vars[j], sys), sys)})${t === 0 ? '' : `^{${letters[t - 1]}}`}`).join('')
              return (
                <Section key={g.q} n={gi === 0 ? 5 : 6} title={`Π${gi + 1} from ${vars[g.q].name}`}>
                  <TeX display tex={`\\Pi_{${gi + 1}} = {${vars[g.q].tex}}\\,${repTeX}`} />
                  <TeX display tex={`${factors} \\doteq ${an.present.map((i) => `${DIM_TEX[sys][i]}^{0}`).join('')}`} />
                  <div className="grid gap-x-6 sm:grid-cols-2">
                    {eqRows.map(({ i, tex }) => (
                      <div key={i}>
                        <TeX tex={`${tex}\\quad(\\text{for } ${DIM_TEX[sys][i]})`} />
                        {!basis.includes(i) ? <span className="ml-2 text-xs text-ink-3">(redundant — a multiple of another row)</span> : null}
                      </div>
                    ))}
                  </div>
                  <TeX display tex={`${g.sol.map((s, t) => `${letters[t]} = ${s === 0 ? '0' : num_frac(s)}`).join(',\\ ')} \\;\\Rightarrow\\; \\Pi_{${gi + 1}} = ${piTeX(g, false)}`} />
                </Section>
              )
            })
          : null}

        {st >= 7 && groups ? (
          <Section n={7} title="Check — dimensionless (in both systems) and independent">
            {groups.map((g, gi) => (
              <div key={g.q} className="flex flex-wrap items-center gap-x-4">
                <TeX tex={`\\Pi_{${gi + 1}} \\doteq ${dimTeX(netDims(vars, g.exps, sys), sys)}\\ \\text{in } ${sys}`} />
                <TeX tex={`\\doteq ${dimTeX(netDims(vars, g.exps, other), other)}\\ \\text{in } ${other}`} />
                <span className="text-emerald-700 dark:text-emerald-300">✓</span>
              </div>
            ))}
            <p className="text-xs">Independent: each Π contains a non-repeating variable that appears in no other Π, so none can be built from the others.</p>
          </Section>
        ) : null}

        {st >= 8 && groups ? (
          <Section n={8} title="Rearrange (customary form) — click to invert a group">
            <div className="flex flex-wrap gap-1.5">
              {groups.map((g, gi) => (
                <Chip key={g.q} active={inv.includes(g.q)} onClick={() => toggleInv(g.q)} tone="amber">
                  <TeX tex={`${inv.includes(g.q) ? '1/' : ''}\\Pi_{${gi + 1}} = ${piTeX(g, inv.includes(g.q))}`} />
                </Chip>
              ))}
            </div>
            <p className="text-xs">Inverting (or raising to a power, or multiplying by another Π) keeps the set valid — e.g. 1/Π₂ = ρVD/μ is the Reynolds number.</p>
          </Section>
        ) : null}

        {st >= 9 && groups ? (
          <Section n={9} title="Final relationship">
            <TeX
              display
              tex={
                groups.length === 1
                  ? `${piTeX(groups[0], inv.includes(groups[0].q))} = C \\quad(\\text{a constant})`
                  : `${piTeX(groups[0], inv.includes(groups[0].q))} = \\phi\\!\\left(${groups
                      .slice(1)
                      .map((g) => piTeX(g, inv.includes(g.q)))
                      .join(',\\ ')}\\right)`
              }
            />
            <p className="text-xs">φ is unknown — dimensional analysis gives the form; experiments (or theory) must supply the function.</p>
          </Section>
        ) : null}
      </div>
    </SimPanel>
  )
}

/** Exponent value as TeX (fractions allowed). */
function num_frac(x: number): string {
  const r = Math.round(x * 1e6) / 1e6
  if (Number.isInteger(r)) return String(r)
  const den = [2, 3, 4, 5, 6].find((q) => Math.abs(r * q - Math.round(r * q)) < 1e-6)
  if (!den) return r.toFixed(3)
  const p = Math.round(r * den)
  return `${p < 0 ? '-' : ''}\\tfrac{${Math.abs(p)}}{${den}}`
}
