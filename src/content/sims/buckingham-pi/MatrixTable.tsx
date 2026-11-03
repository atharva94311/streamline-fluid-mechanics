/** Dimensional matrix rendered as an HTML table (rows = dimensions, columns = variables). */
import { cx } from '@/kit'
import { type DimVar } from './dimlib'
import { TeX, expCellStyle } from './svg'

export function MatrixTable({
  vars, rowLabels, A, rows, dep, rep = [], selRows, selCols, onRow, onCol, onCell, caption,
}: {
  vars: DimVar[]
  /** TeX label per matrix row (3 entries). */
  rowLabels: string[]
  A: number[][]
  /** Which rows to display. */
  rows: number[]
  /** Index of the dependent variable (gets an amber header). */
  dep?: number
  /** Repeating-variable columns (teal header). */
  rep?: number[]
  selRows?: number[]
  selCols?: number[]
  onRow?: (i: number) => void
  onCol?: (j: number) => void
  /** Editable cells (custom mode). */
  onCell?: (i: number, j: number, v: number) => void
  caption?: string
}) {
  const colSel = (j: number) => selCols?.includes(j)
  const rowSel = (i: number) => selRows?.includes(i)
  return (
    <div className="overflow-x-auto">
      <table className="mx-auto border-separate border-spacing-0 text-center text-sm">
        {caption ? <caption className="pb-1 text-xs text-ink-3">{caption}</caption> : null}
        <thead>
          <tr>
            <th className="px-2 py-1" />
            {vars.map((v, j) => (
              <th
                key={j}
                className={cx(
                  'min-w-[44px] border-b border-line px-1.5 py-1 font-normal',
                  j === dep && 'bg-amber-100 dark:bg-amber-500/20',
                  rep.includes(j) && 'bg-teal-100 dark:bg-teal-500/20',
                  colSel(j) && 'outline outline-2 -outline-offset-2 outline-violet-500',
                  onCol && 'cursor-pointer hover:bg-surface-2',
                )}
                onClick={onCol ? () => onCol(j) : undefined}
                title={v.name}
              >
                <TeX tex={v.tex} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((i) => (
            <tr key={i}>
              <th
                className={cx(
                  'border-r border-line px-2 py-1 font-normal',
                  rowSel(i) && 'outline outline-2 -outline-offset-2 outline-violet-500',
                  onRow && 'cursor-pointer hover:bg-surface-2',
                )}
                onClick={onRow ? () => onRow(i) : undefined}
              >
                <TeX tex={rowLabels[i]} />
              </th>
              {vars.map((_, j) => {
                const e = A[i][j]
                const sel = colSel(j) && rowSel(i)
                return (
                  <td
                    key={j}
                    className={cx('px-1 py-1 font-mono text-[13px] text-ink', sel && 'ring-2 ring-inset ring-violet-500')}
                    style={expCellStyle(e)}
                  >
                    {onCell ? (
                      <input
                        type="number"
                        aria-label={`exponent of ${rowLabels[i]} in ${v_name(vars[j])}`}
                        className="w-11 rounded border border-line bg-surface px-1 py-0.5 text-center font-mono text-[13px] text-ink"
                        value={e}
                        min={-6}
                        max={6}
                        step={1}
                        onChange={(ev) => {
                          const v = Math.max(-6, Math.min(6, Math.round(+ev.target.value || 0)))
                          onCell(i, j, v)
                        }}
                      />
                    ) : (
                      e
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const v_name = (v: DimVar) => v.name
