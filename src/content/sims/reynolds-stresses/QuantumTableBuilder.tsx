import { useState } from 'react'
import { AlertTriangle, Shuffle } from 'lucide-react'
import { Md, md, Readout, Segmented, SimPanel, Slider, cx, num } from '@/kit'
import { FLUIDS, type FluidKey, fixed } from './shared'
import { QuadrantMini, type Pair } from './TableE91'

type Preset = 'concert' | 'opposed' | 'independent' | 'partial'

const BASE8 = [1, 1, 1, 1, -1, -1, -1, -1]

function preset(p: Preset, n: 4 | 8): { vx: number[]; vy: number[] } {
  if (n === 4) {
    // the three cases of Table E9.1, in the book's row order
    if (p === 'concert') return { vx: [-1, -1, 1, 1], vy: [-1, -1, 1, 1] }
    if (p === 'opposed') return { vx: [-1, -1, 1, 1], vy: [1, 1, -1, -1] }
    return { vx: [-1, -1, 1, 1], vy: [-1, 1, -1, 1] } // independent (a partial pattern needs 8 instants)
  }
  if (p === 'concert') return { vx: [...BASE8], vy: [...BASE8] }
  if (p === 'opposed') return { vx: [...BASE8], vy: BASE8.map((v) => -v) }
  if (p === 'independent') return { vx: [...BASE8], vy: [1, 1, -1, -1, 1, 1, -1, -1] }
  return { vx: [...BASE8], vy: [-1, -1, -1, 1, 1, 1, 1, -1] } // 6 opposed + 2 in concert → −0.5
}

function SignCell({ v, onClick, label }: { v: number; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title="click to flip the sign"
      className={cx(
        'w-full rounded-md border px-1.5 py-1 font-mono text-sm font-semibold transition hover:scale-[1.04]',
        v > 0
          ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300'
          : 'border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-300',
      )}
    >
      {v > 0 ? '+1' : '−1'}
    </button>
  )
}

