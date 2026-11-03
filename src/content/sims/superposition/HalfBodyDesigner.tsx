import { useMemo, useState } from 'react'
import { FlowField, md, SimPanel, Slider, Toggle, type FlowMarker } from '@/kit'
import { bodyOutline, bOf, insideHalfBody, phiUS, psiUS, toPath, velUS, type Box } from './halfbody'
import { ArrowLine, Label } from './svg'
import { Tiles } from './Tiles'

const X: [number, number] = [-3, 7]
const Y: [number, number] = [-3, 3]
const BOX: Box = [X[0], X[1], Y[0], Y[1]]

/**
 * Half-body designer: uniform flow U + line source m. Streamlines (equal Δψ = 0.3U, so their spacing far
 * upstream is 0.3 m), the dividing streamline ψ = m/2 = πbU, the stagnation point, the asymptotes y = ±πb,
 * tracers, optional speed map, and a "solid body" switch that replaces the dividing streamline by a wall.
 */
export function HalfBodyDesigner() {
  const [U, setU] = useState(2)
  const [m, setM] = useState(6)
  const [solid, setSolid] = useState(true)
  const [heat, setHeat] = useState(false)
  const [phiOn, setPhiOn] = useState(false)
  const b = bOf(U, m)

  const f = useMemo(() => {
    const dpsi = 0.3 * U
    const K = Math.min(45, Math.ceil(Math.max(m / 2, 3.1 * U) / dpsi) + 1)
    const levels: number[] = []
    for (let j = -K; j <= K; j++) if (j !== 0) levels.push(m / 2 + j * dpsi)
    const markers: FlowMarker[] = [
      { x: -b, y: 0, kind: 'stagnation', label: 'S' },
      { x: 0, y: 0, kind: 'source' },
    ]
    return {
      psi: psiUS(U, m),
      phi: phiUS(U, m),
      vel: velUS(U, m),
      inside: insideHalfBody(b),
      levels,
      markers,
      outline: bodyOutline(b, X[1] + 2, BOX, 0.02),
    }
  }, [U, m, b])

  const pb = Math.PI * b
  const overlay = ({ sx, sy }: { sx: (v: number) => number; sy: (v: number) => number }) => {
    const bPx = sx(0) - sx(-b)
    const yDim = -Math.min(0.35 * b, 0.6)
    return (
      <g pointerEvents="none">
        {/* dividing streamline ψ = m/2 = πbU drawn exactly (upstream axis + body outline); a FlowField highlight contour
            would also trace the +x axis inside the body when m < 1.2U (θ's 2π jump is then below the branch-cut filter) */}
        <path d={toPath(f.outline, sx, sy, true)} fill={solid ? 'var(--body-fill)' : 'var(--plot-3)'} fillOpacity={solid ? 1 : 0.1} stroke="var(--plot-4)" strokeWidth={2.4} />
        <line x1={sx(X[0])} y1={sy(0)} x2={sx(-b)} y2={sy(0)} stroke="var(--plot-4)" strokeWidth={2.4} strokeLinecap="round" />
        <Label x={sx(X[0]) + 6} y={sy(0) - 8} size={11} className="fill-rose-700 dark:fill-rose-300">
          ψ = m/2 = πbU
        </Label>
        {pb < Y[1] - 0.05
          ? [pb, -pb].map((yy) => (
              <g key={yy}>
                <line x1={sx(0.5)} x2={sx(X[1])} y1={sy(yy)} y2={sy(yy)} stroke="var(--ink-2)" strokeDasharray="5 4" strokeWidth={1.2} />
                <Label x={sx(X[1]) - 6} y={sy(yy) + (yy > 0 ? -6 : 15)} anchor="end" size={12} italic>
                  {yy > 0 ? 'y = +πb' : 'y = −πb'}
                </Label>
              </g>
            ))
          : null}
        {bPx > 26 ? (
          <g>
            <ArrowLine x1={sx(-b / 2)} y1={sy(yDim)} x2={sx(-b)} y2={sy(yDim)} color="var(--ink)" width={1.2} head={6} />
            <ArrowLine x1={sx(-b / 2)} y1={sy(yDim)} x2={sx(0)} y2={sy(yDim)} color="var(--ink)" width={1.2} head={6} />
            <Label x={sx(-b / 2)} y={sy(yDim) + 14} anchor="middle" size={12} italic>
              b
            </Label>
          </g>
        ) : null}
      </g>
    )
  }

  return (
    <SimPanel
      title="Half-body designer"
      subtitle="uniform flow + line source"
      controls={
        <>
          <Slider label="free-stream speed $U$" value={U} min={0.5} max={5} step={0.1} onChange={setU} unit="m/s" digits={2} />
          <Slider label="source strength $m$" value={m} min={0.5} max={10} step={0.1} onChange={setM} unit="m²/s" digits={3} />
          <Toggle label="solid body (wall on $\psi = \pi bU$)" checked={solid} onChange={setSolid} />
          <Toggle label="speed map $\lvert\vb{V}\rvert/U$" checked={heat} onChange={setHeat} />
          <Toggle label="equipotentials $\phi$ = const" checked={phiOn} onChange={setPhiOn} />
        </>
      }
      readout={
        <Tiles
          cols={2}
          items={[
            { label: md`$b = m/2\pi U$`, value: b, unit: 'm', tone: 'accent' },
            { label: md`stagnation pt $x_s = -b$`, value: -b, unit: 'm' },
            { label: md`$\psi_{\text{body}} = m/2 = \pi bU$`, value: m / 2, unit: 'm²/s' },
            { label: md`half-width above source $\pi b/2$`, value: pb / 2, unit: 'm' },
            { label: md`half-width far downstream $\pi b$`, value: pb, unit: 'm' },
            { label: md`total width $2\pi b = m/U$`, value: 2 * pb, unit: 'm', tone: 'accent' },
          ]}
        />
      }
      footer={
        <span>
          <b>Try this:</b> double m at fixed U — b, the nose distance and both widths double (a scaled copy of the same shape). Then double U
          too: the original shape returns, because only m/U matters for the geometry; U just sets the speeds. Switch off “solid body” to see
          the source fluid filling the body, and hover anywhere to read u, v, ψ and Cp = 1 − V²/U².
        </span>
      }
      wide
    >
      <FlowField
        x={X}
        y={Y}
        psi={f.psi}
        phi={phiOn ? f.phi : undefined}
        equipotentials={phiOn}
        vel={f.vel}
        psiLevels={f.levels}
        body={solid ? f.inside : undefined}
        markers={f.markers}
        particles={110}
        heatmap={heat}
        Uref={U}
        overlay={overlay}
      />
      <p className="mt-1 text-center text-[11px] text-ink-3">Axes x, y in m, source at the origin; streamlines drawn every Δψ = 0.3U (0.3 m apart far upstream).</p>
    </SimPanel>
  )
}
