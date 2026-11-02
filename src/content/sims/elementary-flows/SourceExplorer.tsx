import { useMemo, useState } from 'react'
import { FlowField, Plot, Segmented, SimPanel, Slider, Toggle, md, type Vec } from '@/kit'
import { TeXReadout } from './ui'
import { Arrow, rad } from './svg'

const TWO_PI = 2 * Math.PI

/** Polar angle in [0, 2π), measured counter-clockwise from +x (the branch cut lies on the +x axis). */
const theta0 = (x: number, y: number) => {
  const t = Math.atan2(y, x)
  return t < 0 ? t + TWO_PI : t
}

export interface StrengthProps {
  /** |m| in m²/s */
  mAbs: number
  sink: boolean
  onMAbs: (v: number) => void
  onSink: (v: boolean) => void
}

/** Source/sink sign switch + strength slider (shared by the two source panels). */
export function StrengthControls({ mAbs, sink, onMAbs, onSink }: StrengthProps) {
  return (
    <>
      <Segmented
        label="type"
        options={[
          { value: 'source', label: 'Source ($m>0$)' },
          { value: 'sink', label: 'Sink ($m<0$)' },
        ]}
        value={sink ? 'sink' : 'source'}
        onChange={(v) => onSink(v === 'sink')}
      />
      <Slider label="strength $\lvert m\rvert$" value={mAbs} min={0.5} max={10} step={0.1} onChange={onMAbs} unit="m²/s" digits={2} />
    </>
  )
}

/**
 * Flow net of a line source/sink (rays ψ = const, circles φ = const, equal increments → curvilinear squares)
 * with a wedge between two rays whose discharge is q = ψ₂ − ψ₁ = (m/2π)(θ₂ − θ₁).
 */
