import { useState } from 'react'
import { Plot, Readout, Segmented, SimPanel, Slider, md, num } from '@/kit'
import { Arrow, COL, SubText } from './svg'

type Pt = [number, number]
const poly = (...pts: Pt[]) => pts.map((p) => p.join(',')).join(' ')

/**
 * Recreation of the Lecture 10 slide 5 sketch: z up, y to the right, x towards the viewer (down-left).
 * Pressure arrows push INTO the +x, +y and +z faces, labelled p = −σ.
 */
export function PressureCubeFigure() {
  const FTL: Pt = [140, 120]
  const FTR: Pt = [250, 120]
  const FBR: Pt = [250, 230]
  const FBL: Pt = [140, 230]
  const BTL: Pt = [200, 72]
  const BTR: Pt = [310, 72]
  const BBR: Pt = [310, 182]
  const BBL: Pt = [200, 182]
  const edge = (a: Pt, b: Pt, dashed = false) => (
    <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="var(--ink-2)" strokeWidth={dashed ? 1.1 : 1.7} strokeDasharray={dashed ? '5 4' : undefined} />
  )
  return (
    <svg viewBox="0 0 480 290" className="mx-auto block h-auto w-full max-w-[560px]" role="img" aria-label="Cube compressed by pressure on three faces">
      <polygon points={poly(FTL, FTR, BTR, BTL)} fill="var(--surface-2)" />
      <polygon points={poly(FTR, BTR, BBR, FBR)} fill="var(--line)" opacity={0.6} />
      <polygon points={poly(FTL, FTR, FBR, FBL)} fill="var(--surface-2)" opacity={0.45} />
      <g>
        {edge(BBL, BTL, true)}
        {edge(BBL, BBR, true)}
        {edge(BBL, FBL, true)}
        {edge(FTL, FTR)}
        {edge(FTR, FBR)}
        {edge(FBR, FBL)}
        {edge(FBL, FTL)}
        {edge(FTL, BTL)}
        {edge(BTL, BTR)}
        {edge(BTR, FTR)}
        {edge(BTR, BBR)}
        {edge(BBR, FBR)}
      </g>
      {/* pressure arrows (compression: they push into the faces) */}
      <Arrow x1={225} y1={8} x2={225} y2={92} color={COL.net} width={5} head={15} />
      <Arrow x1={372} y1={151} x2={288} y2={151} color={COL.net} width={5} head={15} />
      <Arrow x1={92} y1={258} x2={186} y2={183} color={COL.net} width={5} head={15} />
      <SubText x={238} y={40} text="p = −σ_zz" size={15} italic weight={600} />
      <SubText x={318} y={180} text="p = −σ_yy" size={15} italic weight={600} />
      <SubText x={14} y={218} text="p = −σ_xx" size={15} italic weight={600} />
      <SubText x={312} y={26} text="−p = σ_xx = σ_yy = σ_zz" size={14} italic weight={700} fill={COL.net} />
      {/* axis triad */}
      <g>
        <line x1={420} y1={262} x2={420} y2={214} stroke="var(--ink-3)" strokeWidth={1.4} />
        <line x1={420} y1={262} x2={468} y2={262} stroke="var(--ink-3)" strokeWidth={1.4} />
        <line x1={420} y1={262} x2={394} y2={284} stroke="var(--ink-3)" strokeWidth={1.4} />
        <text x={426} y={216} fontSize={13} fontStyle="italic" fill="var(--ink-2)">z</text>
        <text x={466} y={254} fontSize={13} fontStyle="italic" fill="var(--ink-2)">y</text>
        <text x={384} y={284} fontSize={13} fontStyle="italic" fill="var(--ink-2)">x</text>
      </g>
    </svg>
  )
}

/** 2-D stress on a plane whose unit normal makes angle θ with the x-axis (standard plane-stress transformation). */
export function planeStress(sxx: number, syy: number, txy: number, thetaDeg: number) {
  const t = (thetaDeg * Math.PI) / 180
  const c = Math.cos(t)
  const s = Math.sin(t)
  const sn = sxx * c * c + syy * s * s + 2 * txy * s * c
  const tn = (syy - sxx) * s * c + txy * (c * c - s * s)
  return { sn, tn }
}

const PRESETS = {
  inviscid: { sxx: -2000, syy: -2000, txy: 0 },
  viscous: { sxx: -2400, syy: -1600, txy: 500 },
}
type PresetKey = keyof typeof PRESETS | 'custom'

