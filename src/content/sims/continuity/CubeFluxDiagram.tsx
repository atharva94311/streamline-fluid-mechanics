import { useState } from 'react'
import { MathBlock, Md, Segmented, cx, md, useUid } from '@/kit'
import { AX, ArrowMarkers } from './shared'

type Axis = 'x' | 'y' | 'z'
type Mode = Axis | 'all'

/* Oblique projection: x to the right, y up, z toward the viewer (drawn down-left). Cube = [-1, 1]^3. */
const S = 62
const CX = 200
const CY = 150
const KX = 0.55
const KY = 0.42
const P = (x: number, y: number, z: number): [number, number] => [CX + S * (x - KX * z), CY - S * (y - KY * z)]
const pt = (p: [number, number]) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`
const poly = (...ps: [number, number][]) => ps.map(pt).join(' ')

const FACE_TEXT: Record<Axis, { comp: string; flux: string; d: string; area: string; name: string }> = {
  x: { comp: 'u', flux: md`\rho u`, d: md`\delta x`, area: md`\delta y\,\delta z`, name: 'x' },
  y: { comp: 'v', flux: md`\rho v`, d: md`\delta y`, area: md`\delta x\,\delta z`, name: 'y' },
  z: { comp: 'w', flux: md`\rho w`, d: md`\delta z`, area: md`\delta x\,\delta y`, name: 'z' },
}

function bookkeeping(a: Mode): string {
  if (a === 'all')
    return md`\begin{aligned}
\text{net outflow} &= \Big[\pd{(\rho u)}{x}+\pd{(\rho v)}{y}+\pd{(\rho w)}{z}\Big]\,\delta x\,\delta y\,\delta z\\
\text{accumulation} &= \pd{\rho}{t}\,\delta x\,\delta y\,\delta z\\
\text{accumulation} + \text{net outflow} &= 0
\end{aligned}`
  const f = FACE_TEXT[a]
  return md`\begin{aligned}
