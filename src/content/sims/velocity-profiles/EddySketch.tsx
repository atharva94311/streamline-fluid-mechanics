import { useMemo, useState } from 'react'
import { useAnimationFrame, useElementSize, useInView, usePrefersReducedMotion, useUid } from '@/kit'

/**
 * Prandtl's picture near a wall (supplementary sketch, not to scale):
 * left — eddies whose size grows in proportion to the distance from the wall (ℓ = ky) and whose spin rate
 *        falls as 1/y (they rotate with the local shear dv̄z/dy = v* ÷ (ky));
 * right — the resulting time-averaged profile: linear sublayer at the wall, logarithmic law above it,
 *         and the log law's own (unphysical) plunge to −∞ as y → 0.
 */
export function EddySketch() {
  const [ref, size] = useElementSize<HTMLDivElement>()
  const inView = useInView(ref)
  const reduced = usePrefersReducedMotion()
  const [t, setT] = useState(0)
  const clipId = useUid('vp-eddy-clip')
  const hatchId = useUid('vp-wall-hatch')
  useAnimationFrame((dt) => setT((x) => (x + dt) % 3600), inView && !reduced)

  const W = Math.max(300, size.width || 640)
  const H = 300
  const left = 30
  const right = 10
  const top = 18
  const wallY = H - 36
  const avail = wallY - top
  const mid = left + (W - left - right) * 0.5
  const ePanel = { x0: left + 4, x1: mid - 8 }
  const pW = W - right - 6 - (mid + 16)
  const pPanel = { x0: mid + 16 + 0.2 * pW, x1: W - right - 6 }

  // Eddy rows: distance from wall d (px) doubles row by row, radius ∝ d (ℓ = ky), spin ∝ 1/d.
  const eddies = useMemo(() => {
    const out: { cx: number; cy: number; r: number; w: number; ph: number; key: string }[] = []
    const d0 = 9
    const rows = 5
    for (let i = 0; i < rows; i++) {
      const d = d0 * 2 ** i
      const r = 0.33 * d
      if (d + r > avail) break
      const pw = ePanel.x1 - ePanel.x0
      const n = Math.max(1, Math.floor(pw / (2.3 * r)))
      const sp = pw / n
      for (let j = 0; j < n; j++) {
        const cx = ePanel.x0 + sp * (j + 0.5) + (i % 2 ? sp / 4 : -sp / 8)
        if (cx - r < ePanel.x0 - 2 || cx + r > ePanel.x1 + 2) continue
        out.push({ cx, cy: wallY - d, r, w: 2.6 * (d0 / d), ph: (j * 1.7 + i) % 6.28, key: `${i}-${j}` })
      }
    }
    return out
  }, [avail, ePanel.x0, ePanel.x1, wallY])

  // Mean-velocity profile (sketch units): log law u ∝ ln(d/dz) above the junction d_s, linear below it.
  const dz = 2.2
  const dTop = avail - 4
  const maxLen = Math.max(60, pPanel.x1 - pPanel.x0 - 8)
  const uLog = (d: number) => (Math.log(d / dz) / Math.log(dTop / dz)) * maxLen
  const ds = 8
  const uS = uLog(ds)
  const X = (u: number) => pPanel.x0 + u
  const Y = (d: number) => wallY - d
  const logPath: string[] = []
  for (let k = 0; k <= 60; k++) {
    const d = ds * (dTop / ds) ** (k / 60)
    logPath.push(`${k ? 'L' : 'M'}${X(uLog(d)).toFixed(1)},${Y(d).toFixed(1)}`)
  }
  const dMin = 1.2
  const extPath: string[] = []
  for (let k = 0; k <= 30; k++) {
    const d = dMin * (ds / dMin) ** (k / 30)
    extPath.push(`${k ? 'L' : 'M'}${X(uLog(d)).toFixed(1)},${Y(d).toFixed(1)}`)
  }
  const arrows = [] as { d: number; u: number }[]
  for (let d = 22; d < dTop; d += 26) arrows.push({ d, u: uLog(d) })

  return (
    <div ref={ref} className="w-full">
      <svg width={W} height={H} className="block max-w-full" role="img" aria-label="Sketch of Prandtl's mixing-length picture near a wall">
        <defs>
          <clipPath id={clipId}>
            <rect x={ePanel.x0 - 2} y={top - 4} width={ePanel.x1 - ePanel.x0 + 4} height={wallY - top + 4} />
          </clipPath>
          <pattern id={hatchId} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="8" stroke="var(--ink-3)" strokeWidth="1.2" />
          </pattern>
        </defs>

        {/* y axis */}
        <line x1={left - 14} x2={left - 14} y1={wallY} y2={top + 2} stroke="var(--ink-3)" strokeWidth={1.3} />
        <path d={`M${left - 18},${top + 10} L${left - 14},${top} L${left - 10},${top + 10}`} fill="none" stroke="var(--ink-3)" strokeWidth={1.3} />
        <text x={left - 10} y={top + 22} className="fill-ink-2 text-[11px] font-semibold">y</text>

        {/* eddies */}
        <g clipPath={`url(#${clipId})`}>
          {eddies.map((e) => {
            const deg = ((e.w * t + e.ph) * 180) / Math.PI
            const a = Math.min(6, e.r * 0.45)
            return (
              <g key={e.key} transform={`rotate(${deg.toFixed(2)} ${e.cx.toFixed(1)} ${e.cy.toFixed(1)})`}>
                <circle
                  cx={e.cx}
                  cy={e.cy}
                  r={e.r}
                  fill="color-mix(in srgb, var(--plot-2) 8%, transparent)"
                  stroke="var(--plot-2)"
                  strokeWidth={e.r > 5 ? 1.5 : 1.1}
                  strokeDasharray={e.r > 5 ? `${(e.r * 1.6).toFixed(1)} ${(e.r * 0.5).toFixed(1)}` : undefined}
                />
                {e.r > 5 ? (
                  <path
                    d={`M${(e.cx + a).toFixed(1)},${(e.cy - e.r).toFixed(1)} L${(e.cx - a * 0.5).toFixed(1)},${(e.cy - e.r - a * 0.6).toFixed(1)} L${(e.cx - a * 0.5).toFixed(1)},${(e.cy - e.r + a * 0.6).toFixed(1)} Z`}
                    fill="var(--plot-2)"
                  />
                ) : null}
              </g>
            )
          })}
        </g>
        <text x={ePanel.x0} y={top + 4} className="fill-ink-2 text-[11px] font-semibold">eddy size ℓ = k y</text>
        <text x={ePanel.x1} y={wallY - 58} textAnchor="end" className="fill-ink-3 text-[10px]">bigger, slower</text>
        <text x={ePanel.x1} y={wallY - 22} textAnchor="end" className="fill-ink-3 text-[10px]">small, fast</text>

        {/* separator */}
        <line x1={mid + 4} x2={mid + 4} y1={top} y2={wallY} stroke="var(--line)" strokeDasharray="3 4" />

        {/* profile panel */}
        <line x1={pPanel.x0} x2={pPanel.x0} y1={wallY} y2={top + 6} stroke="var(--ink-3)" strokeWidth={1} />
        {arrows.map((a) => (
          <g key={a.d} stroke="var(--ink-3)" fill="var(--ink-3)" opacity={0.75}>
            <line x1={X(0)} x2={X(a.u) - 5} y1={Y(a.d)} y2={Y(a.d)} strokeWidth={1} />
            <path d={`M${X(a.u)},${Y(a.d)} L${X(a.u) - 6},${Y(a.d) - 3} L${X(a.u) - 6},${Y(a.d) + 3} Z`} stroke="none" />
          </g>
        ))}
        <path d={extPath.join(' ')} fill="none" stroke="var(--plot-4)" strokeWidth={1.6} strokeDasharray="4 3" />
        <path d={`M${X(0)},${Y(0)} L${X(uS)},${Y(ds)}`} stroke="var(--plot-5)" strokeWidth={2.6} fill="none" />
        <path d={logPath.join(' ')} fill="none" stroke="var(--plot-1)" strokeWidth={2.4} />
        <text x={pPanel.x0 + 6} y={top + 4} className="fill-ink-2 text-[11px] font-semibold">mean velocity v̄z(y)</text>
        <text x={X(uLog(30)) + 6} y={Y(30) + 4} className="fill-[var(--plot-1)] text-[10.5px] font-semibold">
          log law
        </text>
        <text x={X(uS) + 6} y={Y(ds) - 1} className="fill-[var(--plot-5)] text-[10px] font-semibold">sublayer</text>
        {W > 420 ? (
          <text x={X(uLog(dMin)) - 3} y={Y(dMin) - 3} textAnchor="end" className="fill-[var(--plot-4)] text-[10px] font-semibold">
            −∞
          </text>
        ) : null}

        {/* wall */}
        <rect x={left - 20} y={wallY} width={W - left - right + 20} height={12} fill="var(--body-fill)" />
        <rect x={left - 20} y={wallY} width={W - left - right + 20} height={12} fill={`url(#${hatchId})`} opacity={0.6} />
        <line x1={left - 20} x2={W - right} y1={wallY} y2={wallY} stroke="var(--ink-2)" strokeWidth={1.6} />
        <text x={ePanel.x0} y={wallY + 27} className="fill-ink-2 text-[11px]">wall (no slip), τ ≈ τw nearby</text>
        <text x={pPanel.x0} y={wallY + 27} className="fill-ink-2 text-[11px]">v̄z = 0 at the wall</text>
      </svg>
    </div>
  )
}
