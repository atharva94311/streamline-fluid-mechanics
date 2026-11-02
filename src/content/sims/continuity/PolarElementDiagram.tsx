import { useState } from 'react'
import { Md, Readout, Segmented, Slider, md, useUid } from '@/kit'
import { AX, ArrowMarkers } from './shared'

/*
 * Plane sector element r…r+δr, θ…θ+δθ (unit depth) with purely radial flow.
 * Shaded bands = fluid that crosses the inner / outer face in a time τ (area ∝ volume flow rate).
 */
type Mode = 'const' | 'source' | 'linear'
const DR = 0.5 // m
const DTH = (22 * Math.PI) / 180
const TH1 = (26 * Math.PI) / 180
const TAU = 0.25 // s
const K = 66 // px per m
const O: [number, number] = [36, 272]

const VR: Record<Mode, { f: (r: number) => number; tex: string; exact: (r: number) => number }> = {
  const: { f: () => 1, tex: md`v_r = 1\ \text{m/s}`, exact: (r) => 1 / r },
  source: { f: (r) => 2 / r, tex: md`v_r = \dfrac{2}{r}\ \text{m/s}`, exact: () => 0 },
  linear: { f: (r) => 0.5 * r, tex: md`v_r = 0.5\,r\ \text{m/s}`, exact: () => 1 },
}

const pol = (r: number, th: number): [number, number] => [O[0] + K * r * Math.cos(th), O[1] - K * r * Math.sin(th)]
/** annular sector path between radii ra < rb and angles t1 < t2 */
function sector(ra: number, rb: number, t1: number, t2: number): string {
  const a = pol(ra, t1)
  const b = pol(rb, t1)
  const c = pol(rb, t2)
  const d = pol(ra, t2)
  return `M${a[0]} ${a[1]}L${b[0]} ${b[1]}A${K * rb} ${K * rb} 0 0 0 ${c[0]} ${c[1]}L${d[0]} ${d[1]}A${K * ra} ${K * ra} 0 0 1 ${a[0]} ${a[1]}Z`
}

