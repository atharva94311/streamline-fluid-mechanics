/**
 * Concept "nondimensional-equations": why Fox (p. 247) says the viscous terms can be dropped only "in most of the
 * flow". Dropping them leaves Euler's equations, which cannot satisfy no-slip; a real high-Re flow keeps a thin layer
 * next to the wall where the viscous term is NOT small. The layer thickness used here, δ ≈ 5x/√Re_x with a quartic
 * profile u/U = 2η − 2η³ + η⁴, is a standard laminar estimate — SUPPLEMENTARY, for illustration only.
 */
import { useMemo, useState } from 'react'
import { M, Segmented, SimPanel, Slider, Toggle, md, useUid } from '@/kit'
import { Arrow } from './svg'
import { SimBody, Tiles } from './ui'

const W = 420
const H = 210
const XL = 40 // leading edge (px)
const XR = 384 // trailing edge (px)
const YW = 168 // wall (px)
const TOP = 14
const PLATE = XR - XL
const U_PX = 30 // arrow length for the free-stream speed

const profile = (eta: number) => (eta >= 1 ? 1 : 2 * eta - 2 * eta ** 3 + eta ** 4)

export function BoundaryLayerSketch() {
  const clip = useUid('blclip')
  const [ReL, setReL] = useState(1e5)
  const [zoom, setZoom] = useState<1 | 10 | 100>(10)
  const [euler, setEuler] = useState(true)

  // δ(x)/L = 5 √(x/L) / √Re_L  → pixels, with the chosen vertical exaggeration
  const deltaPx = (xi: number) => (5 * Math.sqrt(Math.max(xi, 1e-6)) * PLATE * zoom) / Math.sqrt(ReL)
  const edge = useMemo(() => {
    const n = 80
    let d = ''
    for (let i = 0; i <= n; i++) {
      const xi = i / n
      const y = Math.max(TOP, YW - deltaPx(xi))
      d += `${i ? 'L' : 'M'}${(XL + xi * PLATE).toFixed(1)},${y.toFixed(1)}`
    }
    return d
  }, [ReL, zoom]) // eslint-disable-line react-hooks/exhaustive-deps

  const stations = [0.3, 0.65, 1]
  const dTE = 5 / Math.sqrt(ReL)

  return (
    <SimPanel
      title={'What “in most of the flow” means'}
      subtitle="flat plate: Euler (inviscid) solution vs. real viscous flow"
      footer={
        <>
          <strong>Try this:</strong> raise <M tex={md`Re_L`} /> from 10² to 10⁶ at true scale — the shaded viscous layer shrinks like{' '}
          <M tex={md`1/\sqrt{Re_L}`} /> but never disappears, because at the wall the velocity must be zero. The dashed Euler profile keeps its
          full speed right down to the wall: dropping the second-order terms has cost us the no-slip condition.
        </>
      }
    >
      <SimBody
        viz={
          <>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="boundary layer on a flat plate">
        <defs>
          <clipPath id={clip}>
            <rect x={0} y={TOP} width={W} height={YW - TOP} />
          </clipPath>
        </defs>
        {/* free stream */}
        {[40, 70, 100, 130].map((y) => (
          <Arrow key={y} x1={4} y1={y} x2={30} y2={y} color="var(--streamline)" width={1.6} head={5} />
        ))}
        <text x={6} y={28} className="fill-ink-2 text-[10px]">
          V∞
        </text>
        {/* viscous layer */}
        <g clipPath={`url(#${clip})`}>
          <path d={`${edge}L${XR},${YW}L${XL},${YW}Z`} fill="var(--plot-4)" fillOpacity={0.14} />
          <path d={edge} fill="none" stroke="var(--plot-4)" strokeWidth={1.4} strokeDasharray="5 3" />
          {stations.map((xi) => {
            const x0 = XL + xi * PLATE - U_PX - 4
            const dpx = deltaPx(xi)
            const top = TOP + 18
            const pts: string[] = []
            for (let k = 0; k <= 40; k++) {
              const y = YW - (k / 40) * (YW - top)
              const eta = (YW - y) / Math.max(dpx, 1e-6)
              pts.push(`${(x0 + U_PX * profile(eta)).toFixed(1)},${y.toFixed(1)}`)
            }
            const arrowsY = [0.04, 0.12, 0.25, 0.45, 0.7, 0.95].map((s) => YW - s * (YW - top))
            return (
              <g key={xi}>
                <line x1={x0} x2={x0} y1={top} y2={YW} stroke="var(--ink-3)" strokeWidth={1} />
                {arrowsY.map((y) => {
                  const u = profile((YW - y) / Math.max(dpx, 1e-6))
                  return u > 0.06 ? <Arrow key={y} x1={x0} y1={y} x2={x0 + U_PX * u} y2={y} color="var(--quiver)" width={1.2} head={4} /> : null
                })}
                <polyline points={pts.join(' ')} fill="none" stroke="var(--plot-1)" strokeWidth={2} />
                {euler ? <line x1={x0 + U_PX} x2={x0 + U_PX} y1={top} y2={YW} stroke="var(--plot-3)" strokeWidth={1.8} strokeDasharray="4 3" /> : null}
              </g>
            )
          })}
        </g>
        {/* plate */}
        <line x1={XL} x2={XR} y1={YW} y2={YW} stroke="var(--ink)" strokeWidth={3} />
        {Array.from({ length: 22 }, (_, i) => XL + 6 + i * 16).map((x) => (
          <line key={x} x1={x} x2={x - 8} y1={YW + 2} y2={YW + 10} stroke="var(--ink-3)" strokeWidth={1} />
        ))}
        <text x={XL} y={YW + 24} className="fill-ink-3 text-[10px]">
          leading edge
        </text>
        <text x={XR} y={YW + 24} textAnchor="end" className="fill-ink-3 text-[10px]">
          x = L
        </text>
        <text x={W / 2 + 10} y={YW + 36} textAnchor="middle" className="fill-ink-3 text-[9.5px]">
          {zoom === 1 ? 'true vertical scale' : `vertical scale exaggerated ×${zoom}`}
        </text>
      </svg>
      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-2">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-5" style={{ background: 'var(--plot-1)' }} aria-hidden /> real (viscous) velocity profile
        </span>
        {euler ? (
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block w-5 border-t-2 border-dashed" style={{ borderColor: 'var(--plot-3)' }} aria-hidden /> Euler (inviscid)
            solution — slips at the wall
          </span>
        ) : null}
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-5 rounded-sm" style={{ background: 'var(--plot-4)', opacity: 0.25 }} aria-hidden /> viscous layer
          δ(x)
        </span>
      </div>
      <p className="mt-1 text-xs text-ink-3">
        Illustration (supplementary): laminar estimate δ ≈ 5x/√Re_x and a quartic profile shape. At Re_L = 10² the &ldquo;thin&rdquo;
        layer is already half as thick as the plate is long (δ/L ≈ 0.5), and the boundary-layer picture itself breaks down.
      </p>
          </>
        }
        controls={
        <>
          <Slider label={md`plate Reynolds number $Re_L = \rho V_\infty L/\mu$`} value={ReL} min={100} max={1e6} log onChange={setReL} digits={2} />
          <Segmented
            label="vertical scale"
            value={zoom}
            onChange={setZoom}
            options={[
              { value: 1, label: 'true' },
              { value: 10, label: '×10' },
              { value: 100, label: '×100' },
            ]}
          />
          <Toggle label="show the Euler (inviscid) solution" checked={euler} onChange={setEuler} />
        </>
        }
        readout={
        <Tiles
          items={[
            { label: md`viscous coeff. $1/Re_L$`, value: 1 / ReL, digits: 2 },
            { label: md`layer thickness $\delta/L$ at the end`, value: dTE, digits: 2, tone: dTE > 0.3 ? 'bad' : 'accent' },
            { label: 'wall velocity, real flow', value: '0 (no slip)', tone: 'good' },
            { label: 'wall velocity, Euler', value: euler ? 'V∞ (slips!)' : '—', tone: euler ? 'bad' : 'default' },
          ]}
        />
        }
      />
    </SimPanel>
  )
}
