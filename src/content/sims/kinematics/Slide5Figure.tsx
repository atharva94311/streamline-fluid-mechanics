import { useRef } from 'react'
import { Arrow, DimArrow, easeInOut, useLoop } from './shared'

/**
 * Recreation of the three Lecture 9 slide 5 panels: translation (O → O′), the velocity variation across the
 * element (u on face OB, u + ∂u/∂x δx on face AC) and the resulting stretching strip AA′C′C.
 */

const LBL = 'fill-ink-2'

function Translation({ s }: { s: number }) {
  const O = [40, 175]
  const side = 115
  const d = [38 * s, -26 * s]
  return (
    <svg viewBox="0 0 260 230" className="block h-auto w-full" role="img" aria-label="translation of a fluid element">
      <rect x={O[0]} y={O[1] - side} width={side} height={side} fill="none" stroke="var(--ink-2)" strokeWidth={1.4} />
      <rect x={O[0] + d[0]} y={O[1] - side + d[1]} width={side} height={side} fill="var(--plot-4)" fillOpacity={0.06} stroke="var(--plot-4)" strokeWidth={1.3} strokeDasharray="6 4" />
      <circle cx={O[0] + d[0]} cy={O[1] + d[1]} r={3} fill="var(--plot-4)" />
      <Arrow x1={O[0]} y1={O[1]} x2={O[0] + 32} y2={O[1]} color="var(--plot-1)" width={2.4} head={8} />
      <Arrow x1={O[0]} y1={O[1]} x2={O[0]} y2={O[1] - 30} color="var(--plot-1)" width={2.4} head={8} />
      <g fontSize={13} fontStyle="italic" className={LBL}>
        <text x={O[0] - 14} y={O[1] + 5}>O</text>
        <text x={O[0] + d[0] - 4} y={O[1] + d[1] - 8}>O′</text>
        <text x={O[0] + 22} y={O[1] - 6}>u</text>
        <text x={O[0] - 13} y={O[1] - 22}>v</text>
      </g>
      {/* dimension lines (full displacement) */}
      <line x1={O[0] + side} y1={O[1]} x2={O[0] + side + 52} y2={O[1]} stroke="var(--ink-3)" strokeWidth={0.8} />
      <line x1={O[0] + side + 38} y1={O[1] - 26} x2={O[0] + side + 52} y2={O[1] - 26} stroke="var(--ink-3)" strokeWidth={0.8} />
      <DimArrow x1={O[0] + side + 46} y1={O[1]} x2={O[0] + side + 46} y2={O[1] - 26} />
      <line x1={O[0]} y1={O[1] + 6} x2={O[0]} y2={O[1] + 30} stroke="var(--ink-3)" strokeWidth={0.8} />
      <line x1={O[0] + 38} y1={O[1] - 20} x2={O[0] + 38} y2={O[1] + 30} stroke="var(--ink-3)" strokeWidth={0.8} strokeDasharray="2 2" />
      <DimArrow x1={O[0]} y1={O[1] + 24} x2={O[0] + 38} y2={O[1] + 24} />
      <g fontSize={12.5} className={LBL}>
        <text x={O[0] + 19} y={O[1] + 44} textAnchor="middle">
          <tspan fontStyle="italic">u</tspan> δ<tspan fontStyle="italic">t</tspan>
        </text>
        <text x={O[0] + side + 52} y={O[1] - 9}>
          <tspan fontStyle="italic">v</tspan> δ<tspan fontStyle="italic">t</tspan>
        </text>
      </g>
    </svg>
  )
}

