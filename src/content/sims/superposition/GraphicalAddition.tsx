import { useMemo, useState } from 'react'
import { md, SimPanel, Slider, Toggle, useUid } from '@/kit'
import { bodyPoint, sampleCurve, streamlineUpper, thetaAtX, toPath, type Box, type Pt } from './halfbody'
import { Label, useFrame } from './svg'
import { Tiles } from './Tiles'

/*
 * Graphical superposition (upper half-plane; the flow is symmetric about the x-axis).
 * Units: b = 1, U = 1, m = 2π. Both families are drawn with the same spacing Δψ = m/16:
 *   uniform flow  ψ_U = U y        → horizontal lines y = kΔ,       Δ = Δψ/U = π/8
 *   source        ψ_s = (m/2π) θ   → rays θ = j·22.5°
 * The resultant streamline ψ = nΔψ threads every grid crossing with k + j = n.
 */
const X: [number, number] = [-3, 5.5]
const Y: [number, number] = [0, 4.3]
const BOX: Box = [X[0], X[1], Y[0], Y[1]]
const D = Math.PI / 8
const KMAX = 10
const NMAX = 18

function kind(n: number) {
  if (n < 8) return 'source fluid (inside the body)'
  if (n === 8) return 'dividing streamline = body surface'
  return 'free-stream fluid (outside)'
}

