import { M, md, useUid } from '@/kit'
import { ArrowDefs, Chevron, f2, polarFrame, polyPath, type Pt } from './svg'

const DEG = Math.PI / 180

/* ------------------------------------------------------------------ */
/* Slide 14: an arbitrary closed curve C with the line element ds and the velocity V */
/* ------------------------------------------------------------------ */

const BCX = 160
const BCY = 112
const BA = 128
const BB = 80
const rho = (t: number) => 1 + 0.12 * Math.cos(2 * t) + 0.07 * Math.sin(3 * t) - 0.05 * Math.cos(3 * t)
const blob = (t: number): Pt => [BCX + BA * rho(t) * Math.cos(t), BCY - BB * rho(t) * Math.sin(t)]
const blobTan = (t: number): Pt => {
  const h = 1e-4
  const [x1, y1] = blob(t - h)
  const [x2, y2] = blob(t + h)
  const L = Math.hypot(x2 - x1, y2 - y1)
  return [(x2 - x1) / L, (y2 - y1) / L]
}

/** Recreation of Lecture 12, slide 14: arbitrary curve C, tangent element ds and local velocity V at angle α. */
export function ArbitraryCurveFig() {
  const uid = useUid('arbc')
  const pts = Array.from({ length: 241 }, (_, i) => blob((2 * Math.PI * i) / 240))
  // point on the lower-right flank, where the counter-clockwise tangent points up-right as on the slide
  // (ds ≈ 37° above the horizontal, V ≈ 5°); this also keeps both arrows and their labels inside the viewBox
  const tP = 5.6
  const [px, py] = blob(tP)
  const [tx, ty] = blobTan(tP) // counter-clockwise direction of travel (screen coordinates)
  const beta = 32 * DEG // V is turned clockwise from ds by α
  const vx = tx * Math.cos(beta) - ty * Math.sin(beta)
  const vy = tx * Math.sin(beta) + ty * Math.cos(beta)
  const dsLen = 36
  const vLen = 74
  const a0 = Math.atan2(ty, tx)
  const rA = 24
  const arcD = `M${f2(px + rA * Math.cos(a0))} ${f2(py + rA * Math.sin(a0))}A${rA} ${rA} 0 0 1 ${f2(px + rA * Math.cos(a0 + beta))} ${f2(py + rA * Math.sin(a0 + beta))}`
  const lab = blob(3.95)
  return (
    <svg viewBox="0 0 360 228" className="mx-auto block h-auto w-full max-w-[460px]" role="img" aria-label="Arbitrary closed curve C with line element ds and velocity V">
      <ArrowDefs id={uid} colors={{ v: 'var(--plot-1)', ink: 'var(--ink-2)' }} size={8} />
      <path d={polyPath(pts, true)} fill="var(--plot-1)" fillOpacity={0.05} stroke="var(--plot-1)" strokeWidth={1.8} />
      {[0.6, 1.7, 3.0, 4.55].map((t) => {
        const [cx, cy] = blob(t)
        const [dx, dy] = blobTan(t)
        return <Chevron key={t} x={cx} y={cy} dx={dx} dy={dy} fill="var(--plot-1)" size={5.5} />
      })}
      <path d={arcD} fill="none" stroke="var(--ink-3)" strokeWidth={1.2} />
      <text x={f2(px + 30 * Math.cos(a0 + beta / 2) + 3)} y={f2(py + 30 * Math.sin(a0 + beta / 2) + 4)} className="text-[12px] italic" fill="var(--ink-2)">α</text>
      <line x1={px} y1={py} x2={f2(px + vLen * vx)} y2={f2(py + vLen * vy)} stroke="var(--plot-1)" strokeWidth={3} markerEnd={`url(#${uid}-v)`} />
      <line x1={px} y1={py} x2={f2(px + dsLen * tx)} y2={f2(py + dsLen * ty)} stroke="var(--plot-1)" strokeWidth={3} markerEnd={`url(#${uid}-v)`} />
      <circle cx={px} cy={py} r={3.5} fill="var(--plot-1)" />
      <text x={f2(px + dsLen * tx - 4)} y={f2(py + dsLen * ty - 8)} className="text-[13px] font-semibold" fill="var(--ink)">ds</text>
      <text x={f2(px + vLen * vx + 6)} y={f2(py + vLen * vy + 4)} className="text-[13px] font-semibold italic" fill="var(--ink)">V</text>
      <line x1={86} y1={198} x2={f2(lab[0] + 2)} y2={f2(lab[1] + 2)} stroke="var(--ink-3)" strokeWidth={1} markerEnd={`url(#${uid}-ink)`} />
      <text x={20} y={214} className="text-[12.5px]" fill="var(--ink-2)">Arbitrary curve C</text>
      <text x={222} y={214} className="text-[12px]" fill="var(--ink-2)">V · ds = V cos α ds</text>
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/* Slide 15: free-vortex streamlines, the path ABCD, ds = r dθ on a circle, v_θ */
/* ------------------------------------------------------------------ */

/**
 * Recreation of Lecture 12, slide 15. With `annotate`, the closed path ABCD is traced leg by leg in colour
 * (green = positive contribution to Γ, rose = negative, grey = zero) and a legend lists each contribution —
 * these annotations are added here; the slide shows the path only.
 */
export function SectorPathFig({ annotate = true }: { annotate?: boolean }) {
  const uid = useUid('sect')
  const S = 140
  const CY = 167
  const { P, arc, ccw } = polarFrame(150, CY, S)
  const radii = [0.08, 0.43, 0.7, 1.0]
  const t1 = 116 * DEG
  const t2 = 148 * DEG
  const rIn = radii[1]
  const rMid = radii[2]
  const A = P(rIn, t1)
  const B = P(rMid, t1)
  const C = P(rMid, t2)
  const D = P(rIn, t2)
  const rEnd = P(1, 25 * DEG)
  const tm = (t1 + t2) / 2
  const at = (r: number, th: number): Pt => P(r, th)
  const radialDir = (th: number, out: boolean): Pt => (out ? [Math.cos(th), -Math.sin(th)] : [-Math.cos(th), Math.sin(th)])
  const legs: { d: string; color: string; mid: Pt; dir: Pt }[] = [
    { d: `M${f2(A[0])} ${f2(A[1])}L${f2(B[0])} ${f2(B[1])}`, color: 'var(--ink-3)', mid: at((rIn + rMid) / 2, t1), dir: radialDir(t1, true) },
    { d: arc(rMid, t1, t2), color: 'var(--plot-5)', mid: at(rMid, tm), dir: ccw(tm) },
    { d: `M${f2(C[0])} ${f2(C[1])}L${f2(D[0])} ${f2(D[1])}`, color: 'var(--ink-3)', mid: at((rIn + rMid) / 2, t2), dir: radialDir(t2, false) },
    { d: arc(rIn, t2, t1), color: 'var(--plot-4)', mid: at(rIn, tm), dir: [-ccw(tm)[0], -ccw(tm)[1]] },
  ]
  return (
    <div>
      <svg viewBox="0 0 330 316" className="mx-auto block h-auto w-full max-w-[420px]" role="img" aria-label="Circular streamlines of a free vortex with the closed path ABCD">
        <ArrowDefs id={uid} colors={{ ink: 'var(--ink)' }} size={7} />
        {radii.map((r, i) => (
          <g key={r}>
            <circle cx={150} cy={CY} r={S * r} fill="none" stroke="var(--plot-4)" strokeOpacity={0.75} strokeWidth={1.6} />
            {(i === 0 ? [300] : [200, 300, 30]).map((a) => {
              const [x, y] = P(r, a * DEG)
              const [dx, dy] = ccw(a * DEG)
              return <Chevron key={a} x={x} y={y} dx={dx} dy={dy} fill="var(--plot-4)" size={i === 0 ? 3.5 : 5} />
            })}
          </g>
        ))}
        <line x1={150} y1={CY} x2={300} y2={CY} stroke="var(--ink-2)" strokeWidth={1.2} />
        <circle cx={150} cy={CY} r={3.5} fill="var(--ink)" />
        {/* r and θ */}
        <line x1={150} y1={CY} x2={f2(rEnd[0])} y2={f2(rEnd[1])} stroke="var(--ink-2)" strokeWidth={1.1} markerEnd={`url(#${uid}-ink)`} />
        <text x={f2(rEnd[0] - 22)} y={f2(rEnd[1] + 2)} className="text-[13px] italic" fill="var(--ink)">r</text>
        <path d={arc(0.25, 0, 25 * DEG)} fill="none" stroke="var(--ink-2)" strokeWidth={1.1} markerEnd={`url(#${uid}-ink)`} />
        <text x={f2(P(0.3, 11 * DEG)[0] + 2)} y={f2(P(0.3, 11 * DEG)[1] + 4)} className="text-[13px] italic" fill="var(--ink)">θ</text>
        {/* the two radial lines through A, B and through D, C */}
        {[t1, t2].map((t) => {
          const [x, y] = P(1, t)
          return <line key={t} x1={150} y1={CY} x2={f2(x)} y2={f2(y)} stroke="var(--ink-2)" strokeWidth={1.2} strokeDasharray="6 4" />
        })}
        {/* dθ */}
        <path d={arc(0.2, t1, t2)} fill="none" stroke="var(--ink-2)" strokeWidth={1} />
        <text x={158} y={CY - 28} className="text-[12.5px] italic" fill="var(--ink)">← dθ</text>
        {/* ds = r dθ on the outer circle */}
        <path d={arc(1, t1, t2)} fill="none" stroke="var(--ink)" strokeWidth={4.5} strokeLinecap="round" />
        <text x={f2(P(1.1, 136 * DEG)[0] - 14)} y={f2(P(1.1, 136 * DEG)[1])} className="text-[13px] font-semibold italic" fill="var(--ink)">ds</text>
        {/* v_θ */}
        <path d={arc(1.07, 62 * DEG, 96 * DEG)} fill="none" stroke="var(--ink)" strokeWidth={3} markerEnd={`url(#${uid}-ink)`} />
        <text x={f2(P(1.13, 80 * DEG)[0])} y={f2(P(1.13, 80 * DEG)[1])} className="text-[13px] font-semibold italic" fill="var(--ink)">
          v<tspan dy={3} className="text-[9.5px]">θ</tspan>
        </text>
        {/* path ABCD, traversed A → B → C → D → A */}
        {annotate
          ? legs.map((l, i) => (
              <g key={i}>
                <path d={l.d} fill="none" stroke={l.color} strokeWidth={3.4} strokeLinecap="round" />
                <Chevron x={l.mid[0]} y={l.mid[1]} dx={l.dir[0]} dy={l.dir[1]} fill={l.color} size={6} />
              </g>
            ))
          : null}
        {[A, B, C, D].map((p, i) => (
          <circle key={i} cx={f2(p[0])} cy={f2(p[1])} r={3.6} fill="var(--ink)" />
        ))}
        <text x={f2(A[0] + 6)} y={f2(A[1] - 5)} className="text-[12.5px] font-semibold italic" fill="var(--ink)">A</text>
        <text x={f2(B[0] + 6)} y={f2(B[1] - 4)} className="text-[12.5px] font-semibold italic" fill="var(--ink)">B</text>
        <text x={f2(C[0] - 15)} y={f2(C[1] - 6)} className="text-[12.5px] font-semibold italic" fill="var(--ink)">C</text>
        <text x={f2(D[0] - 6)} y={f2(D[1] + 16)} className="text-[12.5px] font-semibold italic" fill="var(--ink)">D</text>
      </svg>
      {annotate ? (
        <div className="mx-auto mt-2 grid max-w-[460px] grid-cols-1 gap-1 text-[13px] text-ink-2 sm:grid-cols-2">
          <span><span className="font-semibold text-ink-3">A → B</span> (radial, V ⊥ ds): <M tex={md`0`} /></span>
          <span><span className="font-semibold text-emerald-700 dark:text-emerald-300">B → C</span> (with the flow): <M tex={md`\frac{K}{r_B}\,r_B\,d\theta = +K\,d\theta`} /></span>
          <span><span className="font-semibold text-ink-3">C → D</span> (radial): <M tex={md`0`} /></span>
          <span><span className="font-semibold text-rose-700 dark:text-rose-300">D → A</span> (against the flow): <M tex={md`-\frac{K}{r_A}\,r_A\,d\theta = -K\,d\theta`} /></span>
          <span className="font-semibold text-ink sm:col-span-2">Total: <M tex={md`\Gamma_{ABCD} = 0`} /> — the path does not enclose the vortex centre.</span>
        </div>
      ) : null}
    </div>
  )
}