\dot m_{\text{in}} &= \Big[${f.flux} - \pd{(${f.flux})}{${f.name}}\,\frac{${f.d}}{2}\Big]\,${f.area} &&\text{(face at } ${f.name}-\tfrac{${f.d}}{2})\\
\dot m_{\text{out}} &= \Big[${f.flux} + \pd{(${f.flux})}{${f.name}}\,\frac{${f.d}}{2}\Big]\,${f.area} &&\text{(face at } ${f.name}+\tfrac{${f.d}}{2})\\
\dot m_{\text{out}}-\dot m_{\text{in}} &= \pd{(${f.flux})}{${f.name}}\,\delta x\,\delta y\,\delta z
\end{aligned}`
}

/**
 * Fixed infinitesimal box δx·δy·δz centred at (x, y, z) with the mass flux through each of its six faces.
 * Face value = centre value ± (gradient × half the edge) — a first-order Taylor expansion.
 */
export function CubeFluxDiagram() {
  const [mode, setMode] = useState<Mode>('all')
  const uid = useUid('cube')
  const on = (a: Axis) => mode === 'all' || mode === a
  const op = (a: Axis) => (on(a) ? 1 : 0.16)

  // vertices
  const v = (x: number, y: number, z: number) => P(x, y, z)
  const front = poly(v(-1, -1, 1), v(1, -1, 1), v(1, 1, 1), v(-1, 1, 1))
  const top = poly(v(-1, 1, 1), v(1, 1, 1), v(1, 1, -1), v(-1, 1, -1))
  const right = poly(v(1, -1, 1), v(1, -1, -1), v(1, 1, -1), v(1, 1, 1))
  const hidden: [[number, number, number], [number, number, number]][] = [
    [[-1, -1, -1], [1, -1, -1]],
    [[-1, -1, -1], [-1, 1, -1]],
    [[-1, -1, -1], [-1, -1, 1]],
  ]

  const arrow = (from: [number, number, number], to: [number, number, number], a: Axis, dashed = false) => {
    const [x1, y1] = P(...from)
    const [x2, y2] = P(...to)
    return (
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={AX[a]}
        strokeWidth={3.2}
        strokeDasharray={dashed ? '6 4' : undefined}
        markerEnd={`url(#${uid}-${a})`}
        opacity={op(a)}
      />
    )
  }
  const label = (p: [number, number], text: string, a: Axis, anchor: 'start' | 'middle' | 'end' = 'middle') => (
    <text x={p[0]} y={p[1]} textAnchor={anchor} fill={AX[a]} opacity={op(a)} fontSize={14} fontWeight={700} paintOrder="stroke" stroke="var(--surface)" strokeWidth={3}>
      {text}
    </text>
  )

  const c0 = P(0, 0, 0)
  return (
    <div className="space-y-3">
      <Segmented<Mode>
        label="Highlight a pair of faces"
        value={mode}
        onChange={setMode}
        options={[
          { value: 'all', label: 'all six faces' },
          { value: 'x', label: '$x$-faces' },
          { value: 'y', label: '$y$-faces' },
          { value: 'z', label: '$z$-faces' },
        ]}
      />
      <svg viewBox="0 0 400 300" className="mx-auto block h-auto w-full max-w-[560px]" role="img" aria-label="Differential control volume with mass fluxes on its six faces">
        <defs>
          <ArrowMarkers id={uid} colors={{ x: AX.x, y: AX.y, z: AX.z }} size={4.5} />
        </defs>
        {/* axes triad */}
        <g opacity={0.9}>
          <line x1={30} y1={282} x2={70} y2={282} stroke="var(--ink-3)" strokeWidth={1.4} markerEnd={`url(#${uid}-x)`} />
          <line x1={30} y1={282} x2={30} y2={244} stroke="var(--ink-3)" strokeWidth={1.4} markerEnd={`url(#${uid}-y)`} />
          <line x1={30} y1={282} x2={12} y2={296} stroke="var(--ink-3)" strokeWidth={1.4} markerEnd={`url(#${uid}-z)`} />
          <text x={76} y={286} fontSize={12} className="fill-ink-2" fontStyle="italic">x</text>
          <text x={26} y={239} fontSize={12} className="fill-ink-2" fontStyle="italic">y</text>
          <text x={2} y={292} fontSize={12} className="fill-ink-2" fontStyle="italic">z</text>
        </g>

        {/* inflow arrows (into hidden faces) drawn first so the translucent cube sits over them */}
        {arrow([-2.35, 0, 0], [-1, 0, 0], 'x')}
        {arrow([0, -2.15, 0], [0, -1, 0], 'y')}
        {arrow([0, 0, -3.1], [0, 0, -1], 'z', true)}

        {/* hidden edges */}
        {hidden.map(([a, b], i) => {
          const [x1, y1] = P(...a)
          const [x2, y2] = P(...b)
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--ink-3)" strokeWidth={1.1} strokeDasharray="4 4" />
        })}
        {/* visible faces */}
        <polygon points={right} fill="var(--plot-2)" fillOpacity={0.1} stroke="var(--ink-2)" strokeWidth={1.4} strokeLinejoin="round" />
        <polygon points={top} fill="var(--plot-2)" fillOpacity={0.17} stroke="var(--ink-2)" strokeWidth={1.4} strokeLinejoin="round" />
        <polygon points={front} fill="var(--plot-2)" fillOpacity={0.12} stroke="var(--ink-2)" strokeWidth={1.6} strokeLinejoin="round" />

        {/* centre */}
        <circle cx={c0[0]} cy={c0[1]} r={3.6} fill="var(--ink)" />
        <text x={c0[0] + 7} y={c0[1] - 6} fontSize={12} className="fill-ink" fontStyle="italic" paintOrder="stroke" stroke="var(--surface)" strokeWidth={3}>
          (x, y, z)
        </text>

        {/* outflow arrows (from visible faces) */}
        {arrow([1, 0, 0], [2.35, 0, 0], 'x')}
        {arrow([0, 1, 0], [0, 2.2, 0], 'y')}
        {arrow([0, 0, 1], [0, 0, 3.0], 'z')}

        {/* labels */}
        {label([P(-2.35, 0, 0)[0] + 2, P(-2.35, 0, 0)[1] - 10], 'x in', 'x', 'start')}
        {label([P(2.35, 0, 0)[0] - 2, P(2.35, 0, 0)[1] - 10], 'x out', 'x', 'end')}
        {label([P(0, -2.15, 0)[0] + 10, P(0, -2.15, 0)[1] - 2], 'y in', 'y', 'start')}
        {label([P(0, 2.2, 0)[0] + 10, P(0, 2.2, 0)[1] + 12], 'y out', 'y', 'start')}
        {label([P(0, 0, -3.1)[0] + 8, P(0, 0, -3.1)[1] + 4], 'z in', 'z', 'start')}
        {label([P(0, 0, 3.0)[0] - 6, P(0, 0, 3.0)[1] + 4], 'z out', 'z', 'end')}

        {/* dimensions */}
        {(() => {
          const a = P(-1, -1, 1)
          const b = P(1, -1, 1)
          const c = P(-1, 1, 1)
          const e = P(1, -1, -1)
          return (
            <g fontSize={13} fontStyle="italic" className="fill-ink-2">
              <text x={(a[0] + b[0]) / 2 + 22} y={a[1] + 17} textAnchor="middle">δx</text>
              <text x={a[0] - 8} y={(a[1] + c[1]) / 2 + 26} textAnchor="end">δy</text>
              <text x={(b[0] + e[0]) / 2 + 10} y={(b[1] + e[1]) / 2 + 14}>δz</text>
            </g>
          )
        })()}
      </svg>

      <div className="grid gap-2 sm:grid-cols-3">
        {(['x', 'y', 'z'] as Axis[]).map((a) => {
          const f = FACE_TEXT[a]
          return (
            <div
              key={a}
              className={cx('rounded-xl border px-3 py-2 text-sm transition', on(a) ? 'border-line bg-surface' : 'border-line/60 bg-surface-2/40 opacity-50')}
              style={on(a) && mode !== 'all' ? { boxShadow: `inset 3px 0 0 ${AX[a]}` } : undefined}
            >
              <div className="mb-1 font-semibold" style={{ color: AX[a] }}>
                {a}-faces · area <Md inline>{`$${f.area}$`}</Md>
              </div>
              <Md className="md-tight text-ink-2">
                {md`in at $${a}-\tfrac{${f.d}}{2}$: $\;${f.flux}-\pd{(${f.flux})}{${a}}\tfrac{${f.d}}{2}$

out at $${a}+\tfrac{${f.d}}{2}$: $\;${f.flux}+\pd{(${f.flux})}{${a}}\tfrac{${f.d}}{2}$`}
              </Md>
            </div>
          )
        })}
      </div>
      <MathBlock tex={bookkeeping(mode)} />
      <p className="text-xs text-ink-3">
        Arrows are drawn for positive <i>u</i>, <i>v</i>, <i>w</i>; the algebra (out − in) holds for any signs. Dashed: the arrow into the hidden back face.
      </p>
    </div>
  )
}