function Variation() {
  const O = [45, 180]
  const A = [165, 180]
  const C = [165, 55]
  const B = [45, 55]
  return (
    <svg viewBox="0 0 260 230" className="block h-auto w-full" role="img" aria-label="velocity varying across the element">
      <polygon points={`${O} ${A} ${C} ${B}`} fill="none" stroke="var(--ink-2)" strokeWidth={1.4} />
      <Arrow x1={B[0]} y1={B[1]} x2={B[0] + 36} y2={B[1]} color="var(--plot-1)" width={3} head={9} />
      <Arrow x1={O[0]} y1={O[1]} x2={O[0] + 36} y2={O[1]} color="var(--plot-1)" width={3} head={9} />
      <Arrow x1={C[0]} y1={C[1]} x2={C[0] + 54} y2={C[1]} color="var(--plot-1)" width={3} head={9} />
      <Arrow x1={A[0]} y1={A[1]} x2={A[0] + 54} y2={A[1]} color="var(--plot-1)" width={3} head={9} />
      <g fontSize={13} fontStyle="italic" className={LBL}>
        <text x={O[0] - 14} y={O[1] + 16}>O</text>
        <text x={A[0] - 4} y={A[1] + 18}>A</text>
        <text x={C[0] - 4} y={C[1] - 8}>C</text>
        <text x={B[0] - 14} y={B[1] - 6}>B</text>
        <text x={B[0] + 24} y={B[1] - 7}>u</text>
        <text x={O[0] + 24} y={O[1] - 7}>u</text>
      </g>
      <g fontSize={12} className={LBL}>
        <text x={C[0] + 2} y={C[1] - 22}>
          <tspan fontStyle="italic">u</tspan> + (∂<tspan fontStyle="italic">u</tspan>/∂<tspan fontStyle="italic">x</tspan>) δ<tspan fontStyle="italic">x</tspan>
        </text>
        <text x={A[0] + 2} y={A[1] - 10}>
          <tspan fontStyle="italic">u</tspan> + (∂<tspan fontStyle="italic">u</tspan>/∂<tspan fontStyle="italic">x</tspan>) δ<tspan fontStyle="italic">x</tspan>
        </text>
        <text x={(O[0] + A[0]) / 2} y={O[1] + 18} textAnchor="middle">
          δ<tspan fontStyle="italic">x</tspan>
        </text>
        <text x={O[0] - 8} y={(O[1] + B[1]) / 2} textAnchor="end">
          δ<tspan fontStyle="italic">y</tspan>
        </text>
      </g>
    </svg>
  )
}

function Stretching({ s }: { s: number }) {
  const O = [30, 180]
  const A = [150, 180]
  const C = [150, 55]
  const B = [30, 55]
  const w = 42 * s
  return (
    <svg viewBox="0 0 260 230" className="block h-auto w-full" role="img" aria-label="stretching strip added to the element">
      <rect x={A[0]} y={C[1]} width={Math.max(0, w)} height={A[1] - C[1]} fill="var(--plot-4)" fillOpacity={0.32} stroke="var(--plot-4)" strokeWidth={1.2} strokeDasharray="5 3" />
      <polygon points={`${O} ${A} ${C} ${B}`} fill="none" stroke="var(--ink-2)" strokeWidth={1.4} />
      <g fontSize={13} fontStyle="italic" className={LBL}>
        <text x={O[0] - 4} y={O[1] + 18}>O</text>
        <text x={A[0] - 14} y={A[1] + 18}>A</text>
        <text x={A[0] + w + 3} y={A[1] + 18}>A′</text>
        <text x={C[0] - 14} y={C[1] - 7}>C</text>
        <text x={C[0] + w + 3} y={C[1] - 7}>C′</text>
        <text x={B[0] - 4} y={B[1] - 7}>B</text>
      </g>
      <g fontSize={12} className={LBL}>
        <text x={(O[0] + A[0]) / 2} y={O[1] + 18} textAnchor="middle">
          δ<tspan fontStyle="italic">x</tspan>
        </text>
        <text x={O[0] - 6} y={(O[1] + B[1]) / 2} textAnchor="end">
          δ<tspan fontStyle="italic">y</tspan>
        </text>
        <text x={A[0] + 21} y={A[1] + 46} textAnchor="middle">
          (∂<tspan fontStyle="italic">u</tspan>/∂<tspan fontStyle="italic">x</tspan> δ<tspan fontStyle="italic">x</tspan>) δ<tspan fontStyle="italic">t</tspan>
        </text>
      </g>
      {w > 2 ? <DimArrow x1={A[0]} y1={A[1] + 28} x2={A[0] + w} y2={A[1] + 28} /> : null}
    </svg>
  )
}

export function Slide5Figure() {
  const ref = useRef<HTMLDivElement>(null)
  const { s } = useLoop(ref, 2, { hold: 1.4 })
  const e = easeInOut(s)
  const cap = 'mt-1 px-1 text-[12px] leading-snug text-ink-3'
  return (
    <div ref={ref} className="grid gap-3 sm:grid-cols-3">
      <div className="rounded-xl border border-line bg-surface-2/50 p-2">
        <Translation s={e} />
        <div className={cap}>
          <b className="text-ink-2">Translation.</b> All points share the velocity (u, v): in δt the element just shifts by u δt and v δt.
        </div>
      </div>
      <div className="rounded-xl border border-line bg-surface-2/50 p-2">
        <Variation />
        <div className={cap}>
          <b className="text-ink-2">Velocity variation.</b> If u changes with x, face AC (a distance δx from OB) moves faster by (∂u/∂x)δx.
        </div>
      </div>
      <div className="rounded-xl border border-line bg-surface-2/50 p-2">
        <Stretching s={e} />
        <div className={cap}>
          <b className="text-ink-2">Stretching.</b> In δt face AC gets ahead of OB by (∂u/∂x δx)δt: the shaded strip AA′C′C is the added volume.
        </div>
      </div>
    </div>
  )
}