export function PolarElementDiagram() {
  const [mode, setMode] = useState<Mode>('const')
  const [r, setR] = useState(1.5)
  const uid = useUid('pel')
  const R1 = r
  const R2 = r + DR
  const v1 = VR[mode].f(R1)
  const v2 = VR[mode].f(R2)
  const qIn = v1 * R1 * DTH
  const qOut = v2 * R2 * DTH
  const net = qOut - qIn
  const area = ((R2 * R2 - R1 * R1) / 2) * DTH
  const rc = r + DR / 2
  const exact = VR[mode].exact(rc)
  const TH2 = TH1 + DTH
  const mid = (TH1 + TH2) / 2
  const arrows = [TH1 + 0.2 * DTH, mid, TH2 - 0.2 * DTH]

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Segmented<Mode>
          label="Radial velocity profile"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'const', label: '$v_r$ = const' },
            { value: 'source', label: md`$v_r \propto 1/r$` },
            { value: 'linear', label: md`$v_r \propto r$` },
          ]}
        />
        <Slider label="element position $r$" value={r} min={0.8} max={2.8} step={0.1} onChange={setR} unit="m" digits={3} />
      </div>
      <svg viewBox="0 0 420 300" className="mx-auto block h-auto w-full max-w-[580px]" role="img" aria-label="Sector element in polar coordinates with radial fluxes">
        <defs>
          <ArrowMarkers id={uid} colors={{ in: AX.x, out: AX.pos, ax: 'var(--ink-3)' }} size={4} />
        </defs>
        {/* axes and rays */}
        <line x1={O[0]} y1={O[1]} x2={410} y2={O[1]} stroke="var(--ink-3)" strokeWidth={1.2} markerEnd={`url(#${uid}-ax)`} />
        <line x1={O[0]} y1={O[1]} x2={O[0]} y2={14} stroke="var(--ink-3)" strokeWidth={1.2} markerEnd={`url(#${uid}-ax)`} />
        <text x={404} y={O[1] + 16} fontSize={13} fontStyle="italic" className="fill-ink-2">x</text>
        <text x={O[0] - 14} y={22} fontSize={13} fontStyle="italic" className="fill-ink-2">y</text>
        {[TH1, TH2].map((t, i) => {
          const e = pol(4.3, t)
          return <line key={i} x1={O[0]} y1={O[1]} x2={e[0]} y2={e[1]} stroke="var(--grid)" strokeDasharray="4 4" />
        })}
        <path d={`M${pol(0.55, 0)[0]} ${pol(0.55, 0)[1]}A${K * 0.55} ${K * 0.55} 0 0 0 ${pol(0.55, TH1)[0]} ${pol(0.55, TH1)[1]}`} fill="none" stroke="var(--ink-3)" strokeWidth={1} />
        <text x={pol(0.72, TH1 / 2)[0]} y={pol(0.72, TH1 / 2)[1] + 4} fontSize={12} fontStyle="italic" className="fill-ink-3">θ</text>

        {/* fluid crossing the faces during τ */}
        <path d={sector(Math.max(0.05, R1 - v1 * TAU), R1, TH1, TH2)} fill={AX.x} fillOpacity={0.28} stroke={AX.x} strokeWidth={1} />
        <path d={sector(R2, R2 + v2 * TAU, TH1, TH2)} fill={AX.pos} fillOpacity={0.28} stroke={AX.pos} strokeWidth={1} />

        {/* the element */}
        <path d={sector(R1, R2, TH1, TH2)} fill="var(--plot-2)" fillOpacity={0.12} stroke="var(--ink)" strokeWidth={2} />

        {/* direction arrows */}
        {arrows.map((t, i) => {
          const a = pol(R1 - v1 * TAU * 0.9, t)
          const b = pol(R1 - 0.03, t)
          const c = pol(R2 + 0.03, t)
          const d = pol(R2 + v2 * TAU * 0.9, t)
          return (
            <g key={i}>
              <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={AX.x} strokeWidth={1.8} markerEnd={`url(#${uid}-in)`} />
              <line x1={c[0]} y1={c[1]} x2={d[0]} y2={d[1]} stroke={AX.pos} strokeWidth={1.8} markerEnd={`url(#${uid}-out)`} />
            </g>
          )
        })}

        {/* labels */}
        {(() => {
          const pIn = pol(R1, mid)
          const pOut = pol(R2 + v2 * TAU + 0.12, mid)
          const side = pol(rc, TH2)
          return (
            <g fontSize={12} fontWeight={600}>
              <text x={pIn[0] - 10} y={pIn[1] + 18} textAnchor="end" fill={AX.x} paintOrder="stroke" stroke="var(--surface)" strokeWidth={3}>
                in: r δθ
              </text>
              <text x={pOut[0] + 4} y={pOut[1] - 2} fill={AX.pos} paintOrder="stroke" stroke="var(--surface)" strokeWidth={3}>
                out: (r + δr) δθ
              </text>
              <text x={side[0] - 8} y={side[1] - 6} textAnchor="end" className="fill-ink-2" paintOrder="stroke" stroke="var(--surface)" strokeWidth={3}>
                side faces: δr
              </text>
            </g>
          )
        })()}
      </svg>
      <Readout
        cols={3}
        items={[
          { label: md`in: $v_r r\,\delta\theta$`, value: qIn, unit: 'm²/s', digits: 3 },
          { label: md`out: $v_r (r+\delta r)\,\delta\theta$`, value: qOut, unit: 'm²/s', digits: 3 },
          { label: 'net outflow', value: Math.abs(net) < 1e-12 ? 0 : net, unit: 'm²/s', digits: 3, tone: Math.abs(net) < 1e-12 ? 'good' : 'bad' },
          { label: 'net ÷ element area', value: Math.abs(net) < 1e-12 ? 0 : net / area, unit: '1/s', digits: 3 },
          { label: md`$\frac{1}{r}\frac{\partial(r v_r)}{\partial r}$ at centre`, value: exact, unit: '1/s', digits: 3 },
          { label: md`element: $\delta r$, $\delta\theta$`, value: `0.5 m, 22°`, unit: '' },
        ]}
      />
      <Md className="md-tight text-sm text-ink-2">
        {md`Shaded bands: the fluid that crosses the inner (blue) and outer (rose) faces in $\tau = 0.25$ s — their areas are proportional to the volume flow rates. Profile: $${VR[mode].tex}$. The outer face is longer than the inner one by the factor $(r + \delta r)/r$, so a **uniform** $v_r$ carries more fluid out than in: the element would have to gain volume. Only $v_r \propto 1/r$ keeps $r v_r$ — and hence the flow through every circle — constant.`}
      </Md>
    </div>
  )
}
