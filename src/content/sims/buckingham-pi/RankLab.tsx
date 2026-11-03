/**
 * Dimensional-matrix rank lab (Fox p.252–253): rank = order of the largest non-zero determinant (minor).
 * Click row and column headers to build a square sub-matrix; the lab evaluates its determinant and also searches
 * all minors, largest order first, to find m = rank and the number of independent Π's, n − m.
 */
import { useMemo, useState } from 'react'
import { Readout, Segmented, SimPanel, cx } from '@/kit'
import { V, combos, det, dimMatrix, rankOf, type DimVar, type Sys } from './dimlib'
import { MatrixTable } from './MatrixTable'
import { TeX } from './svg'

interface Case {
  id: string
  label: string
  title: string
  vars: DimVar[]
  sys: Sys
}

const CASES: Case[] = [
  { id: 'capM', label: '7.3 in MLt', title: 'Fox Example 7.3 (capillary rise), M L t', vars: [V.dh, V.D, V.gamma, V.sigma], sys: 'MLT' },
  { id: 'capF', label: '7.3 in FLt', title: 'Fox Example 7.3 (capillary rise), F L t', vars: [V.dh, V.D, V.gamma, V.sigma], sys: 'FLT' },
  { id: 'sphere', label: 'Sphere 7.1', title: 'Fox Example 7.1 (sphere drag), M L t', vars: [V.F, V.V, V.D, V.rho, V.mu], sys: 'MLT' },
  { id: 'paint', label: 'Paint can', title: 'Lecture 13 paint can, M L T', vars: [V.delta, V.D, V.h, V.d, V.gamma, V.E], sys: 'MLT' },
  {
    id: 'pend',
    label: 'Pendulum',
    title: 'Supplementary: pendulum period t = f(l, g, m) — n − m = 1',
    vars: [{ ...V.t, name: 'period' }, V.l, V.g, V.m],
    sys: 'MLT',
  },
]

const ROW_TEX: Record<Sys, string[]> = { MLT: ['\\dimM', '\\dimL', '\\dimT'], FLT: ['\\dimF', '\\dimL', '\\dimT'] }

const bmat = (M: number[][]) => `\\begin{vmatrix}${M.map((r) => r.join(' & ')).join(' \\\\ ')}\\end{vmatrix}`

export function RankLab() {
  const [cid, setCid] = useState('capM')
  const cs = CASES.find((c) => c.id === cid)!
  const A = useMemo(() => dimMatrix(cs.vars, cs.sys), [cs])
  const rowsShown = [0, 1, 2].filter((i) => A[i].some((x) => x !== 0))
  const [selR, setSelR] = useState<number[]>([0, 1, 2])
  const [selC, setSelC] = useState<number[]>([1, 2, 3])

  const pick = (id: string) => {
    setCid(id)
    const c = CASES.find((x) => x.id === id)!
    const M = dimMatrix(c.vars, c.sys)
    const rs = [0, 1, 2].filter((i) => M[i].some((x) => x !== 0))
    setSelR(rs)
    setSelC(Array.from({ length: Math.min(rs.length, c.vars.length) }, (_, j) => c.vars.length - Math.min(rs.length, c.vars.length) + j))
  }

  const m = rankOf(rowsShown.map((i) => A[i]))
  const n = cs.vars.length
  const sR = selR.filter((i) => rowsShown.includes(i)).sort()
  const sC = [...selC].sort()
  const square = sR.length === sC.length && sR.length > 0
  const sub = square ? sR.map((i) => sC.map((j) => A[i][j])) : null
  const dval = sub ? det(sub) : null

  // search of minors, largest order first
  const search = useMemo(() => {
    const rowsShown = [0, 1, 2].filter((i) => A[i].some((x) => x !== 0))
    const out: { order: number; total: number; nonzero: number; example?: { rows: number[]; cols: number[]; d: number } }[] = []
    for (let k = Math.min(rowsShown.length, n); k >= 1; k--) {
      let total = 0
      let nonzero = 0
      let example: { rows: number[]; cols: number[]; d: number } | undefined
      for (const rr of combos(rowsShown.length, k)) {
        for (const cc of combos(n, k)) {
          total++
          const rows = rr.map((t) => rowsShown[t])
          const d = det(rows.map((i) => cc.map((j) => A[i][j])))
          if (d !== 0) {
            nonzero++
            if (!example) example = { rows, cols: cc, d }
          }
        }
      }
      out.push({ order: k, total, nonzero, example })
      if (nonzero) break
    }
    return out
  }, [A, n])

  const toggle = (arr: number[], set: (v: number[]) => void, x: number) => set(arr.includes(x) ? arr.filter((y) => y !== x) : [...arr, x])

  return (
    <SimPanel
      title="Rank lab"
      subtitle="m = order of the largest non-zero determinant"
      wide
      controls={
        <>
          <Segmented label="Dimensional matrix" value={cid} onChange={pick} options={CASES.map((c) => ({ value: c.id, label: c.label }))} />
          <p className="text-xs text-ink-3">Click row labels and column headers to choose a square sub-matrix (violet outline).</p>
        </>
      }
      readout={
        <Readout
          items={[
            { label: '$n$ parameters', value: n },
            { label: '$r$ dims present', value: rowsShown.length },
            { label: '$m$ = rank', value: m, tone: m < rowsShown.length ? 'accent' : 'default' },
            { label: '$n-m$ Π groups', value: n - m, tone: 'good' },
          ]}
        />
      }
      footer={
        <span>
          <b>Try this:</b> in “7.3 in MLt” select all three rows with columns D, γ, σ — the determinant is 0 because the t row is −2 × the M row.
          Then pick rows L, t and columns γ, σ: determinant 4 ≠ 0, so m = 2 although r = 3. Open “Pendulum”: n − m = 1, so the single Π is a constant.
        </span>
      }
    >
      <div className="space-y-3">
        <p className="text-xs text-ink-3">{cs.title}</p>
        <MatrixTable
          vars={cs.vars}
          rowLabels={ROW_TEX[cs.sys]}
          A={A}
          rows={rowsShown}
          selRows={sR}
          selCols={sC}
          onRow={(i) => toggle(selR, setSelR, i)}
          onCol={(j) => toggle(selC, setSelC, j)}
        />
        <div
          className={cx(
            'rounded-xl border px-3 py-2 text-sm',
            dval === null ? 'border-line text-ink-3' : dval !== 0 ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-500/40 dark:bg-emerald-500/10' : 'border-rose-300 bg-rose-50 dark:border-rose-500/40 dark:bg-rose-500/10',
          )}
        >
          {sub ? (
            <TeX display tex={`${bmat(sub)} = ${dval}\\quad ${dval !== 0 ? '\\neq 0' : ''}`} />
          ) : (
            <span>
              Selected {sR.length} row(s) × {sC.length} column(s): a determinant needs a square selection.
            </span>
          )}
        </div>
        <div className="space-y-1 text-sm text-ink-2">
          <div className="font-semibold text-ink">Systematic search (largest order first)</div>
          {search.map((s) => (
            <div key={s.order}>
              Order {s.order}: {s.total} minor{s.total === 1 ? '' : 's'}, {s.nonzero} non-zero
              {s.example ? (
                <>
                  {' '}— e.g. rows <TeX tex={s.example.rows.map((i) => ROW_TEX[cs.sys][i]).join(',')} />, columns{' '}
                  <TeX tex={s.example.cols.map((j) => cs.vars[j].tex).join(',')} />: det = {s.example.d}
                  {' '}⇒ <b>m = {s.order}</b>
                </>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </SimPanel>
  )
}
