import { useState } from 'react'
import { Plot, Readout, Segmented, SimPanel, Slider, Toggle, md, useUid, type ReadoutItem, type Series } from '@/kit'
import { ArrowDefs, f2, polyPath, type Pt } from './svg'

/*
 * Draining-tank vortex (Lecture 12, slide 19). Free-surface elevation relative to the undisturbed far-field level:
 *   free vortex           z_s = −Γ² / (8π² r² g)
 *   Rankine core (r ≤ R)  z_s = −Γ² / (8π² R² g) · (2 − r²/R²)
 * Drawn to true scale in a vertical section through the axis.
 */

export const TANK = { W: 0.18, H: 0.25, RD: 0.025, PIPE: 0.05, TOP: 0.05 }
const PX = 1000 // px per metre (true scale)
const M0 = 12
const X = (r: number) => M0 + PX * (TANK.W + r)
const Z = (z: number) => M0 + PX * (TANK.TOP - z)

/** Free-surface elevation (m) at radius r for circulation G, gravity g and optional Rankine core radius R. */
export function surfaceZ(r: number, G: number, g: number, R: number | null): number {
  const a = Math.abs(r)
  const k = (G * G) / (8 * Math.PI * Math.PI * g)
  if (R && a < R) return -(k / (R * R)) * (2 - (a * a) / (R * R))
  return -k / (a * a)
}

/** Radius at which the surface reaches the depth H below the far-field level (null if it never does). */
export function floorRadius(G: number, g: number, R: number | null, H = TANK.H): number | null {
  const rFree = G / (2 * Math.PI * Math.sqrt(2 * g * H))
  if (!R || rFree >= R) return rFree
  const dR = (G * G) / (8 * Math.PI * Math.PI * R * R * g)
  const x = 2 - H / dR
  return x > 0 ? R * Math.sqrt(x) : null
}

