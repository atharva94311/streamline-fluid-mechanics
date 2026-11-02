import { useUid } from '@/kit'
import { ArrowDefs, Chevron, f2, polarFrame } from './svg'

const CX = 165
const CY = 150
const S = 130
const RADII = [0.07, 0.36, 0.62, 0.95]

/**
 * Recreation of the vortex diagram of Lecture 12, slide 11: concentric circular streamlines (ψ = const),
 * a radial equipotential (φ = const), the tangential velocity v_θ and the polar coordinates r, θ.
 */
export function VortexAnatomy({ ccw = true }: { ccw?: boolean }) {
  const uid = useUid('vanat')
  const { P, arc, ccw: tan } = polarFrame(CX, CY, S)
  const sgn = ccw ? 1 : -1
  const deg = Math.PI / 180

  // v_θ arrow tangent to the third circle
  const thV = 65 * deg
  const [vx, vy] = P(RADII[2], thV)
  const [tx, ty] = tan(thV)
  const half = 22
  const vStart = [vx - sgn * tx * half, vy - sgn * ty * half]
  const vEnd = [vx + sgn * tx * half, vy + sgn * ty * half]

  const rEnd = P(RADII[3], 22 * deg)
  const phiEnd = P(1.12, 214 * deg)
  const psiTip = P(RADII[3], 64 * deg)
  const thLabel = P(0.43, 10 * deg)

  return (
    <svg viewBox="0 0 340 300" className="mx-auto block h-auto w-full max-w-[440px]" role="img" aria-label="Free vortex: circular streamlines, radial equipotential, tangential velocity">
      <ArrowDefs id={uid} colors={{ ink: 'var(--ink)', ink3: 'var(--ink-3)' }} />
      {/* axes */}
      <line x1={18} x2={326} y1={CY} y2={CY} stroke="var(--ink-3)" strokeWidth={1} markerEnd={`url(#${uid}-ink3)`} />
      <line x1={CX} x2={CX} y1={292} y2={10} stroke="var(--ink-3)" strokeWidth={1} markerEnd={`url(#${uid}-ink3)`} />
      <text x={330} y={CY + 4} className="text-[12px] italic" fill="var(--ink-2)">x</text>
      <text x={CX - 13} y={16} className="text-[12px] italic" fill="var(--ink-2)">y</text>

      {/* streamlines with direction chevrons */}
      {RADII.map((r, i) => (
        <g key={r}>
          <circle cx={CX} cy={CY} r={S * r} fill="none" stroke="var(--plot-4)" strokeWidth={1.8} />
          {(i === 0 ? [90] : [160, 340]).map((a) => {
            const [px, py] = P(r, a * deg)
            const [dx, dy] = tan(a * deg)
            return <Chevron key={a} x={px} y={py} dx={sgn * dx} dy={sgn * dy} fill="var(--plot-4)" size={i === 0 ? 4 : 5.5} />
          })}
        </g>
      ))}
      <circle cx={CX} cy={CY} r={3.2} fill="var(--ink)" />

      {/* ψ = constant label */}
      <line x1={232} y1={21} x2={psiTip[0] + 2} y2={psiTip[1] + 2} stroke="var(--ink-2)" strokeWidth={1} markerEnd={`url(#${uid}-ink3)`} />
      <text x={234} y={19} className="text-[12.5px]" fill="var(--ink)">ψ = constant</text>

      {/* φ = constant: a radial equipotential */}
      <line x1={CX} y1={CY} x2={phiEnd[0]} y2={phiEnd[1]} stroke="var(--ink-2)" strokeWidth={1.3} strokeDasharray="7 5" />
      <text x={6} y={266} className="text-[12.5px]" fill="var(--ink)">φ = constant</text>

      {/* r and θ */}
      <line x1={CX} y1={CY} x2={rEnd[0]} y2={rEnd[1]} stroke="var(--ink-2)" strokeWidth={1.2} markerEnd={`url(#${uid}-ink)`} />
      <text x={258} y={99} className="text-[13px] italic" fill="var(--ink)">r</text>
      <path d={arc(0.28, 0, 22 * deg)} fill="none" stroke="var(--ink-2)" strokeWidth={1.1} markerEnd={`url(#${uid}-ink)`} />
      <text x={thLabel[0]} y={thLabel[1] + 2} className="text-[13px] italic" fill="var(--ink)">θ</text>

      {/* tangential velocity */}
      <line x1={f2(vStart[0])} y1={f2(vStart[1])} x2={f2(vEnd[0])} y2={f2(vEnd[1])} stroke="var(--ink)" strokeWidth={3} markerEnd={`url(#${uid}-ink)`} />
      <text x={ccw ? 182 : 214} y={58} className="text-[13px] font-semibold italic" fill="var(--ink)">
        v<tspan dy={3} className="text-[10px]">θ</tspan>
      </text>
    </svg>
  )
}
