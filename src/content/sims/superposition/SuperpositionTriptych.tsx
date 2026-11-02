import { useMemo, useRef, type ReactNode } from 'react'
import { Md, md, useInView, usePrefersReducedMotion, useUid } from '@/kit'
import { bodyOutline, mirror, streamlineUpper, toPath, type Box, type Pt } from './halfbody'

/*
 * "Uniform flow + source = half-body", drawn with the SAME stream-function spacing Δψ in all three panels,
 * so the student can see each uniform-flow streamline turn into a displaced half-body streamline.
 * Units: U = 1, m = π (so b = m/2πU = 0.5); Δψ = m/16.
 */
const X: [number, number] = [-2, 4]
const Y: [number, number] = [-2, 2]
const K = 40 // px per unit in the 240×160 viewBox
const sx = (v: number) => (v - X[0]) * K
const sy = (v: number) => (Y[1] - v) * K
const B = 0.5
const DPSI = Math.PI / 16 // Δψ/U for U = 1
const BOX: Box = [X[0], X[1], Y[0], Y[1]]

function Panel({ children, label, caption }: { children: ReactNode; label: string; caption: string }) {
  const clip = useUid('tri')
  return (
    <figure className="min-w-0">
      <svg viewBox="0 0 240 160" className="block h-auto w-full rounded-lg border border-line" style={{ background: 'var(--field-bg)' }} role="img" aria-label={label}>
        <defs>
          <clipPath id={clip}>
            <rect x={0} y={0} width={240} height={160} />
          </clipPath>
        </defs>
        <g clipPath={`url(#${clip})`}>{children}</g>
      </svg>
      <figcaption className="mt-1.5 text-center text-xs text-ink-2">
        <Md inline>{caption}</Md>
      </figcaption>
    </figure>
  )
}

function Sign({ s }: { s: string }) {
  return <div className="flex items-center justify-center font-display text-2xl font-bold text-ink-3 sm:px-1">{s}</div>
}

export function SuperpositionTriptych() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref)
  const reduced = usePrefersReducedMotion()
  const dash = inView && !reduced ? 'flow-dash' : undefined

  const data = useMemo(() => {
    const step = 0.03
    const uniform = Array.from({ length: 21 }, (_, i) => (i - 10) * DPSI)
    const rays = Array.from({ length: 16 }, (_, j) => (j * Math.PI) / 8)
    const outer: Pt[][] = []
    for (let j = 1; j <= 10; j++) {
      const up = streamlineUpper(B, Math.PI * B + j * DPSI, BOX, step)
      outer.push(up, mirror(up))
    }
    const inner: Pt[][] = []
    for (let j = 1; j <= 7; j++) {
      const up = streamlineUpper(B, j * DPSI, BOX, step)
      inner.push(up, mirror(up))
    }
    const body = bodyOutline(B, X[1] + 1, BOX, step)
    return { uniform, rays, outer, inner, body }
  }, [])

  return (
    <div ref={ref} className="grid grid-cols-1 items-start gap-2 sm:grid-cols-[1fr_auto_1fr_auto_1fr]">
      <Panel label="Uniform flow streamlines" caption={md`Uniform flow: $\psi = Ur\sin\theta$`}>
        {data.uniform.map((y, i) => (
          <line key={i} x1={0} y1={sy(y)} x2={240} y2={sy(y)} stroke="var(--streamline)" strokeWidth={1.2} className={dash} />
        ))}
      </Panel>
      <Sign s="+" />
      <Panel label="Source streamlines" caption={md`Source: $\psi = \dfrac{m}{2\pi}\theta$`}>
        {data.rays.map((a, i) => (
          <line
            key={i}
            x1={sx(0.06 * Math.cos(a))}
            y1={sy(0.06 * Math.sin(a))}
            x2={sx(5 * Math.cos(a))}
            y2={sy(5 * Math.sin(a))}
            stroke="var(--plot-3)"
            strokeWidth={1.2}
            className={dash}
          />
        ))}
        <circle cx={sx(0)} cy={sy(0)} r={3.5} fill="var(--surface)" stroke="var(--plot-4)" strokeWidth={1.6} />
      </Panel>
      <Sign s="=" />
      <Panel label="Half-body streamlines" caption={md`Sum: $\psi = Ur\sin\theta + \dfrac{m}{2\pi}\theta$`}>
        <path d={toPath(data.body, sx, sy, true)} fill="var(--plot-3)" fillOpacity={0.12} stroke="none" />
        {data.inner.map((p, i) => (
          <path key={`i${i}`} d={toPath(p, sx, sy)} fill="none" stroke="var(--plot-3)" strokeWidth={1.1} className={dash} />
        ))}
        {data.outer.map((p, i) => (
          <path key={`o${i}`} d={toPath(p, sx, sy)} fill="none" stroke="var(--streamline)" strokeWidth={1.2} className={dash} />
        ))}
        <line x1={0} y1={sy(0)} x2={sx(-B)} y2={sy(0)} stroke="var(--plot-4)" strokeWidth={2} />
        <path d={toPath(data.body, sx, sy)} fill="none" stroke="var(--plot-4)" strokeWidth={2} />
        <circle cx={sx(-B)} cy={sy(0)} r={3.5} fill="var(--plot-3)" stroke="var(--ink)" strokeWidth={1} />
        <circle cx={sx(0)} cy={sy(0)} r={3} fill="var(--surface)" stroke="var(--plot-4)" strokeWidth={1.4} />
      </Panel>
    </div>
  )
}