export function SourceExplorer(props: StrengthProps) {
  const { mAbs, sink } = props
  const [th1, setTh1] = useState(20)
  const [dth, setDth] = useState(60)
  const [showPhi, setShowPhi] = useState(true)
  const m = sink ? -mAbs : mAbs
  const k = m / TWO_PI

  const field = useMemo(
    () => ({
      psi: (x: number, y: number) => k * theta0(x, y),
      phi: (x: number, y: number) => 0.5 * k * Math.log(x * x + y * y),
      vel: (x: number, y: number): Vec => {
        const r2 = x * x + y * y
        return r2 < 1e-9 ? [0, 0] : [(k * x) / r2, (k * y) / r2]
      },
      // 16 rays half-way between the axes' directions, so no drawn ray sits on the branch cut θ = 0
      psiLevels: Array.from({ length: 16 }, (_, i) => ((i + 0.5) * m) / 16),
      // circles r = e^{jπ/8}: equal Δφ = Δψ = m/16 → the flow net is made of curvilinear squares
      phiLevels: Array.from({ length: 9 }, (_, j) => ((j - 5) * m) / 16),
    }),
    [k, m],
  )

  const t1 = rad(th1)
  const t2 = rad(th1 + dth)
  const psi1 = k * t1
  const psi2 = k * t2
  const q = psi2 - psi1

  return (
    <SimPanel
      title="Source / sink flow net — flow between two rays"
      subtitle={md`$\phi = \tfrac{m}{2\pi}\ln r$, $\psi = \tfrac{m}{2\pi}\theta$`}
      src={{ doc: 'lec12', pages: '10' }}
      controls={
        <>
          <StrengthControls {...props} />
          <Slider label="first ray $\theta_1$" value={th1} min={0} max={359} step={1} onChange={setTh1} unit="°" format={(v) => v.toFixed(0)} />
          <Slider label="wedge angle $\Delta\theta = \theta_2-\theta_1$" value={dth} min={0} max={360} step={1} onChange={setDth} unit="°" format={(v) => v.toFixed(0)} />
          <Toggle label="show equipotentials ($\phi$ = const)" checked={showPhi} onChange={setShowPhi} />
        </>
      }
      readout={
        <TeXReadout
          items={[
            { label: md`$m$`, value: m, unit: 'm²/s' },
            { label: md`$\Delta\theta$`, value: `${(t2 - t1).toFixed(3)} rad` },
            { label: md`$\psi_1 = \tfrac{m}{2\pi}\theta_1$`, value: psi1, unit: 'm²/s' },
            { label: md`$\psi_2 = \tfrac{m}{2\pi}\theta_2$`, value: psi2, unit: 'm²/s' },
            { label: md`$q = \psi_2 - \psi_1$`, value: q, unit: 'm²/s', tone: 'accent' },
            { label: md`share of $m$`, value: `${((100 * dth) / 360).toFixed(1)} %` },
          ]}
        />
      }
      footer={
        <>
          <b>Try this:</b> set Δθ = 90° — exactly a quarter of m passes through the wedge at <i>every</i> radius, because no fluid
          crosses a ray. Switch to <i>Sink</i>: q turns negative (the flow crosses the arc inward) while the pattern of lines is
          unchanged. Hover to probe v<sub>r</sub>: halve the distance and the speed doubles.
        </>
      }
    >
      <FlowField
        x={[-3, 3]}
        y={[-3, 3]}
        psi={field.psi}
        phi={field.phi}
        vel={field.vel}
        psiLevels={field.psiLevels}
        phiLevels={field.phiLevels}
        equipotentials={showPhi}
        particles={140}
        markers={[{ x: 0, y: 0, kind: sink ? 'sink' : 'source' }]}
        overlay={({ sx, sy }) => {
          const cx = sx(0)
          const cy = sy(0)
          const px = sx(1) - sx(0)
          const Rw = 2.55 * px
          const P = (r: number, t: number) => ({ x: cx + r * px * Math.cos(t), y: cy - r * px * Math.sin(t) })
          const full = dth >= 359.5
          const e0 = P(2.55, t1)
          const e1 = P(2.55, t2)
          const wedge = full
            ? ''
            : `M${cx} ${cy}L${e0.x.toFixed(2)} ${e0.y.toFixed(2)}A${Rw} ${Rw} 0 ${dth > 180 ? 1 : 0} 0 ${e1.x.toFixed(2)} ${e1.y.toFixed(2)}Z`
          const mid = (t1 + t2) / 2
          const ra = P(sink ? 1.45 : 0.85, mid)
          const rb = P(sink ? 0.85 : 1.45, mid)
          const lab = P(1.85, mid)
          const r1 = P(2.95, t1)
          const r2 = P(2.95, t2)
          // keep text inside the plotting square (matters on narrow phones)
          const clampX = (x: number, half: number) => Math.min(Math.max(x, sx(-3) + half + 2), sx(3) - half - 2)
          const clampY = (y: number) => Math.min(Math.max(y, sy(3) + 14), sy(-3) - 6)
          const l1 = P(2.45, t1 - 0.12)
          const l2 = P(2.45, t2 + 0.12)
          return (
            <g>
              {dth > 0 ? (
                full ? (
                  <circle cx={cx} cy={cy} r={Rw} fill="var(--plot-5)" fillOpacity={0.14} />
                ) : (
                  <path d={wedge} fill="var(--plot-5)" fillOpacity={0.16} />
                )
              ) : null}
              <line x1={cx} y1={cy} x2={r1.x} y2={r1.y} stroke="var(--plot-5)" strokeWidth={2.6} strokeLinecap="round" />
              <line x1={cx} y1={cy} x2={r2.x} y2={r2.y} stroke="var(--plot-5)" strokeWidth={2.6} strokeLinecap="round" strokeDasharray={full ? '6 4' : undefined} />
              <text x={clampX(l1.x, 10)} y={clampY(l1.y + 4)} textAnchor="middle" fontSize={13} fontWeight={700} fill="var(--plot-5)" paintOrder="stroke" stroke="var(--surface)" strokeWidth={3}>
                ψ₁
              </text>
              <text x={clampX(l2.x, 10)} y={clampY(l2.y + 4)} textAnchor="middle" fontSize={13} fontWeight={700} fill="var(--plot-5)" paintOrder="stroke" stroke="var(--surface)" strokeWidth={3}>
                ψ₂
              </text>
              {dth > 4 ? <Arrow x1={ra.x} y1={ra.y} x2={rb.x} y2={rb.y} color="var(--plot-5)" width={2.4} head={9} /> : null}
              {dth > 0 ? (
                <text x={clampX(lab.x, 48)} y={clampY(lab.y + 4)} textAnchor="middle" fontSize={12} fontWeight={600} fill="var(--ink)" paintOrder="stroke" stroke="var(--surface)" strokeWidth={3}>
                  {`q = ${q.toFixed(2)} m²/s`}
                </text>
              ) : null}
            </g>
          )
        }}
      />
    </SimPanel>
  )
}

/**
 * Speed and pressure along a ray of a line source/sink: v_r(r) = m/2πr and, from Bernoulli between any two points,
 * p − p∞ = −ρm²/(8π²r²). Two probe radii give the "Bernoulli between two radii" exam calculation.
 */