export function TankDrawing({ G, g, R = null, probe = null, labels = true }: { G: number; g: number; R?: number | null; probe?: number | null; labels?: boolean }) {
  const uid = useUid('tank')
  const { W, H, RD, PIPE } = TANK
  const rc = floorRadius(G, g, R)
  const zFloor = -H
  const zPipe = -H - PIPE
  const n = 140
  const side = (sgn: 1 | -1): Pt[] => {
    const r0 = rc ?? 0
    const pts: Pt[] = []
    for (let i = 0; i <= n; i++) {
      const u = i / n
      const r = r0 + (W - r0) * u * u
      const z = Math.max(zFloor, surfaceZ(Math.max(r, 1e-6), G, g, R))
      pts.push([X(sgn * r), Z(z)])
    }
    return pts
  }
  const right = side(1)
  const left = side(-1).reverse() // from the left wall towards the axis
  let water: string[]
  let funnelHitsFloor = false
  if (rc == null) {
    // continuous surface, water fills the drain pipe as well
    const surf = [...left, ...right.slice(1)]
    water = [
      polyPath(
        [...surf, [X(W), Z(zFloor)], [X(RD), Z(zFloor)], [X(RD), Z(zPipe)], [X(-RD), Z(zPipe)], [X(-RD), Z(zFloor)], [X(-W), Z(zFloor)]],
        true,
      ),
    ]
  } else if (rc <= RD) {
    // air core runs down into the drain
    water = [
      polyPath([...left, [X(-rc), Z(zPipe)], [X(-RD), Z(zPipe)], [X(-RD), Z(zFloor)], [X(-W), Z(zFloor)]], true),
      polyPath([...right, [X(W), Z(zFloor)], [X(RD), Z(zFloor)], [X(RD), Z(zPipe)], [X(rc), Z(zPipe)]], true),
    ]
  } else {
    funnelHitsFloor = true
    water = [
      polyPath([...left, [X(-W), Z(zFloor)]], true),
      polyPath([...right, [X(W), Z(zFloor)]], true),
    ]
  }
  const surfLine = rc == null ? polyPath([...left, ...right.slice(1)]) : `${polyPath(left)}${polyPath(right)}`
  const zp = probe != null ? Math.max(zFloor, surfaceZ(probe, G, g, R)) : 0
  const p1: Pt = [X(W - 0.02), Z(surfaceZ(W - 0.02, G, g, R))]
  const ySwirl = Z(-0.14)
  const rx = 46

  return (
    <svg viewBox="0 0 384 388" className="mx-auto block h-auto w-full max-w-[420px]" role="img" aria-label="Vertical section through a draining-tank vortex showing the depressed free surface">
      <ArrowDefs id={uid} colors={{ ink: 'var(--ink-2)', acc: 'var(--plot-3)' }} size={7} />
      {water.map((d, i) => (
        <path key={i} d={d} fill="var(--plot-2)" fillOpacity={0.2} stroke="none" />
      ))}
      <path d={surfLine} fill="none" stroke="var(--plot-2)" strokeWidth={2.2} strokeLinejoin="round" />
      {/* far-field level (datum) */}
      <line x1={X(-W)} x2={X(W)} y1={Z(0)} y2={Z(0)} stroke="var(--ink-3)" strokeDasharray="6 4" strokeWidth={1} />
      {/* tank walls, floor and drain pipe */}
      <path
        d={`M${X(-W)} ${Z(TANK.TOP - 0.005)}V${Z(zFloor)}H${X(-RD)}V${Z(zPipe)}M${X(W)} ${Z(TANK.TOP - 0.005)}V${Z(zFloor)}H${X(RD)}V${Z(zPipe)}`}
        fill="none"
        stroke="var(--ink-2)"
        strokeWidth={3}
        strokeLinejoin="round"
      />
      {/* swirl indicator */}
      <path d={`M${X(0) - rx} ${ySwirl}A${rx} 9 0 0 1 ${X(0) + rx} ${ySwirl}`} fill="none" stroke="var(--ink-2)" strokeWidth={1} strokeDasharray="3 3" />
      <path d={`M${X(0) - rx} ${ySwirl}A${rx} 9 0 0 0 ${X(0) + rx - 2} ${ySwirl + 1}`} fill="none" stroke="var(--ink-2)" strokeWidth={2} markerEnd={`url(#${uid}-ink)`} />
      {labels ? (
        <g className="text-[11.5px]" fill="var(--ink-2)">
          <text x={X(-W) + 6} y={Z(0) - 7}>far-field level, z = 0</text>
          <circle cx={p1[0]} cy={p1[1]} r={3.5} fill="var(--ink)" />
          <text x={p1[0] - 4} y={p1[1] - 9} textAnchor="end" className="font-semibold" fill="var(--ink)">1: V ≈ 0</text>
          <text x={X(0) + rx + 6} y={ySwirl + 4}>swirl</text>
          {rc != null ? (
            <text x={X(0) + 8} y={Z(-0.205)} fill="var(--ink-3)">air core</text>
          ) : null}
          <text x={X(0)} y={Z(zPipe) + 17} textAnchor="middle" fill="var(--ink-3)">drain ↓</text>
        </g>
      ) : null}
      {probe != null ? (
        <g>
          <line x1={X(probe)} x2={X(probe)} y1={Z(0)} y2={Z(zp)} stroke="var(--plot-3)" strokeWidth={1.8} markerStart={`url(#${uid}-acc)`} markerEnd={`url(#${uid}-acc)`} />
          <circle cx={X(probe)} cy={Z(zp)} r={3.8} fill="var(--plot-3)" stroke="var(--surface)" strokeWidth={1.5} />
          <text x={X(probe) + 7} y={Math.max(Z(0) + 14, (Z(0) + Z(zp)) / 2 + 4)} className="text-[11.5px] font-semibold" fill="var(--ink)" paintOrder="stroke" stroke="var(--surface)" strokeWidth={3}>
            2: z<tspan dy={3} className="text-[8.5px]">s</tspan>
            <tspan dy={-3}> = {(1000 * zp).toFixed(zp > -0.01 ? 2 : 1)} mm</tspan>
          </text>
        </g>
      ) : null}
      {funnelHitsFloor ? (
        <text x={192} y={Z(zFloor) - 10} textAnchor="middle" className="text-[11.5px] font-semibold" fill="var(--plot-4)" paintOrder="stroke" stroke="var(--surface)" strokeWidth={3}>
          funnel reaches the floor — the free-vortex model has broken down
        </text>
      ) : null}
      <text x={X(-W) + 2} y={Z(zFloor) + 18} className="text-[10.5px]" fill="var(--ink-3)">true scale</text>
      {/* 5 cm scale bar (the drawing is 1000 px per metre) */}
      <path
        d={`M${X(-W) + 2} ${Z(zFloor) + 26}v8M${X(-W) + 2} ${Z(zFloor) + 30}h${PX * 0.05}M${X(-W) + 2 + PX * 0.05} ${Z(zFloor) + 26}v8`}
        fill="none"
        stroke="var(--ink-3)"
        strokeWidth={1.4}
      />
      <text x={X(-W) + 8 + PX * 0.05} y={Z(zFloor) + 34} className="text-[10.5px]" fill="var(--ink-3)">5 cm</text>
    </svg>
  )
}

const GRAV: Record<string, number> = { earth: 9.81, mars: 3.71, moon: 1.62 }