export function GraphicalAddition() {
  const [n, setN] = useState(10)
  const [labels, setLabels] = useState(true)
  const f = useFrame(X, Y, 380)
  const clip = useUid('ga')

  const geo = useMemo(() => {
    const step = 0.025
    const resultants: Pt[][] = []
    for (let i = 1; i <= NMAX; i++) resultants.push(streamlineUpper(1, i * D, BOX, step))
    const tFar = thetaAtX(1, X[1] + 1)
    const upper = sampleCurve((t) => bodyPoint(1, t), tFar, Math.PI, BOX, step)
    const bodyUpper: Pt[] = [...upper, [X[1] + 1, 0]]
    return { resultants, bodyUpper, upper }
  }, [])

  const { sx, sy, W, H } = f
  const showDotLabels = labels && W >= 440
  const dots: { p: Pt; k: number; j: number }[] = []
  for (let j = 1; j <= 7; j++) {
    const kk = n - j
    if (kk < 1 || kk > KMAX) continue
    const y = kk * D
    const x = y / Math.tan((j * Math.PI) / 8)
    if (x >= X[0] && x <= X[1] && y <= Y[1]) dots.push({ p: [x, y], k: kk, j })
  }
  const yDown = n * D
  const yUp = (n - 8) * D

  return (
    <SimPanel
      title="Graphical superposition of streamlines"
      subtitle="add the two stream-function grids, crossing by crossing"
      controls={
        <>
          <Slider label="resultant streamline $\psi = n\,\Delta\psi$" value={n} min={1} max={NMAX} step={1} onChange={(v) => setN(Math.round(v))} digits={2} format={(v) => `n = ${Math.round(v)}`} />
          <Toggle label="label the crossings $k + j$" checked={labels} onChange={setLabels} />
          <div className="rounded-xl border border-line bg-surface-2/60 px-3 py-2 text-xs leading-relaxed text-ink-2">
            Blue lines: <b>uniform flow</b>, ψ_U = kΔψ. Amber rays: <b>source</b>, ψ_s = jΔψ. Both families use Δψ = m/16, so along the
            red curve every crossing has k + j = n.
          </div>
        </>
      }
      readout={
        <Tiles
          cols={1}
          items={[
            { label: md`stream-function value`, value: `ψ = ${n} × m/16${n === 8 ? ' = m/2 = πbU' : ''}`, tone: n === 8 ? 'accent' : 'default' },
            { label: md`which fluid`, value: kind(n) },
            {
              label: n < 8 ? md`leaves the source at` : md`far upstream at height`,
              value: n < 8 ? `θ₀ = ${(n * 22.5).toFixed(1)}°` : `y = ${n === 8 ? '0 (the axis)' : `${yUp.toFixed(3)} b`}`,
            },
            { label: md`far downstream at height`, value: `y = ${yDown.toFixed(3)} b${n === 8 ? ' = πb' : ''}` },
          ]}
        />
      }
      footer={
        <span>
          <b>Try this:</b> step n from 1 to 18. For n &lt; 8 the curve starts at the source (source fluid, inside the body); n = 8 is the
          body surface, which meets the axis at the stagnation point; for n &gt; 8 the curve starts far upstream and ends exactly πb ≈ 3.14 b
          higher — every outer streamline is pushed out by the body half-width.
        </span>
      }
    >
      <div>
        <div ref={f.ref} className="w-full">
          <svg width={W} height={H} className="mx-auto block" role="img" aria-label="Graphical addition of uniform-flow and source streamlines">
            <defs>
              <clipPath id={clip}>
                <rect x={sx(X[0])} y={0} width={sx(X[1]) - sx(X[0])} height={H} />
              </clipPath>
            </defs>
            <rect x={sx(X[0])} y={0} width={sx(X[1]) - sx(X[0])} height={H} fill="var(--field-bg)" stroke="var(--line)" rx={8} />
            <g clipPath={`url(#${clip})`}>
              <path d={toPath(geo.bodyUpper, sx, sy, true)} fill="var(--plot-3)" fillOpacity={0.1} />
              {Array.from({ length: KMAX }, (_, i) => (
                <line key={`k${i}`} x1={sx(X[0])} x2={sx(X[1])} y1={sy((i + 1) * D)} y2={sy((i + 1) * D)} stroke="var(--streamline)" strokeOpacity={0.45} strokeWidth={1} />
              ))}
              {Array.from({ length: 9 }, (_, j) => {
                const a = (j * Math.PI) / 8
                return <line key={`j${j}`} x1={sx(0)} y1={sy(0)} x2={sx(12 * Math.cos(a))} y2={sy(12 * Math.sin(a))} stroke="var(--plot-3)" strokeOpacity={0.6} strokeWidth={1} />
              })}
              {geo.resultants.map((p, i) => (
                <path key={`n${i}`} d={toPath(p, sx, sy)} fill="none" stroke="var(--ink-3)" strokeOpacity={0.35} strokeWidth={1} />
              ))}
              <path d={toPath(geo.upper, sx, sy)} fill="none" stroke="var(--plot-4)" strokeOpacity={n === 8 ? 0 : 0.5} strokeWidth={1.4} strokeDasharray="5 3" />
              <path d={toPath(geo.resultants[n - 1] ?? [], sx, sy)} fill="none" stroke="var(--plot-4)" strokeWidth={3} strokeLinecap="round" />
              {n === 8 ? <line x1={sx(X[0])} y1={sy(0) - 1.5} x2={sx(-1)} y2={sy(0) - 1.5} stroke="var(--plot-4)" strokeWidth={3} /> : null}
              {dots.map((d) => (
                <g key={`d${d.j}`}>
                  <circle cx={sx(d.p[0])} cy={sy(d.p[1])} r={4} fill="var(--plot-4)" stroke="var(--surface)" strokeWidth={1.5} />
                  {showDotLabels ? (
                    <Label x={sx(d.p[0]) + 6} y={sy(d.p[1]) - 6} size={10} weight={600} className="fill-ink-2">
                      {`${d.k}+${d.j}`}
                    </Label>
                  ) : null}
                </g>
              ))}
              {labels
                ? Array.from({ length: KMAX }, (_, i) => (
                    <Label key={`lk${i}`} x={sx(X[0]) + 4} y={sy((i + 1) * D) + 3.5} size={10} weight={700} className="fill-sky-700 dark:fill-sky-300">
                      {`${i + 1}`}
                    </Label>
                  ))
                : null}
              {labels
                ? Array.from({ length: 9 }, (_, j) => {
                    const a = (j * Math.PI) / 8
                    const R = 2.75
                    return (
                      <Label key={`lj${j}`} x={sx(R * Math.cos(a))} y={sy(R * Math.sin(a)) + (j === 0 || j === 8 ? -4 : 3.5)} anchor="middle" size={10} weight={700} className="fill-amber-700 dark:fill-amber-300">
                        {`${j}`}
                      </Label>
                    )
                  })
                : null}
            </g>
            <circle cx={sx(-1)} cy={sy(0)} r={4.5} fill="var(--plot-3)" stroke="var(--ink)" strokeWidth={1.2} />
            <circle cx={sx(0)} cy={sy(0)} r={4} fill="var(--surface)" stroke="var(--plot-4)" strokeWidth={1.6} />
            <Label x={sx(-1)} y={sy(0) - 9} anchor="middle" size={11}>
              S
            </Label>
          </svg>
        </div>
      </div>
      <p className="mt-1 text-center text-[11px] text-ink-3">Upper half only — the lower half is the mirror image. Lengths in units of b.</p>
    </SimPanel>
  )
}

