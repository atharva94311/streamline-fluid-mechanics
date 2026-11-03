/**
 * Paint-can bottom deflection: SVG recreation of the Lecture 13 slide 18 sketch and a similarity explorer.
 * The explorer needs numbers, so it uses a SUPPLEMENTARY model (not in Lecture 13): small-deflection theory of a
 * clamped circular plate under uniform pressure q = γh, δ = q a⁴ / (64 D_f), D_f = E d³ / [12(1 − ν²)], a = D/2, ν = 0.3,
 * i.e. δ/D = 3(1 − ν²)/256 · (h/D) · (D/d)³ · (γD/E).
 */
import { useState } from 'react'
import { Readout, SimPanel, Slider, Toggle } from '@/kit'
import { DimArrow, TeXLabel, Arrow } from './svg'

export const NU_PLATE = 0.3
/** δ/D from the clamped-plate model. */
export const deflectionRatio = (hD: number, dD: number, EDg: number, nu = NU_PLATE) => ((3 * (1 - nu * nu)) / 256) * hD * dD ** -3 * (1 / EDg)

/** One can drawn in a local frame: (x, y) = bottom-left corner of the can, w = width in px. */
function Can({
  x, y, w, fill, sag, labels = true, tag,
}: {
  x: number
  y: number
  w: number
  /** paint depth / can height, 0..1 */
  fill: number
  /** drawn sag in px */
  sag: number
  labels?: boolean
  tag?: string
}) {
  const H = w * 1.15
  const top = y - H
  const surf = y - fill * H
  const ry = w * 0.09
  return (
    <g>
      {/* paint */}
      <path
        d={`M ${x} ${surf} L ${x} ${y} Q ${x + w / 2} ${y + 2 * sag} ${x + w} ${y} L ${x + w} ${surf} Z`}
        fill="var(--plot-6)"
        fillOpacity={0.28}
      />
      {/* walls */}
      <line x1={x} y1={top} x2={x} y2={y} stroke="var(--ink-2)" strokeWidth={2.2} />
      <line x1={x + w} y1={top} x2={x + w} y2={y} stroke="var(--ink-2)" strokeWidth={2.2} />
      <ellipse cx={x + w / 2} cy={top} rx={w / 2} ry={ry} fill="none" stroke="var(--ink-3)" strokeWidth={1.2} />
      {/* free surface: dashed upper half-ellipse as on the slide */}
      <path d={`M ${x} ${surf} A ${w / 2} ${ry} 0 0 1 ${x + w} ${surf}`} fill="none" stroke="var(--plot-4)" strokeWidth={1.6} strokeDasharray="6 4" />
      {/* undeflected bottom (solid) and deflected bottom (dashed) */}
      <line x1={x} y1={y} x2={x + w} y2={y} stroke="var(--plot-4)" strokeWidth={2} />
      <path d={`M ${x} ${y} Q ${x + w / 2} ${y + 2 * sag} ${x + w} ${y}`} fill="none" stroke="var(--plot-4)" strokeWidth={2} strokeDasharray="5 3" />
      {labels ? (
        <g>
          <TeXLabel x={x + w * 0.72} y={surf + 14} tex="\gamma" w={20} />
          <DimArrow x1={x + w + 14} y1={surf} x2={x + w + 14} y2={y} color="var(--ink-2)" />
          <line x1={x + w + 8} x2={x + w + 20} y1={surf} y2={surf} stroke="var(--ink-2)" />
          <line x1={x + w + 8} x2={x + w + 20} y1={y} y2={y} stroke="var(--ink-2)" />
          <TeXLabel x={x + w + 20} y={(surf + y) / 2} tex="h" w={20} />
          <TeXLabel x={x + 4} y={y - 12} tex="E,\ d" w={50} />
          <Arrow x1={x + w / 2} y1={y - 22} x2={x + w / 2} y2={y - 1} color="var(--ink)" head={5} />
          <Arrow x1={x + w / 2} y1={y + 2 * sag + 22} x2={x + w / 2} y2={y + sag + 1} color="var(--ink)" head={5} />
          <TeXLabel x={x + w / 2 + 6} y={y + sag + 18} tex="\delta" w={20} />
          <line x1={x} x2={x} y1={y + 8} y2={y + 2 * sag + 40} stroke="var(--ink-3)" strokeWidth={0.8} />
          <line x1={x + w} x2={x + w} y1={y + 8} y2={y + 2 * sag + 40} stroke="var(--ink-3)" strokeWidth={0.8} />
          <DimArrow x1={x} y1={y + 2 * sag + 34} x2={x + w} y2={y + 2 * sag + 34} color="var(--ink-2)" />
          <TeXLabel x={x + w / 2} y={y + 2 * sag + 46} tex="D" w={20} anchor="middle" />
        </g>
      ) : null}
      {tag ? (
        <text x={x + w / 2} y={top - ry - 8} textAnchor="middle" className="fill-ink-2 text-[12px] font-semibold">
          {tag}
        </text>
      ) : null}
    </g>
  )
}

/** Static recreation of the slide 18 sketch. */
export function PaintCanFigure() {
  return (
    <svg viewBox="0 0 320 300" className="mx-auto h-auto w-full max-w-[360px]" role="img" aria-label="Paint can of diameter D filled to depth h; the bottom of thickness d and modulus E deflects by delta at its centre">
      <Can x={70} y={220} w={150} fill={0.8} sag={9} />
    </svg>
  )
}