/** Build your own Table E9.1: flip ±1 "quantum" fluctuations and watch the averaged product. */
export function QuantumTableBuilder() {
  const [n, setN] = useState<4 | 8>(4)
  const [{ vx, vy }, setRows] = useState(() => preset('independent', 4))
  const [q, setQ] = useState(0.1)
  const [fluid, setFluid] = useState<FluidKey>('water')
  const [seed, setSeed] = useState(5)

  const flip = (which: 'x' | 'y', i: number) =>
    setRows(({ vx: a, vy: b }) => (which === 'x' ? { vx: a.map((v, k) => (k === i ? -v : v)), vy: b } : { vx: a, vy: b.map((v, k) => (k === i ? -v : v)) }))

  const choose = (p: Preset) => setRows(preset(p, n))
  const resize = (m: 4 | 8) => {
    setN(m)
    setRows(preset('independent', m))
  }
  const shuffle = () => {
    // random zero-mean patterns: shuffle a balanced ±1 list for each component
    const rnd = num.seededRandom(seed)
    setSeed((s) => s + 1)
    const bal = (len: number) => {
      const arr: number[] = Array.from({ length: len }, (_, k) => (k < len / 2 ? 1 : -1))
      for (let i = len - 1; i > 0; i--) {
        const j = Math.floor(rnd() * (i + 1))
        const tmp = arr[i]
        arr[i] = arr[j]
        arr[j] = tmp
      }
      return arr
    }
    setRows({ vx: bal(n), vy: bal(n) })
  }

  const prods = vx.map((v, i) => v * vy[i])
  const mx = vx.reduce((s, v) => s + v, 0) / n
  const my = vy.reduce((s, v) => s + v, 0) / n
  const mp = prods.reduce((s, v) => s + v, 0) / n
  const valid = mx === 0 && my === 0
  const rho = FLUIDS[fluid].rho
  const tau = -rho * q * q * mp
  const pairs: Pair[] = vx.map((v, i) => [v, vy[i]])

  return (
    <SimPanel
      title="Build your own Table E9.1"
      subtitle={md`each fluctuation is $\pm1$ quantum $q$; click a cell to flip it`}
      wide
      controls={
        <>
          <Segmented label="number of equally spaced instants" options={[{ value: 4, label: '4 (as in the book)' }, { value: 8, label: '8' }]} value={n} onChange={(v) => resize(v as 4 | 8)} />
          <div>
            <div className="mb-1 text-sm text-ink-2">patterns</div>
            <div className="grid grid-cols-2 gap-1.5">
              <button type="button" className="btn-ghost justify-center" onClick={() => choose('concert')}>in concert</button>
              <button type="button" className="btn-ghost justify-center" onClick={() => choose('opposed')}>opposed</button>
              <button type="button" className="btn-ghost justify-center" onClick={() => choose('independent')}>independent</button>
              {n === 8 ? (
                <button type="button" className="btn-ghost justify-center" onClick={() => choose('partial')}>mostly opposed</button>
              ) : (
                <button type="button" className="btn-ghost justify-center" onClick={shuffle}><Shuffle className="h-4 w-4" /> shuffle</button>
              )}
              {n === 8 ? (
                <button type="button" className="btn-ghost col-span-2 justify-center" onClick={shuffle}><Shuffle className="h-4 w-4" /> shuffle (zero-mean)</button>
              ) : null}
            </div>
          </div>
          <Slider label={md`quantum size $q$`} value={q} min={0.01} max={0.5} step={0.01} onChange={setQ} unit="m/s" digits={2} />
          <Segmented label="fluid" options={[{ value: 'water', label: 'water' }, { value: 'air', label: 'air' }]} value={fluid} onChange={(v) => setFluid(v as FluidKey)} />
        </>
      }
      readout={
        <Readout
          items={[
            { label: md`$\avg{v_x'}$, $\avg{v_y'}$ (units of $q$)`, value: `${fixed(mx, 2)}, ${fixed(my, 2)}`, tone: valid ? 'good' : 'bad' },
            { label: md`$\avg{v_x'v_y'}$ (units of $q^2$)`, value: fixed(mp, 2), tone: 'accent' },
            { label: md`correlation $r_{xy}$`, value: valid ? fixed(mp, 2) : '—' },
            { label: md`$\tau^t_{yx}=-\rho q^2\,\avg{v_x'v_y'}$`, value: tau, unit: 'Pa', digits: 3 },
          ]}
        />
      }
      footer={
        <Md>{md`**Try this:** load "independent", then flip a single $v_y'$ cell — the table now breaks $\avg{v_y'}=0$ (Eq. 9.2), so flip a second one to repair it. With 4 instants and zero-mean fluctuations you can only ever reach $-1$, $0$ or $+1$ — exactly the three cases of Table E9.1. Switch to 8 instants and build a *partly* correlated pattern ($\pm0.5$). Since each $v'$ is $\pm q$, the RMS values are $q$ and $r_{xy}$ equals the averaged product in units of $q^2$.`}</Md>
      }
    >
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
        <table className="w-full text-center text-sm">
          <thead>
            <tr className="text-ink-2">
              <th className="px-1 py-1 text-xs font-medium">instant</th>
              <th className="px-1 py-1 font-medium"><Md inline>{md`$v_x'/q$`}</Md></th>
              <th className="px-1 py-1 font-medium"><Md inline>{md`$v_y'/q$`}</Md></th>
              <th className="px-1 py-1 font-medium"><Md inline>{md`$v_x'v_y'/q^2$`}</Md></th>
            </tr>
          </thead>
          <tbody>
            {vx.map((v, i) => (
              <tr key={i}>
                <td className="px-1 py-0.5 text-xs text-ink-3">{i + 1}</td>
                <td className="px-1 py-0.5"><SignCell v={v} onClick={() => flip('x', i)} label={`flip v'x at instant ${i + 1}`} /></td>
                <td className="px-1 py-0.5"><SignCell v={vy[i]} onClick={() => flip('y', i)} label={`flip v'y at instant ${i + 1}`} /></td>
                <td className="px-1 py-0.5 font-mono font-semibold">
                  <span className={cx('inline-block min-w-[2.6rem] rounded px-1 py-1', prods[i] > 0 ? 'bg-emerald-100 dark:bg-emerald-500/15' : 'bg-rose-100 dark:bg-rose-500/15')}>
                    {prods[i] > 0 ? '+1' : '−1'}
                  </span>
                </td>
              </tr>
            ))}
            <tr className="border-t border-line">
              <td className="py-1 text-xs text-ink-2">avg</td>
              <td className={cx('py-1 font-mono text-sm', mx === 0 ? 'text-ink-2' : 'font-bold text-red-600 dark:text-red-400')}>{fixed(mx, 2)}</td>
              <td className={cx('py-1 font-mono text-sm', my === 0 ? 'text-ink-2' : 'font-bold text-red-600 dark:text-red-400')}>{fixed(my, 2)}</td>
              <td className="py-1 font-mono text-base font-bold text-ink">{fixed(mp, 2)}</td>
            </tr>
          </tbody>
        </table>
        <div className="flex flex-col items-center gap-2">
          <QuadrantMini rows={pairs} showCounts />
          <div className="w-full max-w-[150px]">
            <div className="relative h-3 rounded-full bg-gradient-to-r from-rose-300 via-surface-2 to-emerald-300 dark:from-rose-500/40 dark:to-emerald-500/40">
              <span className="absolute -top-1 h-5 w-1 rounded bg-ink" style={{ left: `calc(${((mp + 1) / 2) * 100}% - 2px)` }} />
            </div>
            <div className="mt-1 flex justify-between text-[10px] text-ink-3">
              <span>−1 opposed</span>
              <span>0</span>
              <span>+1 concert</span>
            </div>
          </div>
        </div>
      </div>
      {!valid ? (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-ink dark:border-red-500/30 dark:bg-red-500/10">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
          <Md inline>{md`These are not valid fluctuations: by Eq. (9.2) each must average to zero over the record. Flip another cell of the same column.`}</Md>
        </div>
      ) : null}
    </SimPanel>
  )
}
