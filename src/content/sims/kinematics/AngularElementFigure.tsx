import { useRef, useState } from 'react'
import { Segmented } from '@/kit'
import { ArcArrow, Arrow, DimArrow, arcPath, deg, easeInOut, useLoop } from './shared'

/**
 * Recreation of the Lecture 9 slide 6 figures (velocity variation across the element, and the deformed element with
 * lines OA′, OB′ and the angles δα, δβ), reused on slides 7–9. Angles are exaggerated so they can be seen.
 *  mode = 'rotation' adds the bisector of the corner angle, which turns by ½(δα − δβ) = ω_z δt;
 *  mode = 'shear'    shades δα and δβ, whose sum δγ is the shearing strain.
 */

type Case = 'general' | 'block' | 'norot'
const CASES: Record<Case, { label: string; c: number; b: number; note: string }> = {
  general: { label: 'General', c: 1.0, b: 0.45, note: 'OA and OB turn by different amounts in opposite senses: rotation and angular deformation together.' },
  block: {
    label: 'Undeformed block',
    c: 0.85,
    b: -0.85,
    note: '∂u/∂y = −∂v/∂x: OB turns counter-clockwise exactly as fast as OA — the right angle survives and the element turns like a rigid block.',
  },
  norot: {
    label: '∂u/∂y = ∂v/∂x',
    c: 0.7,
    b: 0.7,
    note: 'OA turns counter-clockwise and OB clockwise by the same amount: the bisector does not turn (zero rotation about z), but the corner closes.',
  },
}
const DT_MAX = 0.22 // s — exaggerated so the angles are visible

function VelocityVariation() {
  const O = [40, 195]
  const A = [170, 195]
  const B = [40, 65]
  return (
    <svg viewBox="0 0 280 230" className="block h-auto w-full" role="img" aria-label="velocity variation across the element">
      <polygon points={`${O} ${A} ${A[0]},${B[1]} ${B}`} fill="none" stroke="var(--ink-2)" strokeWidth={1.4} />
      <Arrow x1={O[0]} y1={O[1]} x2={O[0] + 38} y2={O[1]} color="var(--plot-1)" width={2.6} head={8} />
      <Arrow x1={O[0]} y1={O[1]} x2={O[0]} y2={O[1] - 38} color="var(--plot-1)" width={2.6} head={8} />
      <Arrow x1={A[0]} y1={A[1]} x2={A[0]} y2={A[1] - 62} color="var(--plot-1)" width={2.6} head={8} />
      <Arrow x1={B[0]} y1={B[1]} x2={B[0] + 62} y2={B[1]} color="var(--plot-1)" width={2.6} head={8} />
      <g fontSize={13} fontStyle="italic" className="fill-ink-2">
        <text x={O[0] - 14} y={O[1] + 16}>O</text>
        <text x={A[0] - 4} y={A[1] + 18}>A</text>
        <text x={B[0] - 16} y={B[1] + 4}>B</text>
        <text x={O[0] + 24} y={O[1] - 6}>u</text>
        <text x={O[0] + 6} y={O[1] - 26}>v</text>
      </g>
      <g fontSize={12} className="fill-ink-2">
        <text x={A[0] + 6} y={A[1] - 40}>
          <tspan fontStyle="italic">v</tspan> + (∂<tspan fontStyle="italic">v</tspan>/∂<tspan fontStyle="italic">x</tspan>) δ<tspan fontStyle="italic">x</tspan>
        </text>
        <text x={B[0] + 2} y={B[1] - 12}>
          <tspan fontStyle="italic">u</tspan> + (∂<tspan fontStyle="italic">u</tspan>/∂<tspan fontStyle="italic">y</tspan>) δ<tspan fontStyle="italic">y</tspan>
        </text>
        <text x={(O[0] + A[0]) / 2} y={O[1] + 18} textAnchor="middle">
          δ<tspan fontStyle="italic">x</tspan>
        </text>
        <text x={O[0] - 8} y={(O[1] + B[1]) / 2 + 4} textAnchor="end">
          δ<tspan fontStyle="italic">y</tspan>
        </text>
      </g>
    </svg>
  )
}