export function PaintCanLab() {
  const [D, setD] = useState(0.17)
  const [h, setH] = useState(0.15)
  const [dmm, setDmm] = useState(0.8)
  const [gk, setGk] = useState(12)
  const [EG, setEG] = useState(200)
  const [lam, setLam] = useState(0.5)
  const [match, setMatch] = useState(true)

  const hE = Math.min(h, 1.1 * D)
  const d = dmm / 1000
  const gamma = gk * 1000
  const E = EG * 1e9
  const pi = [hE / D, d / D, E / (D * gamma)]
  const r1p = deflectionRatio(pi[0], pi[1], pi[2])
  const deltaP = r1p * D

  const Dm = lam * D
  const Em = match ? lam * E : E
  const pim = [(lam * hE) / Dm, (lam * d) / Dm, Em / (Dm * gamma)]
  const r1m = deflectionRatio(pim[0], pim[1], pim[2])
  const deltaM = r1m * Dm
  const predicted = deltaM / lam

  const scalePx = 200 / 0.3 // px per metre for drawing
  const wP = D * scalePx
  const wM = Dm * scalePx
  const sagPx = (r: number, w: number) => Math.min(30, 4 + 900 * r * (w / 150))
  const xM = 40 + wP + 80
  const VW = xM + wM + 30
  const base = 1.15 * wP + 40
  const VH = base + 80

  return (
    <SimPanel
      title="Paint-can similarity explorer"
      subtitle="prototype vs scale model"
      wide
      controls={
        <>
          <Slider label="can diameter $D$" value={D} min={0.1} max={0.3} onChange={setD} unit="m" digits={3} />
          <Slider label="paint depth $h$" value={hE} min={0.01} max={1.1 * D} onChange={setH} unit="m" digits={3} />
          <Slider label="bottom thickness $d$" value={dmm} min={0.3} max={1.5} onChange={setDmm} unit="mm" digits={2} />
          <Slider label="specific weight $\gamma$" value={gk} min={8} max={16} onChange={setGk} unit="kN/m³" digits={3} />
          <Slider label="modulus $E$" value={EG} min={50} max={210} onChange={setEG} unit="GPa" digits={3} />
          <Slider label="model scale $\lambda = D_m/D$" value={lam} min={0.2} max={1} onChange={setLam} digits={2} />
          <Toggle label="match $E/(D\gamma)$ in the model ($E_m = \lambda E$)" checked={match} onChange={setMatch} />
        </>
      }
      readout={
        <Readout
          cols={2}
          items={[
            { label: '$\\Pi_2 = h/D$', value: pi[0] },
            { label: '$\\Pi_3 = d/D$', value: pi[1] },
            { label: '$\\Pi_4$ prototype', value: pi[2] },
            { label: '$\\Pi_4$ model', value: pim[2], tone: Math.abs(pim[2] / pi[2] - 1) < 1e-9 ? 'good' : 'bad' },
            { label: '$\\delta/D$ prototype', value: r1p },
            { label: '$\\delta_m/D_m$ model', value: r1m, tone: Math.abs(r1m / r1p - 1) < 1e-9 ? 'good' : 'bad' },
            { label: '$\\delta$ prototype', value: deltaP * 1000, unit: 'mm' },
            { label: '$\\delta_m$ model', value: deltaM * 1000, unit: 'mm' },
            { label: 'predicted $\\delta = \\delta_m/\\lambda$', value: predicted * 1000, unit: 'mm', tone: Math.abs(predicted / deltaP - 1) < 0.01 ? 'good' : 'bad' },
            { label: '$\\delta/d$ (should be ≪ 1)', value: deltaP / d, tone: deltaP / d > 0.5 ? 'bad' : 'default' },
          ]}
        />
      }
      footer={
        <span>
          <b>Try this:</b> turn off “match E/(Dγ)” — the model is now made of the same metal, Π₄ is 1/λ times too large and the scaled-up
          prediction misses by the factor λ. Turn it back on: all four Π match and δ<sub>m</sub>/λ reproduces the prototype exactly.
          (Numbers come from a supplementary clamped-plate model with ν = 0.3; sag drawn exaggerated.)
        </span>
      }
    >
      <svg viewBox={`0 0 ${VW} ${VH}`} className="mx-auto h-auto w-full max-w-[560px]" role="img" aria-label="prototype can and scale-model can side by side">
        <Can x={40} y={base} w={wP} fill={Math.min(hE / (1.15 * D), 1)} sag={sagPx(r1p, wP)} tag="prototype" />
        <Can x={xM} y={base} w={wM} fill={Math.min(hE / (1.15 * D), 1)} sag={sagPx(r1m, wM)} labels={false} tag="model" />
      </svg>
      <p className="mt-1 text-xs text-ink-3">
        Model: D<sub>m</sub> = {(Dm * 100).toFixed(1)} cm, d<sub>m</sub> = {(lam * dmm).toFixed(2)} mm, E<sub>m</sub> = {(Em / 1e9).toFixed(0)} GPa, same paint (γ). Sag drawn exaggerated.
      </p>
    </SimPanel>
  )
}
