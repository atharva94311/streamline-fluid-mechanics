import { useState, type ReactNode } from 'react'
import { M, Md, Segmented, cx, md } from '@/kit'

type Tone = 'amber' | 'indigo' | 'cyan' | 'violet' | 'emerald' | 'rose'
const BOX: Record<Tone, string> = {
  amber: 'border-amber-400 bg-amber-50 dark:border-amber-400/60 dark:bg-amber-500/10',
  indigo: 'border-indigo-400 bg-indigo-50 dark:border-indigo-400/60 dark:bg-indigo-500/10',
  cyan: 'border-cyan-400 bg-cyan-50 dark:border-cyan-400/60 dark:bg-cyan-500/10',
  violet: 'border-violet-400 bg-violet-50 dark:border-violet-400/60 dark:bg-violet-500/10',
  emerald: 'border-emerald-400 bg-emerald-50 dark:border-emerald-400/60 dark:bg-emerald-500/10',
  rose: 'border-rose-400 bg-rose-50 dark:border-rose-400/60 dark:bg-rose-500/10',
}

function Term({ tex, label, tone }: { tex: string; label: string; tone: Tone }) {
  return (
    <div className={cx('flex min-w-[5.5rem] flex-col items-center justify-between gap-1 rounded-xl border-2 px-2.5 py-2 text-center', BOX[tone])}>
      <M tex={tex} className="text-[1.05rem] text-ink" />
      <span className="text-[11px] leading-tight text-ink-2">{label}</span>
    </div>
  )
}

const Op = ({ children }: { children: ReactNode }) => (
  <span className="self-center px-0.5 font-mono text-lg font-bold text-ink-3" aria-hidden>
    {children}
  </span>
)

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-2xl border border-dashed border-line p-2">
      <div className="flex flex-wrap items-stretch gap-1.5">{children}</div>
      <div className="text-center text-[11px] font-semibold uppercase tracking-wide text-ink-3">{title}</div>
    </div>
  )
}

/** Colour-coded anatomy of the x-component Cauchy equation (Lecture 10, slide 4). */
export function CauchyTermMap() {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-stretch gap-1.5">
        <Group title="body force">
          <Term tex={md`\rho g_x`} label="weight per unit volume" tone="amber" />
        </Group>
        <Op>+</Op>
        <Group title="net surface force per unit volume">
          <Term tex={md`\pd{\sigma_{xx}}{x}`} label="normal stress, x-faces" tone="indigo" />
          <Op>+</Op>
          <Term tex={md`\pd{\tau_{yx}}{y}`} label="shear, y-faces" tone="cyan" />
          <Op>+</Op>
          <Term tex={md`\pd{\tau_{zx}}{z}`} label="shear, z-faces" tone="violet" />
        </Group>
        <Op>=</Op>
        <Group title="mass per unit volume × acceleration">
          <Term tex={md`\rho\,\pd{u}{t}`} label="local (unsteady) part" tone="emerald" />
          <Op>+</Op>
          <Term tex={md`\rho\Big(u\pd{u}{x}+v\pd{u}{y}+w\pd{u}{z}\Big)`} label="convective part" tone="rose" />
        </Group>
      </div>
      <Md className="text-sm text-ink-2">
        {md`Every box has units of force per unit volume, $\mathrm{N/m^3} = \mathrm{kg\,m^{-2}\,s^{-2}}$. Left of the equals sign: **what pushes and pulls** the particle. Right: **how hard it is to accelerate it** ($\rho$) times **how it actually accelerates** ($Du/Dt$).`}
      </Md>
    </div>
  )
}

const AX = ['x', 'y', 'z'] as const
const VEL = ['u', 'v', 'w'] as const
const sym = (i: number, j: number) => (i === j ? md`\sigma_{${AX[i]}${AX[j]}}` : md`\tau_{${AX[i]}${AX[j]}}`)

/**
 * The nine stress components arranged as a table (rows = plane normal, columns = direction).
 * Selecting a component equation highlights the column of stresses that act in that direction.
 */
export function StressTensorMap() {
  const [j, setJ] = useState<0 | 1 | 2>(0)
  const eq = md`\rho g_${AX[j]} + \pd{${sym(0, j)}}{x} + \pd{${sym(1, j)}}{y} + \pd{${sym(2, j)}}{z} = \rho\,\frac{D${VEL[j]}}{Dt}`
  return (
    <div className="space-y-3">
      <Segmented
        label="Show the stresses that enter the …"
        value={j}
        onChange={setJ}
        options={[
          { value: 0, label: md`$x$-equation` },
          { value: 1, label: md`$y$-equation` },
          { value: 2, label: md`$z$-equation` },
        ]}
      />
      <div className="overflow-x-auto">
        <table className="mx-auto border-separate border-spacing-1.5 text-center text-sm">
          <thead>
            <tr>
              <th className="px-1 text-[11px] font-semibold text-ink-3">
                plane ⟂ ↓ · acts along →
              </th>
              {AX.map((a, k) => (
                <th
                  key={a}
                  className={cx(
                    'rounded-lg px-3 py-1 font-semibold',
                    k === j ? 'bg-teal-100 text-teal-900 dark:bg-teal-500/25 dark:text-teal-100' : 'text-ink-2',
                  )}
                >
                  <M tex={a} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {AX.map((a, i) => (
              <tr key={a}>
                <th className="rounded-lg px-2 py-1 font-semibold text-ink-2">
                  <M tex={md`${a}\text{-face}`} />
                </th>
                {AX.map((b, k) => (
                  <td
                    key={b}
                    className={cx(
                      'min-w-[4.6rem] rounded-xl border px-2 py-2 transition',
                      k === j
                        ? 'border-teal-400 bg-teal-50 shadow-sm dark:border-teal-400/60 dark:bg-teal-500/15'
                        : 'border-line bg-surface opacity-60',
                    )}
                  >
                    <div className="text-[1.05rem] text-ink">
                      <M tex={sym(i, k)} />
                    </div>
                    {k === j ? (
                      <div className="mt-0.5 text-[11px] text-teal-700 dark:text-teal-300">
                        <M tex={md`\partial/\partial ${a}`} />
                      </div>
                    ) : null}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="overflow-x-auto rounded-xl bg-surface-2 px-3 py-2 text-center">
        <M tex={eq} />
      </div>
      <p className="text-sm text-ink-2">
        Rule: the {['x', 'y', 'z'][j]}-equation uses the column of stresses whose <b>second</b> subscript is {['x', 'y', 'z'][j]} (they push or pull in
        that direction); each is differentiated with respect to its <b>first</b> subscript (the face it acts on).
      </p>
    </div>
  )
}
