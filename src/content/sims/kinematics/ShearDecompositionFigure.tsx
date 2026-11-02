import { useRef } from 'react'
import { Md, md } from '@/kit'
import { easeInOut, flowMap, useLoop, type Grad, type P2 } from './shared'

/**
 * Simple shear (u = k y) = pure angular deformation + rigid rotation (ω_z = −k/2).
 * The velocity gradients add exactly; over a short time the motions superpose.
 */

const SQ: P2[] = [
  [-1, -1],
  [1, -1],
  [1, 1],
  [-1, 1],
]
const K = 1 // s⁻¹
const T = 0.75 // s at the end of the loop

function Panel({ g, t, color }: { g: Grad; t: number; color: string }) {
  const m = flowMap(g, [0, 0], t)
  const S = 38
  const c = 80
  const pts = (ps: P2[]) => ps.map((p) => `${(c + S * p[0]).toFixed(1)},${(c - S * p[1]).toFixed(1)}`).join(' ')
  const moved = SQ.map(m)
  const diag0 = [m([-1, -1]), m([1, 1])]
  return (
    <svg viewBox="0 0 160 160" className="block h-auto w-full" role="img" aria-label="deformed element">
      <polygon points={pts(SQ)} fill="none" stroke="var(--ink-3)" strokeDasharray="4 3" strokeWidth={1.1} />
      <polygon points={pts(moved)} fill={color} fillOpacity={0.15} stroke={color} strokeWidth={1.8} />
      <line x1={c + S * diag0[0][0]} y1={c - S * diag0[0][1]} x2={c + S * diag0[1][0]} y2={c - S * diag0[1][1]} stroke={color} strokeWidth={1} strokeDasharray="3 3" />
      <circle cx={c} cy={c} r={2.5} fill={color} />
    </svg>
  )
}

export function ShearDecompositionFigure() {
  const ref = useRef<HTMLDivElement>(null)
  const { s } = useLoop(ref, 2.2, { hold: 1.4 })
  const t = T * easeInOut(s)
  const sign = 'self-center px-0.5 text-center font-display text-xl font-bold text-ink-3 sm:text-2xl'
  const cap = 'mt-1 text-center text-[11.5px] leading-snug text-ink-3'
  return (
    <div ref={ref} className="space-y-3">
      <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-start gap-1 sm:gap-2">
        <div>
          <Panel g={{ a: 0, b: K, c: 0, d: 0 }} t={t} color="var(--plot-3)" />
          <div className={cap}>
            <b className="text-ink-2">simple shear</b>
            <br />u = k y
          </div>
        </div>
        <div className={sign} style={{ marginTop: '18%' }}>=</div>
        <div>
          <Panel g={{ a: 0, b: K / 2, c: K / 2, d: 0 }} t={t} color="var(--plot-4)" />
          <div className={cap}>
            <b className="text-ink-2">angular deformation</b>
            <br />γ̇ = k, no rotation
          </div>
        </div>
        <div className={sign} style={{ marginTop: '18%' }}>+</div>
        <div>
          <Panel g={{ a: 0, b: K / 2, c: -K / 2, d: 0 }} t={t} color="var(--plot-6)" />
          <div className={cap}>
            <b className="text-ink-2">rigid rotation</b>
            <br />clockwise, ω<sub>z</sub> = −k/2
          </div>
        </div>
      </div>
      <Md className="text-sm">
        {md`In matrix form, with rows $(\partial u/\partial x,\ \partial u/\partial y)$ and $(\partial v/\partial x,\ \partial v/\partial y)$:

$$
\underbrace{\begin{bmatrix}0 & k\\ 0 & 0\end{bmatrix}}_{\text{simple shear}}
=\underbrace{\begin{bmatrix}0 & k/2\\ k/2 & 0\end{bmatrix}}_{\text{angular deformation}}
+\underbrace{\begin{bmatrix}0 & k/2\\ -k/2 & 0\end{bmatrix}}_{\text{rotation}}
$$`}
      </Md>
    </div>
  )
}
