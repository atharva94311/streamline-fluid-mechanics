import { useMemo } from 'react'
import { useInView, usePrefersReducedMotion, useUid } from '@/kit'
import { bodyOutline, bodyPoint, mirror, pointNearX, streamlineUpper, toPath, type Box, type Pt } from './halfbody'
import { DimLine, Head, Label, useFrame } from './svg'

/*
 * Recreation of the Lec 12 slide 17 (left) figure with exact geometry (lengths in units of b):
 * oncoming streamlines, the stagnation point, the source a distance b behind it, four internal source
 * streamlines, the body outline ψ = πbU with a darker band just inside it, and the πb half-width dimensions.
 */
const X: [number, number] = [-4.6, 9.6]
const Y: [number, number] = [-4.9, 4.9]
const BOX: Box = [X[0], X[1], Y[0], Y[1]]
const UPSTREAM = [0.55, 1.25, 2.1, 3.1]
const INTERNAL = [Math.PI / 3, (2 * Math.PI) / 3]

export function HalfBodyFigure() {
  const f = useFrame(X, Y, 400)
  const clip = useUid('hbf')
  const bodyClip = useUid('hbb')
  const inView = useInView(f.ref)
  const reduced = usePrefersReducedMotion()
  const dash = inView && !reduced ? 'flow-dash' : undefined

  const geo = useMemo(() => {
    const step = 0.03
    const outer: Pt[][] = []
    for (const a of UPSTREAM) {
      const up = streamlineUpper(1, a + Math.PI, BOX, step)
      outer.push(up, mirror(up))
    }
    const inner: Pt[][] = []
    for (const h of INTERNAL) {
      const up = streamlineUpper(1, h, BOX, step)
      inner.push(up, mirror(up))
    }
    const body = bodyOutline(1, X[1] + 1, BOX, step)
    return { outer, inner, body }
  }, [])

  const { sx, sy, W, H, k } = f
  const bodyD = toPath(geo.body, sx, sy, true)
  const lab = bodyPoint(1, 1.2)
  const dimX = 8.75
  return (
    <div ref={f.ref} className="w-full">
      <svg width={W} height={H} className="mx-auto block" role="img" aria-label="Half-body: dividing streamline, stagnation point, source and asymptotic half-widths πb">
        <defs>
          <clipPath id={clip}>
            <rect x={sx(X[0])} y={0} width={sx(X[1]) - sx(X[0])} height={H} />
          </clipPath>
          <clipPath id={bodyClip}>
            <path d={bodyD} />
          </clipPath>
        </defs>
        <rect x={sx(X[0])} y={0} width={sx(X[1]) - sx(X[0])} height={H} fill="var(--field-bg)" stroke="var(--line)" rx={8} />
        <g clipPath={`url(#${clip})`}>
          {/* body: light interior + darker band just inside the outline (as on the slide) */}
          <path d={bodyD} fill="var(--plot-1)" fillOpacity={0.16} />
          <path d={bodyD} fill="none" stroke="var(--plot-1)" strokeOpacity={0.32} strokeWidth={Math.max(8, 0.55 * k)} clipPath={`url(#${bodyClip})`} />
          {/* asymptotes y = ±πb */}
          {[Math.PI, -Math.PI].map((yy) => (
            <line key={yy} x1={sx(2.5)} x2={sx(X[1])} y1={sy(yy)} y2={sy(yy)} stroke="var(--ink-3)" strokeDasharray="3 4" strokeWidth={1} />
          ))}
          {/* internal source streamlines and the axis */}
          {geo.inner.map((p, i) => (
            <path key={`i${i}`} d={toPath(p, sx, sy)} fill="none" stroke="var(--ink-2)" strokeOpacity={0.75} strokeWidth={1.2} />
          ))}
          <line x1={sx(-1)} y1={sy(0)} x2={sx(X[1])} y2={sy(0)} stroke="var(--ink-2)" strokeOpacity={0.75} strokeWidth={1.2} />
          {/* oncoming streamlines */}
          <line x1={sx(X[0])} y1={sy(0)} x2={sx(-1)} y2={sy(0)} stroke="var(--streamline)" strokeWidth={1.5} className={dash} />
          <Head x={sx(-3.2)} y={sy(0)} ux={1} uy={0} color="var(--streamline)" size={8} />
          {geo.outer.map((p, i) => {
            const a = pointNearX(p, -3.2)
            return (
              <g key={`o${i}`}>
                <path d={toPath(p, sx, sy)} fill="none" stroke="var(--streamline)" strokeWidth={1.5} className={dash} />
                {a ? <Head x={sx(a.p[0])} y={sy(a.p[1])} ux={a.dir[0]} uy={-a.dir[1]} color="var(--streamline)" size={8} /> : null}
              </g>
            )
          })}
          {/* body outline = dividing streamline */}
          <path d={toPath(geo.body, sx, sy)} fill="none" stroke="var(--plot-1)" strokeWidth={2.2} />
        </g>
        {/* stagnation point and source */}
        <circle cx={sx(-1)} cy={sy(0)} r={4.5} fill="var(--ink)" />
        <circle cx={sx(0)} cy={sy(0)} r={4.5} fill="var(--surface)" stroke="var(--ink)" strokeWidth={1.5} />
        {/* labels */}
        <line x1={sx(-3.3)} y1={sy(1.75) + 4} x2={sx(-1) - 3} y2={sy(0) - 3} stroke="var(--ink-2)" strokeWidth={1} />
        <Label x={sx(-4.45)} y={sy(1.75)} size={12} weight={600}>
          Stagnation point
        </Label>
        <line x1={sx(0.4)} y1={sy(4.05) + 3} x2={sx(lab[0])} y2={sy(lab[1])} stroke="var(--ink-2)" strokeWidth={1} />
        <Label x={sx(0.4)} y={sy(4.05)} size={12} weight={600} italic>
          ψ = πbU
        </Label>
        {/* πb dimensions */}
        <DimLine x1={sx(dimX)} y1={sy(0)} x2={sx(dimX)} y2={sy(Math.PI)} />
        <DimLine x1={sx(dimX)} y1={sy(0)} x2={sx(dimX)} y2={sy(-Math.PI)} />
        <Label x={sx(dimX) + 5} y={sy(Math.PI / 2)} size={12} italic>
          πb
        </Label>
        <Label x={sx(dimX) + 5} y={sy(-Math.PI / 2)} size={12} italic>
          πb
        </Label>
        {/* b dimension */}
        <line x1={sx(-1)} y1={sy(0) + 6} x2={sx(-1)} y2={sy(-4.45)} stroke="var(--ink-3)" strokeWidth={0.9} />
        <line x1={sx(0)} y1={sy(0) + 6} x2={sx(0)} y2={sy(-4.45)} stroke="var(--ink-3)" strokeWidth={0.9} />
        <DimLine x1={sx(-1)} y1={sy(-4.25)} x2={sx(0)} y2={sy(-4.25)} />
        <Label x={sx(-0.5)} y={sy(-4.25) - 5} anchor="middle" size={12} italic>
          b
        </Label>
      </svg>
    </div>
  )
}