function DeformedElement({ c, b, dt, mode }: { c: number; b: number; dt: number; mode: 'rotation' | 'shear' }) {
  const O = [45, 215]
  const L = 150
  const A = [O[0] + L, O[1]]
  const B = [O[0], O[1] - L]
  const Ap = [A[0], A[1] - L * c * dt] // A′ directly above A
  const Bp = [B[0] + L * b * dt, B[1]] // B′ along the top edge
  const al = Math.atan2(O[1] - Ap[1], Ap[0] - O[0]) // δα, CCW +
  const be = Math.atan2(Bp[0] - O[0], O[1] - Bp[1]) // δβ, CW +
  const bis0 = Math.PI / 4
  const bis = Math.PI / 4 + (al - be) / 2
  const rayEnd = (ang: number, r: number) => [O[0] + r * Math.cos(ang), O[1] - r * Math.sin(ang)]
  const lbl = (ang: number, r: number) => rayEnd(ang, r)
  const la = lbl(al / 2, 76)
  const lb = lbl(Math.PI / 2 - be / 2, 84)
  const showA = Math.abs(al) > 0.01
  const showB = Math.abs(be) > 0.01
  return (
    <svg viewBox="0 0 330 260" className="block h-auto w-full" role="img" aria-label="deformed fluid element with angles delta alpha and delta beta">
      {mode === 'shear' ? (
        <g>
          {showA ? <path d={`M${O[0]} ${O[1]}L${A[0]} ${A[1]}L${Ap[0]} ${Ap[1]}Z`} fill="var(--plot-1)" fillOpacity={0.16} /> : null}
          {showB ? <path d={`M${O[0]} ${O[1]}L${B[0]} ${B[1]}L${Bp[0]} ${Bp[1]}Z`} fill="var(--plot-4)" fillOpacity={0.16} /> : null}
        </g>
      ) : null}
      <rect x={O[0]} y={B[1]} width={L} height={L} fill="none" stroke="var(--ink-2)" strokeWidth={1.4} />
      <line x1={O[0]} y1={O[1]} x2={Ap[0]} y2={Ap[1]} stroke="var(--plot-1)" strokeWidth={2} strokeDasharray="7 4" />
      <line x1={O[0]} y1={O[1]} x2={Bp[0]} y2={Bp[1]} stroke="var(--plot-4)" strokeWidth={2} strokeDasharray="7 4" />
      {showA ? <ArcArrow cx={O[0]} cy={O[1]} r={60} a0={0} a1={al} color="var(--plot-1)" /> : null}
      {showB ? <ArcArrow cx={O[0]} cy={O[1]} r={70} a0={Math.PI / 2} a1={Math.PI / 2 - be} color="var(--plot-4)" /> : null}
      {mode === 'rotation' ? (
        <g>
          <line x1={O[0]} y1={O[1]} x2={rayEnd(bis0, 130)[0]} y2={rayEnd(bis0, 130)[1]} stroke="var(--ink-3)" strokeWidth={1.2} strokeDasharray="2 3" />
          <line x1={O[0]} y1={O[1]} x2={rayEnd(bis, 200)[0]} y2={rayEnd(bis, 200)[1]} stroke="var(--plot-6)" strokeWidth={2.2} />
          {Math.abs(bis - bis0) > 0.005 ? <path d={arcPath(O[0], O[1], 118, bis0, bis)} fill="none" stroke="var(--plot-6)" strokeWidth={1.6} /> : null}
          <text x={196} y={50} fontSize={11.5} className="fill-ink-2">
            <tspan fill="var(--plot-6)" fontWeight={700}>
              bisector
            </tspan>{' '}
            turns ω<tspan fontSize={9} dy={3}>z</tspan>
            <tspan dy={-3}> δt</tspan>
          </text>
        </g>
      ) : (
        <g>
          <path d={arcPath(O[0], O[1], 30, al, Math.PI / 2 - be)} fill="none" stroke="var(--ink-2)" strokeWidth={1.3} />
          <text x={rayEnd(Math.PI / 4 + (al - be) / 2, 40)[0] + 2} y={rayEnd(Math.PI / 4 + (al - be) / 2, 40)[1]} fontSize={11.5} className="fill-ink-2">
            90° − δγ
          </text>
        </g>
      )}
      {/* dimension markers, as on the slide */}
      <line x1={A[0] + 4} y1={A[1]} x2={A[0] + 40} y2={A[1]} stroke="var(--ink-3)" strokeWidth={0.8} />
      <line x1={Ap[0] + 4} y1={Ap[1]} x2={A[0] + 40} y2={Ap[1]} stroke="var(--ink-3)" strokeWidth={0.8} />
      {Math.abs(Ap[1] - A[1]) > 3 ? <DimArrow x1={A[0] + 32} y1={A[1]} x2={A[0] + 32} y2={Ap[1]} /> : null}
      <line x1={B[0]} y1={B[1] - 4} x2={B[0]} y2={B[1] - 34} stroke="var(--ink-3)" strokeWidth={0.8} />
      <line x1={Bp[0]} y1={Bp[1] - 4} x2={Bp[0]} y2={B[1] - 34} stroke="var(--ink-3)" strokeWidth={0.8} />
      {Math.abs(Bp[0] - B[0]) > 3 ? <DimArrow x1={B[0]} y1={B[1] - 26} x2={Bp[0]} y2={B[1] - 26} /> : null}
      <g fontSize={13} fontStyle="italic" className="fill-ink-2">
        <text x={O[0] - 6} y={O[1] + 18}>O</text>
        <text x={A[0] - 4} y={A[1] + 18}>A</text>
        <text x={Ap[0] - 22} y={Ap[1] - 4}>A′</text>
        <text x={B[0] - 16} y={B[1] + 14}>B</text>
        <text x={Bp[0] + 4} y={B[1] + 14}>B′</text>
      </g>
      <g fontSize={12.5} className="fill-ink">
        {showA ? (
          <text x={la[0] + 4} y={la[1] + 4} fontWeight={600}>
            δα
          </text>
        ) : null}
        {showB ? (
          <text x={lb[0] + 4} y={lb[1] + 4} fontWeight={600}>
            δβ
          </text>
        ) : null}
      </g>
      <g fontSize={11} className="fill-ink-2">
        <text x={A[0] + 38} y={(A[1] + Ap[1]) / 2 + 4}>(∂v/∂x δx) δt</text>
        <text x={B[0] + 6} y={B[1] - 36}>(∂u/∂y δy) δt</text>
        <text x={(O[0] + A[0]) / 2} y={O[1] + 18} textAnchor="middle" fontSize={12}>
          δx
        </text>
        <text x={O[0] - 8} y={(O[1] + B[1]) / 2} textAnchor="end" fontSize={12}>
          δy
        </text>
      </g>
    </svg>
  )
}