/** Interactive check of Pascal's law: rotate a cutting plane through a point and watch σ_n and τ_n. */
export function PascalPlaneDemo() {
  const [st, setSt] = useState(PRESETS.inviscid)
  const [preset, setPreset] = useState<PresetKey>('inviscid')
  const [theta, setTheta] = useState(30)
  const { sn, tn } = planeStress(st.sxx, st.syy, st.txy, theta)
  const tauMax = Math.hypot((st.sxx - st.syy) / 2, st.txy)
  const mean = (st.sxx + st.syy) / 2
  const iso = tauMax < 1

  const set = (k: 'sxx' | 'syy' | 'txy') => (v: number) => {
    setSt((o) => ({ ...o, [k]: v }))
    setPreset('custom')
  }

  // element sketch
  const C: Pt = [150, 130]
  const H = 62
  const k = 0.022 // px per Pa
  const t = (theta * Math.PI) / 180
  const n: Pt = [Math.cos(t), -Math.sin(t)] // screen coordinates (y down)
  const sv: Pt = [-Math.sin(t), -Math.cos(t)]
  const normalArrow = (() => {
    const L = Math.min(85, Math.abs(sn) * k)
    const far: Pt = [C[0] + n[0] * L, C[1] + n[1] * L]
    return sn < 0 ? { x1: far[0], y1: far[1], x2: C[0], y2: C[1] } : { x1: C[0], y1: C[1], x2: far[0], y2: far[1] }
  })()
  const base: Pt = [C[0] + n[0] * 7, C[1] + n[1] * 7]
  const Ls = Math.min(85, Math.abs(tn) * k) * Math.sign(tn)
  // face arrows for σ_xx, σ_yy (push if compressive) and τ_xy
  const faceN = (cx: number, cy: number, dir: Pt, sig: number) => {
    const L = Math.min(60, Math.abs(sig) * k)
    if (L < 1) return null
    const far: Pt = [cx + dir[0] * L, cy + dir[1] * L]
    return sig < 0 ? (
      <Arrow x1={far[0]} y1={far[1]} x2={cx} y2={cy} color={COL.normal} width={2.2} head={8} />
    ) : (
      <Arrow x1={cx} y1={cy} x2={far[0]} y2={far[1]} color={COL.normal} width={2.2} head={8} />
    )
  }
  const Lt = Math.min(50, Math.abs(st.txy) * k * 1.6) * Math.sign(st.txy)

  return (
    <SimPanel
      title="Pascal's law: rotate the cutting plane"
      subtitle="stress acting on a plane through one point (2-D)"
      controls={
        <>
          <Segmented
            label="State of stress"
            value={preset}
            onChange={(p) => {
              setPreset(p)
              if (p !== 'custom') setSt(PRESETS[p])
            }}
            options={[
              { value: 'inviscid', label: 'no shear (inviscid / rest)' },
              { value: 'viscous', label: 'with shear (viscous)' },
              { value: 'custom', label: 'custom' },
            ]}
          />
          <Slider label="plane normal angle $\theta$" value={theta} min={0} max={180} step={1} onChange={setTheta} unit="°" />
          <Slider label="$\sigma_{xx}$" value={st.sxx} min={-3000} max={1000} step={50} onChange={set('sxx')} unit="Pa" digits={4} />
          <Slider label="$\sigma_{yy}$" value={st.syy} min={-3000} max={1000} step={50} onChange={set('syy')} unit="Pa" digits={4} />
          <Slider label="$\tau_{xy} = \tau_{yx}$" value={st.txy} min={-1200} max={1200} step={25} onChange={set('txy')} unit="Pa" digits={4} />
        </>
      }
      readout={
        <div className="space-y-2">
          <Readout
            items={[
              { label: 'normal stress on plane', value: sn, unit: 'Pa' },
              { label: 'shear stress on plane', value: tn, unit: 'Pa' },
              { label: 'largest shear, any plane', value: tauMax, unit: 'Pa', tone: iso ? 'good' : 'bad' },
              { label: 'mean normal stress', value: mean, unit: 'Pa' },
            ]}
          />
          <div
            className={
              iso
                ? 'rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-ink dark:border-emerald-500/30 dark:bg-emerald-500/10'
                : 'rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-ink dark:border-amber-500/30 dark:bg-amber-500/10'
            }
          >
            {iso
              ? `Same normal stress on every plane, no shear: a single pressure p = −σ = ${num.fmt(-mean, 4)} Pa describes the point.`
              : 'The normal stress depends on the orientation of the plane and shear appears — no single, direction-independent pressure.'}
          </div>
        </div>
      }
      footer={
        <span>
          <b>Try this:</b> with “no shear” selected, sweep θ from 0° to 180° — the normal stress never changes and the shear stays zero, which is
          Pascal's law. Switch to “with shear” and sweep again: the normal stress now varies with direction. Then set σ<sub>xx</sub> = σ<sub>yy</sub>
          and τ<sub>xy</sub> = 0 by hand and watch the curves go flat.
        </span>
      }
    >
      <div className="grid items-center gap-3 sm:grid-cols-[minmax(0,240px)_1fr]">
        <svg viewBox="0 0 300 260" className="mx-auto block h-auto w-full max-w-[300px]" role="img" aria-label="Element cut by a plane">
          <rect x={C[0] - H} y={C[1] - H} width={2 * H} height={2 * H} fill="var(--surface-2)" stroke="var(--ink-2)" strokeWidth={1.5} rx={2} />
          {faceN(C[0] + H, C[1], [1, 0], st.sxx)}
          {faceN(C[0] - H, C[1], [-1, 0], st.sxx)}
          {faceN(C[0], C[1] - H, [0, -1], st.syy)}
          {faceN(C[0], C[1] + H, [0, 1], st.syy)}
          {Math.abs(Lt) > 1 ? (
            <g>
              <Arrow x1={C[0] + H + 7} y1={C[1] + Lt / 2 + 22} x2={C[0] + H + 7} y2={C[1] - Lt / 2 + 22} color={COL.shearY} width={2} head={7} />
              <Arrow x1={C[0] - H - 7} y1={C[1] - Lt / 2 - 22} x2={C[0] - H - 7} y2={C[1] + Lt / 2 - 22} color={COL.shearY} width={2} head={7} />
              <Arrow x1={C[0] - Lt / 2 + 22} y1={C[1] - H - 7} x2={C[0] + Lt / 2 + 22} y2={C[1] - H - 7} color={COL.shearY} width={2} head={7} />
              <Arrow x1={C[0] + Lt / 2 - 22} y1={C[1] + H + 7} x2={C[0] - Lt / 2 - 22} y2={C[1] + H + 7} color={COL.shearY} width={2} head={7} />
            </g>
          ) : null}
          {/* cutting plane */}
          <line
            x1={C[0] - sv[0] * 95}
            y1={C[1] - sv[1] * 95}
            x2={C[0] + sv[0] * 95}
            y2={C[1] + sv[1] * 95}
            stroke="var(--ink)"
            strokeWidth={2}
            strokeDasharray="7 4"
          />
          <Arrow x1={C[0]} y1={C[1]} x2={C[0] + n[0] * 40} y2={C[1] + n[1] * 40} color="var(--ink-3)" width={1.3} head={7} />
          <text x={C[0] + n[0] * 48} y={C[1] + n[1] * 48} dy="0.35em" textAnchor="middle" fontSize={12} fontStyle="italic" fill="var(--ink-3)">
            n
          </text>
          <Arrow {...normalArrow} color={COL.net} width={3.2} head={11} />
          {Math.abs(Ls) > 1 ? (
            <Arrow x1={base[0]} y1={base[1]} x2={base[0] + sv[0] * Ls} y2={base[1] + sv[1] * Ls} color={COL.body} width={3.2} head={11} />
          ) : null}
          <circle cx={C[0]} cy={C[1]} r={3} fill="var(--ink)" />
          <g fontSize={11} fill="var(--ink-2)">
            <rect x={8} y={8} width={12} height={4} fill={COL.net} />
            <SubText x={24} y={14} text="σ_n on the plane" size={11} fill="var(--ink-2)" />
            <rect x={8} y={24} width={12} height={4} fill={COL.body} />
            <SubText x={24} y={30} text="τ_n on the plane" size={11} fill="var(--ink-2)" />
          </g>
        </svg>
        <Plot
          height={240}
          x={{ label: md`plane-normal angle $\theta$ (degrees)`, domain: [0, 180] }}
          y={{ label: 'stress on the plane (kPa)', domain: plotDomain(st) }}
          hlines={[{ y: 0, color: 'var(--axis)', dash: '2 3' }]}
          vlines={[{ x: theta, color: 'var(--ink-3)' }]}
          series={[
            { label: md`normal $\sigma_n$`, fn: (th) => planeStress(st.sxx, st.syy, st.txy, th).sn / 1000, color: COL.net },
            { label: md`shear $\tau_n$`, fn: (th) => planeStress(st.sxx, st.syy, st.txy, th).tn / 1000, color: COL.body },
          ]}
          marks={[
            { x: theta, y: sn / 1000, color: COL.net },
            { x: theta, y: tn / 1000, color: COL.body },
          ]}
        />
      </div>
    </SimPanel>
  )
}

function plotDomain(st: { sxx: number; syy: number; txy: number }): [number, number] {
  const r = Math.hypot((st.sxx - st.syy) / 2, st.txy)
  const m = (st.sxx + st.syy) / 2
  const lo = Math.min(m - r, -r, 0) / 1000
  const hi = Math.max(m + r, r, 0) / 1000
  return [lo - 0.4, hi + 0.4]
}
