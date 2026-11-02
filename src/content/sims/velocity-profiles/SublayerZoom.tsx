import { useElementSize, useUid } from '@/kit'
import { Y_JUNCTION, vLog, vTwoPiece } from './profiles'

const ZOOM_YP = 50 // wall units shown in the magnified panel

/**
 * To-scale view of one pipe radius (wall → centreline) next to a magnified view of the first 50 wall units.
 * Uses the two-piece profile (9.54)–(9.55) with the centreline velocity from the log law at y = a.
 * Optional roughness elements of height ε⁺ (wall units) are drawn to scale in both panels.
 */
export function SublayerZoom({ aPlus, epsPlus }: { aPlus: number; epsPlus?: number }) {
  const [ref, size] = useElementSize<HTMLDivElement>()
  const clipL = useUid('vp-zl')
  const clipR = useUid('vp-zr')
  const W = Math.max(300, size.width || 640)
  const H = 260
  const top = 30
  const wall = H - 34
  const ph = wall - top
  const L0 = 34
  const L1 = L0 + Math.min(0.36 * W, 240)
  const R0 = L1 + Math.max(44, 0.09 * W)
  const R1 = W - 14

  const vc = vLog(aPlus)
  const uOf = (yp: number) => Math.min(1, vTwoPiece(yp) / vc)
  // left panel: y/a ∈ [0,1] over ph pixels; sample per half pixel so the jump at the wall is honest
  const left: string[] = [`M${L0},${wall}`]
  for (let p = 0; p <= ph * 2; p++) {
    const yp = (aPlus * p) / (ph * 2)
    left.push(`L${(L0 + uOf(yp) * (L1 - L0)).toFixed(2)},${(wall - p / 2).toFixed(2)}`)
  }
  const leftLine = left.slice(1).map((s, i) => (i === 0 ? 'M' + s.slice(1) : s)).join(' ')
  const leftArea = left.join(' ') + ` L${L0},${top} Z`
  // right panel: y⁺ ∈ [0, 50]
  const right: string[] = []
  for (let k = 0; k <= 200; k++) {
    const yp = (ZOOM_YP * k) / 200
    right.push(`${k ? 'L' : 'M'}${(R0 + uOf(yp) * (R1 - R0)).toFixed(2)},${(wall - (ph * yp) / ZOOM_YP).toFixed(2)}`)
  }
  const rightArea = `M${R0},${wall} ` + right.map((s) => 'L' + s.slice(1)).join(' ') + ` L${R0},${top} Z`

  const subPx = (ph * Y_JUNCTION) / aPlus // true sublayer height in the to-scale panel
  const boxPx = (ph * ZOOM_YP) / aPlus // true height of the zoom window in the to-scale panel
  const M = aPlus / ZOOM_YP
  const yR = (yp: number) => wall - (ph * yp) / ZOOM_YP
  const uJ = uOf(Y_JUNCTION)
  const xJ = R0 + uJ * (R1 - R0)

  // roughness teeth (triangles) along the wall
  const teeth = (x0: number, x1: number, hPx: number, n: number) => {
    if (!(hPx > 0)) return ''
    const w = (x1 - x0) / n
    let d = ''
    for (let i = 0; i < n; i++) d += `M${(x0 + i * w).toFixed(1)},${wall} L${(x0 + (i + 0.5) * w).toFixed(1)},${(wall - hPx).toFixed(1)} L${(x0 + (i + 1) * w).toFixed(1)},${wall} Z `
    return d
  }
  const epsR = epsPlus != null ? (ph * epsPlus) / ZOOM_YP : 0
  const epsL = epsPlus != null ? (ph * epsPlus) / aPlus : 0

  return (
    <div ref={ref} className="w-full">
      <svg width={W} height={H} className="block max-w-full" role="img" aria-label="Laminar sublayer drawn to scale and magnified">
        <defs>
          <clipPath id={clipL}>
            <rect x={L0} y={top} width={L1 - L0} height={ph} />
          </clipPath>
          <clipPath id={clipR}>
            <rect x={R0} y={top} width={R1 - R0} height={ph} />
          </clipPath>
        </defs>

        {/* ---------- left: one radius, to scale ---------- */}
        <text x={L0} y={14} className="fill-ink-2 text-[11px] font-semibold">{W > 460 ? 'to scale: wall → centreline (CL)' : 'to scale'}</text>
        <rect x={L0} y={top} width={L1 - L0} height={ph} fill="var(--surface-2)" stroke="var(--line)" />
        <g clipPath={`url(#${clipL})`}>
          <path d={leftArea} fill="color-mix(in srgb, var(--plot-1) 14%, transparent)" />
          <path d={leftLine} fill="none" stroke="var(--plot-1)" strokeWidth={2} />
          <rect x={L0} y={wall - Math.max(subPx, 0.8)} width={L1 - L0} height={Math.max(subPx, 0.8)} fill="var(--plot-5)" />
          {epsPlus != null ? <path d={teeth(L0, L1, epsL, 18)} fill="var(--ink-3)" /> : null}
        </g>
        <rect x={L0 - 1} y={wall - Math.max(boxPx, 3)} width={Math.min(L1 - L0, 40) + 2} height={Math.max(boxPx, 3)} fill="none" stroke="var(--plot-4)" strokeWidth={1.6} />
        <text x={L0 - 6} y={top + 8} textAnchor="end" className="fill-ink-3 text-[10px]">CL</text>
        <text x={L0 + 4} y={wall + 14} className="fill-ink-3 text-[10px]">wall</text>
        <text x={L1} y={wall + 14} textAnchor="end" className="fill-ink-3 text-[10px]">v̄z/v̄zc = 1</text>
        <text x={(L0 + L1) / 2} y={wall + 28} textAnchor="middle" className="fill-ink-2 text-[10.5px]">
          sublayer = {subPx < 1 ? subPx.toFixed(2) : subPx.toFixed(1)} px of {ph} px
        </text>

        {/* connectors */}
        <line x1={L0 + Math.min(L1 - L0, 40) + 1} y1={wall - Math.max(boxPx, 3)} x2={R0} y2={top} stroke="var(--plot-4)" strokeDasharray="4 3" strokeWidth={1.2} />
        <line x1={L0 + Math.min(L1 - L0, 40) + 1} y1={wall} x2={R0} y2={wall} stroke="var(--plot-4)" strokeDasharray="4 3" strokeWidth={1.2} />

        {/* ---------- right: first 50 wall units, magnified ---------- */}
        <text x={R0} y={14} className="fill-ink-2 text-[11px] font-semibold">
          {W > 460 ? `magnified ×${M >= 100 ? Math.round(M) : M.toFixed(1)}: 0 ≤ y⁺ ≤ ${ZOOM_YP}` : `zoom ×${Math.round(M)}`}
        </text>
        <rect x={R0} y={top} width={R1 - R0} height={ph} fill="var(--surface-2)" stroke="var(--plot-4)" strokeWidth={1.4} />
        <g clipPath={`url(#${clipR})`}>
          <rect x={R0} y={yR(Y_JUNCTION)} width={R1 - R0} height={wall - yR(Y_JUNCTION)} fill="color-mix(in srgb, var(--plot-5) 16%, transparent)" />
          <path d={rightArea} fill="color-mix(in srgb, var(--plot-1) 12%, transparent)" />
          <path d={right.join(' ')} fill="none" stroke="var(--plot-1)" strokeWidth={2.2} />
          <line x1={R0} x2={R1} y1={yR(5)} y2={yR(5)} stroke="var(--plot-3)" strokeDasharray="5 4" strokeWidth={1.2} />
          <line x1={R0} x2={R1} y1={yR(Y_JUNCTION)} y2={yR(Y_JUNCTION)} stroke="var(--plot-5)" strokeWidth={1.4} />
          {epsPlus != null ? <path d={teeth(R0, R1, epsR, 9)} fill="color-mix(in srgb, var(--ink-3) 70%, transparent)" stroke="var(--ink-2)" strokeWidth={0.8} /> : null}
          <circle cx={xJ} cy={yR(Y_JUNCTION)} r={4} fill="var(--plot-8)" stroke="var(--surface)" strokeWidth={1.5} />
        </g>
        <text x={R0 - 5} y={yR(Y_JUNCTION) + 4} textAnchor="end" className="fill-[var(--plot-5)] text-[10.5px] font-bold">δ</text>
        <text x={R0 - 5} y={yR(5) + 4} textAnchor="end" className="fill-[var(--plot-3)] text-[9.5px]">5</text>
        <text x={R0 - 5} y={top + 8} textAnchor="end" className="fill-ink-3 text-[9.5px]">{ZOOM_YP}</text>
        <text x={R0 - 5} y={wall} textAnchor="end" className="fill-ink-3 text-[9.5px]">0</text>
        <text
          x={Math.min(xJ + 8, R1 - 4)}
          y={yR(Y_JUNCTION) - 8}
          textAnchor={xJ + 120 > R1 ? 'end' : 'start'}
          className="fill-ink text-[10.5px] font-semibold"
        >
          v̄zδ ≈ {Math.round(uJ * 100)} % of v̄zc
        </text>
        <text x={(R0 + R1) / 2} y={wall + 14} textAnchor="middle" className="fill-ink-3 text-[10px]">v̄z/v̄zc →</text>
        {W > 480 ? (
          <text x={(R0 + R1) / 2} y={wall + 28} textAnchor="middle" className="fill-ink-2 text-[10.5px]">
            shaded: sublayer y⁺ &lt; 11.6 · dashed: y⁺ = 5
          </text>
        ) : null}
      </svg>
    </div>
  )
}
