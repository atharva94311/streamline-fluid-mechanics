/**
 * Interactive: Bernoulli's equation along the centreline streamline of an inclined venturi-type duct
 * (steady, inviscid, incompressible water). Shows the energy grade line (EGL, total head H — flat, no losses),
 * the hydraulic grade line (HGL = EGL − V²/2g), and stacked head bars z + p/γ + V²/2g = H at a chosen station.
 */
import { useMemo, useState, type MouseEvent as RMouseEvent } from 'react'
import { Md, Readout, SimPanel, Slider, md, num, useElementSize } from '@/kit'
import { G, Label, P_ATM, P_VAP_20C, RHO_WATER, ticksFor } from './shared'

const LX = 6 // duct length (m, horizontal)
const D1 = 0.1 // inlet / outlet diameter (m)
const GAMMA = RHO_WATER * G
const sm = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t))

function diameter(x: number, D2: number) {
  if (x < 1.5) return D1
  if (x < 2.5) return D1 + (D2 - D1) * sm(x - 1.5)
  if (x < 3.5) return D2
  if (x < 4.5) return D2 + (D1 - D2) * sm(x - 3.5)
  return D1
}

export function BernoulliDuct() {
  const [Q, setQ] = useState(15) // L/s
  const [D2mm, setD2] = useState(60)
  const [dz, setDz] = useState(1)
  const [p1k, setP1] = useState(100) // kPa gauge
  const [xs, setXs] = useState(3)
  const [wrapRef, size] = useElementSize<HTMLDivElement>()

  const W = Math.max(280, size.width || 640)
  const wide = W >= 560
  const DW = wide ? W - 176 : W
  const DH = Math.round(num.clamp(0.56 * DW, 250, 330))
  const BW = wide ? 166 : W
  const BH = wide ? DH : 220

  const D2 = D2mm / 1000
  const q = Q / 1000
  const model = useMemo(() => {
    const area = (x: number) => (Math.PI * diameter(x, D2) ** 2) / 4
    const V = (x: number) => q / area(x)
    const hv = (x: number) => V(x) ** 2 / (2 * G)
    const z = (x: number) => (dz * x) / LX
    const H = (p1k * 1000) / GAMMA + hv(0) + z(0)
    const pg = (x: number) => GAMMA * (H - hv(x) - z(x)) // gauge pressure, Pa
    const grid = num.linspace(0, LX, 121)
    const hgl = grid.map((x) => H - hv(x))
    const zs = grid.map(z)
    const lowest = Math.min(...grid.map(pg))
    return { area, V, hv, z, H, pg, grid, hgl, zs, lowest }
  }, [D2, q, dz, p1k])

  const { V, hv, z, H, pg, grid, hgl, zs } = model
  const lo = Math.min(0, ...zs, ...hgl)
  const spanH = Math.max(H - lo, 0.5)
  const hMin = lo - 0.08 * spanH
  const hMax = H + 0.14 * spanH

  // diagram scales
  const mL = 46
  const mR = 14
  const mT = 18
  const mB = 26
  const X = (x: number) => mL + (x / LX) * (DW - mL - mR)
  const Y = (h: number, Hpx = DH) => mT + ((hMax - h) / (hMax - hMin)) * (Hpx - mT - mB)
  const halfPx = (x: number) => 3 + 11 * (diameter(x, D2) / D1)

  const pts = (f: (x: number, i: number) => number) => grid.map((x, i) => `${X(x).toFixed(1)},${Y(f(x, i)).toFixed(1)}`)
  const hglPts = pts((_x, i) => hgl[i])
  const zPts = pts((_x, i) => zs[i])
  const upper = grid.map((x, i) => `${X(x).toFixed(1)},${(Y(zs[i]) - halfPx(x)).toFixed(1)}`)
  const lower = grid.map((x, i) => `${X(x).toFixed(1)},${(Y(zs[i]) + halfPx(x)).toFixed(1)}`)
  const presPos = [...pts((_x, i) => Math.max(hgl[i], zs[i])), ...pts((_x, i) => zs[i]).reverse()].join(' ')
  const presNeg = [...pts((_x, i) => Math.min(hgl[i], zs[i])), ...pts((_x, i) => zs[i]).reverse()].join(' ')
  const velBand = [...pts(() => H), ...hglPts.slice().reverse()].join(' ')

  // station values
  const Vs = V(xs)
  const hvs = hv(xs)
  const zst = z(xs)
  const phs = H - hvs - zst
  const ps = pg(xs)
  const pAbs = ps + P_ATM
  const cav = pAbs < P_VAP_20C
  const lowestAbs = model.lowest + P_ATM
  const V1 = V(0)
  const ph1 = H - hv(0)

  const setStationFromClick = (e: RMouseEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - r.left - mL) / (DW - mL - mR)) * LX
    if (x >= 0 && x <= LX) setXs(Math.round(x * 20) / 20)
  }

  const ticks = ticksFor(hMin, hMax, 5)
  const Xs = X(xs)

  /* ---------- stacked bars ---------- */
  const barTop = 18
  const barBot = 46
  const YB = (h: number) => barTop + ((hMax - h) / (hMax - hMin)) * (BH - barTop - barBot)
  const bars: { name: string; parts: [number, number, number] }[] = [
    { name: 'inlet 1', parts: [0, ph1, hv(0)] },
    { name: `x = ${xs.toFixed(2)} m`, parts: [zst, phs, hvs] },
  ]
  const colors = ['var(--plot-7)', 'var(--plot-1)', 'var(--plot-3)']
  const names = ['z', 'p/γ', 'V²/2g']
  const bw = Math.min(38, (BW - 40) / 4)

  return (
    <SimPanel
      title="Heads along a streamline: EGL & HGL"
      subtitle="water, steady, inviscid — Bernoulli in head form"
      wide
      controls={
        <>
          <Slider label={md`flow rate $Q$`} value={Q} min={2} max={40} step={0.5} onChange={setQ} unit="L/s" digits={3} />
          <Slider label={md`throat diameter $D_2$ ($D_1$ = 100 mm)`} value={D2mm} min={40} max={100} step={1} onChange={setD2} unit="mm" digits={3} />
          <Slider label={md`outlet rise $\Delta z$`} value={dz} min={-3} max={3} step={0.1} onChange={setDz} unit="m" digits={2} />
          <Slider label={md`inlet gauge pressure $p_1$`} value={p1k} min={0} max={300} step={5} onChange={setP1} unit="kPa" digits={3} />
          <Slider label={md`station $x$ (or click the duct)`} value={xs} min={0} max={LX} step={0.05} onChange={setXs} unit="m" digits={3} />
        </>
      }
      readout={
        <Readout
          items={[
            { label: 'Speed at station', value: Vs, unit: 'm/s' },
            { label: 'Gauge pressure there', value: ps / 1000, unit: 'kPa', tone: cav ? 'bad' : 'default' },
            { label: 'Pressure head', value: phs, unit: 'm' },
            { label: 'Velocity head', value: hvs, unit: 'm' },
            { label: 'Elevation head', value: zst, unit: 'm' },
            { label: 'Total head (EGL)', value: H, unit: 'm', tone: 'accent' },
            { label: 'Inlet speed', value: V1, unit: 'm/s' },
            { label: 'Lowest absolute pressure', value: lowestAbs / 1000, unit: 'kPa', tone: lowestAbs < P_VAP_20C ? 'bad' : 'good' },
          ]}
        />
      }
      footer={
        <Md>{md`**Try this:** shrink $D_2$ from 100 mm to 50 mm — the throat speed quadruples ($V \propto 1/D^2$), so its velocity head grows 16-fold and the HGL dips, while the EGL stays perfectly flat. Then raise the outlet with $\Delta z$: the outlet's pressure head drops by exactly the rise, because elevation now takes that share of the fixed total head. Finally push $Q$ up until the lowest absolute pressure turns red — Bernoulli then predicts a pressure below the vapour pressure, and real water would cavitate.`}</Md>
      }
    >
      <div ref={wrapRef} className="w-full">
        <div className={wide ? 'flex items-start gap-2.5' : 'space-y-3'}>
          <svg width={DW} height={DH} className="block shrink-0 cursor-pointer select-none" role="img" aria-label="duct with energy and hydraulic grade lines" onClick={setStationFromClick}>
            <rect x={mL} y={mT} width={DW - mL - mR} height={DH - mT - mB} rx={6} fill="var(--field-bg)" stroke="var(--line)" />
            {ticks.map((t) => (
              <g key={t}>
                <line x1={mL} x2={DW - mR} y1={Y(t)} y2={Y(t)} stroke="var(--grid)" strokeWidth={0.8} />
                <text x={mL - 5} y={Y(t)} dy="0.32em" textAnchor="end" fontSize={10} fill="var(--ink-3)">
                  {String(+t.toPrecision(4)).replace('-', '−')}
                </text>
              </g>
            ))}
            <text x={12} y={(DH - mB + mT) / 2} fontSize={10.5} fill="var(--ink-3)" textAnchor="middle" transform={`rotate(-90 12 ${(DH - mB + mT) / 2})`}>
              head above datum (m)
            </text>
            <line x1={mL} x2={DW - mR} y1={Y(0)} y2={Y(0)} stroke="var(--ink-3)" strokeDasharray="7 4" />
            <Label x={mL + 4} y={Y(0) + 12} size={10} color="var(--ink-3)">datum z = 0</Label>
            {/* head bands */}
            <polygon points={velBand} fill="var(--plot-3)" opacity={0.2} />
            <polygon points={presPos} fill="var(--plot-1)" opacity={0.12} />
            <polygon points={presNeg} fill="var(--plot-4)" opacity={0.22} />
            {/* duct */}
            <polygon points={[...upper, ...lower.slice().reverse()].join(' ')} fill="var(--streamline)" opacity={0.16} />
            <polyline points={upper.join(' ')} fill="none" stroke="var(--ink-2)" strokeWidth={1.8} />
            <polyline points={lower.join(' ')} fill="none" stroke="var(--ink-2)" strokeWidth={1.8} />
            <polyline points={zPts.join(' ')} fill="none" stroke="var(--ink-3)" strokeDasharray="8 3 2 3" strokeWidth={1} />
            {/* grade lines */}
            <line x1={X(0)} x2={X(LX)} y1={Y(H)} y2={Y(H)} stroke="var(--plot-4)" strokeWidth={2.2} strokeDasharray="9 5" />
            <polyline points={hglPts.join(' ')} fill="none" stroke="var(--plot-1)" strokeWidth={2.2} />
            <Label x={DW - mR - 4} y={Y(H) - 6} anchor="end" size={11} weight={700} color="var(--plot-4)">EGL (H)</Label>
            <Label x={DW - mR - 4} y={Y(hgl[hgl.length - 1]) + 14} anchor="end" size={11} weight={700} color="var(--plot-1)">HGL</Label>
            {/* station instruments: piezometer to HGL, Pitot to EGL */}
            <line x1={Xs} x2={Xs} y1={mT} y2={DH - mB} stroke="var(--ink-3)" strokeWidth={0.8} strokeDasharray="2 3" />
            <rect x={Xs - 9} y={Math.min(Y(H - hvs), Y(zst))} width={6} height={Math.abs(Y(zst) - Y(H - hvs))} fill="var(--plot-1)" opacity={0.6} />
            <rect x={Xs + 3} y={Y(H)} width={6} height={Math.max(0, Y(zst) - Y(H))} fill="var(--plot-4)" opacity={0.45} />
            <circle cx={Xs} cy={Y(zst)} r={4.5} fill="var(--surface)" stroke="var(--ink)" strokeWidth={1.8} />
            <Label x={Xs} y={DH - 8} anchor="middle" size={10.5} weight={600}>{`x = ${xs.toFixed(2)} m`}</Label>
            <Label x={X(0) + 3} y={Y(zs[0]) + halfPx(0) + 13} size={10.5} weight={700}>1</Label>
          </svg>

          <svg width={BW} height={BH} className="block shrink-0" role="img" aria-label="stacked head bars at the inlet and at the station">
            <line x1={14} x2={BW - 6} y1={YB(0)} y2={YB(0)} stroke="var(--ink-3)" strokeDasharray="5 4" />
            <line x1={14} x2={BW - 6} y1={YB(H)} y2={YB(H)} stroke="var(--plot-4)" strokeWidth={1.8} strokeDasharray="8 4" />
            <Label x={BW - 8} y={YB(H) - 5} anchor="end" size={10.5} weight={700} color="var(--plot-4)">{`H = ${num.fmt(H, 3)} m`}</Label>
            {bars.map((b, k) => {
              const cx = 24 + (k + 0.5) * ((BW - 30) / 2)
              let acc = 0
              return (
                <g key={k}>
                  {b.parts.map((h, j) => {
                    const y0 = YB(acc)
                    acc += h
                    const y1 = YB(acc)
                    const top = Math.min(y0, y1)
                    const hgt = Math.abs(y1 - y0)
                    return (
                      <g key={j}>
                        <rect x={cx - bw / 2} y={top} width={bw} height={Math.max(0.5, hgt)} fill={colors[j]} opacity={h < 0 ? 0.35 : 0.8} stroke={h < 0 ? 'var(--plot-4)' : 'none'} strokeDasharray={h < 0 ? '3 2' : undefined} />
                        {hgt > 15 ? (
                          <Label x={cx} y={top + hgt / 2 + 4} anchor="middle" size={10} weight={600}>
                            {num.fmt(h, 2)}
                          </Label>
                        ) : null}
                      </g>
                    )
                  })}
                  <Label x={cx} y={BH - 28} anchor="middle" size={10.5} weight={600}>{b.name}</Label>
                </g>
              )
            })}
            {names.map((n, j) => (
              <g key={n} transform={`translate(${10 + j * ((BW - 14) / 3)}, ${BH - 4})`}>
                <rect x={0} y={-8} width={9} height={8} fill={colors[j]} opacity={0.8} />
                <text x={12} y={-0.5} fontSize={9.5} fill="var(--ink-2)">{n}</text>
              </g>
            ))}
          </svg>
        </div>
        {cav ? (
          <div className="mt-3 rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-ink-2 dark:border-red-500/30 dark:bg-red-500/10">
            <Md>{md`At this station Bernoulli predicts an absolute pressure of ${num.fmt(pAbs / 1000, 3)} kPa — below the vapour pressure of water (about 2.3 kPa at 20 °C)${pAbs < 0 ? ', and even below absolute zero pressure, which is impossible' : ''}. Real water would **cavitate** here, so the ideal-flow prediction no longer describes the flow.`}</Md>
          </div>
        ) : null}
        <div className="mt-2 text-xs text-ink-3">
          Bands: amber = velocity head V²/2g (between HGL and EGL), indigo = pressure head p/γ (between centreline and HGL), red = negative gauge pressure. The station's two columns are a piezometer (to the HGL) and a Pitot tube (to the EGL). Duct thickness exaggerated.
        </div>
      </div>
    </SimPanel>
  )
}
