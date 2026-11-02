import { Md, md, cx } from '@/kit'
import { SvgTeX } from './shared'

export type Pair = [number, number]

/** The three cases of Wilkes Table E9.1 (p. 486), exactly as printed. */
export const E91_CASES: { head: string; sub: string; rows: Pair[] }[] = [
  { head: 'Correlated', sub: 'move in concert', rows: [[-1, -1], [-1, -1], [1, 1], [1, 1]] },
  { head: 'Correlated', sub: 'opposed', rows: [[-1, 1], [-1, 1], [1, -1], [1, -1]] },
  { head: 'Independent', sub: 'quite independent', rows: [[-1, -1], [-1, 1], [1, -1], [1, 1]] },
]

const sgn = (v: number) => (v > 0 ? '1' : v < 0 ? '−1' : '0')

/** Scatter of (v'x, v'y) samples in the four quadrants; multiplicity shown as ×k. */
export function QuadrantMini({ rows, size = 132, showCounts = false }: { rows: Pair[]; size?: number; showCounts?: boolean }) {
  const c = size / 2
  const d = size * 0.3
  const counts = new Map<string, number>()
  rows.forEach(([a, b]) => counts.set(`${a},${b}`, (counts.get(`${a},${b}`) ?? 0) + 1))
  const q = (sx: number, sy: number) => rows.filter(([a, b]) => Math.sign(a) === sx && Math.sign(b) === sy).length
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="h-auto w-full max-w-[150px]" role="img" aria-label="Quadrant plot of the fluctuation pairs">
      <rect x={c} y={0} width={c} height={c} fill="var(--plot-5)" opacity={0.12} />
      <rect x={0} y={c} width={c} height={c} fill="var(--plot-5)" opacity={0.12} />
      <rect x={0} y={0} width={c} height={c} fill="var(--plot-4)" opacity={0.1} />
      <rect x={c} y={c} width={c} height={c} fill="var(--plot-4)" opacity={0.1} />
      <line x1={4} x2={size - 4} y1={c} y2={c} stroke="var(--ink-3)" strokeWidth={1} />
      <line x1={c} x2={c} y1={4} y2={size - 4} stroke="var(--ink-3)" strokeWidth={1} />
      <text x={size - 6} y={12} textAnchor="end" className="fill-ink-3 text-[9px]">+ product</text>
      <text x={6} y={12} className="fill-ink-3 text-[9px]">− product</text>
      <SvgTeX x={size - 2} y={c + 11} tex="v_x'" w={30} h={16} align="right" size={10} />
      <SvgTeX x={c + 3} y={size - 9} tex="v_y'" w={30} h={16} align="left" size={10} />
      {[...counts.entries()].map(([key, k]) => {
        const [a, b] = key.split(',').map(Number)
        const x = c + a * d
        const y = c - b * d
        return (
          <g key={key}>
            <circle cx={x} cy={y} r={6.5} fill={a * b > 0 ? 'var(--plot-5)' : 'var(--plot-4)'} stroke="var(--surface)" strokeWidth={1.5} />
            {k > 1 ? (
              <text x={x + 8} y={y + 3.5} className="fill-ink text-[10px] font-semibold">×{k}</text>
            ) : null}
          </g>
        )
      })}
      {showCounts ? (
        <g className="fill-ink-2 text-[9px]">
          <text x={size - 6} y={size - 6} textAnchor="end">Q4: {q(1, -1)}</text>
          <text x={6} y={size - 6}>Q3: {q(-1, -1)}</text>
          <text x={size - 6} y={24} textAnchor="end">Q1: {q(1, 1)}</text>
          <text x={6} y={24}>Q2: {q(-1, 1)}</text>
        </g>
      ) : null}
    </svg>
  )
}

/** Recreation of Table E9.1 "Possible Values for Velocity Fluctuations" with a quadrant plot for each case. */
export function TableE91() {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {E91_CASES.map((cs, k) => {
        const avg = cs.rows.reduce((s, [a, b]) => s + a * b, 0) / cs.rows.length
        return (
          <div key={k} className="rounded-xl border border-line bg-surface p-3">
            <div className="text-center font-display text-sm font-bold italic text-ink">{cs.head}</div>
            <div className="mb-2 text-center text-[11px] text-ink-3">case {k + 1}: {cs.sub}</div>
            <table className="mx-auto w-full max-w-[220px] text-center text-sm">
              <thead>
                <tr className="border-b border-line text-ink-2">
                  <th className="py-1 font-medium"><Md inline>{md`$v_x'$`}</Md></th>
                  <th className="py-1 font-medium"><Md inline>{md`$v_y'$`}</Md></th>
                  <th className="py-1 font-medium"><Md inline>{md`$v_x'v_y'$`}</Md></th>
                </tr>
              </thead>
              <tbody className="font-mono">
                {cs.rows.map(([a, b], i) => (
                  <tr key={i}>
                    <td className={cx('py-0.5', a > 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300')}>{sgn(a)}</td>
                    <td className={cx('py-0.5', b > 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300')}>{sgn(b)}</td>
                    <td className="py-0.5">
                      <span className={cx('inline-block min-w-[2.2rem] rounded px-1', a * b > 0 ? 'bg-emerald-100 dark:bg-emerald-500/15' : 'bg-rose-100 dark:bg-rose-500/15')}>{sgn(a * b)}</span>
                    </td>
                  </tr>
                ))}
                <tr className="border-t border-line font-sans">
                  <td colSpan={2} className="py-1 text-right text-xs text-ink-2">Average:</td>
                  <td className="py-1 font-mono font-bold text-ink">{sgn(avg)}</td>
                </tr>
              </tbody>
            </table>
            <div className="mt-2 flex justify-center">
              <QuadrantMini rows={cs.rows} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