export function DrainingTankSim() {
  const [G, setG] = useState(0.12)
  const [rp, setRp] = useState(0.04)
  const [planet, setPlanet] = useState<'earth' | 'mars' | 'moon'>('earth')
  const [rankine, setRankine] = useState(false)
  const [Rc, setRc] = useState(0.02)
  const g = GRAV[planet]
  const R = rankine ? Rc : null
  const zp = surfaceZ(rp, G, g, R)
  const vth = rp >= (R ?? 0) ? G / (2 * Math.PI * rp) : (G * rp) / (2 * Math.PI * Rc * Rc)
  // radius at which the surface is 10 mm below the far-field level (inside a Rankine core the paraboloid applies;
  // null when even the axis is shallower than 10 mm)
  const r10 = floorRadius(G, g, R, 0.01)
  const rc = floorRadius(G, g, R)

  const series: Series[] = [
    { label: md`free vortex $-\Gamma^2/(8\pi^2 r^2 g)$`, fn: (x) => 1000 * surfaceZ(x / 100, G, g, null), range: [0.15, 18], color: 'var(--plot-2)', width: 2.4, dash: rankine ? '6 4' : undefined },
  ]
  if (rankine)
    series.push({ label: 'with a Rankine core', fn: (x) => 1000 * surfaceZ(x / 100, G, g, Rc), color: 'var(--plot-4)', width: 2.6, samples: 500 })

  const items: ReadoutItem[] = [
    { label: md`$v_\theta$ at $r_p$`, value: vth, unit: 'm/s' },
    { label: md`$z_s$ at $r_p$`, value: 1000 * zp, unit: 'mm', tone: 'accent' },
    { label: md`$z_s$ at $r_p$ if $\Gamma$ doubled`, value: 1000 * surfaceZ(rp, 2 * G, g, R), unit: 'mm' },
    { label: 'radius where the dip is 10 mm', value: r10 == null ? '—' : 100 * r10, unit: r10 == null ? undefined : 'cm' },
    rc != null
      ? { label: 'air core radius at the floor', value: 100 * rc, unit: 'cm' }
      : { label: 'deepest point (axis)', value: 1000 * surfaceZ(0, G, g, Rc), unit: 'mm', tone: 'good' },
  ]

  return (
    <SimPanel
      title="Draining-tank free surface"
      subtitle={md`$z_s = -\Gamma^2/(8\pi^2 r^2 g)$`}
      wide
      controls={
        <>
          <Slider label={md`circulation $\Gamma$`} value={G} min={0.02} max={0.3} step={0.005} onChange={setG} unit="m²/s" digits={3} />
          <Slider label={md`probe radius $r_p$`} value={rp} min={0.01} max={0.17} step={0.001} onChange={setRp} unit="m" digits={3} />
          <Segmented<'earth' | 'mars' | 'moon'>
            label={md`gravity $g$`}
            value={planet}
            onChange={setPlanet}
            options={[
              { value: 'earth', label: 'Earth 9.81' },
              { value: 'mars', label: 'Mars 3.71' },
              { value: 'moon', label: 'Moon 1.62' },
            ]}
          />
          <Toggle label="Rankine core (finite dip)" checked={rankine} onChange={setRankine} />
          {rankine ? <Slider label={md`core radius $R$`} value={Rc} min={0.005} max={0.05} step={0.001} onChange={setRc} unit="m" digits={3} /> : null}
        </>
      }
      readout={<Readout items={items} />}
      footer="Try this: note z_s at the probe, then double Γ (e.g. 0.10 → 0.20 m²/s) — the dip becomes four times deeper (z_s ∝ Γ²). Halve the probe radius: again four times deeper (∝ 1/r²). Switch on the Rankine core: the bottomless funnel becomes a finite dimple whose centre is exactly twice as deep as the free-vortex surface at r = R."
    >
      <TankDrawing G={G} g={g} R={R} probe={rp} />
      <div className="mt-3">
        <Plot
          x={{ label: md`radius $r$ (cm)`, domain: [0, 18] }}
          y={{ label: md`surface elevation $z_s$ (mm)`, domain: [-260, 10] }}
          series={series}
          hlines={[{ y: -1000 * TANK.H, label: 'tank floor', color: 'var(--ink-3)' }, { y: 0, color: 'var(--axis)', dash: '2 3' }]}
          vlines={rankine ? [{ x: 100 * Rc, label: 'r = R', color: 'var(--plot-4)' }] : []}
          marks={[{ x: 100 * rp, y: Math.max(-255, 1000 * zp), label: `${(1000 * zp).toFixed(1)} mm`, color: 'var(--plot-3)' }]}
          height={230}
        />
      </div>
    </SimPanel>
  )
}

/** Static cross-section for the "visual" step (Γ = 0.12 m²/s, water on Earth). */
export function TankFigure() {
  return <TankDrawing G={0.12} g={9.81} probe={0.035} />
}