export function RadialProfile(props: StrengthProps) {
  const { mAbs, sink } = props
  const [r1, setR1] = useState(0.4)
  const [r2, setR2] = useState(1.2)
  const [fluid, setFluid] = useState<'water' | 'air'>('water')
  const rho = fluid === 'water' ? 1000 : 1.2
  const m = sink ? -mAbs : mAbs
  const vr = (r: number) => m / (TWO_PI * r)
  const gauge = (r: number) => (-rho * m * m) / (8 * Math.PI * Math.PI * r * r) // p − p∞ in Pa
  const kPa = fluid === 'water'
  const pScale = kPa ? 1000 : 1
  const pUnit = kPa ? 'kPa' : 'Pa'
  const v1 = vr(r1)
  const v2 = vr(r2)
  const dp21 = 0.5 * rho * (v1 * v1 - v2 * v2)

  return (
    <SimPanel
      title="Speed and pressure along a ray — Bernoulli between two radii"
      subtitle={md`$v_r = \dfrac{m}{2\pi r}$, $\;p_1 + \tfrac12\rho v_1^2 = p_2 + \tfrac12\rho v_2^2$`}
      controls={
        <>
          <StrengthControls {...props} />
          <Slider label="radius $r_1$" value={r1} min={0.15} max={3} step={0.01} onChange={setR1} unit="m" digits={2} />
          <Slider label="radius $r_2$" value={r2} min={0.15} max={3} step={0.01} onChange={setR2} unit="m" digits={2} />
          <Segmented
            label="fluid"
            options={[
              { value: 'water', label: md`water, $\rho = 1000$` },
              { value: 'air', label: md`air, $\rho = 1.2$` },
            ]}
            value={fluid}
            onChange={setFluid}
          />
        </>
      }
      readout={
        <TeXReadout
          items={[
            { label: md`$v_r(r_1)$`, value: v1, unit: 'm/s' },
            { label: md`$v_r(r_2)$`, value: v2, unit: 'm/s' },
            { label: md`$2\pi r_1 v_r(r_1)$`, value: TWO_PI * r1 * v1, unit: 'm²/s' },
            { label: md`$2\pi r_2 v_r(r_2)$`, value: TWO_PI * r2 * v2, unit: 'm²/s' },
            { label: md`$p_2 - p_1$`, value: dp21, unit: 'Pa', tone: 'accent' },
            { label: md`$p_1 - p_\infty$`, value: gauge(r1) / pScale, unit: pUnit },
          ]}
        />
      }
      footer={
        <>
          <b>Try this:</b> flip <i>Source</i> ↔ <i>Sink</i> — v<sub>r</sub> changes sign but the pressure curve does not move,
          because Bernoulli only sees v<sub>r</sub>². Double |m| and the pressure dip at a fixed radius grows four-fold. Note that
          2πr·v<sub>r</sub> stays equal to m at every radius: that is continuity.
        </>
      }
    >
      <div className="space-y-4">
        <Plot
          height={230}
          x={{ label: '$r$ (m)', domain: [0.1, 3] }}
          y={{ label: '$v_r$ (m/s)', domain: sink ? [-12, 0] : [0, 12] }}
          series={[{ label: md`$v_r = m/2\pi r$`, fn: vr, color: 'var(--plot-1)' }]}
          bands={[{ x0: 0.1, x1: 0.15 }]}
          vlines={[
            { x: r1, label: 'r₁', color: 'var(--plot-3)' },
            { x: r2, label: 'r₂', color: 'var(--plot-6)' },
          ]}
          marks={[
            { x: r1, y: v1, color: 'var(--plot-3)' },
            { x: r2, y: v2, color: 'var(--plot-6)' },
          ]}
        />
        <Plot
          height={230}
          x={{ label: '$r$ (m)', domain: [0.1, 3] }}
          y={{ label: md`$p - p_\infty$ (${pUnit})`, domain: kPa ? [-10, 0] : [-12, 0] }}
          series={[{ label: md`$p - p_\infty = -\rho m^2/8\pi^2 r^2$`, fn: (r) => gauge(r) / pScale, color: 'var(--plot-4)' }]}
          bands={[{ x0: 0.1, x1: 0.15 }]}
          vlines={[
            { x: r1, label: 'r₁', color: 'var(--plot-3)' },
            { x: r2, label: 'r₂', color: 'var(--plot-6)' },
          ]}
          marks={[
            { x: r1, y: gauge(r1) / pScale, color: 'var(--plot-3)' },
            { x: r2, y: gauge(r2) / pScale, color: 'var(--plot-6)' },
          ]}
        />
      </div>
    </SimPanel>
  )
}
