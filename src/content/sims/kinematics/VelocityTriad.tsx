import { Arrow } from './shared'

/**
 * Recreation of the Lecture 9 slide 4 sketch: Cartesian axes (z up, y to the right, x toward the viewer),
 * unit vectors î, ĵ, k̂ and a velocity vector V resolved into its components u, v, w.
 */
export function VelocityTriad({ u = 0.9, v = 1.6, w = 1.25 }: { u?: number; v?: number; w?: number }) {
  const O: [number, number] = [118, 118]
  const S = 62 // px per unit
  // screen directions of the axes (oblique projection)
  const ex: [number, number] = [-0.72, 0.46]
  const ey: [number, number] = [1, 0]
  const ez: [number, number] = [0, -1]
  const at = (a: number, b: number, c: number): [number, number] => [
    O[0] + S * (a * ex[0] + b * ey[0] + c * ez[0]),
    O[1] + S * (a * ex[1] + b * ey[1] + c * ez[1]),
  ]
  const tip = at(u, v, w)
  const foot = at(u, v, 0)
  const onX = at(u, 0, 0)
  const onY = at(0, v, 0)
  const green = 'var(--plot-5)'
  const axis = 'var(--ink-3)'
  return (
    <svg viewBox="0 0 300 200" className="mx-auto block h-auto w-full max-w-[420px]" role="img" aria-label="velocity vector and its components">
      {/* axes */}
      <line x1={O[0]} y1={O[1]} x2={at(0, 0, 1.75)[0]} y2={at(0, 0, 1.75)[1]} stroke={axis} strokeWidth={1.1} />
      <line x1={O[0]} y1={O[1]} x2={at(0, 2.45, 0)[0]} y2={at(0, 2.45, 0)[1]} stroke={axis} strokeWidth={1.1} />
      <line x1={O[0]} y1={O[1]} x2={at(1.85, 0, 0)[0]} y2={at(1.85, 0, 0)[1]} stroke={axis} strokeWidth={1.1} />
      <g fontSize={12} fontStyle="italic" className="fill-ink-3">
        <text x={at(0, 0, 1.75)[0] - 9} y={at(0, 0, 1.75)[1] + 4}>z</text>
        <text x={at(0, 2.45, 0)[0] + 4} y={at(0, 2.45, 0)[1] + 4}>y</text>
        <text x={at(1.85, 0, 0)[0] - 10} y={at(1.85, 0, 0)[1] + 4}>x</text>
      </g>
      {/* component construction lines */}
      <g stroke={green} strokeWidth={1.1} strokeDasharray="4 3" opacity={0.85}>
        <line x1={tip[0]} y1={tip[1]} x2={foot[0]} y2={foot[1]} />
        <line x1={foot[0]} y1={foot[1]} x2={onY[0]} y2={onY[1]} />
        <line x1={foot[0]} y1={foot[1]} x2={onX[0]} y2={onX[1]} />
      </g>
      <g fontSize={12} fontStyle="italic" className="fill-ink-2">
        <text x={(tip[0] + foot[0]) / 2 + 5} y={(tip[1] + foot[1]) / 2 + 4}>w</text>
        <text x={(foot[0] + onY[0]) / 2 + 6} y={(foot[1] + onY[1]) / 2 + 2}>u</text>
        <text x={(foot[0] + onX[0]) / 2} y={(foot[1] + onX[1]) / 2 + 14}>v</text>
      </g>
      {/* unit vectors */}
      <Arrow x1={O[0]} y1={O[1]} x2={at(0.62, 0, 0)[0]} y2={at(0.62, 0, 0)[1]} color={green} width={2.6} head={8} />
      <Arrow x1={O[0]} y1={O[1]} x2={at(0, 0.62, 0)[0]} y2={at(0, 0.62, 0)[1]} color={green} width={2.6} head={8} />
      <Arrow x1={O[0]} y1={O[1]} x2={at(0, 0, 0.62)[0]} y2={at(0, 0, 0.62)[1]} color={green} width={2.6} head={8} />
      <g fontSize={12} fontWeight={700} className="fill-ink">
        <text x={at(0.62, 0, 0)[0] - 4} y={at(0.62, 0, 0)[1] - 7}>î</text>
        <text x={at(0, 0.62, 0)[0] - 4} y={at(0, 0.62, 0)[1] + 15}>ĵ</text>
        <text x={at(0, 0, 0.62)[0] + 6} y={at(0, 0, 0.62)[1] + 4}>k̂</text>
      </g>
      {/* velocity vector */}
      <Arrow x1={O[0]} y1={O[1]} x2={tip[0]} y2={tip[1]} color={green} width={3} head={10} />
      <text x={tip[0] + 6} y={tip[1] - 4} fontSize={14} fontWeight={700} className="fill-ink">
        V
      </text>
      <text x={150} y={192} textAnchor="middle" fontSize={13} className="fill-ink-2">
        <tspan fontWeight={700}>V</tspan> = <tspan fontStyle="italic">u</tspan> î + <tspan fontStyle="italic">v</tspan> ĵ +{' '}
        <tspan fontStyle="italic">w</tspan> k̂
      </text>
    </svg>
  )
}