export function AngularElementFigure({ mode }: { mode: 'rotation' | 'shear' }) {
  const ref = useRef<HTMLDivElement>(null)
  const [cs, setCs] = useState<Case>('general')
  const { s } = useLoop(ref, 2.2, { hold: 1.4 })
  const dt = DT_MAX * easeInOut(s)
  const { c, b, note } = CASES[cs]
  const da = c * dt
  const db = b * dt
  const fmtA = (r: number) => `${r.toFixed(3).replace('-', '−')} rad (${deg(r).toFixed(1).replace('-', '−')}°)`
  return (
    <div ref={ref} className="space-y-3">
      <Segmented
        label="Velocity gradients (slide 8 cases)"
        options={(Object.keys(CASES) as Case[]).map((k) => ({ value: k, label: CASES[k].label }))}
        value={cs}
        onChange={setCs}
      />
      <div className="grid items-start gap-3 md:grid-cols-[0.85fr_1fr]">
        <div className="rounded-xl border border-line bg-surface-2/50 p-2">
          <VelocityVariation />
          <div className="px-1 text-[12px] text-ink-3">
            Velocity at A exceeds that at O by (∂v/∂x)δx (vertical); at B by (∂u/∂y)δy (horizontal).
          </div>
        </div>
        <div className="rounded-xl border border-line bg-surface-2/50 p-2">
          <DeformedElement c={c} b={b} dt={dt} mode={mode} />
          <div className="px-1 text-[12px] text-ink-3">
            ∂v/∂x = {c.toFixed(2).replace('-', '−')} s⁻¹, ∂u/∂y = {b.toFixed(2).replace('-', '−')} s⁻¹, δt = {dt.toFixed(3)} s (angles exaggerated).
          </div>
        </div>
      </div>
      <div className="grid gap-2 text-sm sm:grid-cols-3">
        <div className="rounded-lg border border-line bg-surface px-3 py-1.5">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-3">δα ≈ (∂v/∂x) δt</div>
          <div className="font-mono text-[13px] text-ink">{fmtA(da)}</div>
        </div>
        <div className="rounded-lg border border-line bg-surface px-3 py-1.5">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-3">δβ ≈ (∂u/∂y) δt</div>
          <div className="font-mono text-[13px] text-ink">{fmtA(db)}</div>
        </div>
        {mode === 'rotation' ? (
          <div className="rounded-lg border border-violet-300 bg-violet-50 px-3 py-1.5 dark:border-violet-500/30 dark:bg-violet-500/10">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-3">
              ω<sub>z</sub> δt = ½(δα − δβ)
            </div>
            <div className="font-mono text-[13px] text-ink">{fmtA(0.5 * (da - db))}</div>
          </div>
        ) : (
          <div className="rounded-lg border border-rose-300 bg-rose-50 px-3 py-1.5 dark:border-rose-500/30 dark:bg-rose-500/10">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-3">δγ = δα + δβ</div>
            <div className="font-mono text-[13px] text-ink">{fmtA(da + db)}</div>
          </div>
        )}
      </div>
      <p className="text-[12.5px] text-ink-2">{note}</p>
    </div>
  )
}
